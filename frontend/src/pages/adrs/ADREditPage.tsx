import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdrService } from "../../services/adr.service";
import TextInput from "../../components/TextInput";

export default function ADREditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [expectedBenefits, setExpectedBenefits] = useState("");
  const [actualBenefits, setActualBenefits] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [dependenciesText, setDependenciesText] = useState("");
  const [alternativeAnalysis, setAlternativeAnalysis] = useState<{
    alternative: string;
    pros: string[];
    cons: string[];
  }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    AdrService.getById(id)
      .then((data) => {
        setTitle(data.title);
        setProblemStatement(data.problemStatement);
        setProposedSolution(data.proposedSolution);
        setExpectedBenefits(data.expectedBenefits || "");
        setActualBenefits(data.actualBenefits || "");
        setLessonsLearned(data.lessonsLearned || "");
        setTagsText((data.tags || []).join(", "));
        setDependenciesText((data.dependencies || []).map((dep) => dep._id).join(", "));
        setAlternativeAnalysis(
          (data.alternativeAnalysis || []).map((alt) => ({
            alternative: alt.alternative,
            pros: alt.pros || [],
            cons: alt.cons || [],
          }))
        );
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message || "Failed to load ADR");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;

    setError("");
    setSubmitting(true);

    try {
      await AdrService.update(id, {
        title,
        problemStatement,
        proposedSolution,
        expectedBenefits: expectedBenefits || undefined,
        actualBenefits: actualBenefits || undefined,
        lessonsLearned: lessonsLearned || undefined,
        tags: tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        dependencies: dependenciesText
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
        alternativeAnalysis: alternativeAnalysis.length ? alternativeAnalysis : undefined,
      });

      navigate(`/adrs/${id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update ADR");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Edit ADR</h2>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <TextInput id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextInput id="problem" label="Problem" value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} />
      <TextInput id="solution" label="Solution" value={proposedSolution} onChange={(e) => setProposedSolution(e.target.value)} />

      <div>
        <label htmlFor="expectedBenefits" className="block text-sm font-medium text-gray-700 mb-1">
          Expected Benefits
        </label>
        <textarea
          id="expectedBenefits"
          value={expectedBenefits}
          onChange={(e) => setExpectedBenefits(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="actualBenefits" className="block text-sm font-medium text-gray-700 mb-1">
          Actual Benefits
        </label>
        <textarea
          id="actualBenefits"
          value={actualBenefits}
          onChange={(e) => setActualBenefits(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="lessonsLearned" className="block text-sm font-medium text-gray-700 mb-1">
          Lessons Learned
        </label>
        <textarea
          id="lessonsLearned"
          value={lessonsLearned}
          onChange={(e) => setLessonsLearned(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <input
          id="tags"
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="Comma-separated tags"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="dependencies" className="block text-sm font-medium text-gray-700 mb-1">
          Dependencies
        </label>
        <input
          id="dependencies"
          type="text"
          value={dependenciesText}
          onChange={(e) => setDependenciesText(e.target.value)}
          placeholder="Comma-separated ADR IDs"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use ADR IDs separated by commas. Existing dependency IDs will be preserved.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Alternative Analysis</h3>
        {alternativeAnalysis.map((alt, ai) => (
          <div key={ai} className="p-3 border rounded space-y-2">
            <input
              value={alt.alternative}
              onChange={(e) => {
                const copy = [...alternativeAnalysis];
                copy[ai] = { ...copy[ai], alternative: e.target.value };
                setAlternativeAnalysis(copy);
              }}
              placeholder={`Alternative ${ai + 1}`}
              className="w-full border px-2 py-1 rounded"
            />

            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Pros</span>
                <button
                  onClick={() => {
                    const copy = [...alternativeAnalysis];
                    copy[ai].pros = [...(copy[ai].pros || []), ""];
                    setAlternativeAnalysis(copy);
                  }}
                  className="text-sm text-green-600"
                >
                  + Add Pro
                </button>
              </div>
              {(alt.pros || []).map((p, pi) => (
                <div key={pi} className="flex gap-2 mt-1">
                  <input
                    value={p}
                    onChange={(e) => {
                      const copy = [...alternativeAnalysis];
                      copy[ai].pros[pi] = e.target.value;
                      setAlternativeAnalysis(copy);
                    }}
                    className="flex-1 border px-2 py-1 rounded"
                  />
                  <button
                    onClick={() => {
                      const copy = [...alternativeAnalysis];
                      copy[ai].pros.splice(pi, 1);
                      setAlternativeAnalysis(copy);
                    }}
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Cons</span>
                <button
                  onClick={() => {
                    const copy = [...alternativeAnalysis];
                    copy[ai].cons = [...(copy[ai].cons || []), ""];
                    setAlternativeAnalysis(copy);
                  }}
                  className="text-sm text-green-600"
                >
                  + Add Con
                </button>
              </div>
              {(alt.cons || []).map((c, ci) => (
                <div key={ci} className="flex gap-2 mt-1">
                  <input
                    value={c}
                    onChange={(e) => {
                      const copy = [...alternativeAnalysis];
                      copy[ai].cons[ci] = e.target.value;
                      setAlternativeAnalysis(copy);
                    }}
                    className="flex-1 border px-2 py-1 rounded"
                  />
                  <button
                    onClick={() => {
                      const copy = [...alternativeAnalysis];
                      copy[ai].cons.splice(ci, 1);
                      setAlternativeAnalysis(copy);
                    }}
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  const copy = [...alternativeAnalysis];
                  copy.splice(ai, 1);
                  setAlternativeAnalysis(copy);
                }}
                className="text-red-600 text-sm"
              >
                Remove Alternative
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setAlternativeAnalysis([...alternativeAnalysis, { alternative: "", pros: [], cons: [] }])}
          className="px-3 py-1 bg-gray-100 rounded text-sm"
        >
          + Add Alternative
        </button>
      </div>

      <button
        onClick={handleUpdate}
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {submitting ? "Updating..." : "Update"}
      </button>
    </div>
  );
}