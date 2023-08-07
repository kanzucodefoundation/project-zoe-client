import { cleanComboValue, removeEmptyFields } from './dataHelpers';
import { hasValue, IOption } from '../components/inputs/sutils';

describe('removeEmptyFields', () => {
  it('removeEmptyFields can clean up data', () => {
    const data = {
      from: null,
      to: null,
      categories: [],
      statuses: [],
      subStatuses: [],
      userId: '',
      applicantId: undefined,
      assignee: undefined,
    };
    const result = removeEmptyFields(data);
    expect(hasValue(result)).toEqual(false);
  });

  it('removeEmptyFields can keep filled values', () => {
    const data = {
      from: null,
      to: null,
      categories: [],
      statuses: [],
      subStatuses: [],
      userId: undefined,
      applicantId: undefined,
      assignee: '1000tt',
    };
    const result = removeEmptyFields(data);
    expect(hasValue(result)).toEqual(true);
    expect(hasValue(result.assignee)).toEqual(true);
    expect(Object.keys(result).length).toEqual(1);
  });
});

describe('cleanComboValue', () => {
  it('cleanComboValue can clean up IOption', () => {
    const data: IOption = { id: '12', name: 'Fooo' };
    const result = cleanComboValue(data);
    expect(result).toEqual('12');
  });

  it('cleanComboValue can clean up IOption[]', () => {
    const data: IOption[] = [
      { id: '12', name: 'Fooo' },
      { id: '13', name: 'Bar' },
    ];
    const result = cleanComboValue(data);
    expect(result[0]).toEqual('12');
    expect(result[1]).toEqual('13');
  });

  it('cleanComboValue can clean up string', () => {
    const data = 'foo';
    const result = cleanComboValue(data);
    expect(result).toEqual('foo');
  });

  it('cleanComboValue can clean up string[]', () => {
    const data: string[] = ['foo', 'bar'];
    const result = cleanComboValue(data);
    expect(result[0]).toEqual('foo');
    expect(result[1]).toEqual('bar');
  });
});
