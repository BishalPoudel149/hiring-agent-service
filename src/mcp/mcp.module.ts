import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { JobPostingModule } from '../job-posting/job-posting.module';
import { ApplicationEvaluationModule } from '../application-evaluation/application-evaluation.module';
import { LinkedinParserService } from './linkedin-parser.service';
import { ResumeParserService } from './resume-parser.service';
import { EmailUtilService } from './email-util.service';
import { ApplicationToolsService } from './application-tools.service';
import { McpController } from './mcp.controller';
import { McpSseController } from './mcp-sse.controller';
import { JsonRpcService } from './json-rpc.service';
import { SseManagerService } from './sse-manager.service';
import { McpToolRegistryService } from './mcp-tool-registry.service';

@Module({
  imports: [ApplicationModule, JobPostingModule, ApplicationEvaluationModule],
  controllers: [McpController, McpSseController],
  providers: [
    LinkedinParserService,
    ResumeParserService,
    EmailUtilService,
    ApplicationToolsService,
    JsonRpcService,
    SseManagerService,
    McpToolRegistryService
  ],
  exports: [
    LinkedinParserService,
    ResumeParserService,
    EmailUtilService,
    ApplicationToolsService
  ]
})
export class McpModule { }

