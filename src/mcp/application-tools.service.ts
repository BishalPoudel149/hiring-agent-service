import { Injectable } from '@nestjs/common';
import { ApplicationService } from '../application/application.service';
import { JobPostingService } from '../job-posting/job-posting.service';
import { ApplicationEvaluationService } from '../application-evaluation/application-evaluation.service';
import { ApplicationEvaluation } from '../entities/application-evaluation.entity';
import { JobApplication } from '../entities/job-application.entity';

export interface ApplicationDetailsResponse {
  applicantId: number;
  jobId: number;
  jobDescription: string;
  resumeUrl: string;
}

@Injectable()
export class ApplicationToolsService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly jobPostingService: JobPostingService,
    private readonly evaluationService: ApplicationEvaluationService
  ) {}

  async getApplicationDetails(
    applicantId: number
  ): Promise<ApplicationDetailsResponse | null> {
    const application = await this.applicationService.getApplicationById(
      applicantId
    );
    if (!application) return null;

    const job = await this.jobPostingService.getJobPostingById(
      application.jobPostingId
    );
    if (!job) return null;

    return {
      applicantId: application.jobApplicationId,
      jobId: job.jobPostingId,
      jobDescription: job.jobDescription,
      resumeUrl: application.resumeUrl
    };
  }

  getUnprocessedApplications(): Promise<JobApplication[]> {
    return this.applicationService.getUnprocessedApplications();
  }

  markAllUnprocessedApplicationsAsProcessed(): Promise<number> {
    return this.applicationService.markAllUnprocessedAsProcessed();
  }

  markApplicationsAsProcessed(ids: number[]): Promise<number> {
    return this.applicationService.markApplicationsAsProcessed(ids);
  }

  markApplicationAsProcessed(id: number): Promise<number> {
    return this.applicationService.markApplicationsAsProcessed([id]);
  }

  saveApplicationEvaluation(
    evaluation: Partial<ApplicationEvaluation>
  ): Promise<boolean> {
    if (!evaluation.jobApplicationId || evaluation.jobApplicationId <= 0) {
      return Promise.resolve(false);
    }
    return this.evaluationService.saveEvaluation(evaluation);
  }

  getAllApplications(): Promise<JobApplication[]> {
    return this.applicationService.getAllApplications();
  }
}

