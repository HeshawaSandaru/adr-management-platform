import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AdrService, Adr, AdrStatus } from "../../services/adr.service";
import { useAuth } from "../../auth/AuthContext";
import SearchBar from "../../components/SearchBar";

const statusStyles: Record<string, { badge: string; dot: string }> = {
  Draft: { badge: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  Proposed: { badge: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  Accepted: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  Rejected: { badge: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
  Archived: { badge: "bg-gray-100 text-gray-500 ring-gray-200", dot: "bg-gray-400" },
};

export default function ADRListPage() {
  const [adrs, setAdrs] = useState<Adr[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState<AdrStatus | "">("");
  const [error, setError] = useState("");

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  const inputClasses =
    "border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 " +
    "bg-white shadow-sm hover:border-gray-300 " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 " +
    "transition-all duration-150";

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    load();
  }, [status, fromDate, toDate]);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await AdrService.getAll({
        status: status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page: 1,
        limit: 100,
      });

      setAdrs(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load ADRs");
    }

    setLoading(false);
  };

  const getAuthorLabel = (adr: Adr) =>
    typeof adr.authorId === "object" && adr.authorId !== null
      ? adr.authorId.name || adr.authorId.email || "Unknown"
      : (adr.authorId as unknown as string) || "Unknown";

  const getReviewerLabels = (adr: Adr): string[] =>
    adr.reviews?.length
      ? adr.reviews.map((review) =>
          typeof review.reviewerId === "object" && review.reviewerId !== null
            ? review.reviewerId.name || review.reviewerId.email || "Unknown"
            : "Unknown",
        )
      : [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const filteredAdrs = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return adrs;

    return adrs.filter((adr) => {
      const titleMatch = adr.title?.toLowerCase().includes(query);
      const authorMatch = getAuthorLabel(adr).toLowerCase().includes(query);
      const reviewerMatch = getReviewerLabels(adr).some((name) =>
        name.toLowerCase().includes(query),
      );
      const tagsMatch = (adr.tags || []).some((tag) =>
        tag.toLowerCase().includes(query),
      );

      return titleMatch || authorMatch || reviewerMatch || tagsMatch;
    });
  }, [adrs, debouncedSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Architecture Decision Records
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {adrs.length} total &middot; {filteredAdrs.length} shown
            </p>
          </div>
          <button
            onClick={() => navigate("/adrs/create")}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500
                       active:bg-indigo-700 text-white px-4 py-2.5 rounded-lg
                       text-sm font-medium shadow-sm shadow-indigo-600/20
                       transition-all duration-150 hover:shadow-md hover:shadow-indigo-600/30
                       hover:-translate-y-px"
          >
            <span className="text-base leading-none">+</span>
            New ADR
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl
                        shadow-sm shadow-gray-200/50 p-4 mb-6 sticky top-4 z-10">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="w-full sm:w-80">
              <SearchBar
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author, reviewer, or tag..."
              />
            </div>

            <select
              className={`${inputClasses} cursor-pointer`}
              value={status}
              onChange={(e) => setStatus(e.target.value as AdrStatus | "")}
            >
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Proposed">Proposed</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Archived">Archived</option>
            </select>

            <input
              type="date"
              className={inputClasses}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <span className="text-gray-300 text-sm">to</span>

            <input
              type="date"
              className={inputClasses}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500
                           hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50
                          px-4 py-3 text-sm text-rose-700 mb-4 shadow-sm">
            <span className="text-rose-400">⚠</span>
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm shadow-gray-200/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-left text-xs
                             font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Author</th>
                <th className="px-5 py-3.5">Reviewer</th>
                <th className="px-5 py-3.5">Tags</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3.5 bg-gray-100 rounded-full w-full max-w-[8rem]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredAdrs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">📭</span>
                      <p className="text-gray-500 font-medium">No ADRs found</p>
                      <p className="text-gray-400 text-xs">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdrs.map((adr) => {
                  const style = statusStyles[adr.status] || statusStyles.Draft;
                  const reviewers = getReviewerLabels(adr);

                  return (
                    <tr
                      key={adr._id}
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
                      <td className="px-5 py-4 text-gray-700">
                        {reviewers.length ? (
                          <div className="flex flex-col gap-0.5">
                            {reviewers.map((name, i) => (
                              <span key={i}>{name}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-300">No reviewers</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {adr.tags?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {adr.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs
                                           font-medium text-indigo-600 ring-1 ring-inset ring-indigo-100"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                        {formatDate(adr.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={() => navigate(`/adrs/${adr._id}`)}
                            className="px-2.5 py-1.5 rounded-md text-indigo-600 hover:bg-indigo-100
                                       font-medium transition-colors duration-150"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/adrs/${adr._id}/edit`)}
                            className="px-2.5 py-1.5 rounded-md text-emerald-600 hover:bg-emerald-100
                                       font-medium transition-colors duration-150"
                          >
                            Edit
                          </button>
                        </div>
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