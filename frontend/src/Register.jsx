import React, { useState } from 'react'

export default function Register(){
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [message, setMessage] = useState(null)

  async function submit(e){
    e.preventDefault()
    setMessage(null)
    try{
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, department })
      })
      if(!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setMessage('Registered. You may now login.')
    }catch(err){
      console.error(err)
      setMessage('Registration failed')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md">
      {message && <div className="text-green-600">{message}</div>}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 block w-full border rounded p-2" value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input className="mt-1 block w-full border rounded p-2" value={name} onChange={e=>setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium">Department</label>
        <input className="mt-1 block w-full border rounded p-2" value={department} onChange={e=>setDepartment(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input type="password" className="mt-1 block w-full border rounded p-2" value={password} onChange={e=>setPassword(e.target.value)} />
      </div>
      <div>
        <button className="px-4 py-2 bg-green-600 text-white rounded">Register</button>
      </div>
    </form>
  )
}
