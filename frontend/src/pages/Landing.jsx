// import { useNavigate } from "react-router-dom";

// function Landing() {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      
//       {/* Navbar */}
//       <div className="flex justify-between items-center px-10 py-6">
//         <h1 className="text-2xl font-bold text-indigo-400">
//           BragBoard
//         </h1>

//         <button
//           onClick={() => navigate("/login")}
//           className="text-sm font-medium hover:text-indigo-400"
//         >
//           Sign in
//         </button>
//       </div>

//       {/* Hero Section */}
//       <div className="max-w-6xl mx-auto px-10 mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
//         {/* Left content */}
//         <div>
//           <h2 className="text-4xl md:text-5xl font-bold leading-tight">
//             A New Way to <br /> Celebrate Wins
//           </h2>

//           <p className="mt-6 text-gray-300 text-lg">
//             BragBoard helps teams recognize achievements, appreciate peers,
//             and build a culture of appreciation.
//           </p>

//         <button
//             onClick={() => navigate("/register")}
//             className="mt-8 px-6 py-3 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-700 transition"
//         >
//         Create Account →
//         </button>

//         </div>

//         {/* Right illustration placeholder */}
//         <div className="hidden md:block">
//           <div className="bg-white/10 rounded-2xl p-10 shadow-xl">
//             <p className="text-gray-300 text-sm">
//               ✨ Shoutouts • 👏 Reactions • 👥 Departments
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Landing;


import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">

      {/* Navbar */}
      <div className="max-w-6xl mx-auto flex justify-between items-center px-10 py-6">
        <h1 className="text-2xl font-bold text-indigo-700">
          BragBoard
        </h1>

        <button
          onClick={() => navigate("/login")}
          className="text-sm font-medium text-gray-600 hover:text-indigo-600"
        >
          Sign in
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-10 mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-800">
            A New Way to <br /> Celebrate Wins
          </h2>

          <p className="mt-6 text-gray-600 text-lg">
            BragBoard helps teams recognize achievements, appreciate peers,
            and build a culture of appreciation.
          </p>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Create Account →
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Right Feature Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Why BragBoard?
          </h3>

          <ul className="space-y-3 text-gray-600">
            <li>✨ Shoutouts for achievements</li>
            <li>👏 Reactions to appreciate peers</li>
            <li>👥 Department-wise recognition</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Landing;
