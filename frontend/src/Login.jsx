import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Login({ onLogin }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)
    // OAuth2 password form expects application/x-www-form-urlencoded
    const body = new URLSearchParams()
    body.append('username', email)
    body.append('password', password)

    try{
      const res = await fetch('/auth/login', {
        method: 'POST',
        body,
      })
      if(!res.ok) throw new Error(await res.text())
      const data = await res.json()
      onLogin(data.access_token)
      navigate('/dashboard')
    }catch(err){
      setError('Login failed')
      console.error(err)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md">
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 block w-full border rounded p-2" value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input type="password" className="mt-1 block w-full border rounded p-2" value={password} onChange={e=>setPassword(e.target.value)} />
      </div>
      <div className="flex items-center justify-between">
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</button>
        <Link to="/register" className="text-sm text-blue-600">Create account</Link>
      </div>
    </form>
  )
}
