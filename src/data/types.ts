import {UserState} from "redux-oidc";

export interface BaseModel {
    id: string
    createdAt: Date
    lastUpdated?: Date
    isDeleted: boolean
}

export interface IAuthUser {
    id: string
    avatar: string
    username: string
    email: string
    fullName: string
    roles: string[]
}

export interface ILoginResponse {
    token: string
    user: IAuthUser
}

export interface IState {
    core: ICoreState
    contacts: any
    oidc: UserState
}

export interface ICoreState {
    user: IAuthUser
    token: string
}

export interface ISearch {
    limit: number,
    skip: number,
    query?: string
}

export interface IOidcUser {
    access_token: string
    expires_at: number
    id_token: string
    profile: IOidcProfile
    refresh_token: string
    scope: string
    session_state: string
    state: string
    token_type: string
}

export interface IOidcProfile {
    amr: string[]
    auth_time: number
    given_name: string
    idp: string
    name: string
    preferred_username: string
    role: string
    sid: string
    sub: string
}
