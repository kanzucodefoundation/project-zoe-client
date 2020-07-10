import {IAuthUser} from "./types";

export const appRoles = {
    Super: "SUPER",
    Admin: "ADMIN",
    Primary: "PRIMARY",
    ClientAdmin: "CLIENT_ADMIN",
    CrmManager: "CRM_MANAGER",
    LoansManager: "LOANS_MANAGER",

    User: "USER",
}

export const primaryRoles = [appRoles.Admin, appRoles.Primary]
export const clientRoles = [appRoles.ClientAdmin, appRoles.CrmManager, appRoles.LoansManager]
export const backOfficeRoles = [...primaryRoles, appRoles.ClientAdmin, appRoles.CrmManager, appRoles.LoansManager]
export const primaryAssignRoles = [...backOfficeRoles, appRoles.User]
export const clientAssignRoles = [...clientRoles, appRoles.User]

export const hasRole = (user: IAuthUser, role: string): boolean => {
    return user.roles.indexOf(role) > -1
}

export const hasAnyRole = (user: IAuthUser, roles: string[]): boolean => {
    return roles.some(it => hasRole(user, it))
}

export const isPrimaryUser = (user: IAuthUser) => {
    return hasAnyRole(user, [...primaryRoles, appRoles.Super])
}

export const isBackOfficeUser = (user: IAuthUser) => {
    return hasAnyRole(user, [...backOfficeRoles, appRoles.Super])
}

export const isClientAdmin = (user: IAuthUser) => {
    return hasAnyRole(user, [appRoles.ClientAdmin])
}
