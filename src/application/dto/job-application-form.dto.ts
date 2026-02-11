import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

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

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  jobPostingId!: number;
}

