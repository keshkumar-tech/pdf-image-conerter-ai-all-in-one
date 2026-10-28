import { useState } from "react";
import type { ReactNode } from "react";
import { PageHeader } from "./PageHeader";
import { DataTable, type Column } from "./DataTable";
import { useResourceList } from "@/hooks/useResource";
import type { Paginated } from "@/services/types";

/**
 * Shared list-page shell used by every "manage a resource" admin screen.
 * Each screen supplies its own title, columns, and API - the page itself
 * still has its own route + file + domain-specific configuration, this
 * only factors out the repeated table/loading/empty/error wiring.
 */
interface ResourceListPageProps<T> {
  title: string;
  description?: string;
  api: { list: (params?: Record<string, unknown>) => Promise<Paginated<T>> };
  columns: Column<T>[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  actions?: ReactNode;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
}

export function ResourceListPage<T>({
  title, description, api, columns, rowKey, emptyTitle, emptyDescription,
  actions, searchPlaceholder, onRowClick,
}: ResourceListPageProps<T>) {
  const [search, setSearch] = useState("");
  const { data, count, isLoading, error, refetch } = useResourceList(api, search ? { search } : undefined);

  return (
    <div>
      <PageHeader title={title} description={description} actions={actions} />
      {searchPlaceholder && (
        <div style={{ marginBottom: "var(--space-4)", maxWidth: 360 }}>
          <input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}
      <DataTable
        columns={columns}
        rows={data}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        rowKey={rowKey}
        onRowClick={onRowClick}
      />
      {!isLoading && !error && count > 0 && (
        <div style={{ marginTop: "var(--space-4)", fontSize: 13, color: "var(--color-muted)" }}>
          {count} total record{count === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}
