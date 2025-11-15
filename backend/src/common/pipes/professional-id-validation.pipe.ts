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
        'crm_coren inválido. Exemplos: CRM-SP 123456, COREN-SP 123456, CRP 06/12345, CRP 06/12345-6, CREFITO-3 123456-F, CREFITO-3/123456-F',
        );
    }
    return value;
  }
}
