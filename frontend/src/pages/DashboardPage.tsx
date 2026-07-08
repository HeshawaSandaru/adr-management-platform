import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

interface DashboardStats {
  totalAdrs: number;
  draft: number;
  proposed: number;
  accepted: number;
  rejected: number;
  archived: number;
  totalReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  changesRequestedReviews: number;
}

interface RecentAdr {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  authorId?: { name: string; email: string } | string;
}

// Matches the status badge palette used across ADRListPage / ADRDetailPage.
const statusStyles: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Proposed: "bg-amber-100 text-amber-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Archived: "bg-slate-200 text-slate-600",
};

// Accent color per stat card so the grid isn't a wall of identical boxes.
const statAccents: Record<string, string> = {
  "Total ADRs": "border-t-blue-500",
  Draft: "border-t-gray-400",
  Proposed: "border-t-amber-500",
  Accepted: "border-t-green-500",
  Rejected: "border-t-red-500",
  Archived: "border-t-slate-500",
  "Total Reviews": "border-t-blue-500",
  "Approved Reviews": "border-t-green-500",
  "Rejected Reviews": "border-t-red-500",
  "Changes Requested": "border-t-amber-500",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAdrs, setRecentAdrs] = useState<RecentAdr[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          api.get("/dashboard"),
          api.get("/dashboard/recent"),
        ]);

        setStats(statsRes.data);
        setRecentAdrs(recentRes.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          {isAdmin ? "Admin Dashboard" : "My Dashboard"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isAdmin
            ? "Overview of all ADRs and reviews across the organization."
            : "Overview of your ADRs and reviews."}
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        <StatCard label="Total ADRs" value={stats.totalAdrs} />
        <StatCard label="Draft" value={stats.draft} />
        <StatCard label="Proposed" value={stats.proposed} />
        <StatCard label="Accepted" value={stats.accepted} />
        <StatCard label="Rejected" value={stats.rejected} />
        <StatCard label="Archived" value={stats.archived} />
        <StatCard label="Total Reviews" value={stats.totalReviews} />
        <StatCard label="Approved Reviews" value={stats.approvedReviews} />
        <StatCard label="Rejected Reviews" value={stats.rejectedReviews} />
        <StatCard
          label="Changes Requested"
          value={stats.changesRequestedReviews}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent ADRs</h3>
        </div>

        {recentAdrs.length === 0 ? (
          <p className="text-sm text-gray-500 px-4 py-6 text-center">
            No ADRs yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="bg-gray-50 border-b border-gray-200 text-left text-xs
                           font-semibold uppercase tracking-wide text-gray-500"
              >
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                {isAdmin && <th className="px-4 py-3">Author</th>}
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentAdrs.map((adr) => (
                <tr key={adr.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {adr.title}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusStyles[adr.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {adr.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-gray-700">
                      {typeof adr.authorId === "object"
                        ? adr.authorId?.name || adr.authorId?.email
                        : "-"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(adr.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className={`bg-white border border-gray-200 border-t-4 ${
        statAccents[label] || "border-t-gray-300"
      } rounded-lg shadow-sm p-4 text-center transition-shadow hover:shadow-md`}
    >
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}