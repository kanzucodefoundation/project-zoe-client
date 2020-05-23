import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import {ThemeProvider,} from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';
import store from "./data/store";
import 'react-sortable-tree/style.css';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import theme from "./theme";

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <>
                <CssBaseline/>
                <App/>
            </>
        </ThemeProvider>
    </Provider>, document.getElementById('root'));

serviceWorker.register({
    onUpdate: registration => {
        if (window.confirm("New content available, update now?")) {
            window.location.reload()
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        }
    }
});
