import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEvaluation } from '../entities/application-evaluation.entity';
import { EmailUtilService } from '../mcp/email-util.service';

@Injectable()
export class ApplicationEvaluationService {
  constructor(
    @InjectRepository(ApplicationEvaluation)
    private readonly evaluationRepo: Repository<ApplicationEvaluation>,
    private readonly emailService: EmailUtilService
  ) {}

  async saveEvaluation(
    evaluation: Partial<ApplicationEvaluation>
  ): Promise<boolean> {
    const entity = this.evaluationRepo.create(evaluation);
    const saved = await this.evaluationRepo.save(entity);
    
    // Send email if final score > 0.5
    if (saved.finalAverageScore > 0.5 && saved.jobApplication?.email) {
      await this.emailService.sendEmailByAddress(
        saved.jobApplication.email,
        'Application Evaluation Result',
        `Congratulations! Your application has been evaluated with a score of ${saved.finalAverageScore}.`
      );
    }
    
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

  async getFinalScoreByApplicantId(
    applicantId: number
  ): Promise<number | null> {
    const evaluation = await this.evaluationRepo.findOne({
      where: { jobApplicationId: applicantId },
      select: ['finalAverageScore']
    });
    return evaluation ? evaluation.finalAverageScore : null;
  }

  async sendEvaluationEmail(
    applicantId: number
  ): Promise<boolean> {
    const THRESHOLD_SCORE = 0.5;
    
    const evaluation = await this.evaluationRepo.findOne({
      where: { jobApplicationId: applicantId },
      relations: ['jobApplication']
    });

    if (!evaluation) {
      return false;
    }

    if (!evaluation.jobApplication?.email) {
      return false;
    }

    const email = evaluation.jobApplication.email;
    const score = evaluation.finalAverageScore;
    
    let subject: string;
    let body: string;

    if (score > THRESHOLD_SCORE) {
      subject = '🎉 Congratulations! You\'re Shortlisted for the Next Round';
      body = `Dear Candidate,

We are delighted to inform you that after careful review of your application, you have been shortlisted for the next round of our interview process!

Your Application Score: ${(score * 100).toFixed(1)}%

We were impressed by your qualifications, experience, and the potential you demonstrated through your application materials. Your profile aligns well with what we're looking for in this role.

Next Steps:
• Our recruitment team will reach out to you within the next 2-3 business days
• Please keep an eye on your email for interview scheduling details
• Feel free to prepare any questions you may have about the role or our company

We look forward to getting to know you better in the interview process.

Best regards,
The Hiring Team

---
This is an automated message. Please do not reply to this email.`;
    } else {
      subject = 'Update on Your Application';
      body = `Dear Candidate,

Thank you for taking the time to apply for the position with our company and for your interest in joining our team.

Your Application Score: ${(score * 100).toFixed(1)}%

After careful consideration of all applications, we regret to inform you that we will not be moving forward with your application at this time. This decision was difficult as we received many strong applications, and the competition was quite high.

While your profile did not align with the current requirements for this specific role, we were genuinely impressed by aspects of your background and encourage you to:
• Keep an eye on our careers page for future opportunities that may be a better fit
• Consider applying for other positions that match your skills and experience
• Continue building your professional profile

We sincerely appreciate the time and effort you invested in your application and wish you the very best in your job search and future career endeavors.

Thank you once again for your interest in our company.

Best regards,
The Hiring Team

---
This is an automated message. Please do not reply to this email.`;
    }

    return await this.emailService.sendEmailByAddress(email, subject, body);
  }
}

