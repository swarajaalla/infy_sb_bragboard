// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getCurrentUser,
//   getShoutoutFeed,
//   createShoutout,
//   getAllUsers,
//   addReaction,
// } from "../services/api";
// import {
//   getComments,
//   addComment,
//   deleteComment,
// } from "../services/api";


// function Dashboard() {
//   const [user, setUser] = useState(null);
//   const [feed, setFeed] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [message, setMessage] = useState("");
//   const [toUserId, setToUserId] = useState("");
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [openComments, setOpenComments] = useState(null);
//   const [commentText, setCommentText] = useState({});
//   const [comments, setComments] = useState({});
//   const [loadingComments, setLoadingComments] = useState({});



//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (!token) {
//       navigate("/");
//       return;
//     }
//     loadData();
//   }, [token, navigate]);

//   const loadData = async () => {
//     try {
//       const userRes = await getCurrentUser(token);
//       setUser(userRes.data);

//       const feedRes = await getShoutoutFeed(token);
//       setFeed(feedRes.data);

//       const usersRes = await getAllUsers(token);
//       setUsers(usersRes.data);
//     } catch (err) {
//       console.error(err);
//       handleLogout();
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await createShoutout(token, {
//       to_user_id: Number(toUserId),
//       message,
//     });
//     setMessage("");
//     setToUserId("");
//     loadData();
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/");
//   };

//   // ✅ REACTION HANDLER (NO DUPLICATES)
//   const react = async (shoutoutId, type, userReactionTypes) => {
//     if (userReactionTypes.includes(type)) {
//       alert("You already reacted");
//       return;
//     }

//     try {
//       await addReaction(token, {
//         shoutout_id: shoutoutId, // ✅ MUST be inside object
//         type: type,
//       });
//       loadData();
//     } catch (err) {
//       console.error("Reaction failed", err.response?.data || err.message);
//     }
//   };

//   // ✅ COMMENTS HANDLERS
//   const loadComments = async (shoutoutId, force = false) => {
//     if (comments[shoutoutId] && !force) return;

//     setLoadingComments(prev => ({ ...prev, [shoutoutId]: true }));

//     const res = await getComments(token, shoutoutId);

//     setComments(prev => ({
//       ...prev,
//       [shoutoutId]: res.data,
//     }));

//     setLoadingComments(prev => ({ ...prev, [shoutoutId]: false }));
//   };


//   const handlePostComment = async (shoutoutId) => {
//     if (!commentText[shoutoutId]?.trim()) return;

//     await addComment(token, {
//       shoutout_id: shoutoutId,
//       content: commentText[shoutoutId],
//     });

//     setCommentText(prev => ({ ...prev, [shoutoutId]: "" }));

//     await loadComments(shoutoutId, true);
//     loadData(); // 🔥 refresh feed to update comment_count
//   };

//   const handleDeleteComment = async (commentId, shoutoutId) => {
//     await deleteComment(token, commentId);
//     loadComments(shoutoutId, true); // ✅ FORCE reload
//   };



//   if (!user) return <p>Loading...</p>;

//   return (
//     <div className="relative min-h-screen bg-gray-50 overflow-hidden">
//       {/* MENU BUTTON */}
//       <button
//         onClick={() => setMenuOpen(!menuOpen)}
//         className="fixed top-5 left-5 z-50 bg-white shadow rounded-full p-3"
//       >
//         ☰
//       </button>

//       {/* SLIDE MENU */}
//       <div
//         className={`fixed top-0 left-0 h-full w-1/5 bg-white shadow-lg z-40 transform transition-transform duration-300 ${
//           menuOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <div className="p-6 space-y-4">
//           <h2 className="text-xl font-bold">Menu</h2>
//           <button
//             className="block w-full text-left"
//             onClick={() => navigate("/profile")}
//           >
//             👤 My Profile
//           </button>

//           <button
//             className="block w-full text-left"
//             onClick={() => navigate("/my-department")}
//           >
//             👥 My Department
//           </button>
          
//           <button
//             className="block w-full text-left"
//             onClick={() => navigate("/all-departments")}
//           >
//             🏢 All Departments
//           </button>

//           <button
//             onClick={handleLogout}
//             className="text-red-500 font-semibold"
//           >
//             🚪 Logout
//           </button>
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div
//         className={`flex transition-all duration-300 ${
//           menuOpen ? "ml-[20%]" : "ml-0"
//         }`}
//       >
//         {/* LEFT — CREATE SHOUTOUT */}
//         <div
//           className={`p-8 transition-all duration-300 ${
//             menuOpen ? "w-2/5" : "w-1/2"
//           }`}
//         >
//           <h2 className="text-2xl font-bold mb-4">Create Shoutout</h2>

//           <form
//             onSubmit={handleSubmit}
//             className="bg-white p-6 rounded-xl shadow"
//           >
//             <select
//               value={toUserId}
//               onChange={(e) => setToUserId(e.target.value)}
//               className="w-full mb-4 p-3 border rounded"
//             >
//               <option value="">Select Employee</option>
//               {users
//                 .filter((u) => u.id !== user.id)
//                 .map((u) => (
//                   <option key={u.id} value={u.id}>
//                     {u.name} ({u.department})
//                   </option>
//                 ))}
//             </select>

//             <textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Write something nice..."
//               className="w-full p-3 border rounded mb-4"
//               rows={5}
//             />

//             <button
//               disabled={!toUserId || !message.trim()}
//               className={`w-full py-2 rounded text-white transition ${
//                 !toUserId || !message.trim()
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               Send Shoutout
//             </button>
//           </form>
//         </div>

//         {/* RIGHT — FEED */}
//         <div
//           className={`p-8 transition-all duration-300 ${
//             menuOpen ? "w-2/5" : "w-1/2"
//           }`}
//         >
//           <h2 className="text-2xl font-bold mb-4">Shoutouts</h2>

//           {feed.map((item) => {
//             const reactions = Array.isArray(item.reactions)
//               ? item.reactions
//               : [];

//             const userReactionTypes = reactions
//               .filter((r) => r.user_id === user.id)
//               .map((r) => r.type);

//             const likeCount = reactions.filter(
//               (r) => r.type === "like"
//             ).length;
//             const clapCount = reactions.filter(
//               (r) => r.type === "clap"
//             ).length;
//             const starCount = reactions.filter(
//               (r) => r.type === "star"
//             ).length;

//             return (
//               <div
//                 key={item.id}
//                 className="bg-white p-5 rounded-xl shadow mb-4"
//               >
//                 <p className="mb-3">{item.message}</p>

//                 <div className="text-sm text-gray-500 flex justify-between">
//                   <span>
//                     👤 {item.from_user.name} ({item.from_user.department})
//                   </span>
//                   <span>
//                     {new Date(item.created_at).toLocaleString()}
//                   </span>
//                 </div>

//                 {/* REACTIONS */}
//                 <div className="flex items-center gap-6 mt-4 text-gray-600">
//                   <button
//                     onClick={() =>
//                       react(item.id, "like", userReactionTypes)
//                     }
//                     disabled={userReactionTypes.includes("like")}
//                     className={`flex items-center gap-1 ${
//                       userReactionTypes.includes("like")
//                         ? "text-gray-400 cursor-not-allowed"
//                         : "hover:text-blue-600"
//                     }`}
//                   >
//                     👍{likeCount}
//                   </button>

//                   <button
//                     onClick={() =>
//                       react(item.id, "clap", userReactionTypes)
//                     }
//                     disabled={userReactionTypes.includes("clap")}
//                     className={`flex items-center gap-1 ${
//                       userReactionTypes.includes("clap")
//                         ? "text-gray-400 cursor-not-allowed"
//                         : "hover:text-green-600"
//                     }`}
//                   >
//                     👏{clapCount}
//                   </button>

//                   <button
//                     onClick={() =>
//                       react(item.id, "star", userReactionTypes)
//                     }
//                     disabled={userReactionTypes.includes("star")}
//                     className={`flex items-center gap-1 ${
//                       userReactionTypes.includes("star")
//                         ? "text-gray-400 cursor-not-allowed"
//                         : "hover:text-yellow-500"
//                     }`}
//                   >
//                     ⭐{starCount}
//                   </button>

//                   <button
//                     onClick={() => {
//                       const open = openComments === item.id ? null : item.id;
//                       setOpenComments(open);
//                       if (open) loadComments(item.id);
//                     }}
//                     className="ml-auto text-sm text-gray-500 hover:text-blue-600 font-medium"
//                   >
//                   💬 {item.comment_count} Comment
//                   </button>




//                   {openComments === item.id && (
//                     <div className="mt-4 space-y-4">
                      
//                       {loadingComments[item.id] ? (
//                         <p className="text-sm text-gray-400">Loading comments...</p>
//                       ) : (
//                         (comments[item.id] || []).map((c) => (
//                           <div key={c.id} className="flex gap-3">
                            
//                             {/* Avatar */}
//                             <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
//                               {user.name[0]}
//                             </div>

//                             {/* Comment Body */}
//                             <div className="bg-gray-100 rounded-xl px-4 py-2 w-full">
//                               <p className="text-sm font-semibold text-gray-800">
//                                 {user.name}
//                               </p>
//                               <p className="text-sm text-gray-700">{c.content}</p>

//                               {c.user_id === user.id && (
//                                 <button
//                                   onClick={() => handleDeleteComment(c.id, item.id)}
//                                   className="text-xs text-red-400 hover:text-red-600 mt-1"
//                                 >
//                                   Delete
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         ))
//                       )}


