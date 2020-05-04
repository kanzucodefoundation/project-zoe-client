import {ICreateTeamleadDto} from "../../modules/teamlead/types";

export const servicesConstants = {
    servicesAddTeamlead: "servicesAddTeamlead",

    coreLogout: "CORE_LOGOUT"
}

export interface IServicesState {
    data: ICreateTeamleadDto[]
    selected?: ICreateTeamleadDto
    loading: boolean
}

const initialState: IServicesState = {
    data: [],
    loading: true,
    selected: undefined
}

export default function reducer(state = initialState, action: any) {
    switch (action.type) {

        case servicesConstants.servicesAddTeamlead: {
            const newTeamlead: ICreateTeamleadDto[] = action.payload
            return {...state, data: [...state.data, newTeamlead]}
        }

        default: {
            return state
        }
    }
}
