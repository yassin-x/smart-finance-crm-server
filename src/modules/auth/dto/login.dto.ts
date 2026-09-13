import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'username is required' })
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
