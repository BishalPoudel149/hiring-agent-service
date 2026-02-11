import { Injectable } from '@nestjs/common';
import { ApplicationToolsService } from './application-tools.service';
import { ResumeParserService } from './resume-parser.service';
import { LinkedinParserService } from './linkedin-parser.service';
import { EmailUtilService } from './email-util.service';

export interface McpToolInputSchema {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
}

export interface McpTool {
    name: string;
    description: string;
    inputSchema: McpToolInputSchema;
}

export interface McpToolWithHandler extends McpTool {
    handler: (args: any) => Promise<any>;
}

@Injectable()
export class McpToolRegistryService {
    private tools: Map<string, McpToolWithHandler> = new Map();

    constructor(
        private readonly applicationTools: ApplicationToolsService,
        private readonly resumeParser: ResumeParserService,
        private readonly linkedinParser: LinkedinParserService,
        private readonly emailUtil: EmailUtilService
    ) {
        this.registerTools();
    }

    /**
     * Register all MCP tools
     */
    private registerTools(): void {
        // Application Tools
        this.registerTool({
            name: 'get_unprocessed_applications',
            description: 'Get all unprocessed job applications',
            inputSchema: {
                type: 'object',
                properties: {}
            },
            handler: async () => {
                return await this.applicationTools.getUnprocessedApplications();
            }
        });

        this.registerTool({
            name: 'get_application_details',
            description: 'Get application details by applicant ID',
            inputSchema: {
                type: 'object',
                properties: {
                    applicantId: {
                        type: 'number',
                        description: 'The applicant ID'
                    }
                },
                required: ['applicantId']
            },
            handler: async (args) => {
                return await this.applicationTools.getApplicationDetails(
                    args.applicantId
                );
            }
        });

        this.registerTool({
            name: 'get_all_applications',
            description: 'Get all job applications',
            inputSchema: {
                type: 'object',
                properties: {}
            },
            handler: async () => {
                return await this.applicationTools.getAllApplications();
            }
        });

        this.registerTool({
            name: 'mark_application_as_processed',
            description: 'Mark a single application as processed',
            inputSchema: {
                type: 'object',
                properties: {
                    applicationId: {
                        type: 'number',
                        description: 'Application ID to mark as processed'
                    }
                },
                required: ['applicationId']
            },
            handler: async (args) => {
                return await this.applicationTools.markApplicationAsProcessed(
                    args.applicationId
                );
            }
        });

        this.registerTool({
            name: 'mark_applications_as_processed',
            description: 'Mark multiple applications as processed',
            inputSchema: {
                type: 'object',
                properties: {
                    applicationIds: {
                        type: 'array',
                        items: { type: 'number' },
                        description: 'List of application IDs to mark as processed'
                    }
                },
                required: ['applicationIds']
            },
            handler: async (args) => {
                return await this.applicationTools.markApplicationsAsProcessed(
                    args.applicationIds
                );
            }
        });

        this.registerTool({
            name: 'save_application_evaluation',
            description: 'Save an application evaluation to the database',
            inputSchema: {
                type: 'object',
                properties: {
                    jobApplicationId: { type: 'number' },
                    resumeScore: { type: 'number' },
                    linkedInScore: { type: 'number' },
                    projectsScore: { type: 'number' },
                    aiSummary: { type: 'string' },
                    doesAIRecommend: { type: 'boolean' },
                    aiResume: { type: 'string' },
                    finalAverageScore: { type: 'number' }
                },
                required: [
                    'jobApplicationId',
                    'resumeScore',
                    'linkedInScore',
                    'projectsScore',
                    'aiSummary',
                    'doesAIRecommend',
                    'aiResume',
                    'finalAverageScore'
                ]
            },
            handler: async (args) => {
                return await this.applicationTools.saveApplicationEvaluation(args);
            }
        });

        // Resume Parser
        this.registerTool({
            name: 'parse_resume',
            description: 'Parse a resume from URL and extract structured data',
            inputSchema: {
                type: 'object',
                properties: {
                    resumeUrl: {
                        type: 'string',
                        description: 'URL of the resume PDF to parse'
                    }
                },
                required: ['resumeUrl']
            },
            handler: async (args) => {
                return await this.resumeParser.parseResume(args.resumeUrl);
            }
        });

        // LinkedIn Parser
        this.registerTool({
            name: 'get_linkedin_profile',
            description: 'Get LinkedIn profile data from profile URL',
            inputSchema: {
                type: 'object',
                properties: {
                    profileUrl: {
                        type: 'string',
                        description: 'LinkedIn profile URL'
                    }
                },
                required: ['profileUrl']
            },
            handler: async (args) => {
                return await this.linkedinParser.getUserProfileData(args.profileUrl);
            }
        });

        // Email Utility
        this.registerTool({
            name: 'send_email',
            description: 'Send email to a specified address',
            inputSchema: {
                type: 'object',
                properties: {
                    email: { type: 'string', description: 'Recipient email address' },
                    subject: { type: 'string', description: 'Email subject' },
                    body: { type: 'string', description: 'Email body content' }
                },
                required: ['email', 'subject', 'body']
            },
            handler: async (args) => {
                return await this.emailUtil.sendEmailByAddress(
                    args.email,
                    args.subject,
                    args.body
                );
            }
        });

        console.log(`[MCP] Registered ${this.tools.size} tools`);
    }

    /**
     * Register a single tool
     */
    private registerTool(tool: McpToolWithHandler): void {
        this.tools.set(tool.name, tool);
    }

    /**
     * Get all tools (without handlers, for listing)
     */
    getAllTools(): McpTool[] {
        return Array.from(this.tools.values()).map(({ handler, ...tool }) => tool);
    }

    /**
     * Get a specific tool by name
     */
    getTool(name: string): McpToolWithHandler | undefined {
        return this.tools.get(name);
    }

    /**
     * Execute a tool by name with arguments
     */
    async executeTool(name: string, args: any): Promise<any> {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool not found: ${name}`);
        }

        try {
            const result = await tool.handler(args);
            return result;
        } catch (error) {
            console.error(`[MCP] Error executing tool ${name}:`, error);
            throw error;
        }
    }
}
