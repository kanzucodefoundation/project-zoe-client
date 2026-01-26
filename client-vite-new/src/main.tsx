import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Provider} from 'react-redux'

import store from './data/store'
import App from './App.tsx'
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import './index.css'

const queryClient = new QueryClient()
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <App/>
            </QueryClientProvider>
        </Provider>
    </StrictMode>,
)
