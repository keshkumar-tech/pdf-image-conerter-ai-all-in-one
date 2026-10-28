export default async function run(page, ui) {
  const nav = page.locator("header nav");

  // Open the "All PDF Tools" mega menu
  const trigger = nav.getByRole("button", { name: /All PDF Tools/i });
  await trigger.click();
  await page.waitForTimeout(500);

  const panel = await page.evaluate(() => {
    const p = document.querySelector(
      'header nav > div > div[class*="absolute"]',
    );
    if (!p) return { found: false };
    const inner = p.firstElementChild;
    const cols = inner?.querySelectorAll(":scope > div > div");
    return {
      found: true,
      groupHeadings:
        inner?.querySelectorAll('span[class*="bg-clip-text"]').length ?? 0,
      itemLinks: inner?.querySelectorAll('a[href^="/tools/"]').length ?? 0,
      footerRow: !!inner?.querySelector('a[href="/"]'),
      rainbowBar: !!inner?.querySelector(".cf-rainbow-bar"),
    };
  });

  // Measure alignment: are the left edges of the nav items on one baseline?
  const align = await page.evaluate(() => {
    const header = document.querySelector("header");
    const brand = header?.querySelector('a[href="/"]');
    const navEl = header?.querySelector("nav");
    const right = header?.querySelector(".ml-auto");
    const box = (el) => (el ? el.getBoundingClientRect() : null);
    const b = box(brand),
      n = box(navEl),
      r = box(right);
    if (!b || !n || !r) return { error: "missing element" };
    return {
      verticalCenterSpread: Math.max(
        Math.abs(b.top + b.height / 2 - (r.top + r.height / 2)),
        Math.abs(n.top + n.height / 2 - (r.top + r.height / 2)),
      ).toFixed(2),
      noOverlap: n.right <= r.left + 1,
      navOverflows: n.right > r.left,
    };
  });

  // Contrast of the rainbow button label against its own gradient
  const cta = await page.evaluate(() => {
    const el = [...document.querySelectorAll(".cf-btn-rainbow")].find(
      (e) => e.textContent.trim().length > 0,
    );
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      text: el.textContent.trim(),
      color: cs.color,
      textShadow: cs.textShadow,
      backgroundImage: cs.backgroundImage.slice(0, 90),
    };
  });

  await page.keyboard.press("Escape");
  await page.mouse.click(5, 400);
  await page.waitForTimeout(300);

  return { panel, align, cta };
}
