import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationEvaluation } from '../entities/application-evaluation.entity';
import { ApplicationEvaluationService } from './application-evaluation.service';
import { ApplicationEvaluationController } from './application-evaluation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEvaluation])],
  controllers: [ApplicationEvaluationController],
  providers: [ApplicationEvaluationService],
  exports: [ApplicationEvaluationService]
})
export class ApplicationEvaluationModule {}

