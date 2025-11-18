// Source - https://stackoverflow.com/a
// Posted by iamolegga, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-16, License - CC BY-SA 4.0

import { Transform } from 'class-transformer';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const validCountries = ['US', 'UK', 'BR'];

export function ToPhone() {
  return Transform(
    ({ value }) => {
      if (typeof value !== 'string') return undefined;

      const parsed = parsePhoneNumberFromString(value);

      if (!parsed) return undefined;
      if (!validCountries.includes(parsed.country ?? '')) return undefined;

      return parsed.number;
    },
    { toClassOnly: true },
  );
}
