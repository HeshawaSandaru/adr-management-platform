import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  reviews?: { reviewerId?: { name: string; email: string } | string }[];
  tags?: string[];
}

const statusStyles: Record<string, { badge: string; dot: string }> = {
  Draft: { badge: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  Proposed: { badge: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  Accepted: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  Rejected: { badge: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
  Archived: { badge: "bg-gray-100 text-gray-500 ring-gray-200", dot: "bg-gray-400" },
};

const statAccents: Record<string, string> = {
  "Total ADRs": "border-t-blue-500",
  Draft: "border-t-gray-400",
  Proposed: "border-t-amber-500",
  Accepted: "border-t-green-500",
  Rejected: "border-t-red-500",
  Archived: "border-t-slate-500",
};

const statusColors: Record<string, string> = {
  Draft: "#94a3b8",     // slate-400
  Proposed: "#fbbf24",  // amber-400
  Accepted: "#6ee7b7",  // emerald-300
  Rejected: "#fb7185",  // rose-400
  Archived: "#9ca3af",  // gray-400
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

  const getAuthorLabel = (adr: RecentAdr) =>
    typeof adr.authorId === "object" && adr.authorId !== null
      ? adr.authorId.name || adr.authorId.email || "Unknown"
      : (adr.authorId as unknown as string) || "Unknown";

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  const statusData = [
    { name: "Draft", value: stats.draft },
    { name: "Proposed", value: stats.proposed },
    { name: "Accepted", value: stats.accepted },
    { name: "Rejected", value: stats.rejected },
    { name: "Archived", value: stats.archived },
  ].filter((entry) => entry.value > 0);

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
      </div>

      {/* CHART + TABLE SIDE BY SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-6 items-stretch">
        {/* STATUS PIE CHART */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm shadow-gray-200/50 p-5 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            ADR Status Breakdown
          </h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">
              No ADRs to display yet
            </p>
          ) : (
            <div className="flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={statusColors[entry.name] || "#9ca3af"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value ?? 0}`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* RECENT ADRS TABLE */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm shadow-gray-200/50 overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent ADRs</h3>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-left text-xs
                             font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">Status</th>
                {isAdmin && <th className="px-5 py-3.5">Author</th>}
                <th className="px-5 py-3.5">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {recentAdrs.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">📭</span>
                      <p className="text-gray-500 font-medium">No ADRs found</p>
                      <p className="text-gray-400 text-xs">
                        Recent ADRs will show up here once created
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentAdrs.map((adr) => {
                  const style = statusStyles[adr.status] || statusStyles.Draft;

                  return (
                    <tr
                      key={adr.id}
                      className="group hover:bg-indigo-50/30 transition-colors duration-150"
                    >
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {adr.title}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                      text-xs font-medium ring-1 ring-inset ${style.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {adr.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600
                                            text-[10px] font-semibold flex items-center justify-center
                                            shrink-0">
                              {initials(getAuthorLabel(adr))}
                            </div>
                            <span className="text-gray-700">{getAuthorLabel(adr)}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                        {formatDate(adr.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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