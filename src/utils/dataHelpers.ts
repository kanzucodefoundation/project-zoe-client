import {hasValue} from "../components/inputs/inputHelpers";

export const removeEmptyFields = (data: any): any => {
    if (hasValue(data)) {
        const cleanData: any = {}
        for (const key in data) {
            if (data.hasOwnProperty(key) && hasValue(data[key])) {
                cleanData[key] = data[key]
            }
        }
        return cleanData
    }
    return {} as any
}


export const cleanComboValue = (value: any): any => {
    if (Array.isArray(value)) {
        return value.map(cleanComboValue)
    } else if (value && typeof value === 'object') {
        return value.id;
    } else if (typeof value === 'string') {
        return value
    }
    return null
}
