import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Departments from './pages/Departments.jsx'
import Accounts from './pages/Accounts.jsx'
import Vendors from './pages/Vendors.jsx'
import Orders from './pages/Orders.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Departments />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)