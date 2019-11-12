import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import {ThemeProvider,} from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';
import store from "./data/store";
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import theme from "./theme";
import {OidcProvider} from "redux-oidc";
import userManager from "./data/auth/userManager";


ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <OidcProvider store={store} userManager={userManager}>
                <>
                    <CssBaseline/>
                    <App/>
                </>
            </OidcProvider>
        </ThemeProvider>
    </Provider>, document.getElementById('root'));

serviceWorker.register();
