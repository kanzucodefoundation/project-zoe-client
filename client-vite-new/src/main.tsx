import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Provider} from 'react-redux'
import CssBaseline from '@mui/material/CssBaseline'
import store from './data/store'
import App from './App.tsx'
import './index.css'
import AppTheme from "./theme-wh/AppTheme.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <AppTheme>
                <CssBaseline/>
                <App/>
            </AppTheme>
        </Provider>
    </StrictMode>,
)
