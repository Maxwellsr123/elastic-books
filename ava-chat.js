// ava-chat.js — the floating "chat to Ava" bubble, included on every page.
// Real assistant, not a toy: the backend (ava-chat) can search the connected
// inboxes, put a missed job on the board (the automation takes it from there)
// and read the board. History lives in sessionStorage per company.
(function(){
  var API="https://somgalhkmptkclgvxhca.supabase.co/functions/v1/ava-chat";
  var KPA="5c829c7f-0b63-4bbc-87b9-c24b822a564d";
  function companyId(){
    var qc=new URLSearchParams(location.search).get("c");
    if(qc)return qc;
    try{
      var s=JSON.parse(localStorage.getItem("ava_session")||"null");
      if(s&&!s.looper&&s.companies&&s.companies.length)return s.companies[0].id;
    }catch(e){}
    if(window.IS_DEV&&window.SANDBOX_CO)return KPA; // dev pages browse KPA data
    return KPA;
  }
  var CO=companyId(), KEY="ava_chat_"+CO;
  function hist(){try{return JSON.parse(sessionStorage.getItem(KEY)||"[]");}catch(e){return [];}}
  function save(h){try{sessionStorage.setItem(KEY,JSON.stringify(h.slice(-24)));}catch(e){}}
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}

  var css=document.createElement("style");
  css.textContent=
    "#avacb{position:fixed;right:20px;bottom:20px;z-index:900;width:54px;height:54px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#5B54E6,#7B74EE);color:#fff;font-size:22px;box-shadow:0 8px 24px rgba(91,84,230,.4);display:flex;align-items:center;justify-content:center;transition:transform .12s}" +
    "#avacb:hover{transform:scale(1.06)}" +
    "#avacp,#avacp *{text-transform:none!important;letter-spacing:normal!important}" +
    "#avacp{position:fixed;right:20px;bottom:84px;z-index:901;width:min(380px,calc(100vw - 40px));height:min(540px,calc(100vh - 120px));background:#fff;border:1px solid #E9E9E2;border-radius:12px;box-shadow:0 18px 60px rgba(20,20,24,.22);display:none;flex-direction:column;overflow:hidden;font-family:Inter,system-ui,sans-serif}" +
    "#avacp.open{display:flex}" +
    "#avach{display:flex;align-items:center;gap:9px;padding:12px 14px;background:linear-gradient(135deg,#141418,#242432);color:#fff}" +
    "#avach .t{font-size:14px;font-weight:600}#avach .s{font-size:11px;color:#b9b9c9}" +
    "#avacm{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:9px;background:#F7F7F4}" +
    ".avamsg{max-width:86%;padding:9px 12px;border-radius:11px;font-size:13.5px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}" +
    ".avamsg.u{align-self:flex-end;background:#5B54E6;color:#fff;border-bottom-right-radius:4px}" +
    ".avamsg.a{align-self:flex-start;background:#fff;border:1px solid #E9E9E2;color:#141418;border-bottom-left-radius:4px}" +
    ".avamsg.think{color:#67676E;font-style:italic;background:#fff;border:1px dashed #E9E9E2}" +
    "#avacf{display:flex;gap:8px;padding:10px;border-top:1px solid #E9E9E2;background:#fff}" +
    "#avaci{flex:1;border:1px solid #E9E9E2;border-radius:8px;padding:9px 11px;font-size:13.5px;font-family:inherit;outline:none;resize:none;max-height:90px}" +
    "#avaci:focus{border-color:#5B54E6}" +
    "#avacs{border:none;background:#5B54E6;color:#fff;border-radius:8px;padding:0 14px;font-size:15px;cursor:pointer}" +
    "#avacs:disabled{opacity:.5;cursor:default}";
  document.head.appendChild(css);

  var bub=document.createElement("button");bub.id="avacb";bub.title="Chat to Ava";bub.innerHTML="💬";
  var panel=document.createElement("div");panel.id="avacp";
  panel.innerHTML=
    '<div id="avach"><div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#5B54E6,#7B74EE);display:flex;align-items:center;justify-content:center;font-weight:700">A</div>'+
    '<div style="flex:1"><div class="t">Ava</div><div class="s">can search your inbox &amp; sort the board</div></div>'+
    '<button id="avacx" style="background:none;border:none;color:#b9b9c9;font-size:18px;cursor:pointer">×</button></div>'+
    '<div id="avacm"></div>'+
    '<div id="avacf"><textarea id="avaci" rows="1" placeholder="e.g. I think you missed a job from Sarah last week…"></textarea><button id="avacs">➤</button></div>';
  document.addEventListener("DOMContentLoaded",function(){document.body.appendChild(bub);document.body.appendChild(panel);render();});
  if(document.readyState!=="loading"){document.body.appendChild(bub);document.body.appendChild(panel);render();}

  function box(){return document.getElementById("avacm");}
  function render(){
    var m=box();if(!m)return;
    var h=hist();
    m.innerHTML=h.length?"":'<div class="avamsg a">Hey, I run the scheduling here. Ask me anything: "find the job I think you missed from Dave", "what\'s on the board?", "did William get booked?"</div>';
    h.forEach(function(x){var d=document.createElement("div");d.className="avamsg "+(x.role==="user"?"u":"a");d.textContent=x.content;m.appendChild(d);});
    m.scrollTop=m.scrollHeight;
  }
  function thinking(on){
    var m=box();var t=document.getElementById("avathink");
    if(on&&!t){t=document.createElement("div");t.id="avathink";t.className="avamsg a think";t.textContent="Ava's looking…";m.appendChild(t);m.scrollTop=m.scrollHeight;}
    if(!on&&t)t.remove();
  }
  function send(){
    var inp=document.getElementById("avaci"),btn=document.getElementById("avacs");
    var text=(inp.value||"").trim();if(!text)return;
    inp.value="";btn.disabled=true;
    var h=hist();h.push({role:"user",content:text});save(h);render();thinking(true);
    fetch(API,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({company:CO,messages:h})})
      .then(function(r){return r.json();})
      .then(function(d){
        thinking(false);btn.disabled=false;
        var h2=hist();h2.push({role:"assistant",content:(d&&d.reply)||(d&&d.error?("Hit a snag: "+d.error):"Hit a snag — try again?")});save(h2);render();
      })
      .catch(function(){thinking(false);btn.disabled=false;var h2=hist();h2.push({role:"assistant",content:"Couldn't reach the server — try again in a moment."});save(h2);render();});
  }
  document.addEventListener("click",function(e){
    if(e.target.closest&&e.target.closest("#avacb")){panel.classList.toggle("open");if(panel.classList.contains("open")){render();var i=document.getElementById("avaci");if(i)setTimeout(function(){i.focus();},60);}return;}
    if(e.target.closest&&e.target.closest("#avacx")){panel.classList.remove("open");return;}
    if(e.target.closest&&e.target.closest("#avacs")){send();return;}
  });
  document.addEventListener("keydown",function(e){
    if(e.target&&e.target.id==="avaci"&&e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}
  });
})();
