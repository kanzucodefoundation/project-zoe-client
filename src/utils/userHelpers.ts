import { IAuthUser } from "../data/types"

export const hasRole = (user: IAuthUser, role: string): boolean => {
    return user.roles.indexOf(role) > -1
}
export const hasAnyRole = (user: IAuthUser, roles: string[]): boolean => {
    return roles.some(it => hasRole(user, it))
}


