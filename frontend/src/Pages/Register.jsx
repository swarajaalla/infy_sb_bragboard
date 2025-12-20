export default function Register() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-96 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <input className="w-full p-2 border mb-3" placeholder="Name" />
        <input className="w-full p-2 border mb-3" placeholder="Email" />
        <input className="w-full p-2 border mb-3" placeholder="Department" />
        <input className="w-full p-2 border mb-3" type="password" placeholder="Password" />

        <button className="w-full bg-green-600 text-white p-2 rounded">
          Register
        </button>
      </div>
    </div>
  );
}
