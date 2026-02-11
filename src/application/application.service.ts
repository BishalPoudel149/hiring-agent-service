import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { JobApplication } from '../entities/job-application.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepo: Repository<JobApplication>
  ) {}

  async saveApplication(application: Partial<JobApplication>): Promise<boolean> {
    const entity = this.applicationRepo.create({
      ...application,
      appliedOn: application.appliedOn ?? new Date(),
      isApplicationProcessed: application.isApplicationProcessed ?? false
    });
    const saved = await this.applicationRepo.save(entity);
    return !!saved.jobApplicationId;
  }

  getApplicationById(id: number): Promise<JobApplication | null> {
    return this.applicationRepo.findOne({ where: { jobApplicationId: id } });
  }

  getAllApplications(): Promise<JobApplication[]> {
    return this.applicationRepo.find();
  }

  getUnprocessedApplications(): Promise<JobApplication[]> {
    return this.applicationRepo.find({ where: { isApplicationProcessed: false } });
  }

  async markAllUnprocessedAsProcessed(): Promise<number> {
    const result = await this.applicationRepo.update(
      { isApplicationProcessed: false },
      { isApplicationProcessed: true }
    );
    return result.affected ?? 0;
  }

  async markApplicationsAsProcessed(ids: number[]): Promise<number> {
    if (!ids.length) return 0;
    const result = await this.applicationRepo.update(
      { jobApplicationId: In(ids), isApplicationProcessed: false },
      { isApplicationProcessed: true }
    );
    return result.affected ?? 0;
  }
}

