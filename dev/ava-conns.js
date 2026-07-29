// Ava — per-feature connections strip.
//
// One rule: a feature page shows ONLY the accounts that actually feed that
// feature. GST put-away is Xero alone. Auto Collect is Xero (what's overdue,
// what's been paid) + Gmail (the reminder goes from the owner's own address).
// Auto Scheduling is Gmail (the job requests) + Fergus (where it books).
// Auto Bookkeeping is Gmail + Xero — Fergus has nothing to do with it, and
// showing it there reads like Ava needs it.
//
// The central Connections page (connections.html) stays the one place that
// lists everything and does the connecting/disconnecting; these strips are
// status only, plus a shortcut when something the feature needs is missing.
//
//   avaConns("connrow", conns, [
//     {key:"gmail", note:"Where your receipts and bills land.", send:true},
//     {key:"xero",  note:"The bank lines Ava files them against."}
//   ]);
//
// `conns` is whatever the page's own endpoint returns — chase-list
// `integrations`, ava-schedule-list `connections`, or auto-collect `setup`.
// Shapes differ (inboxes[] vs gmail_inboxes, connect urls present or not), so
// everything is read defensively here rather than in four places.
(function () {
  var META = {
    gmail:  { name: "Gmail",  ic: "ti-mail",       col: "#EA4335" },
    xero:   { name: "Xero",   ic: "ti-calculator", col: "#13B5EA" },
    fergus: { name: "Fergus", ic: "ti-tools",      col: "#C2410C" }
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }

  function inboxCount(c) {
    if (c.gmail_inboxes != null) return Number(c.gmail_inboxes) || 0;
    return (c.inboxes && c.inboxes.length) || 0;
  }

  // pill + action for one provider. Three states: connected, connected but
  // missing the permission this feature needs (Gmail send), not connected.
  function line(item, c, last) {
    var m = META[item.key];
    if (!m) return "";
    var on = !!c[item.key];
    var url = c[item.key + "_url"] || "";
    var detail = "", pill, action = "";

    if (item.key === "gmail") {
      var n = inboxCount(c);
      if (n) detail = n + " inbox" + (n > 1 ? "es" : "");
    }

    if (on && item.send && !c.gmail_send) {
      pill = '<span class="pill p-warn">read only</span>';
      action = '<a href="' + esc(url || "connections.html") + '" class="btn btn-p" style="font-size:12px;padding:6px 11px;margin-left:9px">Allow sending</a>';
    } else if (on) {
      pill = '<span class="pill p-ok"><i class="ti ti-check" style="font-size:12px;vertical-align:-1px"></i> connected</span>';
    } else {
      pill = '<span class="pill p-warn">not connected</span>';
      action = '<a href="' + esc(url || "connections.html") + '" class="btn btn-p" style="font-size:12px;padding:6px 11px;margin-left:9px">Connect ' + esc(m.name) + '</a>';
    }

    return '<div style="display:flex;align-items:center;gap:11px;padding:9px 0' + (last ? "" : ";border-bottom:1px solid var(--line)") + '">'
      + '<div class="ic" style="width:30px;height:30px;font-size:16px;color:' + m.col + '"><i class="ti ' + m.ic + '"></i></div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-weight:500;font-size:13.5px">' + esc(m.name)
      + (detail ? ' <span style="color:var(--ink3);font-weight:400;font-size:12px">· ' + esc(detail) + '</span>' : "")
      + '</div>'
      + (item.note ? '<div style="font-size:11.5px;color:var(--ink3);line-height:1.45">' + esc(item.note) + '</div>' : "")
      + '</div>' + pill + action + '</div>';
  }

  // Render into `el` (id or element). Returns true if anything the feature
  // needs is still missing, so a page can lead with its own setup prompt.
  window.avaConns = function (el, conns, spec) {
    var box = typeof el === "string" ? document.getElementById(el) : el;
    if (!box) return false;
    var c = conns || {}, items = (spec || []).filter(function (i) { return i && META[i.key]; });
    if (!items.length) { box.style.display = "none"; return false; }
    box.style.display = "block";
    box.innerHTML = '<div style="background:#fff;border:1px solid var(--line);border-radius:6px;padding:4px 16px 12px">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0 2px">'
      + '<div style="font-size:12px;font-weight:600;color:var(--ink2)">Connections <span style="font-weight:400;color:var(--ink3)">· what this feature runs on</span></div>'
      + '<a href="connections.html" style="font-size:12px;color:#D2530F;font-weight:600;text-decoration:none;white-space:nowrap">Manage</a></div>'
      + items.map(function (i, ix) { return line(i, c, ix === items.length - 1); }).join("")
      + '</div>';
    return items.some(function (i) {
      return !c[i.key] || (i.key === "gmail" && i.send && !c.gmail_send);
    });
  };
})();
