import { Dispatch } from "redux";
import { search } from "../../utils/ajax";
import { IUserRoles } from "../../modules/admin/users/types";
import { remoteRoutes } from "../constants";

const rolesConstants = {
addCapability:"addCapability",
removeCapability: "removeCapability",
addUserRole: "addUserRole",
deleteUserRole: "deleteUserRole",
fetchAll: "fetchAll",
rolesStopLoading: "rolesStopLoading"
}

export interface IRoles {
    data:IUserRoles[];
    selected?:IUserRoles;
    loading:boolean;
}

const initialState: IRoles = {
    data:[],
    selected: undefined,
    loading: false
}

export default function reducer(state = initialState, action:any) {
switch(action.type){
    case rolesConstants.fetchAll: {
        const data: IUserRoles[] = action.payload
        return {...state, data, loading: false,}
    }
    case rolesConstants.addUserRole: {
        const newUserRole: IUserRoles[] = action.payload
        return {...state, data: [...state.data, newUserRole]}
    }
    case rolesConstants.rolesStopLoading: {
        return { ...state, loading: false };
      }
    default: {
        return state
    }
}

}

export const userRolesFetch = (filter: any)=> {
    return (dispatch:Dispatch<any>) => {
        search(
            remoteRoutes.userRoles,
            filter,
            (resp:any)=> dispatch(rolesFetch(resp)),
            undefined,
            () => dispatch(rolesStopLoading())
        );
    }
}

const rolesFetch = (data:IUserRoles[]) => ({
    type:rolesConstants.fetchAll,
    payload:data
})

export const rolesStopLoading = () => ({
    type: rolesConstants.rolesStopLoading,
  });
