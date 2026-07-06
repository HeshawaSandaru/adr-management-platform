import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdrService, Adr } from "../../services/adr.service";
import { useAuth } from "../../auth/AuthContext";
import SearchBar from "../../components/SearchBar";

export default function ADRListPage() {
  const [adrs, setAdrs] = useState<Adr[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const navigate = useNavigate();

  // Debounce raw typing so we don't re-fetch (and re-render the table) on
  // every keystroke — that was causing the search input to lose focus.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    load();
  }, [page, status, debouncedSearch]);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await AdrService.getAll({
        page,
        limit,
        status: status || undefined,
        title: debouncedSearch || undefined,
      });

      setAdrs(res.data);
      setTotal(res.total || 0);
      setPage(res.page || page);

      // 🔥 FIX: if page becomes empty (edge case), go back
      if (res.data.length === 0 && page > 1) {
        setPage((p) => p - 1);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load ADRs");
    }

    setLoading(false);
  };

  // server-driven pagination
  const hasPrevPage = page > 1;
  const hasNextPage = page * limit < (total || 0);

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <div className="w-1/3">
          <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <select
          className="border p-2 rounded"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1); // 🔥 reset page on filter change
          }}
        >
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Proposed">Proposed</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Archived">Archived</option>
        </select>

        <button
          onClick={() => navigate("/adrs/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create ADR
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* TABLE */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 py-6">
                Loading ADRs...
              </td>
            </tr>
          ) : adrs.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 py-6">
                No ADRs found
              </td>
            </tr>
          ) : (
            adrs.map((adr) => (
              <tr key={adr._id} className="border-t">
                <td>{adr.title}</td>
                <td>{adr.status}</td>
                <td>
                  {typeof adr.authorId === "object" && adr.authorId !== null
                    ? adr.authorId.name
                    : adr.authorId || "Unknown"}
                </td>
                <td className="space-x-2">
                  <button
                    onClick={() => navigate(`/adrs/${adr._id}`)}
                    className="text-blue-600"
                  >
                    View
                  </button>

                  <button
                    onClick={() => navigate(`/adrs/${adr._id}/edit`)}
                    className="text-green-600"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex gap-2 mt-4 items-center">
        <button
          disabled={!hasPrevPage}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded
             disabled:opacity-40 disabled:cursor-not-allowed
             disabled:bg-gray-200 disabled:text-gray-500"
        >
          Prev
        </button>

        <button
          disabled={!hasNextPage}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded
             disabled:opacity-40 disabled:cursor-not-allowed
             disabled:bg-gray-200 disabled:text-gray-500"
        >
          Next
        </button>
      </div>
    </div>
  );
}