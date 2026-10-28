/**
 * Generic CRUD service factory - one call per REST resource. Each admin
 * page imports its own typed instance (e.g. `coursesApi`), so every
 * screen has an explicit, typed API surface rather than a shared blob.
 */
import { apiClient } from "./apiClient";
import type { Paginated } from "./types";

export function createResourceApi<T, TWrite = Partial<T>>(basePath: string) {
  return {
    list: (params?: Record<string, unknown>) =>
      apiClient.get<Paginated<T>>(basePath, { params }).then((r) => r.data),
    retrieve: (id: string) => apiClient.get<T>(`${basePath}${id}/`).then((r) => r.data),
    create: (payload: TWrite) => apiClient.post<T>(basePath, payload).then((r) => r.data),
    update: (id: string, payload: TWrite) =>
      apiClient.patch<T>(`${basePath}${id}/`, payload).then((r) => r.data),
    remove: (id: string) => apiClient.delete(`${basePath}${id}/`),
    action: <R = unknown>(id: string, action: string, payload?: unknown) =>
      apiClient.post<R>(`${basePath}${id}/${action}/`, payload).then((r) => r.data),
  };
}

import type {
  AdminUser, AuditLog, Assignment, Category, Certificate, CommunityPost, Coupon,
  Course, Entitlement, IntegrationConfig, Lesson, MediaAsset, Module,
  Notification, NotificationCampaign, Order, Payment, PricingPlan, Project,
  Quiz, Report, Roadmap, Role, SupportTicket, Video, LessonResource,
} from "./types";

export const usersApi = createResourceApi<AdminUser>("/users/");
export const rolesApi = createResourceApi<Role>("/users/roles/");
export const categoriesApi = createResourceApi<Category>("/courses/categories/");
export const pricingPlansApi = createResourceApi<PricingPlan>("/courses/pricing-plans/");
export const coursesApi = createResourceApi<Course>("/courses/");
export const modulesApi = createResourceApi<Module>("/courses/modules/");
export const lessonsApi = createResourceApi<Lesson>("/courses/lessons/");
export const videosApi = createResourceApi<Video>("/videos/");
export const resourcesApi = createResourceApi<LessonResource>("/resources/");
export const quizzesApi = createResourceApi<Quiz>("/quizzes/");
export const assignmentsApi = createResourceApi<Assignment>("/assignments/");
export const projectsApi = createResourceApi<Project>("/projects/");
export const ordersApi = createResourceApi<Order>("/orders/");
export const paymentsApi = createResourceApi<Payment>("/payments/");
export const couponsApi = createResourceApi<Coupon>("/coupons/");
export const entitlementsApi = createResourceApi<Entitlement>("/entitlements/");
export const certificatesApi = createResourceApi<Certificate>("/certificates/");
export const notificationCampaignsApi = createResourceApi<NotificationCampaign>("/notifications/campaigns/");
export const communityPostsApi = createResourceApi<CommunityPost>("/community/posts/");
export const reportsApi = createResourceApi<Report>("/community/reports/");
export const roadmapsApi = createResourceApi<Roadmap>("/roadmaps/");
export const integrationConfigsApi = createResourceApi<IntegrationConfig>("/admin/integrations/");
export const mediaAssetsApi = createResourceApi<MediaAsset>("/admin/media/");
export const supportTicketsApi = createResourceApi<SupportTicket>("/support/tickets/");
export const auditLogsApi = createResourceApi<AuditLog>("/support/audit-logs/");
