export const isStr = (x: any): boolean =>
  typeof x === 'string';

export const nonEmptyStr = (x?: any) =>
  isStr(x) && x.trim().length > 0;
