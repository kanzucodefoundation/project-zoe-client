import React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';

import 'react-sortable-tree/style.css';
import '../index.css';
import { Provider } from 'react-redux';
import theme from '../theme';
import store from '../data/store';

export default function StoryLayout(props: any) {
  return (
    <Provider store={store}>
      {' '}
      <ThemeProvider theme={theme}>
        <>
          <CssBaseline />
          {props.children}
        </>
      </ThemeProvider>
    </Provider>
  );
}
