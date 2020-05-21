import { ICreateTaskDto } from "../../modules/tasks/Types";

export const servicesConstants = {
  servicesFetchAll: "servicesFetchAll",
  servicesFetchLoading: "servicesFetchLoading",

  servicesAddTask: "servicesAddTask",

  coreLogout: "CORE_LOGOUT",
};

export interface IServicesState {
  data: ICreateTaskDto[];
  selected?: ICreateTaskDto;
  loading: boolean;
}

const initialState: IServicesState = {
  data: [],
  loading: true,
  selected: undefined,
};

export default function reducer(state = initialState, action: any) {
  switch (action.type) {
    case servicesConstants.servicesFetchAll: {
      const data: ICreateTaskDto[] = action.payload;
      return { ...state, data, loading: false };
    }

    case servicesConstants.servicesFetchLoading: {
      return { ...state, loading: action.payload };
    }

    case servicesConstants.servicesAddTask: {
      const newTask: ICreateTaskDto[] = action.payload;
      return { ...state, data: [...state.data, newTask] };
    }

    default: {
      return state;
    }
  }
}
