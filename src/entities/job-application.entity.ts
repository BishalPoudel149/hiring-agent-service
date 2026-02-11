import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { JobPosting } from './job-posting.entity';
import { ApplicationEvaluation } from './application-evaluation.entity';

@Entity('JobApplications')
export class JobApplication {
  @PrimaryGeneratedColumn()
  jobApplicationId!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  resumeUrl!: string;

  @Column()
  position!: string;

  @Column({ type: 'timestamptz' })
  appliedOn!: Date;

  @Column()
  jobPostingId!: number;

  @ManyToOne(() => JobPosting, (posting) => posting.jobApplications, {
    eager: false
  })
  @JoinColumn({ name: 'jobPostingId' })
  jobPosting?: JobPosting;

  @Column({ default: false })
  isApplicationProcessed!: boolean;

  @OneToMany(
    () => ApplicationEvaluation,
    (evaluation) => evaluation.jobApplication
  )
  evaluations?: ApplicationEvaluation[];
}

