export default async function run(page, ui) {
  const results = {};

  // Workspace requires notes in App state, so go via the demo card.
  await page.goto("http://localhost:3000/youtube-notes", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  const demo = page.locator("#demo-card-demo_physics");
  results.demoFound = (await demo.count()) > 0;
  if (results.demoFound) {
    await demo.click();
    await page.waitForTimeout(1200);
  }

  const gen = page
    .getByRole("button", { name: /Generate Complete Notes/i })
    .first();
  results.genFound = (await gen.count()) > 0;
  if (results.genFound) {
    await gen.click();
    results.genClicked = true;
  }

  // Wait for the workspace toolbar to mount.
  try {
    await page.waitForSelector(
      '[data-testid="workspace-toolbar"], button:has-text("Study Tools")',
      { timeout: 90000 },
    );
    results.reachedWorkspace = true;
  } catch {
    results.reachedWorkspace = false;
  }
  await page.waitForTimeout(2000);

  results.layout = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const all = (s) => [...document.querySelectorAll(s)];
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    };
    const aside = q("aside");
    const sec = q("section");
    return {
      hasAside: !!aside,
      hasSection: !!sec,
      aside: box(aside),
      section: box(sec),
      // Both columns should begin on the same row
      columnsAligned:
        aside && sec
          ? Math.abs(
              aside.getBoundingClientRect().top -
                sec.getBoundingClientRect().top,
            ) < 3
          : null,
      pomodoroRing: !!q('svg[viewBox="0 0 36 36"]'),
      chapterRail: document.body.textContent.includes("Chapters"),
      tabs: all("button")
        .map((b) => b.textContent.trim())
        .filter((t) => /^(Study Notes|Revision & Practice)$/.test(t)),
      markButtons: all("button").filter((b) =>
        /^(Mark|Read)$/.test(b.textContent.trim()),
      ).length,
      statValues: all("span")
        .map((s) => s.textContent?.trim())
        .filter((t) => /^\d+%$|^\d+d$|^\d+m$/.test(t || ""))
        .slice(0, 8),
    };
  });

  // --- Command palette ---
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(700);
  results.palette = await page.evaluate(() => {
    const input = document.querySelector(
      'input[placeholder*="Search chapters"]',
    );
    const kbdCount = document.querySelectorAll("kbd").length;
    return {
      open: !!input,
      kbdCount,
      indexed:
        document.body.textContent.match(/(\d+)\s+indexed items/)?.[1] ?? null,
    };
  });
  if (results.palette.open) {
    await page.keyboard.type("motion");
    await page.waitForTimeout(700);
    results.palette.filtered = await page.evaluate(
      () => document.querySelectorAll('div[class*="max-h-"] button').length,
    );
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  }

  // --- Focus mode ---
  await page.keyboard.press("f");
  await page.waitForTimeout(1200);
  results.focusMode = await page.evaluate(() => ({
    active: document.body.textContent.includes("Focus"),
    asideHidden: !document.querySelector("aside"),
    widerMeasure: !!document.querySelector(".max-w-4xl"),
  }));
  await page.keyboard.press("f");
  await page.waitForTimeout(1000);

  // --- Mark a chapter read, verify progress updates ---
  const before = await page.evaluate(
    () =>
      document.body.textContent.match(/(\d+)\/(\d+) chapters read/)?.[0] ??
      null,
  );
  const markBtn = page.getByRole("button", { name: /^(Mark|Read)$/ }).first();
  if (await markBtn.count()) {
    await markBtn.click();
    await page.waitForTimeout(900);
  }
  const after = await page.evaluate(
    () =>
      document.body.textContent.match(/(\d+)\/(\d+) chapters read/)?.[0] ??
      null,
  );
  results.progress = { before, after, changed: before !== after };

  // --- Revision tab ---
  const rev = page
    .getByRole("button", { name: /Revision & Practice/i })
    .first();
  if (await rev.count()) {
    await rev.click();
    await page.waitForTimeout(1000);
    results.revisionTab = await page.evaluate(() => ({
      rapidRevision: document.body.textContent.includes("Rapid revision"),
      glossary: document.body.textContent.includes("Glossary"),
      practice: document.body.textContent.includes("Practice questions"),
      takeaways: document.body.textContent.includes("Final takeaways"),
    }));
  }

  // --- Export pack (E) ---
  await page.keyboard.press("e");
  await page.waitForTimeout(800);
  results.exportPack = await page.evaluate(() => ({
    open: document.body.textContent.includes("Take your notes anywhere"),
    formats: [...document.querySelectorAll("span")]
      .map((s) => s.textContent.trim())
      .filter((t) => /^(MD|CSV|TXT)$/.test(t)),
  }));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // --- Shortcuts overlay (?) ---
  await page.keyboard.press("?");
  await page.waitForTimeout(800);
  results.shortcuts = await page.evaluate(() =>
    document.body.textContent.includes("Keyboard shortcuts"),
  );
  await page.keyboard.press("Escape");

  return results;
}
