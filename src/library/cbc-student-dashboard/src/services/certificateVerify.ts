import { apiClient } from "./apiClient";

export interface CertificateVerifyResponse {
  is_valid: boolean; certificate_number?: string; student_name?: string; course_title?: string; issued_at?: string;
}

export const verifyCertificate = (number: string) =>
  apiClient.get<CertificateVerifyResponse>(`/certificates/verify/${number}/`).then((r) => r.data);
