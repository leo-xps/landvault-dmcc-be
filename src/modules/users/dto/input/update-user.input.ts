import { IsEmail, IsNumberString, IsOptional, IsString } from 'class-validator';

export class UpdateUserInput {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;
}

export class SearchByTags {
  @IsString({
    each: true,
  })
  tags: string[];
}

export class UpdateUserInfo {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsNumberString()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsNumberString()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  dmccEmail?: string;

  @IsOptional()
  @IsString()
  dmccID?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString({
    each: true,
  })
  tags?: string[];
}
