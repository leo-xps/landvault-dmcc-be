import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentInput {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsArray()
  @IsOptional()
  email: string[];

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  roomType?: string;

  @IsString()
  @IsOptional()
  roomEnvironment?: string;
}
