import React, { useState, useEffect } from 'react'

// Reaction button component
function ReactionButton({ type, count, isActive, onClick }) {
  const emojis = { like: '👍', clap: '👏', star: '⭐' }
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm transition-all ${
        isActive 
          ? 'bg-blue-100 text-blue-600 font-semibold' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {emojis[type]} {count > 0 && count}
    </button>
  )
}

// Comment component
function Comment({ comment, onDelete, currentUserId }) {
  return (
    <div className="flex gap-3 py-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
        {comment.author.name?.[0] || 'U'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{comment.author.name || comment.author.email}</span>
          <span className="text-xs text-gray-500">
            {new Date(comment.created_at).toLocaleString()}
          </span>
          {comment.user_id === currentUserId && (
            <button 
              onClick={() => onDelete(comment.id)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>
        <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
      </div>
    </div>
  )
}

// Shoutout card with reactions and comments
function ShoutoutCard({ shoutout, token, currentUserId }) {
  const [reactions, setReactions] = useState({})
  const [userReaction, setUserReaction] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)

  // Load reactions and comments
  useEffect(() => {
    loadReactions()
    loadComments()
  }, [])

  async function loadReactions() {
    try {
      const res = await fetch(`/shoutouts/${shoutout.id}/reactions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setReactions(data.reactions || {})
        setUserReaction(data.user_reaction)
      }
    } catch (err) {
      console.error('Error loading reactions:', err)
    }
  }

  async function loadComments() {
    try {
      const res = await fetch(`/shoutouts/${shoutout.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (err) {
      console.error('Error loading comments:', err)
    }
  }

  async function handleReaction(type) {
    try {
      if (userReaction === type) {
        // Remove reaction
        await fetch(`/shoutouts/${shoutout.id}/reactions`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Add/update reaction
        await fetch(`/shoutouts/${shoutout.id}/reactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ reaction_type: type })
        })
      }
      loadReactions()
    } catch (err) {
      console.error('Error updating reaction:', err)
    }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return
    try {
      const res = await fetch(`/shoutouts/${shoutout.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      })
      if (res.ok) {
        setCommentText('')
        loadComments()
      }
    } catch (err) {
      console.error('Error adding comment:', err)
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await fetch(`/shoutouts/${shoutout.id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      loadComments()
    } catch (err) {
      console.error('Error deleting comment:', err)
    }
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      {/* Author */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
            {(shoutout.author?.name ?? shoutout.author?.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{shoutout.author?.name ?? shoutout.author?.email}</div>
            <div className="text-xs text-gray-500">
              {new Date(shoutout.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' at '}
              {new Date(shoutout.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="mt-3 text-gray-800 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
        {shoutout.message}
      </div>

      {/* Recipients */}
      {shoutout.recipients?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-600 font-semibold">To:</span>
          {shoutout.recipients.map(r => (
            <span key={r.id} className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
              {r.name ?? r.email}
            </span>
          ))}
        </div>
      )}

      {/* Reactions */}
      <div className="mt-4 flex items-center gap-2">
        {['like', 'clap', 'star'].map(type => (
          <ReactionButton
            key={type}
            type={type}
            count={reactions[type] || 0}
            isActive={userReaction === type}
            onClick={() => handleReaction(type)}
          />
        ))}
        <button
          onClick={() => setShowComments(!showComments)}
          className="ml-auto px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          💬 {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t pt-4">
          <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first!</p>
            ) : (
              comments.map(c => (
                <Comment
                  key={c.id}
                  comment={c}
                  currentUserId={currentUserId}
                  onDelete={handleDeleteComment}
                />
              ))
            )}
          </div>
          
          {/* Add Comment */}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add a comment..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ShoutoutFeed({ token, refreshKey }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState(null)
  const [peers, setPeers] = useState([])
  
  // Filter states
  const [filterDept, setFilterDept] = useState(false) // default to ALL shoutouts
  const [filterSender, setFilterSender] = useState('')
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function loadUsers() {
      try {
        // Get current user
        const meRes = await fetch('/auth/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!meRes.ok) return
        const meData = await meRes.json()
        setMe(meData)

        // Get all users for sender filter dropdown
        const usersRes = await fetch('/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setPeers(usersData)
        }
      } catch (err) {
        console.error('Error loading users:', err)
      }
    }
    
    loadUsers()
  }, [token])

  useEffect(() => {
    async function load() {
      if (!me) return
      
      setLoading(true)
      try {
        // Build query parameters
        const params = new URLSearchParams({ limit: '50' })
        
        // Department filter
        if (filterDept && me.department) {
          params.append('department', me.department)
        }
        
        // Sender filter
        if (filterSender) {
          params.append('sender_id', filterSender)
        }
        
        // Date filters
        if (filterFromDate) {
          params.append('from_date', filterFromDate)
        }
        if (filterToDate) {
          params.append('to_date', filterToDate)
        }

        const url = `/shoutouts?${params.toString()}`
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.ok) {
          setItems(await res.json())
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token, refreshKey, me, filterDept, filterSender, filterFromDate, filterToDate])

  if (loading) {
    return (
      <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="text-center py-8">
          <div className="text-gray-400">⏳ Loading feed...</div>
        </div>
      </section>
    )
  }

  const clearFilters = () => {
    setFilterDept(false)
    setFilterSender('')
    setFilterFromDate('')
    setFilterToDate('')
  }

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">📢</span>
          Shout-out Feed
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors duration-200 shadow-md"
        >
          {showFilters ? '🔼 Hide' : '🔽 Show'} Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200 shadow-inner">
          <div className="space-y-3">
            {/* Department Filter */}
            <label className="flex items-center text-sm font-medium cursor-pointer group">
              <input
                type="checkbox"
                checked={filterDept}
                onChange={(e) => setFilterDept(e.target.checked)}
                className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="group-hover:text-blue-600 transition-colors">🏢 My Department Only {me?.department && `(${me.department})`}</span>
            </label>

            {/* Sender Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">👤 Filter by Sender:</label>
              <select
                value={filterSender}
                onChange={(e) => setFilterSender(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
              >
                <option value="">All Senders</option>
                {peers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name ?? p.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">📅 From:</label>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">📅 To:</label>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors duration-200 border border-gray-300 text-sm"
            >
              🔄 Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Shoutouts List */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📭</div>
          <div className="text-gray-500">No shoutouts found with current filters.</div>
        </div>
      )}

      <div className="space-y-3 max-h-[600px] overflow-auto pr-2">
        {items.map(it => (
          <ShoutoutCard 
            key={it.id} 
            shoutout={it} 
            token={token} 
            currentUserId={me?.id} 
          />
        ))}
      </div>
    </section>
  )
}
