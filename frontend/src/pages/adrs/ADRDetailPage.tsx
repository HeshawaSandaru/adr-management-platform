import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import {
  AdrService,
  Adr,
  Review,
  ReviewDecision,
  AdrStatus,
} from "../../services/adr.service";

import { useAuth } from "../../auth/AuthContext";

// Mirrors the backend's state machine (adrs.service.ts validateStatusTransition) —
// only these transitions are accepted server-side, so the UI only offers these.
const STATUS_TRANSITIONS: Record<AdrStatus, AdrStatus[]> = {
  Draft: ["Proposed"],
  Proposed: ["Accepted", "Rejected"],
  Accepted: ["Archived"],
  Rejected: ["Archived"],
  Archived: [],
};

// Matches the status badge palette used on ADRListPage.
const statusStyles: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Proposed: "bg-amber-100 text-amber-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Archived: "bg-slate-200 text-slate-600",
};

export default function ADRDetailPage() {
  const { id } = useParams();

  const [adr, setAdr] = useState<Adr | null>(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const [statusError, setStatusError] = useState("");

  const [changingStatus, setChangingStatus] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);

  const [reviewComment, setReviewComment] = useState("");

  const [reviewDecision, setReviewDecision] = useState<ReviewDecision>("approved");

  const [reviewError, setReviewError] = useState("");

  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [reviewLoading, setReviewLoading] = useState(true);

  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

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

  useEffect(() => {
    if (!id) return;

    setReviewLoading(true);

    setReviewError("");

    AdrService.getReviews(id)
      .then((items) => {
        setReviews(items);

        setHasSubmittedReview(!!items.find((item) => item.reviewerId._id === user?.id));
      })
      .catch((err: any) => {
        setReviewError(err?.response?.data?.message || "Failed to load reviews");
      })
      .finally(() => setReviewLoading(false));
  }, [id, user?.id]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (loading || !adr) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  const canChangeStatus = user?.role === "admin";
  const nextStatuses = STATUS_TRANSITIONS[adr.status] || [];

  const handleStatusChange = async (nextStatus: AdrStatus) => {
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

  const handleSubmitReview = async () => {
    if (!id) return;

    setReviewError("");

    setReviewSubmitting(true);

    try {
      const created = await AdrService.createReview(id, {
        decision: reviewDecision,
        comment: reviewComment,
      });

      setReviews((current) => [created, ...current]);

      setHasSubmittedReview(true);

      setReviewComment("");
    } catch (err: any) {
      setReviewError(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{adr.title}</h1>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                statusStyles[adr.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {adr.status}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/adrs/${adr._id}/edit`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md
                     text-sm font-medium shadow-sm transition-colors"
        >
          Edit
        </button>
      </div>

      {canChangeStatus && nextStatuses.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Change status:</span>

          {nextStatuses.map((next) => (
            <button
              key={next}
              onClick={() => handleStatusChange(next)}
              disabled={changingStatus}
              className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm font-medium
                         text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed"
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

      {/* REVIEW WORKFLOW */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Review workflow</h3>

            <p className="text-sm text-gray-500">
              Submit your decision and comment, then view the latest reviews.
            </p>
          </div>
        </div>

        {reviewLoading ? (
          <p className="text-sm text-gray-500">Loading reviews...</p>
        ) : (
          <>
            {reviewError && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {reviewError}
              </div>
            )}

            {user && user.id !== adr.authorId._id && !hasSubmittedReview && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Decision
                  </label>

                  <select
                    value={reviewDecision}
                    onChange={(e) => setReviewDecision(e.target.value as ReviewDecision)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-colors"
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="changes_requested">Request changes</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Comment
                  </label>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700
                               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                               focus:border-transparent transition-colors"
                  />
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting || !reviewComment.trim()}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2
                             text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors
                             disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit review"}
                </button>
              </div>
            )}

            {user && user.id === adr.authorId._id && (
              <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                You cannot review your own ADR.
              </div>
            )}

            {user && user.id !== adr.authorId._id && hasSubmittedReview && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                You have already submitted a review for this ADR.
              </div>
            )}

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-md border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
                      <div>
                        <span className="font-semibold text-gray-800">
                          {review.reviewerId.name || review.reviewerId.email}
                        </span>

                        <span className="ml-2">•</span>

                        <span className="ml-2 capitalize">{review.decision.replace("_", " ")}</span>
                      </div>

                      <div>{new Date(review.createdAt).toLocaleString()}</div>
                    </div>

                    <p className="mt-3 text-sm text-gray-800">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* DETAILS */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Problem</p>
          <p className="mt-1 text-gray-800">{adr.problemStatement}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Solution</p>
          <p className="mt-1 text-gray-800">{adr.proposedSolution}</p>
        </div>

        {adr.expectedBenefits && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Expected Benefits
            </p>
            <p className="mt-1 text-gray-800">{adr.expectedBenefits}</p>
          </div>
        )}

        {adr.actualBenefits && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Actual Benefits
            </p>
            <p className="mt-1 text-gray-800">{adr.actualBenefits}</p>
          </div>
        )}

        {adr.lessonsLearned && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Lessons Learned
            </p>
            <p className="mt-1 text-gray-800">{adr.lessonsLearned}</p>
          </div>
        )}
      </div>

      {adr.alternativeAnalysis && adr.alternativeAnalysis.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Alternative Analysis</h3>

          <div className="space-y-3">
            {adr.alternativeAnalysis.map((alt, i) => (
              <div key={i} className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <p className="font-medium text-gray-900">{alt.alternative}</p>

                <div className="mt-2">
                  <div className="text-sm font-semibold text-green-700">Pros</div>

                  <ul className="ml-5 list-disc text-sm text-gray-700">
                    {alt.pros?.map((p, pi) => (
                      <li key={pi}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-2">
                  <div className="text-sm font-semibold text-red-700">Cons</div>

                  <ul className="ml-5 list-disc text-sm text-gray-700">
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

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</p>

        <div className="flex flex-wrap gap-2">
          {adr.tags?.length ? (
            adr.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-medium"
              >
                {t}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">No tags</span>
          )}
        </div>
      </div>

      {adr.dependencies && adr.dependencies.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Dependencies
          </p>

          <ul className="space-y-1.5">
            {adr.dependencies.map((dep) => (
              <li key={dep._id} className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/adrs/${dep._id}`)}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                >
                  {dep.title}
                </button>

                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    statusStyles[dep.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {dep.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-sm text-gray-500 pt-2 border-t border-gray-200">
        <div>Created: {new Date(adr.createdAt).toLocaleString()}</div>

        {adr.updatedAt && <div>Last updated: {new Date(adr.updatedAt).toLocaleString()}</div>}
      </div>
    </div>
  );
}