import { isEmpty, isNumber } from 'lodash';
import { IReportFieldOption } from '../../modules/reports/types';

export interface IOption {
  name: string;
  id: any;
}

export const reportOptionToFieldOptions = (
  data: IReportFieldOption[],
): IOption[] => data.map((it) => ({ name: it.label, id: it.value }));
export const comboParser = ({ id, name }: any): IOption => ({ id, name });
export const toOption = (data: any[]): IOption[] => data.map((it: any) => ({ name: it.name, id: it.id }));
export const toOptions = (data: string[]): IOption[] => data.map((it) => ({ name: it, id: it }));
export const hasValue = (text: any) => !hasNoValue(text);
export const hasNoValue = (text: any) => {
  if (isNumber(text)) return false;
  return isEmpty(text);
};
