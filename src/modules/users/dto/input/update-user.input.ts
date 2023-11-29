import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserInput {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;
}
