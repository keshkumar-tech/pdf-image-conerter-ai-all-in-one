import { ResourceListPage } from "@/components/ResourceListPage";
import { videosApi } from "@/services/resources";
import type { Video } from "@/services/types";
import { Badge } from "@/components/Badge";

export default function VideoLibraryPage() {
  return (
    <ResourceListPage<Video>
      title="Video Library"
      description="Every video asset across the platform, its CDN provider and protection status."
      api={videosApi}
      rowKey={(v) => v.id}
      emptyTitle="No videos uploaded yet"
      columns={[
        {
          key: "provider",
          header: "Source",
          render: (v) => {
            if (v.provider === "youtube" || v.youtube_url) return <Badge tone="danger">▶️ YouTube</Badge>;
            if (v.provider === "self" || v.video_file) return <Badge tone="success">📤 Own Upload</Badge>;
            return v.provider || "Unconfigured";
          },
        },
        {
          key: "playback",
          header: "Playback",
          render: (v) => {
            const url = v.playback_url || v.youtube_url;
            if (!url) return <span style={{ color: "var(--color-muted)" }}>—</span>;
            const label = v.provider === "youtube" || v.youtube_url ? "Open YouTube" : "Media file";
            return <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--color-primary)" }}>{label} ↗</a>;
          },
        },
        { key: "duration_seconds", header: "Duration", render: (v) => `${Math.round(v.duration_seconds / 60)} min` },
        { key: "is_protected", header: "Protection", render: (v) => v.is_protected ? <Badge tone="success">Signed URL</Badge> : <Badge tone="danger">Unprotected</Badge> },
      ]}
    />
  );
}
