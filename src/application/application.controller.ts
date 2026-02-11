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
import { JobApplication } from '../entities/job-application.entity';
import { JobApplicationFormDto } from './dto/job-application-form.dto';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dthjjextv',
  api_key: process.env.CLOUDINARY_API_KEY || '324877819889514',
  api_secret:
    process.env.CLOUDINARY_API_SECRET || 'mIreBfcSUgismhOBAFQvkbhXlz4'
});

@Controller('Application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('apply')
  @UseInterceptors(FileInterceptor('resume'))
  async apply(
    @Body() form: JobApplicationFormDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Resume file is required.');
    }

    const uploadResult = await new Promise<{
      secure_url: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'MCP_HRMS'
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new BadRequestException(
                `Cloudinary upload error: ${error?.message ?? 'unknown error'}`
              )
            );
          }
          resolve({ secure_url: result.secure_url });
        }
      );
      stream.end(file.buffer);
    });

    const application: Partial<JobApplication> = {
      name: form.name,
      email: form.email,
      position: form.position,
      resumeUrl: uploadResult.secure_url,
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

