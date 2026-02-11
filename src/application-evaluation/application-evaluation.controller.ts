import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post
} from '@nestjs/common';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApplicationEvaluationService } from './application-evaluation.service';
import { ApplicationEvaluation } from '../entities/application-evaluation.entity';

class CreateApplicationEvaluationDto {
  @IsInt()
  jobApplicationId!: number;

  @IsNumber()
  resumeScore!: number;

  @IsNumber()
  linkedInScore!: number;

  @IsNumber()
  projectsScore!: number;

  @IsString()
  aiSummary!: string;

  @IsBoolean()
  doesAIRecommend!: boolean;

  @IsString()
  aiResume!: string;

  @IsNumber()
  finalAverageScore!: number;
}

@Controller('ApplicationEvaluation')
export class ApplicationEvaluationController {
  constructor(
    private readonly evaluationService: ApplicationEvaluationService
  ) {}

  @Post('evaluate')
  async evaluate(@Body() dto: CreateApplicationEvaluationDto) {
    if (!dto || dto.jobApplicationId <= 0) {
      throw new BadRequestException(
        'Valid evaluation and applicant ID are required.'
      );
    }
    const ok = await this.evaluationService.saveEvaluation(
      dto as ApplicationEvaluation
    );
    if (!ok) {
      throw new BadRequestException('Failed to save evaluation.');
    }
    return { message: 'Evaluation saved successfully.' };
  }

  @Get()
  getAll() {
    return this.evaluationService.getAllEvaluations();
  }

  @Get('applicant/:applicantId/score')
  async getFinalScore(@Param('applicantId', ParseIntPipe) applicantId: number) {
    const score = await this.evaluationService.getFinalScoreByApplicantId(applicantId);
    
    if (score === null) {
      throw new BadRequestException('Evaluation not found for this applicant');
    }
    
    return { 
      jobApplicationId: applicantId,
      finalAverageScore: score 
    };
  }

  @Get(':applicantId')
  getByApplicantId(@Param('applicantId') applicantId: string) {
    return this.evaluationService.getEvaluationByApplicantId(
      Number(applicantId)
    );
  }

  @Post('mail/:applicantId/send-email')
  async sendEvaluationEmail(@Param('applicantId', ParseIntPipe) applicantId: number) {
    const sent = await this.evaluationService.sendEvaluationEmail(applicantId);
    return { success: sent };
  }
}

