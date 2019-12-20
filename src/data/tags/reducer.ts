import {ITag} from "../../modules/settings/tags/types";
import {Dispatch} from "redux";
import {search} from "../../utils/ajax";
import {remoteRoutes} from "../constants";

export const tagConstants = {
    tagsStartLoading: "tagsStartLoading",
    tagsStopLoading: "tagsStopLoading",
    tagsCommitAll: "tagsCommitAll",
    tagsAdd: "tagsAdd",
    tagsEdit: "tagsEdit",
    tagsDelete: "tagsDelete"
}

export interface ITagState {
    data: ITag[]
    loading: boolean
}

const initialState: ITagState = {
    data: [],
    loading: false
}

export default function reducer(state = initialState, action: any) {
    switch (action.type) {
        case tagConstants.tagsStartLoading: {
            return {...state, loading: true}
        }
        case tagConstants.tagsStopLoading: {
            return {...state, loading: false}
        }
        case tagConstants.tagsCommitAll: {
            const data: ITag[] = action.payload
            return {...state, data, loading: false}
        }
        case tagConstants.tagsAdd: {
            const dt: ITag = action.payload
            return {...state, data: [...state.data, dt]}
        }
        case tagConstants.tagsDelete: {
            const id: string = action.payload
            return {...state, data: [...state.data.filter(it => it.id !== id)]}
        }
        case tagConstants.tagsEdit: {
            const dt: ITag = action.payload
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


export const tagsFetchAsync = (filter: any) => {
    return (dispatch: Dispatch<any>) => {
        search(
            remoteRoutes.tags,
            filter,
            (resp: any) => dispatch(tagsCommitFetch(resp)),
            undefined,
            () => dispatch(tagsStopLoading()))
    }
}
export const tagsCommitFetch = (data: ITag[]) => ({type: tagConstants.tagsCommitAll, payload: data})
export const tagsStartLoading = () => ({type: tagConstants.tagsStartLoading})
export const tagsStopLoading = () => ({type: tagConstants.tagsStopLoading})
export const tagsAddTag = (data: ITag) => ({type: tagConstants.tagsAdd, payload: data})
export const tagsEditTag = (data: ITag) => ({type: tagConstants.tagsEdit, payload: data})
export const tagsDeleteTag = (data: string) => ({type: tagConstants.tagsDelete, payload: data})
