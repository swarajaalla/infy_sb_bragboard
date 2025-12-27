import React, { useEffect, useState } from "react"
import CreateShoutout from "./CreateShoutout"
import ShoutoutFeed from "./ShoutoutFeed"

export default function Dashboard({ token, onLogout }) {
  const [me, setMe] = useState(null)
  const [peers, setPeers] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [loadingPeers, setLoadingPeers] = useState(false)

  useEffect(() => {
    if (!token) return

    const loadDashboard = async () => {
      try {
        // 1️⃣ Load current user
        const meRes = await fetch("/auth/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!meRes.ok) return
        const meData = await meRes.json()
        setMe(meData)

        // 2️⃣ Load ALL users (not just department)
        setLoadingPeers(true)
        const peerRes = await fetch("/users", {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (peerRes.ok) {
          const peerData = await peerRes.json()
          // Don't filter by department - show ALL users
          setPeers(peerData)
        }
      } catch (err) {
        console.error("Dashboard load error:", err)
      } finally {
        setLoadingPeers(false)
      }
    }

    loadDashboard()
  }, [token])

  if (!me) return <div className="p-4">Loading dashboard...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-3 py-2">
                <h1 className="text-2xl font-bold">🎉 BragBoard</h1>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">{me.name ?? me.email}</div>
                <div className="text-xs text-gray-500">
                  {me.department || 'No Department'} · {me.role}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* CREATE SHOUTOUT */}
          <div className="lg:col-span-1">
            <CreateShoutout
              token={token}
              peers={peers}
              onCreated={() => setRefreshKey(k => k + 1)}
            />
          </div>

          {/* FEED - Takes more space */}
          <div className="lg:col-span-2">
            <ShoutoutFeed
              token={token}
              refreshKey={refreshKey}
            />
          </div>

        </div>

        {/* TEAM MEMBERS - Full width section below */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">👥</span>
                Team Directory
              </h2>
              {!loadingPeers && peers.length > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {peers.length} member{peers.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loadingPeers && (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading team members...</div>
              </div>
            )}

            {!loadingPeers && peers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found. Register more users to get started!
              </div>
            )}

            {!loadingPeers && peers.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {peers.map(p => (
                  <li
                    key={p.id}
                    className="group p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {(p.name ?? p.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="font-semibold text-gray-800 truncate text-sm">
                        {p.name ?? p.email}
                      </div>
                    </div>
                    {p.department && (
                      <div className="ml-10 text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 inline-block">
                        {p.department}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
