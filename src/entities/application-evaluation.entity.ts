import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { JobApplication } from './job-application.entity';

@Entity('ApplicationEvaluations')
export class ApplicationEvaluation {
  @PrimaryGeneratedColumn()
  applicationEvaluationId!: number;

  @Column()
  jobApplicationId!: number;

  @Column('float')
  resumeScore!: number;

  @Column('float')
  linkedInScore!: number;

  @Column('float')
  projectsScore!: number;

  @Column({ type: 'text' })
  aiSummary!: string;

  @Column()
  doesAIRecommend!: boolean;

  @Column({ type: 'text' })
  aiResume!: string;

  @Column('float')
  finalAverageScore!: number;

  @ManyToOne(() => JobApplication, (application) => application.evaluations, {
    eager: false
  })
  @JoinColumn({ name: 'jobApplicationId' })
  jobApplication?: JobApplication;
}

