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

  if (loading) return <p className="text-gray-600">Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold">
        {isAdmin ? "Admin Dashboard" : "My Dashboard"}
      </h2>
      <p className="text-gray-600">
        {isAdmin
          ? "Overview of all ADRs and reviews across the organization."
          : "Overview of your ADRs and reviews."}
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 my-5">
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

      <h3 className="text-lg font-semibold">Recent ADRs</h3>
      {recentAdrs.length === 0 ? (
        <p className="text-gray-600">No ADRs yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={cellClass}>Title</th>
              <th className={cellClass}>Status</th>
              {isAdmin && <th className={cellClass}>Author</th>}
              <th className={cellClass}>Created</th>
            </tr>
          </thead>
          <tbody>
            {recentAdrs.map((adr) => (
              <tr key={adr.id}>
                <td className={cellClass}>{adr.title}</td>
                <td className={cellClass}>{adr.status}</td>
                {isAdmin && (
                  <td className={cellClass}>
                    {typeof adr.authorId === "object"
                      ? adr.authorId?.name || adr.authorId?.email
                      : "-"}
                  </td>
                )}
                <td className={cellClass}>
                  {new Date(adr.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-gray-300 rounded-md p-3 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

const cellClass = "border border-gray-300 p-2 text-left";
