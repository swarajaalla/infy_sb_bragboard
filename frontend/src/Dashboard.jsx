import React, { useState, useEffect } from 'react'

export default function Dashboard({ token, onLogout }){
  const [me, setMe] = useState(null)
  const [peers, setPeers] = useState([])

  useEffect(()=>{
    async function load(){
      try{
        const meRes = await fetch('/auth/users/me', { headers: { Authorization: `Bearer ${token}` }})
        if(meRes.ok){
          const jm = await meRes.json()
          setMe(jm)
          // load department peers
          const q = jm.department ? `/users?department=${encodeURIComponent(jm.department)}` : '/users'
          const peersRes = await fetch(q, { headers: { Authorization: `Bearer ${token}` }})
          if(peersRes.ok){
            const jp = await peersRes.json()
            setPeers(jp)
          }
        }
      }catch(err){
        console.error(err)
      }
    }
    load()
  }, [token])

  if(!me) return <div>Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-medium">{me.name ?? me.email}</div>
          <div className="text-sm text-gray-600">{me.email} · {me.department} · {me.role}</div>
        </div>
        <div>
          <button onClick={onLogout} className="px-3 py-1 border rounded">Logout</button>
        </div>
      </div>

      <section className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Department peers</h2>
        <ul>
          {peers.map(p=> (
            <li key={p.id} className="py-1 border-b last:border-b-0">{p.name ?? p.email} — {p.role}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
