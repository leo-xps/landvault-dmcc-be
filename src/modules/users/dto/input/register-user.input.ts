import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterUserInput {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  dmccID?: string;

  @IsOptional()
  @IsString()
  dmccEmail?: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  guestId: string;
}
