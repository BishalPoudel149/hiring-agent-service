import {
  Body,
  Controller,
  Get,
  Param,
  Post
} from '@nestjs/common';
import { LinkedinParserService } from './linkedin-parser.service';
import { ResumeParserService } from './resume-parser.service';
import { EmailUtilService } from './email-util.service';
import { ApplicationToolsService } from './application-tools.service';
import { ResumeParseResult } from './dto/resume-parse-result.dto';
import { ApplicationEvaluation } from '../entities/application-evaluation.entity';

@Controller('mcp')
export class McpController {
  constructor(
    private readonly linkedinParser: LinkedinParserService,
    private readonly resumeParser: ResumeParserService,
    private readonly emailUtil: EmailUtilService,
    private readonly applicationTools: ApplicationToolsService
  ) {}

  // ==== LinkedinParser equivalents ====

  @Post('linkedin/profile')
  getLinkedinProfile(@Body('profileUrl') profileUrl: string) {
    return this.linkedinParser.getUserProfileData(profileUrl);
  }

  // ==== ResumeParserTool equivalents ====

  @Post('resume/parse')
  parseResume(@Body('resumeUrl') resumeUrl: string): Promise<ResumeParseResult> {
    return this.resumeParser.parseResume(resumeUrl);
  }

  // ==== Util.SendEmailByAddress equivalent ====

  @Post('email/send')
  sendEmail(
    @Body('email') email: string,
    @Body('subject') subject: string,
    @Body('body') body: string
  ): Promise<boolean> {
    return this.emailUtil.sendEmailByAddress(email, subject, body);
  }

  // ==== ApplicationProcessor equivalents ====

  @Get('applications/:id/details')
  getApplicationDetails(@Param('id') id: string) {
    return this.applicationTools.getApplicationDetails(Number(id));
  }

  @Get('applications/unprocessed')
  getUnprocessedApplications() {
    return this.applicationTools.getUnprocessedApplications();
  }

  @Post('applications/mark-all-processed')
  markAllUnprocessedAsProcessed() {
    return this.applicationTools.markAllUnprocessedApplicationsAsProcessed();
  }

  @Post('applications/mark-processed')
  markApplicationsAsProcessed(@Body('ids') ids: number[]) {
    return this.applicationTools.markApplicationsAsProcessed(ids || []);
  }

  @Post('applications/:id/mark-processed')
  markApplicationAsProcessed(@Param('id') id: string) {
    return this.applicationTools.markApplicationAsProcessed(Number(id));
  }

  @Post('evaluations')
  saveApplicationEvaluation(@Body() evaluation: Partial<ApplicationEvaluation>) {
    return this.applicationTools.saveApplicationEvaluation(evaluation);
  }

  @Get('applications')
  getAllApplications() {
    return this.applicationTools.getAllApplications();
  }
}

