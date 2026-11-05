/* WDCM Live DC cams.
   - On /live/ : fills #wdcm-live-mount (or #wdcm-page-body) with the full 2x2 cam grid.
   - On the homepage: drops a compact "Washington, live" teaser band with one marquee
     cam + a link to /live/.
   Feeds: YouTube live embeds (EarthCam / earthTV) + Windy.com webcams (link-back required,
   satisfied by the credit link under each Windy cam). All verified embeddable Nov 2026.
   Idempotent + reversible (one script tag). Edit the CAMS list to add or swap feeds. */
(function () {
  "use strict";

  var CAMS = [
    { t: "youtube", id: "oDCAAfOSqvA", title: "The National Mall",
      loc: "Live from the top of the Washington Monument",
      credit: "EarthCam", url: "https://www.earthcam.com/usa/dc/washingtonmonument/?cam=wamo" },
    { t: "youtube", id: "5p_KGD4fJZs", title: "The White House",
      loc: "1600 Pennsylvania Avenue, right now",
      credit: "earthTV", url: "https://www.youtube.com/watch?v=5p_KGD4fJZs", recover: "wh" },
    { t: "windy", id: "1263154384", title: "The U.S. Capitol",
      loc: "Capitol Hill, updating through the day",
      credit: "Windy.com", url: "https://www.windy.com/webcams/1263154384" },
    { t: "windy", id: "1793908140", title: "Tidal Basin & Lincoln Memorial",
      loc: "Across the Potomac toward the memorials",
      credit: "Windy.com", url: "https://www.windy.com/webcams/1793908140" }
  ];

  // earthTV rotates the White House live id; this resolver returns the current one
  var WH_RESOLVER = "https://wh-live.rod-558.workers.dev/";

  function src(c) {
    return c.t === "youtube"
      ? "https://www.youtube.com/embed/" + c.id + "?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1"
      : "https://webcams.windy.com/webcams/public/embed/player/" + c.id + "/day";
  }

  function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  function tile(c, lazy) {
    var d = document.createElement("div");
    d.className = "lc-tile";
    if (c.recover) d.setAttribute("data-cam", c.recover);
    d.innerHTML =
      '<div class="lc-fr">' +
        '<span class="lc-live"><i></i> LIVE</span>' +
        '<iframe src="' + src(c) + '" title="' + esc(c.title) + ' live camera" ' +
          (lazy ? 'loading="lazy" ' : "") +
          'allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen ' +
          'referrerpolicy="origin"></iframe>' +
      "</div>" +
      '<div class="lc-cap">' +
        "<h3>" + esc(c.title) + "</h3>" +
        '<p class="mono muted">' + esc(c.loc) + "</p>" +
        '<a class="lc-src mono" href="' + c.url + '" target="_blank" rel="noopener">Feed: ' + esc(c.credit) + " &nearr;</a>" +
      "</div>";
    return d;
  }

  var CSS =
    "#wdcm-live{--lc-gold:var(--gold,#d9b26a)}" +
    "#wdcm-live .lc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;margin:26px 0 8px}" +
    "@media(max-width:720px){#wdcm-live .lc-grid{grid-template-columns:1fr;gap:18px}}" +
    "#wdcm-live .lc-tile{background:#111419;border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden}" +
    "#wdcm-live .lc-fr{position:relative;aspect-ratio:16/9;background:#000}" +
    "#wdcm-live .lc-fr iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}" +
    "#wdcm-live .lc-live{position:absolute;top:12px;left:12px;z-index:2;display:inline-flex;align-items:center;gap:6px;" +
      "font:700 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.12em;color:#fff;background:rgba(200,30,30,.92);" +
      "padding:5px 9px;border-radius:999px;pointer-events:none}" +
    "#wdcm-live .lc-live i{width:7px;height:7px;border-radius:50%;background:#fff;animation:lcpulse 1.6s infinite}" +
    "@keyframes lcpulse{0%,100%{opacity:1}50%{opacity:.35}}" +
    "#wdcm-live .lc-cap{padding:14px 16px 16px}" +
    "#wdcm-live .lc-cap h3{margin:0 0 4px;font-size:19px}" +
    "#wdcm-live .lc-cap p{margin:0 0 8px;font-size:12.5px}" +
    "#wdcm-live .lc-src{font-size:11px;letter-spacing:.06em;color:var(--lc-gold);text-decoration:none}" +
    "#wdcm-live .lc-src:hover{text-decoration:underline}" +
    "#wdcm-live .lc-note{margin:18px 0 0;font-size:12.5px;max-width:70ch}" +
    /* homepage teaser band */
    "#lc-band .lc-band-in{display:grid;grid-template-columns:1.1fr 1fr;gap:28px;align-items:center}" +
    "@media(max-width:820px){#lc-band .lc-band-in{grid-template-columns:1fr;gap:20px}}" +
    "#lc-band .lc-copy h2{margin:10px 0 0}" +
    "#lc-band .lc-copy p{margin:12px 0 18px;max-width:46ch}" +
    "#lc-band .lc-fr{position:relative;aspect-ratio:16/9;background:#000;border-radius:16px;overflow:hidden;" +
      "border:1px solid rgba(255,255,255,.08)}" +
    "#lc-band .lc-fr iframe{position:absolute;inset:0;width:100%;height:100%;border:0}" +
    "#lc-band .lc-live{position:absolute;top:12px;left:12px;z-index:2;display:inline-flex;align-items:center;gap:6px;" +
      "font:700 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.12em;color:#fff;background:rgba(200,30,30,.92);" +
      "padding:5px 9px;border-radius:999px;pointer-events:none}" +
    "#lc-band .lc-live i{width:7px;height:7px;border-radius:50%;background:#fff;animation:lcpulse 1.6s infinite}";

  function injectCSS() {
    if (document.getElementById("lc-css")) return;
    var st = document.createElement("style");
    st.id = "lc-css"; st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- full page at /live/ ---------- */
  function buildPage() {
    if (document.getElementById("wdcm-live")) return;
    var mount = document.getElementById("wdcm-page-body") || document.getElementById("wdcm-live-mount");
    if (!mount) return;
    injectCSS();
    var wrap = document.createElement("div");
    wrap.id = "wdcm-live";
    var grid = document.createElement("div");
    grid.className = "lc-grid";
    CAMS.forEach(function (c, i) { grid.appendChild(tile(c, i > 0)); });
    wrap.appendChild(grid);
    var note = document.createElement("p");
    note.className = "lc-note mono muted";
    note.innerHTML = "Live feeds from EarthCam and Windy.com, refreshed in real time. " +
      "Views can pause or go dark when a camera is down for maintenance. There is no public close-up of the White House grounds for security reasons.";
    wrap.appendChild(note);
    mount.innerHTML = "";
    mount.appendChild(wrap);
    recoverWH();
  }

  // Swap the White House iframe to the channel's current live id if it has rotated.
  // Purely additive: the tile renders immediately with the known-good id, and this
  // only replaces the src when the resolver returns a different, resolved id.
  function recoverWH() {
    var cam = null;
    for (var i = 0; i < CAMS.length; i++) if (CAMS[i].recover === "wh") cam = CAMS[i];
    if (!cam) return;
    fetch(WH_RESOLVER).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.resolved && j.id && j.id !== cam.id) {
        var fr = document.querySelector('#wdcm-live [data-cam="wh"] iframe');
        if (fr) { cam.id = j.id; fr.src = src(cam); }
      }
    }).catch(function () {});
  }

  /* ---------- homepage teaser band ---------- */
  function buildBand() {
    if (document.getElementById("lc-band")) return;
    injectCSS();
    var c = CAMS[0];
    var sec = document.createElement("section");
    sec.className = "band"; sec.id = "lc-band";
    sec.innerHTML =
      '<div class="lc-band-in">' +
        '<div class="lc-copy">' +
          '<span class="mono gold-txt"><i class="live-dot"></i> Washington, right now</span>' +
          "<h2>A live look at <em>the capital.</em></h2>" +
          "<p class=\"mono muted\">The Mall, the White House, the Capitol and the memorials, streaming live. Our front-row seat on the city, open any time.</p>" +
          '<a class="sub-btn gold" href="/live/">See the live cameras &rarr;</a>' +
        "</div>" +
        '<a class="lc-fr" href="/live/" aria-label="Watch Washington live">' +
          '<span class="lc-live"><i></i> LIVE</span>' +
          '<iframe src="' + src(c) + '" title="Washington live" loading="lazy" ' +
            'allow="autoplay; encrypted-media" referrerpolicy="origin" tabindex="-1"></iframe>' +
        "</a>" +
      "</div>";
    var anchor = document.getElementById("wtr-band") || document.getElementById("rightNowSec");
    if (anchor) { anchor.insertAdjacentElement("afterend", sec); return; }
    var before = document.querySelector(".pulse-band, #games");
    if (before) { before.parentNode.insertBefore(sec, before); return; }
    (document.querySelector("main") || document.body).appendChild(sec);
  }

  /* ---------- masthead nav link (injected once the theme builds the nav) ---------- */
  function addNav() {
    var nav = document.getElementById("sectionsNav");
    if (!nav || !nav.children.length) return false;        // wait until the theme has built it
    if (nav.querySelector("[data-lc-nav]")) return true;   // already added
    if (!document.getElementById("lc-nav-css")) {
      var st = document.createElement("style");
      st.id = "lc-nav-css";
      st.textContent = "#sectionsNav a[data-lc-nav]{display:inline-flex;align-items:center;gap:6px}" +
        "#sectionsNav a[data-lc-nav] i{width:7px;height:7px;border-radius:50%;background:#e23;animation:lcpulse 1.6s infinite}";
      document.head.appendChild(st);
    }
    var a = document.createElement("a");
    a.href = "/live/"; a.setAttribute("data-lc-nav", "1");
    a.innerHTML = '<i></i>Live';
    if (location.pathname.replace(/\/+$/, "") === "/live") a.setAttribute("aria-current", "page");
    var dd = nav.querySelector(".nav-dd");
    if (dd) nav.insertBefore(a, dd); else nav.appendChild(a);
    return true;
  }
  function navLoop() {
    injectCSS();                 // ensure lcpulse keyframe exists for the nav dot
    if (addNav()) return;
    var n = 0, t = setInterval(function () { if (addNav() || ++n > 20) clearInterval(t); }, 250);
  }

  function go() {
    var p = location.pathname.replace(/\/+$/, "");
    if (p === "/live") buildPage();
    else if (p === "") buildBand();
    if (document.readyState === "complete") navLoop();
    else window.addEventListener("load", navLoop);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
