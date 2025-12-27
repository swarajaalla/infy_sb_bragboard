import React, { useState } from "react"

export default function CreateShoutout({ token, peers = [], onCreated }) {
  const [message, setMessage] = useState("")
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [showPeers, setShowPeers] = useState(false)

  const toggle = (id) => {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  // ✅ Select all peers
  const selectAll = () => {
    const all = new Set(peers.map(p => p.id))
    setSelected(all)
    setShowPeers(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/shoutouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          recipient_ids: Array.from(selected)
        })
      })

      if (res.ok) {
        setMessage("")
        setSelected(new Set())
        setShowPeers(false)
        onCreated && onCreated()
      } else {
        const j = await res.json()
        alert(j.detail || "Failed to post")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">✨</span>
        Create Shout-out
      </h3>

      <form onSubmit={submit}>
        {/* Message */}
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
          placeholder="Say something nice... Share your appreciation! 🙌"
        />

        {/* Actions */}
        <div className="bg-blue-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">👤 Tag People</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {peers.length} available
            </span>
          </div>

          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={selectAll}
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-200 font-medium"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => setShowPeers(!showPeers)}
              className="flex-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-sm rounded-md border border-gray-300 transition-colors duration-200 font-medium"
            >
              {showPeers ? '👁️ Hide' : '👁️ Show'} List
            </button>
          </div>

          {/* Peer dropdown */}
          <select
            className="w-full text-sm border-2 border-gray-200 rounded-lg p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
            onChange={e => {
              const id = Number(e.target.value)
              if (id) {
                toggle(id)
                setShowPeers(true)
              }
              e.target.value = ""
            }}
          >
            <option value="">🔍 Click to select someone…</option>
            {peers.map(p => (
              <option key={p.id} value={p.id}>
                {p.name ?? p.email} {p.department ? `• ${p.department}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Selected users */}
        {selected.size > 0 && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-xs font-semibold text-green-700 mb-2">✅ Selected ({selected.size}):</div>
            <div className="flex flex-wrap gap-1">
              {Array.from(selected).map(id => {
                const u = peers.find(p => p.id === id)
                return u ? (
                  <span key={id} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    {u.name ?? u.email}
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}

        {/* People list */}
        {showPeers && peers.length > 0 && (
          <div className="border-2 border-blue-200 rounded-lg p-3 max-h-60 overflow-auto mb-3 bg-white shadow-inner">
            <div className="text-xs text-gray-600 mb-2 font-bold uppercase tracking-wide">Select Recipients:</div>
            <div className="space-y-1">
              {peers.map(u => (
                <label key={u.id} className="flex items-center text-sm py-2 px-2 hover:bg-blue-50 rounded-md cursor-pointer transition-colors duration-150 group">
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    onChange={() => toggle(u.id)}
                    className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-800 group-hover:text-blue-600">{u.name ?? u.email}</span>
                    {u.department && (
                      <span className="text-xs text-gray-500 ml-2 bg-gray-100 px-2 py-0.5 rounded">• {u.department}</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? "🚀 Posting..." : "🎉 Post Shout-out"}
        </button>
      </form>
    </section>
  )
}
