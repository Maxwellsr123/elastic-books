// avaFeatureSwitch — the on/off toggle that sits at the TOP of a feature page.
//
// Every feature is refusable and every feature page says so in the same place,
// in the same shape (Max, 2026-07-31). It used to be a read-only "ON" pill at
// the top and a "Switch off" link buried under the list — so the state was
// where you'd look and the control wasn't.
//
// Flips the same agent_configs row as The Desk and the dashboard cards, via
// /features, so no two surfaces can disagree about what's running.
//
//   avaFeatureSwitch("mount-id", {company: "<uuid>", key: "gst_putaway",
//                                 name: "GST put-away", onChange: fn});
//
// `key` is one of bookkeeping | invoice_chaser | gst_putaway.
(function (global) {
  var API = "https://somgalhkmptkclgvxhca.supabase.co/functions/v1";

  function css() {
    if (document.getElementById("avafsw-css")) return;
    var s = document.createElement("style");
    s.id = "avafsw-css";
    s.textContent =
      ".avafsw{display:inline-flex;align-items:center;gap:9px;white-space:nowrap}" +
      ".avafsw .lb{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3,#9CA3AF)}" +
      ".avafsw .lb.on{color:var(--grn,#0E7A50)}" +
      ".avafsw button{all:unset;cursor:pointer;width:42px;height:24px;border-radius:999px;background:#D9D9CC;position:relative;transition:background .15s;flex:none}" +
      ".avafsw button:focus-visible{outline:2px solid var(--ind,#534AB7);outline-offset:2px}" +
      ".avafsw button[aria-checked=true]{background:var(--grn,#0E7A50)}" +
      ".avafsw button[disabled]{opacity:.55;cursor:default}" +
      ".avafsw button .kn{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s;box-shadow:0 1px 2px rgba(0,0,0,.25)}" +
      ".avafsw button[aria-checked=true] .kn{transform:translateX(18px)}";
    document.head.appendChild(s);
  }

  global.avaFeatureSwitch = function (mountId, opts) {
    var el = document.getElementById(mountId);
    if (!el || !opts || !opts.company || !opts.key) return;
    css();
    var name = opts.name || "this feature";
    var state = null;

    el.className = "avafsw";
    el.innerHTML = '<span class="lb">…</span><button role="switch" aria-checked="false" aria-label="Switch ' +
      name + ' on or off" disabled><span class="kn"></span></button>';
    var lb = el.querySelector(".lb"), btn = el.querySelector("button");

    function paint(on) {
      state = on;
      btn.disabled = false;
      btn.setAttribute("aria-checked", on ? "true" : "false");
      lb.textContent = on ? "On" : "Off";
      lb.className = "lb" + (on ? " on" : "");
    }
    function load() {
      fetch(API + "/features?company=" + encodeURIComponent(opts.company))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var f = ((d && d.features) || []).filter(function (x) { return x.key === opts.key; })[0];
          if (f) paint(!!f.on); else { lb.textContent = "—"; }
        })
        .catch(function () { lb.textContent = "—"; });
    }
    btn.addEventListener("click", function () {
      if (state === null) return;
      // Switching off stops Ava doing the work, not just hiding the page —
      // worth one question. Switching on never needs one.
      if (state && !confirm("Switch " + name + " off?\n\nAva stops doing it until you switch it back on.")) return;
      var want = !state;
      btn.disabled = true; lb.textContent = "…";
      fetch(API + "/features", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ company_id: opts.company, key: opts.key, on: want, by: "owner" }),
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d && d.ok) { paint(want); if (opts.onChange) opts.onChange(want); }
        else { paint(state); alert("Couldn't change it: " + ((d && d.error) || "unknown")); }
      }).catch(function () { paint(state); });
    });
    load();
  };
})(window);