//                       <div className="flex gap-2 pt-2">
//                         <input
//                           value={commentText[item.id] || ""}
//                           onChange={(e) =>
//                             setCommentText({
//                               ...commentText,
//                               [item.id]: e.target.value,
//                             })
//                           }
//                           placeholder="Add a comment..."
//                           className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
//                         />
//                         <button
//                           onClick={() => handlePostComment(item.id)}
//                           className="bg-blue-600 text-white px-4 rounded text-sm"
//                         >
//                           Post
//                         </button>
//                       </div>

//                     </div>
//                   )}


//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  getShoutoutFeed,
  createShoutout,
  getAllUsers,
  addReaction,
  getReceivedShoutouts,
  getUserStats,
  getMyShoutouts
} from "../services/api";
import { getComments, addComment, deleteComment } from "../services/api";
import { reportShoutout } from "../services/api";


function Dashboard() {
  const [user, setUser] = useState(null);
  const [feed, setFeed] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openComments, setOpenComments] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [view, setView] = useState("feed"); // feed | received
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const showViewButtons = !department || department === "all";
  const isDepartmentSelected = department !== "";
  const isAllDepartments = department === "all";
  const [stats, setStats] = useState(null);
  const [myShoutouts, setMyShoutouts] = useState([]);

  const [toDepartment, setToDepartment] = useState("");



  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const filteredUsersByDept = toDepartment
    ? users.filter((u) => u.department === toDepartment && u.id !== user?.id)
    : [];


  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    loadData();
  }, [view]);


  
  useEffect(() => {
    if (department) {
      setView("feed");
    }
  }, [department]);



  const loadData = async () => {
    try {
      const userRes = await getCurrentUser(token);
      setUser(userRes.data);

      const myRes = await getMyShoutouts(token);
      setMyShoutouts(myRes.data.slice(0, 5));

      const statsRes = await getUserStats(token);
      setStats(statsRes.data);


      // ✅ Always fetch full feed / received
      const feedRes =
        view === "feed"
          ? await getShoutoutFeed(token)
          : await getReceivedShoutouts(token);

      setFeed(feedRes.data);

      // ✅ Get users and derive departments dynamically
      const usersRes = await getAllUsers(token);
      setUsers(usersRes.data);

      const uniqueDepartments = [
        "all",
        ...new Set(usersRes.data.map((u) => u.department)),
      ];

      setDepartments(uniqueDepartments);

    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    await createShoutout(token, {
      to_user_id: Number(toUserId),
      message,
    });
    setMessage("");
    setToUserId("");
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const react = async (shoutoutId, type, userReactionTypes) => {
    if (userReactionTypes.includes(type)) {
      alert("You already reacted");
      return;
    }
    await addReaction(token, { shoutout_id: shoutoutId, type });
    loadData();
  };

  const loadComments = async (shoutoutId, force = false) => {
    if (comments[shoutoutId] && !force) return;
    setLoadingComments((p) => ({ ...p, [shoutoutId]: true }));
    const res = await getComments(token, shoutoutId);
    setComments((p) => ({ ...p, [shoutoutId]: res.data }));
    setLoadingComments((p) => ({ ...p, [shoutoutId]: false }));
  };

  const handlePostComment = async (shoutoutId) => {
    if (!commentText[shoutoutId]?.trim()) return;
    await addComment(token, { shoutout_id: shoutoutId, content: commentText[shoutoutId] });
    setCommentText((p) => ({ ...p, [shoutoutId]: "" }));
    await loadComments(shoutoutId, true);
    loadData();
  };

  const handleDeleteComment = async (commentId, shoutoutId) => {
    await deleteComment(token, commentId);
    loadComments(shoutoutId, true);
  };

  const handleReport = async (shoutoutId) => {
    const reason = prompt("Why are you reporting this shoutout?");
    if (!reason || !reason.trim()) return;

    try {
      await reportShoutout(token, shoutoutId, reason);
      alert("✅ Shoutout reported successfully");
    } catch (err) {
      const msg = err.response?.data?.detail || "Report failed";
      alert(msg);
    }
  };


  const filteredFeed = feed.filter((item) => {
    const matchesDepartment =
      !department || department === "all"
        ? true
        : item.from_user.department === department;

    const matchesSearch =
      item.from_user.name.toLowerCase().includes(search.toLowerCase()) ||
      item.message.toLowerCase().includes(search.toLowerCase());

    return matchesDepartment && matchesSearch;
  });


  if (!user) return <p className="p-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-6 left-6 z-50 bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 font-bold"
      >
        ☰
      </button>

      <div
        className={`fixed top-0 left-0 h-full w-1/5 bg-white/95 backdrop-blur-xl shadow-xl z-40 transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 flex flex-col gap-6">

          <h2 className="text-2xl font-bold text-indigo-700">
            BragBoard
            {user?.role === "admin" && (
              <span className="ml-2 px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700">
                Admin
              </span>
            )}
          </h2>
          <button onClick={() => navigate("/profile")} className="menu-btn">👤 My Profile</button>
          <button onClick={() => navigate("/my-department")} className="menu-btn">👥 My Department</button>
          <button onClick={() => navigate("/all-departments")} className="menu-btn">🏢 All Departments</button>

          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="menu-btn text-indigo-700 font-semibold"
            >
              🛡 Admin Panel
            </button>
          )}


          <button onClick={handleLogout} className="text-red-500 font-semibold">🚪 Logout</button>
        </div>
      </div>

      <div className={`flex transition-all duration-300 ${menuOpen ? "ml-[20%]" : "ml-0"}`}>
        <div className="w-1/2 p-10">
          <h2 className="text-3xl font-bold mb-6 text-indigo-700">Create Shoutout</h2>
          <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write something nice..."
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <select
            value={toDepartment}
            onChange={(e) => {
              setToDepartment(e.target.value);
              setToUserId(""); // reset employee when department changes
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select Department</option>
            {[...new Set(users.map((u) => u.department))].map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          
          <select
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            disabled={!toDepartment}
            className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              !toDepartment
                ? "bg-gray-100 cursor-not-allowed"
                : "border border-gray-200"
            }`}
          >
            <option value="">
              {toDepartment ? "Select Employee" : "Select department first"}
            </option>

            {filteredUsersByDept.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>


          <button
            disabled={!toUserId || !message.trim()}
            className={`w-full rounded-xl py-3 font-semibold text-white transition ${
              !toUserId || !message.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Send Shoutout
          </button>
        </form>

        </div>

        <div className="w-1/2 p-10">
          <h2 className="text-3xl font-bold mb-6 text-indigo-700">Shoutouts</h2>

            {stats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4 text-center">
                  <p className="text-sm text-gray-500">Sent</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {stats.sent}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow p-4 text-center">
                  <p className="text-sm text-gray-500">Received</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.received}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow p-4 text-center">
                  <p className="text-sm text-gray-500">Reactions</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {stats.reactions}
                  </p>
                </div>
              </div>
            )}


            <input
              type="text"
              placeholder="🔍 Search by name or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                mb-4
                px-4 py-2
                rounded-xl
                border border-gray-300
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
            />

            {view === "feed" && (
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-gray-600">
                  Filter shoutouts by department
                </label>

                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-indigo-400"
                >
                  <option value="" disabled>
                    Select department
                  </option>

                  <option value="all">🌐 All Departments</option>

                  {departments
                    .filter((d) => d !== "all")
                    .map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                </select>

              </div>
            )}



            {isAllDepartments && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setView("feed")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    view === "feed"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  🌍 All Shoutouts
                </button>

                <button
                  onClick={() => setView("received")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    view === "received"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  📥 Received by Me
                </button>
              </div>
            )}


          
            
          {isDepartmentSelected && !isAllDepartments && (
            <div className="mb-4 text-sm text-gray-500">
              Showing shoutouts from{" "}
              <span className="font-semibold">{department}</span> department
            </div>
          )}



          {!isDepartmentSelected ? (
              <div className="text-center text-gray-400 mt-10">
                Please select a department to view shoutouts
              </div>
            ) : filteredFeed.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                No shoutouts found
              </div>
            ) : (
              filteredFeed.map((item) => {

            const reactions = Array.isArray(item.reactions) ? item.reactions : [];
            const userReactionTypes = reactions.filter((r) => r.user_id === user.id).map((r) => r.type);
            const count = (t) => reactions.filter((r) => r.type === t).length;

            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 mb-6">
                <p className="text-gray-800 mb-4">{item.message}</p>
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>
                    👤 {item.from_user.name} ({item.from_user.department})
                    {view === "received" && <span className="text-indigo-600"> → You</span>}
                  </span>
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <button onClick={() => react(item.id, "like", userReactionTypes)} disabled={userReactionTypes.includes("like")} className="reaction-btn text-blue-600">👍 {count("like")}</button>
                  <button onClick={() => react(item.id, "clap", userReactionTypes)} disabled={userReactionTypes.includes("clap")} className="reaction-btn text-green-600">👏 {count("clap")}</button>
                  <button onClick={() => react(item.id, "star", userReactionTypes)} disabled={userReactionTypes.includes("star")} className="reaction-btn text-yellow-500">⭐ {count("star")}</button>
                  <button onClick={() => { const o = openComments === item.id ? null : item.id; setOpenComments(o); if (o) loadComments(item.id); }} className="ml-auto text-indigo-600 font-medium">💬 {item.comment_count} Comments</button>
                  <button
                    onClick={() => handleReport(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    🚩 Report
                  </button>

                </div>

                {openComments === item.id && (
                  <div className="mt-4 space-y-3">
                    {(comments[item.id] || []).map((c) => (
                      <div key={c.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">{user.name[0]}</div>
                        <div className="bg-indigo-50 rounded-xl px-4 py-2 w-full">
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-sm">{c.content}</p>
                          {c.user_id === user.id && <button onClick={() => handleDeleteComment(c.id, item.id)} className="text-xs text-red-500">Delete</button>}
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input value={commentText[item.id] || ""} onChange={(e) => setCommentText({ ...commentText, [item.id]: e.target.value })} className="flex-1 input" placeholder="Add a comment..." />
                      <button onClick={() => handlePostComment(item.id)} className="px-4 rounded-xl bg-indigo-600 text-white">Post</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;