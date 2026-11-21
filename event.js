// One event's page: from the JSON a short-link page carries (e/<city>/<slug>.html, written by
// ingest/share_pages.py), else from the link's fragment (e.html#…, the app's fallback).
(() => {
  const { esc, safeURL, color, payload, mark, bg, calendar } = Pulse;
  const app = document.getElementById("app");
  try {
    const inline = document.getElementById("data");
    const p = inline ? JSON.parse(inline.textContent) : payload(), e = p.e;
    document.title = `${e.t} · Pulse`;
    app.innerHTML = `
      <section class="head">
        ${mark}
        <div class="kicker">${esc((p.c || "").toUpperCase())}</div>
        <h1>${esc(e.t)}</h1>
        <div class="hero" style="${bg(e)}"></div>
        <div class="facts">
          <div class="when" style="color:${color(e.k)}">${esc(e.d)}</div>
          ${e.v ? `<div class="where">${esc(e.v)}${e.a ? ` · ${esc(e.a)}` : ""}</div>` : ""}
          ${e.p ? `<div class="price">${esc(e.p)}</div>` : ""}
        </div>
        ${e.m ? `<p class="about">${esc(e.m)}</p>` : ""}
      </section>
      ${safeURL(e.u) ? `<a class="get" href="${esc(e.u)}" target="_blank" rel="noopener">Tickets & info</a>` : ""}
      ${e.s || e.y ? `<button class="get alt" id="cal" style="width:100%;border:0;font:inherit;font-weight:700">Add to calendar</button>` : ""}
      ${/^mypulse:\/\/event\?/.test(p.j || "") ? `<a class="get alt" href="${esc(p.j)}">Open in Pulse</a>` : ""}
      <p class="note">Shared from Pulse. Check the organiser's page before you go.</p>`;
    document.getElementById("cal")?.addEventListener("click", () => calendar(e));
  } catch (_) {
    app.innerHTML = `<p class="empty">This link looks incomplete. Ask your friend to share it again.</p>`;
  }
})();
