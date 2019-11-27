const hexRegex = new RegExp(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i)
export const isValidColor = (str: string):boolean => {
    return hexRegex.test(str)
}
