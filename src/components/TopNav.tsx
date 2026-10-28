import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Sun, Moon, User, LogOut, Sparkles, Layers, Settings, FileText, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavTool {
  label: string;
  href: string;
  emoji: string;
  desc: string;
}

interface NavGroup {
  title: string;
  accent: string;
  items: NavTool[];
}

interface NavItem {
  label: string;
  href?: string;
  groups?: NavGroup[];
  footerLink?: { label: string; href: string };
}

const topNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Convert',
    groups: [
      {
        title: 'To PDF',
        accent: 'from-cyan-400 to-blue-600',
        items: [
          { label: 'Word to PDF', href: '/tools/word-to-pdf', emoji: '📝', desc: 'DOC & DOCX ➔ PDF' },
          { label: 'PowerPoint to PDF', href: '/tools/powerpoint-to-pdf', emoji: '📽️', desc: 'PPT & PPTX ➔ PDF' },
          { label: 'Excel to PDF', href: '/tools/excel-to-pdf', emoji: '📈', desc: 'XLS & XLSX ➔ PDF' },
          { label: 'JPG to PDF', href: '/tools/jpg-to-pdf', emoji: '🖼️', desc: 'Images ➔ PDF' },
          { label: 'HTML to PDF', href: '/tools/html-to-pdf', emoji: '🌐', desc: 'Webpages ➔ PDF' },
        ],
      },
      {
        title: 'From PDF',
        accent: 'from-fuchsia-500 to-purple-600',
        items: [
          { label: 'PDF to Word', href: '/tools/pdf-to-word', emoji: '📃', desc: 'Editable DOCX output' },
          { label: 'PDF to PowerPoint', href: '/tools/pdf-to-powerpoint', emoji: '📊', desc: 'Rebuild slide decks' },
          { label: 'PDF to Excel', href: '/tools/pdf-to-excel', emoji: '🧮', desc: 'Pull tables & data' },
          { label: 'PDF to JPG', href: '/tools/pdf-to-jpg', emoji: '🌁', desc: 'Pages ➔ images' },
          { label: 'PDF to Markdown', href: '/tools/pdf-to-markdown', emoji: '⌨️', desc: 'Clean MD output' },
          { label: 'PDF to PDF/A', href: '/tools/pdf-to-pdfa', emoji: '📁', desc: 'ISO archive standard' },
        ],
      },
    ],
  },
  {
    label: 'All PDF Tools',
    groups: [
      {
        title: 'Organize',
        accent: 'from-rose-500 to-pink-600',
        items: [
          { label: 'Remove Pages', href: '/tools/remove-pages', emoji: '🗑️', desc: 'Delete unwanted pages' },
          { label: 'Organize PDF', href: '/tools/organize-pdf', emoji: '📑', desc: 'Sort & reorder pages' },
          { label: 'Scan to PDF', href: '/tools/scan-to-pdf', emoji: '📷', desc: 'Camera ➔ document' },
        ],
      },
      {
        title: 'Optimize',
        accent: 'from-lime-400 to-emerald-600',
        items: [
          { label: 'Merge PDF', href: '/tools/merge-pdf', emoji: '🔗', desc: 'Combine files in order' },
          { label: 'Split PDF', href: '/tools/split-pdf', emoji: '✂️', desc: 'Separate pages' },
          { label: 'Compress PDF', href: '/tools/compress-pdf', emoji: '📦', desc: 'Shrink file size' },
          { label: 'Repair PDF', href: '/tools/repair-pdf', emoji: '🔧', desc: 'Recover corrupt files' },
          { label: 'OCR PDF', href: '/tools/ocr-pdf', emoji: '🔍', desc: 'Make scans searchable' },
        ],
      },
      {
        title: 'Edit',
        accent: 'from-amber-400 to-orange-600',
        items: [
          { label: 'Rotate PDF', href: '/tools/rotate-pdf', emoji: '🔄', desc: 'Fix orientation' },
          { label: 'Add Page Numbers', href: '/tools/add-page-numbers', emoji: '🔢', desc: 'Number every page' },
          { label: 'Add Watermark', href: '/tools/add-watermark', emoji: '💧', desc: 'Stamp text or logo' },
          { label: 'Crop PDF', href: '/tools/crop-pdf', emoji: '🪚', desc: 'Trim margins' },
          { label: 'Edit PDF', href: '/tools/edit-pdf', emoji: '✏️', desc: 'Text, shapes, notes' },
          { label: 'PDF Forms', href: '/tools/pdf-forms', emoji: '📋', desc: 'Create & fill forms' },
        ],
      },
      {
        title: 'Security',
        accent: 'from-slate-500 to-slate-800',
        items: [
          { label: 'Unlock PDF', href: '/tools/unlock-pdf', emoji: '🔓', desc: 'Remove passwords' },
          { label: 'Protect PDF', href: '/tools/protect-pdf', emoji: '🔒', desc: 'Encrypt with password' },
          { label: 'Sign PDF', href: '/tools/sign-pdf', emoji: '✍️', desc: 'Add e-signature' },
          { label: 'Redact PDF', href: '/tools/redact-pdf', emoji: '🛡️', desc: 'Erase sensitive data' },
          { label: 'Compare PDF', href: '/tools/compare-pdf', emoji: '⚖️', desc: 'Side-by-side diff' },
        ],
      },
      {
        title: 'AI Tools',
        accent: 'from-violet-500 to-indigo-600',
        items: [
          { label: 'AI Summarizer', href: '/tools/ai-summarizer', emoji: '✨', desc: 'Instant summaries' },
          { label: 'Translate PDF', href: '/tools/translate-pdf', emoji: '🌍', desc: 'AI translation' },
          { label: 'PDF to Markdown', href: '/tools/pdf-to-markdown', emoji: '📝', desc: 'Developer-friendly MD' },
        ],
      },
    ],
    footerLink: { label: 'Browse all 30+ tools', href: '/' },
  },
];

