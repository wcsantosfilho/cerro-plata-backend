import { PartialType } from '@nestjs/swagger';
import { DueDto } from './due.dto';

export class PatchDueDto extends PartialType(DueDto) {}
