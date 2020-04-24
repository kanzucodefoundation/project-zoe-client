import {ICreateVolunteerDto} from "../../modules/volunteers/types";

export const servicesConstants = {
    servicesAddVolunteer: "servicesAddVolunteer",

    coreLogout: "CORE_LOGOUT"
}

export interface IServicesState {
    data: ICreateVolunteerDto[]
    selected?: ICreateVolunteerDto
    loading: boolean
}

const initialState: IServicesState = {
    data: [],
    loading: true,
    selected: undefined
}

export default function reducer(state = initialState, action: any) {
    switch (action.type) {

        case servicesConstants.servicesAddVolunteer: {
            const newVolunteer: ICreateVolunteerDto[] = action.payload
            return {...state, data: [...state.data, newVolunteer]}
        }

        default: {
            return state
        }
    }
}
