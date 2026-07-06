import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import {
  AdrService,
  Adr,
  Review,
  ReviewDecision,
} from "../../services/adr.service";

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
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (loading || !adr) return <p>Loading...</p>;

  const canChangeStatus = user?.role === "admin";
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{adr.title}</h1>

      <p>
        <b>Status:</b> {adr.status}
      </p>

      {canChangeStatus && nextStatuses.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Change status:</span>

          {nextStatuses.map((next) => (
            <button
              key={next}
              onClick={() => handleStatusChange(next)}
              disabled={changingStatus}
              className="rounded border border-gray-300 bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 disabled:opacity-50"
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

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Review workflow</h3>

            <p className="text-sm text-gray-600">
              Submit your decision and comment, then view the latest reviews.
            </p>
          </div>
        </div>

        {reviewLoading ? (
          <p className="text-sm text-gray-600">Loading reviews...</p>
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting || !reviewComment.trim()}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600"
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
                <p className="text-sm text-gray-600">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="rounded-md border border-gray-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">
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

      <p>
        <b>Problem:</b> {adr.problemStatement}
      </p>

      <p>
        <b>Solution:</b> {adr.proposedSolution}
      </p>

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

          <div className="mt-2 space-y-3">
            {adr.alternativeAnalysis.map((alt, i) => (
              <div key={i} className="rounded border p-3">
                <p className="font-medium">{alt.alternative}</p>

                <div className="mt-2">
                  <div className="font-semibold">Pros</div>

                  <ul className="ml-6 list-disc">
                    {alt.pros?.map((p, pi) => (
                      <li key={pi}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-2">
                  <div className="font-semibold">Cons</div>

                  <ul className="ml-6 list-disc">
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
            <span key={t} className="rounded bg-gray-200 px-2 py-1">
              {t}
            </span>
          ))}
        </div>
      </div>

      {adr.dependencies && adr.dependencies.length > 0 && (
        <div>
          <p className="font-bold">Dependencies:</p>

          <ul className="ml-6 list-disc">
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

      <div className="pt-2 text-sm text-gray-500">
        <div>Created: {new Date(adr.createdAt).toLocaleString()}</div>

        {adr.updatedAt && <div>Last updated: {new Date(adr.updatedAt).toLocaleString()}</div>}
      </div>

      <button
        onClick={() => navigate(`/adrs/${adr._id}/edit`)}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Edit
      </button>
    </div>
  );
}