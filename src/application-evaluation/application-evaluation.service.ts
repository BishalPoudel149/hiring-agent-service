import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEvaluation } from '../entities/application-evaluation.entity';

@Injectable()
export class ApplicationEvaluationService {
  constructor(
    @InjectRepository(ApplicationEvaluation)
    private readonly evaluationRepo: Repository<ApplicationEvaluation>
  ) {}

  async saveEvaluation(
    evaluation: Partial<ApplicationEvaluation>
  ): Promise<boolean> {
    const entity = this.evaluationRepo.create(evaluation);
    const saved = await this.evaluationRepo.save(entity);
    return !!saved.applicationEvaluationId;
  }

  getAllEvaluations(): Promise<ApplicationEvaluation[]> {
    return this.evaluationRepo.find({
      relations: ['jobApplication']
    });
  }

  getEvaluationByApplicantId(
    applicantId: number
  ): Promise<ApplicationEvaluation | null> {
    return this.evaluationRepo.findOne({
      where: { jobApplicationId: applicantId }
    });
  }
}

