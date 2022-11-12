import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import store from './data/store';
import 'react-sortable-tree/style.css';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import theme from './theme';

// add sentry set-up in production
if (process.env.REACT_APP_ENVIRONMENT === 'production') {
  const SENTRY_STATUS = process.env.NODE_ENV === 'production';
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    autoSessionTracking: SENTRY_STATUS,
    integrations: [
      new Integrations.BrowserTracing(),
    ],
    tracesSampleRate: 0.5,
    beforeSend: (event) => {
      if (
      // Exclude "localhost" envs from issue tracker
        window.location.hostname === 'localhost'
      ) {
        return null;
      }
      return event;
    },
  });
}

ReactDOM.render(<Provider store={store}>
        <ThemeProvider theme={theme}>
            <>
                <CssBaseline/>
                <App/>
            </>
        </ThemeProvider>
    </Provider>, document.getElementById('root'));

serviceWorker.register({
  onUpdate: (registration) => {
    if (window.confirm('New content available, update now?')) {
      window.location.reload();
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});
