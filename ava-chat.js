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
    return ""; // never fall back to KPA — a stranger with no session must not see client data
  }
  var CO=companyId(), KEY="ava_chat_"+CO;
  function hist(){try{return JSON.parse(sessionStorage.getItem(KEY)||"[]");}catch(e){return [];}}
  function save(h){try{sessionStorage.setItem(KEY,JSON.stringify(h.slice(-24)));}catch(e){}}
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}

  var css=document.createElement("style");
  css.textContent=
    "#avacb{position:fixed;right:20px;bottom:20px;z-index:900;width:54px;height:54px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#534AB7,#6F66DB);color:#fff;font-size:22px;box-shadow:0 8px 24px rgba(83,74,183,.4);display:flex;align-items:center;justify-content:center;transition:transform .12s}" +
    "#avacb:hover{transform:scale(1.06)}" +
    "#avacp,#avacp *{text-transform:none!important;letter-spacing:normal!important}" +
    "#avacp{position:fixed;right:20px;bottom:84px;z-index:901;width:min(380px,calc(100vw - 40px));height:min(540px,calc(100vh - 120px));background:#fff;border:1px solid #D9D9CC;border-radius:12px;box-shadow:0 18px 60px rgba(20,20,24,.22);display:none;flex-direction:column;overflow:hidden;font-family:'Plus Jakarta Sans',system-ui,sans-serif}" +
    "#avacp.open{display:flex}" +
    "#avach{display:flex;align-items:center;gap:9px;padding:12px 14px;background:linear-gradient(135deg,#141418,#242432);color:#fff}" +
    "#avach .t{font-size:14px;font-weight:600}#avach .s{font-size:11px;color:#b9b9c9}" +
    "#avacm{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:9px;background:#FFFFFF}" +
    ".avamsg{max-width:86%;padding:9px 12px;border-radius:11px;font-size:13.5px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}" +
    ".avamsg.u{align-self:flex-end;background:#534AB7;color:#fff;border-bottom-right-radius:4px}" +
    ".avamsg.a{align-self:flex-start;background:#fff;border:1px solid #D9D9CC;color:#141418;border-bottom-left-radius:4px}" +
    ".avamsg.think{color:#67676E;font-style:italic;background:#fff;border:1px dashed #D9D9CC}" +
    "#avacf{display:flex;gap:8px;padding:10px;border-top:1px solid #D9D9CC;background:#fff}" +
    "#avaci{flex:1;border:1px solid #D9D9CC;border-radius:8px;padding:9px 11px;font-size:13.5px;font-family:inherit;outline:none;resize:none;max-height:90px}" +
    "#avaci:focus{border-color:#FF6A1A}" +
    "#avacs{border:none;background:#FF6A1A;color:#fff;border-radius:8px;padding:0 14px;font-size:15px;cursor:pointer}" +
    "#avacs:disabled{opacity:.5;cursor:default}" +
    "#avacmic{border:1px solid #D9D9CC;background:#fff;border-radius:8px;padding:0 11px;font-size:15px;cursor:pointer;line-height:1}" +
    "#avacmic.rec{background:#B42318;border-color:#B42318;animation:avapulse 1.1s ease-in-out infinite}" +
    "@keyframes avapulse{0%,100%{opacity:1}50%{opacity:.55}}";
  document.head.appendChild(css);

  var bub=document.createElement("button");bub.id="avacb";bub.title="Chat to Ava";bub.innerHTML="💬";
  var panel=document.createElement("div");panel.id="avacp";
  panel.innerHTML=
    '<div id="avach"><div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#534AB7,#6F66DB);display:flex;align-items:center;justify-content:center;font-weight:700">A</div>'+
    '<div style="flex:1"><div class="t">Ava</div><div class="s">can search your inbox &amp; sort the board</div></div>'+
    '<button id="avacx" style="background:none;border:none;color:#b9b9c9;font-size:18px;cursor:pointer">×</button></div>'+
    '<div id="avacm"></div>'+
    '<div id="avacf"><button id="avacmic" title="Hold to record a voice note">🎤</button><textarea id="avaci" rows="1" placeholder="Type, or tap the mic and talk…"></textarea><button id="avacs">➤</button></div>';
  function mount(){
    // Two ways into the same chat is one too many (Max, 31 Jul). A page that
    // already has an ask bar sets window.AVA_CHAT_NO_BUBBLE and owns the entry.
    if(!window.AVA_CHAT_NO_BUBBLE)document.body.appendChild(bub);
    document.body.appendChild(panel);render();
  }
  document.addEventListener("DOMContentLoaded",mount);
  if(document.readyState!=="loading")mount();

  function box(){return document.getElementById("avacm");}
  function render(){
    var m=box();if(!m)return;
    var h=hist();
    m.innerHTML=h.length?"":'<div class="avamsg a">Hey, I run the books here. Ask me anything: "what\'s still waiting on a receipt?", "who owes us the most?", "how much GST should I put aside?"</div>';
    h.forEach(function(x){var d=document.createElement("div");d.className="avamsg "+(x.role==="user"?"u":"a");d.textContent=x.content;m.appendChild(d);});
    m.scrollTop=m.scrollHeight;
  }
  function thinking(on){
    var m=box();var t=document.getElementById("avathink");
    if(on&&!t){t=document.createElement("div");t.id="avathink";t.className="avamsg a think";t.textContent="Ava's looking…";m.appendChild(t);m.scrollTop=m.scrollHeight;}
    if(!on&&t)t.remove();
  }
  // ── voice notes ──────────────────────────────────────────────────────
  // Tap to start, tap to stop — hold-to-talk loses the recording every time a
  // phone shows a permission prompt or the finger slides. The audio goes to
  // ava-chat for transcription and comes back as text, which is then sent the
  // normal way, so a voice note and a typed one are the same conversation.
  var rec=null,chunks=[];
  function micBtn(){return document.getElementById("avacmic");}
  function setRec(on){var b=micBtn();if(b){b.className=on?"rec":"";b.textContent=on?"■":"🎤";b.title=on?"Stop and send":"Tap to record a voice note";}}
  function note(msg){var h=hist();h.push({role:"assistant",content:msg});save(h);render();}
  function toggleRec(){
    if(rec){try{rec.stop();}catch(e){}return;}
    if(!navigator.mediaDevices||!window.MediaRecorder){note("This browser won't let me record — type it instead.");return;}
    navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
      var mime=["audio/webm","audio/mp4","audio/ogg"].filter(function(m){
        return window.MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m);})[0];
      rec=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);
      chunks=[];
      rec.ondataavailable=function(ev){if(ev.data&&ev.data.size)chunks.push(ev.data);};
      rec.onstop=function(){
        stream.getTracks().forEach(function(t){t.stop();});
        var type=(rec&&rec.mimeType)||"audio/webm";rec=null;setRec(false);
        var blob=new Blob(chunks,{type:type});chunks=[];
        if(blob.size<1200){note("That was too short to hear — try again.");return;}
        var fr=new FileReader();
        fr.onload=function(){
          var b64=String(fr.result).split(",")[1];
          var m=box();var t=document.createElement("div");t.className="avamsg u";t.style.opacity=".6";t.textContent="🎤 transcribing…";
          if(m){m.appendChild(t);m.scrollTop=m.scrollHeight;}
          fetch(API,{method:"POST",headers:{"content-type":"application/json"},
            body:JSON.stringify({company:CO,audio_b64:b64,mime:type.split(";")[0]})})
            .then(function(r){return r.json();})
            .then(function(d){
              if(t.parentNode)t.remove();
              if(d&&d.text){var i=document.getElementById("avaci");if(i)i.value=d.text;send();}
              else note((d&&d.error)||"I couldn't make that out — try again, or type it.");
            })
            .catch(function(){if(t.parentNode)t.remove();note("That didn't reach me — try again.");});
        };
        fr.readAsDataURL(blob);
      };
      rec.start();setRec(true);
    }).catch(function(){note("I need microphone permission to take a voice note — allow it in your browser settings, or type it instead.");});
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
  // Toggling from outside caused the double-open on phones: a tap fired both
  // focus and click, so the panel opened and shut (or opened twice). Callers
  // get open()/close(), never a toggle.
  function openPanel(focus){
    if(panel.classList.contains("open"))return;
    panel.classList.add("open");render();
    if(focus!==false){var i=document.getElementById("avaci");if(i)setTimeout(function(){i.focus();},60);}
  }
  window.avaChat={open:openPanel,close:function(){panel.classList.remove("open");},recording:function(){return !!rec;}};

  document.addEventListener("click",function(e){
    if(e.target.closest&&e.target.closest("#avacb")){
      if(panel.classList.contains("open"))panel.classList.remove("open");else openPanel(true);return;}
    if(e.target.closest&&e.target.closest("#avacx")){panel.classList.remove("open");return;}
    if(e.target.closest&&e.target.closest("#avacs")){send();return;}
    if(e.target.closest&&e.target.closest("#avacmic")){toggleRec();return;}
  });
  document.addEventListener("keydown",function(e){
    if(e.target&&e.target.id==="avaci"&&e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}
  });
})();
