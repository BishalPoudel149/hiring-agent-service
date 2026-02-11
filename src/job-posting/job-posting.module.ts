import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPosting } from '../entities/job-posting.entity';
import { JobPostingService } from './job-posting.service';
import { JobPostingController } from './job-posting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting])],
  controllers: [JobPostingController],
  providers: [JobPostingService],
  exports: [JobPostingService]
})
export class JobPostingModule {}

