import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { JobApplication } from './job-application.entity';

@Entity('JobPostings')
export class JobPosting {
  @PrimaryGeneratedColumn()
  jobPostingId!: number;

  @Column()
  jobTitle!: string;

  @Column()
  jobDescription!: string;

  @OneToMany(() => JobApplication, (application) => application.jobPosting)
  jobApplications?: JobApplication[];
}

