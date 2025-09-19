import { PipeTransform, BadRequestException } from '@nestjs/common';

import { PROFESSIONAL_REGEX } from '../utils/professional-validatos';
import { CaregiverInput } from '../types/caregiver-input-type';

export class ProfessionalIdValidationPipe implements PipeTransform {
  transform(value: CaregiverInput) {
    if (!value.crm_coren) {
      return value;
    }
    const valid = Object.values(PROFESSIONAL_REGEX).some((regex) =>
      regex.test(value.crm_coren!),
    );

    if (!valid) {
      throw new BadRequestException(
        'crm_coren inválido. Use formatos: CRM-SP 123456, COREN-SP 123456, CRP 123456, CREFITO 123456',
      );
    }
    return value;
  }
}
