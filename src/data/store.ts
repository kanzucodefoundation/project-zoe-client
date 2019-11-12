import {applyMiddleware, combineReducers, createStore} from "redux";
import {createLogger} from 'redux-logger'
import thunk from 'redux-thunk'
import core from "./coreReducer";
import {loadUser, reducer as oidc} from 'redux-oidc';
import {routerReducer} from 'react-router-redux';
import oidcReducer from './auth/oidcReducer';
import crm from './contacts/reducer';
import userManager from "./auth/userManager";

const myWindow = window as any;
const toolsName = '__REDUX_DEVTOOLS_EXTENSION__';
const devTools: any = myWindow[toolsName] ? myWindow[toolsName]() : (f: any) => f;


const reducers = combineReducers({core,crm, oidc, subscriptions: oidcReducer, router: routerReducer});
const middleware = applyMiddleware(createLogger(), thunk);
const store: any = middleware(devTools(createStore))(reducers);
loadUser(store, userManager);
export default store


