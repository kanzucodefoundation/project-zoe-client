import jp from 'jsonpath';
import { hasNoValue } from '../components/inputs/inputHelpers';

export function prettyJson(json: string): string {
  try {
    const data = JSON.parse(json);
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return 'null';
  }
}

export function parseXpath(data: any, path: any): any {
  try {
    if (hasNoValue(data)) return undefined;
    let p = `${path}`;
    if (!p.startsWith('$')) {
      p = `$.${path}`;
    }
    const resp = jp.query(data, p);
    if (resp && resp.length > 0) {
      return resp[0];
    }
  } catch (e) {
    console.error(e);
  }
  return undefined;
}
