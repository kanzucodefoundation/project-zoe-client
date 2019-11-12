import {format, isValid, parseISO} from "date-fns";

export const printDateTime = (value: any): string => {
    if (typeof value === 'string') {
        return printDateTime(strToDate(value))
    }
    if (isValid(value))
        return format(value, 'yyyy.MM.dd HH.mm')
    else
        return ''
}

export const printBirthday = (value: any): string => {
    if (typeof value === 'string') {
        return printBirthday(strToDate(value))
    }
    if (isValid(value))
        return format(value, 'dd MMM')
    else
        return ''
}

export const printMonth = (value: any): string => {
    if (typeof value === 'string') {
        return printMonth(strToDate(value))
    }
    if (isValid(value))
        return format(value, 'MMM')
    else
        return ''
}

export const printDay = (value: any): string => {
    if (typeof value === 'string') {
        return printDay(strToDate(value))
    }
    if (isValid(value))
        return format(value, 'dd')
    else
        return ''
}

export const printShortDate = (value: any): string => {
    if (typeof value === 'string') {
        return printShortDate(strToDate(value))
    }
    if (isValid(value))
        return format(value, 'dd MMM')
    else
        return ''
}

export const printDayOfMonth = (value: any): string => {
    if (typeof value === 'string') {
        return printDayOfMonth(strToDate(value))
    }
    if (isValid(value))
        return format(value, 'dd')
    else
        return ''
}


export const printDate = (value: any): string => {
    if (typeof value === 'string') {
        return printDate(strToDate(value))
    }
    if (isValid(value))
        return format(value, 'yyyy.MM.dd')
    else
        return ''
}

export const strToDate = (str: string): Date | null => {
    try {
        return parseISO(str)
    } catch (e) {
        return null
    }
}
