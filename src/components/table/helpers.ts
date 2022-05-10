import {parseXpath} from "../../utils/jsonHelpers";


export function desc<T>(a: T, b: T, orderBy: keyof T) {
    if (parseXpath(b,orderBy) < parseXpath(a,orderBy)) {
        return -1;
    }
    if (parseXpath(b,orderBy) > parseXpath(a,orderBy)) {
        return 1;
    }
    return 0;
}

export function stableSort<T>(array: T[], cmp: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
}

export type Order = 'asc' | 'desc';

export function getSorting<K extends keyof any>(
    order: Order,
    orderBy: K,
): (a: { [key in K]: number | string }, b: { [key in K]: number | string }) => number {
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}
