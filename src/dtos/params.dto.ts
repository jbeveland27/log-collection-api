import { IsString, IsNotEmpty, IsOptional, Max, Min, IsNumber } from 'class-validator';
import { DEFAULTS } from '../constants';

export class ParamsDto {
  constructor(logName: string, entries: number, search: string) {
    this.logName = logName;
    this.entries = entries;
    this.search = search;
  }

  @IsString()
  @IsNotEmpty()
  logName: string;

  @IsOptional()
  @IsNumber({}, { message: `Must be a number between 1 and ${DEFAULTS.MAX_NUMBER_OF_LINES}` })
  @Min(1)
  @Max(DEFAULTS.MAX_NUMBER_OF_LINES)
  entries: number;

  @IsOptional()
  @IsNotEmpty()
  search: string;
}
