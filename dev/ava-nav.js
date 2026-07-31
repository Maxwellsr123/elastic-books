// ava-nav.js — ONE navigation for the whole app.
//
// Every page had been rolling its own: today/app/collect/gst each carried a
// hand-written rail with a different item list, and index/connections/usage had
// none at all — so tapping "Features" in the rail landed you on the hub with no
// way back (Max, 2026-07-31). A nav you can fall out of isn't a nav.
//
// PHONE FIRST. Under 820px this is a bottom bar — thumb-height targets, five
// destinations, safe-area padding for the home indicator — because that's how
// most owners open it. The desktop rail is the wide-screen variant, not the
// design being squeezed down.
//
// The script INJECTS the nav and removes whatever the page had, so adding it to
// a page is one <script> tag and nothing else. It adapts to either layout:
//   - flex pages (.app > .side + .main) — it becomes the .side
//   - plain pages (index, usage, connections) — it floats and pads the body
//
//   <script src="ava-nav.js"></script>          ...that's it.
//
// Counts are optional and pushed in by whoever already has them, so no page
// pays for a fetch it didn't need:  avaNav.counts({today: 3, books: 21})
(function (global) {
  var KPA = "5c829c7f-0b63-4bbc-87b9-c24b822a564d";
  function companyId() {
    var qc = new URLSearchParams(location.search).get("c");
    if (qc) return qc;
    try {
      var s = JSON.parse(localStorage.getItem("ava_session") || "null");
      if (s && s.companies && s.companies.length) return s.companies[0].id;
    } catch (e) {}
    if (global.IS_DEV) return global.SANDBOX_CO || KPA;
    return "";
  }
  var CO = companyId();
  var q = CO ? "?c=" + encodeURIComponent(CO) : "";

  // Five on the phone bar; the rest live in the rail and behind "More".
  var ITEMS = [
    { key: "today",   href: "today.html",       icon: "ti-inbox",        label: "Today",   phone: true, wip: true },
    { key: "books",   href: "app.html",         icon: "ti-book-2",       label: "Books",   full: "Bookkeeping", phone: true },
    { key: "collect", href: "collect.html",     icon: "ti-cash",         label: "Collect", full: "Auto Collect", phone: true },
    { key: "gst",     href: "gst.html",         icon: "ti-pig-money",    label: "GST",     phone: true },
    { key: "hub",     href: "index.html?hub=1", icon: "ti-apps",         label: "More",    full: "All features", phone: true, group: "Set up", sheet: true },
    { key: "conns",   href: "connections.html", icon: "ti-plug",         label: "Connections" },
    { key: "usage",   href: "usage.html",       icon: "ti-chart-bar",    label: "Usage & billing" },
  ];

  function here() {
    var f = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (f === "" || f === "index.html") return "hub";
    var hit = ITEMS.filter(function (i) { return i.href.split("?")[0] === f; })[0];
    return hit ? hit.key : "";
  }
  function url(i) { return i.href.indexOf("?") >= 0 ? i.href + (q ? "&" + q.slice(1) : "") : i.href + q; }

  function css() {
    if (document.getElementById("avanav-css")) return;
    var s = document.createElement("style");
    s.id = "avanav-css";
    s.textContent =
      "#avanav{--nv-bg:#100F15;--nv-dim:#A7A7B4;width:212px;flex:none;background:var(--nv-bg);color:#fff;display:flex;flex-direction:column;padding:16px 12px;position:sticky;top:0;height:100vh;gap:2px;z-index:40;font-family:'Plus Jakarta Sans',system-ui,sans-serif}" +
      "#avanav .nvb{display:flex;align-items:center;gap:9px;padding:4px 8px 16px;text-decoration:none;color:#fff}" +
      "#avanav .nvlg{width:28px;height:28px;border-radius:5px;background:linear-gradient(135deg,#534AB7,#6F66DB);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex:none}" +
      "#avanav a.nvi{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:4px;color:var(--nv-dim);text-decoration:none;font-size:13px;font-weight:500}" +
      "#avanav a.nvi:hover{background:#1F1E26;color:#fff}" +
      "#avanav a.nvi.on{background:#262533;color:#fff;box-shadow:inset 2px 0 0 #6F66DB}" +
      "#avanav a.nvi i{font-size:17px}" +
      "#avanav .nvn{margin-left:auto;font-size:11px;font-weight:700;background:#33313f;color:#cfccdb;padding:1px 7px;border-radius:9px;font-variant-numeric:tabular-nums}" +
      "#avanav .nvn.hot{background:#FBF1E2;color:#9A5B12}" +
      "#avanav .nvw{margin-left:auto;font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9A5B12;background:#FBF1E2;padding:2px 6px;border-radius:2px}" +
      "#avanav .nvg{font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#5f5c70;padding:14px 10px 5px}" +
      "#avanav .nvf{margin-top:auto;padding:10px;font-size:11.5px;color:#77748a}" +
      "#avash{position:fixed;inset:0;background:rgba(16,15,21,.55);z-index:60;display:none;align-items:flex-end}" +
      "#avash.open{display:flex}" +
      "#avash .sh{background:#fff;width:100%;border-radius:12px 12px 0 0;padding:8px 8px calc(14px + env(safe-area-inset-bottom));font-family:'Plus Jakarta Sans',system-ui,sans-serif}" +
      "#avash .gr{width:38px;height:4px;border-radius:2px;background:#D9D9CC;margin:8px auto 12px}" +
      "#avash a,#avash button{display:flex;align-items:center;gap:12px;width:100%;padding:15px 14px;border:0;background:none;font:inherit;font-size:15px;font-weight:600;color:#141418;text-decoration:none;text-align:left;cursor:pointer;border-radius:8px}" +
      "#avash a:active,#avash button:active{background:#F1F1E9}" +
      "#avash i{font-size:21px;color:#534AB7}" +
      "#avash .out{color:#B42318;border-top:1px solid #ECECE4;border-radius:0;margin-top:6px}" +
      "#avash .out i{color:#B42318}" +
      "body.avanav-pad{padding-left:212px}" +
      // ── phone first: bottom bar, thumb targets, safe area ──
      "@media(max-width:820px){" +
      "html,body{overflow-x:hidden;max-width:100vw}" +
      "#avanav{position:fixed;left:0;right:0;bottom:0;top:auto;width:auto;height:auto;flex-direction:row;padding:4px 4px calc(4px + env(safe-area-inset-bottom));gap:2px;border-top:1px solid #26242f;justify-content:space-around}" +
      "#avanav .nvb,#avanav .nvg,#avanav .nvf,#avanav .nvw,#avanav a.nvi.deskonly{display:none}" +
      "#avanav a.nvi{flex-direction:column;gap:3px;font-size:10.5px;font-weight:600;padding:8px 4px 6px;flex:1;min-width:0;justify-content:center;text-align:center;border-radius:6px;min-height:52px}" +
      "#avanav a.nvi.on{box-shadow:none;background:#262533}" +
      "#avanav a.nvi i{font-size:21px}" +
      "#avanav .nvn{position:absolute;transform:translate(14px,-9px);margin:0;font-size:10px;padding:0 5px}" +
      "body.avanav-pad{padding-left:0}" +
      "body{padding-bottom:calc(64px + env(safe-area-inset-bottom))}" +
      // The chat bubble sat on top of the last nav item. This bar owns the
      // bottom of the screen now, so it owns getting everything else out of
      // the way — including the panel, which otherwise runs off the bottom.
      "#avacb{bottom:calc(78px + env(safe-area-inset-bottom))!important}" +
      "#avacp{bottom:calc(142px + env(safe-area-inset-bottom))!important;height:min(520px,calc(100vh - 220px))!important}" +
      "}";
    document.head.appendChild(s);
  }

  function build() {
    css();
    var cur = here();
    var nav = document.createElement("nav");
    nav.id = "avanav";
    var html = '<a class="nvb" href="' + url({ href: "today.html" }) + '"><div class="nvlg">A</div>' +
      '<div><div style="font-weight:600;font-size:14px">Ava</div>' +
      '<div style="font-size:11px;color:#8B8B98" id="avanav-co">Elastic Admin</div></div></a>';
    var lastGroup = null;
    ITEMS.forEach(function (i, idx) {
      if (idx === 1 && lastGroup !== "Boards") { html += '<div class="nvg">Boards</div>'; lastGroup = "Boards"; }
      if (i.group && i.group !== lastGroup) { html += '<div class="nvg">' + i.group + "</div>"; lastGroup = i.group; }
      html += '<a class="nvi' + (i.key === cur ? " on" : "") + (i.phone ? "" : " deskonly") + '" href="' + url(i) + '">' +
        '<i class="ti ' + i.icon + '"></i> <span>' + (i.full || i.label) + "</span>" +
        (i.wip ? '<span class="nvw">beta</span>' : "") +
        '<span class="nvn" id="avanav-n-' + i.key + '" style="display:none"></span></a>';
    });
    html += '<div class="nvf">Elastic Admin</div>';
    nav.innerHTML = html;

    // Phone shows the short label; the rail shows the full one.
    if (matchMedia("(max-width:820px)").matches) {
      ITEMS.forEach(function (i) {
        var a = nav.querySelector('a[href="' + url(i) + '"] span');
        if (a && a.className !== "nvn") a.textContent = i.label;
      });
    }

    // Take over from whatever the page had.
    // The chat bubble is injected by ava-chat.js, which may land before or
    // after us and carries its own bottom:20px. A stylesheet rule here is a
    // race and a cache problem; setting it on the element is neither. Poll
    // briefly, since we can't know which script wins.
    if (matchMedia("(max-width:820px)").matches) {
      var tries = 0, lift = setInterval(function () {
        var b = document.getElementById("avacb"), p = document.getElementById("avacp");
        if (b) b.style.setProperty("bottom", "calc(80px + env(safe-area-inset-bottom, 0px))", "important");
        if (p) {
          p.style.setProperty("bottom", "calc(144px + env(safe-area-inset-bottom, 0px))", "important");
          p.style.setProperty("height", "min(520px, calc(100vh - 220px))", "important");
        }
        if ((b && p) || ++tries > 20) clearInterval(lift);
      }, 150);
    }

    // ── sign out, from anywhere ──────────────────────────────────────────
    // There was no way out of the app once the hub stopped being the landing
    // page: today.html had no sign-out and the phone bar had no room for one.
    function signOut(){ try{ localStorage.removeItem("ava_session"); }catch(e){} location.replace("index.html"); }
    nav.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("#avanav-out")) { e.preventDefault(); signOut(); }
    });

    // ── phone: "More" opens a sheet, not a page you can't get back from ──
    var sheet = document.createElement("div");
    sheet.id = "avash";
    sheet.innerHTML = '<div class="sh"><div class="gr"></div>' +
      ITEMS.filter(function (i) { return !i.phone || i.key === "hub"; }).map(function (i) {
        return '<a href="' + url(i) + '"><i class="ti ' + i.icon + '"></i> ' + (i.full || i.label) + "</a>";
      }).join("") +
      '<button class="out" id="avash-out"><i class="ti ti-logout"></i> Sign out</button></div>';
    document.body.appendChild(sheet);
    sheet.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("#avash-out")) { signOut(); return; }
      if (e.target === sheet) sheet.classList.remove("open");
    });
    nav.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a.nvi");
      if (!a) return;
      var it = ITEMS.filter(function (i) { return url(i) === a.getAttribute("href"); })[0];
      if (it && it.sheet) {
        e.preventDefault();
        sheet.classList.add("open");
      }
    });

    var old = document.querySelector("aside.side");
    var app = document.querySelector(".app");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    if (app) app.insertBefore(nav, app.firstChild);
    else { document.body.appendChild(nav); document.body.classList.add("avanav-pad"); }
  }

  global.avaNav = {
    /** avaNav.counts({today: 3, books: 21}) — hot-styles anything urgent. */
    counts: function (map) {
      Object.keys(map || {}).forEach(function (k) {
        var el = document.getElementById("avanav-n-" + k);
        if (!el) return;
        var v = map[k];
        if (v === null || v === undefined || v === 0) { el.style.display = "none"; return; }
        el.style.display = "";
        el.textContent = v;
        el.className = "nvn" + (k === "today" ? " hot" : "");
      });
    },
    company: function (name) { var e = document.getElementById("avanav-co"); if (e && name) e.textContent = name; },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})(window);
