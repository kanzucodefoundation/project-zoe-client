import { Dispatch } from 'redux';
import { IGroupReport } from '../../modules/events/types';
import { get, search } from '../../utils/ajax';
import { remoteRoutes } from '../constants';

export const unsubConstants = {
  eventsStartLoading: 'eventsStartLoading',
  unsubEventsStopLoading: 'unsubEventsStopLoading',

  unsubEventsCommit: 'unsubEventsCommit',
  unsubEventCommit: 'unsubEventCommit',

  unsubEventsAdd: 'unsubEventsAdd',
  unsubEventsEdit: 'unsubEventsEdit',
  unsubEventsDelete: 'unsubEventsDelete',
};

export interface IGroupReportState {
  data: IGroupReport[];
  selected: IGroupReport | null;
  loading: boolean;
}

const initialState: IGroupReportState = {
  data: [],
  selected: null,
  loading: false,
};

export default function reducer(state = initialState, action: any) {
  switch (action.type) {
    case unsubConstants.eventsStartLoading: {
      return { ...state, loading: true };
    }
    case unsubConstants.unsubEventsStopLoading: {
      return { ...state, loading: false };
    }
    case unsubConstants.unsubEventsCommit: {
      const data: IGroupReport[] = action.payload;
      return { ...state, data, loading: false };
    }
    case unsubConstants.unsubEventsAdd: {
      const dt: IGroupReport = action.payload;
      return { ...state, data: [...state.data, dt] };
    }

    case unsubConstants.unsubEventCommit: {
      return { ...state, selected: action.payload, loading: false };
    }
    case unsubConstants.unsubEventsDelete: {
      const id: string = action.payload;
      return { ...state, data: [...state.data.filter((it) => it.id !== id)] };
    }
    case unsubConstants.unsubEventsEdit: {
      return { ...state, selected: action.payload };
    }
    default: {
      return state;
    }
  }
}

export const unsubEventsFetchAsync = (filter: any) => (dispatch: Dispatch<any>) => {
  search(
    remoteRoutes.groupReports,
    filter,
    (resp: any) => {
      dispatch(unsubEventsCommit(resp));
    },
    undefined,
    () => dispatch(unsubEventsStopLoading()),
  );
};

export const eventFetchAsync = (id: string) => (dispatch: Dispatch<any>) => {
  get(
    `${remoteRoutes.events}/${id}`,
    (resp: any) => dispatch(eventCommit(resp)),
    undefined,
    () => dispatch(unsubEventsStopLoading()),
  );
};

export const eventCommit = (uData: IGroupReport) => ({
  type: unsubConstants.unsubEventCommit,
  payload: uData,
});

export const unsubEventsCommit = (uData: IGroupReport[]) => ({
  type: unsubConstants.unsubEventsCommit,
  payload: uData,
});

export const eventsStartLoading = () => ({
  type: unsubConstants.eventsStartLoading,
});

export const unsubEventsStopLoading = () => ({
  type: unsubConstants.unsubEventsStopLoading,
});

export const eventsAdd = (uData: IGroupReport) => ({
  type: unsubConstants.unsubEventsAdd,
  payload: uData,
});

export const eventsEdit = (uData: IGroupReport) => ({
  type: unsubConstants.unsubEventsEdit,
  payload: uData,
});

export const eventsDelete = (id: string) => ({
  type: unsubConstants.unsubEventsDelete,
  payload: id,
});
