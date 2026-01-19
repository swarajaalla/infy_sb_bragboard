import Navbar from "../components/Navbar";
import Leaderboard from "../components/leaderboard/Leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <Navbar />

      <main className="max-w-5xl mx-auto p-8 space-y-6">
        <h1 className="text-2xl font-semibold">
          Company Leaderboard
        </h1>

        <Leaderboard />
      </main>
    </div>
  );
}
