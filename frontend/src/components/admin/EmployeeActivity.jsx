// src/components/admin/EmployeeActivity.jsx
import { useState } from "react";
import ShoutoutSection from "../dashboard/ShoutoutSection";

export default function EmployeeActivity({
  employee,
  shoutouts,
  comments,
}) {
  const [tab, setTab] = useState("shoutouts");

  if (!employee) {
    return (
      <div className="text-sm text-gray-500">
        Select an employee to inspect activity
      </div>
    );
  }

  // ---- SHOUTOUT FILTERING ----
  const posted = shoutouts.filter(
    (s) => s.sender?.id === employee.id
  );

  const received = shoutouts.filter((s) =>
    s.recipients?.some((r) => r.id === employee.id)
  );

  // ---- COMMENT FILTERING ----
  const commentsMade = comments.filter(
    (c) => c.user.id === employee.id
  );

  const commentsReceived = comments.filter((c) =>
    c.recipients?.some((r) => r.id === employee.id)
  );

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {["shoutouts", "comments"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded text-sm ${
              tab === t
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {t === "shoutouts" ? "Shoutouts" : "Comments"}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "shoutouts" ? (
        <div className="space-y-6">
          <ShoutoutSection
            title="Posted by Employee"
            shoutouts={posted}
            type="sent"
            currentUser={{ role: "admin" }}
          />

          <ShoutoutSection
            title="Received by Employee"
            shoutouts={received}
            type="received"
            currentUser={{ role: "admin" }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-sm mb-2">
              Comments Made
            </p>
            {commentsMade.length === 0 && (
              <p className="text-xs text-gray-400">
                No comments made
              </p>
            )}
            {commentsMade.map((c) => (
              <div
                key={c.id}
                className="text-sm bg-white border rounded p-2 mb-2"
              >
                {c.content}
              </div>
            ))}
          </div>

          <div>
            <p className="font-semibold text-sm mb-2">
              Comments Received
            </p>
            {commentsReceived.length === 0 && (
              <p className="text-xs text-gray-400">
                No comments received
              </p>
            )}
            {commentsReceived.map((c) => (
              <div
                key={c.id}
                className="text-sm bg-white border rounded p-2 mb-2"
              >
                {c.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
