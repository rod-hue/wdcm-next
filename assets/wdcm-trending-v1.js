/* WDCM Trending band — homepage only. Renders the newest tag:trending posts
   (nationwide search-demand articles) as a native band, using the site's own
   .band/.grid4/.card classes so it matches "Right now in the District".
   Auto-refreshes: fetches live on every page load, so the daily worker's new
   post appears without any manual step. Idempotent + reversible (one script tag). */
(function () {
  "use strict";
  if (location.pathname.replace(/\/+$/, "") !== "") return;        // homepage only
  if (document.getElementById("wtr-band")) return;                  // never double-insert
  var KEY = "6a3e40e14a8c49d7da3546ac98";                           // Ghost Content API key
  var API = location.origin + "/ghost/api/content/posts/?key=" + KEY +
            "&filter=tag:trending&include=tags,authors&limit=4&order=" +
            encodeURIComponent("published_at desc");

  var CSS =
    "#wtr-band .wtr-head{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin:0 0 22px}" +
    "#wtr-band .wtr-k{display:inline-flex;align-items:center;gap:8px}" +
    "#wtr-band h2{margin:0}" +
    "#wtr-band .wtr-sub{margin:8px 0 0;max-width:62ch}" +
    "#wtr-band .rank{position:absolute;top:10px;left:10px;z-index:2;font:700 12px/1 ui-monospace,Menlo,monospace;" +
    "letter-spacing:.06em;color:#0b0b0d;background:var(--gold,#d9b26a);padding:5px 8px;border-radius:999px}" +
    "#wtr-band .card{position:relative}";

  function ago(iso) {
    try {
      var d = new Date(iso), M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return M[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    } catch (e) { return ""; }
  }
  function section(p) {
    var skip = { "Trending": 1, "Editor's Pick": 1 };
    var t = (p.tags || []).filter(function (x) { return x.visibility !== "internal" && !skip[x.name]; });
    return (t[0] && t[0].name) || (p.primary_tag && p.primary_tag.name) || "Trending";
  }
  function card(p, i) {
    var a = document.createElement("a");
    a.className = "card"; a.href = p.url;
    var img = p.feature_image
      ? '<img loading="lazy" src="' + p.feature_image + '" alt="' + (p.title || "").replace(/"/g, "&quot;") + '">'
      : "";
    a.innerHTML =
      '<span class="rank">#' + (i + 1) + "</span>" +
      '<div class="ph">' + img + "</div>" +
      '<div class="tx"><span class="sec">' + section(p) + "</span>" +
      "<h3>" + (p.title || "") + "</h3>" +
      '<span class="ago">' + ago(p.published_at) + "</span></div>";
    return a;
  }

  function mount(posts) {
    if (!posts || !posts.length) return;
    var sec = document.createElement("section");
    sec.className = "band wtr"; sec.id = "wtr-band";
    sec.innerHTML =
      '<div class="wtr-head rn-head">' +
        '<span class="wtr-k mono gold-txt"><i class="live-dot"></i> Trending across America</span>' +
        "<h2>What the country is <em>searching for.</em></h2>" +
        '<span class="mono muted">Updated daily</span>' +
      "</div>" +
      '<p class="wtr-sub mono muted">The biggest stories in the country right now, reported in full. ' +
      "We cover what people are actually searching for.</p>" +
      '<div class="grid4" id="wtr-grid"></div>';
    var grid = sec.querySelector("#wtr-grid");
    posts.forEach(function (p, i) { grid.appendChild(card(p, i)); });
    var st = document.createElement("style"); st.textContent = CSS;
    document.head.appendChild(st);
    // place it high: right after the "Right now" band, else before Pulse/Games, else end of main
    var anchor = document.getElementById("rightNowSec");
    if (anchor) { anchor.insertAdjacentElement("afterend", sec); return; }
    var before = document.querySelector(".pulse-band, #games");
    if (before) { before.parentNode.insertBefore(sec, before); return; }
    (document.querySelector("main") || document.body).appendChild(sec);
  }

  function go() {
    fetch(API).then(function (r) { return r.json(); })
      .then(function (d) { mount(d && d.posts); })
      .catch(function () {});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
