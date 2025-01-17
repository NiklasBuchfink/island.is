import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator'
import { Locale } from '../../user-profile/types/localeTypes'

export class PatchUserProfileDto {
  @ApiPropertyOptional({
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((profile) => profile.email !== '')
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ValidateIf((profile) => profile.email !== '')
  emailVerificationCode?: string

  @ApiPropertyOptional({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(7)
  @ValidateIf((profile) => profile.mobilePhoneNumber !== '')
  mobilePhoneNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ValidateIf((profile) => profile.mobilePhoneNumber !== '')
  mobilePhoneNumberVerificationCode?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale
}
