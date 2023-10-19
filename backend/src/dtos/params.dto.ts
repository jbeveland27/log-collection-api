import { IsString, IsNotEmpty, IsOptional, Max, Min, IsNumber } from 'class-validator';
import { MAX_NUMBER_OF_LINES, NUMBER_OF_LINES } from '../config';

export class ParamsDto {
  constructor(logName: string, entries: number, search: string) {
    this.logName = logName;
    this.entries = entries || Number(NUMBER_OF_LINES);
    this.search = search;
  }

  @IsString()
  @IsNotEmpty()
  logName: string;

  @IsOptional()
  @IsNumber({}, { message: `Must be a number between 1 and ${MAX_NUMBER_OF_LINES}` })
  @Min(1)
  @Max(Number(MAX_NUMBER_OF_LINES))
  entries: number;

  @IsOptional()
  @IsNotEmpty()
  search: string;
}
