export interface IUser {
    username: string
    contact: any
    avatar: string
    id?: string
    roles: string[]
}

export interface IUserRoles {
    id:string
    roleName: string
    capabilities: string[]
    activeState:Boolean
}
