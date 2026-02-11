import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { JobApplication } from '../entities/job-application.entity';
import { JobPosting } from '../entities/job-posting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobApplication, JobPosting])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService]
})
export class ApplicationModule {}

