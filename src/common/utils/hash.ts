import * as crypto from 'crypto';

export const hashString = (string: string) => {
  return crypto.createHash('md5').update(string).digest('hex');
};

export const sha256HashString = (string: string) => {
  return crypto.createHash('sha256').update(string).digest('hex');
};
