import {ICreateAVolunteerDto} from "../../modules/volunteers/types";

export const servicesConstants = {
    servicesFetchAll: "servicesFetchAll",
    servicesFetchLoading: "servicesFetchLoading",

    servicesAddVolunteer: "servicesAddVolunteer",

    coreLogout: "CORE_LOGOUT"
}

export interface IServicesState {
    data: ICreateAVolunteerDto[]
    selected?: ICreateAVolunteerDto
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
            const data: ICreateAVolunteerDto[] = action.payload
            return {...state, data, loading: false,}
        }

        case servicesConstants.servicesFetchLoading: {
            return {...state, loading: action.payload}
        }

        case servicesConstants.servicesAddVolunteer: {
            const newVolunteer: ICreateAVolunteerDto[] = action.payload
            return {...state, data: [...state.data, newVolunteer]}
        }

        default: {
            return state
        }
    }
}
