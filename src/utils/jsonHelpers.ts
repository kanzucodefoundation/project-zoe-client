export function prettyJson(json: string): string {
    try {
        const data = JSON.parse(json)
        return JSON.stringify(data, null, 2)
    } catch (e) {
        return "null"
    }

}
