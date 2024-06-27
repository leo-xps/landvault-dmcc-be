import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentInput {
  @IsArray()
  email: string[];

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

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
  roomMode?: string;

  @IsString()
  @IsOptional()
  roomEnvironment?: string;
}
