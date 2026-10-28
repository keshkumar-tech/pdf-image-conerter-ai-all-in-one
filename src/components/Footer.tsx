import React from 'react';

const footerLinks = {
  product: [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/' },
    { label: 'Pricing', href: '/' },
    { label: 'Tools', href: '/' },
    { label: 'FAQ', href: '/' },
  ],
  resources: [
    { label: 'iLovePDF Desktop', href: '/' },
    { label: 'iLovePDF Mobile', href: '/' },
    { label: 'iLoveSign', href: '/' },
    { label: 'iLoveAPI', href: '/' },
    { label: 'iLoveIMG', href: '/' },
  ],
  solutions: [
    { label: 'Business', href: '/' },
    { label: 'Education', href: '/' },
  ],
  legal: [
    { label: 'Security', href: '/' },
    { label: 'Privacy policy', href: '/' },
    { label: 'Terms & conditions', href: '/' },
    { label: 'Cookies', href: '/' },
  ],
  company: [
    { label: 'About us', href: '/' },
    { label: 'Contact us', href: '/' },
    { label: 'Blog', href: '/' },
    { label: 'Press', href: '/' },
  ],
};

const socialLinks = [
  { label: 'X', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'TikTok', href: '#' },
  { label: 'Reddit', href: '#' },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#1e1e2d] via-[#241b3d] to-[#0f172a] text-white">
      <div className="cf-rainbow-bar absolute inset-x-0 top-0 h-1" />
      <div className="cf-blob cf-blob-slow left-[-6%] top-[10%] h-[280px] w-[280px] bg-gradient-to-br from-fuchsia-600 via-pink-500 to-rose-500 opacity-30" />
      <div className="cf-blob cf-blob-reverse right-[-6%] bottom-[5%] h-[260px] w-[260px] bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-600 opacity-30" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Product */}
          <div>
            <h3 className="mb-4 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 bg-clip-text text-sm font-black uppercase tracking-wider text-transparent">PRODUCT</h3>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-300 transition-all hover:translate-x-1 hover:text-fuchsia-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 bg-clip-text text-sm font-black uppercase tracking-wider text-transparent">RESOURCES</h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-300 transition-all hover:translate-x-1 hover:text-fuchsia-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="mb-4 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 bg-clip-text text-sm font-black uppercase tracking-wider text-transparent">SOLUTIONS</h3>
            <ul className="space-y-2.5">
              {footerLinks.solutions.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-300 transition-all hover:translate-x-1 hover:text-fuchsia-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 bg-clip-text text-sm font-black uppercase tracking-wider text-transparent">LEGAL</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-300 transition-all hover:translate-x-1 hover:text-fuchsia-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 bg-clip-text text-sm font-black uppercase tracking-wider text-transparent">COMPANY</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-300 transition-all hover:translate-x-1 hover:text-fuchsia-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-col gap-3">
            <a href="#" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 bg-transparent px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-1.254-1.254-1.048-1.048 1.048-1.048 1.254-1.254zM5.864 2.658L16.8 9.99l-2.302 2.302L5.864 2.658z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] opacity-80">GET IT ON</div>
                <div className="text-sm font-bold">Google Play</div>
              </div>
            </a>

            <a href="#" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 bg-transparent px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.31.71-3.06 1.56-.68.78-1.28 2.05-1.12 3.08 1.19.09 2.39-.63 3.11-1.53" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] opacity-80">Download on the</div>
                <div className="text-sm font-bold">App Store</div>
              </div>
            </a>

            <a href="#" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 bg-transparent px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.31.71-3.06 1.56-.68.78-1.28 2.05-1.12 3.08 1.19.09 2.39-.63 3.11-1.53" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] opacity-80">Download on the</div>
                <div className="text-sm font-bold">Mac App Store</div>
              </div>
            </a>

            <a href="#" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 bg-transparent px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" />
              </svg>
              <div className="text-left">
                <div className="text-sm font-bold">Microsoft Store</div>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-gray-600 bg-transparent px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>English</span>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 transition-all hover:-translate-y-1 hover:text-fuchsia-300"
                  aria-label={social.label}
                >
                  {social.label === 'X' && (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {social.label === 'Facebook' && (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  {social.label === 'LinkedIn' && (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  )}
                  {social.label === 'Instagram' && (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  )}
                  {social.label === 'TikTok' && (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  )}
                  {social.label === 'Reddit' && (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042 1.462c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.166.016-.331.045-.492a1.748 1.748 0 0 1-1.072-1.614c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.678-1.486 4.676-1.488.436 0 .867.066 1.278.189l-2.295.485a1.25 1.25 0 1 1 .752-2.398l2.297.489c.662-.6 1.518-.953 2.456-.953zM8.995 14.001c0-.912.74-1.652 1.652-1.652.912 0 1.652.74 1.652 1.652 0 .912-.74 1.652-1.652 1.652-.912 0-1.652-.74-1.652-1.652zm5.846 0c0-.912.74-1.652 1.652-1.652.912 0 1.652.74 1.652 1.652 0 .912-.74 1.652-1.652 1.652-.912 0-1.652-.74-1.652-1.652z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-xs text-gray-400">
              © iLovePDF 2026 ® - Your PDF Editor
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