function MegaMenu({
  groups,
  footerLink,
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  groups: NavGroup[];
  footerLink?: { label: string; href: string };
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  if (!isOpen) return null;

  // Five columns keeps the panel wide and short so it never runs tall.
  const columnCount = Math.min(5, groups.length);
  const perColumn = Math.ceil(groups.length / columnCount);
  const columns: NavGroup[][] = [];
  for (let i = 0; i < columnCount; i++) {
    const slice = groups.slice(i * perColumn, (i + 1) * perColumn);
    if (slice.length) columns.push(slice);
  }

  return (
    <div
      className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="cf-pop-in w-max overflow-hidden rounded-2xl border-[var(--cf-border)] bg-white/95 shadow-2xl shadow-fuchsia-500/10 backdrop-blur-xl dark:bg-[#0d1224]/95">
        <div className="cf-rainbow-bar h-1 w-full" />

        <div className="flex gap-0.5 p-2.5">
          {columns.map((col, ci) => (
            <div
              key={ci}
              className="min-w-[172px] border-r border-[var(--cf-border)] pr-0.5 last:border-r-0 last:pr-0"
            >
              {col.map((group) => (
                <div key={group.title} className="mb-0.5 px-0.5">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${group.accent}`} />
                    <span
                      className={`bg-gradient-to-r ${group.accent} bg-clip-text text-[10px] font-black uppercase tracking-[0.12em] text-transparent`}
                    >
                      {group.title}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {group.items.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={onClose}
                        className="group/item flex items-center gap-2.5 rounded-xl px-2 py-2 transition-all hover:bg-[var(--cf-surface)] dark:hover:bg-white/5"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${group.accent} text-[13px] shadow-sm transition-transform duration-300 group-hover/item:-rotate-6 group-hover/item:scale-110`}
                        >
                          {child.emoji}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-[var(--cf-text-primary)] transition-colors group-hover/item:text-fuchsia-600 dark:group-hover/item:text-fuchsia-300">
                            {child.label}
                          </span>
                          <span className="block truncate text-[10px] text-[var(--cf-text-muted)]">
                            {child.desc}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {footerLink && (
          <Link
            to={footerLink.href}
            onClick={onClose}
            className="group/foot flex items-center justify-between border-t border-[var(--cf-border)] bg-[var(--cf-surface)] px-5 py-3 transition-colors hover:bg-fuchsia-500/5"
          >
            <span className="text-[11px] font-extrabold text-[var(--cf-text-secondary)]">
              {footerLink.label}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-extrabold text-fuchsia-600 dark:text-fuchsia-300">
              Open library
              <ArrowRight className="h-3 w-3 transition-transform group-hover/foot:translate-x-1" />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

export function TopNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { user, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  // Hover intent: a short open delay avoids menus flashing open while the
  // pointer merely travels across the bar, and a short close delay lets the
  // user cross the gap from trigger to panel without it snapping shut.
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  const hoverOpen = (label: string, hasMenu: boolean) => {
    cancelTimers();
    if (openMenu === label) return;
    if (!hasMenu) {
      // Pure link — close whatever panel is open so it does not linger.
      closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
      return;
    }
    openTimer.current = setTimeout(() => setOpenMenu(label), 80);
  };

  const hoverClose = () => {
    cancelTimers();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180);
  };

  // Keep the panel open while the pointer is inside it.
  const keepOpen = () => {
    cancelTimers();
  };

  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenu && menuRefs.current[openMenu] && !menuRefs.current[openMenu]?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  // Escape closes the menu — expected for any hover-opened overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => cancelTimers, []);

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--cf-border)] bg-white/85 backdrop-blur-xl dark:bg-[#0b1020]/85">
      <div className="cf-rainbow-bar h-1 w-full" />

      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* ---------- Brand ---------- */}
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <div className="cf-animated-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg shadow-fuchsia-500/30 transition-transform duration-500 group-hover:rotate-12">
            <span className="text-sm font-black">i</span>
          </div>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="cf-rainbow-text text-lg font-black tracking-tight">PDF</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--cf-text-muted)]">
              NoteFlow
            </span>
          </span>
        </Link>

        <div className="mx-1 hidden h-7 w-px shrink-0 bg-[var(--cf-border)] md:block" />

        {/* ---------- Primary nav ---------- */}
        <nav className="hidden flex-1 items-center gap-0.5 md:flex">
          {topNavItems.map((item) => {
            const open = openMenu === item.label;
            const active = item.href ? isActive(item.href) : false;

            return (
              <React.Fragment key={item.label}>
                {item.label === 'Home' && (
                  <span className="mx-1 h-5 w-px shrink-0 bg-[var(--cf-border)]" />
                )}
                <div
                ref={(el) => { menuRefs.current[item.label] = el; }}
                className="relative"
                onMouseEnter={() => hoverOpen(item.label, !!item.groups)}
                onMouseLeave={hoverClose}
              >
                {item.href ? (
                  <Link
                    to={item.href}
                    className={`group relative flex items-center rounded-xl px-3 py-2 text-[12px] font-bold transition-all ${
                      active
                        ? 'text-fuchsia-600 dark:text-fuchsia-300'
                        : 'text-[var(--cf-text-primary)] hover:text-fuchsia-600 dark:hover:text-fuchsia-300'
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      {item.href === '/' && <Home className="h-3.5 w-3.5" />}
                      {item.label}
                    </span>
                    <span
                      className={`absolute inset-0 -z-0 rounded-xl bg-fuchsia-500/10 opacity-0 transition-opacity ${
                        active ? 'opacity-100' : 'group-hover:opacity-100'
                      }`}
                    />
                    <span
                      className={`absolute bottom-0.5 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 transition-all duration-300 ${
                        active ? 'w-6' : 'w-0 group-hover:w-6'
                      }`}
                    />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      // Click stays as the touch + keyboard path; hover drives it
                      // on pointer devices via the wrapper above.
                      cancelTimers();
                      setOpenMenu(open ? null : item.label);
                    }}
                    aria-expanded={open}
                    aria-haspopup="true"
                    className={`group relative flex cursor-default items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition-all ${
                      open
                        ? 'text-fuchsia-600 dark:text-fuchsia-300'
                        : 'text-[var(--cf-text-primary)] hover:text-fuchsia-600 dark:hover:text-fuchsia-300'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <ChevronDown
                      className={`relative z-10 h-3.5 w-3.5 transition-transform duration-300 ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                    <span
                      className={`absolute inset-0 rounded-xl bg-fuchsia-500/10 transition-opacity ${
                        open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    />
                    <span
                      className={`absolute bottom-0.5 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 transition-all duration-300 ${
                        open ? 'w-6' : 'w-0 group-hover:w-6'
                      }`}
                    />
                  </button>
                )}

                {item.groups && (
                  <MegaMenu
                    groups={item.groups}
                    footerLink={item.footerLink}
                    isOpen={open}
                    onClose={() => setOpenMenu(null)}
                    onMouseEnter={keepOpen}
                    onMouseLeave={hoverClose}
                  />
                )}
                </div>
              </React.Fragment>
            );
          })}
        </nav>

        {/* ---------- Right cluster ---------- */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Link
            to="/youtube-notes"
            className="group hidden items-center gap-1.5 rounded-xl border-fuchsia-400/30 bg-fuchsia-500/5 px-3 py-2 text-[12px] font-bold text-fuchsia-700 transition-all hover:-translate-y-0.5 hover:border-fuchsia-400/60 hover:bg-fuchsia-500/10 hover:shadow-md hover:shadow-fuchsia-500/20 dark:text-fuchsia-300 lg:inline-flex"
          >
            <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:scale-125" />
            YouTube Notes
          </Link>
          <Link
            to="/library"
            className="group hidden items-center gap-1.5 rounded-xl border-cyan-400/30 bg-cyan-500/5 px-3 py-2 text-[12px] font-bold text-cyan-700 transition-all hover:-translate-y-0.5 hover:border-cyan-400/60 hover:bg-cyan-500/10 hover:shadow-md hover:shadow-cyan-500/20 dark:text-cyan-300 lg:inline-flex"
          >
            <Layers className="h-3.5 w-3.5 transition-transform group-hover:scale-125" />
            Library
          </Link>

          <button
            onClick={toggleTheme}
            className="rounded-xl border-[var(--cf-border)] p-2 text-[var(--cf-text-secondary)] transition-all hover:-translate-y-0.5 hover:border-fuchsia-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-300"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'user-menu' ? null : 'user-menu')}
                className="group flex items-center gap-2 rounded-xl border-[var(--cf-border)] bg-white/70 py-1.5 pl-1.5 pr-2.5 text-[12px] transition-all hover:-translate-y-0.5 hover:border-fuchsia-300 hover:shadow-md hover:shadow-fuchsia-500/10 dark:bg-white/5"
              >
                <span className="cf-animated-gradient flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black text-white">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="hidden max-w-[80px] truncate font-bold text-[var(--cf-text-primary)] md:inline">
                  {user.name}
                </span>
                <ChevronDown
                  className={`h-3 w-3 text-[var(--cf-text-muted)] transition-transform ${
                    openMenu === 'user-menu' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openMenu === 'user-menu' && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                  <div className="cf-pop-in absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border-[var(--cf-border)] bg-white/95 shadow-2xl shadow-fuchsia-500/10 backdrop-blur-xl dark:bg-[#0d1224]/95">
                    <div className="cf-rainbow-bar h-1 w-full" />
                    <div className="border-b border-[var(--cf-border)] px-4 py-3">
                      <p className="truncate text-xs font-black text-[var(--cf-text-primary)]">{user.name}</p>
                      <p className="truncate font-mono text-[10px] text-[var(--cf-text-muted)]">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      {[
                        { label: 'Profile', icon: <User className="h-3.5 w-3.5" /> },
                        { label: 'Settings', icon: <Settings className="h-3.5 w-3.5" /> },
                        { label: 'My Documents', icon: <FileText className="h-3.5 w-3.5" /> },
                      ].map((row) => (
                        <button
                          key={row.label}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--cf-text-primary)] transition-colors hover:bg-[var(--cf-surface)] dark:hover:bg-white/5"
                        >
                          <span className="text-fuchsia-500">{row.icon}</span>
                          {row.label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-[var(--cf-border)] p-1.5">
                      <button
                        onClick={() => {
                          logout();
                          setOpenMenu(null);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('general')}
                className="hidden rounded-xl px-3.5 py-2 text-[12px] font-bold text-[var(--cf-text-primary)] transition-colors hover:bg-[var(--cf-surface)] dark:hover:bg-white/5 sm:inline-flex"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal('general')}
                className="cf-btn-rainbow cf-shimmer rounded-xl px-4 py-2 text-[12px] font-extrabold"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
