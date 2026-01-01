// Source - https://stackoverflow.com/a
// Posted by iamolegga, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-16, License - CC BY-SA 4.0

import { Transform } from 'class-transformer';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { BadRequestException } from '@nestjs/common';

const validCountries = ['US', 'UK', 'BR'];

export function ToPhone() {
  return Transform(
    ({ value }) => {
      if (value === '' || value === null) return null;
      if (typeof value !== 'string') {
        throw new BadRequestException('Phone number must be a string');
      }

      const parsed = parsePhoneNumberFromString(value, 'BR');

      if (!parsed) {
        throw new BadRequestException(`Invalid phone number format: ${value}`);
      }

      const countryCode = parsed.country || 'Unknown';
      if (!validCountries.includes(countryCode)) {
        throw new BadRequestException(
          `Unsupported country code: ${countryCode}. Supported countries are: ${validCountries.join(
            ', ',
          )}`,
        );
      }

      return parsed.number;
    },
    { toClassOnly: true },
  );
}
