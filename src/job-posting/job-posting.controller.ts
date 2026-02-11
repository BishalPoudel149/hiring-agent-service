import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post
} from '@nestjs/common';
import { JobPostingService } from './job-posting.service';
import { JobPosting } from '../entities/job-posting.entity';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateJobPostingDto {
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @IsString()
  @IsNotEmpty()
  jobDescription!: string;
}

@Controller('JobPosting')
export class JobPostingController {
  constructor(private readonly jobPostingService: JobPostingService) {}

  @Post('PostJob')
  async postJob(@Body() dto: CreateJobPostingDto) {
    const ok = await this.jobPostingService.addJobPosting(dto as JobPosting);
    if (!ok) {
      throw new BadRequestException('Failed to create job posting.');
    }
    return { message: 'Job posting created successfully.' };
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.jobPostingService.getJobPostingById(Number(id));
  }

  @Get('ids')
  getIds() {
    return this.jobPostingService.getAllJobPostingIds();
  }

  @Get()
  getAll() {
    return this.jobPostingService.getAllJobPostings();
  }
}

