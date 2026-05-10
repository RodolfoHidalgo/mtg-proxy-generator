import React from 'react'
import ReactDOM from 'react-dom/client'
import './theme.css'
import { AppProvider } from './AppContext'
import MTGProxyGenerator from './MTGProxyGenerator.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <MTGProxyGenerator />
    </AppProvider>
  </React.StrictMode>,
)
