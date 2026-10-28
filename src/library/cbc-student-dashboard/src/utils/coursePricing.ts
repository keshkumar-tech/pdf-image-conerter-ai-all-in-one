import type { Course } from "@/services/types";

export interface CoursePriceInfo {
  current: number | null;
  original: number | null;
  discountPercent: number | null;
  isFree: boolean;
}

export function getCoursePriceInfo(course: Course): CoursePriceInfo {
  if (course.is_free) {
    return { current: 0, original: null, discountPercent: null, isFree: true };
  }
  const plan = course.pricing_plan;
  if (!plan) {
    return { current: null, original: null, discountPercent: null, isFree: false };
  }
  const original = plan.price;
  const hasDiscount = plan.discount_price != null && plan.discount_price < original;
  const current = hasDiscount ? plan.discount_price! : original;
  const discountPercent = hasDiscount
    ? Math.round(((original - current) / original) * 10000) / 100
    : null;
  return { current, original: hasDiscount ? original : null, discountPercent, isFree: false };
}

export function formatRupee(amount: number): string {
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

/** Returns batch date strings from the API-provided start_date/end_date.
 *  Falls back gracefully if dates are not set yet in admin. */
export function getBatchDates(course: Course): { start: string; end: string } | null {
  if (!course.start_date && !course.end_date) return null;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  return {
    start: course.start_date ? fmt(course.start_date) : "TBA",
    end: course.end_date ? fmt(course.end_date) : "TBA",
  };
}

/** Returns course highlights from the API.
 *  Uses highlights array if set, else learning_outcomes, else empty list.
 *  Nothing is hardcoded — admin controls all content. */
export function getCourseHighlights(course: Course): string[] {
  // Admin-set highlights take priority
  if (course.highlights?.length) {
    return course.highlights;
  }
  // Fall back to learning_outcomes
  if (course.learning_outcomes?.length) {
    return course.learning_outcomes.map((line) =>
      line.match(/^[\p{Emoji}]/u) ? line : `✅ ${line}`
    );
  }
  // No content set yet
  return [];
}
