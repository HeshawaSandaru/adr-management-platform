import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdrService, Adr } from "../../services/adr.service";
import { useAuth } from "../../auth/AuthContext";
import TextInput from "../../components/TextInput";

export default function ADREditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [expectedBenefits, setExpectedBenefits] = useState("");
  const [actualBenefits, setActualBenefits] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [selectedDependencies, setSelectedDependencies] = useState<Adr[]>([]);
  const [dependencyInput, setDependencyInput] = useState("");
  const [dependencyOptions, setDependencyOptions] = useState<Adr[]>([]);
  const [showDependencyOptions, setShowDependencyOptions] = useState(false);
  const [alternativeAnalysis, setAlternativeAnalysis] = useState<
    {
      alternative: string;
      pros: string[];
      cons: string[];
    }[]
  >([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Shared input styling — matches ADRListPage / ADRDetailPage conventions.
  const inputClasses =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 " +
    "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
    "focus:border-transparent transition-colors";

  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  useEffect(() => {
    const query = dependencyInput.trim();

    if (!query) {
      setDependencyOptions([]);
      return;
    }

    const loadOptions = async () => {
      try {
        const res = await AdrService.getAll({
          page: 1,
          limit: 10,
          title: query,
        });
        setDependencyOptions(
          res.data.filter(
            (item) => !selectedDependencies.some((dep) => dep._id === item._id),
          ),
        );
      } catch {
        setDependencyOptions([]);
      }
    };

    const timer = window.setTimeout(loadOptions, 250);
    return () => window.clearTimeout(timer);
  }, [dependencyInput, selectedDependencies]);

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
        setSelectedDependencies(
          (data.dependencies || []).map((dep) => ({
            _id: dep._id,
            title: dep.title,
            status: dep.status,
          })) as Adr[],
        );
        setAlternativeAnalysis(
          (data.alternativeAnalysis || []).map((alt) => ({
            alternative: alt.alternative,
            pros: alt.pros || [],
            cons: alt.cons || [],
          })),
        );
        setIsAdmin(user?.role === "admin");
        setIsOwner(user?.id === data.authorId?._id);
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message || "Failed to load ADR");
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSelectDependency = (adr: Adr) => {
    if (selectedDependencies.some((dep) => dep._id === adr._id)) return;

    setSelectedDependencies((current) => [...current, adr]);
    setDependencyInput("");
    setShowDependencyOptions(false);
  };

  const removeDependency = (id: string) => {
    setSelectedDependencies((current) =>
      current.filter((item) => item._id !== id),
    );
  };
  const handleUpdate = async () => {
    if (!id) return;

    setError("");
    setSubmitting(true);

    try {
      const updatePayload: any = {
        alternativeAnalysis,
      };

      if (isOwner || isAdmin) {
        updatePayload.title = title;
        updatePayload.problemStatement = problemStatement;
        updatePayload.proposedSolution = proposedSolution;
        updatePayload.expectedBenefits = expectedBenefits || undefined;
        updatePayload.actualBenefits = actualBenefits || undefined;
        updatePayload.lessonsLearned = lessonsLearned || undefined;
        updatePayload.tags = tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }

      const currentAdr = await AdrService.getById(id);

      await AdrService.update(id, updatePayload);

      const currentDependencyIds =
        currentAdr.dependencies?.map((dep) => dep._id) ?? [];

      const newDependencyIds = selectedDependencies.map((dep) => dep._id);

      // Add new dependencies
      for (const dependencyId of newDependencyIds) {
        if (!currentDependencyIds.includes(dependencyId)) {
          await AdrService.addDependency(id, dependencyId);
        }
      }

      // Remove removed dependencies
      for (const dependencyId of currentDependencyIds) {
        if (!newDependencyIds.includes(dependencyId)) {
          await AdrService.removeDependency(id, dependencyId);
        }
      }

      navigate(`/adrs/${id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update ADR");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Edit ADR</h2>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {isOwner || isAdmin ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
          <TextInput
            id="title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextInput
            id="problem"
            label="Problem"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
          />
          <TextInput
            id="solution"
            label="Solution"
            value={proposedSolution}
            onChange={(e) => setProposedSolution(e.target.value)}
          />

          <div>
            <label htmlFor="expectedBenefits" className={labelClasses}>
              Expected Benefits
            </label>
            <textarea
              id="expectedBenefits"
              value={expectedBenefits}
              onChange={(e) => setExpectedBenefits(e.target.value)}
              rows={3}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="actualBenefits" className={labelClasses}>
              Actual Benefits
            </label>
            <textarea
              id="actualBenefits"
              value={actualBenefits}
              onChange={(e) => setActualBenefits(e.target.value)}
              rows={3}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="lessonsLearned" className={labelClasses}>
              Lessons Learned
            </label>
            <textarea
              id="lessonsLearned"
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              rows={3}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="tags" className={labelClasses}>
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Comma-separated tags"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="dependencies" className={labelClasses}>
              Dependencies
            </label>

            <div className="relative">
              <div className="flex items-center gap-2">
                <input
                  id="dependencies"
                  type="text"
                  value={dependencyInput}
                  onChange={(e) => {
                    setDependencyInput(e.target.value);
                    setShowDependencyOptions(true);
                  }}
                  onFocus={() => setShowDependencyOptions(true)}
                  placeholder="Type to search ADR titles"
                  className={inputClasses}
                />
                <button
                  type="button"
                  onClick={() => setShowDependencyOptions((value) => !value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600
                             hover:bg-gray-50 transition-colors"
                >
                  ▼
                </button>
              </div>

              {showDependencyOptions && dependencyInput.trim() && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                  {dependencyOptions.length > 0 ? (
                    dependencyOptions.map((option) => (
                      <button
                        key={option._id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectDependency(option)}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{option.title}</div>
                        <div className="text-xs text-gray-500">
                          Status: {option.status}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {dependencyInput.trim()
                        ? "No matching ADRs found"
                        : "Start typing to see ADRs"}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {selectedDependencies.map((dependency) => (
                <span
                  key={dependency._id}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700"
                >
                  {dependency.title}
                  <button
                    type="button"
                    onClick={() => removeDependency(dependency._id)}
                    className="ml-2 text-blue-900 hover:text-blue-600 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Select existing ADRs from the dropdown. Existing dependency links
              will be preserved.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          You can only add or update alternative analysis for this ADR. Other
          fields are read-only.
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Alternative Analysis</h3>

        {alternativeAnalysis.map((alt, ai) => (
          <div
            key={ai}
            className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3"
          >
            <input
              value={alt.alternative}
              onChange={(e) => {
                const copy = [...alternativeAnalysis];
                copy[ai] = { ...copy[ai], alternative: e.target.value };
                setAlternativeAnalysis(copy);
              }}
              placeholder={`Alternative ${ai + 1}`}
              className={inputClasses}
            />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-green-700">Pros</span>
                <button
                  onClick={() => {
                    const copy = [...alternativeAnalysis];
                    copy[ai].pros = [...(copy[ai].pros || []), ""];
                    setAlternativeAnalysis(copy);
                  }}
                  className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  + Add Pro
                </button>
              </div>
              {(alt.pros || []).map((p, pi) => (
                <div key={pi} className="flex gap-2 mt-1.5">
                  <input
                    value={p}
                    onChange={(e) => {
                      const copy = [...alternativeAnalysis];
                      copy[ai].pros[pi] = e.target.value;
                      setAlternativeAnalysis(copy);
                    }}
                    className={`${inputClasses} flex-1`}
                  />
                  <button
                    onClick={() => {
                      const copy = [...alternativeAnalysis];
                      copy[ai].pros.splice(pi, 1);
                      setAlternativeAnalysis(copy);
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-red-700">Cons</span>
                <button
                  onClick={() => {
                    const copy = [...alternativeAnalysis];
                    copy[ai].cons = [...(copy[ai].cons || []), ""];
                    setAlternativeAnalysis(copy);
                  }}
                  className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  + Add Con
                </button>
              </div>
              {(alt.cons || []).map((c, ci) => (
                <div key={ci} className="flex gap-2 mt-1.5">
                  <input
                    value={c}
                    onChange={(e) => {
                      const copy = [...alternativeAnalysis];
                      copy[ai].cons[ci] = e.target.value;
                      setAlternativeAnalysis(copy);
                    }}
                    className={`${inputClasses} flex-1`}
                  />
                  <button
                    onClick={() => {
                      const copy = [...alternativeAnalysis];
                      copy[ai].cons.splice(ci, 1);
                      setAlternativeAnalysis(copy);
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
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
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Remove Alternative
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() =>
            setAlternativeAnalysis([
              ...alternativeAnalysis,
              { alternative: "", pros: [], cons: [] },
            ])
          }
          className="rounded-md bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-sm font-medium
                     text-gray-700 transition-colors"
        >
          + Add Alternative
        </button>
      </div>

      <button
        onClick={handleUpdate}
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm
                   font-medium shadow-sm transition-colors disabled:opacity-50
                   disabled:cursor-not-allowed"
      >
        {submitting ? "Updating..." : "Update"}
      </button>
    </div>
  );
}