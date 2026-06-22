import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Provider} from 'react-redux'

import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import store from './data/store'
import App from './App.tsx'
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import './index.css'
import AppTheme from "./theme-wh/AppTheme.tsx";

dayjs.extend(relativeTime);

const queryClient = new QueryClient()
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <AppTheme>
                        <CssBaseline enableColorScheme/>
                        <App/>
                    </AppTheme>
                </LocalizationProvider>
            </QueryClientProvider>
        </Provider>
    </StrictMode>,
)
