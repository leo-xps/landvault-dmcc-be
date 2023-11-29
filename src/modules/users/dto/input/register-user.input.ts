import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterUserInput {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  guestId: string;
}
