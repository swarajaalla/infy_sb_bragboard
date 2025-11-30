import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('access_token'))

  useEffect(()=>{
    if(token) localStorage.setItem('access_token', token)
    else localStorage.removeItem('access_token')
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">BragBoard (Dev)</h1>
        <Routes>
          <Route path="/login" element={<Login onLogin={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={token ? <Dashboard token={token} onLogout={()=>setToken(null)} /> : <Navigate to="/login" replace />} />
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  )
}
