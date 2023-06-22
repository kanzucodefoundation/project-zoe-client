import { IReport } from '../../modules/reports/types';

export const reportsConstants = {
  reportsFetchAll: 'reportsFetchAll',
  reportsFetchLoading: 'reportsFetchLoading',
  reportsFetchOne: 'reportsFetchOne',
};

export interface IReportState {
  data: IReport;
  loading: boolean;
}

const initialState: IReportState = {
  data: { id: 0, data: [], metadata: { columns: [] }, footer: [], columns: [] },
  loading: true,
};

export default function reducer(state = initialState, action: any) {
  switch (action.type) {
    case reportsConstants.reportsFetchAll: {
      const data: IReport[] = action.payload;
      return { ...state, data, loading: false };
    }

    case reportsConstants.reportsFetchLoading: {
      return { ...state, loading: action.payload };
    }

    case reportsConstants.reportsFetchOne: {
      const data: IReport = action.payload;
      return { ...state, data };
    }

    default: {
      return state;
    }
  }
}
