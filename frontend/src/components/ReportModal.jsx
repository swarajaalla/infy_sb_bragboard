import { useState } from "react";
import api from "../api/axios";

export default function ReportModal({ shoutoutId, onClose, onReportSuccess }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reasons = [
    "Inappropriate content",
    "Spam",
    "Offensive language",
    "Off-topic",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError("Please provide a reason with at least 5 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(`/shoutouts/${shoutoutId}/report?reason=${encodeURIComponent(reason)}`);
      onReportSuccess && onReportSuccess();
      onClose();
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to report shout-out");
      }
      console.error("Error reporting:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Report Shout-Out</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Reason for reporting
            </label>
            <div className="space-y-2 mb-3">
              {reasons.map((reasonOption) => (
                <label key={reasonOption} className="flex items-center">
                  <input
                    type="radio"
                    name="reason-preset"
                    value={reasonOption}
                    onChange={() => setReason(reasonOption)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{reasonOption}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Additional details
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide more details about why you're reporting this..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="4"
              maxLength="500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || reason.trim().length < 5}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition font-medium"
            >
              {loading ? "Submitting..." : "Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
