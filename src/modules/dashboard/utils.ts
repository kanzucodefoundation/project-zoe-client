import { parseXpath } from '../../utils/jsonHelpers';

export const aggregateValue = (data: any[], fieldName: string): number => {
  let sum = 0;
  for (const datum of data) {
    const value = parseXpath(datum, fieldName);
    if (!!value && !isNaN(value)) {
      sum += Number(value);
    }
  }
  return sum;
};
export type AgField = {
  path: string;
  name: string;
};

export const aggregateValues = (data: any[], fields: AgField[]): any => {
  const sum: any = {};
  for (const f of fields) {
    sum[f.name] = 0;
  }
  for (const datum of data) {
    for (const f of fields) {
      const value = parseXpath(datum, f.path);
      if (!!value && !isNaN(value)) {
        sum[f.name] += Number(value);
      }
    }
  }
  return sum;
};
