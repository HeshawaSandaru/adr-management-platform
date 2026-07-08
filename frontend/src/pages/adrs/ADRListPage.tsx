import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AdrService, Adr, AdrStatus } from "../../services/adr.service";
import { useAuth } from "../../auth/AuthContext";
import SearchBar from "../../components/SearchBar";

const statusStyles: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Proposed: "bg-amber-100 text-amber-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Archived: "bg-slate-200 text-slate-600",
};

export default function ADRListPage() {
  const [adrs, setAdrs] = useState<Adr[]>([]);
  const [loading, setLoading] = useState(true);

  // Frontend-only filters
  const [authorFilter, setAuthorFilter] = useState("");
  const [reviewerFilter, setReviewerFilter] = useState("");
  const [tags, setTags] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState<AdrStatus | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState("");

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  const inputClasses =
    "border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
    "transition-colors";

  // Debounce search input
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(handle);
  }, [search]);

  // Load all ADRs (no pagination)
  useEffect(() => {
    load();
  }, [status, tags, fromDate, toDate, debouncedSearch]);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await AdrService.getAll({
        status: status || undefined,
        title: debouncedSearch || undefined,
        tags: tags || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
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
            : "Unknown"
        )
      : [];

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Build dropdown options from loaded data
  const authorOptions = useMemo(() => {
    const names = new Set<string>();
    adrs.forEach((adr) => names.add(getAuthorLabel(adr)));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [adrs]);

  const reviewerOptions = useMemo(() => {
    const names = new Set<string>();
    adrs.forEach((adr) => getReviewerLabels(adr).forEach((n) => names.add(n)));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [adrs]);

  // Frontend filtering
  const filteredAdrs = useMemo(() => {
    const authorQuery = authorFilter.trim().toLowerCase();
    const reviewerQuery = reviewerFilter.trim().toLowerCase();

    return adrs.filter((adr) => {
      if (
        authorQuery &&
        !getAuthorLabel(adr).toLowerCase().includes(authorQuery)
      ) {
        return false;
      }
      if (
        reviewerQuery &&
        !getReviewerLabels(adr).some((name) =>
          name.toLowerCase().includes(reviewerQuery)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [adrs, authorFilter, reviewerFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Architecture Decision Records
        </h1>
        <button
          onClick={() => navigate("/adrs/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md
                     text-sm font-medium shadow-sm transition-colors"
        >
          + Create ADR
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-full sm:w-64">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className={inputClasses}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as AdrStatus | "");
            }}
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Proposed">Proposed</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Author Filter */}
          <input
            className={`${inputClasses} w-40`}
            placeholder="Search author..."
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            list="author-options"
          />

          {/* Reviewer Filter */}
          <input
            className={`${inputClasses} w-40`}
            placeholder="Search reviewer..."
            value={reviewerFilter}
            onChange={(e) => setReviewerFilter(e.target.value)}
            list="reviewer-options"
          />
          
          {/* Tags Filter */}
          <input
            className={`${inputClasses} w-44`}
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => {
              setTags(e.target.value);
            }}
          />

          {/* From Date */}
          <input
            type="date"
            className={inputClasses}
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
            }}
          />

          {/* To Date */}
          <input
            type="date"
            className={inputClasses}
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
            }}
          />

          {(authorFilter || reviewerFilter) && (
            <button
              onClick={() => {
                setAuthorFilter("");
                setReviewerFilter("");
              }}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-500
                         hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Clear author/reviewer
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs
                           font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Reviewer</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-8">
                  Loading ADRs...
                </td>
              </tr>
            ) : filteredAdrs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-8">
                  No ADRs found
                </td>
              </tr>
            ) : (
              filteredAdrs.map((adr) => (
                <tr key={adr._id} className="hover:bg-gray-50 transition-colors">
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
                  <td className="px-4 py-3 text-gray-700">{getAuthorLabel(adr)}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {getReviewerLabels(adr).length ? (
                      getReviewerLabels(adr).map((name, i) => (
                        <div key={i}>{name}</div>
                      ))
                    ) : (
                      <span className="text-gray-400">No reviewers</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {formatDate(adr.createdAt)}
                  </td>
                  <td className="px-4 py-3 space-x-3 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/adrs/${adr._id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      View
                    </button>

                    <button
                      onClick={() => navigate(`/adrs/${adr._id}/edit`)}
                      className="text-green-600 hover:text-green-800 font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Show total count */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredAdrs.length} ADRs
      </div>
    </div>
  );
}