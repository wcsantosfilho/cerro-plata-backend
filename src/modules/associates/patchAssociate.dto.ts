import { PartialType } from '@nestjs/swagger';
import { AssociateDto } from './associate.dto';

export class PatchAssociateDto extends PartialType(AssociateDto) {}
