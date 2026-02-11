import {
    Controller,
    Post,
    Body,
    Sse,
    MessageEvent,
    Req,
    Headers
} from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { Request } from 'express';
import { JsonRpcService, JsonRpcErrorCode } from './json-rpc.service';
import { SseManagerService } from './sse-manager.service';
import { McpToolRegistryService } from './mcp-tool-registry.service';

@Controller()
export class McpSseController {
    constructor(
        private readonly jsonRpc: JsonRpcService,
        private readonly sseManager: SseManagerService,
        private readonly toolRegistry: McpToolRegistryService
    ) { }

    /**
     * SSE endpoint - Server streams messages to client
     */
    @Sse('sse')
    handleSseConnection(@Req() request: Request): Observable<MessageEvent> {
        // Generate unique client ID
        const clientId =
            request.query['clientId']?.toString() ||
            `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        console.log(`[MCP SSE] New connection request from ${clientId}`);

        // Create a Subject for this client
        const subject = new Subject<MessageEvent>();

        // Register the connection
        this.sseManager.addConnection(clientId, subject);

        // Send endpoint event immediately (Standard MCP SSE Transport)
        // This tells the client where to send POST requests
        setTimeout(() => {
            const endpointUrl = `http://localhost:3000/api/message?clientId=${clientId}`;
            console.log(`[MCP SSE] Sending endpoint event: ${endpointUrl}`);

            subject.next({
                type: 'endpoint',
                data: endpointUrl
            } as MessageEvent);
        }, 100);

        // Handle client disconnect
        request.on('close', () => {
            console.log(`[MCP SSE] Client disconnected: ${clientId}`);
            this.sseManager.removeConnection(clientId);
        });

        return subject.asObservable();
    }

    /**
     * Message endpoint - Client sends JSON-RPC messages via POST
     */
    @Post('message')
    async handleMessage(
        @Body() body: any,
        @Req() request: Request
    ) {
        const clientId = request.query['clientId']?.toString();
        console.log(`[MCP] Received message from ${clientId}:`, JSON.stringify(body, null, 2));

        // Validate JSON-RPC format
        const validation = this.jsonRpc.validateRequest(body);
        if (!validation.valid) {
            const errorResponse = this.jsonRpc.createError(
                body.id ?? null,
                JsonRpcErrorCode.INVALID_REQUEST,
                validation.error || 'Invalid request'
            );
            return errorResponse;
        }

        const { id, method, params } = body;

        try {
            let result: any;

            // Route to appropriate handler based on method
            switch (method) {
                case 'initialize':
                    result = await this.handleInitialize(params);
                    break;

                case 'tools/list':
                    result = await this.handleToolsList();
                    break;

                case 'tools/call':
                    result = await this.handleToolsCall(params);
                    break;

                default:
                    return this.jsonRpc.createError(
                        id,
                        JsonRpcErrorCode.METHOD_NOT_FOUND,
                        `Method not found: ${method}`
                    );
            }

            // Create success response
            const response = this.jsonRpc.createResponse(id, result);

            // If client ID provided, also send via SSE
            if (clientId && this.sseManager.isConnected(clientId)) {
                // Send raw response object, NestJS handles SSE framing
                this.sseManager.sendMessage(clientId, { data: response });
            }

            return response;
        } catch (error) {
            console.error('[MCP] Error handling message:', error);
            const err = error as Error;
            return this.jsonRpc.createError(
                id,
                JsonRpcErrorCode.INTERNAL_ERROR,
                err.message || 'Internal error',
                { stack: err.stack }
            );
        }
    }

    /**
     * Handle MCP initialize method
     */
    private async handleInitialize(params: any) {
        console.log('[MCP] Initialize request:', params);

        return {
            protocolVersion: '2024-11-05',
            capabilities: {
                tools: {}
            },
            serverInfo: {
                name: 'nestjs-mcp-server',
                version: '1.0.0'
            }
        };
    }

    /**
     * Handle tools/list method
     */
    private async handleToolsList() {
        console.log('[MCP] Tools list request');

        const tools = this.toolRegistry.getAllTools();

        return {
            tools: tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema
            }))
        };
    }

    /**
     * Handle tools/call method
     */
    private async handleToolsCall(params: any) {
        const { name, arguments: args } = params;

        console.log(`[MCP] Tool call: ${name}`, args);

        if (!name) {
            throw new Error('Tool name is required');
        }

        try {
            const result = await this.toolRegistry.executeTool(name, args || {});

            // Format result according to MCP spec
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error(`[MCP] Tool execution error:`, error);
            const err = error as Error;
            throw new Error(`Tool execution failed: ${err.message}`);
        }
    }
}
