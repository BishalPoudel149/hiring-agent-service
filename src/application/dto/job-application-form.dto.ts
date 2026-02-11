import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class JobApplicationFormDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  position!: string;

  @IsInt()
  @IsNotEmpty()
  jobPostingId!: number;
}

