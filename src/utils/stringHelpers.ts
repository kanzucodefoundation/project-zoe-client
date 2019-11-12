export const getInitials = (fullName = '') => {
    try {
        return fullName.split(' ').map(it => it[0].toUpperCase()).join("")
    } catch (e) {
        return ''
    }
}

export function getRandomStr(max=16) {
    const letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let str = '';
    for (let i = 0; i < max; i++) {
        str += letters[Math.floor(Math.random() * max)];
    }
    return str;
}


export const trimGuid = (data: string) => {
    return data.substr(0, 8)
}

export function enumToArray(typeData: any) {
    return Object.keys(typeData)
}

// Split pascal case
export function camelPad(str: string) {
    return str
    // Look for long acronyms and filter out the last letter
        .replace(/([A-Z]+)([A-Z][a-z])/g, ' $1 $2')
        // Look for lower-case letters followed by upper-case letters
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        // Look for lower-case letters followed by numbers
        .replace(/([a-zA-Z])(\d)/g, '$1 $2')
        .replace(/^./, function (str) {
            return str.toUpperCase();
        })
        // Remove any white space left around the word
        .trim();
}
