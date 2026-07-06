import { InputHTMLAttributes } from "react";

export default function SearchBar(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Search ADRs..."
    />
  );
}