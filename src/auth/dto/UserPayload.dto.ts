import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class UserPayloadDto {
  @ApiProperty({ type: String, description: 'email or telephone' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    type: String,
    description: 'password',
    minimum: 8,
    maximum: 25,
  })
  @IsString()
  @IsNotEmpty()
  @Min(8)
  @Max(25)
  password: string;
}
