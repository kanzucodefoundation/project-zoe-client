import { hasValue } from '../components/inputs/sutils';

export const removeEmptyFields = (data: any): any => {
  if (hasValue(data)) {
    const cleanData: any = {};
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (Object.prototype.hasOwnProperty.call(data, key) && hasValue(value)) {
        cleanData[key] = value;
      }
    });
    return cleanData;
  }
  return {} as any;
};

export const cleanComboValue = (value: any): any => {
  if (Array.isArray(value)) {
    // Use Array.map() instead of the for...of loop
    return value.map((item: any) => cleanComboValue(item));
  }

  if (value && typeof value === 'object') {
    return value.id;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return null;
};
