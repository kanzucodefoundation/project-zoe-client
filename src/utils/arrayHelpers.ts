export const createArray = <T>(count: number, fxn: (inp?: any) => T): T[] => {
    const data: T[] = []
    for (let i = 0; i < count; i++) {
        if (typeof fxn === 'function') {
            data.push(fxn())
        } else
            data.push(fxn)
    }
    return data
}

export function chunkArray<T>(arr: T[], n: number): Array<Array<T>> {
    let chunkLength = Math.max(arr.length / n, 1);
    let chunks: Array<Array<T>> = [];
    for (let i = 0; i < n; i++) {
        if (chunkLength * (i + 1) <= arr.length) chunks.push(arr.slice(chunkLength * i, chunkLength * (i + 1)));
    }
    return chunks;
}

