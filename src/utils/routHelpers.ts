export const getRouteParam = (props: any, paramName: string, defaultValue = '') => {
    const {match = {}} = props
    const {params = {}} = match;
    return params[paramName] || defaultValue
}
