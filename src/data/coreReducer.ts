import {AUTH_TOKEN_KEY, AUTH_USER_KEY} from "./constants";
import {ILoginResponse} from "./types";

const initialState: any = {
    splash: true,
    user: null,
    isLoadingUser: true,
    globalLoader: false
}

export const coreConstants = {
    coreLogin: "CORE_LOGIN",
    startLoading: "CORE_START_LOADING",
    stopLoading: "CORE_STOP_LOADING",
    coreLogout: "CORE_LOGOUT",
    coreStartGlobalLoader: "coreStartGlobalLoader",
    coreStopGlobalLoader: "coreStopGlobalLoader"
}

export default function reducer(state = initialState, action: any) {
    switch (action.type) {
        case coreConstants.coreStartGlobalLoader: {
            return {...state, globalLoader: true}
        }

        case coreConstants.coreStopGlobalLoader: {
            return {...state, globalLoader: false}
        }


        case coreConstants.coreLogin: {
            const {token, user}: ILoginResponse = action.payload
            localStorage.setItem(AUTH_TOKEN_KEY, token)
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
            return {...state, user, isLoadingUser: false, splash: false}
        }

        case coreConstants.coreLogout: {
            localStorage.removeItem(AUTH_TOKEN_KEY)
            localStorage.removeItem(AUTH_USER_KEY)
            return {...state, user: null, isLoadingUser: false, splash: false}
        }

        case coreConstants.stopLoading: {
            return {...state, isLoadingUser: false}
        }
        case coreConstants.startLoading: {
            return {...state, isLoadingUser: true}
        }
        default: {
            return state
        }
    }
}
