export interface NavItem {
  label: string;
  path: string;
  permission?: string;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/dashboard" }],
  },
  {
    label: "User Management",
    items: [
      { label: "Users", path: "/users" },
      { label: "Roles & Permissions", path: "/users/roles" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "PDF Manager", path: "/courses/pdf-manager" },
      { label: "Source Code Manager", path: "/courses/source-code-manager" },
      { label: "Template Manager", path: "/courses/template-manager" },
      { label: "Handwritten Notes", path: "/content/handwritten-notes" },
      { label: "Imp Questions", path: "/content/imp-questions" },
    ],
  },
  {
    label: "Video",
    items: [
      { label: "Video Library", path: "/video/library" },
      { label: "Video Protection / CDN", path: "/video/cdn" },
    ],
  },
  {
    label: "Learning",
    items: [
      { label: "Quizzes", path: "/learning/quizzes" },
      { label: "Assignments", path: "/learning/assignments" },
      { label: "Projects", path: "/learning/projects" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", path: "/commerce/orders" },
      { label: "Payments", path: "/commerce/payments" },
      { label: "Payment Gateway", path: "/commerce/payment-gateway" },
      { label: "Entitlements", path: "/commerce/entitlements" },
      { label: "Coupons", path: "/commerce/coupons" },
      { label: "Pricing Plans", path: "/commerce/pricing-plans" },
    ],
  },
  {
    label: "Certificates",
    items: [{ label: "Certificates", path: "/certificates" }],
  },
  {
    label: "Communication",
    items: [
      { label: "Notifications", path: "/communication/notifications" },
      { label: "Firebase", path: "/communication/firebase" },
      { label: "Community Moderation", path: "/communication/community-moderation" },
    ],
  },
  {
    label: "Roadmap",
    items: [{ label: "Roadmaps", path: "/roadmaps" }],
  },
  {
    label: "Analytics",
    items: [
      { label: "Analytics Overview", path: "/analytics/overview" },
      { label: "Learning Analytics", path: "/analytics/learning" },
      { label: "Sales Funnel", path: "/analytics/sales-funnel" },
      { label: "Product Analytics", path: "/analytics/product" },
    ],
  },
  {
    label: "Media",
    items: [
      { label: "Media Library", path: "/media/library" },
      { label: "Cloud Storage", path: "/media/cloud-storage" },
    ],
  },
  {
    label: "AI",
    items: [{ label: "AI Mentor", path: "/ai/mentor" }],
  },
  {
    label: "Operations",
    items: [
      { label: "Support Tickets", path: "/operations/support-tickets" },
      { label: "Audit Logs", path: "/operations/audit-logs" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "API Settings", path: "/configuration/api-settings" },
      { label: "Security Settings", path: "/configuration/security" },
      { label: "General Settings", path: "/configuration/general" },
      { label: "Branding", path: "/configuration/branding" },
      { label: "Email / SMS", path: "/configuration/email-sms" },
      { label: "App Configuration", path: "/configuration/app-config" },
      { label: "Maintenance", path: "/configuration/maintenance" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Admin Profile", path: "/account/profile" },
      { label: "Global Search", path: "/account/search" },
      { label: "Activity Center", path: "/account/activity" },
    ],
  },
];
