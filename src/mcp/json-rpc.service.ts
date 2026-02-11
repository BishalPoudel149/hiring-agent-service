import { Injectable } from '@nestjs/common';

export interface JsonRpcRequest {
    jsonrpc: '2.0';
    id?: string | number;
    method: string;
    params?: any;
}

export interface JsonRpcResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: any;
    error?: JsonRpcError;
}

export interface JsonRpcError {
    code: number;
    message: string;
    data?: any;
}

export enum JsonRpcErrorCode {
    PARSE_ERROR = -32700,
    INVALID_REQUEST = -32600,
    METHOD_NOT_FOUND = -32601,
    INVALID_PARAMS = -32602,
    INTERNAL_ERROR = -32603
}

@Injectable()
export class JsonRpcService {
    /**
     * Create a successful JSON-RPC response
     */
    createResponse(id: string | number, result: any): JsonRpcResponse {
        return {
            jsonrpc: '2.0',
            id,
            result
        };
    }

    /**
     * Create a JSON-RPC error response
     */
    createError(
        id: string | number | null,
        code: JsonRpcErrorCode,
        message: string,
        data?: any
    ): JsonRpcResponse {
        return {
            jsonrpc: '2.0',
            id: id ?? 0,
            error: {
                code,
                message,
                data
            }
        };
    }

    /**
     * Validate JSON-RPC request format
     */
    validateRequest(message: any): { valid: boolean; error?: string } {
        if (!message || typeof message !== 'object') {
            return { valid: false, error: 'Invalid JSON' };
        }

        if (message.jsonrpc !== '2.0') {
            return { valid: false, error: 'Invalid JSON-RPC version' };
        }

        if (!message.method || typeof message.method !== 'string') {
            return { valid: false, error: 'Missing or invalid method' };
        }

        return { valid: true };
    }

    /**
     * Parse JSON-RPC request
     */
    parseRequest(message: string): JsonRpcRequest | null {
        try {
            const parsed = JSON.parse(message);
            const validation = this.validateRequest(parsed);

            if (!validation.valid) {
                return null;
            }

            return parsed as JsonRpcRequest;
        } catch (error) {
            return null;
        }
    }

    /**
     * Format message for SSE transport
     */
    formatSseMessage(data: any): string {
        return `data: ${JSON.stringify(data)}\n\n`;
    }
}
