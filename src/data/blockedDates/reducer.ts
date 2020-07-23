import {ICreateABlockDateDto} from "../../modules/volcalendar/types";

export const servicesConstants = {
    servicesFetchAll: "servicesFetchAll",
    servicesFetchLoading: "servicesFetchLoading",

    servicesAddBlockedDate: "servicesAddBlockedDate",

    coreLogout: "CORE_LOGOUT"
}

export interface IServicesState {
    data: ICreateABlockDateDto[]
    selected?: ICreateABlockDateDto
    loading: boolean
}

const initialState: IServicesState = {
    data: [],
    loading: true,
    selected: undefined
}

export default function reducer(state = initialState, action: any) {
    switch (action.type) {
        case servicesConstants.servicesFetchAll: {
            const data: ICreateABlockDateDto[] = action.payload
            return {...state, data, loading: false,}
        }

        case servicesConstants.servicesFetchLoading: {
            return {...state, loading: action.payload}
        }

        case servicesConstants.servicesAddBlockedDate: {
            const newBlockedDate: ICreateABlockDateDto[] = action.payload
            return {...state, data: [...state.data, newBlockedDate]}
        }

        default: {
            return state
        }
    }
};
