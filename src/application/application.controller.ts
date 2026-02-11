import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationService } from './application.service';
import { StorageService } from '../storage/storage.service';
import { JobApplication } from '../entities/job-application.entity';
import { JobApplicationFormDto } from './dto/job-application-form.dto';

@Controller('Application')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly storageService: StorageService
  ) { }

  @Post('apply')
  @UseInterceptors(FileInterceptor('resume'))
  async apply(
    @Body() form: JobApplicationFormDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Resume file is required.');
    }

    // Upload to Google Cloud Storage
    let resumeUrl: string;
    try {
      resumeUrl = await this.storageService.uploadFile(
        file.buffer,
        file.originalname
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload resume: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }

    const application: Partial<JobApplication> = {
      name: form.name,
      email: form.email,
      position: form.position,
      resumeUrl: resumeUrl,
      appliedOn: new Date(),
      jobPostingId: form.jobPostingId
    };

    const ok = await this.applicationService.saveApplication(application);
    if (!ok) {
      throw new BadRequestException('Failed to save application.');
    }
    return { message: 'Application saved successfully.' };
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.applicationService.getApplicationById(Number(id));
  }

  @Get()
  getAll() {
    return this.applicationService.getAllApplications();
  }
}

