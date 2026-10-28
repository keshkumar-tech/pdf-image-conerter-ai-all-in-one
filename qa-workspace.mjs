export default async function run(page, ui) {
  // The workspace only renders once App state holds the notes, so drive the
  // real flow: open the generator, load the demo lecture, generate, wait.
  await page.goto("http://localhost:3000/youtube-notes", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1200);

  // Sign in first — generation is gated behind auth.
  const loginBtn = page.getByRole("button", { name: /^Login$/i });
  if (await loginBtn.count()) {
    await loginBtn.first().click();
    await page.waitForTimeout(700);
    const email = page
      .locator('input[type="email"], input[name="email"]')
      .first();
    if (await email.count()) {
      await email.fill("qa.student@noteflow.test");
      const pw = page.locator('input[type="password"]').first();
      if (await pw.count()) await pw.fill("qa-password-123");
      const nameField = page
        .locator('input[name="name"], input[type="text"]')
        .first();
      if (await nameField.count()) await nameField.fill("QA Student");
      const submit = page
        .getByRole("button", { name: /sign up|create account|register|login/i })
        .last();
      if (await submit.count()) {
        await submit.click();
        await page.waitForTimeout(1500);
      }
    }
  }

  const state = { step: "started" };

  // Load the physics demo lecture (already has notes generated server-side).
  const demo = page.locator("#demo-card-demo_physics");
  if (await demo.count()) {
    await demo.click();
    await page.waitForTimeout(1000);
    state.step = "demo loaded";
  }

  // Generate / open notes
  const gen = page
    .getByRole("button", {
      name: /Generate Complete Notes|Open|View Notes|Generate/i,
    })
    .first();
  if (await gen.count()) {
    await gen.click();
    state.step = "generate clicked";
    // Wait for the workspace to appear (poll for the toolbar)
    try {
      await page.waitForSelector("text=Study Tools", { timeout: 45000 });
      state.step = "workspace reached";
    } catch {
      state.step = "workspace timeout";
    }
  }

  await page.waitForTimeout(1500);

  const layout = await page.evaluate(() => {
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
    const main = q("section");
    const grid = q("aside")?.parentElement;

    return {
      url: location.pathname,
      hasWorkspace: !!q("aside") && !!q("section"),
      asideBox: box(aside),
      mainBox: box(main),
      asideStartsAboveMain:
        aside && main
          ? aside.getBoundingClientRect().top <=
            main.getBoundingClientRect().top + 1
          : null,
      statTiles: all('[class*="rounded-xl"]').length,
      pomodoro: !!q('svg[viewBox="0 0 36 36"]'),
      chapterRail: document.body.textContent.includes("Chapters"),
      tabButtons: all("button")
        .filter((b) => /Study Notes|Revision & Practice/.test(b.textContent))
        .map((b) => b.textContent.trim()),
      markButtons: all("button").filter((b) =>
        /^Mark$|^Read$/.test(b.textContent.trim()),
      ).length,
      sidebarItems: all("aside button").length,
      headings: all("h1,h2").map((h) => h.textContent.trim().slice(0, 42)),
    };
  });

  // Exercise the command palette
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(600);
  const palette = await page.evaluate(() => {
    const input = document.querySelector(
      'input[placeholder*="Search chapters"]',
    );
    return {
      open: !!input,
      indexed:
        document.body.textContent.match(/(\d+) indexed items/)?.[1] ?? null,
    };
  });

  if (palette.open) {
    await page.keyboard.type("newton");
    await page.waitForTimeout(500);
    palette.resultCount = await page.evaluate(
      () => document.querySelectorAll("button kbd, kbd").length,
    );
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }

  // Focus mode
  await page.keyboard.press("f");
  await page.waitForTimeout(900);
  const focus = await page.evaluate(() => ({
    focusChip: !!document.body.textContent.match(/Focus/),
    asideGone: !document.querySelector("aside"),
  }));
  await page.keyboard.press("f");
  await page.waitForTimeout(700);

  // Revision tab
  const revTab = page
    .getByRole("button", { name: /Revision & Practice/i })
    .first();
  let revision = null;
  if (await revTab.count()) {
    await revTab.click();
    await page.waitForTimeout(900);
    revision = await page.evaluate(() => ({
      glossary:
        
        document.body.textContent.includes("Glossary"),
      practiceQs: document.body.textContent.includes("Practice questions"),
      rapidRevision: document.body.textContent.includes("Rapid revision"),
    }));
  }

  return { state, layout, palette, focus, revision };
}
