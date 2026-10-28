import React from "react";
import {
  GraduationCap,
  School,
  ArrowRight,
  Sparkles,
  Monitor,
} from "lucide-react";

/**
 * Library landing — the entry screen with exactly TWO portal cards:
 *   1) Concept Builder Classes (Class 9–12)  -> the student app + admin dashboard
 *   2) B.Tech                                 -> placeholder for now
 *
 * The portal cards link to the reference apps that are served as standalone
 * bundles by server.ts (so no reimplementation of their screens here):
 *   /library/school  -> cbc-student-dashboard (Expo web export) + /library/admin (cbc-admin-dashboard)
 */

const PORTALS = [
  {
    id: "school",
    name: "Concept Builder Classes",
    tagline: "Class 9 – 12",
    description:
      "The complete school learning app — courses, notes, PYQ papers, YouTube lectures, quizzes, tests and community.",
    to: "/library/school/",
    adminTo: "/library/admin/",
    emoji: "📚",
    gradient: "from-[#1B2B4B] to-[#2D3E63]",
    accentText: "text-[#C9A227]",
    Icon: School,
    highlights: [
      "Courses & Study Material",
      "PYQ Papers & Tests",
      "YouTube Lectures",
      "Quizzes & Important Questions",
    ],
  },
  {
    id: "btech",
    name: "B.Tech Hub",
    tagline: "Engineering",
    description:
      "Engineering semester hub — universities, branches, subjects, lab manuals, placement material and coding practice.",
    to: "/library/btech/",
    adminTo: null,
    emoji: "🎓",
    gradient: "from-sky-500 to-indigo-600",
    accentText: "text-sky-500",
    Icon: GraduationCap,
    highlights: [
      "Universities & Branches",
      "Semester Subjects",
      "Lab Manuals",
      "Placement Material",
    ],
  },
] as const;

export const LibraryHome: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border-[var(--cf-border)] bg-[var(--cf-surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--cf-text-secondary)]">
          <Sparkles className="h-3 w-3 text-[#C9A227]" />
          Learning Library
        </span>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-[var(--cf-text-primary)] sm:text-3xl">
          Choose your portal
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-xs text-[var(--cf-text-secondary)] sm:text-sm">
          Two learning ecosystems under one roof. Pick a portal to continue.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {PORTALS.map((p) => (
          <div
            key={p.id}
            className="group relative overflow-hidden rounded-3xl border-[var(--cf-border)] bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-white/[0.04]"
          >
            <div
              className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${p.gradient} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25`}
            />
            <div className="relative">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${p.gradient} text-white shadow-md`}
              >
                <p.Icon className="h-7 w-7" />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <h2 className="text-lg font-black text-[var(--cf-text-primary)]">
                  {p.name}
                </h2>
                <span className="text-xl">{p.emoji}</span>
              </div>
              <p
                className={`text-[11px] font-bold uppercase tracking-wider ${p.accentText}`}
              >
                {p.tagline}
              </p>

              <p className="mt-3 text-xs leading-relaxed text-[var(--cf-text-secondary)]">
                {p.description}
              </p>

              <ul className="mt-4 space-y-1.5">
                {p.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-center gap-2 text-[11px] text-[var(--cf-text-secondary)]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C9A227]" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex-wrap items-center gap-2">
                {/*
                  Plain <a href> (not react-router <Link>): the student app and
                  admin dashboard are separate apps served by server.ts, so the
                  browser must make a full request instead of a client-side
                  navigation (which the SPA router would swallow).
                */}
                <a
                  href={p.to}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B2B4B] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#2D3E63]"
                >
                  Open student app
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
                {p.adminTo && (
                  <a
                    href={p.adminTo}
                    className="inline-flex items-center gap-1.5 rounded-xl border-[var(--cf-border)] bg-[var(--cf-surface)] px-4 py-2.5 text-xs font-bold text-[var(--cf-text-secondary)] transition-colors hover:bg-[var(--cf-surface-2)]"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    Admin dashboard
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryHome;
