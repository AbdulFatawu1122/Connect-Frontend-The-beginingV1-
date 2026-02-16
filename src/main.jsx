import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'

import {inject} from "@vercel/analytics" // Import the injection function for tracking

inject();

createRoot(document.getElementById('root')).render(

  //When to deploy this should be uncommented StrictMode
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
