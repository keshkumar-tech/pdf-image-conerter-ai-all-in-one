import { ResourceListPage } from "@/components/ResourceListPage";
import { certificatesApi } from "@/services/resources";
import type { Certificate } from "@/services/types";

export default function CertificatesPage() {
  return (
    <ResourceListPage<Certificate>
      title="Certificates"
      description="Every certificate issued, with public verification numbers and QR codes."
      api={certificatesApi}
      searchPlaceholder="Search by certificate number..."
      rowKey={(c) => c.id}
      emptyTitle="No certificates issued yet"
      columns={[
        { key: "certificate_number", header: "Certificate #" },
        { key: "course_title", header: "Course" },
        { key: "issued_at", header: "Issued", render: (c) => new Date(c.issued_at).toLocaleDateString() },
      ]}
    />
  );
}
