import { IsBoolean, Equals, IsNotEmpty, IsString, IsEmail, MinLength, MaxLength } from 'class-validator';


export class RegisterCaregiverDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  crmCoren!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  confirmPassword!: string;

  @IsBoolean()
  @Equals(true, {message: 'Você deve aceitar os termos de uso e política de privacidade.',})
  acceptedTerms!: boolean;
}
