import { ResourceListPage } from "@/components/ResourceListPage";
import { mediaAssetsApi } from "@/services/resources";
import type { MediaAsset } from "@/services/types";
import { Badge } from "@/components/Badge";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function MediaLibraryPage() {
  return (
    <ResourceListPage<MediaAsset>
      title="Media Library"
      description="Every uploaded file across the platform — images, videos, PDFs, ZIPs — with access-level controls."
      api={mediaAssetsApi}
      searchPlaceholder="Search files..."
      rowKey={(m) => m.id}
      emptyTitle="No files uploaded yet"
      actions={<button className="btn btn-primary">+ Upload</button>}
      columns={[
        { key: "file_name", header: "File" },
        { key: "file_type", header: "Type", render: (m) => <Badge tone="primary">{m.file_type}</Badge> },
        { key: "size_bytes", header: "Size", render: (m) => formatBytes(m.size_bytes) },
        { key: "access_level", header: "Access", render: (m) => <Badge tone={m.access_level === "public" ? "success" : m.access_level === "premium" ? "warning" : "danger"}>{m.access_level}</Badge> },
      ]}
    />
  );
}
