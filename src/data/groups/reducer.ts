
import {Dispatch} from "redux";
import {search} from "../../utils/ajax";
import {remoteRoutes} from "../constants";
import {IGroup} from "../../modules/groups/types";

export const groupConstants = {
    groupsStartLoading: "groupsStartLoading",
    groupsStopLoading: "groupsStopLoading",
    groupsCommitAll: "groupsCommitAll",
    groupsAdd: "groupsAdd",
    groupsEdit: "groupsEdit",
    groupsDelete: "groupsDelete"
}

export interface IGroupState {
    data: IGroup[]
    loading: boolean
}

const initialState: IGroupState = {
    data: [],
    loading: false
}

export default function reducer(state = initialState, action: any) {
    switch (action.type) {
        case groupConstants.groupsStartLoading: {
            return {...state, loading: true}
        }
        case groupConstants.groupsStopLoading: {
            return {...state, loading: false}
        }
        case groupConstants.groupsCommitAll: {
            const data: IGroup[] = action.payload
            return {...state, data, loading: false}
        }
        case groupConstants.groupsAdd: {
            const dt: IGroup = action.payload
            return {...state, data: [...state.data, dt]}
        }
        case groupConstants.groupsDelete: {
            const id: string = action.payload
            return {...state, data: [...state.data.filter(it => it.id !== id)]}
        }
        case groupConstants.groupsEdit: {
            const dt: IGroup = action.payload
            const data = state.data.map(it => {
                if (dt.id === it.id) {
                    return dt
                }
                return it
            })
            return {...state, data}
        }
        default: {
            return state
        }
    }
}


export const groupsFetchAsync = (filter: any) => {
    return (dispatch: Dispatch<any>) => {
        search(
            remoteRoutes.groups,
            filter,
            (resp: any) => dispatch(groupsCommitFetch(resp)),
            undefined,
            () => dispatch(groupsStopLoading()))
    }
}
export const groupsCommitFetch = (data: IGroup[]) => ({type: groupConstants.groupsCommitAll, payload: data})
export const groupsStartLoading = () => ({type: groupConstants.groupsStartLoading})
export const groupsStopLoading = () => ({type: groupConstants.groupsStopLoading})
export const groupsAddGroup = (data: IGroup) => ({type: groupConstants.groupsAdd, payload: data})
export const groupsEditGroup = (data: IGroup) => ({type: groupConstants.groupsEdit, payload: data})
export const groupsDeleteGroup = (data: string) => ({type: groupConstants.groupsDelete, payload: data})
