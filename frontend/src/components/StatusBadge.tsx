export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700",
    Proposed: "bg-blue-100 text-blue-700",
    Accepted: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Archived: "bg-purple-100 text-purple-700",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${map[status] || ""}`}>
      {status}
    </span>
  );
}