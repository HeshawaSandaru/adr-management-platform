import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdrService, Adr } from "../../services/adr.service";
import { useAuth } from "../../auth/AuthContext";

// Mirrors the backend's state machine (adrs.service.ts validateStatusTransition) —
// only these transitions are accepted server-side, so the UI only offers these.
const STATUS_TRANSITIONS: Record<string, string[]> = {
  Draft: ["Proposed"],
  Proposed: ["Accepted", "Rejected"],
  Accepted: ["Archived"],
  Rejected: ["Archived"],
  Archived: [],
};

export default function ADRDetailPage() {
  const { id } = useParams();
  const [adr, setAdr] = useState<Adr | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    AdrService.getById(id)
      .then(setAdr)
      .catch((err: any) => {
        setError(err?.response?.data?.message || "Failed to load ADR");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (loading || !adr) return <p>Loading...</p>;

  const canChangeStatus =
    user?.role === "admin" || user?.id === adr.authorId?._id;
  const nextStatuses = STATUS_TRANSITIONS[adr.status] || [];

  const handleStatusChange = async (nextStatus: string) => {
    setStatusError("");
    setChangingStatus(true);

    try {
      // The backend returns the raw (unpopulated) document here, so merge in
      // just the field that changed rather than replacing adr wholesale —
      // otherwise the already-populated authorId/dependencies would be
      // overwritten with raw ObjectIds and break their rendering below.
      const updated = await AdrService.updateStatus(adr._id, nextStatus);
      setAdr({ ...adr, status: updated.status });
    } catch (err: any) {
      setStatusError(err?.response?.data?.message || "Failed to update status");
    } finally {
      setChangingStatus(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{adr.title}</h1>

      <p><b>Status:</b> {adr.status}</p>

      {canChangeStatus && nextStatuses.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Change status:</span>
          {nextStatuses.map((next) => (
            <button
              key={next}
              onClick={() => handleStatusChange(next)}
              disabled={changingStatus}
              className="px-3 py-1 text-sm border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              {changingStatus ? "Updating..." : `Mark as ${next}`}
            </button>
          ))}
        </div>
      )}

      {statusError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {statusError}
        </div>
      )}

      <p><b>Problem:</b> {adr.problemStatement}</p>
      <p><b>Solution:</b> {adr.proposedSolution}</p>

      {adr.expectedBenefits && (
        <div>
          <p className="font-semibold">Expected Benefits</p>
          <p>{adr.expectedBenefits}</p>
        </div>
      )}

      {adr.actualBenefits && (
        <div>
          <p className="font-semibold">Actual Benefits</p>
          <p>{adr.actualBenefits}</p>
        </div>
      )}

      {adr.lessonsLearned && (
        <div>
          <p className="font-semibold">Lessons Learned</p>
          <p>{adr.lessonsLearned}</p>
        </div>
      )}

      {adr.alternativeAnalysis && adr.alternativeAnalysis.length > 0 && (
            <div>
              <h3 className="font-bold">Alternative Analysis</h3>
              <div className="space-y-3 mt-2">
                {adr.alternativeAnalysis.map((alt, i) => (
                  <div key={i} className="p-3 border rounded">
                    <p className="font-medium">{alt.alternative}</p>

                    <div className="mt-2">
                      <div className="font-semibold">Pros</div>
                      <ul className="list-disc ml-6">
                        {alt.pros?.map((p, pi) => (
                          <li key={pi}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-2">
                      <div className="font-semibold">Cons</div>
                      <ul className="list-disc ml-6">
                        {alt.cons?.map((c, ci) => (
                          <li key={ci}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

      <div>
        <p className="font-bold">Tags:</p>
        <div className="flex gap-2">
          {adr.tags?.map((t) => (
            <span key={t} className="px-2 py-1 bg-gray-200 rounded">
              {t}
            </span>
          ))}
        </div>
      </div>

      {adr.dependencies && adr.dependencies.length > 0 && (
        <div>
          <p className="font-bold">Dependencies:</p>
          <ul className="list-disc ml-6">
            {adr.dependencies.map((dep) => (
              <li key={dep._id}>
                <button
                  onClick={() => navigate(`/adrs/${dep._id}`)}
                  className="text-blue-600 hover:underline"
                >
                  {dep.title}
                </button>{" "}
                <span className="text-sm text-gray-500">({dep.status})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-sm text-gray-500 pt-2">
        <div>Created: {new Date(adr.createdAt).toLocaleString()}</div>
        {adr.updatedAt && <div>Last updated: {new Date(adr.updatedAt).toLocaleString()}</div>}
      </div>

      <button
        onClick={() => navigate(`/adrs/${adr._id}/edit`)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Edit
      </button>
    </div>
  );
}