// Shared helpers for Pulse's public pages. The content travels in the URL fragment (#…),
// which browsers never send to a server; only group votes talk to Pulse's database.
const Pulse = (() => {
  const colors = { music:"#D7A21B", nightlife:"#9B5DE5", comedy:"#F08A2E", performing_arts:"#C93A6B", film:"#4F86E8",
    art:"#2BA79B", talks:"#B5B04E", workshops:"#B07A45", food:"#E2603F", markets:"#E28BB5", sport:"#4E9F4F",
    wellness:"#86C9A3", city:"#7D93AD", social:"#3FB6D9", other:"#8A84A0" };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const safeURL = u => /^https?:\/\//.test(u || "") ? u : null;   // web links only (never javascript: and the like)
  const color = k => colors[k] || "#D7A21B";

  function payload() {
    let b64 = location.hash.slice(1).replace(/-/g, "+").replace(/_/g, "/");
    b64 += "===".slice((b64.length + 3) % 4);
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0))));
  }

  const mark = `<div class="mark"><svg viewBox="0 0 26 14"><polyline points="0,8 7,8 10,8 12,1 15,13 17,5 18,8 26,8"
    fill="none" stroke="#D7A21B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>pulse</div>`;

  const bg = e => safeURL(e.i) ? `background-image:url('${esc(e.i)}')` : `background:${color(e.k)}`;

  // Add to calendar: an .ics file, which phones and laptops open in their calendar app.
  function icsTime(iso) { return iso.replace(/[-:]/g, "").replace(/\.\d+/, "").replace(/Z?$/, "Z"); }
  function calendar(e) {
    if (!e.s && !e.y) return;
    const nextDay = d => { const t = new Date(d + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + 1); return t.toISOString().slice(0, 10); };
    const clean = s => String(s || "").replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
    const when = e.s ? [`DTSTART:${icsTime(e.s)}`, `DTEND:${icsTime(e.e || e.s)}`]
                     : [`DTSTART;VALUE=DATE:${e.y.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${nextDay(e.y).replace(/-/g, "")}`];
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Pulse//Share//EN", "BEGIN:VEVENT",
      `UID:${(e.x || Math.random().toString(36).slice(2)).replace(/[^A-Za-z0-9.-]/g, "-")}@pulse`,
      `DTSTAMP:${icsTime(new Date().toISOString())}`, ...when, `SUMMARY:${clean(e.t)}`,
      `LOCATION:${clean([e.v, e.a].filter(Boolean).join(", "))}`, ...(safeURL(e.u) ? [`URL:${e.u}`] : []),
      "END:VEVENT", "END:VCALENDAR"];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "pulse-event.ics" });
    document.body.appendChild(a); a.click(); a.remove();
  }

  // Group votes (foundation/backend/supabase/ios_group_votes.sql); the key is the public one the app uses.
  const db = "https://wqdqnhkuigwidmgyfemg.supabase.co/rest/v1/rpc/";
  const key = "sb_publishable_uOLx6m2ftaku9fd14A6uEQ_QfdlzT-F";
  async function rpc(name, body) {
    const r = await fetch(db + name, { method: "POST", body: JSON.stringify(body),
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } });
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }
  function store(k, make) {   // a small value this browser keeps (votes stay yours); works without storage too
    try { let v = localStorage.getItem(k); if (!v && make) { v = make(); localStorage.setItem(k, v); } return v; }
    catch (_) { return make ? make() : null; }
  }
  function keep(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  return { esc, safeURL, color, payload, mark, bg, calendar, rpc, store, keep };
})();
