import { Dispatch } from 'redux';
import { get, search } from '../../utils/ajax';
import { remoteRoutes } from '../constants';
import { IEvent } from '../../modules/events/types';

export const eventsConstants = {
  eventsStartLoading: 'eventsStartLoading',
  eventsStopLoading: 'eventsStopLoading',

  eventsCommit: 'eventsCommit',
  eventCommit: 'eventCommit',

  eventsAdd: 'eventsAdd',
  eventsEdit: 'eventsEdit',
  eventsDelete: 'eventsDelete',
};

export interface IEventState {
  data: IEvent[];
  selected: IEvent | null;
  loading: boolean;
}

const initialState: IEventState = {
  data: [],
  selected: null,
  loading: false,
};

export default function reducer(state = initialState, action: any) {
  switch (action.type) {
    case eventsConstants.eventsStartLoading: {
      return { ...state, loading: true };
    }
    case eventsConstants.eventsStopLoading: {
      return { ...state, loading: false };
    }
    case eventsConstants.eventsCommit: {
      const data: IEvent[] = action.payload;
      return { ...state, data, loading: false };
    }
    case eventsConstants.eventsAdd: {
      const dt: IEvent = action.payload;
      return { ...state, data: [...state.data, dt] };
    }

    case eventsConstants.eventCommit: {
      return { ...state, selected: action.payload, loading: false };
    }
    case eventsConstants.eventsDelete: {
      const id: string = action.payload;
      return { ...state, data: [...state.data.filter((it) => it.id !== id)] };
    }
    case eventsConstants.eventsEdit: {
      return { ...state, selected: action.payload };
    }
    default: {
      return state;
    }
  }
}

export const eventsFetchAsync = (filter: any) => (dispatch: Dispatch<any>) => {
  search(
    remoteRoutes.events,
    { filter },
    (resp: any) => {
      const getFullName = (name: any) => `${name.firstName} ${
        name.middleName && name.middleName !== null ? name.middleName : ''
      } ${name.lastName}`;

      const newResp = resp.map((it: any) => ({ ...it, submittedBy: getFullName(it.submittedBy) }));
      dispatch(eventsCommit(newResp));
    },
    undefined,
    () => dispatch(eventsStopLoading()),
  );
};

export const eventFetchAsync = (id: string) => (dispatch: Dispatch<any>) => {
  get(
    `${remoteRoutes.events}/${id}`,
    (resp: any) => dispatch(eventCommit(resp)),
    undefined,
    () => dispatch(eventsStopLoading()),
  );
};

export const eventCommit = (data: IEvent) => ({
  type: eventsConstants.eventCommit,
  payload: data,
});

export const eventsCommit = (data: IEvent[]) => ({
  type: eventsConstants.eventsCommit,
  payload: data,
});

export const eventsStartLoading = () => ({
  type: eventsConstants.eventsStartLoading,
});

export const eventsStopLoading = () => ({
  type: eventsConstants.eventsStopLoading,
});

export const eventsAdd = (data: IEvent) => ({
  type: eventsConstants.eventsAdd,
  payload: data,
});

export const eventsEdit = (data: IEvent) => ({
  type: eventsConstants.eventsEdit,
  payload: data,
});

export const eventsDelete = (id: string) => ({
  type: eventsConstants.eventsDelete,
  payload: id,
});
