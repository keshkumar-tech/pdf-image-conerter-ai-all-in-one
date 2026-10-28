export default async function run(page, ui) {
  // --- 1. Create a real account so the token is valid server-side ---------
  const auth = await page.evaluate(async () => {
    const email = `qa.${Date.now()}@noteflow.test`;
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "QA Student",
        email,
        password: "qa-password-123",
      }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    localStorage.setItem("noteflow_auth_user", JSON.stringify(data.user));
    localStorage.setItem("noteflow_auth_token", data.token);
    return { ok: true, email };
  });

  if (auth.error) return { authError: auth.error };

  // --- 2. Force-generate notes for the demo physics lecture --------------
  const notes = await page.evaluate(async () => {
    const videoId = "wWnfJ0-xXRE";
    await fetch("/api/videos/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
      }),
    }).catch(() => {});

    const start = await fetch("/api/videos/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId,
        depth: "complete",
        language: "en",
        pdfTheme: "modern",
      }),
    });
    if (!start.ok) return { error: "process failed" };
    const { jobId } = await start.json();

    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const job = await (await fetch(`/api/jobs/${jobId}`)).json();
      if (job.status === "completed")
        return { ok: true, sections: job.stageDetails };
      if (job.status === "failed") return { error: job.error };
    }
    return { error: "timeout" };
  });

  return { auth, notes };
}
