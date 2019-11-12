import * as validate from "validate.js";
export interface IOption {
    label: string
    value: any
}

export const toOptions = (data: string[]): IOption[] => {
    return data.map(it => ({label: it, value: it}))
}


export const hasValue = (text: string) => {
    const errors = validate.single(text, {presence: {allowEmpty: false}});
    return !errors;
}
