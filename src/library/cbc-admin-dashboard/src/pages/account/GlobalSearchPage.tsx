import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/StatusStates";
import { coursesApi, usersApi, ordersApi } from "@/services/resources";
import { DataTable } from "@/components/DataTable";

interface SearchResult { type: string; id: string; label: string; }

export default function GlobalSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = async () => {
    if (!query.trim()) { setResults([]); return; }
    setIsSearching(true);
    const [courses, users, orders] = await Promise.all([
      coursesApi.list({ search: query }),
      usersApi.list({ search: query }),
      ordersApi.list({ search: query }),
    ]);
    setResults([
      ...courses.results.map((c) => ({ type: "Course", id: c.id, label: c.title })),
      ...users.results.map((u) => ({ type: "User", id: u.id, label: u.email })),
      ...orders.results.map((o) => ({ type: "Order", id: o.id, label: o.id.slice(0, 8) })),
    ]);
    setIsSearching(false);
  };

  return (
    <div>
      <PageHeader title="Global Search" description="Search across users, courses and orders." />
      <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-5)", maxWidth: 480 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Search users, courses, orders..."
        />
        <button className="btn btn-primary" onClick={runSearch} disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>
      {results.length === 0 ? (
        <EmptyState title="Start typing to search" description="Results span Users, Courses and Orders." />
      ) : (
        <DataTable
          rowKey={(r: SearchResult) => `${r.type}-${r.id}`}
          columns={[{ key: "type", header: "Type" }, { key: "label", header: "Match" }]}
          rows={results}
        />
      )}
    </div>
  );
}
