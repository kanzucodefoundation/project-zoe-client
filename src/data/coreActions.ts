import {coreConstants} from "./coreReducer";
export const handleLogin = (data: any) => {
    return {
        type: coreConstants.coreLogin,
        payload: {...data},
    }
}

export const handleLogout = () => {
    return {
        type: coreConstants.coreLogout,
    }
}

export const startLoading = () => {
    return {
        type: coreConstants.startLoading,
    }
}

export const stopLoading = () => {
    return {
        type: coreConstants.stopLoading,
    }
}

export const coreStartGlobalLoader = () => {
    return {
        type: coreConstants.coreStartGlobalLoader,
    }
}

export const coreStopGlobalLoader = () => {
    return {
        type: coreConstants.coreStopGlobalLoader,
    }
}



