import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(

  //When to deploy this should be uncommented StrictMode
  //<StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
 // </StrictMode>
)
