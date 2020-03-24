import React from 'react';
import {ThemeProvider,} from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';

import 'react-sortable-tree/style.css';
import '../index.css';
import theme from '../theme';
import store from "../data/store";
import {Provider} from "react-redux";


export default function StoryLayout(props: any) {
    return <Provider store={store}> <ThemeProvider theme={theme}>
        <>
            <CssBaseline/>
            {props.children}
        </>
    </ThemeProvider></Provider>
}
