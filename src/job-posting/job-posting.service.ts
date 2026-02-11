import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting } from '../entities/job-posting.entity';

@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPosting)
    private readonly jobPostingRepo: Repository<JobPosting>
  ) {}

  async addJobPosting(posting: Partial<JobPosting>): Promise<boolean> {
    const entity = this.jobPostingRepo.create(posting);
    const saved = await this.jobPostingRepo.save(entity);
    return !!saved.jobPostingId;
  }

  getJobPostingById(id: number): Promise<JobPosting | null> {
    return this.jobPostingRepo.findOne({ where: { jobPostingId: id } });
  }

  async getAllJobPostingIds(): Promise<number[]> {
    const postings = await this.jobPostingRepo.find({
      select: ['jobPostingId']
    });
    return postings.map((p) => p.jobPostingId);
  }

  getAllJobPostings(): Promise<JobPosting[]> {
    return this.jobPostingRepo.find();
  }
}

