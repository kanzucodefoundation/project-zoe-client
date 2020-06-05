import { ICreateDayDto } from "../../modules/teamlead/types";

export const servicesConstants = {
    servicesAddDay: "servicesAddDay",

    coreLogout: "CORE_LOGOUT"
}

export interface IServicesState {
    data: ICreateDayDto[]
    selected?: ICreateDayDto
    loading: boolean
}

const initialState: IServicesState = {
    data: [],
    loading: true,
    selected: undefined
}

export default function reducer(state = initialState, action: any) {
    switch (action.type) {

        case servicesConstants.servicesAddDay: {
            const newDay: ICreateDayDto[] = action.payload
            return { ...state, data: [...state.data, newDay] }
        }

        default: {
            return state
        }
    }
}