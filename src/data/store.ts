import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import core from "./coreReducer";
import crm from "./contacts/reducer";
import events from "./events/eventsReducer";
import groupReports from "./events/groupReportsReducer";
import tags from "./tags/reducer";
import rolesReducer from "./admin/userRolesReducer";



const myWindow = window as any;
const toolsName = "__REDUX_DEVTOOLS_EXTENSION__";
const devTools: any = myWindow[toolsName]
  ? myWindow[toolsName]()
  : (f: any) => f;
const reducers: any = { core, crm, tags, events, groupReports, rolesReducer };
const middleware = applyMiddleware(
  //createLogger(),
  thunk
);
const store: any = middleware(devTools(createStore))(combineReducers(reducers));

export default store;
