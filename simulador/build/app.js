/* Simulador Plano 2D → Pieza 3D. Archivo generado por scripts/build.mjs; no editar. */
(()=>{var ix=Object.defineProperty;var sx=(n,e)=>{for(var t in e)ix(n,t,{get:e[t],enumerable:!0})};var Is={};sx(Is,{$:()=>pe,bindDropdown:()=>ou,bindPressGroup:()=>Uo,bindSegmented:()=>$i,closeModal:()=>Rs,downloadBlob:()=>Fo,escapeHtml:()=>Je,getActiveTab:()=>Nn,getSegmented:()=>Oo,getTheme:()=>Do,holeItem:()=>Pp,initShell:()=>_u,layerItem:()=>fu,makeCollapsible:()=>Ip,measureItem:()=>mu,numberField:()=>ui,onMenu:()=>Bo,onProjection:()=>du,onShortcut:()=>tn,onTab:()=>hu,onTheme:()=>uu,regionItem:()=>pu,renderIcons:()=>dr,renderKV:()=>On,renderList:()=>Cs,setActiveTab:()=>Sn,setBuildInfo:()=>Po,setCoords:()=>Io,setDropzone:()=>gu,setEmpty:()=>qi,setExamples:()=>xu,setFile:()=>ol,setHint:()=>hi,setLoading:()=>fr,setPlanoLoaded:()=>Lo,setPressed:()=>gr,setProjection:()=>Cp,setPropsVisible:()=>mr,setRange:()=>ji,setSegmented:()=>No,setStatus:()=>pr,setTheme:()=>Rp,setWarnings:()=>cu,showModal:()=>rl,toast:()=>At,toggleDrawer:()=>ur,warnItem:()=>Lp});var lr="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z",cr="M3.5 7 12 11.5 20.5 7M12 11.5v10",tl="M12 2.5 20.5 7 12 11.5 3.5 7z",Ep="M3.5 7 12 11.5v10L3.5 17z",tu="M20.5 7 12 11.5v10l8.5-4.5z",wi=(n,e=.35)=>`<path d="${n}" fill="currentColor" fill-opacity="${e}" stroke="none"/>`,nu=n=>`${wi(n,.45)}<path d="${lr}"/><path d="${cr}"/>`,Ap={logo:`${wi(tl,.9)}${wi(tu,.55)}${wi(Ep,.3)}<path d="${lr}"/><path d="${cr}"/>`,open:'<path d="M3 19V6a2 2 0 0 1 2-2h4l2 2.5h6a2 2 0 0 1 2 2V10"/><path d="M3 19 5.6 11.4A2 2 0 0 1 7.5 10H20a1.5 1.5 0 0 1 1.4 2l-2.2 6.3A2 2 0 0 1 17.3 20H4a1 1 0 0 1-1-1z"/>',examples:'<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><circle cx="17.25" cy="6.75" r="3.75"/><path d="M6.75 13.5 10.5 20.5H3z"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',export:'<path d="M12 15V3.5"/><path d="m7.5 8 4.5-4.5L16.5 8"/><path d="M5 13v5.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V13"/>',download:'<path d="M12 3.5V15"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4.5 19.5h15"/>',upload:'<path d="M12 16V4.5"/><path d="M7.5 9 12 4.5 16.5 9"/><path d="M4 15.5v3a2.5 2.5 0 0 0 2.5 2.5h11a2.5 2.5 0 0 0 2.5-2.5v-3"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',moon:'<path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6z"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 0 1 4.9.6c0 1.7-2.5 2.3-2.5 3.9"/><path d="M12 17.2h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8h.01"/>',error:'<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',success:'<circle cx="12" cy="12" r="9"/><path d="m8 12.4 2.8 2.8L16 9.8"/>',warning:'<path d="M10.3 4 2.6 17.6A2 2 0 0 0 4.3 20.6h15.4a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17h.01"/>',check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',close:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',chevron:'<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',"chevron-right":'<path d="m9.5 6.5 5.5 5.5-5.5 5.5"/>',copy:'<rect x="9" y="9" width="11.5" height="11.5" rx="2"/><path d="M15 9V5a1.5 1.5 0 0 0-1.5-1.5h-8.5A1.5 1.5 0 0 0 3.5 5v8.5A1.5 1.5 0 0 0 5 15h4"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6"/><path d="m6 7 .9 12.1A2 2 0 0 0 8.9 21h6.2a2 2 0 0 0 2-1.9L18 7"/><path d="M9 7V4.5A1 1 0 0 1 10 3.5h4a1 1 0 0 1 1 1V7"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',refresh:'<path d="M20 11a8 8 0 0 0-14.6-4.5M4.5 3v4h4"/><path d="M4 13a8 8 0 0 0 14.6 4.5M19.5 21v-4h-4"/>',play:'<path d="M7.5 4.8v14.4a.8.8 0 0 0 1.2.7l11.4-7.2a.8.8 0 0 0 0-1.4L8.7 4.1a.8.8 0 0 0-1.2.7z" fill="currentColor" stroke="none"/>',cube:`${wi(tl,.3)}<path d="${lr}"/><path d="${cr}"/>`,drawing:'<path d="M14.5 3H6.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14.5 3v5h5"/><path d="M8 17.5v-5h3.5v-2H16v7z"/>',file:'<path d="M14.5 3H6.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14.5 3v5h5"/>',image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9.5" r="1.8"/><path d="m20.5 15.5-5-5-9.5 9.5"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M3 14.75h18M9 4v16"/>',code:'<path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5"/>',printer:'<path d="M7 9V3.5h10V9"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',camera:'<path d="M4 7.5h3l1.8-2.5h6.4L17 7.5h3a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.2" r="3.5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx=".5"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',layers:'<path d="M12 3 2.5 8 12 13l9.5-5z"/><path d="m2.5 12 9.5 5 9.5-5"/><path d="m2.5 16 9.5 5 9.5-5"/>',hole:'<circle cx="12" cy="12" r="6.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/>',"panel-left":'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9.5 4v16"/>',"panel-right":'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M14.5 4v16"/>',split:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',"view-iso":`${wi(tl,.4)}${wi(tu,.2)}<path d="${lr}"/><path d="${cr}"/>`,"view-front":nu(Ep),"view-top":nu(tl),"view-right":nu(tu),fit:'<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><rect x="8.5" y="8.5" width="7" height="7" rx="1"/>',perspective:'<path d="M3 7.5 21 3.5v17L3 16.5z"/><path d="M3 12h18M9 6.2v11.6M15 4.8v14.4"/>',orthographic:'<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 12h18M9 5v14M15 5v14"/>',edges:`<path d="${lr}" stroke-width="2.2"/><path d="${cr}" stroke-width="2.2"/>`,xray:`<path d="${lr}"/><path d="${cr}"/><path d="M3.5 17 12 12.5l8.5 4.5M12 2.5v10" stroke-dasharray="1.8 2"/>`,wireframe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M4.6 7.5h14.8M4.6 16.5h14.8"/>',grid:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',bbox:'<rect x="5" y="5" width="14" height="14" stroke-dasharray="2.5 2.2"/><rect x="3" y="3" width="4" height="4" rx=".6"/><rect x="17" y="3" width="4" height="4" rx=".6"/><rect x="3" y="17" width="4" height="4" rx=".6"/><rect x="17" y="17" width="4" height="4" rx=".6"/>',section:'<rect x="4" y="4" width="16" height="16" rx="2"/>'+wi("M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z",.35)+'<path d="M2 12h20"/>',invert:'<path d="M7.5 20V4M4.5 7l3-3 3 3"/><path d="M16.5 4v16M13.5 17l3 3 3-3"/>',inspect:'<path d="M5 3.5 10.6 20l2.4-7 7-2.4z"/><path d="m13 13 6 6"/>',select:'<path d="M5 3.5 10.6 20l2.4-7 7-2.4z"/>',point:'<circle cx="5.5" cy="18.5" r="2.2"/><circle cx="18.5" cy="5.5" r="2.2"/><path d="M7.2 16.8 16.8 7.2"/>',ruler:'<path d="M3 16.5 16.5 3 21 7.5 7.5 21z"/><path d="m7.5 12 2 2M10.5 9l2 2M13.5 6l2 2"/>',distance:'<path d="M4 4v16M20 4v16"/><path d="M7.5 12h9"/><path d="M10 9.5 7.5 12l2.5 2.5M14 9.5l2.5 2.5-2.5 2.5"/>',angle:'<path d="M4 20h16.5"/><path d="M4 20 14.5 4.5"/><path d="M11.5 20a7.5 7.5 0 0 0-3.3-6.2"/>',radius:'<circle cx="12" cy="12" r="9"/><path d="m12 12 6.4-6.4"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',area:wi("M4 8 12 3.5l8 5-2 11.5H6z",.3)+'<path d="M4 8 12 3.5l8 5-2 11.5H6z"/>',coords:'<path d="M4 3.5V20h16.5"/><path d="M14 12v8M4 10h8" stroke-dasharray="1.8 2"/><circle cx="14" cy="10" r="2.2"/>',thickness:'<path d="M3 5h18M3 19h18"/><path d="M12 8v8"/><path d="m9.5 10 2.5-2.5 2.5 2.5M9.5 14l2.5 2.5 2.5-2.5"/>',window:'<rect x="3.5" y="5" width="13" height="11" rx="1" stroke-dasharray="2.5 2"/><path d="M19 14v7M15.5 17.5h7"/>',axis:'<path d="M12 2v20" stroke-dasharray="4 2 1 2"/><path d="M19.5 11.5a7.5 3 0 0 1-15 0"/><path d="M4.5 11.5a7.5 3 0 0 1 13.4-1.8"/><path d="m18.6 7.2.2 2.7-2.6.4"/>',calibrate:'<path d="M3 18.5h18"/><path d="M6 18.5v-3M10 18.5v-2M14 18.5v-2M18 18.5v-3"/><circle cx="6" cy="7" r="2.2"/><circle cx="18" cy="7" r="2.2"/><path d="M8.5 7h7" stroke-dasharray="2 2"/>',extrude:'<path d="M3 16.5 12 21l9-4.5L12 12z"/><path d="M12 3v6.5M9 6l3-3 3 3"/>',revolve:'<path d="M12 2v20" stroke-dasharray="3 2.5"/><path d="M19.5 12a7.5 3 0 0 1-15 0"/><path d="M4.5 12a7.5 3 0 0 1 13.4-1.8"/><path d="m18.6 7.7.2 2.7-2.6.4"/>',multiview:'<rect x="3" y="3" width="8" height="8" rx="1.2"/><rect x="13" y="3" width="8" height="8" rx="1.2"/><rect x="3" y="13" width="8" height="8" rx="1.2"/><path d="M13 17h8M17 13v8" stroke-dasharray="1.8 2"/>'},GA=Object.keys(Ap);function ci(n,e=16){let t=Ap[n];if(!t)throw new Error(`Icono desconocido: ${n}`);return`<svg class="icon icon-${n}" width="${e}" height="${e}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${t}</svg>`}var Tp="plano3d.theme",iu=new Set,su=new Set,ru=new Set,nl=[],hn=null,il=null;function pe(n){return document.getElementById(n)}function Je(n){return String(n??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function dr(n=document){for(let e of n.querySelectorAll("i[data-icon]")){let t=document.createElement("template");t.innerHTML=ci(e.dataset.icon,Number(e.dataset.size)||16);let i=t.content.firstElementChild;e.className&&i.classList.add(...e.className.split(/\s+/).filter(Boolean)),e.replaceWith(i)}}var wp={info:"info",success:"success",warn:"warning",error:"error"};function At(n,{type:e="info",timeout:t}={}){let i=pe("toastStack");wp[e]||(e="info");let s=document.createElement("div");s.className=`toast toast-${e}`,s.setAttribute("role",e==="error"?"alert":"status"),s.innerHTML=`${ci(wp[e],16)}<div class="toast-msg"></div><button class="btn btn-icon btn-ghost" type="button" aria-label="Cerrar aviso">${ci("close",14)}</button>`,s.querySelector(".toast-msg").textContent=n;let r=0,o=()=>{clearTimeout(r),!(!s.isConnected||s.classList.contains("leaving"))&&(s.classList.add("leaving"),setTimeout(()=>s.remove(),160))};for(s.querySelector("button").addEventListener("click",o),i.appendChild(s);i.children.length>5;)i.firstElementChild.remove();let a=t??(e==="error"?8e3:e==="warn"?6e3:4e3);return a>0&&(r=setTimeout(o,a)),o}function rl(n,e){let t=pe("modal");il=document.activeElement,pe("modalTitle").textContent=n,pe("modalBody").innerHTML=e,dr(pe("modalBody")),t.hidden=!1,pe("modalClose").focus()}function Rs(){let n=pe("modal");n.hidden||(n.hidden=!0,pe("modalBody").innerHTML="",il&&il.focus&&il.focus())}function fr(n,e,t){pe("loadingOverlay").hidden=!n,e!=null&&(pe("loadingText").textContent=e),t!=null&&(pe("loadingTitle").textContent=t)}function pr({text:n,state:e,mode:t}={}){let i=pe("kernelChip");e&&(i.dataset.state=e),n!=null&&(pe("kernelText").textContent=n,i.title=n),t!=null&&(pe("statusMode").textContent=t)}function Io(n){pe("statusCoords").textContent=n||"\u2014"}function Po(n){pe("statusBuild").textContent=n||"Sin generar"}function hi(n,e="both"){let t=e==="2d"?["hint2d"]:e==="3d"?["hint3d"]:["hint2d","hint3d"];for(let i of t){let s=pe(i);s.textContent=n||"",s.hidden=!n}}function ol(n){let e=pe("fileChip"),t=pe("fileFormat");e.dataset.state=n?"loaded":"empty",pe("fileName").textContent=n?n.name:"Sin plano",e.title=n?n.name:"",t.hidden=!n||!n.format,t.textContent=n&&n.format?String(n.format).toUpperCase():""}function Lo(n){pe("stepPlano").dataset.state=n?"loaded":"empty",pe("planoEmpty").hidden=!!n,pe("planoInfo").hidden=!n}function mr(n){pe("sidebarRight").dataset.state=n?"ready":"empty",pe("propsEmpty").hidden=!!n,pe("propsBody").hidden=!n}function qi(n,e){pe(n==="2d"?"empty2d":"empty3d").hidden=!e}function cu(n=[]){let e=n.map(t=>typeof t=="string"?{text:t}:t);pe("warnCount").textContent=String(e.length),pe("btnWarnings").dataset.count=String(e.length),Cs(pe("warnList"),e,Lp)}function Sn(n){for(let e of pe("viewTabs").querySelectorAll("[data-tab]"))e.setAttribute("aria-selected",String(e.dataset.tab===n));pe("viewports").dataset.view=n;for(let e of iu)e(n)}function Nn(){return pe("viewports").dataset.view}function hu(n){return iu.add(n),()=>iu.delete(n)}function Rp(n){let e=n==="light"?"light":"dark";document.documentElement.dataset.theme=e;try{localStorage.setItem(Tp,e)}catch{}for(let t of su)t(e)}function Do(){return document.documentElement.dataset.theme==="light"?"light":"dark"}function uu(n){return su.add(n),()=>su.delete(n)}function Cp(n){let e=pe("btnProjection");e.dataset.value=n==="orthographic"?"orthographic":"perspective",e.querySelector(".proj-label").textContent=e.dataset.value==="orthographic"?"Ortogr\xE1fica":"Perspectiva"}function du(n){return ru.add(n),()=>ru.delete(n)}function $i(n,e){n.dataset.segBound||(n.dataset.segBound="1",n.addEventListener("click",t=>{let i=t.target.closest("button[data-value]");!i||!n.contains(i)||i.disabled||i.getAttribute("aria-pressed")!=="true"&&(No(n,i.dataset.value),n.dispatchEvent(new CustomEvent("segchange",{detail:i.dataset.value})))}),n.addEventListener("keydown",t=>{if(t.key!=="ArrowLeft"&&t.key!=="ArrowRight")return;let i=[...n.querySelectorAll("button[data-value]:not(:disabled)")],s=i.findIndex(o=>o.getAttribute("aria-pressed")==="true"),r=i[(s+(t.key==="ArrowRight"?1:i.length-1))%i.length];r.focus(),r.click(),t.preventDefault()})),e&&n.addEventListener("segchange",t=>e(t.detail))}function No(n,e){for(let t of n.querySelectorAll("button[data-value]"))t.setAttribute("aria-pressed",String(t.dataset.value===e));if(n.id)for(let t of document.querySelectorAll(`[data-panel-for="${n.id}"]`))t.hidden=t.dataset.panel!==e}function Oo(n){let e=n.querySelector('button[aria-pressed="true"]');return e?e.dataset.value:null}function Uo(n,{attr:e,mode:t="single"},i){n.addEventListener("click",s=>{let r=s.target.closest(`[data-${e}]`);if(!r||!n.contains(r)||r.disabled)return;let o=r.dataset[e],a=r.getAttribute("aria-pressed")==="true";if(t==="multi"){r.setAttribute("aria-pressed",String(!a)),i?.(o,!a);return}if(a&&t==="single")return;let l=a?null:o;gr(n,e,l),i?.(l,!!l)})}function gr(n,e,t,i){for(let s of n.querySelectorAll(`[data-${e}][aria-pressed]`))i===void 0?s.setAttribute("aria-pressed",String(s.dataset[e]===t)):s.dataset[e]===t&&s.setAttribute("aria-pressed",String(!!i))}function ou(n,e,t){let i=()=>[...e.querySelectorAll('[role="menuitem"]:not(:disabled)')],s={open(){hn&&hn.menu!==e&&hn.close(),e.hidden=!1,n.setAttribute("aria-expanded","true"),hn={button:n,menu:e,close:s.close},hr(),i()[0]?.focus()},close(r=!1){e.hidden||(e.hidden=!0,n.setAttribute("aria-expanded","false"),hn&&hn.menu===e&&(hn=null),r&&n.focus())}};return n.addEventListener("click",()=>e.hidden?s.open():s.close()),n.addEventListener("keydown",r=>{r.key==="ArrowDown"&&e.hidden&&(s.open(),r.preventDefault())}),e.addEventListener("keydown",r=>{let o=i(),a=o.indexOf(document.activeElement),l=null;r.key==="ArrowDown"?l=o[(a+1)%o.length]:r.key==="ArrowUp"?l=o[(a-1+o.length)%o.length]:r.key==="Home"?l=o[0]:r.key==="End"?l=o[o.length-1]:r.key==="Escape"?(s.close(!0),r.stopPropagation()):r.key==="Tab"&&s.close(),l&&(l.focus(),r.preventDefault())}),e.addEventListener("click",r=>{let o=r.target.closest('[role="menuitem"]');!o||o.disabled||(s.close(!0),t?.(o.dataset.value,o))}),s}function Ip(n,{collapsed:e,onToggle:t}={}){let i=n.querySelector(":scope > .collapsible-head"),s=r=>{n.classList.toggle("collapsed",!r),i.setAttribute("aria-expanded",String(r))};return n.dataset.collapsibleBound||(n.dataset.collapsibleBound="1",i.addEventListener("click",()=>{let r=n.classList.contains("collapsed");s(r),t?.(r)})),e!=null&&s(!e),s}function rx(n){let e=String(n),t=e.indexOf(".");return t<0?0:e.length-t-1}function ui(n,{min:e=-1/0,max:t=1/0,step:i=1,decimals:s,unit:r,onChange:o}={}){let a=n.tagName==="INPUT"?n:n.querySelector("input"),l=a.closest(".num-field, .mini-field")||a,c=l.querySelector(".unit"),h=s??rx(i),u=Number(String(a.value).replace(",","."));Number.isFinite(u)||(u=Math.max(e,Math.min(t,0)));let d=p=>p.toFixed(h),f=()=>{a.value=d(u),l.classList.remove("invalid")},m=(p,x=!0)=>{let E=Math.max(e,Math.min(t,p)),b=Math.abs(E-u)>1e-12;u=Number(E.toFixed(h)),f(),b&&x&&o?.(u)},_=()=>{let p=a.value.trim().replace(",","."),x=Number(p);return p===""||!Number.isFinite(x)?(l.classList.add("invalid"),null):x},g=(p,x)=>{let E=x.shiftKey?10:x.altKey?.1:1,b=_()??u;m(b+p*i*E)};return a.addEventListener("keydown",p=>{if(p.key==="Enter"){let x=_();x!=null&&m(x),a.select()}else p.key==="Escape"?(f(),a.blur()):(p.key==="ArrowUp"||p.key==="ArrowDown")&&(g(p.key==="ArrowUp"?1:-1,p),p.preventDefault())}),a.addEventListener("blur",()=>{let p=_();p==null?f():m(p)}),a.addEventListener("focus",()=>a.select()),a.addEventListener("input",()=>l.classList.remove("invalid")),a.addEventListener("wheel",p=>{document.activeElement===a&&(p.preventDefault(),g(p.deltaY<0?1:-1,p))},{passive:!1}),r!=null&&c&&(c.textContent=r),f(),{input:a,get:()=>u,set:p=>m(Number(p),!1),setUnit:p=>{c&&(c.textContent=p)},setRange:(p=e,x=t)=>{e=p,t=x,m(u,!1)}}}function ji(n,e){n.value=String(e),au(n)}function au(n){let e=Number(n.min||0),t=Number(n.max||100),i=t>e?(Number(n.value)-e)/(t-e)*100:0;n.style.setProperty("--pct",`${i}%`)}function On(n,e){n.innerHTML=e.filter(Boolean).map(t=>{if(t.section!=null)return`<div class="kv-section">${Je(t.section)}</div>`;let i=["kv-row",t.cls,t.bar!=null?"has-bar":""].filter(Boolean).join(" "),s=t.hint?` title="${Je(t.hint)}"`:"",r=t.unit?`<span class="unit">${Je(t.unit)}</span>`:"",o=t.bar!=null?`<div class="kv-bar ${Je(t.barCls||"")}"><span style="width:${(Math.max(0,Math.min(1,t.bar))*100).toFixed(1)}%"></span></div>`:"";return`<div class="${Je(i)}"><span class="kv-label"${s}>${Je(t.label)}</span><span class="kv-value">${Je(t.value??"\u2014")}${r}</span>${o}</div>`}).join("")}function Cs(n,e,t){n.textContent="";let i=document.createDocumentFragment();e.forEach((s,r)=>{let o=t(s,r);if(typeof o=="string"){let a=document.createElement("template");a.innerHTML=o.trim(),i.appendChild(a.content)}else o&&i.appendChild(o)}),dr(i),n.appendChild(i)}function fu({name:n,color:e="#9aa4b0",count:t=0,visible:i=!0}){let s=Je(n);return`<li data-layer="${s}"><label class="layer${i?"":" is-off"}">
<input type="checkbox" class="chk" data-action="visible"${i?" checked":""} aria-label="Mostrar capa ${s}">
<span class="swatch" style="--c:${Je(e)}"></span><span class="layer-name" title="${s}">${s}</span>
<span class="layer-count">${Je(t)}</span></label></li>`}function pu({index:n,name:e,color:t="#4c8dff",included:i=!0,selected:s=!1,open:r=!1,meta:o="",height:a="",z0:l="",unit:c="mm",holes:h=[]}){let u=["region",i?"":"is-excluded",s?"is-selected":"",r?"is-open":""].filter(Boolean).join(" "),d=Je(e??`Regi\xF3n ${n+1}`),f=h.length?`<button class="region-name" type="button" data-action="toggle" aria-expanded="${r}">${ci("chevron-right",12)}${d}</button>`:`<span class="region-name">${d}</span>`;return`<li class="${u}" data-region="${n}">
<div class="region-main"><input type="checkbox" class="chk" data-action="include"${i?" checked":""} aria-label="Incluir ${d}">
<span class="dot" style="--c:${Je(t)}"></span>${f}<span class="region-meta">${Je(o)}</span></div>
<div class="region-fields">
<label class="mini-field"><span class="mini-label">Altura</span><input type="text" inputmode="decimal" data-field="height" value="${Je(a)}"><span class="unit">${Je(c)}</span></label>
<label class="mini-field"><span class="mini-label">Z0</span><input type="text" inputmode="decimal" data-field="z0" value="${Je(l)}"><span class="unit">${Je(c)}</span></label>
</div>${h.length?`<ul class="hole-list"${r?"":" hidden"}>${h.map((m,_)=>Pp({index:_,unit:c,...m})).join("")}</ul>`:""}</li>`}function Pp({index:n,label:e,free:t=!1,op:i="through",depth:s="",unit:r="mm"}){let o=(a,l)=>`<option value="${a}"${i===a?" selected":""}>${l}</option>`;return`<li class="hole" data-hole="${n}">${ci("hole",14)}
<span class="hole-label${t?" is-free":""}">${Je(t?"Forma libre":e)}</span>
<select class="select" data-field="op" aria-label="Operaci\xF3n del agujero">${o("through","Pasante")}${o("blind","Ciego")}${o("fill","Rellenar")}</select>
<label class="mini-field hole-depth"${i==="blind"?"":" hidden"}><input type="text" inputmode="decimal" data-field="depth" value="${Je(s)}" aria-label="Profundidad"><span class="unit">${Je(r)}</span></label></li>`}var ox={inspect:"inspect",point:"point",distance:"distance",angle:"angle",radius:"radius",area:"area",coords:"coords",thickness:"thickness",measure2d:"ruler"};function mu({id:n,tool:e,title:t,text:i}){return`<li class="measure" data-measure="${Je(n)}"><span class="measure-icon">${ci(ox[e]||"ruler",15)}</span>
<span class="measure-title">${Je(t)}</span><span class="measure-value">${Je(i)}</span>
<button class="btn btn-icon btn-sm btn-ghost" type="button" data-action="delete" aria-label="Borrar medici\xF3n">${ci("close",14)}</button></li>`}function Lp({text:n,level:e="warn"}){let t=e==="error"?"error":e==="info"?"info":"warning";return`<li class="warn-item is-${Je(e)}">${ci(t,15)}<span class="warn-text">${Je(n)}</span></li>`}var ax=n=>n&&(n.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(n.tagName));function tn(n,e,{ctrl:t=!1,shift:i,alt:s=!1}={}){let r={key:n.toLowerCase(),cb:e,ctrl:t,shift:i,alt:s};return nl.push(r),()=>nl.splice(nl.indexOf(r),1)}function lx(n){if(n.defaultPrevented)return;let e=n.ctrlKey||n.metaKey;if(pe("modal").hidden){for(let t of nl)if(!(t.key!==n.key.toLowerCase()||t.ctrl!==e||t.alt!==n.altKey)&&!(t.shift!=null&&t.shift!==n.shiftKey)&&!(!t.ctrl&&ax(n.target))){n.preventDefault(),t.cb(n);return}}}function Fo(n,e){let t=URL.createObjectURL(n),i=document.createElement("a");i.href=t,i.download=e,i.style.display="none",document.body.appendChild(i),i.click(),i.remove(),setTimeout(()=>URL.revokeObjectURL(t),2e3)}function gu(n,e){let t=pe("fileInput"),i=pe("dropOverlay"),s=a=>[...a.dataTransfer?.types||[]].includes("Files"),r=0,o=()=>{r=0,i.hidden=!0,n.classList.remove("dragover")};n.addEventListener("click",()=>t.click()),n.addEventListener("keydown",a=>{(a.key==="Enter"||a.key===" ")&&(a.preventDefault(),t.click())}),t.addEventListener("change",()=>{let a=[...t.files];t.value="",a.length&&e(a)}),window.addEventListener("dragenter",a=>{s(a)&&(a.preventDefault(),r++===0&&(i.hidden=!1,n.classList.add("dragover")))}),window.addEventListener("dragover",a=>{s(a)&&(a.preventDefault(),a.dataTransfer.dropEffect="copy")}),window.addEventListener("dragleave",a=>{s(a)&&--r<=0&&o()}),window.addEventListener("drop",a=>{if(!s(a))return;a.preventDefault(),o();let l=[...a.dataTransfer.files];l.length&&e(l)})}var Dp=0,sl=null;function cx(n){let e=pe("tooltip"),t=n.dataset.tip;if(!t||hn&&hn.button===n)return;e.innerHTML=`<span>${Je(t)}</span>${n.dataset.kbd?`<kbd>${Je(n.dataset.kbd)}</kbd>`:""}`,e.hidden=!1;let i=n.getBoundingClientRect(),s=e.getBoundingClientRect(),r=8,o=n.dataset.tipSide||"bottom";o==="bottom"&&i.bottom+r+s.height>innerHeight-4&&(o="top");let a,l;o==="right"?(a=i.right+r,l=i.top+(i.height-s.height)/2):(a=i.left+(i.width-s.width)/2,l=o==="top"?i.top-r-s.height:i.bottom+r),e.style.left=`${Math.round(Math.max(4,Math.min(innerWidth-s.width-4,a)))}px`,e.style.top=`${Math.round(Math.max(4,Math.min(innerHeight-s.height-4,l)))}px`}function hr(){clearTimeout(Dp),sl=null;let n=pe("tooltip");n&&(n.hidden=!0)}function hx(){let n=(e,t)=>{e!==sl&&(hr(),sl=e,Dp=setTimeout(()=>cx(e),t))};document.addEventListener("pointerover",e=>{let t=e.target.closest?.("[data-tip]");t?n(t,400):sl&&hr()}),document.addEventListener("focusin",e=>{let t=e.target.closest?.("[data-tip]");t&&t.matches(":focus-visible")&&n(t,150)}),document.addEventListener("focusout",hr),document.addEventListener("pointerdown",hr,!0),document.addEventListener("scroll",hr,!0)}function ur(n,e){let t=pe("app"),i=n==="left"?"left-open":"right-open",s=e??!t.classList.contains(i);t.classList.remove("left-open","right-open"),s&&t.classList.add(i),pe("drawerBackdrop").hidden=!s,pe(n==="left"?"btnLeftDrawer":"btnRightDrawer").setAttribute("aria-expanded",String(s))}function _u(){let n=null;try{n=localStorage.getItem(Tp)}catch{}n&&(document.documentElement.dataset.theme=n),dr();for(let u of document.querySelectorAll("button[data-tip]:not([aria-label])"))u.setAttribute("aria-label",u.dataset.tip);hx();for(let u of document.querySelectorAll("[data-collapsible]"))Ip(u);for(let u of document.querySelectorAll(".seg"))$i(u);let e=ou(pe("btnExport"),pe("menuExport"),(u,d)=>lu.export?.(u,d)),t=ou(pe("btnExamples"),pe("menuExamples"),(u,d)=>lu.examples?.(u,d)),i=pe("viewTabs");i.addEventListener("click",u=>{let d=u.target.closest("[data-tab]");d&&d.getAttribute("aria-selected")!=="true"&&Sn(d.dataset.tab)}),i.addEventListener("keydown",u=>{if(u.key!=="ArrowLeft"&&u.key!=="ArrowRight")return;let d=[...i.querySelectorAll("[data-tab]")],f=d.findIndex(_=>_.getAttribute("aria-selected")==="true"),m=d[(f+(u.key==="ArrowRight"?1:d.length-1))%d.length];Sn(m.dataset.tab),m.focus()}),$i(pe("opSeg"),()=>{let u=pe("opSeg").querySelector('[aria-pressed="true"]');pe("stepOpSummary").textContent=u?u.textContent.trim():""}),$i(pe("unitsSeg"),u=>{pe("statusUnits").textContent=u}),pe("btnProjection").addEventListener("click",()=>{let u=pe("btnProjection").dataset.value==="orthographic"?"perspective":"orthographic";Cp(u);for(let d of ru)d(u)});let s=()=>pe("sectionBar").classList.toggle("is-off",!pe("chkSection").checked);pe("chkSection").addEventListener("change",s),s();for(let u of document.querySelectorAll('input[type="range"]'))au(u);document.addEventListener("input",u=>{u.target.matches?.('input[type="range"]')&&au(u.target)}),pe("btnTheme").addEventListener("click",()=>Rp(Do()==="dark"?"light":"dark"));let r=()=>rl("Ayuda",pe("helpTemplate").innerHTML);pe("btnHelp").addEventListener("click",r),tn("?",r);let o=()=>pe("fileInput").click();pe("btnOpen").addEventListener("click",o),pe("btnEmptyOpen").addEventListener("click",o),tn("o",o,{ctrl:!0}),pe("modalClose").addEventListener("click",Rs),pe("modal").addEventListener("mousedown",u=>{u.target===pe("modal")&&Rs()}),pe("btnLeftDrawer").addEventListener("click",()=>ur("left")),pe("btnRightDrawer").addEventListener("click",()=>ur("right")),pe("btnCloseRight").addEventListener("click",()=>ur("right",!1)),pe("drawerBackdrop").addEventListener("click",()=>ur("right",!1));let a=pe("btnWarnings"),l=pe("warnPopover"),c=u=>{l.hidden=!u,a.setAttribute("aria-expanded",String(u))};a.addEventListener("click",()=>c(l.hidden)),document.addEventListener("mousedown",u=>{hn&&!hn.menu.contains(u.target)&&!hn.button.contains(u.target)&&hn.close(),!l.hidden&&!l.contains(u.target)&&!a.contains(u.target)&&c(!1)}),document.addEventListener("keydown",u=>{if(u.key==="Escape"){if(!pe("modal").hidden)Rs();else if(hn)hn.close(!0);else if(!l.hidden)c(!1);else if(pe("app").classList.contains("left-open")||pe("app").classList.contains("right-open"))ur("right",!1);else return;u.preventDefault();return}lx(u)}),pe("layerList").addEventListener("change",u=>{u.target.matches('[data-action="visible"]')&&u.target.closest(".layer").classList.toggle("is-off",!u.target.checked)});let h=pe("regionList");return h.addEventListener("click",u=>{let d=u.target.closest('[data-action="toggle"]');if(!d)return;let f=d.closest(".region"),m=!f.classList.contains("is-open");f.classList.toggle("is-open",m),d.setAttribute("aria-expanded",String(m));let _=f.querySelector(".hole-list");_&&(_.hidden=!m)}),h.addEventListener("change",u=>{u.target.matches('[data-action="include"]')&&u.target.closest(".region").classList.toggle("is-excluded",!u.target.checked),u.target.matches('select[data-field="op"]')&&(u.target.closest(".hole").querySelector(".hole-depth").hidden=u.target.value!=="blind")}),{exportMenu:e,examplesMenu:t}}var lu={};function Bo(n,e){lu[n]=e}function xu(n){pe("menuExamples").innerHTML=n.map(e=>`<button class="menu-item${e.desc?" menu-item-2l":""}" role="menuitem" type="button" data-value="${Je(e.value)}">${ci(e.icon||"drawing",16)}<span>${Je(e.label)}${e.desc?`<span class="menu-desc">${Je(e.desc)}</span>`:""}</span></button>`).join("")}async function Np(){let n=globalThis.__OCCT_WASM_GZ_B64__;if(!n)throw new Error("No se encontr\xF3 el motor CAD (build/occt-wasm.js).");let e=atob(n),t=new Uint8Array(e.length);for(let s=0;s<e.length;s++)t[s]=e.charCodeAt(s);let i=new Blob([t]).stream().pipeThrough(new DecompressionStream("gzip"));return new Response(i).arrayBuffer()}var Op=n=>new Error(`El motor CAD se detuvo inesperadamente${n?` (${n})`:""}. Recargue la p\xE1gina para reiniciarlo.`),al=class{constructor(){this._worker=null,this._main=null,this._mode=null,this._seq=0,this._pending=new Map,this._queue=Promise.resolve(),this._ready=null,this._failed=null}get mode(){return this._mode}start(e){return this._ready||(this._ready=this._start(e)),this._ready}async _start({onStatus:e=()=>{}}={}){let t=globalThis.__PLANO3D_KERNEL_SRC__;if(!t)throw new Error("No se encontr\xF3 el c\xF3digo del motor CAD (build/kernel.js).");e("Descomprimiendo motor CAD\u2026");let i=await Np();e("Iniciando OpenCascade\u2026");try{let s=URL.createObjectURL(new Blob([t],{type:"text/javascript"}));this._worker=new Worker(s),URL.revokeObjectURL(s),this._worker.onmessage=o=>this._settle(o.data),this._worker.onerror=o=>this._mode==="worker"?this._fail(Op(o.message)):this._failAll(new Error(o.message||"Error en el worker del motor CAD.")),this._worker.onmessageerror=()=>this._fail(Op("mensaje ilegible"));let r=await this._send("init",{wasmBinary:i},[i]);return this._mode="worker",e("Motor CAD listo"),r}catch(s){this._worker&&this._worker.terminate(),this._worker=null,this._failAll(s),i.byteLength===0&&(i=await Np()),new Function(t)(),this._main=globalThis.__PLANO3D_KERNEL__;let r=await this._main.handle({type:"init",payload:{wasmBinary:i}});return this._mode="main",e("Motor CAD listo (hilo principal)"),r}}_send(e,t,i=[]){let s=++this._seq;return new Promise((r,o)=>{this._pending.set(s,{resolve:r,reject:o}),this._worker.postMessage({id:s,type:e,payload:t},i)})}_settle({id:e,ok:t,result:i,error:s,code:r}){let o=this._pending.get(e);if(!o)return;if(this._pending.delete(e),t)return o.resolve(i);let a=new Error(s);r&&(a.code=r),o.reject(a)}_failAll(e){for(let t of this._pending.values())t.reject(e);this._pending.clear()}_fail(e){this._failed||(this._failed=e),this._worker&&this._worker.terminate(),this._worker=null,this._mode=null,this._failAll(this._failed)}call(e,t){if(this._failed)return Promise.reject(this._failed);if(!this._ready)return Promise.reject(new Error("El motor CAD a\xFAn no est\xE1 listo."));let i=()=>{if(this._failed)throw this._failed;if(this._mode==="worker")return this._send(e,t);if(this._mode==="main")return this._main.handle({type:e,payload:t});throw new Error("El motor CAD a\xFAn no est\xE1 listo.")},s=this._queue,r=this._ready.then(()=>s,()=>{throw new Error("El motor CAD no se pudo iniciar.")}).then(i);return this._queue=r.catch(()=>{}),r}build(e){return this.call("build",e)}distance(e,t,i){return this.call("distance",{a:e,b:t,buildId:i})}exportShape(e){return this.call("export",e)}tessellate(e){return this.call("tessellate",e)}dispose(){this._fail(new Error("Motor CAD cerrado."))}};var cs={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},hs={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},xm=0,Qu=1,ym=2;var ba=1,bm=2,to=3,Kn=0,Bt=1,mn=2,_i=0,no=1,ed=2,td=3,nd=4,vm=5;var Vs=100,Mm=101,Sm=102,Em=103,Am=104,wm=200,Tm=201,Rm=202,Cm=203,id=204,sd=205,Im=206,Pm=207,Lm=208,Dm=209,Nm=210,Om=211,Um=212,Fm=213,Bm=214,Bl=0,kl=1,zl=2,Br=3,Hl=4,Vl=5,Gl=6,Wl=7,fc=0,km=1,zm=2,Jn=0,rd=1,od=2,ad=3,ld=4,cd=5,hd=6,va=7;var ud=300,us=301,Gs=302,pc=303,mc=304,Ma=306,kr=1e3,Fn=1001,zr=1002,Ut=1003,gc=1004;var Ws=1005;var Ft=1006,io=1007;var xi=1008;var yn=1009,dd=1010,fd=1011,so=1012,_c=1013,Qn=1014,zn=1015,ei=1016,xc=1017,yc=1018,ro=1020,pd=35902,md=35899,gd=1021,_d=1022,bn=1023,fi=1026,ds=1027,bc=1028,vc=1029,fs=1030,Mc=1031;var Sc=1033,Sa=33776,Ea=33777,Aa=33778,wa=33779,Ec=35840,Ac=35841,wc=35842,Tc=35843,Rc=36196,Cc=37492,Ic=37496,Pc=37488,Lc=37489,Ta=37490,Dc=37491,Nc=37808,Oc=37809,Uc=37810,Fc=37811,Bc=37812,kc=37813,zc=37814,Hc=37815,Vc=37816,Gc=37817,Wc=37818,Xc=37819,Yc=37820,$c=37821,qc=36492,jc=36494,Zc=36495,Kc=36283,Jc=36284,Ra=36285,Qc=36286;var Us=2300,Hr=2301,Ul=2302,Gu=2303,Wu=2400,Xu=2401,Yu=2402;var Hm=3200;var Ca=0,Vm=1,ti="",wt="srgb",Ko="srgb-linear",Jo="linear",pt="srgb";var Fl=7680,Ia=7681;var xd=34055,yd=34056;var bd=517;var eh=519,Gm=512,Wm=513,Xm=514,th=515,Ym=516,$m=517,nh=518,qm=519,vd=35044;var Md="300 es",qn=2e3,Vr=2001;function ux(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function dx(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function Qo(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function jm(){let n=Qo("canvas");return n.style.display="block",n}var Up={},Gr=null;function ea(...n){let e="THREE."+n.shift();Gr?Gr("log",e,...n):console.log(e,...n)}function Zm(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function We(...n){n=Zm(n);let e="THREE."+n.shift();if(Gr)Gr("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function Ye(...n){n=Zm(n);let e="THREE."+n.shift();if(Gr)Gr("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function Os(...n){let e=n.join(" ");e in Up||(Up[e]=!0,We(...n))}function Km(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Jm={[Bl]:kl,[zl]:Gl,[Hl]:Wl,[Br]:Vl,[kl]:Bl,[Gl]:zl,[Wl]:Hl,[Vl]:Br},jn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},nn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Fp=1234567,jo=Math.PI/180,Wr=180/Math.PI;function Di(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(nn[n&255]+nn[n>>8&255]+nn[n>>16&255]+nn[n>>24&255]+"-"+nn[e&255]+nn[e>>8&255]+"-"+nn[e>>16&15|64]+nn[e>>24&255]+"-"+nn[t&63|128]+nn[t>>8&255]+"-"+nn[t>>16&255]+nn[t>>24&255]+nn[i&255]+nn[i>>8&255]+nn[i>>16&255]+nn[i>>24&255]).toLowerCase()}function je(n,e,t){return Math.max(e,Math.min(t,n))}function Sd(n,e){return(n%e+e)%e}function fx(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function px(n,e,t){return n!==e?(t-n)/(e-n):0}function Zo(n,e,t){return(1-t)*n+t*e}function mx(n,e,t,i){return Zo(n,e,1-Math.exp(-t*i))}function gx(n,e=1){return e-Math.abs(Sd(n,e*2)-e)}function _x(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function xx(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function yx(n,e){return n+Math.floor(Math.random()*(e-n+1))}function bx(n,e){return n+Math.random()*(e-n)}function vx(n){return n*(.5-Math.random())}function Mx(n){n!==void 0&&(Fp=n);let e=Fp+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Sx(n){return n*jo}function Ex(n){return n*Wr}function Ax(n){return n>0&&Number.isInteger(n)&&2**Math.round(Math.log2(n))===n}function wx(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Tx(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Rx(n,e,t,i,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+i)/2),h=o((e+i)/2),u=r((e-i)/2),d=o((e-i)/2),f=r((i-e)/2),m=o((i-e)/2);switch(s){case"XYX":n.set(a*h,l*u,l*d,a*c);break;case"YZY":n.set(l*d,a*h,l*u,a*c);break;case"ZXZ":n.set(l*u,l*d,a*h,a*c);break;case"XZX":n.set(a*h,l*m,l*f,a*c);break;case"YXY":n.set(l*f,a*h,l*m,a*c);break;case"ZYZ":n.set(l*m,l*f,a*h,a*c);break;default:We("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function $n(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:case Uint8ClampedArray:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function xt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Rn={DEG2RAD:jo,RAD2DEG:Wr,generateUUID:Di,clamp:je,euclideanModulo:Sd,mapLinear:fx,inverseLerp:px,lerp:Zo,damp:mx,pingpong:gx,smoothstep:_x,smootherstep:xx,randInt:yx,randFloat:bx,randFloatSpread:vx,seededRandom:Mx,degToRad:Sx,radToDeg:Ex,isPowerOfTwo:Ax,ceilPowerOfTwo:wx,floorPowerOfTwo:Tx,setQuaternionFromProperEuler:Rx,normalize:xt,denormalize:$n},Rd=class Rd{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Rd.prototype.isVector2=!0;var Ie=Rd,It=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],h=i[s+2],u=i[s+3],d=r[o+0],f=r[o+1],m=r[o+2],_=r[o+3];if(u!==_||l!==d||c!==f||h!==m){let g=l*d+c*f+h*m+u*_;g<0&&(d=-d,f=-f,m=-m,_=-_,g=-g);let p=1-a;if(g<.9995){let x=Math.acos(g),E=Math.sin(x);p=Math.sin(p*x)/E,a=Math.sin(a*x)/E,l=l*p+d*a,c=c*p+f*a,h=h*p+m*a,u=u*p+_*a}else{l=l*p+d*a,c=c*p+f*a,h=h*p+m*a,u=u*p+_*a;let x=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=x,c*=x,h*=x,u*=x}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,s,r,o){let a=i[s],l=i[s+1],c=i[s+2],h=i[s+3],u=r[o],d=r[o+1],f=r[o+2],m=r[o+3];return e[t]=a*m+h*u+l*f-c*d,e[t+1]=l*m+h*d+c*u-a*f,e[t+2]=c*m+h*f+a*d-l*u,e[t+3]=h*m-a*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(s/2),u=a(r/2),d=l(i/2),f=l(s/2),m=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"YXZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"ZXY":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"ZYX":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"YZX":this._x=d*h*u+c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u-d*f*m;break;case"XZY":this._x=d*h*u-c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u+d*f*m;break;default:We("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=i+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(i>a&&i>u){let f=2*Math.sqrt(1+i-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>u){let f=2*Math.sqrt(1+a-i-u);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-i-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(je(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-s*a,this._w=o*h-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Cd=class Cd{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Bp.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Bp.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),h=2*(a*t-r*s),u=2*(r*i-o*t);return this.x=t+l*c+o*u-a*h,this.y=i+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this.z=je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this.z=je(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return yu.copy(this).projectOnVector(e),this.sub(yu)}reflect(e){return this.sub(yu.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Cd.prototype.isVector3=!0;var O=Cd,yu=new O,Bp=new It,Id=class Id{constructor(e,t,i,s,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],d=i[2],f=i[5],m=i[8],_=s[0],g=s[3],p=s[6],x=s[1],E=s[4],b=s[7],M=s[2],v=s[5],A=s[8];return r[0]=o*_+a*x+l*M,r[3]=o*g+a*E+l*v,r[6]=o*p+a*b+l*A,r[1]=c*_+h*x+u*M,r[4]=c*g+h*E+u*v,r[7]=c*p+h*b+u*A,r[2]=d*_+f*x+m*M,r[5]=d*g+f*E+m*v,r[8]=d*p+f*b+m*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-i*r*h+i*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,m=t*u+i*d+s*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/m;return e[0]=u*_,e[1]=(s*c-h*i)*_,e[2]=(a*i-s*o)*_,e[3]=d*_,e[4]=(h*t-s*l)*_,e[5]=(s*r-a*t)*_,e[6]=f*_,e[7]=(i*l-c*t)*_,e[8]=(o*t-i*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return Os("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(bu.makeScale(e,t)),this}rotate(e){return Os("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(bu.makeRotation(-e)),this}translate(e,t){return Os("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(bu.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Id.prototype.isMatrix3=!0;var $e=Id,bu=new $e,kp=new $e().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),zp=new $e().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Cx(){let n={enabled:!0,workingColorSpace:Ko,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===pt&&(s.r=Ni(s.r),s.g=Ni(s.g),s.b=Ni(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===pt&&(s.r=Fr(s.r),s.g=Fr(s.g),s.b=Fr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ti?Jo:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Os("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Os("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Ko]:{primaries:e,whitePoint:i,transfer:Jo,toXYZ:kp,fromXYZ:zp,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:wt},outputColorSpaceConfig:{drawingBufferColorSpace:wt}},[wt]:{primaries:e,whitePoint:i,transfer:pt,toXYZ:kp,fromXYZ:zp,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:wt}}}),n}var Qe=Cx();function Ni(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Fr(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var _r,Xr=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{_r===void 0&&(_r=Qo("canvas")),_r.width=e.width,_r.height=e.height;let s=_r.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=_r}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Qo("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Ni(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Ni(t[i]/255)*255):t[i]=Ni(t[i]);return{data:t,width:e.width,height:e.height}}else return We("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Ix=0,Oi=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Ix++}),this.uuid=Di(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(vu(s[o].image)):r.push(vu(s[o]))}else r=vu(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function vu(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Xr.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(We("Texture: Unable to serialize Texture."),{})}var Px=0,Mu=new O,rn=class n extends jn{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Fn,s=Fn,r=Ft,o=xi,a=bn,l=yn,c=n.DEFAULT_ANISOTROPY,h=ti){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Px++}),this.uuid=Di(),this.name="",this.source=new Oi(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Ie(0,0),this.repeat=new Ie(1,1),this.center=new Ie(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new $e,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Mu).x}get height(){return this.source.getSize(Mu).y}get depth(){return this.source.getSize(Mu).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){We(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){We(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ud)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case kr:e.x=e.x-Math.floor(e.x);break;case Fn:e.x=e.x<0?0:1;break;case zr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case kr:e.y=e.y-Math.floor(e.y);break;case Fn:e.y=e.y<0?0:1;break;case zr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};rn.DEFAULT_IMAGE=null;rn.DEFAULT_MAPPING=ud;rn.DEFAULT_ANISOTROPY=1;var Pd=class Pd{constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],m=l[9],_=l[2],g=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(m+g)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let E=(c+1)/2,b=(f+1)/2,M=(p+1)/2,v=(h+d)/4,A=(u+_)/4,y=(m+g)/4;return E>b&&E>M?E<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(E),s=v/i,r=A/i):b>M?b<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),i=v/s,r=y/s):M<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(M),i=A/r,s=y/r),this.set(i,s,r,t),this}let x=Math.sqrt((g-m)*(g-m)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(g-m)/x,this.y=(u-_)/x,this.z=(d-h)/x,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this.z=je(this.z,e.z,t.z),this.w=je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this.z=je(this.z,e,t),this.w=je(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Pd.prototype.isVector4=!0;var ht=Pd,Xl=class extends jn{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ft,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new ht(0,0,e,t),this.scissorTest=!1,this.viewport=new ht(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:i.depth},r=new rn(s),o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Ft,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Oi(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},xn=class extends Xl{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},ta=class extends rn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=Fn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Yl=class extends rn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=Fn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var dc=class dc{constructor(e,t,i,s,r,o,a,l,c,h,u,d,f,m,_,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,h,u,d,f,m,_,g)}set(e,t,i,s,r,o,a,l,c,h,u,d,f,m,_,g){let p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=m,p[11]=_,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new dc().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,s=1/xr.setFromMatrixColumn(e,0).length(),r=1/xr.setFromMatrixColumn(e,1).length(),o=1/xr.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=o*h,f=o*u,m=a*h,_=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+m*c,t[5]=d-_*c,t[9]=-a*l,t[2]=_-d*c,t[6]=m+f*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*h,f=l*u,m=c*h,_=c*u;t[0]=d+_*a,t[4]=m*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-m,t[6]=_+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*h,f=l*u,m=c*h,_=c*u;t[0]=d-_*a,t[4]=-o*u,t[8]=m+f*a,t[1]=f+m*a,t[5]=o*h,t[9]=_-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*h,f=o*u,m=a*h,_=a*u;t[0]=l*h,t[4]=m*c-f,t[8]=d*c+_,t[1]=l*u,t[5]=_*c+d,t[9]=f*c-m,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,f=o*c,m=a*l,_=a*c;t[0]=l*h,t[4]=_-d*u,t[8]=m*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+m,t[10]=d-_*u}else if(e.order==="XZY"){let d=o*l,f=o*c,m=a*l,_=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+_,t[5]=o*h,t[9]=f*u-m,t[2]=m*u-f,t[6]=a*h,t[10]=_*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Lx,e,Dx)}lookAt(e,t,i){let s=this.elements;return En.subVectors(e,t),En.lengthSq()===0&&(En.z=1),En.normalize(),Zi.crossVectors(i,En),Zi.lengthSq()===0&&(Math.abs(i.z)===1?En.x+=1e-4:En.z+=1e-4,En.normalize(),Zi.crossVectors(i,En)),Zi.normalize(),ll.crossVectors(En,Zi),s[0]=Zi.x,s[4]=ll.x,s[8]=En.x,s[1]=Zi.y,s[5]=ll.y,s[9]=En.y,s[2]=Zi.z,s[6]=ll.z,s[10]=En.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],d=i[9],f=i[13],m=i[2],_=i[6],g=i[10],p=i[14],x=i[3],E=i[7],b=i[11],M=i[15],v=s[0],A=s[4],y=s[8],w=s[12],L=s[1],T=s[5],C=s[9],R=s[13],P=s[2],D=s[6],k=s[10],V=s[14],j=s[3],q=s[7],z=s[11],H=s[15];return r[0]=o*v+a*L+l*P+c*j,r[4]=o*A+a*T+l*D+c*q,r[8]=o*y+a*C+l*k+c*z,r[12]=o*w+a*R+l*V+c*H,r[1]=h*v+u*L+d*P+f*j,r[5]=h*A+u*T+d*D+f*q,r[9]=h*y+u*C+d*k+f*z,r[13]=h*w+u*R+d*V+f*H,r[2]=m*v+_*L+g*P+p*j,r[6]=m*A+_*T+g*D+p*q,r[10]=m*y+_*C+g*k+p*z,r[14]=m*w+_*R+g*V+p*H,r[3]=x*v+E*L+b*P+M*j,r[7]=x*A+E*T+b*D+M*q,r[11]=x*y+E*C+b*k+M*z,r[15]=x*w+E*R+b*V+M*H,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],m=e[3],_=e[7],g=e[11],p=e[15],x=l*f-c*d,E=a*f-c*u,b=a*d-l*u,M=o*f-c*h,v=o*d-l*h,A=o*u-a*h;return t*(_*x-g*E+p*b)-i*(m*x-g*M+p*v)+s*(m*E-_*M+p*A)-r*(m*b-_*v+g*A)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],h=e[10];return t*(o*h-a*c)-i*(r*h-a*l)+s*(r*c-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],m=e[12],_=e[13],g=e[14],p=e[15],x=t*a-i*o,E=t*l-s*o,b=t*c-r*o,M=i*l-s*a,v=i*c-r*a,A=s*c-r*l,y=h*_-u*m,w=h*g-d*m,L=h*p-f*m,T=u*g-d*_,C=u*p-f*_,R=d*p-f*g,P=x*R-E*C+b*T+M*L-v*w+A*y;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let D=1/P;return e[0]=(a*R-l*C+c*T)*D,e[1]=(s*C-i*R-r*T)*D,e[2]=(_*A-g*v+p*M)*D,e[3]=(d*v-u*A-f*M)*D,e[4]=(l*L-o*R-c*w)*D,e[5]=(t*R-s*L+r*w)*D,e[6]=(g*b-m*A-p*E)*D,e[7]=(h*A-d*b+f*E)*D,e[8]=(o*C-a*L+c*y)*D,e[9]=(i*L-t*C-r*y)*D,e[10]=(m*v-_*b+p*x)*D,e[11]=(u*b-h*v-f*x)*D,e[12]=(a*w-o*T-l*y)*D,e[13]=(t*T-i*w+s*y)*D,e[14]=(_*E-m*M-g*x)*D,e[15]=(h*M-u*E+d*x)*D,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+i,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,m=r*u,_=o*h,g=o*u,p=a*u,x=l*c,E=l*h,b=l*u,M=i.x,v=i.y,A=i.z;return s[0]=(1-(_+p))*M,s[1]=(f+b)*M,s[2]=(m-E)*M,s[3]=0,s[4]=(f-b)*v,s[5]=(1-(d+p))*v,s[6]=(g+x)*v,s[7]=0,s[8]=(m+E)*A,s[9]=(g-x)*A,s[10]=(1-(d+_))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let o=xr.set(s[0],s[1],s[2]).length(),a=xr.set(s[4],s[5],s[6]).length(),l=xr.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Wn.copy(this);let c=1/o,h=1/a,u=1/l;return Wn.elements[0]*=c,Wn.elements[1]*=c,Wn.elements[2]*=c,Wn.elements[4]*=h,Wn.elements[5]*=h,Wn.elements[6]*=h,Wn.elements[8]*=u,Wn.elements[9]*=u,Wn.elements[10]*=u,t.setFromRotationMatrix(Wn),i.x=o,i.y=a,i.z=l,this}makePerspective(e,t,i,s,r,o,a=qn,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(i-s),d=(t+e)/(t-e),f=(i+s)/(i-s),m,_;if(l)m=r/(o-r),_=o*r/(o-r);else if(a===qn)m=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===Vr)m=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=qn,l=!1){let c=this.elements,h=2/(t-e),u=2/(i-s),d=-(t+e)/(t-e),f=-(i+s)/(i-s),m,_;if(l)m=1/(o-r),_=o/(o-r);else if(a===qn)m=-2/(o-r),_=-(o+r)/(o-r);else if(a===Vr)m=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};dc.prototype.isMatrix4=!0;var tt=dc,xr=new O,Wn=new tt,Lx=new O(0,0,0),Dx=new O(1,1,1),Zi=new O,ll=new O,En=new O,Hp=new tt,Vp=new It,Yt=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-je(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(je(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-je(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:We("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Hp.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Hp,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Vp.setFromEuler(this),this.setFromQuaternion(Vp,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Yt.DEFAULT_ORDER="XYZ";var Yr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Nx=0,Gp=new O,yr=new It,Ti=new tt,cl=new O,ko=new O,Ox=new O,Ux=new It,Wp=new O(1,0,0),Xp=new O(0,1,0),Yp=new O(0,0,1),$p={type:"added"},Fx={type:"removed"},br={type:"childadded",child:null},Su={type:"childremoved",child:null},Tt=class n extends jn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Nx++}),this.uuid=Di(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new O,t=new Yt,i=new It,s=new O(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new tt},normalMatrix:{value:new $e}}),this.matrix=new tt,this.matrixWorld=new tt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Yr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return yr.setFromAxisAngle(e,t),this.quaternion.multiply(yr),this}rotateOnWorldAxis(e,t){return yr.setFromAxisAngle(e,t),this.quaternion.premultiply(yr),this}rotateX(e){return this.rotateOnAxis(Wp,e)}rotateY(e){return this.rotateOnAxis(Xp,e)}rotateZ(e){return this.rotateOnAxis(Yp,e)}translateOnAxis(e,t){return Gp.copy(e).applyQuaternion(this.quaternion),this.position.add(Gp.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Wp,e)}translateY(e){return this.translateOnAxis(Xp,e)}translateZ(e){return this.translateOnAxis(Yp,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ti.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?cl.copy(e):cl.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),ko.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ti.lookAt(ko,cl,this.up):Ti.lookAt(cl,ko,this.up),this.quaternion.setFromRotationMatrix(Ti),s&&(Ti.extractRotation(s.matrixWorld),yr.setFromRotationMatrix(Ti),this.quaternion.premultiply(yr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ye("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent($p),br.child=e,this.dispatchEvent(br),br.child=null):Ye("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Fx),Su.child=e,this.dispatchEvent(Su),Su.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ti.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ti.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ti),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent($p),br.child=e,this.dispatchEvent(br),br.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ko,e,Ox),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ko,Ux,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),f=o(e.animations),m=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),m.length>0&&(i.nodes=m)}return i.object=s,i;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Tt.DEFAULT_UP=new O(0,1,0);Tt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Tt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var fn=class extends Tt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Bx={type:"move"},$r=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new fn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new fn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new fn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let g=t.getJointPose(_,i),p=this._getHandJoint(c,_);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Bx)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new fn;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},Qm={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ki={h:0,s:0,l:0},hl={h:0,s:0,l:0};function Eu(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ge=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=wt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=Qe.workingColorSpace){return this.r=e,this.g=t,this.b=i,Qe.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=Qe.workingColorSpace){if(e=Sd(e,1),t=je(t,0,1),i=je(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=Eu(o,r,e+1/3),this.g=Eu(o,r,e),this.b=Eu(o,r,e-1/3)}return Qe.colorSpaceToWorking(this,s),this}setStyle(e,t=wt){function i(r){r!==void 0&&parseFloat(r)<1&&We("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:We("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);We("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=wt){let i=Qm[e.toLowerCase()];return i!==void 0?this.setHex(i,t):We("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ni(e.r),this.g=Ni(e.g),this.b=Ni(e.b),this}copyLinearToSRGB(e){return this.r=Fr(e.r),this.g=Fr(e.g),this.b=Fr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=wt){return Qe.workingToColorSpace(sn.copy(this),e),Math.round(je(sn.r*255,0,255))*65536+Math.round(je(sn.g*255,0,255))*256+Math.round(je(sn.b*255,0,255))}getHexString(e=wt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Qe.workingColorSpace){Qe.workingToColorSpace(sn.copy(this),t);let i=sn.r,s=sn.g,r=sn.b,o=Math.max(i,s,r),a=Math.min(i,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-i)/u+2;break;case r:l=(i-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Qe.workingColorSpace){return Qe.workingToColorSpace(sn.copy(this),t),e.r=sn.r,e.g=sn.g,e.b=sn.b,e}getStyle(e=wt){Qe.workingToColorSpace(sn.copy(this),e);let t=sn.r,i=sn.g,s=sn.b;return e!==wt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Ki),this.setHSL(Ki.h+e,Ki.s+t,Ki.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ki),e.getHSL(hl);let i=Zo(Ki.h,hl.h,t),s=Zo(Ki.s,hl.s,t),r=Zo(Ki.l,hl.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},sn=new Ge;Ge.NAMES=Qm;var pi=class extends Tt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Yt,this.environmentIntensity=1,this.environmentRotation=new Yt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Xn=new O,Ri=new O,Au=new O,Ci=new O,vr=new O,Mr=new O,qp=new O,wu=new O,Tu=new O,Ru=new O,Cu=new ht,Iu=new ht,Pu=new ht,Li=class n{constructor(e=new O,t=new O,i=new O){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Xn.subVectors(e,t),s.cross(Xn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Xn.subVectors(s,t),Ri.subVectors(i,t),Au.subVectors(e,t);let o=Xn.dot(Xn),a=Xn.dot(Ri),l=Xn.dot(Au),c=Ri.dot(Ri),h=Ri.dot(Au),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-a*h)*d,m=(o*h-a*l)*d;return r.set(1-f-m,m,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Ci)===null?!1:Ci.x>=0&&Ci.y>=0&&Ci.x+Ci.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,Ci)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ci.x),l.addScaledVector(o,Ci.y),l.addScaledVector(a,Ci.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return Cu.setScalar(0),Iu.setScalar(0),Pu.setScalar(0),Cu.fromBufferAttribute(e,t),Iu.fromBufferAttribute(e,i),Pu.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Cu,r.x),o.addScaledVector(Iu,r.y),o.addScaledVector(Pu,r.z),o}static isFrontFacing(e,t,i,s){return Xn.subVectors(i,t),Ri.subVectors(e,t),Xn.cross(Ri).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Xn.subVectors(this.c,this.b),Ri.subVectors(this.a,this.b),Xn.cross(Ri).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,o,a;vr.subVectors(s,i),Mr.subVectors(r,i),wu.subVectors(e,i);let l=vr.dot(wu),c=Mr.dot(wu);if(l<=0&&c<=0)return t.copy(i);Tu.subVectors(e,s);let h=vr.dot(Tu),u=Mr.dot(Tu);if(h>=0&&u<=h)return t.copy(s);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(i).addScaledVector(vr,o);Ru.subVectors(e,r);let f=vr.dot(Ru),m=Mr.dot(Ru);if(m>=0&&f<=m)return t.copy(r);let _=f*c-l*m;if(_<=0&&c>=0&&m<=0)return a=c/(c-m),t.copy(i).addScaledVector(Mr,a);let g=h*m-f*u;if(g<=0&&u-h>=0&&f-m>=0)return qp.subVectors(r,s),a=(u-h)/(u-h+(f-m)),t.copy(s).addScaledVector(qp,a);let p=1/(g+_+d);return o=_*p,a=d*p,t.copy(i).addScaledVector(vr,o).addScaledVector(Mr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},$t=class{constructor(e=new O(1/0,1/0,1/0),t=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Yn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Yn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Yn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Yn):Yn.fromBufferAttribute(r,o),Yn.applyMatrix4(e.matrixWorld),this.expandByPoint(Yn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ul.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ul.copy(i.boundingBox)),ul.applyMatrix4(e.matrixWorld),this.union(ul)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Yn),Yn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(zo),dl.subVectors(this.max,zo),Sr.subVectors(e.a,zo),Er.subVectors(e.b,zo),Ar.subVectors(e.c,zo),Ji.subVectors(Er,Sr),Qi.subVectors(Ar,Er),Ps.subVectors(Sr,Ar);let t=[0,-Ji.z,Ji.y,0,-Qi.z,Qi.y,0,-Ps.z,Ps.y,Ji.z,0,-Ji.x,Qi.z,0,-Qi.x,Ps.z,0,-Ps.x,-Ji.y,Ji.x,0,-Qi.y,Qi.x,0,-Ps.y,Ps.x,0];return!Lu(t,Sr,Er,Ar,dl)||(t=[1,0,0,0,1,0,0,0,1],!Lu(t,Sr,Er,Ar,dl))?!1:(fl.crossVectors(Ji,Qi),t=[fl.x,fl.y,fl.z],Lu(t,Sr,Er,Ar,dl))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Yn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Yn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ii[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ii[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ii[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ii[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ii[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ii[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ii[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ii[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ii),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ii=[new O,new O,new O,new O,new O,new O,new O,new O],Yn=new O,ul=new $t,Sr=new O,Er=new O,Ar=new O,Ji=new O,Qi=new O,Ps=new O,zo=new O,dl=new O,fl=new O,Ls=new O;function Lu(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){Ls.fromArray(n,r);let a=s.x*Math.abs(Ls.x)+s.y*Math.abs(Ls.y)+s.z*Math.abs(Ls.z),l=e.dot(Ls),c=t.dot(Ls),h=i.dot(Ls);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Ot=new O,pl=new Ie,kx=0,mt=class extends jn{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:kx++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=vd,this.updateRanges=[],this.gpuType=zn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)pl.fromBufferAttribute(this,t),pl.applyMatrix3(e),this.setXY(t,pl.x,pl.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix3(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix4(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.applyNormalMatrix(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ot.fromBufferAttribute(this,t),Ot.transformDirection(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=$n(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=xt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=$n(t,this.array)),t}setX(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=$n(t,this.array)),t}setY(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=$n(t,this.array)),t}setZ(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=$n(t,this.array)),t}setW(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),i=xt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),i=xt(i,this.array),s=xt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),i=xt(i,this.array),s=xt(s,this.array),r=xt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var na=class extends mt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var ia=class extends mt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var Mt=class extends mt{constructor(e,t,i){super(new Float32Array(e),t,i)}},zx=new $t,Ho=new O,Du=new O,qt=class{constructor(e=new O,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):zx.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ho.subVectors(e,this.center);let t=Ho.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Ho,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Du.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ho.copy(e.center).add(Du)),this.expandByPoint(Ho.copy(e.center).sub(Du))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Hx=0,Un=new tt,Nu=new Tt,wr=new O,An=new $t,Vo=new $t,Gt=new O,Rt=class n extends jn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Hx++}),this.uuid=Di(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ux(e)?ia:na)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new $e().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Un.makeRotationFromQuaternion(e),this.applyMatrix4(Un),this}rotateX(e){return Un.makeRotationX(e),this.applyMatrix4(Un),this}rotateY(e){return Un.makeRotationY(e),this.applyMatrix4(Un),this}rotateZ(e){return Un.makeRotationZ(e),this.applyMatrix4(Un),this}translate(e,t,i){return Un.makeTranslation(e,t,i),this.applyMatrix4(Un),this}scale(e,t,i){return Un.makeScale(e,t,i),this.applyMatrix4(Un),this}lookAt(e){return Nu.lookAt(e),Nu.updateMatrix(),this.applyMatrix4(Nu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(wr).negate(),this.translate(wr.x,wr.y,wr.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Mt(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&We("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new $t);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ye("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];An.setFromBufferAttribute(r),this.morphTargetsRelative?(Gt.addVectors(this.boundingBox.min,An.min),this.boundingBox.expandByPoint(Gt),Gt.addVectors(this.boundingBox.max,An.max),this.boundingBox.expandByPoint(Gt)):(this.boundingBox.expandByPoint(An.min),this.boundingBox.expandByPoint(An.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ye('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new qt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ye("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(e){let i=this.boundingSphere.center;if(An.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Vo.setFromBufferAttribute(a),this.morphTargetsRelative?(Gt.addVectors(An.min,Vo.min),An.expandByPoint(Gt),Gt.addVectors(An.max,Vo.max),An.expandByPoint(Gt)):(An.expandByPoint(Vo.min),An.expandByPoint(Vo.max))}An.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Gt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Gt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Gt.fromBufferAttribute(a,c),l&&(wr.fromBufferAttribute(e,c),Gt.add(wr)),s=Math.max(s,i.distanceToSquared(Gt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ye('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ye("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new mt(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let y=0;y<i.count;y++)a[y]=new O,l[y]=new O;let c=new O,h=new O,u=new O,d=new Ie,f=new Ie,m=new Ie,_=new O,g=new O;function p(y,w,L){c.fromBufferAttribute(i,y),h.fromBufferAttribute(i,w),u.fromBufferAttribute(i,L),d.fromBufferAttribute(r,y),f.fromBufferAttribute(r,w),m.fromBufferAttribute(r,L),h.sub(c),u.sub(c),f.sub(d),m.sub(d);let T=1/(f.x*m.y-m.x*f.y);isFinite(T)&&(_.copy(h).multiplyScalar(m.y).addScaledVector(u,-f.y).multiplyScalar(T),g.copy(u).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(T),a[y].add(_),a[w].add(_),a[L].add(_),l[y].add(g),l[w].add(g),l[L].add(g))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let y=0,w=x.length;y<w;++y){let L=x[y],T=L.start,C=L.count;for(let R=T,P=T+C;R<P;R+=3)p(e.getX(R+0),e.getX(R+1),e.getX(R+2))}let E=new O,b=new O,M=new O,v=new O;function A(y){M.fromBufferAttribute(s,y),v.copy(M);let w=a[y];E.copy(w),E.sub(M.multiplyScalar(M.dot(w))).normalize(),b.crossVectors(v,w);let T=b.dot(l[y])<0?-1:1;o.setXYZW(y,E.x,E.y,E.z,T)}for(let y=0,w=x.length;y<w;++y){let L=x[y],T=L.start,C=L.count;for(let R=T,P=T+C;R<P;R+=3)A(e.getX(R+0)),A(e.getX(R+1)),A(e.getX(R+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new mt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let s=new O,r=new O,o=new O,a=new O,l=new O,c=new O,h=new O,u=new O;if(e)for(let d=0,f=e.count;d<f;d+=3){let m=e.getX(d+0),_=e.getX(d+1),g=e.getX(d+2);s.fromBufferAttribute(t,m),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,g),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(i,m),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,g),a.add(h),l.add(h),c.add(h),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Gt.fromBufferAttribute(e,t),Gt.normalize(),e.setXYZ(t,Gt.x,Gt.y,Gt.z)}toNonIndexed(){function e(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),f=0,m=0;for(let _=0,g=l.length;_<g;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*h;for(let p=0;p<h;p++)d[m++]=c[f++]}return new mt(d,h,u)}if(this.index===null)return We("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,i);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=e(d,i);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},sa=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=vd,this.updateRanges=[],this.version=0,this.uuid=Di()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[i+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Di()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Di()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},un=new O,wn=class n{constructor(e,t,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)un.fromBufferAttribute(this,t),un.applyMatrix4(e),this.setXYZ(t,un.x,un.y,un.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)un.fromBufferAttribute(this,t),un.applyNormalMatrix(e),this.setXYZ(t,un.x,un.y,un.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)un.fromBufferAttribute(this,t),un.transformDirection(e),this.setXYZ(t,un.x,un.y,un.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=$n(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=xt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=xt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=xt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=xt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=xt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=$n(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=$n(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=$n(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=$n(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=xt(t,this.array),i=xt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=xt(t,this.array),i=xt(i,this.array),s=xt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=xt(t,this.array),i=xt(i,this.array),s=xt(s,this.array),r=xt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){ea("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new mt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new n(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){ea("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Ou=new O,Vx=new O,Gx=new $e,dn=class{constructor(e=new O(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=Ou.subVectors(i,t).cross(Vx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let s=e.delta(Ou),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||Gx.getNormalMatrix(e),s=this.coplanarPoint(Ou).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Wx=0,Bn=class extends jn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Wx++}),this.uuid=Di(),this.name="",this.type="Material",this.blending=no,this.side=Kn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=id,this.blendDst=sd,this.blendEquation=Vs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ge(0,0,0),this.blendAlpha=0,this.depthFunc=Br,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=eh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Fl,this.stencilZFail=Fl,this.stencilZPass=Fl,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){We(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){We(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ge().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new dn().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Ie().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ie().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},qr=class extends Bn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ge(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Tr,Go=new O,Rr=new O,Cr=new O,Ir=new Ie,Wo=new Ie,e0=new tt,ml=new O,Xo=new O,gl=new O,jp=new Ie,Uu=new Ie,Zp=new Ie,mi=class extends Tt{constructor(e=new qr){if(super(),this.isSprite=!0,this.type="Sprite",Tr===void 0){Tr=new Rt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new sa(t,5);Tr.setIndex([0,1,2,0,2,3]),Tr.setAttribute("position",new wn(i,3,0,!1)),Tr.setAttribute("uv",new wn(i,2,3,!1))}this.geometry=Tr,this.material=e,this.center=new Ie(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&Ye('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Rr.setFromMatrixScale(this.matrixWorld),e0.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Cr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Rr.multiplyScalar(-Cr.z);let i=this.material.rotation,s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));let o=this.center;_l(ml.set(-.5,-.5,0),Cr,o,Rr,s,r),_l(Xo.set(.5,-.5,0),Cr,o,Rr,s,r),_l(gl.set(.5,.5,0),Cr,o,Rr,s,r),jp.set(0,0),Uu.set(1,0),Zp.set(1,1);let a=e.ray.intersectTriangle(ml,Xo,gl,!1,Go);if(a===null&&(_l(Xo.set(-.5,.5,0),Cr,o,Rr,s,r),Uu.set(0,1),a=e.ray.intersectTriangle(ml,gl,Xo,!1,Go),a===null))return;let l=e.ray.origin.distanceTo(Go);l<e.near||l>e.far||t.push({distance:l,point:Go.clone(),uv:Li.getInterpolation(Go,ml,Xo,gl,jp,Uu,Zp,new Ie),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function _l(n,e,t,i,s,r){Ir.subVectors(n,t).addScalar(.5).multiply(i),s!==void 0?(Wo.x=r*Ir.x-s*Ir.y,Wo.y=s*Ir.x+r*Ir.y):Wo.copy(Ir),n.copy(e),n.x+=Wo.x,n.y+=Wo.y,n.applyMatrix4(e0)}var Pi=new O,Fu=new O,xl=new O,yl=new O,Ui=class{constructor(e=new O,t=new O(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Pi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Pi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Pi.copy(this.origin).addScaledVector(this.direction,t),Pi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Fu.copy(e).add(t).multiplyScalar(.5),xl.copy(t).sub(e).normalize(),yl.copy(this.origin).sub(Fu);let r=e.distanceTo(t)*.5,o=-this.direction.dot(xl),a=yl.dot(this.direction),l=-yl.dot(xl),c=yl.lengthSq(),h=Math.abs(1-o*o),u,d,f,m;if(h>0)if(u=o*l-a,d=o*a-l,m=r*h,u>=0)if(d>=-m)if(d<=m){let _=1/h;u*=_,d*=_,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-m?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=m?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Fu).addScaledVector(xl,d),f}intersectSphere(e,t){if(e.radius<0)return null;Pi.subVectors(e.center,this.origin);let i=Pi.dot(this.direction),s=Pi.dot(Pi)-i*i,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(i=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(i=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,Pi)!==null}intersectTriangle(e,t,i,s,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,u=e.x-o.x,d=e.y-o.y,f=e.z-o.z,m=t.x-o.x,_=t.y-o.y,g=t.z-o.z,p=i.x-o.x,x=i.y-o.y,E=i.z-o.z,b=Math.abs(l),M=Math.abs(c),v=Math.abs(h),A,y,w,L,T,C,R,P,D,k,V,j;if(b>=M&&b>=v?(w=l,C=u,D=m,j=p,l>=0?(A=c,y=h,L=d,T=f,R=_,P=g,k=x,V=E):(A=h,y=c,L=f,T=d,R=g,P=_,k=E,V=x)):M>=v?(w=c,C=d,D=_,j=x,c>=0?(A=h,y=l,L=f,T=u,R=g,P=m,k=E,V=p):(A=l,y=h,L=u,T=f,R=m,P=g,k=p,V=E)):(w=h,C=f,D=g,j=E,h>=0?(A=l,y=c,L=u,T=d,R=m,P=_,k=p,V=x):(A=c,y=l,L=d,T=u,R=_,P=m,k=x,V=p)),w===0)return null;let q=A/w,z=y/w,H=1/w,F=L-q*C,X=T-z*C,le=R-q*D,de=P-z*D,ye=k-q*j,B=V-z*j,G=ye*de-B*le,re=F*B-X*ye,ne=le*X-de*F;if(s){if(G<0||re<0||ne<0)return null}else if((G<0||re<0||ne<0)&&(G>0||re>0||ne>0))return null;let ee=G+re+ne;if(ee===0)return null;let ie=H*(G*C+re*D+ne*j);return(ee>0?ie<0:ie>0)?null:this.at(ie/ee,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},gi=class extends Bn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ge(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yt,this.combine=fc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Kp=new tt,Ds=new Ui,bl=new qt,Jp=new O,vl=new O,Ml=new O,Sl=new O,Bu=new O,El=new O,Qp=new O,Al=new O,at=class extends Tt{constructor(e=new Rt,t=new gi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){El.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(Bu.fromBufferAttribute(u,e),o?El.addScaledVector(Bu,h):El.addScaledVector(Bu.sub(t),h))}t.add(El)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),bl.copy(i.boundingSphere),bl.applyMatrix4(r),Ds.copy(e.ray).recast(e.near),!(bl.containsPoint(Ds.origin)===!1&&(Ds.intersectSphere(bl,Jp)===null||Ds.origin.distanceToSquared(Jp)>(e.far-e.near)**2))&&(Kp.copy(r).invert(),Ds.copy(e.ray).applyMatrix4(Kp),!(i.boundingBox!==null&&Ds.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Ds)))}_computeIntersections(e,t,i){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,_=d.length;m<_;m++){let g=d[m],p=o[g.materialIndex],x=Math.max(g.start,f.start),E=Math.min(a.count,Math.min(g.start+g.count,f.start+f.count));for(let b=x,M=E;b<M;b+=3){let v=a.getX(b),A=a.getX(b+1),y=a.getX(b+2);s=wl(this,p,e,i,c,h,u,v,A,y),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let m=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let g=m,p=_;g<p;g+=3){let x=a.getX(g),E=a.getX(g+1),b=a.getX(g+2);s=wl(this,o,e,i,c,h,u,x,E,b),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,_=d.length;m<_;m++){let g=d[m],p=o[g.materialIndex],x=Math.max(g.start,f.start),E=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let b=x,M=E;b<M;b+=3){let v=b,A=b+1,y=b+2;s=wl(this,p,e,i,c,h,u,v,A,y),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let m=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let g=m,p=_;g<p;g+=3){let x=g,E=g+1,b=g+2;s=wl(this,o,e,i,c,h,u,x,E,b),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}};function Xx(n,e,t,i,s,r,o,a){let l;if(e.side===Bt?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===Kn,a),l===null)return null;Al.copy(a),Al.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(Al);return c<t.near||c>t.far?null:{distance:c,point:Al.clone(),object:n}}function wl(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,vl),n.getVertexPosition(l,Ml),n.getVertexPosition(c,Sl);let h=Xx(n,e,t,i,vl,Ml,Sl,Qp);if(h){let u=new O;Li.getBarycoord(Qp,vl,Ml,Sl,u),s&&(h.uv=Li.getInterpolatedAttribute(s,a,l,c,u,new Ie)),r&&(h.uv1=Li.getInterpolatedAttribute(r,a,l,c,u,new Ie)),o&&(h.normal=Li.getInterpolatedAttribute(o,a,l,c,u,new O),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new O,materialIndex:0};Li.getNormal(vl,Ml,Sl,d.normal),h.face=d,h.barycoord=u}return h}var ra=class extends rn{constructor(e=null,t=1,i=1,s,r,o,a,l,c=Ut,h=Ut,u,d){super(null,o,a,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var oa=class extends mt{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Pr=new tt,em=new tt,Tl=[],tm=new $t,Yx=new tt,Yo=new at,$o=new qt,aa=class extends at{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new oa(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,Yx)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new $t),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Pr),tm.copy(e.boundingBox).applyMatrix4(Pr),this.boundingBox.union(tm)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new qt),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Pr),$o.copy(e.boundingSphere).applyMatrix4(Pr),this.boundingSphere.union($o)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,o=e*r+1;for(let a=0;a<i.length;a++)i[a]=s[o+a]}raycast(e,t){let i=this.matrixWorld,s=this.count;if(Yo.geometry=this.geometry,Yo.material=this.material,Yo.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),$o.copy(this.boundingSphere),$o.applyMatrix4(i),e.ray.intersectsSphere($o)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Pr),em.multiplyMatrices(i,Pr),Yo.matrixWorld=em,Yo.raycast(e,Tl);for(let o=0,a=Tl.length;o<a;o++){let l=Tl[o];l.instanceId=r,l.object=this,t.push(l)}Tl.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new oa(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new ra(new Float32Array(s*this.count),s,this.count,bc,zn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;return r[l]=a,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ns=new qt,$x=new Ie(.5,.5),Rl=new O,jr=class{constructor(e=new dn,t=new dn,i=new dn,s=new dn,r=new dn,o=new dn){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=qn,i=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],m=r[8],_=r[9],g=r[10],p=r[11],x=r[12],E=r[13],b=r[14],M=r[15];if(s[0].setComponents(c-o,f-h,p-m,M-x).normalize(),s[1].setComponents(c+o,f+h,p+m,M+x).normalize(),s[2].setComponents(c+a,f+u,p+_,M+E).normalize(),s[3].setComponents(c-a,f-u,p-_,M-E).normalize(),i)s[4].setComponents(l,d,g,b).normalize(),s[5].setComponents(c-l,f-d,p-g,M-b).normalize();else if(s[4].setComponents(c-l,f-d,p-g,M-b).normalize(),t===qn)s[5].setComponents(c+l,f+d,p+g,M+b).normalize();else if(t===Vr)s[5].setComponents(l,d,g,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ns.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ns.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ns)}intersectsSprite(e){Ns.center.set(0,0,0);let t=$x.distanceTo(e.center);return Ns.radius=.7071067811865476+t,Ns.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ns)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(Rl.x=s.normal.x>0?e.max.x:e.min.x,Rl.y=s.normal.y>0?e.max.y:e.min.y,Rl.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Rl)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Fs=class extends Bn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ge(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},$l=new O,ql=new O,nm=new tt,qo=new Ui,Cl=new qt,ku=new O,im=new O,jl=class extends Tt{constructor(e=new Rt,t=new Fs){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)$l.fromBufferAttribute(t,s-1),ql.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=$l.distanceTo(ql);e.setAttribute("lineDistance",new Mt(i,1))}else We("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Cl.copy(i.boundingSphere),Cl.applyMatrix4(s),Cl.radius+=r,e.ray.intersectsSphere(Cl)===!1)return;nm.copy(s).invert(),qo.copy(e.ray).applyMatrix4(nm);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=i.index,d=i.attributes.position;if(h!==null){let f=Math.max(0,o.start),m=Math.min(h.count,o.start+o.count);for(let _=f,g=m-1;_<g;_+=c){let p=h.getX(_),x=h.getX(_+1),E=Il(this,e,qo,l,p,x,_);E&&t.push(E)}if(this.isLineLoop){let _=h.getX(m-1),g=h.getX(f),p=Il(this,e,qo,l,_,g,m-1);p&&t.push(p)}}else{let f=Math.max(0,o.start),m=Math.min(d.count,o.start+o.count);for(let _=f,g=m-1;_<g;_+=c){let p=Il(this,e,qo,l,_,_+1,_);p&&t.push(p)}if(this.isLineLoop){let _=Il(this,e,qo,l,m-1,f,m-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Il(n,e,t,i,s,r,o){let a=n.geometry.attributes.position;if($l.fromBufferAttribute(a,s),ql.fromBufferAttribute(a,r),t.distanceSqToSegment($l,ql,ku,im)>i)return;ku.applyMatrix4(n.matrixWorld);let c=e.ray.origin.distanceTo(ku);if(!(c<e.near||c>e.far))return{distance:c,point:im.clone().applyMatrix4(n.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:n}}var sm=new O,rm=new O,Zr=class extends jl{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)sm.fromBufferAttribute(t,s),rm.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+sm.distanceTo(rm);e.setAttribute("lineDistance",new Mt(i,1))}else We("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var Bs=class extends Bn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ge(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},om=new tt,$u=new Ui,Pl=new qt,Ll=new O,Kr=class extends Tt{constructor(e=new Rt,t=new Bs){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Pl.copy(i.boundingSphere),Pl.applyMatrix4(s),Pl.radius+=r,e.ray.intersectsSphere(Pl)===!1)return;om.copy(s).invert(),$u.copy(e.ray).applyMatrix4(om);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,u=i.attributes.position;if(c!==null){let d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let m=d,_=f;m<_;m++){let g=c.getX(m);Ll.fromBufferAttribute(u,g),am(Ll,g,l,s,e,t,this)}}else{let d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let m=d,_=f;m<_;m++)Ll.fromBufferAttribute(u,m),am(Ll,m,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function am(n,e,t,i,s,r,o){let a=$u.distanceSqToPoint(n);if(a<t){let l=new O;$u.closestPointToPoint(n,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var ts=class extends rn{constructor(e,t,i,s,r,o,a,l,c,h,u,d){super(null,o,a,l,c,h,s,r,u,d),this.isCompressedTexture=!0,this.image={width:t,height:i},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}};var la=class extends rn{constructor(e=[],t=us,i,s,r,o,a,l,c,h){super(e,t,i,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},ns=class extends rn{constructor(e,t,i,s,r,o,a,l,c){super(e,t,i,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var is=class extends rn{constructor(e,t,i=Qn,s,r,o,a=Ut,l=Ut,c,h=fi,u=1){if(h!==fi&&h!==ds)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,s,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Oi(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Zl=class extends is{constructor(e,t=Qn,i=us,s,r,o=Ut,a=Ut,l,c=fi){let h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,i,s,r,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},ca=class extends rn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},ss=class n extends Rt{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,f=0;m("z","y","x",-1,-1,i,t,e,o,r,0),m("z","y","x",1,-1,i,t,-e,o,r,1),m("x","z","y",1,1,e,i,t,s,o,2),m("x","z","y",1,-1,e,i,-t,s,o,3),m("x","y","z",1,-1,e,t,i,s,r,4),m("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new Mt(c,3)),this.setAttribute("normal",new Mt(h,3)),this.setAttribute("uv",new Mt(u,2));function m(_,g,p,x,E,b,M,v,A,y,w){let L=b/A,T=M/y,C=b/2,R=M/2,P=v/2,D=A+1,k=y+1,V=0,j=0,q=new O;for(let z=0;z<k;z++){let H=z*T-R;for(let F=0;F<D;F++){let X=F*L-C;q[_]=X*x,q[g]=H*E,q[p]=P,c.push(q.x,q.y,q.z),q[_]=0,q[g]=0,q[p]=v>0?1:-1,h.push(q.x,q.y,q.z),u.push(F/A),u.push(1-z/y),V+=1}}for(let z=0;z<y;z++)for(let H=0;H<A;H++){let F=d+H+D*z,X=d+H+D*(z+1),le=d+(H+1)+D*(z+1),de=d+(H+1)+D*z;l.push(F,X,de),l.push(X,le,de),j+=6}a.addGroup(f,j,w),f+=j,d+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var ha=class n extends Rt{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],f=[],m=0,_=[],g=i/2,p=0;x(),o===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(h),this.setAttribute("position",new Mt(u,3)),this.setAttribute("normal",new Mt(d,3)),this.setAttribute("uv",new Mt(f,2));function x(){let b=new O,M=new O,v=0,A=(t-e)/i;for(let y=0;y<=r;y++){let w=[],L=y/r,T=L*(t-e)+e;for(let C=0;C<=s;C++){let R=C/s,P=R*l+a,D=Math.sin(P),k=Math.cos(P);M.x=T*D,M.y=-L*i+g,M.z=T*k,u.push(M.x,M.y,M.z),b.set(D,A,k).normalize(),d.push(b.x,b.y,b.z),f.push(R,1-L),w.push(m++)}_.push(w)}for(let y=0;y<s;y++)for(let w=0;w<r;w++){let L=_[w][y],T=_[w+1][y],C=_[w+1][y+1],R=_[w][y+1];(e>0||w!==0)&&(h.push(L,T,R),v+=3),(t>0||w!==r-1)&&(h.push(T,C,R),v+=3)}c.addGroup(p,v,0),p+=v}function E(b){let M=m,v=new Ie,A=new O,y=0,w=b===!0?e:t,L=b===!0?1:-1;for(let C=1;C<=s;C++)u.push(0,g*L,0),d.push(0,L,0),f.push(.5,.5),m++;let T=m;for(let C=0;C<=s;C++){let P=C/s*l+a,D=Math.cos(P),k=Math.sin(P);A.x=w*k,A.y=g*L,A.z=w*D,u.push(A.x,A.y,A.z),d.push(0,L,0),v.x=D*.5+.5,v.y=k*.5*L+.5,f.push(v.x,v.y),m++}for(let C=0;C<s;C++){let R=M+C,P=T+C;b===!0?h.push(P,P+1,R):h.push(P+1,P,R),y+=3}c.addGroup(p,y,b===!0?1:2),p+=y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var ks=class n extends Rt{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,h=l+1,u=e/a,d=t/l,f=[],m=[],_=[],g=[];for(let p=0;p<h;p++){let x=p*d-o;for(let E=0;E<c;E++){let b=E*u-r;m.push(b,-x,0),_.push(0,0,1),g.push(E/a),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let x=0;x<a;x++){let E=x+c*p,b=x+c*(p+1),M=x+1+c*(p+1),v=x+1+c*p;f.push(E,b,v),f.push(b,M,v)}this.setIndex(f),this.setAttribute("position",new Mt(m,3)),this.setAttribute("normal",new Mt(_,3)),this.setAttribute("uv",new Mt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}};var zs=class extends Rt{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],i=new Set,s=new O,r=new O;if(e.index!==null){let o=e.attributes.position,a=e.index,l=e.groups;l.length===0&&(l=[{start:0,count:a.count,materialIndex:0}]);for(let c=0,h=l.length;c<h;++c){let u=l[c],d=u.start,f=u.count;for(let m=d,_=d+f;m<_;m+=3)for(let g=0;g<3;g++){let p=a.getX(m+g),x=a.getX(m+(g+1)%3);s.fromBufferAttribute(o,p),r.fromBufferAttribute(o,x),lm(s,r,i)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}}else{let o=e.attributes.position;for(let a=0,l=o.count/3;a<l;a++)for(let c=0;c<3;c++){let h=3*a+c,u=3*a+(c+1)%3;s.fromBufferAttribute(o,h),r.fromBufferAttribute(o,u),lm(s,r,i)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}this.setAttribute("position",new Mt(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function lm(n,e,t){let i=`${n.x},${n.y},${n.z}-${e.x},${e.y},${e.z}`,s=`${e.x},${e.y},${e.z}-${n.x},${n.y},${n.z}`;return t.has(i)===!0||t.has(s)===!0?!1:(t.add(i),t.add(s),!0)}function Xs(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];if(cm(s))s.isRenderTargetTexture?(We("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if(cm(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function on(n){let e={};for(let t=0;t<n.length;t++){let i=Xs(n[t]);for(let s in i)e[s]=i[s]}return e}function cm(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function qx(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Ed(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}var Pa={clone:Xs,merge:on},jx=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Zx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,pn=class extends Bn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=jx,this.fragmentShader=Zx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Xs(e.uniforms),this.uniformsGroups=qx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new Ge().setHex(s.value);break;case"v2":this.uniforms[i].value=new Ie().fromArray(s.value);break;case"v3":this.uniforms[i].value=new O().fromArray(s.value);break;case"v4":this.uniforms[i].value=new ht().fromArray(s.value);break;case"m3":this.uniforms[i].value=new $e().fromArray(s.value);break;case"m4":this.uniforms[i].value=new tt().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Kl=class extends pn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},kn=class extends Bn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ge(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ge(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ca,this.normalScale=new Ie(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yt,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var ua=class extends Bn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ge(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ge(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ca,this.normalScale=new Ie(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yt,this.combine=fc,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Jl=class extends Bn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Hm,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ql=class extends Bn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Lr(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function zu(n){return n!==void 0&&n.inTangents!==void 0&&n.outTangents!==void 0}var rs=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];e:{t:{let o;n:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break t}o=t.length;break n}if(!(e>=r)){let a=t[1];e<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break t}o=i,i=0;break n}break e}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ec=class extends rs{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Wu,endingEnd:Wu}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Xu:r=e,a=2*t-i;break;case Yu:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Xu:o=e,l=2*i-t;break;case Yu:o=1,l=i+s[1]-s[0];break;default:o=e-1,l=t}let c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(i-t)/(s-t),_=m*m,g=_*m,p=-d*g+2*d*_-d*m,x=(1+d)*g+(-1.5-2*d)*_+(-.5+d)*m+1,E=(-1-f)*g+(1.5+f)*_+.5*m,b=f*g-f*_;for(let M=0;M!==a;++M)r[M]=p*o[h+M]+x*o[c+M]+E*o[l+M]+b*o[u+M];return r}},tc=class extends rs{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(i-t)/(s-t),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}},nc=class extends rs{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},ic=class extends rs{interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let m=(i-t)/(s-t),_=1-m;for(let g=0;g!==a;++g)r[g]=o[c+g]*_+o[l+g]*m;return r}let d=a*2,f=e-1;for(let m=0;m!==a;++m){let _=o[c+m],g=o[l+m],p=f*d+m*2,x=u[p],E=u[p+1],b=e*d+m*2,M=h[b],v=h[b+1],A=Jx(i,t,x,M,s);r[m]=t0(A,_,E,v,g)}return r}};function t0(n,e,t,i,s){let r=1-n;return r*r*r*e+3*r*r*n*t+3*r*n*n*i+n*n*n*s}function Kx(n,e,t,i,s){let r=1-n;return 3*r*r*(t-e)+6*r*n*(i-t)+3*n*n*(s-i)}function Jx(n,e,t,i,s){let r=(n-e)/(s-e);for(let o=0;o<8;o++){let a=t0(r,e,t,i,s)-n;if(Math.abs(a)<1e-10)break;let l=Kx(r,e,t,i,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var Tn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Lr(t,this.TimeBufferType),this.values=Lr(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Lr(e.times,Array),values:Lr(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s),zu(e.settings)&&(i.settings={inTangents:Lr(e.settings.inTangents,Array),outTangents:Lr(e.settings.outTangents,Array)})}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new nc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new tc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ec(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ic(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Us:t=this.InterpolantFactoryMethodDiscrete;break;case Hr:t=this.InterpolantFactoryMethodLinear;break;case Ul:t=this.InterpolantFactoryMethodSmooth;break;case Gu:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return We("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Us;case this.InterpolantFactoryMethodLinear:return Hr;case this.InterpolantFactoryMethodSmooth:return Ul;case this.InterpolantFactoryMethodBezier:return Gu}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e;zu(this.settings)&&(hm(this.settings.inTangents,e),hm(this.settings.outTangents,e))}return this}trim(e,t){let i=this.times,s=i.length,r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ye("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(Ye("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){Ye("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){Ye("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&dx(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){Ye("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Ul,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{let u=a*i,d=u-i,f=u+i;for(let m=0;m!==i;++m){let _=t[u+m];if(_!==t[d+m]||_!==t[f+m]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let u=a*i,d=o*i;for(let f=0;f!==i;++f)t[d+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,zu(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function hm(n,e){for(let t=0,i=n.length;t!==i;t+=2)n[t]*=e}Tn.prototype.ValueTypeName="";Tn.prototype.TimeBufferType=Float32Array;Tn.prototype.ValueBufferType=Float32Array;Tn.prototype.DefaultInterpolation=Hr;var os=class extends Tn{constructor(e,t,i){super(e,t,i)}};os.prototype.ValueTypeName="bool";os.prototype.ValueBufferType=Array;os.prototype.DefaultInterpolation=Us;os.prototype.InterpolantFactoryMethodLinear=void 0;os.prototype.InterpolantFactoryMethodSmooth=void 0;var sc=class extends Tn{constructor(e,t,i,s){super(e,t,i,s)}};sc.prototype.ValueTypeName="color";var rc=class extends Tn{constructor(e,t,i,s){super(e,t,i,s)}};rc.prototype.ValueTypeName="number";var oc=class extends rs{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(s-t),c=e*a;for(let h=c+a;c!==h;c+=4)It.slerpFlat(r,0,o,c-a,o,c,l);return r}},da=class extends Tn{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new oc(this.times,this.values,this.getValueSize(),e)}};da.prototype.ValueTypeName="quaternion";da.prototype.InterpolantFactoryMethodSmooth=void 0;var as=class extends Tn{constructor(e,t,i){super(e,t,i)}};as.prototype.ValueTypeName="string";as.prototype.ValueBufferType=Array;as.prototype.DefaultInterpolation=Us;as.prototype.InterpolantFactoryMethodLinear=void 0;as.prototype.InterpolantFactoryMethodSmooth=void 0;var ac=class extends Tn{constructor(e,t,i,s){super(e,t,i,s)}};ac.prototype.ValueTypeName="vector";var lc=class{constructor(e,t,i){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],m=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},n0=new lc,cc=class{constructor(e){this.manager=e!==void 0?e:n0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};cc.DEFAULT_MATERIAL_NAME="__DEFAULT";var Jr=class extends Tt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ge(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},fa=class extends Jr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ge(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Hu=new tt,um=new O,dm=new O,pa=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ie(512,512),this.mapType=yn,this.map=null,this.mapPass=null,this.matrix=new tt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new jr,this._frameExtents=new Ie(1,1),this._viewportCount=1,this._viewports=[new ht(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;um.setFromMatrixPosition(e.matrixWorld),t.position.copy(um),dm.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(dm),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,i,s){Hu.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),i.setFromProjectionMatrix(Hu,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===Vr||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(Hu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Dl=new O,Nl=new It,di=new O,ma=class extends Tt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new tt,this.projectionMatrix=new tt,this.projectionMatrixInverse=new tt,this.coordinateSystem=qn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Dl,Nl,di),di.x===1&&di.y===1&&di.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Dl,Nl,di.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Dl,Nl,di),di.x===1&&di.y===1&&di.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Dl,Nl,di.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},es=new O,fm=new Ie,pm=new Ie,Xt=class extends ma{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Wr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(jo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Wr*2*Math.atan(Math.tan(jo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){es.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(es.x,es.y).multiplyScalar(-e/es.z),es.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(es.x,es.y).multiplyScalar(-e/es.z)}getViewSize(e,t){return this.getViewBounds(e,fm,pm),t.subVectors(pm,fm)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(jo*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var qu=class extends pa{constructor(){super(new Xt(90,1,.5,500)),this.isPointLightShadow=!0}},ga=class extends Jr{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new qu}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Zn=class extends ma{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ju=class extends pa{constructor(){super(new Zn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Qr=class extends Jr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.target=new Tt,this.shadow=new ju}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var _a=class extends Rt{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}};var Dr=-90,Nr=1,hc=class extends Tt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Xt(Dr,Nr,e,t);s.layers=this.layers,this.add(s);let r=new Xt(Dr,Nr,e,t);r.layers=this.layers,this.add(r);let o=new Xt(Dr,Nr,e,t);o.layers=this.layers,this.add(o);let a=new Xt(Dr,Nr,e,t);a.layers=this.layers,this.add(a);let l=new Xt(Dr,Nr,e,t);l.layers=this.layers,this.add(l);let c=new Xt(Dr,Nr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===qn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Vr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,2,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,3,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},uc=class extends Xt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Ad="\\[\\]\\.:\\/",Qx=new RegExp("["+Ad+"]","g"),wd="[^"+Ad+"]",ey="[^"+Ad.replace("\\.","")+"]",ty=/((?:WC+[\/:])*)/.source.replace("WC",wd),ny=/(WCOD+)?/.source.replace("WCOD",ey),iy=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",wd),sy=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",wd),ry=new RegExp("^"+ty+ny+iy+sy+"$"),oy=["material","materials","bones","map"],Zu=class{constructor(e,t,i){let s=i||ft.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},ft=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Qx,"")}static parseTrackName(e){let t=ry.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);oy.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){We("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){Ye("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ye("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ye("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ye("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ye("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){Ye("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){Ye("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;Ye("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ye("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ye("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ft.Composite=Zu;ft.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ft.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ft.prototype.GetterByBindingType=[ft.prototype._getValue_direct,ft.prototype._getValue_array,ft.prototype._getValue_arrayElement,ft.prototype._getValue_toArray];ft.prototype.SetterByBindingTypeAndVersioning=[[ft.prototype._setValue_direct,ft.prototype._setValue_direct_setNeedsUpdate,ft.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ft.prototype._setValue_array,ft.prototype._setValue_array_setNeedsUpdate,ft.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ft.prototype._setValue_arrayElement,ft.prototype._setValue_arrayElement_setNeedsUpdate,ft.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ft.prototype._setValue_fromArray,ft.prototype._setValue_fromArray_setNeedsUpdate,ft.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var $A=new Float32Array(1);var ls=class extends sa{constructor(e,t,i=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){let t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){let t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}};var mm=new tt,Hs=class{constructor(e,t,i=0,s=1/0){this.ray=new Ui(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new Yr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Ye("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return mm.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(mm),this}intersectObject(e,t=!0,i=[]){return Ku(e,this,i,t),i.sort(gm),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)Ku(e[s],this,i,t);return i.sort(gm),i}};function gm(n,e){return n.distance-e.distance}function Ku(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let o=0,a=r.length;o<a;o++)Ku(r[o],e,t,!0)}}var eo=class{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=je(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(je(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Ld=class Ld{constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};Ld.prototype.isMatrix2=!0;var Ju=Ld;var _m=new O,Ol=new O,Or=new O,Ur=new O,Vu=new O,ay=new O,ly=new O,xa=class{constructor(e=new O,t=new O){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){_m.subVectors(e,this.start),Ol.subVectors(this.end,this.start);let i=Ol.dot(Ol);if(i===0)return 0;let r=Ol.dot(_m)/i;return t&&(r=je(r,0,1)),r}closestPointToPoint(e,t,i){let s=this.closestPointToPointParameter(e,t);return this.delta(i).multiplyScalar(s).add(this.start)}distanceSqToLine3(e,t=ay,i=ly){let s=10000000000000001e-32,r,o,a=this.start,l=e.start,c=this.end,h=e.end;Or.subVectors(c,a),Ur.subVectors(h,l),Vu.subVectors(a,l);let u=Or.dot(Or),d=Ur.dot(Ur),f=Ur.dot(Vu);if(u<=s&&d<=s)return t.copy(a),i.copy(l),t.sub(i),t.dot(t);if(u<=s)r=0,o=f/d,o=je(o,0,1);else{let m=Or.dot(Vu);if(d<=s)o=0,r=je(-m/u,0,1);else{let _=Or.dot(Ur),g=u*d-_*_;g!==0?r=je((_*f-m*d)/g,0,1):r=0,o=(_*r+f)/d,o<0?(o=0,r=je(-m/u,0,1)):o>1&&(o=1,r=je((_-m)/u,0,1))}}return t.copy(a).addScaledVector(Or,r),i.copy(l).addScaledVector(Ur,o),t.distanceToSquared(i)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}};var ya=class extends jn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Td(n,e,t,i){let s=cy(i);switch(t){case gd:return n*e;case bc:return n*e/s.components*s.byteLength;case vc:return n*e/s.components*s.byteLength;case fs:return n*e*2/s.components*s.byteLength;case Mc:return n*e*2/s.components*s.byteLength;case _d:return n*e*3/s.components*s.byteLength;case bn:return n*e*4/s.components*s.byteLength;case Sc:return n*e*4/s.components*s.byteLength;case Sa:case Ea:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Aa:case wa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Ac:case Tc:return Math.max(n,16)*Math.max(e,8)/4;case Ec:case wc:return Math.max(n,8)*Math.max(e,8)/2;case Rc:case Cc:case Pc:case Lc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Ic:case Ta:case Dc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Nc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Oc:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Uc:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Fc:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Bc:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case kc:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case zc:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Hc:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Vc:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Gc:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Wc:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Xc:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Yc:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case $c:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case qc:case jc:case Zc:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Kc:case Jc:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Ra:case Qc:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function cy(n){switch(n){case yn:case dd:return{byteLength:1,components:1};case so:case fd:case ei:return{byteLength:2,components:1};case xc:case yc:return{byteLength:2,components:4};case Qn:case _c:case zn:return{byteLength:4,components:1};case pd:case md:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?We("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function E0(){let n=null,e=!1,t=null,i=null;function s(r,o){i=n.requestAnimationFrame(s),t(r,o)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function hy(n){let e=new WeakMap;function t(a,l){let c=a.array,h=a.usage,u=c.byteLength,d=n.createBuffer();n.bindBuffer(l,d),n.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=n.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){let h=l.array,u=l.updateRanges;if(n.bindBuffer(c,a),u.length===0)n.bufferSubData(c,0,h);else{u.sort((f,m)=>f.start-m.start);let d=0;for(let f=1;f<u.length;f++){let m=u[d],_=u[f];_.start<=m.start+m.count+1?m.count=Math.max(m.count,_.start+_.count-m.start):(++d,u[d]=_)}u.length=d+1;for(let f=0,m=u.length;f<m;f++){let _=u[f];n.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var uy=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,dy=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,fy=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,py=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,my=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,gy=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,_y=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,xy=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,yy=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,by=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,vy=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,My=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Sy=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ey=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Ay=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,wy=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Ty=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ry=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Cy=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Iy=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Py=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Ly=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Dy=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Ny=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Oy=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Uy=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Fy=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,By=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ky=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,zy=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Hy="gl_FragColor = linearToOutputTexel( gl_FragColor );",Vy=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Gy=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Wy=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Xy=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Yy=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,$y=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,qy=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,jy=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Zy=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ky=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Jy=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Qy=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,e1=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,t1=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,n1=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,i1=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,s1=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,r1=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,o1=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,a1=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,l1=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,c1=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,h1=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,u1=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,d1=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,f1=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,p1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,m1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,g1=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_1=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,x1=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,y1=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,b1=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,v1=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,M1=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,S1=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,E1=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,A1=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,w1=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,T1=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,R1=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,C1=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,I1=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,P1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,L1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,D1=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,N1=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,O1=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,U1=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,F1=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,B1=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,k1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,z1=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,H1=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,V1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,G1=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,W1=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,X1=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Y1=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,$1=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,q1=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,j1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Z1=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,K1=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,J1=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Q1=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,eb=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,tb=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,nb=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,ib=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,sb=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,rb=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,ob=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,ab=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,lb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,cb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,hb=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,ub=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,db=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,fb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,pb=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,mb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,gb=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_b=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,xb=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,yb=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,bb=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,vb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Mb=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Sb=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Eb=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ab=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,wb=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tb=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Rb=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Cb=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Ib=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pb=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Lb=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Db=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Nb=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ob=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Ub=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fb=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Bb=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kb=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,zb=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Hb=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Vb=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Gb=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Wb=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,nt={alphahash_fragment:uy,alphahash_pars_fragment:dy,alphamap_fragment:fy,alphamap_pars_fragment:py,alphatest_fragment:my,alphatest_pars_fragment:gy,aomap_fragment:_y,aomap_pars_fragment:xy,batching_pars_vertex:yy,batching_vertex:by,begin_vertex:vy,beginnormal_vertex:My,bsdfs:Sy,iridescence_fragment:Ey,bumpmap_pars_fragment:Ay,clipping_planes_fragment:wy,clipping_planes_pars_fragment:Ty,clipping_planes_pars_vertex:Ry,clipping_planes_vertex:Cy,color_fragment:Iy,color_pars_fragment:Py,color_pars_vertex:Ly,color_vertex:Dy,common:Ny,cube_uv_reflection_fragment:Oy,defaultnormal_vertex:Uy,displacementmap_pars_vertex:Fy,displacementmap_vertex:By,emissivemap_fragment:ky,emissivemap_pars_fragment:zy,colorspace_fragment:Hy,colorspace_pars_fragment:Vy,envmap_fragment:Gy,envmap_common_pars_fragment:Wy,envmap_pars_fragment:Xy,envmap_pars_vertex:Yy,envmap_physical_pars_fragment:i1,envmap_vertex:$y,fog_vertex:qy,fog_pars_vertex:jy,fog_fragment:Zy,fog_pars_fragment:Ky,gradientmap_pars_fragment:Jy,lightmap_pars_fragment:Qy,lights_lambert_fragment:e1,lights_lambert_pars_fragment:t1,lights_pars_begin:n1,lights_toon_fragment:s1,lights_toon_pars_fragment:r1,lights_phong_fragment:o1,lights_phong_pars_fragment:a1,lights_physical_fragment:l1,lights_physical_pars_fragment:c1,lights_fragment_begin:h1,lights_fragment_maps:u1,lights_fragment_end:d1,lightprobes_pars_fragment:f1,logdepthbuf_fragment:p1,logdepthbuf_pars_fragment:m1,logdepthbuf_pars_vertex:g1,logdepthbuf_vertex:_1,map_fragment:x1,map_pars_fragment:y1,map_particle_fragment:b1,map_particle_pars_fragment:v1,metalnessmap_fragment:M1,metalnessmap_pars_fragment:S1,morphinstance_vertex:E1,morphcolor_vertex:A1,morphnormal_vertex:w1,morphtarget_pars_vertex:T1,morphtarget_vertex:R1,normal_fragment_begin:C1,normal_fragment_maps:I1,normal_pars_fragment:P1,normal_pars_vertex:L1,normal_vertex:D1,normalmap_pars_fragment:N1,clearcoat_normal_fragment_begin:O1,clearcoat_normal_fragment_maps:U1,clearcoat_pars_fragment:F1,iridescence_pars_fragment:B1,opaque_fragment:k1,packing:z1,premultiplied_alpha_fragment:H1,project_vertex:V1,dithering_fragment:G1,dithering_pars_fragment:W1,roughnessmap_fragment:X1,roughnessmap_pars_fragment:Y1,shadowmap_pars_fragment:$1,shadowmap_pars_vertex:q1,shadowmap_vertex:j1,shadowmask_pars_fragment:Z1,skinbase_vertex:K1,skinning_pars_vertex:J1,skinning_vertex:Q1,skinnormal_vertex:eb,specularmap_fragment:tb,specularmap_pars_fragment:nb,tonemapping_fragment:ib,tonemapping_pars_fragment:sb,transmission_fragment:rb,transmission_pars_fragment:ob,uv_pars_fragment:ab,uv_pars_vertex:lb,uv_vertex:cb,worldpos_vertex:hb,background_vert:ub,background_frag:db,backgroundCube_vert:fb,backgroundCube_frag:pb,cube_vert:mb,cube_frag:gb,depth_vert:_b,depth_frag:xb,distance_vert:yb,distance_frag:bb,equirect_vert:vb,equirect_frag:Mb,linedashed_vert:Sb,linedashed_frag:Eb,meshbasic_vert:Ab,meshbasic_frag:wb,meshlambert_vert:Tb,meshlambert_frag:Rb,meshmatcap_vert:Cb,meshmatcap_frag:Ib,meshnormal_vert:Pb,meshnormal_frag:Lb,meshphong_vert:Db,meshphong_frag:Nb,meshphysical_vert:Ob,meshphysical_frag:Ub,meshtoon_vert:Fb,meshtoon_frag:Bb,points_vert:kb,points_frag:zb,shadow_vert:Hb,shadow_frag:Vb,sprite_vert:Gb,sprite_frag:Wb},xe={common:{diffuse:{value:new Ge(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new $e},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new $e}},envmap:{envMap:{value:null},envMapRotation:{value:new $e},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new $e}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new $e}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new $e},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new $e},normalScale:{value:new Ie(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new $e},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new $e}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new $e}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new $e}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ge(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new O},probesMax:{value:new O},probesResolution:{value:new O}},points:{diffuse:{value:new Ge(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0},uvTransform:{value:new $e}},sprite:{diffuse:{value:new Ge(16777215)},opacity:{value:1},center:{value:new Ie(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new $e},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0}}},gn={basic:{uniforms:on([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.fog]),vertexShader:nt.meshbasic_vert,fragmentShader:nt.meshbasic_frag},lambert:{uniforms:on([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new Ge(0)},envMapIntensity:{value:1}}]),vertexShader:nt.meshlambert_vert,fragmentShader:nt.meshlambert_frag},phong:{uniforms:on([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new Ge(0)},specular:{value:new Ge(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:nt.meshphong_vert,fragmentShader:nt.meshphong_frag},standard:{uniforms:on([xe.common,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.roughnessmap,xe.metalnessmap,xe.fog,xe.lights,{emissive:{value:new Ge(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:nt.meshphysical_vert,fragmentShader:nt.meshphysical_frag},toon:{uniforms:on([xe.common,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.gradientmap,xe.fog,xe.lights,{emissive:{value:new Ge(0)}}]),vertexShader:nt.meshtoon_vert,fragmentShader:nt.meshtoon_frag},matcap:{uniforms:on([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,{matcap:{value:null}}]),vertexShader:nt.meshmatcap_vert,fragmentShader:nt.meshmatcap_frag},points:{uniforms:on([xe.points,xe.fog]),vertexShader:nt.points_vert,fragmentShader:nt.points_frag},dashed:{uniforms:on([xe.common,xe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:nt.linedashed_vert,fragmentShader:nt.linedashed_frag},depth:{uniforms:on([xe.common,xe.displacementmap]),vertexShader:nt.depth_vert,fragmentShader:nt.depth_frag},normal:{uniforms:on([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,{opacity:{value:1}}]),vertexShader:nt.meshnormal_vert,fragmentShader:nt.meshnormal_frag},sprite:{uniforms:on([xe.sprite,xe.fog]),vertexShader:nt.sprite_vert,fragmentShader:nt.sprite_frag},background:{uniforms:{uvTransform:{value:new $e},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:nt.background_vert,fragmentShader:nt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new $e}},vertexShader:nt.backgroundCube_vert,fragmentShader:nt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:nt.cube_vert,fragmentShader:nt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:nt.equirect_vert,fragmentShader:nt.equirect_frag},distance:{uniforms:on([xe.common,xe.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:nt.distance_vert,fragmentShader:nt.distance_frag},shadow:{uniforms:on([xe.lights,xe.fog,{color:{value:new Ge(0)},opacity:{value:1}}]),vertexShader:nt.shadow_vert,fragmentShader:nt.shadow_frag}};gn.physical={uniforms:on([gn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new $e},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new $e},clearcoatNormalScale:{value:new Ie(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new $e},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new $e},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new $e},sheen:{value:0},sheenColor:{value:new Ge(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new $e},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new $e},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new $e},transmissionSamplerSize:{value:new Ie},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new $e},attenuationDistance:{value:0},attenuationColor:{value:new Ge(0)},specularColor:{value:new Ge(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new $e},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new $e},anisotropyVector:{value:new Ie},anisotropyMap:{value:null},anisotropyMapTransform:{value:new $e}}]),vertexShader:nt.meshphysical_vert,fragmentShader:nt.meshphysical_frag};var ih={r:0,b:0,g:0},Xb=new tt,A0=new $e;A0.set(-1,0,0,0,1,0,0,0,1);function Yb(n,e,t,i,s,r){let o=new Ge(0),a=s===!0?0:1,l,c,h=null,u=0,d=null;function f(x){let E=x.isScene===!0?x.background:null;if(E&&E.isTexture){let b=x.backgroundBlurriness>0;E=e.get(E,b)}return E}function m(x){let E=!1,b=f(x);b===null?g(o,a):b&&b.isColor&&(g(b,1),E=!0);let M=n.xr.getEnvironmentBlendMode();M==="additive"?t.buffers.color.setClear(0,0,0,1,r):M==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||E)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function _(x,E){let b=f(E);b&&(b.isCubeTexture||b.mapping===Ma)?(c===void 0&&(c=new at(new ss(1,1,1),new pn({name:"BackgroundCubeMaterial",uniforms:Xs(gn.backgroundCube.uniforms),vertexShader:gn.backgroundCube.vertexShader,fragmentShader:gn.backgroundCube.fragmentShader,side:Bt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(M,v,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=b,c.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Xb.makeRotationFromEuler(E.backgroundRotation)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(A0),c.material.toneMapped=Qe.getTransfer(b.colorSpace)!==pt,(h!==b||u!==b.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,h=b,u=b.version,d=n.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):b&&b.isTexture&&(l===void 0&&(l=new at(new ks(2,2),new pn({name:"BackgroundMaterial",uniforms:Xs(gn.background.uniforms),vertexShader:gn.background.vertexShader,fragmentShader:gn.background.fragmentShader,side:Kn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=b,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.toneMapped=Qe.getTransfer(b.colorSpace)!==pt,b.matrixAutoUpdate===!0&&b.updateMatrix(),l.material.uniforms.uvTransform.value.copy(b.matrix),(h!==b||u!==b.version||d!==n.toneMapping)&&(l.material.needsUpdate=!0,h=b,u=b.version,d=n.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function g(x,E){x.getRGB(ih,Ed(n)),t.buffers.color.setClear(ih.r,ih.g,ih.b,E,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,E=1){o.set(x),a=E,g(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,g(o,a)},render:m,addToRenderList:_,dispose:p}}function $b(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=d(null),r=s,o=!1;function a(T,C,R,P,D){let k=!1,V=u(T,P,R,C);r!==V&&(r=V,c(r.object)),k=f(T,P,R,D),k&&m(T,P,R,D),D!==null&&e.update(D,n.ELEMENT_ARRAY_BUFFER),(k||o)&&(o=!1,b(T,C,R,P),D!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(D).buffer))}function l(){return n.createVertexArray()}function c(T){return n.bindVertexArray(T)}function h(T){return n.deleteVertexArray(T)}function u(T,C,R,P){let D=P.wireframe===!0,k=i[C.id];k===void 0&&(k={},i[C.id]=k);let V=T.isInstancedMesh===!0?T.id:0,j=k[V];j===void 0&&(j={},k[V]=j);let q=j[R.id];q===void 0&&(q={},j[R.id]=q);let z=q[D];return z===void 0&&(z=d(l()),q[D]=z),z}function d(T){let C=[],R=[],P=[];for(let D=0;D<t;D++)C[D]=0,R[D]=0,P[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:R,attributeDivisors:P,object:T,attributes:{},index:null}}function f(T,C,R,P){let D=r.attributes,k=C.attributes,V=0,j=R.getAttributes();for(let q in j)if(j[q].location>=0){let H=D[q],F=k[q];if(F===void 0&&(q==="instanceMatrix"&&T.instanceMatrix&&(F=T.instanceMatrix),q==="instanceColor"&&T.instanceColor&&(F=T.instanceColor)),H===void 0||H.attribute!==F||F&&H.data!==F.data)return!0;V++}return r.attributesNum!==V||r.index!==P}function m(T,C,R,P){let D={},k=C.attributes,V=0,j=R.getAttributes();for(let q in j)if(j[q].location>=0){let H=k[q];H===void 0&&(q==="instanceMatrix"&&T.instanceMatrix&&(H=T.instanceMatrix),q==="instanceColor"&&T.instanceColor&&(H=T.instanceColor));let F={};F.attribute=H,H&&H.data&&(F.data=H.data),D[q]=F,V++}r.attributes=D,r.attributesNum=V,r.index=P}function _(){let T=r.newAttributes;for(let C=0,R=T.length;C<R;C++)T[C]=0}function g(T){p(T,0)}function p(T,C){let R=r.newAttributes,P=r.enabledAttributes,D=r.attributeDivisors;R[T]=1,P[T]===0&&(n.enableVertexAttribArray(T),P[T]=1),D[T]!==C&&(n.vertexAttribDivisor(T,C),D[T]=C)}function x(){let T=r.newAttributes,C=r.enabledAttributes;for(let R=0,P=C.length;R<P;R++)C[R]!==T[R]&&(n.disableVertexAttribArray(R),C[R]=0)}function E(T,C,R,P,D,k,V){V===!0?n.vertexAttribIPointer(T,C,R,D,k):n.vertexAttribPointer(T,C,R,P,D,k)}function b(T,C,R,P){_();let D=P.attributes,k=R.getAttributes(),V=C.defaultAttributeValues;for(let j in k){let q=k[j];if(q.location>=0){let z=D[j];if(z===void 0&&(j==="instanceMatrix"&&T.instanceMatrix&&(z=T.instanceMatrix),j==="instanceColor"&&T.instanceColor&&(z=T.instanceColor)),z!==void 0){let H=z.normalized,F=z.itemSize,X=e.get(z);if(X===void 0)continue;let le=X.buffer,de=X.type,ye=X.bytesPerElement,B=de===n.INT||de===n.UNSIGNED_INT||z.gpuType===_c;if(z.isInterleavedBufferAttribute){let G=z.data,re=G.stride,ne=z.offset;if(G.isInstancedInterleavedBuffer){for(let ee=0;ee<q.locationSize;ee++)p(q.location+ee,G.meshPerAttribute);T.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=G.meshPerAttribute*G.count)}else for(let ee=0;ee<q.locationSize;ee++)g(q.location+ee);n.bindBuffer(n.ARRAY_BUFFER,le);for(let ee=0;ee<q.locationSize;ee++)E(q.location+ee,F/q.locationSize,de,H,re*ye,(ne+F/q.locationSize*ee)*ye,B)}else{if(z.isInstancedBufferAttribute){for(let G=0;G<q.locationSize;G++)p(q.location+G,z.meshPerAttribute);T.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=z.meshPerAttribute*z.count)}else for(let G=0;G<q.locationSize;G++)g(q.location+G);n.bindBuffer(n.ARRAY_BUFFER,le);for(let G=0;G<q.locationSize;G++)E(q.location+G,F/q.locationSize,de,H,F*ye,F/q.locationSize*G*ye,B)}}else if(V!==void 0){let H=V[j];if(H!==void 0)switch(H.length){case 2:n.vertexAttrib2fv(q.location,H);break;case 3:n.vertexAttrib3fv(q.location,H);break;case 4:n.vertexAttrib4fv(q.location,H);break;default:n.vertexAttrib1fv(q.location,H)}}}}x()}function M(){w();for(let T in i){let C=i[T];for(let R in C){let P=C[R];for(let D in P){let k=P[D];for(let V in k)h(k[V].object),delete k[V];delete P[D]}}delete i[T]}}function v(T){if(i[T.id]===void 0)return;let C=i[T.id];for(let R in C){let P=C[R];for(let D in P){let k=P[D];for(let V in k)h(k[V].object),delete k[V];delete P[D]}}delete i[T.id]}function A(T){for(let C in i){let R=i[C];for(let P in R){let D=R[P];if(D[T.id]===void 0)continue;let k=D[T.id];for(let V in k)h(k[V].object),delete k[V];delete D[T.id]}}}function y(T){for(let C in i){let R=i[C],P=T.isInstancedMesh===!0?T.id:0,D=R[P];if(D!==void 0){for(let k in D){let V=D[k];for(let j in V)h(V[j].object),delete V[j];delete D[k]}delete R[P],Object.keys(R).length===0&&delete i[C]}}}function w(){L(),o=!0,r!==s&&(r=s,c(r.object))}function L(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:w,resetDefaultState:L,dispose:M,releaseStatesOfGeometry:v,releaseStatesOfObject:y,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:g,disableUnusedAttributes:x}}function qb(n,e,t){let i;function s(l){i=l}function r(l,c){n.drawArrays(i,l,c),t.update(c,i,1)}function o(l,c,h){h!==0&&(n.drawArraysInstanced(i,l,c,h),t.update(c,i,h))}function a(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];t.update(d,i,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function jb(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==bn&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){let y=A===ei&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==yn&&A!==zn&&!y&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function l(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(We("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&d===!1&&We("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),x=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),E=n.getParameter(n.MAX_VARYING_VECTORS),b=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),M=n.getParameter(n.MAX_SAMPLES),v=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:m,maxTextureSize:_,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:x,maxVaryings:E,maxFragmentUniforms:b,maxSamples:M,samples:v}}function Zb(n){let e=this,t=null,i=0,s=!1,r=!1,o=new dn,a=new $e,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||i!==0||s;return s=d,i=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){let m=u.clippingPlanes,_=u.clipIntersection,g=u.clipShadows,p=n.get(u);if(!s||m===null||m.length===0||r&&!g)r?h(null):c();else{let x=r?0:i,E=x*4,b=p.clippingState||null;l.value=b,b=h(m,d,E,f);for(let M=0;M!==E;++M)b[M]=t[M];p.clippingState=b,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(u,d,f,m){let _=u!==null?u.length:0,g=null;if(_!==0){if(g=l.value,m!==!0||g===null){let p=f+_*4,x=d.matrixWorldInverse;a.getNormalMatrix(x),(g===null||g.length<p)&&(g=new Float32Array(p));for(let E=0,b=f;E!==_;++E,b+=4)o.copy(u[E]).applyMatrix4(x,a),o.normal.toArray(g,b),g[b+3]=o.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,g}}var ao=4,Kb=6,Jb=20,Qb=256,La=new Zn,i0=new Ge,Dd=null,Nd=0,Od=0,Ud=!1,ev=new O,Ys=new O,co=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){let{size:o=256,position:a=ev}=r;Dd=this._renderer.getRenderTarget(),Nd=this._renderer.getActiveCubeFace(),Od=this._renderer.getActiveMipmapLevel(),Ud=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=o0(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=r0(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Dd,Nd,Od),this._renderer.xr.enabled=Ud,e.scissorTest=!1,oo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===us||e.mapping===Gs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Dd=this._renderer.getRenderTarget(),Nd=this._renderer.getActiveCubeFace(),Od=this._renderer.getActiveMipmapLevel(),Ud=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Ft,minFilter:Ft,generateMipmaps:!1,type:ei,format:bn,colorSpace:Ko,depthBuffer:!1},s=s0(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=s0(e,t,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=tv(r)),this._blurMaterial=iv(r,e,t),this._ggxMaterial=nv(r,e,t)}return s}_compileMaterial(e){let t=new at(new Rt,e);this._renderer.compile(t,La)}_sceneToCubeUV(e,t,i,s,r){let l=new Xt(90,1,t,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(i0),u.toneMapping=Jn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new at(new ss,new gi({name:"PMREM.Background",side:Bt,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,g=_.material,p=!1,x=e.background;x?x.isColor&&(g.color.copy(x),e.background=null,p=!0):(g.color.copy(i0),p=!0);for(let E=0;E<6;E++){let b=E%3;b===0?(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[E],r.y,r.z)):b===1?(l.up.set(0,0,c[E]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[E],r.z)):(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[E]));let M=this._cubeSize;oo(s,b*M,E>2?M:0,M,M),u.setRenderTarget(s),p&&u.render(_,l),u.render(e,l)}u.toneMapping=f,u.autoClear=d,e.background=x}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===us||e.mapping===Gs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=o0()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=r0());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;oo(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,La)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let l=o.uniforms,c=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:m}=this,_=this._sizeLods[i],g=3*_*(i>m-ao?i-m+ao:0),p=4*(this._cubeSize-_);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=m-t,oo(r,g,p,3*_,2*_),s.setRenderTarget(r),s.render(a,La),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-i,oo(e,g,p,3*_,2*_),s.setRenderTarget(e),s.render(a,La)}_blur(e,t,i,s){let r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,i,o),this._blurPass(r,e,i,i,o)}_blurPass(e,t,i,s,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[s];l.material=a;let c=a.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[s],u=3*h*(s>this._lodMax-ao?s-this._lodMax+ao:0),d=4*(this._cubeSize-h);oo(t,u,d,3*h,2*h),o.setRenderTarget(t),o.render(l,La)}};function tv(n){let e=[],t=[],i=n,s=n-ao+1+Kb;for(let r=0;r<s;r++){let o=Math.pow(2,i);e.push(o);let a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,m=new Float32Array(f*d*u),_=new Float32Array(f*d*u);for(let p=0;p<u;p++){let x=p%3*2/3-1,E=p>2?0:-1,b=[x,E,0,x+2/3,E,0,x+2/3,E+1,0,x,E,0,x+2/3,E+1,0,x,E+1,0];m.set(b,f*d*p);for(let M=0;M<d;M++){let v=h[M*2]*2-1,A=h[M*2+1]*2-1;p===0?Ys.set(1,A,v):p===1?Ys.set(-v,1,-A):p===2?Ys.set(-v,A,1):p===3?Ys.set(-1,A,-v):p===4?Ys.set(-v,-1,A):Ys.set(v,A,-1),Ys.toArray(_,(p*d+M)*f)}}let g=new Rt;g.setAttribute("position",new mt(m,f)),g.setAttribute("outputDirection",new mt(_,f)),t.push(new at(g,null)),i>ao&&i--}return{lodMeshes:t,sizeLods:e}}function s0(n,e,t){let i=new xn(n,e,t);return i.texture.mapping=Ma,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function oo(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function nv(n,e,t){return new pn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Qb,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ah(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:_i,depthTest:!1,depthWrite:!1})}function iv(n,e,t){return new pn({name:"SphericalGaussianBlur",defines:{SAMPLES:Jb,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:ah(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:_i,depthTest:!1,depthWrite:!1})}function r0(){return new pn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ah(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:_i,depthTest:!1,depthWrite:!1})}function o0(){return new pn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ah(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:_i,depthTest:!1,depthWrite:!1})}function ah(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var rh=class extends xn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new la(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new ss(5,5,5),r=new pn({name:"CubemapFromEquirect",uniforms:Xs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Bt,blending:_i});r.uniforms.tEquirect.value=t;let o=new at(s,r),a=t.minFilter;return t.minFilter===xi&&(t.minFilter=Ft),new hc(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}};function sv(n){let e=new WeakMap,t=new WeakMap,i=null;function s(d,f=!1){return d==null?null:f?o(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===pc||f===mc)if(e.has(d)){let m=e.get(d).texture;return a(m,d.mapping)}else{let m=d.image;if(m&&m.height>0){let _=new rh(m.height);return _.fromEquirectangularTexture(n,d),e.set(d,_),d.addEventListener("dispose",c),a(_.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,m=f===pc||f===mc,_=f===us||f===Gs;if(m||_){let g=t.get(d),p=g!==void 0?g.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return i===null&&(i=new co(n)),g=m?i.fromEquirectangular(d,g):i.fromCubemap(d,g),g.texture.pmremVersion=d.pmremVersion,t.set(d,g),g.texture;if(g!==void 0)return g.texture;{let x=d.image;return m&&x&&x.height>0||_&&x&&l(x)?(i===null&&(i=new co(n)),g=m?i.fromEquirectangular(d):i.fromCubemap(d),g.texture.pmremVersion=d.pmremVersion,t.set(d,g),d.addEventListener("dispose",h),g.texture):null}}}return d}function a(d,f){return f===pc?d.mapping=us:f===mc&&(d.mapping=Gs),d}function l(d){let f=0,m=6;for(let _=0;_<m;_++)d[_]!==void 0&&f++;return f===m}function c(d){let f=d.target;f.removeEventListener("dispose",c);let m=e.get(f);m!==void 0&&(e.delete(f),m.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let m=t.get(f);m!==void 0&&(t.delete(f),m.dispose())}function u(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:u}}function rv(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&Os("WebGLRenderer: "+i+" extension not supported."),s}}}function ov(n,e,t,i){let s={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&e.remove(d.index);for(let m in d.attributes)e.remove(d.attributes[m]);d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)e.update(d[f],n.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,m=u.attributes.position,_=0;if(m===void 0)return;if(f!==null){let x=f.array;_=f.version;for(let E=0,b=x.length;E<b;E+=3){let M=x[E+0],v=x[E+1],A=x[E+2];d.push(M,v,v,A,A,M)}}else{let x=m.array;_=m.version;for(let E=0,b=x.length/3-1;E<b;E+=3){let M=E+0,v=E+1,A=E+2;d.push(M,v,v,A,A,M)}}let g=new(m.count>=65535?ia:na)(d,1);g.version=_;let p=r.get(u);p&&e.remove(p),r.set(u,g)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function av(n,e,t){let i;function s(u){i=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,d){n.drawElements(i,d,r,u*o),t.update(d,i,1)}function c(u,d,f){f!==0&&(n.drawElementsInstanced(i,d,r,u*o,f),t.update(d,i,f))}function h(u,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,u,0,f);let _=0;for(let g=0;g<f;g++)_+=d[g];t.update(_,i,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function lv(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:Ye("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function cv(n,e,t){let i=new WeakMap,s=new ht;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(a);if(d===void 0||d.count!==u){let w=function(){A.dispose(),i.delete(a),a.removeEventListener("dispose",w)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],x=a.morphAttributes.color||[],E=0;f===!0&&(E=1),m===!0&&(E=2),_===!0&&(E=3);let b=a.attributes.position.count*E,M=1;b>e.maxTextureSize&&(M=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);let v=new Float32Array(b*M*4*u),A=new ta(v,b,M,u);A.type=zn,A.needsUpdate=!0;let y=E*4;for(let L=0;L<u;L++){let T=g[L],C=p[L],R=x[L],P=b*M*4*L;for(let D=0;D<T.count;D++){let k=D*y;f===!0&&(s.fromBufferAttribute(T,D),v[P+k+0]=s.x,v[P+k+1]=s.y,v[P+k+2]=s.z,v[P+k+3]=0),m===!0&&(s.fromBufferAttribute(C,D),v[P+k+4]=s.x,v[P+k+5]=s.y,v[P+k+6]=s.z,v[P+k+7]=0),_===!0&&(s.fromBufferAttribute(R,D),v[P+k+8]=s.x,v[P+k+9]=s.y,v[P+k+10]=s.z,v[P+k+11]=R.itemSize===4?s.w:1)}}d={count:u,texture:A,size:new Ie(b,M)},i.set(a,d),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let m=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",m),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",d.size)}return{update:r}}function hv(n,e,t,i,s){let r=new WeakMap;function o(c){let h=s.render.frame,u=c.geometry,d=e.get(c,u);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function a(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:o,dispose:a}}var uv={[rd]:"LINEAR_TONE_MAPPING",[od]:"REINHARD_TONE_MAPPING",[ad]:"CINEON_TONE_MAPPING",[ld]:"ACES_FILMIC_TONE_MAPPING",[hd]:"AGX_TONE_MAPPING",[va]:"NEUTRAL_TONE_MAPPING",[cd]:"CUSTOM_TONE_MAPPING"};function dv(n,e,t,i,s,r){let o=new xn(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new Rt;c.setAttribute("position",new Mt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Mt([0,2,0,0,2,0],2));let h=new Kl({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new at(c,h),d=new Zn(-1,1,1,-1,0,1),f=null,m=null,_=!1,g,p=null,x=[],E=!1;this.setSize=function(b,M){o.setSize(b,M),a!==null&&a.setSize(b,M),l!==null&&l.setSize(b,M);for(let v=0;v<x.length;v++){let A=x[v];A.setSize&&A.setSize(b,M)}},this.setEffects=function(b){x=b,E=x.length>0&&x[0].isRenderPass===!0;let M=o.width,v=o.height;x.length>0&&a===null&&(a=new xn(M,v,{type:ei,depthBuffer:!1,stencilBuffer:!1}),l=new xn(M,v,{type:ei,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<x.length;A++){let y=x[A];y.setSize&&y.setSize(M,v)}},this.begin=function(b,M){if(_||b.toneMapping===Jn&&x.length===0)return!1;if(p=M,M!==null){let v=M.width,A=M.height;(o.width!==v||o.height!==A)&&this.setSize(v,A)}return E===!1&&b.setRenderTarget(o),g=b.toneMapping,b.toneMapping=Jn,!0},this.hasRenderPass=function(){return E},this.end=function(b,M){b.toneMapping=g,_=!0;let v=o,A=a;for(let y=0;y<x.length;y++){let w=x[y];w.enabled!==!1&&(w.render(b,A,v,M),w.needsSwap!==!1&&(v=A,A=A===a?l:a))}if(f!==b.outputColorSpace||m!==b.toneMapping){f=b.outputColorSpace,m=b.toneMapping,h.defines={},Qe.getTransfer(f)===pt&&(h.defines.SRGB_TRANSFER="");let y=uv[m];y&&(h.defines[y]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=v.texture,b.setRenderTarget(p),b.render(u,d),p=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var w0=new rn,kd=new is(1,1),T0=new ta,R0=new Yl,C0=new la,a0=[],l0=[],c0=new Float32Array(16),h0=new Float32Array(9),u0=new Float32Array(4);function ho(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=a0[s];if(r===void 0&&(r=new Float32Array(s),a0[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function kt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function zt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function lh(n,e){let t=l0[e];t===void 0&&(t=new Int32Array(e),l0[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function fv(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function pv(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;n.uniform2fv(this.addr,e),zt(t,e)}}function mv(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(kt(t,e))return;n.uniform3fv(this.addr,e),zt(t,e)}}function gv(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;n.uniform4fv(this.addr,e),zt(t,e)}}function _v(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(kt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),zt(t,e)}else{if(kt(t,i))return;u0.set(i),n.uniformMatrix2fv(this.addr,!1,u0),zt(t,i)}}function xv(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(kt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),zt(t,e)}else{if(kt(t,i))return;h0.set(i),n.uniformMatrix3fv(this.addr,!1,h0),zt(t,i)}}function yv(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(kt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),zt(t,e)}else{if(kt(t,i))return;c0.set(i),n.uniformMatrix4fv(this.addr,!1,c0),zt(t,i)}}function bv(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function vv(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;n.uniform2iv(this.addr,e),zt(t,e)}}function Mv(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(kt(t,e))return;n.uniform3iv(this.addr,e),zt(t,e)}}function Sv(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;n.uniform4iv(this.addr,e),zt(t,e)}}function Ev(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Av(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;n.uniform2uiv(this.addr,e),zt(t,e)}}function wv(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(kt(t,e))return;n.uniform3uiv(this.addr,e),zt(t,e)}}function Tv(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;n.uniform4uiv(this.addr,e),zt(t,e)}}function Rv(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(kd.compareFunction=t.isReversedDepthBuffer()?nh:th,r=kd):r=w0,t.setTexture2D(e||r,s)}function Cv(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||R0,s)}function Iv(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||C0,s)}function Pv(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||T0,s)}function Lv(n){switch(n){case 5126:return fv;case 35664:return pv;case 35665:return mv;case 35666:return gv;case 35674:return _v;case 35675:return xv;case 35676:return yv;case 5124:case 35670:return bv;case 35667:case 35671:return vv;case 35668:case 35672:return Mv;case 35669:case 35673:return Sv;case 5125:return Ev;case 36294:return Av;case 36295:return wv;case 36296:return Tv;case 35678:case 36198:case 36298:case 36306:case 35682:return Rv;case 35679:case 36299:case 36307:return Cv;case 35680:case 36300:case 36308:case 36293:return Iv;case 36289:case 36303:case 36311:case 36292:return Pv}}function Dv(n,e){n.uniform1fv(this.addr,e)}function Nv(n,e){let t=ho(e,this.size,2);n.uniform2fv(this.addr,t)}function Ov(n,e){let t=ho(e,this.size,3);n.uniform3fv(this.addr,t)}function Uv(n,e){let t=ho(e,this.size,4);n.uniform4fv(this.addr,t)}function Fv(n,e){let t=ho(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Bv(n,e){let t=ho(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function kv(n,e){let t=ho(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function zv(n,e){n.uniform1iv(this.addr,e)}function Hv(n,e){n.uniform2iv(this.addr,e)}function Vv(n,e){n.uniform3iv(this.addr,e)}function Gv(n,e){n.uniform4iv(this.addr,e)}function Wv(n,e){n.uniform1uiv(this.addr,e)}function Xv(n,e){n.uniform2uiv(this.addr,e)}function Yv(n,e){n.uniform3uiv(this.addr,e)}function $v(n,e){n.uniform4uiv(this.addr,e)}function qv(n,e,t){let i=this.cache,s=e.length,r=lh(t,s);kt(i,r)||(n.uniform1iv(this.addr,r),zt(i,r));let o;this.type===n.SAMPLER_2D_SHADOW?o=kd:o=w0;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function jv(n,e,t){let i=this.cache,s=e.length,r=lh(t,s);kt(i,r)||(n.uniform1iv(this.addr,r),zt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||R0,r[o])}function Zv(n,e,t){let i=this.cache,s=e.length,r=lh(t,s);kt(i,r)||(n.uniform1iv(this.addr,r),zt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||C0,r[o])}function Kv(n,e,t){let i=this.cache,s=e.length,r=lh(t,s);kt(i,r)||(n.uniform1iv(this.addr,r),zt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||T0,r[o])}function Jv(n){switch(n){case 5126:return Dv;case 35664:return Nv;case 35665:return Ov;case 35666:return Uv;case 35674:return Fv;case 35675:return Bv;case 35676:return kv;case 5124:case 35670:return zv;case 35667:case 35671:return Hv;case 35668:case 35672:return Vv;case 35669:case 35673:return Gv;case 5125:return Wv;case 36294:return Xv;case 36295:return Yv;case 36296:return $v;case 35678:case 36198:case 36298:case 36306:case 35682:return qv;case 35679:case 36299:case 36307:return jv;case 35680:case 36300:case 36308:case 36293:return Zv;case 36289:case 36303:case 36311:case 36292:return Kv}}var zd=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Lv(t.type)}},Hd=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Jv(t.type)}},Vd=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],i)}}},Fd=/(\w+)(\])?(\[|\.)?/g;function d0(n,e){n.seq.push(e),n.map[e.id]=e}function Qv(n,e,t){let i=n.name,s=i.length;for(Fd.lastIndex=0;;){let r=Fd.exec(i),o=Fd.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){d0(t,c===void 0?new zd(a,n,e):new Hd(a,n,e));break}else{let u=t.map[a];u===void 0&&(u=new Vd(a),d0(t,u)),t=u}}}var lo=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);Qv(a,l,this)}let s=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&i.push(o)}return i}};function f0(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var eM=37297,tM=0;function nM(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}var p0=new $e;function iM(n){Qe._getMatrix(p0,Qe.workingColorSpace,n);let e=`mat3( ${p0.elements.map(t=>t.toFixed(4))} )`;switch(Qe.getTransfer(n)){case Jo:return[e,"LinearTransferOETF"];case pt:return[e,"sRGBTransferOETF"];default:return We("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function m0(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+nM(n.getShaderSource(e),a)}else return r}function sM(n,e){let t=iM(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var rM={[rd]:"Linear",[od]:"Reinhard",[ad]:"Cineon",[ld]:"ACESFilmic",[hd]:"AgX",[va]:"Neutral",[cd]:"Custom"};function oM(n,e){let t=rM[e];return t===void 0?(We("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var sh=new O;function aM(){Qe.getLuminanceCoefficients(sh);let n=sh.x.toFixed(4),e=sh.y.toFixed(4),t=sh.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function lM(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Na).join(`
`)}function cM(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function hM(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),o=r.name,a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Na(n){return n!==""}function g0(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function _0(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var uM=/^[ \t]*#include +<([\w\d./]+)>/gm;function Gd(n){return n.replace(uM,fM)}var dM=new Map;function fM(n,e){let t=nt[e];if(t===void 0){let i=dM.get(e);if(i!==void 0)t=nt[i],We('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Gd(t)}var pM=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function x0(n){return n.replace(pM,mM)}function mM(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function y0(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var gM={[ba]:"SHADOWMAP_TYPE_PCF",[to]:"SHADOWMAP_TYPE_VSM"};function _M(n){return gM[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var xM={[us]:"ENVMAP_TYPE_CUBE",[Gs]:"ENVMAP_TYPE_CUBE",[Ma]:"ENVMAP_TYPE_CUBE_UV"};function yM(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":xM[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var bM={[Gs]:"ENVMAP_MODE_REFRACTION"};function vM(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":bM[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var MM={[fc]:"ENVMAP_BLENDING_MULTIPLY",[km]:"ENVMAP_BLENDING_MIX",[zm]:"ENVMAP_BLENDING_ADD"};function SM(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":MM[n.combine]||"ENVMAP_BLENDING_NONE"}function EM(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function AM(n,e,t,i){let s=n.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=_M(t),c=yM(t),h=vM(t),u=SM(t),d=EM(t),f=lM(t),m=cM(r),_=s.createProgram(),g,p,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Na).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Na).join(`
`),p.length>0&&(p+=`
`)):(g=[y0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Na).join(`
`),p=[y0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Jn?"#define TONE_MAPPING":"",t.toneMapping!==Jn?nt.tonemapping_pars_fragment:"",t.toneMapping!==Jn?oM("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",nt.colorspace_pars_fragment,sM("linearToOutputTexel",t.outputColorSpace),aM(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Na).join(`
`)),o=Gd(o),o=g0(o,t),o=_0(o,t),a=Gd(a),a=g0(a,t),a=_0(a,t),o=x0(o),a=x0(a),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===Md?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Md?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let E=x+g+o,b=x+p+a,M=f0(s,s.VERTEX_SHADER,E),v=f0(s,s.FRAGMENT_SHADER,b);s.attachShader(_,M),s.attachShader(_,v),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function A(T){if(n.debug.checkShaderErrors){let C=s.getProgramInfoLog(_)||"",R=s.getShaderInfoLog(M)||"",P=s.getShaderInfoLog(v)||"",D=C.trim(),k=R.trim(),V=P.trim(),j=!0,q=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(j=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,_,M,v);else{let z=m0(s,M,"vertex"),H=m0(s,v,"fragment");Ye("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+T.name+`
Material Type: `+T.type+`

Program Info Log: `+D+`
`+z+`
`+H)}else D!==""?We("WebGLProgram: Program Info Log:",D):(k===""||V==="")&&(q=!1);q&&(T.diagnostics={runnable:j,programLog:D,vertexShader:{log:k,prefix:g},fragmentShader:{log:V,prefix:p}})}s.deleteShader(M),s.deleteShader(v),y=new lo(s,_),w=hM(s,_)}let y;this.getUniforms=function(){return y===void 0&&A(this),y};let w;this.getAttributes=function(){return w===void 0&&A(this),w};let L=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return L===!1&&(L=s.getProgramParameter(_,eM)),L},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=tM++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=M,this.fragmentShader=v,this}var wM=0,Wd=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Xd(e),t.set(e,i)),i}},Xd=class{constructor(e){this.id=wM++,this.code=e,this.usedTimes=0}};function TM(n){return n===fs||n===Ta||n===Ra}function RM(n,e,t,i,s,r){let o=new Yr,a=new Wd,l=new Set,c=[],h=new Map,u=i.logarithmicDepthBuffer,d=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(y){return l.add(y),y===0?"uv":`uv${y}`}function _(y,w,L,T,C,R){let P=T.fog,D=C.geometry,k=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?T.environment:null,V=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap,j=e.get(y.envMap||k,V),q=j&&j.mapping===Ma?j.image.height:null,z=f[y.type];y.precision!==null&&(d=i.getMaxPrecision(y.precision),d!==y.precision&&We("WebGLProgram.getParameters:",y.precision,"not supported, using",d,"instead."));let H=D.morphAttributes.position||D.morphAttributes.normal||D.morphAttributes.color,F=H!==void 0?H.length:0,X=0;D.morphAttributes.position!==void 0&&(X=1),D.morphAttributes.normal!==void 0&&(X=2),D.morphAttributes.color!==void 0&&(X=3);let le,de,ye,B;if(z){let St=gn[z];le=St.vertexShader,de=St.fragmentShader}else{le=y.vertexShader,de=y.fragmentShader;let St=a.getVertexShaderStage(y),ut=a.getFragmentShaderStage(y);a.update(y,St,ut),ye=St.id,B=ut.id}let G=n.getRenderTarget(),re=n.state.buffers.depth.getReversed(),ne=C.isInstancedMesh===!0,ee=C.isBatchedMesh===!0,ie=!!y.map,he=!!y.matcap,_e=!!j,me=!!y.aoMap,Ve=!!y.lightMap,Le=!!y.bumpMap&&y.wireframe===!1,qe=!!y.normalMap,Be=!!y.displacementMap,rt=!!y.emissiveMap,gt=!!y.metalnessMap,ot=!!y.roughnessMap,W=y.anisotropy>0,Qt=y.clearcoat>0,_t=y.dispersion>0,N=y.retroreflectivity>0,S=y.iridescence>0,Z=y.sheen>0,Q=y.transmission>0,se=W&&!!y.anisotropyMap,ge=Qt&&!!y.clearcoatMap,be=Qt&&!!y.clearcoatNormalMap,oe=Qt&&!!y.clearcoatRoughnessMap,ce=S&&!!y.iridescenceMap,ve=S&&!!y.iridescenceThicknessMap,ke=Z&&!!y.sheenColorMap,Ae=Z&&!!y.sheenRoughnessMap,Me=!!y.specularMap,ze=!!y.specularColorMap,Xe=!!y.specularIntensityMap,Ke=Q&&!!y.transmissionMap,$=Q&&!!y.thicknessMap,Se=!!y.gradientMap,ae=!!y.alphaMap,Ee=y.alphaTest>0,Re=!!y.alphaHash,ue=!!y.extensions,He=Jn;y.toneMapped&&(G===null||G.isXRRenderTarget===!0)&&(He=n.toneMapping);let Oe={shaderID:z,shaderType:y.type,shaderName:y.name,vertexShader:le,fragmentShader:de,defines:y.defines,customVertexShaderID:ye,customFragmentShaderID:B,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:d,batching:ee,batchingColor:ee&&C._colorsTexture!==null,instancing:ne,instancingColor:ne&&C.instanceColor!==null,instancingMorph:ne&&C.morphTexture!==null,outputColorSpace:G===null?n.outputColorSpace:G.isXRRenderTarget===!0?G.texture.colorSpace:Qe.workingColorSpace,alphaToCoverage:!!y.alphaToCoverage,map:ie,matcap:he,envMap:_e,envMapMode:_e&&j.mapping,envMapCubeUVHeight:q,aoMap:me,lightMap:Ve,bumpMap:Le,normalMap:qe,displacementMap:Be,emissiveMap:rt,normalMapObjectSpace:qe&&y.normalMapType===Vm,normalMapTangentSpace:qe&&y.normalMapType===Ca,packedNormalMap:qe&&y.normalMapType===Ca&&TM(y.normalMap.format),metalnessMap:gt,roughnessMap:ot,anisotropy:W,anisotropyMap:se,clearcoat:Qt,clearcoatMap:ge,clearcoatNormalMap:be,clearcoatRoughnessMap:oe,dispersion:_t,retroreflection:N,iridescence:S,iridescenceMap:ce,iridescenceThicknessMap:ve,sheen:Z,sheenColorMap:ke,sheenRoughnessMap:Ae,specularMap:Me,specularColorMap:ze,specularIntensityMap:Xe,transmission:Q,transmissionMap:Ke,thicknessMap:$,gradientMap:Se,opaque:y.transparent===!1&&y.blending===no&&y.alphaToCoverage===!1,alphaMap:ae,alphaTest:Ee,alphaHash:Re,combine:y.combine,mapUv:ie&&m(y.map.channel),aoMapUv:me&&m(y.aoMap.channel),lightMapUv:Ve&&m(y.lightMap.channel),bumpMapUv:Le&&m(y.bumpMap.channel),normalMapUv:qe&&m(y.normalMap.channel),displacementMapUv:Be&&m(y.displacementMap.channel),emissiveMapUv:rt&&m(y.emissiveMap.channel),metalnessMapUv:gt&&m(y.metalnessMap.channel),roughnessMapUv:ot&&m(y.roughnessMap.channel),anisotropyMapUv:se&&m(y.anisotropyMap.channel),clearcoatMapUv:ge&&m(y.clearcoatMap.channel),clearcoatNormalMapUv:be&&m(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:oe&&m(y.clearcoatRoughnessMap.channel),iridescenceMapUv:ce&&m(y.iridescenceMap.channel),iridescenceThicknessMapUv:ve&&m(y.iridescenceThicknessMap.channel),sheenColorMapUv:ke&&m(y.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&m(y.sheenRoughnessMap.channel),specularMapUv:Me&&m(y.specularMap.channel),specularColorMapUv:ze&&m(y.specularColorMap.channel),specularIntensityMapUv:Xe&&m(y.specularIntensityMap.channel),transmissionMapUv:Ke&&m(y.transmissionMap.channel),thicknessMapUv:$&&m(y.thicknessMap.channel),alphaMapUv:ae&&m(y.alphaMap.channel),vertexTangents:!!D.attributes.tangent&&(qe||W),vertexNormals:!!D.attributes.normal,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!D.attributes.color&&D.attributes.color.itemSize===4,pointsUvs:C.isPoints===!0&&!!D.attributes.uv&&(ie||ae),fog:!!P,useFog:y.fog===!0,fogExp2:!!P&&P.isFogExp2,flatShading:y.wireframe===!1&&(y.flatShading===!0||D.attributes.normal===void 0&&qe===!1&&(y.isMeshLambertMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isMeshPhysicalMaterial)),sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:re,skinning:C.isSkinnedMesh===!0,hasPositionAttribute:D.attributes.position!==void 0,morphTargets:D.morphAttributes.position!==void 0,morphNormals:D.morphAttributes.normal!==void 0,morphColors:D.morphAttributes.color!==void 0,morphTargetsCount:F,morphTextureStride:X,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:R.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&L.length>0,shadowMapType:n.shadowMap.type,toneMapping:He,decodeVideoTexture:ie&&y.map.isVideoTexture===!0&&Qe.getTransfer(y.map.colorSpace)===pt,decodeVideoTextureEmissive:rt&&y.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(y.emissiveMap.colorSpace)===pt,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===mn,flipSided:y.side===Bt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:ue&&y.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ue&&y.extensions.multiDraw===!0||ee)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Oe.vertexUv1s=l.has(1),Oe.vertexUv2s=l.has(2),Oe.vertexUv3s=l.has(3),l.clear(),Oe}function g(y){let w=[];if(y.shaderID?w.push(y.shaderID):(w.push(y.customVertexShaderID),w.push(y.customFragmentShaderID)),y.defines!==void 0)for(let L in y.defines)w.push(L),w.push(y.defines[L]);return y.isRawShaderMaterial===!1&&(p(w,y),x(w,y),w.push(n.outputColorSpace)),w.push(y.customProgramCacheKey),w.join()}function p(y,w){y.push(w.precision),y.push(w.outputColorSpace),y.push(w.envMapMode),y.push(w.envMapCubeUVHeight),y.push(w.mapUv),y.push(w.alphaMapUv),y.push(w.lightMapUv),y.push(w.aoMapUv),y.push(w.bumpMapUv),y.push(w.normalMapUv),y.push(w.displacementMapUv),y.push(w.emissiveMapUv),y.push(w.metalnessMapUv),y.push(w.roughnessMapUv),y.push(w.anisotropyMapUv),y.push(w.clearcoatMapUv),y.push(w.clearcoatNormalMapUv),y.push(w.clearcoatRoughnessMapUv),y.push(w.iridescenceMapUv),y.push(w.iridescenceThicknessMapUv),y.push(w.sheenColorMapUv),y.push(w.sheenRoughnessMapUv),y.push(w.specularMapUv),y.push(w.specularColorMapUv),y.push(w.specularIntensityMapUv),y.push(w.transmissionMapUv),y.push(w.thicknessMapUv),y.push(w.combine),y.push(w.fogExp2),y.push(w.sizeAttenuation),y.push(w.morphTargetsCount),y.push(w.morphAttributeCount),y.push(w.numSunLights),y.push(w.numDirLights),y.push(w.numPointLights),y.push(w.numSpotLights),y.push(w.numSpotLightMaps),y.push(w.numHemiLights),y.push(w.numRectAreaLights),y.push(w.numSunLightShadows),y.push(w.numDirLightShadows),y.push(w.numPointLightShadows),y.push(w.numSpotLightShadows),y.push(w.numSpotLightShadowsWithMaps),y.push(w.numLightProbes),y.push(w.shadowMapType),y.push(w.toneMapping),y.push(w.numClippingPlanes),y.push(w.numClipIntersection),y.push(w.depthPacking)}function x(y,w){o.disableAll(),w.instancing&&o.enable(0),w.instancingColor&&o.enable(1),w.instancingMorph&&o.enable(2),w.matcap&&o.enable(3),w.envMap&&o.enable(4),w.normalMapObjectSpace&&o.enable(5),w.normalMapTangentSpace&&o.enable(6),w.clearcoat&&o.enable(7),w.iridescence&&o.enable(8),w.alphaTest&&o.enable(9),w.vertexColors&&o.enable(10),w.vertexAlphas&&o.enable(11),w.vertexUv1s&&o.enable(12),w.vertexUv2s&&o.enable(13),w.vertexUv3s&&o.enable(14),w.vertexTangents&&o.enable(15),w.anisotropy&&o.enable(16),w.alphaHash&&o.enable(17),w.batching&&o.enable(18),w.dispersion&&o.enable(19),w.retroreflection&&o.enable(24),w.batchingColor&&o.enable(20),w.gradientMap&&o.enable(21),w.packedNormalMap&&o.enable(22),w.vertexNormals&&o.enable(23),y.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),w.numLightProbeGrids>0&&o.enable(22),w.hasPositionAttribute&&o.enable(23),y.push(o.mask)}function E(y){let w=f[y.type],L;if(w){let T=gn[w];L=Pa.clone(T.uniforms)}else L=y.uniforms;return L}function b(y,w){let L=h.get(w);return L!==void 0?++L.usedTimes:(L=new AM(n,w,y,s),c.push(L),h.set(w,L)),L}function M(y){if(--y.usedTimes===0){let w=c.indexOf(y);c[w]=c[c.length-1],c.pop(),h.delete(y.cacheKey),y.destroy()}}function v(y){a.remove(y)}function A(){a.dispose()}return{getParameters:_,getProgramCacheKey:g,getUniforms:E,acquireProgram:b,releaseProgram:M,releaseShaderCache:v,programs:c,dispose:A}}function CM(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function IM(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function b0(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function v0(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,m,_,g,p){let x=n[e];return x===void 0?(x={id:d.id,object:d,geometry:f,material:m,materialVariant:o(d),groupOrder:_,renderOrder:d.renderOrder,z:g,group:p},n[e]=x):(x.id=d.id,x.object=d,x.geometry=f,x.material=m,x.materialVariant=o(d),x.groupOrder=_,x.renderOrder=d.renderOrder,x.z=g,x.group=p),e++,x}function l(d,f,m,_,g,p,x){x.reversedDepth===!0&&(g=-g);let E=a(d,f,m,_,g,p);m.transmission>0?i.push(E):m.transparent===!0?s.push(E):t.push(E)}function c(d,f,m,_,g,p){let x=a(d,f,m,_,g,p);m.transmission>0?i.unshift(x):m.transparent===!0?s.unshift(x):t.unshift(x)}function h(d,f){t.length>1&&t.sort(d||IM),i.length>1&&i.sort(f||b0),s.length>1&&s.sort(f||b0)}function u(){for(let d=e,f=n.length;d<f;d++){let m=n[d];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:u,sort:h}}function PM(){let n=new WeakMap;function e(i,s){let r=n.get(i),o;return r===void 0?(o=new v0,n.set(i,[o])):s>=r.length?(o=new v0,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function LM(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new O,color:new Ge};break;case"SpotLight":t={position:new O,direction:new O,color:new Ge,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new O,color:new Ge,distance:0,decay:0};break;case"HemisphereLight":t={direction:new O,skyColor:new Ge,groundColor:new Ge};break;case"RectAreaLight":t={color:new Ge,position:new O,halfWidth:new O,halfHeight:new O};break}return n[e.id]=t,t}}}function DM(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ie};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ie};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ie,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var NM=0;function OM(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function UM(n){let e=new LM,t=DM(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new O);let s=new O,r=new tt,o=new tt;function a(c){let h=0,u=0,d=0;for(let C=0;C<9;C++)i.probe[C].set(0,0,0);let f=0,m=0,_=0,g=0,p=0,x=0,E=0,b=0,M=0,v=0,A=0,y=0,w=0,L=0;c.sort(OM);for(let C=0,R=c.length;C<R;C++){let P=c[C],D=P.color,k=P.intensity,V=P.distance,j=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===fs?j=P.shadow.map.texture:j=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)h+=D.r*k,u+=D.g*k,d+=D.b*k;else if(P.isLightProbe){for(let q=0;q<9;q++)i.probe[q].addScaledVector(P.sh.coefficients[q],k);L++}else if(P.isSunLight){let q=e.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let z=P.shadow,H=t.get(P);H.shadowIntensity=z.intensity,H.shadowBias=z.bias,H.shadowNormalBias=z.normalBias,H.shadowRadius=z.radius,H.shadowMapSize.copy(z.mapSize).multiply(z.getFrameExtents()),i.sunShadow[m]=H,i.sunShadowMap[m]=j;let F=z.getViewportCount();for(let X=0;X<F;X++)i.sunShadowMatrix[_+X]=z.getMatrix(X),i.sunShadowCascade[_+X]=z._cascadeData[X];_+=F,m++}i.sun[f]=q,f++}else if(P.isDirectionalLight){let q=e.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let z=P.shadow,H=t.get(P);H.shadowIntensity=z.intensity,H.shadowBias=z.bias,H.shadowNormalBias=z.normalBias,H.shadowRadius=z.radius,H.shadowMapSize=z.mapSize,i.directionalShadow[g]=H,i.directionalShadowMap[g]=j,i.directionalShadowMatrix[g]=P.shadow.matrix,M++}i.directional[g]=q,g++}else if(P.isSpotLight){let q=e.get(P);q.position.setFromMatrixPosition(P.matrixWorld),q.color.copy(D).multiplyScalar(k),q.distance=V,q.coneCos=Math.cos(P.angle),q.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),q.decay=P.decay,i.spot[x]=q;let z=P.shadow;if(P.map&&(i.spotLightMap[y]=P.map,y++,z.updateMatrices(P),P.castShadow&&w++),i.spotLightMatrix[x]=z.matrix,P.castShadow){let H=t.get(P);H.shadowIntensity=z.intensity,H.shadowBias=z.bias,H.shadowNormalBias=z.normalBias,H.shadowRadius=z.radius,H.shadowMapSize=z.mapSize,i.spotShadow[x]=H,i.spotShadowMap[x]=j,A++}x++}else if(P.isRectAreaLight){let q=e.get(P);q.color.copy(D).multiplyScalar(k),q.halfWidth.set(P.width*.5,0,0),q.halfHeight.set(0,P.height*.5,0),i.rectArea[E]=q,E++}else if(P.isPointLight){let q=e.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity),q.distance=P.distance,q.decay=P.decay,P.castShadow){let z=P.shadow,H=t.get(P);H.shadowIntensity=z.intensity,H.shadowBias=z.bias,H.shadowNormalBias=z.normalBias,H.shadowRadius=z.radius,H.shadowMapSize=z.mapSize,H.shadowCameraNear=z.camera.near,H.shadowCameraFar=z.camera.far,i.pointShadow[p]=H,i.pointShadowMap[p]=j,i.pointShadowMatrix[p]=P.shadow.matrix,v++}i.point[p]=q,p++}else if(P.isHemisphereLight){let q=e.get(P);q.skyColor.copy(P.color).multiplyScalar(k),q.groundColor.copy(P.groundColor).multiplyScalar(k),i.hemi[b]=q,b++}}E>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=xe.LTC_FLOAT_1,i.rectAreaLTC2=xe.LTC_FLOAT_2):(i.rectAreaLTC1=xe.LTC_HALF_1,i.rectAreaLTC2=xe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let T=i.hash;(T.sunLength!==f||T.directionalLength!==g||T.pointLength!==p||T.spotLength!==x||T.rectAreaLength!==E||T.hemiLength!==b||T.numSunShadows!==m||T.numDirectionalShadows!==M||T.numPointShadows!==v||T.numSpotShadows!==A||T.numSpotMaps!==y||T.numLightProbes!==L)&&(i.sun.length=f,i.directional.length=g,i.spot.length=x,i.rectArea.length=E,i.point.length=p,i.hemi.length=b,i.sunShadow.length=m,i.sunShadowMap.length=m,i.sunShadowMatrix.length=_,i.sunShadowCascade.length=_,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.directionalShadowMatrix.length=M,i.pointShadow.length=v,i.pointShadowMap.length=v,i.pointShadowMatrix.length=v,i.spotShadow.length=A,i.spotShadowMap.length=A,i.spotLightMatrix.length=A+y-w,i.spotLightMap.length=y,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=L,T.sunLength=f,T.directionalLength=g,T.pointLength=p,T.spotLength=x,T.rectAreaLength=E,T.hemiLength=b,T.numSunShadows=m,T.numDirectionalShadows=M,T.numPointShadows=v,T.numSpotShadows=A,T.numSpotMaps=y,T.numLightProbes=L,i.version=NM++)}function l(c,h){let u=0,d=0,f=0,m=0,_=0,g=0,p=h.matrixWorldInverse;for(let x=0,E=c.length;x<E;x++){let b=c[x];if(b.isSunLight){let M=i.sun[u];M.direction.setFromMatrixPosition(b.matrixWorld),M.direction.transformDirection(p),u++}else if(b.isDirectionalLight){let M=i.directional[d];M.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),d++}else if(b.isSpotLight){let M=i.spot[m];M.position.setFromMatrixPosition(b.matrixWorld),M.position.applyMatrix4(p),M.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),m++}else if(b.isRectAreaLight){let M=i.rectArea[_];M.position.setFromMatrixPosition(b.matrixWorld),M.position.applyMatrix4(p),o.identity(),r.copy(b.matrixWorld),r.premultiply(p),o.extractRotation(r),M.halfWidth.set(b.width*.5,0,0),M.halfHeight.set(0,b.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),_++}else if(b.isPointLight){let M=i.point[f];M.position.setFromMatrixPosition(b.matrixWorld),M.position.applyMatrix4(p),f++}else if(b.isHemisphereLight){let M=i.hemi[g];M.direction.setFromMatrixPosition(b.matrixWorld),M.direction.transformDirection(p),g++}}}return{setup:a,setupView:l,state:i}}function M0(n){let e=new UM(n),t=[],i=[],s=[];function r(d){u.camera=d,t.length=0,i.length=0,s.length=0}function o(d){t.push(d)}function a(d){i.push(d)}function l(d){s.push(d)}function c(){e.setup(t)}function h(d){e.setupView(t,d)}let u={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function FM(n){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new M0(n),e.set(s,[a])):r>=o.length?(a=new M0(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var BM=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,kM=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,zM=[new O(1,0,0),new O(-1,0,0),new O(0,1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1)],HM=[new O(0,-1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1),new O(0,-1,0),new O(0,-1,0)],S0=new tt,Da=new O,Bd=new O;function VM(n,e,t){let i=new jr,s=new Ie,r=new Ie,o=new ht,a=new Jl,l=new Ql,c={},h=t.maxTextureSize,u={[Kn]:Bt,[Bt]:Kn,[mn]:mn},d=new pn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ie},radius:{value:4}},vertexShader:BM,fragmentShader:kM}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let m=new Rt;m.setAttribute("position",new mt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new at(m,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ba;let p=this.type;this.render=function(v,A,y){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||v.length===0)return;this.type===bm&&(We("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=ba);let w=n.getRenderTarget(),L=n.getActiveCubeFace(),T=n.getActiveMipmapLevel(),C=n.state;C.setBlending(_i),C.buffers.depth.getReversed()===!0?C.buffers.color.setClear(0,0,0,0):C.buffers.color.setClear(1,1,1,1),C.buffers.depth.setTest(!0),C.setScissorTest(!1);let R=p!==this.type;R&&A.traverse(function(P){P.material&&(Array.isArray(P.material)?P.material.forEach(D=>D.needsUpdate=!0):P.material.needsUpdate=!0)});for(let P=0,D=v.length;P<D;P++){let k=v[P],V=k.shadow;if(V===void 0){We("WebGLShadowMap:",k,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);let j=V.getFrameExtents();s.multiply(j),r.copy(V.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/j.x),s.x=r.x*j.x,V.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/j.y),s.y=r.y*j.y,V.mapSize.y=r.y));let q=n.state.buffers.depth.getReversed();if(V.camera._reversedDepth=q,V.map===null||R===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===to){if(k.isPointLight){We("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new xn(s.x,s.y,{format:fs,type:ei,minFilter:Ft,magFilter:Ft,generateMipmaps:!1}),V.map.texture.name=k.name+".shadowMap",V.map.depthTexture=new is(s.x,s.y,zn),V.map.depthTexture.name=k.name+".shadowMapDepth",V.map.depthTexture.format=fi,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Ut,V.map.depthTexture.magFilter=Ut}else k.isPointLight?(V.map=new rh(s.x),V.map.depthTexture=new Zl(s.x,Qn)):(V.map=new xn(s.x,s.y),V.map.depthTexture=new is(s.x,s.y,Qn)),V.map.depthTexture.name=k.name+".shadowMap",V.map.depthTexture.format=fi,this.type===ba?(V.map.depthTexture.compareFunction=q?nh:th,V.map.depthTexture.minFilter=Ft,V.map.depthTexture.magFilter=Ft):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Ut,V.map.depthTexture.magFilter=Ut);V.camera.updateProjectionMatrix()}V.map.isWebGLCubeRenderTarget!==!0&&(V.map.width!==s.x||V.map.height!==s.y)&&V.map.setSize(s.x,s.y);let z=V.map.isWebGLCubeRenderTarget?6:V.getViewportCount();k.isPointLight!==!0&&V.updateMatrices(k,y);for(let H=0;H<z;H++){let F=V.getCamera(H);if(k.isPointLight){let X=V.camera,le=V.matrix,de=k.distance||X.far;de!==X.far&&(X.far=de,X.updateProjectionMatrix()),Da.setFromMatrixPosition(k.matrixWorld),X.position.copy(Da),Bd.copy(X.position),Bd.add(zM[H]),X.up.copy(HM[H]),X.lookAt(Bd),X.updateMatrixWorld(),le.makeTranslation(-Da.x,-Da.y,-Da.z),S0.multiplyMatrices(X.projectionMatrix,X.matrixWorldInverse),V._frustum.setFromProjectionMatrix(S0,X.coordinateSystem,X.reversedDepth)}if(V.map.isWebGLCubeRenderTarget)n.setRenderTarget(V.map,H),n.clear();else{H===0&&(n.setRenderTarget(V.map),n.clear());let X=V.getViewport(H);o.set(r.x*X.x,r.y*X.y,r.x*X.z,r.y*X.w),C.viewport(o)}i=V.getFrustum(H),b(A,y,F,k,this.type)}V.isPointLightShadow!==!0&&this.type===to&&x(V,y),V.needsUpdate=!1}p=this.type,g.needsUpdate=!1,n.setRenderTarget(w,L,T)};function x(v,A){let y=e.update(_);d.defines.VSM_SAMPLES!==v.blurSamples&&(d.defines.VSM_SAMPLES=v.blurSamples,f.defines.VSM_SAMPLES=v.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),v.mapPass===null?v.mapPass=new xn(s.x,s.y,{format:fs,type:ei}):(v.mapPass.width!==v.map.width||v.mapPass.height!==v.map.height)&&v.mapPass.setSize(v.map.width,v.map.height),d.uniforms.shadow_pass.value=v.map.depthTexture,d.uniforms.resolution.value.set(v.map.width,v.map.height),d.uniforms.radius.value=v.radius,n.setRenderTarget(v.mapPass),n.clear(),n.renderBufferDirect(A,null,y,d,_,null),f.uniforms.shadow_pass.value=v.mapPass.texture,f.uniforms.resolution.value.set(v.map.width,v.map.height),f.uniforms.radius.value=v.radius,n.setRenderTarget(v.map),n.clear(),n.renderBufferDirect(A,null,y,f,_,null)}function E(v,A,y,w){let L=null,T=y.isPointLight===!0?v.customDistanceMaterial:v.customDepthMaterial;if(T!==void 0)L=T;else if(L=y.isPointLight===!0?l:a,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let C=L.uuid,R=A.uuid,P=c[C];P===void 0&&(P={},c[C]=P);let D=P[R];D===void 0&&(D=L.clone(),P[R]=D,A.addEventListener("dispose",M)),L=D}if(L.visible=A.visible,L.wireframe=A.wireframe,w===to?L.side=A.shadowSide!==null?A.shadowSide:A.side:L.side=A.shadowSide!==null?A.shadowSide:u[A.side],L.alphaMap=A.alphaMap,L.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,L.map=A.map,L.clipShadows=A.clipShadows,L.clippingPlanes=A.clippingPlanes,L.clipIntersection=A.clipIntersection,L.displacementMap=A.displacementMap,L.displacementScale=A.displacementScale,L.displacementBias=A.displacementBias,L.wireframeLinewidth=A.wireframeLinewidth,L.linewidth=A.linewidth,y.isPointLight===!0&&L.isMeshDistanceMaterial===!0){let C=n.properties.get(L);C.light=y}return L}function b(v,A,y,w,L){if(v.visible===!1)return;if(v.layers.test(A.layers)&&(v.isMesh||v.isLine||v.isPoints)&&(v.castShadow||v.receiveShadow&&L===to)&&(!v.frustumCulled||v.intersectsFrustum(i))){v.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,v.matrixWorld);let R=e.update(v),P=v.material;if(Array.isArray(P)){let D=R.groups;for(let k=0,V=D.length;k<V;k++){let j=D[k],q=P[j.materialIndex];if(q&&q.visible){let z=E(v,q,w,L);v.onBeforeShadow(n,v,A,y,R,z,j),n.renderBufferDirect(y,null,R,z,v,j),v.onAfterShadow(n,v,A,y,R,z,j)}}}else if(P.visible){let D=E(v,P,w,L);v.onBeforeShadow(n,v,A,y,R,D,null),n.renderBufferDirect(y,null,R,D,v,null),v.onAfterShadow(n,v,A,y,R,D,null)}}let C=v.children;for(let R=0,P=C.length;R<P;R++)b(C[R],A,y,w,L)}function M(v){v.target.removeEventListener("dispose",M);for(let y in c){let w=c[y],L=v.target.uuid;L in w&&(w[L].dispose(),delete w[L])}}}function GM(n,e){function t(){let $=!1,Se=new ht,ae=null,Ee=new ht(0,0,0,0);return{setMask:function(Re){ae!==Re&&!$&&(n.colorMask(Re,Re,Re,Re),ae=Re)},setLocked:function(Re){$=Re},setClear:function(Re,ue,He,Oe,St){St===!0&&(Re*=Oe,ue*=Oe,He*=Oe),Se.set(Re,ue,He,Oe),Ee.equals(Se)===!1&&(n.clearColor(Re,ue,He,Oe),Ee.copy(Se))},reset:function(){$=!1,ae=null,Ee.set(-1,0,0,0)}}}function i(){let $=!1,Se=!1,ae=null,Ee=null,Re=null;return{setReversed:function(ue){if(Se!==ue){let He=e.get("EXT_clip_control");ue?He.clipControlEXT(He.LOWER_LEFT_EXT,He.ZERO_TO_ONE_EXT):He.clipControlEXT(He.LOWER_LEFT_EXT,He.NEGATIVE_ONE_TO_ONE_EXT),Se=ue;let Oe=Re;Re=null,this.setClear(Oe)}},getReversed:function(){return Se},setTest:function(ue){ue?G(n.DEPTH_TEST):re(n.DEPTH_TEST)},setMask:function(ue){ae!==ue&&!$&&(n.depthMask(ue),ae=ue)},setFunc:function(ue){if(Se&&(ue=Jm[ue]),Ee!==ue){switch(ue){case Bl:n.depthFunc(n.NEVER);break;case kl:n.depthFunc(n.ALWAYS);break;case zl:n.depthFunc(n.LESS);break;case Br:n.depthFunc(n.LEQUAL);break;case Hl:n.depthFunc(n.EQUAL);break;case Vl:n.depthFunc(n.GEQUAL);break;case Gl:n.depthFunc(n.GREATER);break;case Wl:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}Ee=ue}},setLocked:function(ue){$=ue},setClear:function(ue){Re!==ue&&(Re=ue,Se&&(ue=1-ue),n.clearDepth(ue))},reset:function(){$=!1,ae=null,Ee=null,Re=null,Se=!1}}}function s(){let $=!1,Se=null,ae=null,Ee=null,Re=null,ue=null,He=null,Oe=null,St=null;return{setTest:function(ut){$||(ut?G(n.STENCIL_TEST):re(n.STENCIL_TEST))},setMask:function(ut){Se!==ut&&!$&&(n.stencilMask(ut),Se=ut)},setFunc:function(ut,Gn,ai){(ae!==ut||Ee!==Gn||Re!==ai)&&(n.stencilFunc(ut,Gn,ai),ae=ut,Ee=Gn,Re=ai)},setOp:function(ut,Gn,ai){(ue!==ut||He!==Gn||Oe!==ai)&&(n.stencilOp(ut,Gn,ai),ue=ut,He=Gn,Oe=ai)},setLocked:function(ut){$=ut},setClear:function(ut){St!==ut&&(n.clearStencil(ut),St=ut)},reset:function(){$=!1,Se=null,ae=null,Ee=null,Re=null,ue=null,He=null,Oe=null,St=null}}}let r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,m=[],_=null,g=!1,p=null,x=null,E=null,b=null,M=null,v=null,A=null,y=new Ge(0,0,0),w=0,L=!1,T=null,C=null,R=null,P=null,D=null,k=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,j=0,q=n.getParameter(n.VERSION);q.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(q)[1]),V=j>=1):q.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),V=j>=2);let z=null,H={},F=n.getParameter(n.SCISSOR_BOX),X=n.getParameter(n.VIEWPORT),le=new ht().fromArray(F),de=new ht().fromArray(X);function ye($,Se,ae,Ee){let Re=new Uint8Array(4),ue=n.createTexture();n.bindTexture($,ue),n.texParameteri($,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri($,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let He=0;He<ae;He++)$===n.TEXTURE_3D||$===n.TEXTURE_2D_ARRAY?n.texImage3D(Se,0,n.RGBA,1,1,Ee,0,n.RGBA,n.UNSIGNED_BYTE,Re):n.texImage2D(Se+He,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Re);return ue}let B={};B[n.TEXTURE_2D]=ye(n.TEXTURE_2D,n.TEXTURE_2D,1),B[n.TEXTURE_CUBE_MAP]=ye(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),B[n.TEXTURE_2D_ARRAY]=ye(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),B[n.TEXTURE_3D]=ye(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),G(n.DEPTH_TEST),o.setFunc(Br),Le(!1),qe(Qu),G(n.CULL_FACE),me(_i);function G($){h[$]!==!0&&(n.enable($),h[$]=!0)}function re($){h[$]!==!1&&(n.disable($),h[$]=!1)}function ne($,Se){return d[$]!==Se?(n.bindFramebuffer($,Se),d[$]=Se,$===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=Se),$===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=Se),!0):!1}function ee($,Se){let ae=m,Ee=!1;if($){ae=f.get(Se),ae===void 0&&(ae=[],f.set(Se,ae));let Re=$.textures;if(ae.length!==Re.length||ae[0]!==n.COLOR_ATTACHMENT0){for(let ue=0,He=Re.length;ue<He;ue++)ae[ue]=n.COLOR_ATTACHMENT0+ue;ae.length=Re.length,Ee=!0}}else ae[0]!==n.BACK&&(ae[0]=n.BACK,Ee=!0);Ee&&n.drawBuffers(ae)}function ie($){return _!==$?(n.useProgram($),_=$,!0):!1}let he={[Vs]:n.FUNC_ADD,[Mm]:n.FUNC_SUBTRACT,[Sm]:n.FUNC_REVERSE_SUBTRACT};he[Em]=n.MIN,he[Am]=n.MAX;let _e={[wm]:n.ZERO,[Tm]:n.ONE,[Rm]:n.SRC_COLOR,[id]:n.SRC_ALPHA,[Nm]:n.SRC_ALPHA_SATURATE,[Lm]:n.DST_COLOR,[Im]:n.DST_ALPHA,[Cm]:n.ONE_MINUS_SRC_COLOR,[sd]:n.ONE_MINUS_SRC_ALPHA,[Dm]:n.ONE_MINUS_DST_COLOR,[Pm]:n.ONE_MINUS_DST_ALPHA,[Om]:n.CONSTANT_COLOR,[Um]:n.ONE_MINUS_CONSTANT_COLOR,[Fm]:n.CONSTANT_ALPHA,[Bm]:n.ONE_MINUS_CONSTANT_ALPHA};function me($,Se,ae,Ee,Re,ue,He,Oe,St,ut){if($===_i){g===!0&&(re(n.BLEND),g=!1);return}if(g===!1&&(G(n.BLEND),g=!0),$!==vm){if($!==p||ut!==L){if((x!==Vs||M!==Vs)&&(n.blendEquation(n.FUNC_ADD),x=Vs,M=Vs),ut)switch($){case no:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case ed:n.blendFunc(n.ONE,n.ONE);break;case td:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case nd:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Ye("WebGLState: Invalid blending: ",$);break}else switch($){case no:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case ed:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case td:Ye("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case nd:Ye("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ye("WebGLState: Invalid blending: ",$);break}E=null,b=null,v=null,A=null,y.set(0,0,0),w=0,p=$,L=ut}return}Re=Re||Se,ue=ue||ae,He=He||Ee,(Se!==x||Re!==M)&&(n.blendEquationSeparate(he[Se],he[Re]),x=Se,M=Re),(ae!==E||Ee!==b||ue!==v||He!==A)&&(n.blendFuncSeparate(_e[ae],_e[Ee],_e[ue],_e[He]),E=ae,b=Ee,v=ue,A=He),(Oe.equals(y)===!1||St!==w)&&(n.blendColor(Oe.r,Oe.g,Oe.b,St),y.copy(Oe),w=St),p=$,L=!1}function Ve($,Se){$.side===mn?re(n.CULL_FACE):G(n.CULL_FACE);let ae=$.side===Bt;Se&&(ae=!ae),Le(ae),$.blending===no&&$.transparent===!1?me(_i):me($.blending,$.blendEquation,$.blendSrc,$.blendDst,$.blendEquationAlpha,$.blendSrcAlpha,$.blendDstAlpha,$.blendColor,$.blendAlpha,$.premultipliedAlpha),o.setFunc($.depthFunc),o.setTest($.depthTest),o.setMask($.depthWrite),r.setMask($.colorWrite);let Ee=$.stencilWrite;a.setTest(Ee),Ee&&(a.setMask($.stencilWriteMask),a.setFunc($.stencilFunc,$.stencilRef,$.stencilFuncMask),a.setOp($.stencilFail,$.stencilZFail,$.stencilZPass)),rt($.polygonOffset,$.polygonOffsetFactor,$.polygonOffsetUnits),$.alphaToCoverage===!0?G(n.SAMPLE_ALPHA_TO_COVERAGE):re(n.SAMPLE_ALPHA_TO_COVERAGE)}function Le($){T!==$&&($?n.frontFace(n.CW):n.frontFace(n.CCW),T=$)}function qe($){$!==xm?(G(n.CULL_FACE),$!==C&&($===Qu?n.cullFace(n.BACK):$===ym?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):re(n.CULL_FACE),C=$}function Be($){$!==R&&(V&&n.lineWidth($),R=$)}function rt($,Se,ae){$?(G(n.POLYGON_OFFSET_FILL),(P!==Se||D!==ae)&&(P=Se,D=ae,o.getReversed()&&(Se=-Se),n.polygonOffset(Se,ae))):re(n.POLYGON_OFFSET_FILL)}function gt($){$?G(n.SCISSOR_TEST):re(n.SCISSOR_TEST)}function ot($){$===void 0&&($=n.TEXTURE0+k-1),z!==$&&(n.activeTexture($),z=$)}function W($,Se,ae){ae===void 0&&(z===null?ae=n.TEXTURE0+k-1:ae=z);let Ee=H[ae];Ee===void 0&&(Ee={type:void 0,texture:void 0},H[ae]=Ee),(Ee.type!==$||Ee.texture!==Se)&&(z!==ae&&(n.activeTexture(ae),z=ae),n.bindTexture($,Se||B[$]),Ee.type=$,Ee.texture=Se)}function Qt(){let $=H[z];$!==void 0&&$.type!==void 0&&(n.bindTexture($.type,null),$.type=void 0,$.texture=void 0)}function _t(){try{n.compressedTexImage2D(...arguments)}catch($){Ye("WebGLState:",$)}}function N(){try{n.compressedTexImage3D(...arguments)}catch($){Ye("WebGLState:",$)}}function S(){try{n.texSubImage2D(...arguments)}catch($){Ye("WebGLState:",$)}}function Z(){try{n.texSubImage3D(...arguments)}catch($){Ye("WebGLState:",$)}}function Q(){try{n.compressedTexSubImage2D(...arguments)}catch($){Ye("WebGLState:",$)}}function se(){try{n.compressedTexSubImage3D(...arguments)}catch($){Ye("WebGLState:",$)}}function ge(){try{n.texStorage2D(...arguments)}catch($){Ye("WebGLState:",$)}}function be(){try{n.texStorage3D(...arguments)}catch($){Ye("WebGLState:",$)}}function oe(){try{n.texImage2D(...arguments)}catch($){Ye("WebGLState:",$)}}function ce(){try{n.texImage3D(...arguments)}catch($){Ye("WebGLState:",$)}}function ve($){return u[$]!==void 0?u[$]:n.getParameter($)}function ke($,Se){u[$]!==Se&&(n.pixelStorei($,Se),u[$]=Se)}function Ae($){le.equals($)===!1&&(n.scissor($.x,$.y,$.z,$.w),le.copy($))}function Me($){de.equals($)===!1&&(n.viewport($.x,$.y,$.z,$.w),de.copy($))}function ze($,Se){let ae=c.get(Se);ae===void 0&&(ae=new WeakMap,c.set(Se,ae));let Ee=ae.get($);Ee===void 0&&(Ee=n.getUniformBlockIndex(Se,$.name),ae.set($,Ee))}function Xe($,Se){let Ee=c.get(Se).get($);l.get(Se)!==Ee&&(n.uniformBlockBinding(Se,Ee,$.__bindingPointIndex),l.set(Se,Ee))}function Ke(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),h={},u={},z=null,H={},d={},f=new WeakMap,m=[],_=null,g=!1,p=null,x=null,E=null,b=null,M=null,v=null,A=null,y=new Ge(0,0,0),w=0,L=!1,T=null,C=null,R=null,P=null,D=null,le.set(0,0,n.canvas.width,n.canvas.height),de.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:G,disable:re,bindFramebuffer:ne,drawBuffers:ee,useProgram:ie,setBlending:me,setMaterial:Ve,setFlipSided:Le,setCullFace:qe,setLineWidth:Be,setPolygonOffset:rt,setScissorTest:gt,activeTexture:ot,bindTexture:W,unbindTexture:Qt,compressedTexImage2D:_t,compressedTexImage3D:N,texImage2D:oe,texImage3D:ce,pixelStorei:ke,getParameter:ve,updateUBOMapping:ze,uniformBlockBinding:Xe,texStorage2D:ge,texStorage3D:be,texSubImage2D:S,texSubImage3D:Z,compressedTexSubImage2D:Q,compressedTexSubImage3D:se,scissor:Ae,viewport:Me,reset:Ke}}function WM(n,e,t,i,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ie,h=new WeakMap,u=new Set,d,f=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(N,S){return m?new OffscreenCanvas(N,S):Qo("canvas")}function g(N,S,Z){let Q=1,se=_t(N);if((se.width>Z||se.height>Z)&&(Q=Z/Math.max(se.width,se.height)),Q<1)if(typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&N instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&N instanceof ImageBitmap||typeof VideoFrame<"u"&&N instanceof VideoFrame){let ge=Math.floor(Q*se.width),be=Math.floor(Q*se.height);d===void 0&&(d=_(ge,be));let oe=S?_(ge,be):d;return oe.width=ge,oe.height=be,oe.getContext("2d").drawImage(N,0,0,ge,be),We("WebGLRenderer: Texture has been resized from ("+se.width+"x"+se.height+") to ("+ge+"x"+be+")."),oe}else return"data"in N&&We("WebGLRenderer: Image in DataTexture is too big ("+se.width+"x"+se.height+")."),N;return N}function p(N){return N.generateMipmaps}function x(N){n.generateMipmap(N)}function E(N){return N.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:N.isWebGL3DRenderTarget?n.TEXTURE_3D:N.isWebGLArrayRenderTarget||N.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function b(N,S,Z,Q,se,ge=!1){if(N!==null){if(n[N]!==void 0)return n[N];We("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+N+"'")}let be;Q&&(be=e.get("EXT_texture_norm16"),be||We("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let oe=S;if(S===n.RED&&(Z===n.FLOAT&&(oe=n.R32F),Z===n.HALF_FLOAT&&(oe=n.R16F),Z===n.UNSIGNED_BYTE&&(oe=n.R8),Z===n.UNSIGNED_SHORT&&be&&(oe=be.R16_EXT),Z===n.SHORT&&be&&(oe=be.R16_SNORM_EXT)),S===n.RED_INTEGER&&(Z===n.UNSIGNED_BYTE&&(oe=n.R8UI),Z===n.UNSIGNED_SHORT&&(oe=n.R16UI),Z===n.UNSIGNED_INT&&(oe=n.R32UI),Z===n.BYTE&&(oe=n.R8I),Z===n.SHORT&&(oe=n.R16I),Z===n.INT&&(oe=n.R32I)),S===n.RG&&(Z===n.FLOAT&&(oe=n.RG32F),Z===n.HALF_FLOAT&&(oe=n.RG16F),Z===n.UNSIGNED_BYTE&&(oe=n.RG8),Z===n.UNSIGNED_SHORT&&be&&(oe=be.RG16_EXT),Z===n.SHORT&&be&&(oe=be.RG16_SNORM_EXT)),S===n.RG_INTEGER&&(Z===n.UNSIGNED_BYTE&&(oe=n.RG8UI),Z===n.UNSIGNED_SHORT&&(oe=n.RG16UI),Z===n.UNSIGNED_INT&&(oe=n.RG32UI),Z===n.BYTE&&(oe=n.RG8I),Z===n.SHORT&&(oe=n.RG16I),Z===n.INT&&(oe=n.RG32I)),S===n.RGB_INTEGER&&(Z===n.UNSIGNED_BYTE&&(oe=n.RGB8UI),Z===n.UNSIGNED_SHORT&&(oe=n.RGB16UI),Z===n.UNSIGNED_INT&&(oe=n.RGB32UI),Z===n.BYTE&&(oe=n.RGB8I),Z===n.SHORT&&(oe=n.RGB16I),Z===n.INT&&(oe=n.RGB32I)),S===n.RGBA_INTEGER&&(Z===n.UNSIGNED_BYTE&&(oe=n.RGBA8UI),Z===n.UNSIGNED_SHORT&&(oe=n.RGBA16UI),Z===n.UNSIGNED_INT&&(oe=n.RGBA32UI),Z===n.BYTE&&(oe=n.RGBA8I),Z===n.SHORT&&(oe=n.RGBA16I),Z===n.INT&&(oe=n.RGBA32I)),S===n.RGB&&(Z===n.UNSIGNED_SHORT&&be&&(oe=be.RGB16_EXT),Z===n.SHORT&&be&&(oe=be.RGB16_SNORM_EXT),Z===n.UNSIGNED_INT_5_9_9_9_REV&&(oe=n.RGB9_E5),Z===n.UNSIGNED_INT_10F_11F_11F_REV&&(oe=n.R11F_G11F_B10F)),S===n.RGBA){let ce=ge?Jo:Qe.getTransfer(se);Z===n.FLOAT&&(oe=n.RGBA32F),Z===n.HALF_FLOAT&&(oe=n.RGBA16F),Z===n.UNSIGNED_BYTE&&(oe=ce===pt?n.SRGB8_ALPHA8:n.RGBA8),Z===n.UNSIGNED_SHORT&&be&&(oe=be.RGBA16_EXT),Z===n.SHORT&&be&&(oe=be.RGBA16_SNORM_EXT),Z===n.UNSIGNED_SHORT_4_4_4_4&&(oe=n.RGBA4),Z===n.UNSIGNED_SHORT_5_5_5_1&&(oe=n.RGB5_A1)}return(oe===n.R16F||oe===n.R32F||oe===n.RG16F||oe===n.RG32F||oe===n.RGBA16F||oe===n.RGBA32F)&&e.get("EXT_color_buffer_float"),oe}function M(N,S){let Z;return N?S===null||S===Qn||S===ro?Z=n.DEPTH24_STENCIL8:S===zn?Z=n.DEPTH32F_STENCIL8:S===so&&(Z=n.DEPTH24_STENCIL8,We("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Qn||S===ro?Z=n.DEPTH_COMPONENT24:S===zn?Z=n.DEPTH_COMPONENT32F:S===so&&(Z=n.DEPTH_COMPONENT16),Z}function v(N,S){return p(N)===!0||N.isFramebufferTexture&&N.minFilter!==Ut&&N.minFilter!==Ft?Math.log2(Math.max(S.width,S.height))+1:N.mipmaps!==void 0&&N.mipmaps.length>0?N.mipmaps.length:N.isCompressedTexture&&Array.isArray(N.image)?S.mipmaps.length:1}function A(N){let S=N.target;S.removeEventListener("dispose",A),w(S),S.isVideoTexture&&h.delete(S),S.isHTMLTexture&&u.delete(S)}function y(N){let S=N.target;S.removeEventListener("dispose",y),T(S)}function w(N){let S=i.get(N);if(S.__webglInit===void 0)return;let Z=N.source,Q=f.get(Z);if(Q){let se=Q[S.__cacheKey];se.usedTimes--,se.usedTimes===0&&L(N),Object.keys(Q).length===0&&f.delete(Z)}i.remove(N)}function L(N){let S=i.get(N);n.deleteTexture(S.__webglTexture);let Z=N.source,Q=f.get(Z);delete Q[S.__cacheKey],o.memory.textures--}function T(N){let S=i.get(N);if(N.depthTexture&&(N.depthTexture.dispose(),i.remove(N.depthTexture)),N.isWebGLCubeRenderTarget)for(let Q=0;Q<6;Q++){if(Array.isArray(S.__webglFramebuffer[Q]))for(let se=0;se<S.__webglFramebuffer[Q].length;se++)n.deleteFramebuffer(S.__webglFramebuffer[Q][se]);else n.deleteFramebuffer(S.__webglFramebuffer[Q]);S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer[Q])}else{if(Array.isArray(S.__webglFramebuffer))for(let Q=0;Q<S.__webglFramebuffer.length;Q++)n.deleteFramebuffer(S.__webglFramebuffer[Q]);else n.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&n.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let Q=0;Q<S.__webglColorRenderbuffer.length;Q++)S.__webglColorRenderbuffer[Q]&&n.deleteRenderbuffer(S.__webglColorRenderbuffer[Q]);S.__webglDepthRenderbuffer&&n.deleteRenderbuffer(S.__webglDepthRenderbuffer)}let Z=N.textures;for(let Q=0,se=Z.length;Q<se;Q++){let ge=i.get(Z[Q]);ge.__webglTexture&&(n.deleteTexture(ge.__webglTexture),o.memory.textures--),i.remove(Z[Q])}i.remove(N)}let C=0;function R(){C=0}function P(){return C}function D(N){C=N}function k(){let N=C;return N>=s.maxTextures&&We("WebGLTextures: Trying to use "+(N+1)+" texture units while this GPU supports only "+s.maxTextures),C+=1,N}function V(N){let S=[];return S.push(N.wrapS),S.push(N.wrapT),S.push(N.wrapR||0),S.push(N.magFilter),S.push(N.minFilter),S.push(N.anisotropy),S.push(N.internalFormat),S.push(N.format),S.push(N.type),S.push(N.generateMipmaps),S.push(N.premultiplyAlpha),S.push(N.flipY),S.push(N.unpackAlignment),S.push(N.colorSpace),S.join()}function j(N,S){let Z=i.get(N);if(N.isVideoTexture&&W(N),N.isRenderTargetTexture===!1&&N.isExternalTexture!==!0&&N.version>0&&Z.__version!==N.version){let Q=N.image;if(Q===null)We("WebGLRenderer: Texture marked for update but no image data found.");else if(Q.complete===!1)We("WebGLRenderer: Texture marked for update but image is incomplete");else{re(Z,N,S);return}}else N.isExternalTexture&&(Z.__webglTexture=N.sourceTexture?N.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,Z.__webglTexture,n.TEXTURE0+S)}function q(N,S){let Z=i.get(N);if(N.isRenderTargetTexture===!1&&N.version>0&&Z.__version!==N.version){re(Z,N,S);return}else N.isExternalTexture&&(Z.__webglTexture=N.sourceTexture?N.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,Z.__webglTexture,n.TEXTURE0+S)}function z(N,S){let Z=i.get(N);if(N.isRenderTargetTexture===!1&&N.version>0&&Z.__version!==N.version){re(Z,N,S);return}t.bindTexture(n.TEXTURE_3D,Z.__webglTexture,n.TEXTURE0+S)}function H(N,S){let Z=i.get(N);if(N.isCubeDepthTexture!==!0&&N.version>0&&Z.__version!==N.version){ne(Z,N,S);return}t.bindTexture(n.TEXTURE_CUBE_MAP,Z.__webglTexture,n.TEXTURE0+S)}let F={[kr]:n.REPEAT,[Fn]:n.CLAMP_TO_EDGE,[zr]:n.MIRRORED_REPEAT},X={[Ut]:n.NEAREST,[gc]:n.NEAREST_MIPMAP_NEAREST,[Ws]:n.NEAREST_MIPMAP_LINEAR,[Ft]:n.LINEAR,[io]:n.LINEAR_MIPMAP_NEAREST,[xi]:n.LINEAR_MIPMAP_LINEAR},le={[Gm]:n.NEVER,[qm]:n.ALWAYS,[Wm]:n.LESS,[th]:n.LEQUAL,[Xm]:n.EQUAL,[nh]:n.GEQUAL,[Ym]:n.GREATER,[$m]:n.NOTEQUAL};function de(N,S){if(S.type===zn&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===Ft||S.magFilter===io||S.magFilter===Ws||S.magFilter===xi||S.minFilter===Ft||S.minFilter===io||S.minFilter===Ws||S.minFilter===xi)&&We("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(N,n.TEXTURE_WRAP_S,F[S.wrapS]),n.texParameteri(N,n.TEXTURE_WRAP_T,F[S.wrapT]),(N===n.TEXTURE_3D||N===n.TEXTURE_2D_ARRAY)&&n.texParameteri(N,n.TEXTURE_WRAP_R,F[S.wrapR]),n.texParameteri(N,n.TEXTURE_MAG_FILTER,X[S.magFilter]),n.texParameteri(N,n.TEXTURE_MIN_FILTER,X[S.minFilter]),S.compareFunction&&(n.texParameteri(N,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(N,n.TEXTURE_COMPARE_FUNC,le[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Ut||S.minFilter!==Ws&&S.minFilter!==xi||S.type===zn&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){let Z=e.get("EXT_texture_filter_anisotropic");n.texParameterf(N,Z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function ye(N,S){let Z=!1;N.__webglInit===void 0&&(N.__webglInit=!0,S.addEventListener("dispose",A));let Q=S.source,se=f.get(Q);se===void 0&&(se={},f.set(Q,se));let ge=V(S);if(ge!==N.__cacheKey){se[ge]===void 0&&(se[ge]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,Z=!0),se[ge].usedTimes++;let be=se[N.__cacheKey];be!==void 0&&(se[N.__cacheKey].usedTimes--,be.usedTimes===0&&L(S)),N.__cacheKey=ge,N.__webglTexture=se[ge].texture}return Z}function B(N,S,Z){return Math.floor(Math.floor(N/Z)/S)}function G(N,S,Z,Q){let ge=N.updateRanges;if(ge.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,S.width,S.height,Z,Q,S.data);else{ge.sort((ke,Ae)=>ke.start-Ae.start);let be=0;for(let ke=1;ke<ge.length;ke++){let Ae=ge[be],Me=ge[ke],ze=Ae.start+Ae.count,Xe=B(Me.start,S.width,4),Ke=B(Ae.start,S.width,4);Me.start<=ze+1&&Xe===Ke&&B(Me.start+Me.count-1,S.width,4)===Xe?Ae.count=Math.max(Ae.count,Me.start+Me.count-Ae.start):(++be,ge[be]=Me)}ge.length=be+1;let oe=t.getParameter(n.UNPACK_ROW_LENGTH),ce=t.getParameter(n.UNPACK_SKIP_PIXELS),ve=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,S.width);for(let ke=0,Ae=ge.length;ke<Ae;ke++){let Me=ge[ke],ze=Math.floor(Me.start/4),Xe=Math.ceil(Me.count/4),Ke=ze%S.width,$=Math.floor(ze/S.width),Se=Xe,ae=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,Ke),t.pixelStorei(n.UNPACK_SKIP_ROWS,$),t.texSubImage2D(n.TEXTURE_2D,0,Ke,$,Se,ae,Z,Q,S.data)}N.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,oe),t.pixelStorei(n.UNPACK_SKIP_PIXELS,ce),t.pixelStorei(n.UNPACK_SKIP_ROWS,ve)}}function re(N,S,Z){let Q=n.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(Q=n.TEXTURE_2D_ARRAY),S.isData3DTexture&&(Q=n.TEXTURE_3D);let se=ye(N,S),ge=S.source;t.bindTexture(Q,N.__webglTexture,n.TEXTURE0+Z);let be=i.get(ge);if(ge.version!==be.__version||se===!0){if(t.activeTexture(n.TEXTURE0+Z),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){let ae=Qe.getPrimaries(Qe.workingColorSpace),Ee=S.colorSpace===ti?null:Qe.getPrimaries(S.colorSpace),Re=S.colorSpace===ti||ae===Ee?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Re)}t.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment);let ce=g(S.image,!1,s.maxTextureSize);ce=Qt(S,ce);let ve=r.convert(S.format,S.colorSpace),ke=r.convert(S.type),Ae=b(S.internalFormat,ve,ke,S.normalized,S.colorSpace,S.isVideoTexture);de(Q,S);let Me,ze=S.mipmaps,Xe=S.isVideoTexture!==!0,Ke=be.__version===void 0||se===!0,$=ge.dataReady,Se=v(S,ce);if(S.isDepthTexture)Ae=M(S.format===ds,S.type),Ke&&(Xe?t.texStorage2D(n.TEXTURE_2D,1,Ae,ce.width,ce.height):t.texImage2D(n.TEXTURE_2D,0,Ae,ce.width,ce.height,0,ve,ke,null));else if(S.isDataTexture)if(ze.length>0){Xe&&Ke&&t.texStorage2D(n.TEXTURE_2D,Se,Ae,ze[0].width,ze[0].height);for(let ae=0,Ee=ze.length;ae<Ee;ae++)Me=ze[ae],Xe?$&&t.texSubImage2D(n.TEXTURE_2D,ae,0,0,Me.width,Me.height,ve,ke,Me.data):t.texImage2D(n.TEXTURE_2D,ae,Ae,Me.width,Me.height,0,ve,ke,Me.data);S.generateMipmaps=!1}else Xe?(Ke&&t.texStorage2D(n.TEXTURE_2D,Se,Ae,ce.width,ce.height),$&&G(S,ce,ve,ke)):t.texImage2D(n.TEXTURE_2D,0,Ae,ce.width,ce.height,0,ve,ke,ce.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Xe&&Ke&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Se,Ae,ze[0].width,ze[0].height,ce.depth);for(let ae=0,Ee=ze.length;ae<Ee;ae++)if(Me=ze[ae],S.format!==bn)if(ve!==null)if(Xe){if($)if(S.layerUpdates.size>0){let Re=Td(Me.width,Me.height,S.format,S.type);for(let ue of S.layerUpdates){let He=Me.data.subarray(ue*Re/Me.data.BYTES_PER_ELEMENT,(ue+1)*Re/Me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ae,0,0,ue,Me.width,Me.height,1,ve,He)}}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ae,0,0,0,Me.width,Me.height,ce.depth,ve,Me.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ae,Ae,Me.width,Me.height,ce.depth,0,Me.data,0,0);else We("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Xe?$&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ae,0,0,0,Me.width,Me.height,ce.depth,ve,ke,Me.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ae,Ae,Me.width,Me.height,ce.depth,0,ve,ke,Me.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{Xe&&Ke&&t.texStorage2D(n.TEXTURE_2D,Se,Ae,ze[0].width,ze[0].height);for(let ae=0,Ee=ze.length;ae<Ee;ae++)Me=ze[ae],S.format!==bn?ve!==null?Xe?$&&t.compressedTexSubImage2D(n.TEXTURE_2D,ae,0,0,Me.width,Me.height,ve,Me.data):t.compressedTexImage2D(n.TEXTURE_2D,ae,Ae,Me.width,Me.height,0,Me.data):We("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Xe?$&&t.texSubImage2D(n.TEXTURE_2D,ae,0,0,Me.width,Me.height,ve,ke,Me.data):t.texImage2D(n.TEXTURE_2D,ae,Ae,Me.width,Me.height,0,ve,ke,Me.data)}else if(S.isDataArrayTexture)if(Xe){if(Ke&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Se,Ae,ce.width,ce.height,ce.depth),$)if(S.layerUpdates.size>0){let ae=Td(ce.width,ce.height,S.format,S.type);for(let Ee of S.layerUpdates){let Re=ce.data.subarray(Ee*ae/ce.data.BYTES_PER_ELEMENT,(Ee+1)*ae/ce.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,Ee,ce.width,ce.height,1,ve,ke,Re)}S.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ce.width,ce.height,ce.depth,ve,ke,ce.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Ae,ce.width,ce.height,ce.depth,0,ve,ke,ce.data);else if(S.isData3DTexture)Xe?(Ke&&t.texStorage3D(n.TEXTURE_3D,Se,Ae,ce.width,ce.height,ce.depth),$&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ce.width,ce.height,ce.depth,ve,ke,ce.data)):t.texImage3D(n.TEXTURE_3D,0,Ae,ce.width,ce.height,ce.depth,0,ve,ke,ce.data);else if(S.isFramebufferTexture){if(Ke)if(Xe)t.texStorage2D(n.TEXTURE_2D,Se,Ae,ce.width,ce.height);else{let ae=ce.width,Ee=ce.height;for(let Re=0;Re<Se;Re++)t.texImage2D(n.TEXTURE_2D,Re,Ae,ae,Ee,0,ve,ke,null),ae>>=1,Ee>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in n){let ae=n.canvas;if(ae.hasAttribute("layoutsubtree")||ae.setAttribute("layoutsubtree","true"),ce.parentNode!==ae){ae.appendChild(ce),u.add(S),ae.onpaint=Ee=>{let Re=Ee.changedElements;for(let ue of u)Re.includes(ue.image)&&(ue.needsUpdate=!0)},ae.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,ce);else{let Re=n.RGBA,ue=n.RGBA,He=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,Re,ue,He,ce)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(ze.length>0){if(Xe&&Ke){let ae=_t(ze[0]);t.texStorage2D(n.TEXTURE_2D,Se,Ae,ae.width,ae.height)}for(let ae=0,Ee=ze.length;ae<Ee;ae++)Me=ze[ae],Xe?$&&t.texSubImage2D(n.TEXTURE_2D,ae,0,0,ve,ke,Me):t.texImage2D(n.TEXTURE_2D,ae,Ae,ve,ke,Me);S.generateMipmaps=!1}else if(Xe){if(Ke){let ae=_t(ce);t.texStorage2D(n.TEXTURE_2D,Se,Ae,ae.width,ae.height)}$&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ve,ke,ce)}else t.texImage2D(n.TEXTURE_2D,0,Ae,ve,ke,ce);p(S)&&x(Q),be.__version=ge.version,S.onUpdate&&S.onUpdate(S)}N.__version=S.version}function ne(N,S,Z){if(S.image.length!==6)return;let Q=ye(N,S),se=S.source;t.bindTexture(n.TEXTURE_CUBE_MAP,N.__webglTexture,n.TEXTURE0+Z);let ge=i.get(se);if(se.version!==ge.__version||Q===!0){t.activeTexture(n.TEXTURE0+Z);let be=Qe.getPrimaries(Qe.workingColorSpace),oe=S.colorSpace===ti?null:Qe.getPrimaries(S.colorSpace),ce=S.colorSpace===ti||be===oe?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ce);let ve=S.isCompressedTexture||S.image[0].isCompressedTexture,ke=S.image[0]&&S.image[0].isDataTexture,Ae=[];for(let ue=0;ue<6;ue++)!ve&&!ke?Ae[ue]=g(S.image[ue],!0,s.maxCubemapSize):Ae[ue]=ke?S.image[ue].image:S.image[ue],Ae[ue]=Qt(S,Ae[ue]);let Me=Ae[0],ze=r.convert(S.format,S.colorSpace),Xe=r.convert(S.type),Ke=b(S.internalFormat,ze,Xe,S.normalized,S.colorSpace),$=S.isVideoTexture!==!0,Se=ge.__version===void 0||Q===!0,ae=se.dataReady,Ee=v(S,Me);de(n.TEXTURE_CUBE_MAP,S);let Re;if(ve){$&&Se&&t.texStorage2D(n.TEXTURE_CUBE_MAP,Ee,Ke,Me.width,Me.height);for(let ue=0;ue<6;ue++){Re=Ae[ue].mipmaps;for(let He=0;He<Re.length;He++){let Oe=Re[He];S.format!==bn?ze!==null?$?ae&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He,0,0,Oe.width,Oe.height,ze,Oe.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He,Ke,Oe.width,Oe.height,0,Oe.data):We("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):$?ae&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He,0,0,Oe.width,Oe.height,ze,Xe,Oe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He,Ke,Oe.width,Oe.height,0,ze,Xe,Oe.data)}}}else{if(Re=S.mipmaps,$&&Se){Re.length>0&&Ee++;let ue=_t(Ae[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,Ee,Ke,ue.width,ue.height)}for(let ue=0;ue<6;ue++)if(ke){$?ae&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,0,0,Ae[ue].width,Ae[ue].height,ze,Xe,Ae[ue].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,Ke,Ae[ue].width,Ae[ue].height,0,ze,Xe,Ae[ue].data);for(let He=0;He<Re.length;He++){let St=Re[He].image[ue].image;$?ae&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He+1,0,0,St.width,St.height,ze,Xe,St.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He+1,Ke,St.width,St.height,0,ze,Xe,St.data)}}else{$?ae&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,0,0,ze,Xe,Ae[ue]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,Ke,ze,Xe,Ae[ue]);for(let He=0;He<Re.length;He++){let Oe=Re[He];$?ae&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He+1,0,0,ze,Xe,Oe.image[ue]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He+1,Ke,ze,Xe,Oe.image[ue])}}}p(S)&&x(n.TEXTURE_CUBE_MAP),ge.__version=se.version,S.onUpdate&&S.onUpdate(S)}N.__version=S.version}function ee(N,S,Z,Q,se,ge){let be=r.convert(Z.format,Z.colorSpace),oe=r.convert(Z.type),ce=b(Z.internalFormat,be,oe,Z.normalized,Z.colorSpace),ve=i.get(S),ke=i.get(Z);if(ke.__renderTarget=S,!ve.__hasExternalTextures){let Ae=Math.max(1,S.width>>ge),Me=Math.max(1,S.height>>ge);se===n.TEXTURE_3D||se===n.TEXTURE_2D_ARRAY?t.texImage3D(se,ge,ce,Ae,Me,S.depth,0,be,oe,null):t.texImage2D(se,ge,ce,Ae,Me,0,be,oe,null)}t.bindFramebuffer(n.FRAMEBUFFER,N),ot(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Q,se,ke.__webglTexture,0,gt(S)):(se===n.TEXTURE_2D||se>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&se<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,Q,se,ke.__webglTexture,ge),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ie(N,S,Z){if(n.bindRenderbuffer(n.RENDERBUFFER,N),S.depthBuffer){let Q=S.depthTexture,se=Q&&Q.isDepthTexture?Q.type:null,ge=M(S.stencilBuffer,se),be=S.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;ot(S)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,gt(S),ge,S.width,S.height):Z?n.renderbufferStorageMultisample(n.RENDERBUFFER,gt(S),ge,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,ge,S.width,S.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,be,n.RENDERBUFFER,N)}else{let Q=S.textures;for(let se=0;se<Q.length;se++){let ge=Q[se],be=r.convert(ge.format,ge.colorSpace),oe=r.convert(ge.type),ce=b(ge.internalFormat,be,oe,ge.normalized,ge.colorSpace);ot(S)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,gt(S),ce,S.width,S.height):Z?n.renderbufferStorageMultisample(n.RENDERBUFFER,gt(S),ce,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,ce,S.width,S.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function he(N,S,Z){let Q=S.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,N),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let se=i.get(S.depthTexture);if(se.__renderTarget=S,(!se.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),Q){if(se.__webglInit===void 0&&(se.__webglInit=!0,S.depthTexture.addEventListener("dispose",A)),se.__webglTexture===void 0){se.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,se.__webglTexture),de(n.TEXTURE_CUBE_MAP,S.depthTexture);let ve=r.convert(S.depthTexture.format),ke=r.convert(S.depthTexture.type),Ae;S.depthTexture.format===fi?Ae=n.DEPTH_COMPONENT24:S.depthTexture.format===ds&&(Ae=n.DEPTH24_STENCIL8);for(let Me=0;Me<6;Me++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Me,0,Ae,S.width,S.height,0,ve,ke,null)}}else j(S.depthTexture,0);let ge=se.__webglTexture,be=gt(S),oe=Q?n.TEXTURE_CUBE_MAP_POSITIVE_X+Z:n.TEXTURE_2D,ce=S.depthTexture.format===ds?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(S.depthTexture.format===fi)ot(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ce,oe,ge,0,be):n.framebufferTexture2D(n.FRAMEBUFFER,ce,oe,ge,0);else if(S.depthTexture.format===ds)ot(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ce,oe,ge,0,be):n.framebufferTexture2D(n.FRAMEBUFFER,ce,oe,ge,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function _e(N){let S=i.get(N),Z=N.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==N.depthTexture){let Q=N.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),Q){let se=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,Q.removeEventListener("dispose",se)};Q.addEventListener("dispose",se),S.__depthDisposeCallback=se}S.__boundDepthTexture=Q}if(N.depthTexture&&!S.__autoAllocateDepthBuffer)if(Z)for(let Q=0;Q<6;Q++)he(S.__webglFramebuffer[Q],N,Q);else{let Q=N.texture.mipmaps;Q&&Q.length>0?he(S.__webglFramebuffer[0],N,0):he(S.__webglFramebuffer,N,0)}else if(Z){S.__webglDepthbuffer=[];for(let Q=0;Q<6;Q++)if(t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[Q]),S.__webglDepthbuffer[Q]===void 0)S.__webglDepthbuffer[Q]=n.createRenderbuffer(),ie(S.__webglDepthbuffer[Q],N,!1);else{let se=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ge=S.__webglDepthbuffer[Q];n.bindRenderbuffer(n.RENDERBUFFER,ge),n.framebufferRenderbuffer(n.FRAMEBUFFER,se,n.RENDERBUFFER,ge)}}else{let Q=N.texture.mipmaps;if(Q&&Q.length>0?t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=n.createRenderbuffer(),ie(S.__webglDepthbuffer,N,!1);else{let se=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ge=S.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ge),n.framebufferRenderbuffer(n.FRAMEBUFFER,se,n.RENDERBUFFER,ge)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function me(N,S,Z){let Q=i.get(N);S!==void 0&&ee(Q.__webglFramebuffer,N,N.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),Z!==void 0&&_e(N)}function Ve(N){let S=N.texture,Z=i.get(N),Q=i.get(S);N.addEventListener("dispose",y);let se=N.textures,ge=N.isWebGLCubeRenderTarget===!0,be=se.length>1;if(be||(Q.__webglTexture===void 0&&(Q.__webglTexture=n.createTexture()),Q.__version=S.version,o.memory.textures++),ge){Z.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(S.mipmaps&&S.mipmaps.length>0){Z.__webglFramebuffer[oe]=[];for(let ce=0;ce<S.mipmaps.length;ce++)Z.__webglFramebuffer[oe][ce]=n.createFramebuffer()}else Z.__webglFramebuffer[oe]=n.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){Z.__webglFramebuffer=[];for(let oe=0;oe<S.mipmaps.length;oe++)Z.__webglFramebuffer[oe]=n.createFramebuffer()}else Z.__webglFramebuffer=n.createFramebuffer();if(be)for(let oe=0,ce=se.length;oe<ce;oe++){let ve=i.get(se[oe]);ve.__webglTexture===void 0&&(ve.__webglTexture=n.createTexture(),o.memory.textures++)}if(N.samples>0&&ot(N)===!1){Z.__webglMultisampledFramebuffer=n.createFramebuffer(),Z.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,Z.__webglMultisampledFramebuffer);for(let oe=0;oe<se.length;oe++){let ce=se[oe];Z.__webglColorRenderbuffer[oe]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,Z.__webglColorRenderbuffer[oe]);let ve=r.convert(ce.format,ce.colorSpace),ke=r.convert(ce.type),Ae=b(ce.internalFormat,ve,ke,ce.normalized,ce.colorSpace,N.isXRRenderTarget===!0),Me=gt(N);n.renderbufferStorageMultisample(n.RENDERBUFFER,Me,Ae,N.width,N.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+oe,n.RENDERBUFFER,Z.__webglColorRenderbuffer[oe])}n.bindRenderbuffer(n.RENDERBUFFER,null),N.depthBuffer&&(Z.__webglDepthRenderbuffer=n.createRenderbuffer(),ie(Z.__webglDepthRenderbuffer,N,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ge){t.bindTexture(n.TEXTURE_CUBE_MAP,Q.__webglTexture),de(n.TEXTURE_CUBE_MAP,S);for(let oe=0;oe<6;oe++)if(S.mipmaps&&S.mipmaps.length>0)for(let ce=0;ce<S.mipmaps.length;ce++)ee(Z.__webglFramebuffer[oe][ce],N,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ce);else ee(Z.__webglFramebuffer[oe],N,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);p(S)&&x(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(be){for(let oe=0,ce=se.length;oe<ce;oe++){let ve=se[oe],ke=i.get(ve),Ae=n.TEXTURE_2D;(N.isWebGL3DRenderTarget||N.isWebGLArrayRenderTarget)&&(Ae=N.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Ae,ke.__webglTexture),de(Ae,ve),ee(Z.__webglFramebuffer,N,ve,n.COLOR_ATTACHMENT0+oe,Ae,0),p(ve)&&x(Ae)}t.unbindTexture()}else{let oe=n.TEXTURE_2D;if((N.isWebGL3DRenderTarget||N.isWebGLArrayRenderTarget)&&(oe=N.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(oe,Q.__webglTexture),de(oe,S),S.mipmaps&&S.mipmaps.length>0)for(let ce=0;ce<S.mipmaps.length;ce++)ee(Z.__webglFramebuffer[ce],N,S,n.COLOR_ATTACHMENT0,oe,ce);else ee(Z.__webglFramebuffer,N,S,n.COLOR_ATTACHMENT0,oe,0);p(S)&&x(oe),t.unbindTexture()}N.depthBuffer&&_e(N)}function Le(N){let S=N.textures;for(let Z=0,Q=S.length;Z<Q;Z++){let se=S[Z];if(p(se)){let ge=E(N),be=i.get(se).__webglTexture;t.bindTexture(ge,be),x(ge),t.unbindTexture()}}}let qe=[],Be=[];function rt(N){if(N.samples>0){if(ot(N)===!1){let S=N.textures,Z=N.width,Q=N.height,se=n.COLOR_BUFFER_BIT,ge=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,be=i.get(N),oe=S.length>1;if(oe)for(let ve=0;ve<S.length;ve++)t.bindFramebuffer(n.FRAMEBUFFER,be.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,be.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer);let ce=N.texture.mipmaps;ce&&ce.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,be.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let ve=0;ve<S.length;ve++){if(N.resolveDepthBuffer&&(N.depthBuffer&&(se|=n.DEPTH_BUFFER_BIT),N.stencilBuffer&&N.resolveStencilBuffer&&(se|=n.STENCIL_BUFFER_BIT)),oe){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,be.__webglColorRenderbuffer[ve]);let ke=i.get(S[ve]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,ke,0)}n.blitFramebuffer(0,0,Z,Q,0,0,Z,Q,se,n.NEAREST),l===!0&&(qe.length=0,Be.length=0,qe.push(n.COLOR_ATTACHMENT0+ve),N.depthBuffer&&N.storeMultisampledDepthBuffer===!1&&(qe.push(ge),Be.push(ge),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Be)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,qe))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),oe)for(let ve=0;ve<S.length;ve++){t.bindFramebuffer(n.FRAMEBUFFER,be.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.RENDERBUFFER,be.__webglColorRenderbuffer[ve]);let ke=i.get(S[ve]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,be.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.TEXTURE_2D,ke,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}else if(N.depthBuffer&&N.storeMultisampledDepthBuffer===!1&&l){let S=N.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[S])}}}function gt(N){return Math.min(s.maxSamples,N.samples)}function ot(N){let S=i.get(N);return N.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function W(N){let S=o.render.frame;h.get(N)!==S&&(h.set(N,S),N.update())}function Qt(N,S){let Z=N.colorSpace,Q=N.format,se=N.type;return N.isCompressedTexture===!0||N.isVideoTexture===!0||Z!==Ko&&Z!==ti&&(Qe.getTransfer(Z)===pt?(Q!==bn||se!==yn)&&We("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ye("WebGLTextures: Unsupported texture color space:",Z)),S}function _t(N){return typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement?(c.width=N.naturalWidth||N.width,c.height=N.naturalHeight||N.height):typeof VideoFrame<"u"&&N instanceof VideoFrame?(c.width=N.displayWidth,c.height=N.displayHeight):(c.width=N.width,c.height=N.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=R,this.getTextureUnits=P,this.setTextureUnits=D,this.setTexture2D=j,this.setTexture2DArray=q,this.setTexture3D=z,this.setTextureCube=H,this.rebindTextures=me,this.setupRenderTarget=Ve,this.updateRenderTargetMipmap=Le,this.updateMultisampleRenderTarget=rt,this.setupDepthRenderbuffer=_e,this.setupFrameBufferTexture=ee,this.useMultisampledRTT=ot,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function XM(n,e){function t(i,s=ti){let r,o=Qe.getTransfer(s);if(i===yn)return n.UNSIGNED_BYTE;if(i===xc)return n.UNSIGNED_SHORT_4_4_4_4;if(i===yc)return n.UNSIGNED_SHORT_5_5_5_1;if(i===pd)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===md)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===dd)return n.BYTE;if(i===fd)return n.SHORT;if(i===so)return n.UNSIGNED_SHORT;if(i===_c)return n.INT;if(i===Qn)return n.UNSIGNED_INT;if(i===zn)return n.FLOAT;if(i===ei)return n.HALF_FLOAT;if(i===gd)return n.ALPHA;if(i===_d)return n.RGB;if(i===bn)return n.RGBA;if(i===fi)return n.DEPTH_COMPONENT;if(i===ds)return n.DEPTH_STENCIL;if(i===bc)return n.RED;if(i===vc)return n.RED_INTEGER;if(i===fs)return n.RG;if(i===Mc)return n.RG_INTEGER;if(i===Sc)return n.RGBA_INTEGER;if(i===Sa||i===Ea||i===Aa||i===wa)if(o===pt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Sa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ea)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===wa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Sa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ea)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Aa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===wa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ec||i===Ac||i===wc||i===Tc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Ec)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ac)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===wc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Tc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Rc||i===Cc||i===Ic||i===Pc||i===Lc||i===Ta||i===Dc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Rc||i===Cc)return o===pt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Ic)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Pc)return r.COMPRESSED_R11_EAC;if(i===Lc)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Ta)return r.COMPRESSED_RG11_EAC;if(i===Dc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Nc||i===Oc||i===Uc||i===Fc||i===Bc||i===kc||i===zc||i===Hc||i===Vc||i===Gc||i===Wc||i===Xc||i===Yc||i===$c)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Nc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Oc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Uc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Fc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Bc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===kc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===zc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Hc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Vc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Gc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Wc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Xc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Yc)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===$c)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===qc||i===jc||i===Zc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===qc)return o===pt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===jc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Zc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Kc||i===Jc||i===Ra||i===Qc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Kc)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Jc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Ra)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Qc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ro?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var YM=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,$M=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Yd=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new ca(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new pn({vertexShader:YM,fragmentShader:$M,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new at(new ks(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},$d=class extends jn{constructor(e,t){super();let i=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,m=null,_=typeof XRWebGLBinding<"u",g=new Yd,p={},x=t.getContextAttributes(),E=null,b=null,M=[],v=[],A=new Ie,y=null,w=null,L=new Xt;L.viewport=new ht;let T=new Xt;T.viewport=new ht;let C=[L,T],R=new uc,P=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(B){let G=M[B];return G===void 0&&(G=new $r,M[B]=G),G.getTargetRaySpace()},this.getControllerGrip=function(B){let G=M[B];return G===void 0&&(G=new $r,M[B]=G),G.getGripSpace()},this.getHand=function(B){let G=M[B];return G===void 0&&(G=new $r,M[B]=G),G.getHandSpace()};function k(B){let G=v.indexOf(B.inputSource);if(G===-1)return;let re=M[G];re!==void 0&&(re.update(B.inputSource,B.frame,c||o),re.dispatchEvent({type:B.type,data:B.inputSource}))}function V(){s.removeEventListener("select",k),s.removeEventListener("selectstart",k),s.removeEventListener("selectend",k),s.removeEventListener("squeeze",k),s.removeEventListener("squeezestart",k),s.removeEventListener("squeezeend",k),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",j);for(let B=0;B<M.length;B++){let G=v[B];G!==null&&(v[B]=null,M[B].disconnect(G))}P=null,D=null,g.reset();for(let B in p)delete p[B];if(e.setRenderTarget(E),f=null,d=null,u=null,s=null,b=null,ye.stop(),i.isPresenting=!1,e.setPixelRatio(y),e.setSize(A.width,A.height,!1),w!==null){let B=w.camera;B.fov=w.fov,B.zoom=w.zoom,B.updateProjectionMatrix(),w=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(B){r=B,i.isPresenting===!0&&We("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(B){a=B,i.isPresenting===!0&&We("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(B){c=B},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(B){if(s=B,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",k),s.addEventListener("selectstart",k),s.addEventListener("selectend",k),s.addEventListener("squeeze",k),s.addEventListener("squeezestart",k),s.addEventListener("squeezeend",k),s.addEventListener("end",V),s.addEventListener("inputsourceschange",j),x.xrCompatible!==!0&&await t.makeXRCompatible(),y=e.getPixelRatio(),e.getSize(A),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let re=null,ne=null,ee=null;x.depth&&(ee=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,re=x.stencil?ds:fi,ne=x.stencil?ro:Qn);let ie={colorFormat:t.RGBA8,depthFormat:ee,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(ie),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),b=new xn(d.textureWidth,d.textureHeight,{format:bn,type:yn,depthTexture:new is(d.textureWidth,d.textureHeight,ne,void 0,void 0,void 0,void 0,void 0,void 0,re),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let re={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,re),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),b=new xn(f.framebufferWidth,f.framebufferHeight,{format:bn,type:yn,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),ye.setContext(s),ye.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function j(B){for(let G=0;G<B.removed.length;G++){let re=B.removed[G],ne=v.indexOf(re);ne>=0&&(v[ne]=null,M[ne].disconnect(re))}for(let G=0;G<B.added.length;G++){let re=B.added[G],ne=v.indexOf(re);if(ne===-1){for(let ie=0;ie<M.length;ie++)if(ie>=v.length){v.push(re),ne=ie;break}else if(v[ie]===null){v[ie]=re,ne=ie;break}if(ne===-1)break}let ee=M[ne];ee&&ee.connect(re)}}let q=new O,z=new O;function H(B,G,re){q.setFromMatrixPosition(G.matrixWorld),z.setFromMatrixPosition(re.matrixWorld);let ne=q.distanceTo(z),ee=G.projectionMatrix.elements,ie=re.projectionMatrix.elements,he=ee[14]/(ee[10]-1),_e=ee[14]/(ee[10]+1),me=(ee[9]+1)/ee[5],Ve=(ee[9]-1)/ee[5],Le=(ee[8]-1)/ee[0],qe=(ie[8]+1)/ie[0],Be=he*Le,rt=he*qe,gt=ne/(-Le+qe),ot=gt*-Le;if(G.matrixWorld.decompose(B.position,B.quaternion,B.scale),B.translateX(ot),B.translateZ(gt),B.matrixWorld.compose(B.position,B.quaternion,B.scale),B.matrixWorldInverse.copy(B.matrixWorld).invert(),ee[10]===-1)B.projectionMatrix.copy(G.projectionMatrix),B.projectionMatrixInverse.copy(G.projectionMatrixInverse);else{let W=he+gt,Qt=_e+gt,_t=Be-ot,N=rt+(ne-ot),S=me*_e/Qt*W,Z=Ve*_e/Qt*W;B.projectionMatrix.makePerspective(_t,N,S,Z,W,Qt),B.projectionMatrixInverse.copy(B.projectionMatrix).invert()}}function F(B,G){G===null?B.matrixWorld.copy(B.matrix):B.matrixWorld.multiplyMatrices(G.matrixWorld,B.matrix),B.matrixWorldInverse.copy(B.matrixWorld).invert()}this.updateCamera=function(B){if(s===null)return;let G=B.near,re=B.far;g.texture!==null&&(g.depthNear>0&&(G=g.depthNear),g.depthFar>0&&(re=g.depthFar)),R.near=T.near=L.near=G,R.far=T.far=L.far=re,(P!==R.near||D!==R.far)&&(s.updateRenderState({depthNear:R.near,depthFar:R.far}),P=R.near,D=R.far),R.layers.mask=B.layers.mask|6,L.layers.mask=R.layers.mask&-5,T.layers.mask=R.layers.mask&-3;let ne=B.parent,ee=R.cameras;F(R,ne);for(let ie=0;ie<ee.length;ie++)F(ee[ie],ne);ee.length===2?H(R,L,T):R.projectionMatrix.copy(L.projectionMatrix),w===null&&B.isPerspectiveCamera&&(w={camera:B,fov:B.fov,zoom:B.zoom}),X(B,R,ne)};function X(B,G,re){re===null?B.matrix.copy(G.matrixWorld):(B.matrix.copy(re.matrixWorld),B.matrix.invert(),B.matrix.multiply(G.matrixWorld)),B.matrix.decompose(B.position,B.quaternion,B.scale),B.updateMatrixWorld(!0),B.projectionMatrix.copy(G.projectionMatrix),B.projectionMatrixInverse.copy(G.projectionMatrixInverse),B.isPerspectiveCamera&&(B.fov=Wr*2*Math.atan(1/B.projectionMatrix.elements[5]),B.zoom=1)}this.getCamera=function(){return R},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(B){l=B,d!==null&&(d.fixedFoveation=B),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=B)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(R)},this.getCameraTexture=function(B){return p[B]};let le=null;function de(B,G){if(h=G.getViewerPose(c||o),m=G,h!==null){let re=h.views;f!==null&&(e.setRenderTargetFramebuffer(b,f.framebuffer),e.setRenderTarget(b));let ne=!1;re.length!==R.cameras.length&&(R.cameras.length=0,ne=!0);for(let _e=0;_e<re.length;_e++){let me=re[_e],Ve=null;if(f!==null)Ve=f.getViewport(me);else{let qe=u.getViewSubImage(d,me);Ve=qe.viewport,_e===0&&(e.setRenderTargetTextures(b,qe.colorTexture,qe.depthStencilTexture),e.setRenderTarget(b))}let Le=C[_e];Le===void 0&&(Le=new Xt,Le.layers.enable(_e),Le.viewport=new ht,C[_e]=Le),Le.matrix.fromArray(me.transform.matrix),Le.matrix.decompose(Le.position,Le.quaternion,Le.scale),Le.projectionMatrix.fromArray(me.projectionMatrix),Le.projectionMatrixInverse.copy(Le.projectionMatrix).invert(),Le.viewport.set(Ve.x,Ve.y,Ve.width,Ve.height),_e===0&&(R.matrix.copy(Le.matrix),R.matrix.decompose(R.position,R.quaternion,R.scale)),ne===!0&&R.cameras.push(Le)}let ee=s.enabledFeatures;if(ee&&ee.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=i.getBinding();let _e=u.getDepthInformation(re[0]);_e&&_e.isValid&&_e.texture&&g.init(_e,s.renderState)}if(ee&&ee.includes("camera-access")&&_){e.state.unbindTexture(),u=i.getBinding();for(let _e=0;_e<re.length;_e++){let me=re[_e].camera;if(me){let Ve=p[me];Ve||(Ve=new ca,p[me]=Ve);let Le=u.getCameraImage(me);Ve.sourceTexture=Le}}}}for(let re=0;re<M.length;re++){let ne=v[re],ee=M[re];ne!==null&&ee!==void 0&&ee.update(ne,G,c||o)}le&&le(B,G),G.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:G}),m=null}let ye=new E0;ye.setAnimationLoop(de),this.setAnimationLoop=function(B){le=B},this.dispose=function(){}}},qM=new tt,I0=new $e;I0.set(-1,0,0,0,1,0,0,0,1);function jM(n,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function i(g,p){p.color.getRGB(g.fogColor.value,Ed(n)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,x,E,b){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(g,p):p.isMeshLambertMaterial?(r(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(g,p),u(g,p)):p.isMeshPhongMaterial?(r(g,p),h(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(g,p),d(g,p),p.isMeshPhysicalMaterial&&f(g,p,b)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),_(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(o(g,p),p.isLineDashedMaterial&&a(g,p)):p.isPointsMaterial?l(g,p,x,E):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===Bt&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===Bt&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let x=e.get(p),E=x.envMap,b=x.envMapRotation;E&&(g.envMap.value=E,g.envMapRotation.value.setFromMatrix4(qM.makeRotationFromEuler(b)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(I0),g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function o(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function a(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,x,E){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*x,g.scale.value=E*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function u(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function d(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function f(g,p,x){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Bt&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.retroreflectivity>0&&(g.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=x.texture,g.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function _(g,p){let x=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(x.matrixWorld),g.nearDistance.value=x.shadow.camera.near,g.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function ZM(n,e,t,i){let s={},r={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,M){let v=M.program;i.uniformBlockBinding(b,v)}function c(b,M){let v=s[b.id];v===void 0&&(g(b),v=h(b),s[b.id]=v,b.addEventListener("dispose",x));let A=M.program;i.updateUBOMapping(b,A);let y=e.render.frame;r[b.id]!==y&&(d(b),r[b.id]=y)}function h(b){let M=u();b.__bindingPointIndex=M;let v=n.createBuffer(),A=b.__size,y=b.usage;return n.bindBuffer(n.UNIFORM_BUFFER,v),n.bufferData(n.UNIFORM_BUFFER,A,y),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,M,v),v}function u(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return Ye("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(b){let M=s[b.id],v=b.uniforms,A=b.__cache;n.bindBuffer(n.UNIFORM_BUFFER,M);for(let y=0,w=v.length;y<w;y++){let L=v[y];if(Array.isArray(L))for(let T=0,C=L.length;T<C;T++)f(L[T],y,T,A);else f(L,y,0,A)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(b,M,v,A){if(_(b,M,v,A)===!0){let y=b.__offset,w=b.value;if(Array.isArray(w)){let L=0;for(let T=0;T<w.length;T++){let C=w[T],R=p(C);m(C,b.__data,L),typeof C!="number"&&typeof C!="boolean"&&!C.isMatrix3&&!ArrayBuffer.isView(C)&&(L+=R.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(w,b.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,y,b.__data)}}function m(b,M,v){typeof b=="number"||typeof b=="boolean"?M[0]=b:b.isMatrix3?(M[0]=b.elements[0],M[1]=b.elements[1],M[2]=b.elements[2],M[3]=0,M[4]=b.elements[3],M[5]=b.elements[4],M[6]=b.elements[5],M[7]=0,M[8]=b.elements[6],M[9]=b.elements[7],M[10]=b.elements[8],M[11]=0):ArrayBuffer.isView(b)?M.set(new b.constructor(b.buffer,b.byteOffset,M.length)):b.toArray(M,v)}function _(b,M,v,A){let y=b.value,w=M+"_"+v;if(A[w]===void 0)return typeof y=="number"||typeof y=="boolean"?A[w]=y:ArrayBuffer.isView(y)?A[w]=y.slice():A[w]=y.clone(),!0;{let L=A[w];if(typeof y=="number"||typeof y=="boolean"){if(L!==y)return A[w]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(L.equals(y)===!1)return L.copy(y),!0}}return!1}function g(b){let M=b.uniforms,v=0,A=16;for(let w=0,L=M.length;w<L;w++){let T=Array.isArray(M[w])?M[w]:[M[w]];for(let C=0,R=T.length;C<R;C++){let P=T[C],D=Array.isArray(P.value)?P.value:[P.value];for(let k=0,V=D.length;k<V;k++){let j=D[k],q=p(j),z=v%A,H=z%q.boundary,F=z+H;v+=H,F!==0&&A-F<q.storage&&(v+=A-F),P.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),P.__offset=v,v+=q.storage}}}let y=v%A;return y>0&&(v+=A-y),b.__size=v,b.__cache={},this}function p(b){let M={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(M.boundary=4,M.storage=4):b.isVector2?(M.boundary=8,M.storage=8):b.isVector3||b.isColor?(M.boundary=16,M.storage=12):b.isVector4?(M.boundary=16,M.storage=16):b.isMatrix3?(M.boundary=48,M.storage=48):b.isMatrix4?(M.boundary=64,M.storage=64):b.isTexture?We("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(b)?(M.boundary=16,M.storage=b.byteLength):We("WebGLRenderer: Unsupported uniform value type.",b),M}function x(b){let M=b.target;M.removeEventListener("dispose",x);let v=o.indexOf(M.__bindingPointIndex);o.splice(v,1),n.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function E(){for(let b in s)n.deleteBuffer(s[b]);o=[],s={},r={}}return{bind:l,update:c,dispose:E}}var KM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),yi=null;function JM(){return yi===null&&(yi=new ra(KM,16,16,fs,ei),yi.name="DFG_LUT",yi.minFilter=Ft,yi.magFilter=Ft,yi.wrapS=Fn,yi.wrapT=Fn,yi.generateMipmaps=!1,yi.needsUpdate=!0),yi}var oh=class{constructor(e={}){let{canvas:t=jm(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=yn}=e;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=o;let _=f,g=new Set([Sc,Mc,vc]),p=new Set([yn,Qn,so,ro,xc,yc]),x=new Uint32Array(4),E=new Int32Array(4),b=new O,M=null,v=null,A=[],y=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Jn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let L=this,T=!1,C=null,R=null,P=null,D=null;this._outputColorSpace=wt;let k=0,V=0,j=null,q=-1,z=null,H=new ht,F=new ht,X=null,le=new Ge(0),de=0,ye=t.width,B=t.height,G=1,re=null,ne=null,ee=new ht(0,0,ye,B),ie=new ht(0,0,ye,B),he=!1,_e=new jr,me=!1,Ve=!1,Le=new tt,qe=new O,Be=new ht,rt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},gt=!1;function ot(){return j===null?G:1}let W=i;function Qt(I,Y){return t.getContext(I,Y)}let _t,N,S,Z,Q,se,ge,be,oe,ce,ve,ke,Ae,Me,ze,Xe,Ke,$,Se,ae,Ee,Re,ue;try{let I={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",St,!1),t.addEventListener("webglcontextrestored",ut,!1),t.addEventListener("webglcontextcreationerror",Gn,!1),W===null){let Y="webgl2";if(W=Qt(Y,I),W===null)throw Qt(Y)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}He()}catch(I){throw t.removeEventListener("webglcontextlost",St,!1),t.removeEventListener("webglcontextrestored",ut,!1),t.removeEventListener("webglcontextcreationerror",Gn,!1),Ye("WebGLRenderer: "+I.message),I}function He(){_t=new rv(W),_t.init(),Ee=new XM(W,_t),N=new jb(W,_t,e,Ee),S=new GM(W,_t),N.reversedDepthBuffer&&d&&S.buffers.depth.setReversed(!0),R=W.createFramebuffer(),P=W.createFramebuffer(),D=W.createFramebuffer(),Z=new lv(W),Q=new CM,se=new WM(W,_t,S,Q,N,Ee,Z),ge=new sv(L),be=new hy(W),Re=new $b(W,be),oe=new ov(W,be,Z,Re),ce=new hv(W,oe,be,Re,Z),$=new cv(W,N,se),ze=new Zb(Q),ve=new RM(L,ge,_t,N,Re,ze),ke=new jM(L,Q),Ae=new PM,Me=new FM(_t),Ke=new Yb(L,ge,S,ce,m,l),Xe=new VM(L,ce,N),ue=new ZM(W,Z,N,S),Se=new qb(W,_t,Z),ae=new av(W,_t,Z),Z.programs=ve.programs,L.capabilities=N,L.extensions=_t,L.properties=Q,L.renderLists=Ae,L.shadowMap=Xe,L.state=S,L.info=Z}_!==yn&&(w=new dv(_,t.width,t.height,a,s,r));let Oe=new $d(L,W);this.xr=Oe,this.getContext=function(){return W},this.getContextAttributes=function(){return W.getContextAttributes()},this.forceContextLoss=function(){let I=_t.get("WEBGL_lose_context");I&&I.loseContext()},this.forceContextRestore=function(){let I=_t.get("WEBGL_lose_context");I&&I.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(I){I!==void 0&&(G=I,this.setSize(ye,B,!1))},this.getSize=function(I){return I.set(ye,B)},this.setSize=function(I,Y,te=!0){if(Oe.isPresenting){We("WebGLRenderer: Can't change size while VR device is presenting.");return}ye=I,B=Y,t.width=Math.floor(I*G),t.height=Math.floor(Y*G),te===!0&&(t.style.width=I+"px",t.style.height=Y+"px"),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,I,Y)},this.getDrawingBufferSize=function(I){return I.set(ye*G,B*G).floor()},this.setDrawingBufferSize=function(I,Y,te){ye=I,B=Y,G=te,t.width=Math.floor(I*te),t.height=Math.floor(Y*te),this.setViewport(0,0,I,Y)},this.setEffects=function(I){if(_===yn){Ye("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(I){for(let Y=0;Y<I.length;Y++)if(I[Y].isOutputPass===!0){We("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(I||[])},this.getCurrentViewport=function(I){return I.copy(H)},this.getViewport=function(I){return I.copy(ee)},this.setViewport=function(I,Y,te,K){I.isVector4?ee.set(I.x,I.y,I.z,I.w):ee.set(I,Y,te,K),S.viewport(H.copy(ee).multiplyScalar(G).round())},this.getScissor=function(I){return I.copy(ie)},this.setScissor=function(I,Y,te,K){I.isVector4?ie.set(I.x,I.y,I.z,I.w):ie.set(I,Y,te,K),S.scissor(F.copy(ie).multiplyScalar(G).round())},this.getScissorTest=function(){return he},this.setScissorTest=function(I){S.setScissorTest(he=I)},this.setOpaqueSort=function(I){re=I},this.setTransparentSort=function(I){ne=I},this.getClearColor=function(I){return I.copy(Ke.getClearColor())},this.setClearColor=function(){Ke.setClearColor(...arguments)},this.getClearAlpha=function(){return Ke.getClearAlpha()},this.setClearAlpha=function(){Ke.setClearAlpha(...arguments)},this.clear=function(I=!0,Y=!0,te=!0){let K=0;if(I){let J=!1;if(j!==null){let Te=j.texture.format;J=g.has(Te)}if(J){let Te=j.texture.type,Pe=p.has(Te),we=Ke.getClearColor(),De=Ke.getClearAlpha(),Ue=we.r,et=we.g,it=we.b;Pe?(x[0]=Ue,x[1]=et,x[2]=it,x[3]=De,W.clearBufferuiv(W.COLOR,0,x)):(E[0]=Ue,E[1]=et,E[2]=it,E[3]=De,W.clearBufferiv(W.COLOR,0,E))}else K|=W.COLOR_BUFFER_BIT}Y&&(K|=W.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),te&&(K|=W.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),K!==0&&W.clear(K)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(I){I.setRenderer(this),C=I},this.dispose=function(){t.removeEventListener("webglcontextlost",St,!1),t.removeEventListener("webglcontextrestored",ut,!1),t.removeEventListener("webglcontextcreationerror",Gn,!1),Ke.dispose(),Ae.dispose(),Me.dispose(),Q.dispose(),ge.dispose(),ce.dispose(),Re.dispose(),ue.dispose(),ve.dispose(),Oe.dispose(),Oe.removeEventListener("sessionstart",mp),Oe.removeEventListener("sessionend",gp),Ts.stop()};function St(I){I.preventDefault(),ea("WebGLRenderer: Context Lost."),T=!0}function ut(){ea("WebGLRenderer: Context Restored."),T=!1;let I=Z.autoReset,Y=Xe.enabled,te=Xe.autoUpdate,K=Xe.needsUpdate,J=Xe.type;He(),Z.autoReset=I,Xe.enabled=Y,Xe.autoUpdate=te,Xe.needsUpdate=K,Xe.type=J}function Gn(I){Ye("WebGLRenderer: A WebGL context could not be created. Reason: ",I.statusMessage)}function ai(I){let Y=I.target;Y.removeEventListener("dispose",ai),Z_(Y)}function Z_(I){K_(I),Q.remove(I)}function K_(I){let Y=Q.get(I).programs;Y!==void 0&&(Y.forEach(function(te){ve.releaseProgram(te)}),I.isShaderMaterial&&ve.releaseShaderCache(I))}this.renderBufferDirect=function(I,Y,te,K,J,Te){Y===null&&(Y=rt);let Pe=J.isMesh&&J.matrixWorld.determinantAffine()<0,we=ex(I,Y,te,K,J);S.setMaterial(K,Pe);let De=te.index,Ue=1;if(K.wireframe===!0){if(De=oe.getWireframeAttribute(te),De===void 0)return;Ue=2}let et=te.drawRange,it=te.attributes.position,Ne=et.start*Ue,dt=(et.start+et.count)*Ue;Te!==null&&(Ne=Math.max(Ne,Te.start*Ue),dt=Math.min(dt,(Te.start+Te.count)*Ue)),De!==null?(Ne=Math.max(Ne,0),dt=Math.min(dt,De.count)):it!=null&&(Ne=Math.max(Ne,0),dt=Math.min(dt,it.count));let Nt=dt-Ne;if(Nt<0||Nt===1/0)return;Re.setup(J,K,we,te,De);let Ct,vt=Se;if(De!==null&&(Ct=be.get(De),vt=ae,vt.setIndex(Ct)),J.isMesh)K.wireframe===!0?(S.setLineWidth(K.wireframeLinewidth*ot()),vt.setMode(W.LINES)):vt.setMode(W.TRIANGLES);else if(J.isLine){let en=K.linewidth;en===void 0&&(en=1),S.setLineWidth(en*ot()),J.isLineSegments?vt.setMode(W.LINES):J.isLineLoop?vt.setMode(W.LINE_LOOP):vt.setMode(W.LINE_STRIP)}else J.isPoints?vt.setMode(W.POINTS):J.isSprite&&vt.setMode(W.TRIANGLES);if(J.isBatchedMesh)if(_t.get("WEBGL_multi_draw"))vt.renderMultiDraw(J._multiDrawStarts,J._multiDrawCounts,J._multiDrawCount);else{let en=J._multiDrawStarts,Ce=J._multiDrawCounts,cn=J._multiDrawCount,ct=De?be.get(De).bytesPerElement:1,Dn=Q.get(K).currentProgram.getUniforms();for(let li=0;li<cn;li++)Dn.setValue(W,"_gl_DrawID",li),vt.render(en[li]/ct,Ce[li])}else if(J.isInstancedMesh)vt.renderInstances(Ne,Nt,J.count);else if(te.isInstancedBufferGeometry){let en=te._maxInstanceCount!==void 0?te._maxInstanceCount:1/0,Ce=Math.min(te.instanceCount,en);vt.renderInstances(Ne,Nt,Ce)}else vt.render(Ne,Nt)};function pp(I,Y,te,K){C!==null&&I.isNodeMaterial&&C.setObject(K,I),me===!0&&ze.setState(I,te,!1),I.transparent===!0&&I.side===mn&&I.forceSinglePass===!1?(I.side=Bt,I.needsUpdate=!0,el(I,Y,K),I.side=Kn,I.needsUpdate=!0,el(I,Y,K),I.side=mn):el(I,Y,K)}this.compile=function(I,Y,te=null){te===null&&(te=I),C!==null&&C.renderStart(I,Y,te),v=Me.get(te),v.init(Y),y.push(v),te.traverseVisible(function(J){J.isLight&&J.layers.test(Y.layers)&&(v.pushLight(J),J.castShadow&&v.pushShadow(J))}),I!==te&&I.traverseVisible(function(J){J.isLight&&J.layers.test(Y.layers)&&(v.pushLight(J),J.castShadow&&v.pushShadow(J))}),v.setupLights(),C!==null&&C.updateLights(v.state.lightsArray),Ve=this.localClippingEnabled,me=ze.init(this.clippingPlanes,Ve),me===!0&&ze.setGlobalState(this.clippingPlanes,Y),C!==null&&Xe.render(v.state.shadowsArray,te,Y);let K=new Set;return I.traverse(function(J){if(!(J.isMesh||J.isPoints||J.isLine||J.isSprite))return;let Te=J.material;if(Te)if(Array.isArray(Te))for(let Pe=0;Pe<Te.length;Pe++){let we=Te[Pe];pp(we,te,Y,J),K.add(we)}else pp(Te,te,Y,J),K.add(Te)}),v=y.pop(),C!==null&&C.renderEnd(),K},this.compileAsync=function(I,Y,te=null){let K=this.compile(I,Y,te);return new Promise(J=>{function Te(){if(K.forEach(function(Pe){let De=Q.get(Pe).currentProgram;(De===void 0||De.isReady())&&K.delete(Pe)}),K.size===0){J(I);return}setTimeout(Te,10)}_t.get("KHR_parallel_shader_compile")!==null?Te():setTimeout(Te,10)})};let Qh=null;function J_(I){Qh&&Qh(I)}function mp(){Ts.stop()}function gp(){Ts.start()}let Ts=new E0;Ts.setAnimationLoop(J_),typeof self<"u"&&Ts.setContext(self),this.setAnimationLoop=function(I){Qh=I,Oe.setAnimationLoop(I),I===null?Ts.stop():Ts.start()},Oe.addEventListener("sessionstart",mp),Oe.addEventListener("sessionend",gp),this.render=function(I,Y){if(Y!==void 0&&Y.isCamera!==!0){Ye("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;C!==null&&C.renderStart(I,Y);let te=Oe.enabled===!0&&Oe.isPresenting===!0,K=w!==null&&(j===null||te)&&w.begin(L,j);if(I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),Y.parent===null&&Y.matrixWorldAutoUpdate===!0&&Y.updateMatrixWorld(),Oe.enabled===!0&&Oe.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Oe.cameraAutoUpdate===!0&&Oe.updateCamera(Y),Y=Oe.getCamera()),I.isScene===!0&&I.onBeforeRender(L,I,Y,j),v=Me.get(I,y.length),v.init(Y),v.state.textureUnits=se.getTextureUnits(),y.push(v),Le.multiplyMatrices(Y.projectionMatrix,Y.matrixWorldInverse),_e.setFromProjectionMatrix(Le,qn,Y.reversedDepth),Ve=this.localClippingEnabled,me=ze.init(this.clippingPlanes,Ve),M=Ae.get(I,A.length),M.init(),A.push(M),Oe.enabled===!0&&Oe.isPresenting===!0){let Pe=L.xr.getDepthSensingMesh();Pe!==null&&eu(Pe,Y,-1/0,L.sortObjects)}eu(I,Y,0,L.sortObjects),M.finish(),C!==null&&C.updateLights(v.state.lightsArray),L.sortObjects===!0&&M.sort(re,ne),gt=Oe.enabled===!1||Oe.isPresenting===!1||Oe.hasDepthSensing()===!1,gt&&Ke.addToRenderList(M,I),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),me===!0&&ze.beginShadows();let J=v.state.shadowsArray;if(Xe.render(J,I,Y),me===!0&&ze.endShadows(),(K&&w.hasRenderPass())===!1){let Pe=M.opaque,we=M.transmissive;if(v.setupLights(),Y.isArrayCamera){let De=Y.cameras;if(we.length>0)for(let Ue=0,et=De.length;Ue<et;Ue++){let it=De[Ue];xp(Pe,we,I,it)}gt&&Ke.render(I);for(let Ue=0,et=De.length;Ue<et;Ue++){let it=De[Ue];_p(M,I,it,it.viewport)}}else we.length>0&&xp(Pe,we,I,Y),gt&&Ke.render(I),_p(M,I,Y)}j!==null&&V===0&&(se.updateMultisampleRenderTarget(j),se.updateRenderTargetMipmap(j)),K&&w.end(L),I.isScene===!0&&I.onAfterRender(L,I,Y),Re.resetDefaultState(),q=-1,z=null,y.pop(),y.length>0?(v=y[y.length-1],se.setTextureUnits(v.state.textureUnits),me===!0&&ze.setGlobalState(L.clippingPlanes,v.state.camera)):v=null,A.pop(),A.length>0?M=A[A.length-1]:M=null,C!==null&&C.renderEnd()};function eu(I,Y,te,K){if(I.visible===!1)return;if(I.layers.test(Y.layers)){if(I.isGroup)te=I.renderOrder;else if(I.isLOD)I.autoUpdate===!0&&I.update(Y);else if(I.isLightProbeGrid)v.pushLightProbeGrid(I);else if(I.isLight)v.pushLight(I),I.castShadow&&v.pushShadow(I);else if(I.isSprite){if(!I.frustumCulled||I.intersectsFrustum(_e)){K&&Be.setFromMatrixPosition(I.matrixWorld).applyMatrix4(Le);let Pe=ce.update(I),we=I.material;we.visible&&M.push(I,Pe,we,te,Be.z,null,Y)}}else if((I.isMesh||I.isLine||I.isPoints)&&(!I.frustumCulled||I.intersectsFrustum(_e))){let Pe=ce.update(I),we=I.material;if(K&&(I.boundingSphere!==void 0?(I.boundingSphere===null&&I.computeBoundingSphere(),Be.copy(I.boundingSphere.center)):(Pe.boundingSphere===null&&Pe.computeBoundingSphere(),Be.copy(Pe.boundingSphere.center)),Be.applyMatrix4(I.matrixWorld).applyMatrix4(Le)),Array.isArray(we)){let De=Pe.groups;for(let Ue=0,et=De.length;Ue<et;Ue++){let it=De[Ue],Ne=we[it.materialIndex];Ne&&Ne.visible&&M.push(I,Pe,Ne,te,Be.z,it,Y)}}else we.visible&&M.push(I,Pe,we,te,Be.z,null,Y)}}let Te=I.children;for(let Pe=0,we=Te.length;Pe<we;Pe++)eu(Te[Pe],Y,te,K)}function _p(I,Y,te,K){let{opaque:J,transmissive:Te,transparent:Pe}=I;v.setupLightsView(te),me===!0&&ze.setGlobalState(L.clippingPlanes,te),K&&S.viewport(H.copy(K)),J.length>0&&Qa(J,Y,te),Te.length>0&&Qa(Te,Y,te),Pe.length>0&&Qa(Pe,Y,te),S.buffers.depth.setTest(!0),S.buffers.depth.setMask(!0),S.buffers.color.setMask(!0),S.setPolygonOffset(!1)}function xp(I,Y,te,K){if((te.isScene===!0?te.overrideMaterial:null)!==null)return;if(v.state.transmissionRenderTarget[K.id]===void 0){let Ne=_t.has("EXT_color_buffer_half_float")||_t.has("EXT_color_buffer_float");v.state.transmissionRenderTarget[K.id]=new xn(1,1,{generateMipmaps:!0,type:Ne?ei:yn,minFilter:xi,samples:Math.max(4,N.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Qe.workingColorSpace})}let Te=v.state.transmissionRenderTarget[K.id],Pe=K.viewport||H;Te.setSize(Pe.z*L.transmissionResolutionScale,Pe.w*L.transmissionResolutionScale);let we=L.getRenderTarget(),De=L.getActiveCubeFace(),Ue=L.getActiveMipmapLevel();L.setRenderTarget(Te),L.getClearColor(le),de=L.getClearAlpha(),de<1&&L.setClearColor(16777215,.5),L.clear(),gt&&Ke.render(te);let et=L.toneMapping;L.toneMapping=Jn;let it=K.viewport;if(K.viewport!==void 0&&(K.viewport=void 0),v.setupLightsView(K),me===!0&&ze.setGlobalState(L.clippingPlanes,K),Qa(I,te,K),se.updateMultisampleRenderTarget(Te),se.updateRenderTargetMipmap(Te),_t.has("WEBGL_multisampled_render_to_texture")===!1){let Ne=!1;for(let dt=0,Nt=Y.length;dt<Nt;dt++){let Ct=Y[dt],{object:vt,geometry:en,material:Ce,group:cn}=Ct;if(Ce.side===mn&&vt.layers.test(K.layers)){let ct=Ce.side;Ce.side=Bt,Ce.needsUpdate=!0,yp(vt,te,K,en,Ce,cn),Ce.side=ct,Ce.needsUpdate=!0,Ne=!0}}Ne===!0&&(se.updateMultisampleRenderTarget(Te),se.updateRenderTargetMipmap(Te))}L.setRenderTarget(we,De,Ue),L.setClearColor(le,de),it!==void 0&&(K.viewport=it),L.toneMapping=et}function Qa(I,Y,te){let K=Y.isScene===!0?Y.overrideMaterial:null;for(let J=0,Te=I.length;J<Te;J++){let Pe=I[J],{object:we,geometry:De,group:Ue}=Pe,et=Pe.material;et.allowOverride===!0&&K!==null&&(et=K),we.layers.test(te.layers)&&yp(we,Y,te,De,et,Ue)}}function yp(I,Y,te,K,J,Te){C!==null&&J.isNodeMaterial&&C.setObject(I,J),I.onBeforeRender(L,Y,te,K,J,Te),I.modelViewMatrix.multiplyMatrices(te.matrixWorldInverse,I.matrixWorld),I.normalMatrix.getNormalMatrix(I.modelViewMatrix),J.onBeforeRender(L,Y,te,K,I,Te),J.transparent===!0&&J.side===mn&&J.forceSinglePass===!1?(J.side=Bt,J.needsUpdate=!0,L.renderBufferDirect(te,Y,K,J,I,Te),J.side=Kn,J.needsUpdate=!0,L.renderBufferDirect(te,Y,K,J,I,Te),J.side=mn):L.renderBufferDirect(te,Y,K,J,I,Te),I.onAfterRender(L,Y,te,K,J,Te)}function el(I,Y,te){Y.isScene!==!0&&(Y=rt);let K=Q.get(I),J=v.state.lights,Te=v.state.shadowsArray,Pe=J.state.version,we=ve.getParameters(I,J.state,Te,Y,te,v.state.lightProbeGridArray),De=ve.getProgramCacheKey(we),Ue=K.programs;K.environment=I.isMeshStandardMaterial||I.isMeshLambertMaterial||I.isMeshPhongMaterial?Y.environment:null,K.fog=Y.fog;let et=I.isMeshStandardMaterial||I.isMeshLambertMaterial&&!I.envMap||I.isMeshPhongMaterial&&!I.envMap;K.envMap=ge.get(I.envMap||K.environment,et),K.envMapRotation=K.environment!==null&&I.envMap===null?Y.environmentRotation:I.envMapRotation,Ue===void 0&&(I.addEventListener("dispose",ai),Ue=new Map,K.programs=Ue);let it=Ue.get(De);if(it!==void 0){if(K.currentProgram===it&&K.lightsStateVersion===Pe)return vp(I,we),it}else we.uniforms=ve.getUniforms(I),C!==null&&I.isNodeMaterial&&C.build(I,te,we),I.onBeforeCompile(we,L),it=ve.acquireProgram(we,De),Ue.set(De,it),K.uniforms=we.uniforms;let Ne=K.uniforms;return(!I.isShaderMaterial&&!I.isRawShaderMaterial||I.clipping===!0)&&(Ne.clippingPlanes=ze.uniform),vp(I,we),K.needsLights=nx(I),K.lightsStateVersion=Pe,K.needsLights&&(Ne.ambientLightColor.value=J.state.ambient,Ne.lightProbe.value=J.state.probe,Ne.sunLights.value=J.state.sun,Ne.sunLightShadows.value=J.state.sunShadow,Ne.directionalLights.value=J.state.directional,Ne.directionalLightShadows.value=J.state.directionalShadow,Ne.spotLights.value=J.state.spot,Ne.spotLightShadows.value=J.state.spotShadow,Ne.rectAreaLights.value=J.state.rectArea,Ne.ltc_1.value=J.state.rectAreaLTC1,Ne.ltc_2.value=J.state.rectAreaLTC2,Ne.pointLights.value=J.state.point,Ne.pointLightShadows.value=J.state.pointShadow,Ne.hemisphereLights.value=J.state.hemi,Ne.sunShadowMatrix.value=J.state.sunShadowMatrix,Ne.sunShadowCascade.value=J.state.sunShadowCascade,Ne.directionalShadowMatrix.value=J.state.directionalShadowMatrix,Ne.spotLightMatrix.value=J.state.spotLightMatrix,Ne.spotLightMap.value=J.state.spotLightMap,Ne.pointShadowMatrix.value=J.state.pointShadowMatrix),K.lightProbeGrid=v.state.lightProbeGridArray.length>0,K.currentProgram=it,K.uniformsList=null,it}function bp(I){if(I.uniformsList===null){let Y=I.currentProgram.getUniforms();I.uniformsList=lo.seqWithValue(Y.seq,I.uniforms)}return I.uniformsList}function vp(I,Y){let te=Q.get(I);te.outputColorSpace=Y.outputColorSpace,te.batching=Y.batching,te.batchingColor=Y.batchingColor,te.instancing=Y.instancing,te.instancingColor=Y.instancingColor,te.instancingMorph=Y.instancingMorph,te.skinning=Y.skinning,te.morphTargets=Y.morphTargets,te.morphNormals=Y.morphNormals,te.morphColors=Y.morphColors,te.morphTargetsCount=Y.morphTargetsCount,te.numClippingPlanes=Y.numClippingPlanes,te.numIntersection=Y.numClipIntersection,te.vertexAlphas=Y.vertexAlphas,te.vertexTangents=Y.vertexTangents,te.toneMapping=Y.toneMapping}function Q_(I,Y){if(I.length===0)return null;if(I.length===1)return I[0].texture!==null?I[0]:null;b.setFromMatrixPosition(Y.matrixWorld);for(let te=0,K=I.length;te<K;te++){let J=I[te];if(J.texture!==null&&J.boundingBox.containsPoint(b))return J}return null}function ex(I,Y,te,K,J){Y.isScene!==!0&&(Y=rt),se.resetTextureUnits();let Te=Y.fog,Pe=K.isMeshStandardMaterial||K.isMeshLambertMaterial||K.isMeshPhongMaterial?Y.environment:null,we=j===null?L.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Qe.workingColorSpace,De=K.isMeshStandardMaterial||K.isMeshLambertMaterial&&!K.envMap||K.isMeshPhongMaterial&&!K.envMap,Ue=ge.get(K.envMap||Pe,De),et=K.vertexColors===!0&&!!te.attributes.color&&te.attributes.color.itemSize===4,it=!!te.attributes.tangent&&(!!K.normalMap||K.anisotropy>0),Ne=!!te.morphAttributes.position,dt=!!te.morphAttributes.normal,Nt=!!te.morphAttributes.color,Ct=Jn;K.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Ct=L.toneMapping);let vt=te.morphAttributes.position||te.morphAttributes.normal||te.morphAttributes.color,en=vt!==void 0?vt.length:0,Ce=Q.get(K),cn=v.state.lights;if(me===!0&&(Ve===!0||I!==z)){let Et=I===z&&K.id===q;ze.setState(K,I,Et)}let ct=!1;K.version===Ce.__version?(Ce.needsLights&&Ce.lightsStateVersion!==cn.state.version||Ce.outputColorSpace!==we||J.isBatchedMesh&&Ce.batching===!1||!J.isBatchedMesh&&Ce.batching===!0||J.isBatchedMesh&&Ce.batchingColor===!0&&J._colorsTexture===null||J.isBatchedMesh&&Ce.batchingColor===!1&&J._colorsTexture!==null||J.isInstancedMesh&&Ce.instancing===!1||!J.isInstancedMesh&&Ce.instancing===!0||J.isSkinnedMesh&&Ce.skinning===!1||!J.isSkinnedMesh&&Ce.skinning===!0||J.isInstancedMesh&&Ce.instancingColor===!0&&J.instanceColor===null||J.isInstancedMesh&&Ce.instancingColor===!1&&J.instanceColor!==null||J.isInstancedMesh&&Ce.instancingMorph===!0&&J.morphTexture===null||J.isInstancedMesh&&Ce.instancingMorph===!1&&J.morphTexture!==null||Ce.envMap!==Ue||K.fog===!0&&Ce.fog!==Te||Ce.numClippingPlanes!==void 0&&(Ce.numClippingPlanes!==ze.numPlanes||Ce.numIntersection!==ze.numIntersection)||Ce.vertexAlphas!==et||Ce.vertexTangents!==it||Ce.morphTargets!==Ne||Ce.morphNormals!==dt||Ce.morphColors!==Nt||Ce.toneMapping!==Ct||Ce.morphTargetsCount!==en||!!Ce.lightProbeGrid!=v.state.lightProbeGridArray.length>0)&&(ct=!0):(ct=!0,Ce.__version=K.version);let Dn=Ce.currentProgram;ct===!0&&(Dn=el(K,Y,J),C&&K.isNodeMaterial&&C.onUpdateProgram(K,Dn,Ce));let li=!1,Wi=!1,or=!1,bt=Dn.getUniforms(),Dt=Ce.uniforms;if(S.useProgram(Dn.program)&&(li=!0,Wi=!0,or=!0),K.id!==q&&(q=K.id,Wi=!0),Ce.needsLights){let Et=Q_(v.state.lightProbeGridArray,J);Ce.lightProbeGrid!==Et&&(Ce.lightProbeGrid=Et,Wi=!0)}if(li||z!==I){S.buffers.depth.getReversed()&&I.reversedDepth!==!0&&(I._reversedDepth=!0,I.updateProjectionMatrix()),bt.setValue(W,"projectionMatrix",I.projectionMatrix),bt.setValue(W,"viewMatrix",I.matrixWorldInverse);let Yi=bt.map.cameraPosition;Yi!==void 0&&Yi.setValue(W,qe.setFromMatrixPosition(I.matrixWorld)),N.logarithmicDepthBuffer&&bt.setValue(W,"logDepthBufFC",2/(Math.log(I.far+1)/Math.LN2)),(K.isMeshPhongMaterial||K.isMeshToonMaterial||K.isMeshLambertMaterial||K.isMeshBasicMaterial||K.isMeshStandardMaterial||K.isShaderMaterial)&&bt.setValue(W,"isOrthographic",I.isOrthographicCamera===!0),z!==I&&(z=I,Wi=!0,or=!0)}if(Ce.needsLights&&(cn.state.sunShadowMap.length>0&&bt.setValue(W,"sunShadowMap",cn.state.sunShadowMap,se),cn.state.directionalShadowMap.length>0&&bt.setValue(W,"directionalShadowMap",cn.state.directionalShadowMap,se),cn.state.spotShadowMap.length>0&&bt.setValue(W,"spotShadowMap",cn.state.spotShadowMap,se),cn.state.pointShadowMap.length>0&&bt.setValue(W,"pointShadowMap",cn.state.pointShadowMap,se)),J.isSkinnedMesh){bt.setOptional(W,J,"bindMatrix"),bt.setOptional(W,J,"bindMatrixInverse");let Et=J.skeleton;Et&&(Et.boneTexture===null&&Et.computeBoneTexture(),bt.setValue(W,"boneTexture",Et.boneTexture,se))}J.isBatchedMesh&&(bt.setOptional(W,J,"batchingTexture"),bt.setValue(W,"batchingTexture",J._matricesTexture,se),bt.setOptional(W,J,"batchingIdTexture"),bt.setValue(W,"batchingIdTexture",J._indirectTexture,se),bt.setOptional(W,J,"batchingColorTexture"),J._colorsTexture!==null&&bt.setValue(W,"batchingColorTexture",J._colorsTexture,se));let Xi=te.morphAttributes;if((Xi.position!==void 0||Xi.normal!==void 0||Xi.color!==void 0)&&$.update(J,te,Dn),(Wi||Ce.receiveShadow!==J.receiveShadow)&&(Ce.receiveShadow=J.receiveShadow,bt.setValue(W,"receiveShadow",J.receiveShadow)),(K.isMeshStandardMaterial||K.isMeshLambertMaterial||K.isMeshPhongMaterial)&&K.envMap===null&&Y.environment!==null&&(Dt.envMapIntensity.value=Y.environmentIntensity),Dt.dfgLUT!==void 0&&(Dt.dfgLUT.value=JM()),Wi){if(bt.setValue(W,"toneMappingExposure",L.toneMappingExposure),Ce.needsLights&&tx(Dt,or),Te&&K.fog===!0&&ke.refreshFogUniforms(Dt,Te),ke.refreshMaterialUniforms(Dt,K,G,B,v.state.transmissionRenderTarget[I.id]),Ce.needsLights&&Ce.lightProbeGrid){let Et=Ce.lightProbeGrid;Dt.probesSH.value=Et.texture,Dt.probesMin.value.copy(Et.boundingBox.min),Dt.probesMax.value.copy(Et.boundingBox.max),Dt.probesResolution.value.copy(Et.resolution)}lo.upload(W,bp(Ce),Dt,se)}if(K.isShaderMaterial&&K.uniformsNeedUpdate===!0&&(lo.upload(W,bp(Ce),Dt,se),K.uniformsNeedUpdate=!1),K.isSpriteMaterial&&bt.setValue(W,"center",J.center),bt.setValue(W,"modelViewMatrix",J.modelViewMatrix),bt.setValue(W,"normalMatrix",J.normalMatrix),bt.setValue(W,"modelMatrix",J.matrixWorld),K.uniformsGroups!==void 0){let Et=K.uniformsGroups;for(let Yi=0,ar=Et.length;Yi<ar;Yi++){let Sp=Et[Yi];ue.update(Sp,Dn),ue.bind(Sp,Dn)}}return Dn}function tx(I,Y){I.ambientLightColor.needsUpdate=Y,I.lightProbe.needsUpdate=Y,I.sunLights.needsUpdate=Y,I.sunLightShadows.needsUpdate=Y,I.directionalLights.needsUpdate=Y,I.directionalLightShadows.needsUpdate=Y,I.pointLights.needsUpdate=Y,I.pointLightShadows.needsUpdate=Y,I.spotLights.needsUpdate=Y,I.spotLightShadows.needsUpdate=Y,I.rectAreaLights.needsUpdate=Y,I.hemisphereLights.needsUpdate=Y}function nx(I){return I.isMeshLambertMaterial||I.isMeshToonMaterial||I.isMeshPhongMaterial||I.isMeshStandardMaterial||I.isShadowMaterial||I.isShaderMaterial&&I.lights===!0}this.getActiveCubeFace=function(){return k},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return j},this.setRenderTargetTextures=function(I,Y,te){let K=Q.get(I);K.__autoAllocateDepthBuffer=I.resolveDepthBuffer===!1,K.__autoAllocateDepthBuffer===!1&&(K.__useRenderToTexture=!1),Q.get(I.texture).__webglTexture=Y,Q.get(I.depthTexture).__webglTexture=K.__autoAllocateDepthBuffer?void 0:te,K.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(I,Y){let te=Q.get(I);te.__webglFramebuffer=Y,te.__useDefaultFramebuffer=Y===void 0},this.setRenderTarget=function(I,Y=0,te=0){j=I,k=Y,V=te;let K=null,J=!1,Te=!1;if(I){let we=Q.get(I);if(we.__useDefaultFramebuffer!==void 0){S.bindFramebuffer(W.FRAMEBUFFER,we.__webglFramebuffer),H.copy(I.viewport),F.copy(I.scissor),X=I.scissorTest,S.viewport(H),S.scissor(F),S.setScissorTest(X),q=-1;return}else if(we.__webglFramebuffer===void 0)se.setupRenderTarget(I);else if(we.__hasExternalTextures)se.rebindTextures(I,Q.get(I.texture).__webglTexture,Q.get(I.depthTexture).__webglTexture);else if(I.depthBuffer){let et=I.depthTexture;if(we.__boundDepthTexture!==et){if(et!==null&&Q.has(et)&&(I.width!==et.image.width||I.height!==et.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");se.setupDepthRenderbuffer(I)}}let De=I.texture;(De.isData3DTexture||De.isDataArrayTexture||De.isCompressedArrayTexture)&&(Te=!0);let Ue=Q.get(I).__webglFramebuffer;I.isWebGLCubeRenderTarget?(Array.isArray(Ue[Y])?K=Ue[Y][te]:K=Ue[Y],J=!0):I.samples>0&&se.useMultisampledRTT(I)===!1?K=Q.get(I).__webglMultisampledFramebuffer:Array.isArray(Ue)?K=Ue[te]:K=Ue,H.copy(I.viewport),F.copy(I.scissor),X=I.scissorTest}else H.copy(ee).multiplyScalar(G).floor(),F.copy(ie).multiplyScalar(G).floor(),X=he;if(te!==0&&(K=R),S.bindFramebuffer(W.FRAMEBUFFER,K)&&S.drawBuffers(I,K),S.viewport(H),S.scissor(F),S.setScissorTest(X),J){let we=Q.get(I.texture);W.framebufferTexture2D(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_CUBE_MAP_POSITIVE_X+Y,we.__webglTexture,te)}else if(Te){let we=Y;for(let De=0;De<I.textures.length;De++){let Ue=Q.get(I.textures[De]);W.framebufferTextureLayer(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0+De,Ue.__webglTexture,te,we)}}else if(I!==null&&te!==0){let we=Q.get(I.texture);W.framebufferTexture2D(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_2D,we.__webglTexture,te)}q=-1};function Mp(I){let Y=Q.get(I);return(Y.__readFormat!==I.format||Y.__readType!==I.type)&&(Y.__readFormat=I.format,Y.__readType=I.type,Y.__formatReadable=N.textureFormatReadable(I.format),Y.__typeReadable=N.textureTypeReadable(I.type)),Y}this.readRenderTargetPixels=function(I,Y,te,K,J,Te,Pe,we=0){if(!(I&&I.isWebGLRenderTarget)){Ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let De=Q.get(I).__webglFramebuffer;if(I.isWebGLCubeRenderTarget&&Pe!==void 0&&(De=De[Pe]),De){S.bindFramebuffer(W.FRAMEBUFFER,De);try{let Ue=I.textures[we],et=Ue.format,it=Ue.type;I.textures.length>1&&W.readBuffer(W.COLOR_ATTACHMENT0+we);let Ne=Mp(Ue);if(Ne.__formatReadable===!1){Ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ne.__typeReadable===!1){Ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}Y>=0&&Y<=I.width-K&&te>=0&&te<=I.height-J&&W.readPixels(Y,te,K,J,Ee.convert(et),Ee.convert(it),Te)}finally{let Ue=j!==null?Q.get(j).__webglFramebuffer:null;S.bindFramebuffer(W.FRAMEBUFFER,Ue)}}},this.readRenderTargetPixelsAsync=async function(I,Y,te,K,J,Te,Pe,we=0){if(!(I&&I.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let De=Q.get(I).__webglFramebuffer;if(I.isWebGLCubeRenderTarget&&Pe!==void 0&&(De=De[Pe]),De)if(Y>=0&&Y<=I.width-K&&te>=0&&te<=I.height-J){S.bindFramebuffer(W.FRAMEBUFFER,De);let Ue=I.textures[we],et=Ue.format,it=Ue.type;I.textures.length>1&&W.readBuffer(W.COLOR_ATTACHMENT0+we);let Ne=Mp(Ue);if(Ne.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ne.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let dt=W.createBuffer();W.bindBuffer(W.PIXEL_PACK_BUFFER,dt),W.bufferData(W.PIXEL_PACK_BUFFER,Te.byteLength,W.STREAM_READ),W.readPixels(Y,te,K,J,Ee.convert(et),Ee.convert(it),0),W.bindBuffer(W.PIXEL_PACK_BUFFER,null);let Nt=j!==null?Q.get(j).__webglFramebuffer:null;S.bindFramebuffer(W.FRAMEBUFFER,Nt);let Ct=W.fenceSync(W.SYNC_GPU_COMMANDS_COMPLETE,0);return W.flush(),await Km(W,Ct,4),W.bindBuffer(W.PIXEL_PACK_BUFFER,dt),W.getBufferSubData(W.PIXEL_PACK_BUFFER,0,Te),W.bindBuffer(W.PIXEL_PACK_BUFFER,null),W.deleteBuffer(dt),W.deleteSync(Ct),Te}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(I,Y=null,te=0){let K=Math.pow(2,-te),J=Math.floor(I.image.width*K),Te=Math.floor(I.image.height*K),Pe=Y!==null?Y.x:0,we=Y!==null?Y.y:0;se.setTexture2D(I,0),W.copyTexSubImage2D(W.TEXTURE_2D,te,0,0,Pe,we,J,Te),S.unbindTexture()},this.copyTextureToTexture=function(I,Y,te=null,K=null,J=0,Te=0){let Pe,we,De,Ue,et,it,Ne,dt,Nt,Ct=I.isCompressedTexture?I.mipmaps[Te]:I.image;if(te!==null)Pe=te.max.x-te.min.x,we=te.max.y-te.min.y,De=te.isBox3?te.max.z-te.min.z:1,Ue=te.min.x,et=te.min.y,it=te.isBox3?te.min.z:0;else{let Dt=Math.pow(2,-J);Pe=Math.floor(Ct.width*Dt),we=Math.floor(Ct.height*Dt),I.isDataArrayTexture?De=Ct.depth:I.isData3DTexture?De=Math.floor(Ct.depth*Dt):De=1,Ue=0,et=0,it=0}K!==null?(Ne=K.x,dt=K.y,Nt=K.z):(Ne=0,dt=0,Nt=0);let vt=Ee.convert(Y.format),en=Ee.convert(Y.type),Ce;Y.isData3DTexture?(se.setTexture3D(Y,0),Ce=W.TEXTURE_3D):Y.isDataArrayTexture||Y.isCompressedArrayTexture?(se.setTexture2DArray(Y,0),Ce=W.TEXTURE_2D_ARRAY):(se.setTexture2D(Y,0),Ce=W.TEXTURE_2D),S.activeTexture(W.TEXTURE0),S.pixelStorei(W.UNPACK_FLIP_Y_WEBGL,Y.flipY),S.pixelStorei(W.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Y.premultiplyAlpha),S.pixelStorei(W.UNPACK_ALIGNMENT,Y.unpackAlignment);let cn=S.getParameter(W.UNPACK_ROW_LENGTH),ct=S.getParameter(W.UNPACK_IMAGE_HEIGHT),Dn=S.getParameter(W.UNPACK_SKIP_PIXELS),li=S.getParameter(W.UNPACK_SKIP_ROWS),Wi=S.getParameter(W.UNPACK_SKIP_IMAGES);S.pixelStorei(W.UNPACK_ROW_LENGTH,Ct.width),S.pixelStorei(W.UNPACK_IMAGE_HEIGHT,Ct.height),S.pixelStorei(W.UNPACK_SKIP_PIXELS,Ue),S.pixelStorei(W.UNPACK_SKIP_ROWS,et),S.pixelStorei(W.UNPACK_SKIP_IMAGES,it);let or=I.isDataArrayTexture||I.isData3DTexture,bt=Y.isDataArrayTexture||Y.isData3DTexture;if(I.isDepthTexture){let Dt=Q.get(I),Xi=Q.get(Y),Et=Q.get(Dt.__renderTarget),Yi=Q.get(Xi.__renderTarget);S.bindFramebuffer(W.READ_FRAMEBUFFER,Et.__webglFramebuffer),S.bindFramebuffer(W.DRAW_FRAMEBUFFER,Yi.__webglFramebuffer);for(let ar=0;ar<De;ar++)or&&(W.framebufferTextureLayer(W.READ_FRAMEBUFFER,W.COLOR_ATTACHMENT0,Q.get(I).__webglTexture,J,it+ar),W.framebufferTextureLayer(W.DRAW_FRAMEBUFFER,W.COLOR_ATTACHMENT0,Q.get(Y).__webglTexture,Te,Nt+ar)),W.blitFramebuffer(Ue,et,Pe,we,Ne,dt,Pe,we,W.DEPTH_BUFFER_BIT,W.NEAREST);S.bindFramebuffer(W.READ_FRAMEBUFFER,null),S.bindFramebuffer(W.DRAW_FRAMEBUFFER,null)}else if(J!==0||I.isRenderTargetTexture||Q.has(I)){let Dt=Q.get(I),Xi=Q.get(Y);S.bindFramebuffer(W.READ_FRAMEBUFFER,P),S.bindFramebuffer(W.DRAW_FRAMEBUFFER,D);for(let Et=0;Et<De;Et++)or?W.framebufferTextureLayer(W.READ_FRAMEBUFFER,W.COLOR_ATTACHMENT0,Dt.__webglTexture,J,it+Et):W.framebufferTexture2D(W.READ_FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_2D,Dt.__webglTexture,J),bt?W.framebufferTextureLayer(W.DRAW_FRAMEBUFFER,W.COLOR_ATTACHMENT0,Xi.__webglTexture,Te,Nt+Et):W.framebufferTexture2D(W.DRAW_FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_2D,Xi.__webglTexture,Te),J!==0?W.blitFramebuffer(Ue,et,Pe,we,Ne,dt,Pe,we,W.COLOR_BUFFER_BIT,W.NEAREST):bt?W.copyTexSubImage3D(Ce,Te,Ne,dt,Nt+Et,Ue,et,Pe,we):W.copyTexSubImage2D(Ce,Te,Ne,dt,Ue,et,Pe,we);S.bindFramebuffer(W.READ_FRAMEBUFFER,null),S.bindFramebuffer(W.DRAW_FRAMEBUFFER,null)}else bt?I.isDataTexture||I.isData3DTexture?W.texSubImage3D(Ce,Te,Ne,dt,Nt,Pe,we,De,vt,en,Ct.data):Y.isCompressedArrayTexture?W.compressedTexSubImage3D(Ce,Te,Ne,dt,Nt,Pe,we,De,vt,Ct.data):W.texSubImage3D(Ce,Te,Ne,dt,Nt,Pe,we,De,vt,en,Ct):I.isDataTexture?W.texSubImage2D(W.TEXTURE_2D,Te,Ne,dt,Pe,we,vt,en,Ct.data):I.isCompressedTexture?W.compressedTexSubImage2D(W.TEXTURE_2D,Te,Ne,dt,Ct.width,Ct.height,vt,Ct.data):W.texSubImage2D(W.TEXTURE_2D,Te,Ne,dt,Pe,we,vt,en,Ct);S.pixelStorei(W.UNPACK_ROW_LENGTH,cn),S.pixelStorei(W.UNPACK_IMAGE_HEIGHT,ct),S.pixelStorei(W.UNPACK_SKIP_PIXELS,Dn),S.pixelStorei(W.UNPACK_SKIP_ROWS,li),S.pixelStorei(W.UNPACK_SKIP_IMAGES,Wi),Te===0&&Y.generateMipmaps&&W.generateMipmap(Ce),S.unbindTexture()},this.initRenderTarget=function(I){Q.get(I).__webglFramebuffer===void 0&&se.setupRenderTarget(I)},this.initTexture=function(I){I.isCubeTexture?se.setTextureCube(I,0):I.isData3DTexture?se.setTexture3D(I,0):I.isDataArrayTexture||I.isCompressedArrayTexture?se.setTexture2DArray(I,0):se.setTexture2D(I,0),S.unbindTexture()},this.resetState=function(){k=0,V=0,j=null,S.reset(),Re.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return qn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Qe._getUnpackColorSpace()}};var L0={type:"change"},Zd={type:"start"},N0={type:"end"},ch=new Ui,D0=new dn,QM=Math.cos(70*Rn.DEG2RAD),Ht=new O,vn=2*Math.PI,yt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},jd=1e-6,hh=class extends ya{constructor(e,t=null){super(e,t),this.state=yt.NONE,this.target=new O,this.cursor=new O,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:cs.ROTATE,MIDDLE:cs.DOLLY,RIGHT:cs.PAN},this.touches={ONE:hs.ROTATE,TWO:hs.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new O,this._lastQuaternion=new It,this._lastTargetPosition=new O,this._quat=new It().setFromUnitVectors(e.up,new O(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new eo,this._sphericalDelta=new eo,this._scale=1,this._panOffset=new O,this._rotateStart=new Ie,this._rotateEnd=new Ie,this._rotateDelta=new Ie,this._panStart=new Ie,this._panEnd=new Ie,this._panDelta=new Ie,this._dollyStart=new Ie,this._dollyEnd=new Ie,this._dollyDelta=new Ie,this._dollyDirection=new O,this._mouse=new Ie,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=tS.bind(this),this._onPointerDown=eS.bind(this),this._onPointerUp=nS.bind(this),this._onContextMenu=cS.bind(this),this._onMouseWheel=rS.bind(this),this._onKeyDown=oS.bind(this),this._onTouchStart=aS.bind(this),this._onTouchMove=lS.bind(this),this._onMouseDown=iS.bind(this),this._onMouseMove=sS.bind(this),this._interceptControlDown=hS.bind(this),this._interceptControlUp=uS.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=yt.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let e=this.domElement.getRootNode();e.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),e.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(L0),this.update(),this.state=yt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Ht.copy(t).sub(this.target),Ht.applyQuaternion(this._quat),this._spherical.setFromVector3(Ht),this.autoRotate&&this.state===yt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=vn:i>Math.PI&&(i-=vn),s<-Math.PI?s+=vn:s>Math.PI&&(s-=vn),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Ht.setFromSpherical(this._spherical),Ht.applyQuaternion(this._quatInverse),t.copy(this.target).add(Ht),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Ht.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new O(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new O(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Ht.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(ch.origin.copy(this.object.position),ch.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ch.direction))<QM?this.object.lookAt(this.target):(D0.setFromNormalAndCoplanarPoint(this.object.up,this.target),ch.intersectPlane(D0,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>jd||8*(1-this._lastQuaternion.dot(this.object.quaternion))>jd||this._lastTargetPosition.distanceToSquared(this.target)>jd?(this.dispatchEvent(L0),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?vn/60*this.autoRotateSpeed*e:vn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Ht.setFromMatrixColumn(t,0),Ht.multiplyScalar(-e),this._panOffset.add(Ht)}_panUp(e,t){this.screenSpacePanning===!0?Ht.setFromMatrixColumn(t,1):(Ht.setFromMatrixColumn(t,0),Ht.crossVectors(this.object.up,Ht)),Ht.multiplyScalar(e),this._panOffset.add(Ht)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Ht.copy(s).sub(this.target);let r=Ht.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,o=i.width,a=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(vn*this._rotateDelta.x/t.clientHeight),this._rotateUp(vn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(vn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-vn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(vn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-vn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(vn*this._rotateDelta.x/t.clientHeight),this._rotateUp(vn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Ie,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function eS(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function tS(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function nS(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(N0),this.state=yt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function iS(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case cs.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=yt.DOLLY;break;case cs.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=yt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=yt.ROTATE}break;case cs.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=yt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=yt.PAN}break;default:this.state=yt.NONE}this.state!==yt.NONE&&this.dispatchEvent(Zd)}function sS(n){switch(this.state){case yt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case yt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case yt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function rS(n){this.enabled===!1||this.enableZoom===!1||this.state!==yt.NONE||(n.preventDefault(),this.dispatchEvent(Zd),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(N0))}function oS(n){this.enabled!==!1&&this._handleKeyDown(n)}function aS(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case hs.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=yt.TOUCH_ROTATE;break;case hs.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=yt.TOUCH_PAN;break;default:this.state=yt.NONE}break;case 2:switch(this.touches.TWO){case hs.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=yt.TOUCH_DOLLY_PAN;break;case hs.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=yt.TOUCH_DOLLY_ROTATE;break;default:this.state=yt.NONE}break;default:this.state=yt.NONE}this.state!==yt.NONE&&this.dispatchEvent(Zd)}function lS(n){switch(this._trackPointer(n),this.state){case yt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case yt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case yt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case yt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=yt.NONE}}function cS(n){this.enabled!==!1&&n.preventDefault()}function hS(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function uS(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var uh=class extends Tt{constructor(e=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new Ie(.5,.5),this.rotation2D=0,this.addEventListener("removed",function(){this.traverse(function(t){t.element&&t.element instanceof t.element.ownerDocument.defaultView.Element&&t.element.parentNode!==null&&t.element.remove()})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this.rotation2D=e.rotation2D,this}},uo=new O,O0=new tt,U0=new tt,F0=new O,B0=new O,dh=class{constructor(e={}){let t=this,i,s,r,o,a={objects:new WeakMap},l=e.element!==void 0?e.element:document.createElement("div");l.style.overflow="hidden",this.domElement=l,this.sortObjects=!0,this.getSize=function(){return{width:i,height:s}},this.render=function(m,_){m.matrixWorldAutoUpdate===!0&&m.updateMatrixWorld(),_.parent===null&&_.matrixWorldAutoUpdate===!0&&_.updateMatrixWorld(),O0.copy(_.matrixWorldInverse),U0.multiplyMatrices(_.projectionMatrix,O0),h(m,m,_),this.sortObjects&&f(m)},this.setSize=function(m,_){i=m,s=_,r=i/2,o=s/2,l.style.width=m+"px",l.style.height=_+"px"};function c(m){m.isCSS2DObject&&(m.element.style.display="none");for(let _=0,g=m.children.length;_<g;_++)c(m.children[_])}function h(m,_,g){if(m.visible===!1){c(m);return}if(m.isCSS2DObject){uo.setFromMatrixPosition(m.matrixWorld),uo.applyMatrix4(U0);let p=uo.z>=-1&&uo.z<=1&&m.layers.test(g.layers)===!0,x=m.element;if(x.style.display=p===!0?"":"none",p===!0){m.onBeforeRender(t,_,g);let b=100*m.center.x,M=100*m.center.y;x.style.transformOrigin=`${b}% ${M}%`;let v=-m.rotation2D,A=uo.x*r+r,y=-uo.y*o+o;x.style.transform=`translate(${-b}%, ${-M}%) translate(${A}px, ${y}px) rotate(${v}rad)`,x.parentNode!==l&&l.appendChild(x),m.onAfterRender(t,_,g)}let E={distanceToCameraSquared:u(g,m)};a.objects.set(m,E)}for(let p=0,x=m.children.length;p<x;p++)h(m.children[p],_,g)}function u(m,_){return F0.setFromMatrixPosition(m.matrixWorld),B0.setFromMatrixPosition(_.matrixWorld),F0.distanceToSquared(B0)}function d(m){let _=[];return m.traverseVisible(function(g){g.isCSS2DObject&&_.push(g)}),_}function f(m){let _=d(m).sort(function(p,x){if(p.renderOrder!==x.renderOrder)return x.renderOrder-p.renderOrder;let E=a.objects.get(p).distanceToCameraSquared,b=a.objects.get(x).distanceToCameraSquared;return E-b}),g=_.length;for(let p=0,x=_.length;p<x;p++)_[p].element.style.zIndex=g-p}}};var fh=class extends Tt{constructor(e,t){super(),this.isViewHelper=!0,this.camera=e,this.animating=!1,this.center=new O,this.location={top:null,right:0,bottom:0,left:null};let i=new Ge("#ff4466"),s=new Ge("#88ff44"),r=new Ge("#4488ff"),o=new Ge("#000000"),a={},l=this,c=[],h=new Hs,u=new Ie,d=new Tt,f=new Zn(-2,2,2,-2,0,4);f.position.set(0,0,2);let m=new ha(.04,.04,.8,5).rotateZ(-Math.PI/2).translate(.4,0,0),_=new at(m,F(i)),g=new at(m,F(s)),p=new at(m,F(r));g.rotation.z=Math.PI/2,p.rotation.y=-Math.PI/2,this.add(_),this.add(p),this.add(g);let x=de(i),E=de(s),b=de(r),M=de(o),v=new mi(x),A=new mi(E),y=new mi(b),w=new mi(M),L=new mi(M),T=new mi(M);v.position.x=1,A.position.y=1,y.position.z=1,w.position.x=-1,L.position.y=-1,T.position.z=-1,w.material.opacity=.2,L.material.opacity=.2,T.material.opacity=.2,v.userData.type="posX",A.userData.type="posY",y.userData.type="posZ",w.userData.type="negX",L.userData.type="negY",T.userData.type="negZ",this.add(v),this.add(A),this.add(y),this.add(w),this.add(L),this.add(T),c.push(v),c.push(A),c.push(y),c.push(w),c.push(L),c.push(T);let C=new O,R=128,P=2*Math.PI;this.render=function(B){this.quaternion.copy(this.camera.quaternion).invert(),this.updateMatrixWorld(),C.set(0,0,1),C.applyQuaternion(this.camera.quaternion);let G=this.location,re,ne;G.left!==null?re=G.left:re=t.offsetWidth-R-G.right,G.top!==null?ne=B.isWebGPURenderer?G.top:t.offsetHeight-R-G.top:ne=B.isWebGPURenderer?t.offsetHeight-R-G.bottom:G.bottom,B.clearDepth(),B.getViewport(q),B.setViewport(re,ne,R,R),B.render(this,f),B.setViewport(q.x,q.y,q.z,q.w)};let D=new O,k=new It,V=new It,j=new It,q=new ht,z=0;this.handleClick=function(B){if(this.animating===!0)return!1;let G=t.getBoundingClientRect(),re=this.location,ne,ee;re.left!==null?ne=G.left+re.left:ne=G.left+t.offsetWidth-R-re.right,re.top!==null?ee=G.top+re.top:ee=G.top+t.offsetHeight-R-re.bottom,u.x=(B.clientX-ne)/R*2-1,u.y=-((B.clientY-ee)/R)*2+1,h.setFromCamera(u,f);let ie=h.intersectObjects(c);if(ie.length>0){let _e=ie[0].object;return H(_e,this.center),this.animating=!0,!0}else return!1},this.setLabels=function(B,G,re){a.labelX=B,a.labelY=G,a.labelZ=re,ye()},this.setLabelStyle=function(B,G,re){a.font=B,a.color=G,a.radius=re,ye()},this.update=function(B){let G=B*P;V.rotateTowards(j,G),this.camera.position.set(0,0,1).applyQuaternion(V).multiplyScalar(z).add(this.center),this.camera.quaternion.rotateTowards(k,G),V.angleTo(j)===0&&(this.animating=!1)},this.dispose=function(){m.dispose(),_.material.dispose(),g.material.dispose(),p.material.dispose(),v.material.map.dispose(),A.material.map.dispose(),y.material.map.dispose(),w.material.map.dispose(),L.material.map.dispose(),T.material.map.dispose(),v.material.dispose(),A.material.dispose(),y.material.dispose(),w.material.dispose(),L.material.dispose(),T.material.dispose()};function H(B,G){switch(B.userData.type){case"posX":D.set(1,0,0),k.setFromEuler(new Yt(0,Math.PI*.5,0));break;case"posY":D.set(0,1,0),k.setFromEuler(new Yt(-Math.PI*.5,0,0));break;case"posZ":D.set(0,0,1),k.setFromEuler(new Yt);break;case"negX":D.set(-1,0,0),k.setFromEuler(new Yt(0,-Math.PI*.5,0));break;case"negY":D.set(0,-1,0),k.setFromEuler(new Yt(Math.PI*.5,0,0));break;case"negZ":D.set(0,0,-1),k.setFromEuler(new Yt(0,Math.PI,0));break;default:console.error("ViewHelper: Invalid axis.")}z=l.camera.position.distanceTo(G),D.multiplyScalar(z).add(G),d.position.copy(G),d.lookAt(l.camera.position),V.copy(d.quaternion),d.lookAt(D),j.copy(d.quaternion)}function F(B){return new gi({color:B,toneMapped:!1})}function X(){let B=!1;try{B=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}return B}function le(B,G){let re;return X()?re=new OffscreenCanvas(B,G):(re=document.createElement("canvas"),re.width=B,re.height=G),re}function de(B,G){let{font:re="24px Arial",color:ne="#000000",radius:ee=14}=a,ie=le(64,64),he=ie.getContext("2d");he.beginPath(),he.arc(32,32,ee,0,2*Math.PI),he.closePath(),he.fillStyle=B.getStyle(),he.fill(),G&&(he.font=re,he.textAlign="center",he.fillStyle=ne,he.fillText(G,32,41));let _e=new ns(ie);return _e.colorSpace=wt,new qr({map:_e,toneMapped:!1})}function ye(){v.material.map.dispose(),A.material.map.dispose(),y.material.map.dispose(),v.material.dispose(),A.material.dispose(),y.material.dispose(),v.material=de(i,a.labelX),A.material=de(s,a.labelY),y.material=de(r,a.labelZ)}}};var k0=new $t,ph=new O,Fi=class extends _a{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";let e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new Mt(e,3)),this.setAttribute("uv",new Mt(t,2))}applyMatrix4(e){let t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new ls(t,6,1);return this.setAttribute("instanceStart",new wn(i,3,0)),this.setAttribute("instanceEnd",new wn(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new ls(t,6,1);return this.setAttribute("instanceColorStart",new wn(i,3,0)),this.setAttribute("instanceColorEnd",new wn(i,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new zs(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new $t);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),k0.setFromBufferAttribute(t),this.boundingBox.union(k0))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new qt),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let i=this.boundingSphere.center;this.boundingBox.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)ph.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(ph)),ph.fromBufferAttribute(t,r),s=Math.max(s,i.distanceToSquared(ph));this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}};xe.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new Ie},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};gn.line={uniforms:Pa.merge([xe.common,xe.fog,xe.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		float trimSegmentAlpha( const in vec4 start, const in vec4 end ) {

			// compute the interpolation factor needed to trim the segment so it terminates
			// between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column

			// we need different nearEstimate formula for reversed and default depth buffer
			// a is positive with a reversed depth buffer so it can be used for controlling the code flow
			float nearEstimate = ( a > 0.0 ) ? ( - b / ( a + 1.0 ) ) : ( - 0.5 * b / a );

			return ( nearEstimate - start.z ) / ( end.z - start.z );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef USE_DASH

				float lineDistanceStart = dashScale * instanceDistanceStart;
				float lineDistanceEnd = dashScale * instanceDistanceEnd;

			#endif

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( start, end );
					end.xyz = mix( start.xyz, end.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceEnd = mix( lineDistanceStart, lineDistanceEnd, alpha );

					#endif

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( end, start );
					start.xyz = mix( end.xyz, start.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceStart = mix( lineDistanceEnd, lineDistanceStart, alpha );

					#endif

				}

			}

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? lineDistanceStart : lineDistanceEnd;
				vUv = uv;

			#endif

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};var fo=class extends pn{constructor(e){super({type:"LineMaterial",uniforms:Pa.clone(gn.line.uniforms),vertexShader:gn.line.vertexShader,fragmentShader:gn.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}};var Kd=new ht,z0=new O,H0=new O,jt=new ht,Zt=new ht,bi=new ht,Jd=new O,Qd=new tt,Kt=new xa,V0=new O,mh=new $t,gh=new qt,vi=new ht,Mi,$s;function G0(n,e,t){return vi.set(0,0,-e,1).applyMatrix4(n.projectionMatrix),vi.multiplyScalar(1/vi.w),vi.x=$s/t.width,vi.y=$s/t.height,vi.applyMatrix4(n.projectionMatrixInverse),vi.multiplyScalar(1/vi.w),Math.abs(Math.max(vi.x,vi.y))}function dS(n,e){let t=n.matrixWorld,i=n.geometry,s=i.attributes.instanceStart,r=i.attributes.instanceEnd,o=Math.min(i.instanceCount,s.count);for(let a=0,l=o;a<l;a++){Kt.start.fromBufferAttribute(s,a),Kt.end.fromBufferAttribute(r,a),Kt.applyMatrix4(t);let c=new O,h=new O;Mi.distanceSqToSegment(Kt.start,Kt.end,h,c),h.distanceTo(c)<$s*.5&&e.push({point:h,pointOnLine:c,distance:Mi.origin.distanceTo(h),object:n,face:null,faceIndex:a,uv:null,uv1:null})}}function fS(n,e,t){let i=e.projectionMatrix,r=n.material.resolution,o=n.matrixWorld,a=n.geometry,l=a.attributes.instanceStart,c=a.attributes.instanceEnd,h=Math.min(a.instanceCount,l.count),u=-e.near;Mi.at(1,bi),bi.w=1,bi.applyMatrix4(e.matrixWorldInverse),bi.applyMatrix4(i),bi.multiplyScalar(1/bi.w),bi.x*=r.x/2,bi.y*=r.y/2,bi.z=0,Jd.copy(bi),Qd.multiplyMatrices(e.matrixWorldInverse,o);for(let d=0,f=h;d<f;d++){if(jt.fromBufferAttribute(l,d),Zt.fromBufferAttribute(c,d),jt.w=1,Zt.w=1,jt.applyMatrix4(Qd),Zt.applyMatrix4(Qd),jt.z>u&&Zt.z>u)continue;if(jt.z>u){let E=jt.z-Zt.z,b=(jt.z-u)/E;jt.lerp(Zt,b)}else if(Zt.z>u){let E=Zt.z-jt.z,b=(Zt.z-u)/E;Zt.lerp(jt,b)}jt.applyMatrix4(i),Zt.applyMatrix4(i),jt.multiplyScalar(1/jt.w),Zt.multiplyScalar(1/Zt.w),jt.x*=r.x/2,jt.y*=r.y/2,Zt.x*=r.x/2,Zt.y*=r.y/2,Kt.start.copy(jt),Kt.start.z=0,Kt.end.copy(Zt),Kt.end.z=0;let _=Kt.closestPointToPointParameter(Jd,!0);Kt.at(_,V0);let g=Rn.lerp(jt.z,Zt.z,_),p=g>=-1&&g<=1,x=Jd.distanceTo(V0)<$s*.5;if(p&&x){Kt.start.fromBufferAttribute(l,d),Kt.end.fromBufferAttribute(c,d),Kt.start.applyMatrix4(o),Kt.end.applyMatrix4(o);let E=new O,b=new O;Mi.distanceSqToSegment(Kt.start,Kt.end,b,E),t.push({point:b,pointOnLine:E,distance:Mi.origin.distanceTo(b),object:n,face:null,faceIndex:d,uv:null,uv1:null})}}}var po=class extends at{constructor(e=new Fi,t=new fo({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,s=new Float32Array(2*t.count);for(let o=0,a=0,l=t.count;o<l;o++,a+=2)z0.fromBufferAttribute(t,o),H0.fromBufferAttribute(i,o),s[a]=a===0?0:s[a-1],s[a+1]=s[a]+z0.distanceTo(H0);let r=new ls(s,2,1);return e.setAttribute("instanceDistanceStart",new wn(r,1,0)),e.setAttribute("instanceDistanceEnd",new wn(r,1,1)),this}raycast(e,t){let i=this.material.worldUnits,s=e.camera;if(s===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'),i===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let r=e.params.Line2!==void 0&&e.params.Line2.threshold||0;Mi=e.ray;let o=this.matrixWorld,a=this.geometry,l=this.material;$s=l.linewidth+r,a.boundingSphere===null&&a.computeBoundingSphere(),gh.copy(a.boundingSphere).applyMatrix4(o);let c;if(i)c=$s*.5;else{let u=Math.max(s.near,gh.distanceToPoint(Mi.origin));c=G0(s,u,l.resolution)}if(gh.radius+=c,Mi.intersectsSphere(gh)===!1)return;a.boundingBox===null&&a.computeBoundingBox(),mh.copy(a.boundingBox).applyMatrix4(o);let h;if(i)h=$s*.5;else{let u=Math.max(s.near,mh.distanceToPoint(Mi.origin));h=G0(s,u,l.resolution)}mh.expandByScalar(h),Mi.intersectsBox(mh)!==!1&&(i?dS(this,t):fS(this,s,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Kd),this.material.uniforms.resolution.value.set(Kd.z,Kd.w))}};var _h=class extends pi{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new ss;e.deleteAttribute("uv");let t=new kn({side:Bt}),i=new kn,s=new ga(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new at(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new aa(e,i,6),a=new Tt;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);let l=new at(e,mo(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new at(e,mo(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new at(e,mo(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new at(e,mo(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new at(e,mo(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new at(e,mo(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function mo(n){return new ua({color:0,emissive:16777215,emissiveIntensity:n})}var go=n=>{let e=(+n).toFixed(3);return e==="-0.000"?"0.000":e},W0={len:n=>`${go(n)} mm`,area:n=>`${go(n)} mm\xB2`,angle:n=>`${go(n)}\xB0`,point:n=>`(${go(n[0])}, ${go(n[1])}, ${go(n[2])}) mm`},ps={dark:{bgTop:"#4b525c",bgBottom:"#16191d",edge:"#14181d",grid:"#7d8792",gridMajor:"#a3adb8",hemiSky:"#e8eef5",hemiGround:"#2a2622",hover:"#3ea6ff",select:"#ff9d2e",measure:"#ffc94a",section:"#c45a3c",bbox:"#9fc2e6",wire:"#a9b4bf",labelBg:"rgba(22,25,30,0.88)",labelFg:"#f3f6f9"},light:{bgTop:"#fdfdfe",bgBottom:"#cdd5de",edge:"#1b1f24",grid:"#97a1ad",gridMajor:"#6c7886",hemiSky:"#ffffff",hemiGround:"#8d8a86",hover:"#0b7be0",select:"#e86a00",measure:"#c2410c",section:"#b4442b",bbox:"#2f5f8f",wire:"#55606c",labelBg:"rgba(255,255,255,0.94)",labelFg:"#15191e"}},X0={color:"#a9b1ba",metalness:.6,roughness:.4,opacity:1},Y0={iso:[1,-1,1],front:[0,-1,0],back:[0,1,0],left:[-1,0,0],right:[1,0,0],top:[0,-1e-4,1],bottom:[0,1e-4,-1]},ef={x:[-1,0,0],y:[0,1,0],z:[0,0,-1]},pS={posX:"right",negX:"left",posY:"back",negY:"front",posZ:"top",negZ:"bottom"},mS=["vertex","edge","face"],gS=10,_S=6,xh=128,$0=!1;function xS(){if($0||typeof document>"u")return;$0=!0;let n=document.createElement("style");n.textContent=`
.v3d-labels{position:absolute;left:0;top:0;pointer-events:none;overflow:hidden}
.v3d-label{padding-bottom:7px;pointer-events:none}
.v3d-label.v3d-center{padding-bottom:0}
.v3d-pill{display:block;font:600 12px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  font-variant-numeric:tabular-nums;white-space:pre;padding:3px 8px;border-radius:10px;
  box-shadow:0 1px 3px rgba(0,0,0,.35);border:1px solid var(--v3d-accent,#888);text-align:center}
.v3d-theme-dark .v3d-pill{background:${ps.dark.labelBg};color:${ps.dark.labelFg}}
.v3d-theme-light .v3d-pill{background:${ps.light.labelBg};color:${ps.light.labelFg}}
.v3d-pill.v3d-small{font-weight:500;font-size:11px;padding:1px 6px;border-radius:8px;box-shadow:none}`,document.head.appendChild(n)}function tf(n){return n instanceof Float32Array?n:Float32Array.from(n)}function yS(n){return n instanceof Uint32Array?n:Uint32Array.from(n)}var an=n=>new O(n[0],n[1],n[2]),qs=n=>[n.x,n.y,n.z];function bS(n,e){let t=document.createElement("canvas");t.width=4,t.height=512;let i=t.getContext("2d"),s=i.createLinearGradient(0,0,0,512);s.addColorStop(0,n),s.addColorStop(1,e),i.fillStyle=s,i.fillRect(0,0,4,512);let r=new ns(t);return r.colorSpace=wt,r}function vS(){let n=document.createElement("canvas");n.width=n.height=64;let e=n.getContext("2d");e.beginPath(),e.arc(32,32,26,0,Math.PI*2),e.fillStyle="#ffffff",e.fill(),e.lineWidth=8,e.strokeStyle="rgba(0,0,0,0.55)",e.stroke();let t=new ns(n);return t.colorSpace=wt,t}function MS(n){let e=Math.pow(10,Math.floor(Math.log10(n)));for(let t of[1,2,5,10])if(t*e>=n)return t*e;return 10*e}var yh=class{constructor(e,{theme:t="dark",format:i}={}){xS(),this.container=e,this.format={...W0,...i||{}},this.themeName=ps[t]?t:"dark",this.theme=ps[this.themeName],this._listeners=new Map,this._lineMaterials=new Set,this._clippable=new Set,this._appearance={...X0},this._display={edges:!0,wireframe:!1,xray:!1,grid:!0,axes:!0,bbox:!1},this._section={enabled:!1,axis:"x",offset:0,flip:!1},this._plane=new dn(new O(-1,0,0),0),this._projection="perspective",this._pickKinds=null,this._model=null,this._raf=0,this._anim=null,this._hoverKey="",this._w=1,this._h=1,this._raycaster=new Hs,getComputedStyle(e).position==="static"&&(e.style.position="relative"),e.classList.add("v3d-root",`v3d-theme-${this.themeName}`);let s=new oh({antialias:!0,alpha:!1,stencil:!0,preserveDrawingBuffer:!1});s.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),s.outputColorSpace=wt,s.toneMapping=va,s.toneMappingExposure=1,s.localClippingEnabled=!0,s.autoClear=!1,Object.assign(s.domElement.style,{display:"block",width:"100%",height:"100%",outline:"none",touchAction:"none"}),s.domElement.tabIndex=0,e.appendChild(s.domElement),this.renderer=s,this.css2d=new dh,this.css2d.domElement.className="v3d-labels",e.appendChild(this.css2d.domElement);let r=new pi;this.scene=r;let o=new co(s),a=new _h;this._envTex=o.fromScene(a,.04).texture,a.dispose(),o.dispose(),r.environment=this._envTex,r.environmentIntensity=.6,this._hemi=new fa(this.theme.hemiSky,this.theme.hemiGround,.45),this._hemi.position.set(0,0,1),this._key=new Qr("#ffffff",1.5),this._fill=new Qr("#ffffff",.35),r.add(this._hemi,this._key,this._key.target,this._fill,this._fill.target),this._persp=new Xt(32,1,.1,1e5),this._ortho=new Zn(-1,1,1,-1,.1,1e5),this._persp.up.set(0,0,1),this._ortho.up.set(0,0,1),this._orthoHalfH=50,this.camera=this._persp;let l=new hh(this._persp,s.domElement);l.enableDamping=!0,l.dampingFactor=.14,l.zoomToCursor=!0,l.screenSpacePanning=!0,l.rotateSpeed=.9,l.zoomSpeed=1.1,l.minZoom=.01,l.maxZoom=2e3,l.addEventListener("change",()=>this.requestRender()),l.addEventListener("start",()=>{this._anim=null}),this.controls=l,this.viewHelper=new fh(this._persp,s.domElement),this.viewHelper.setLabelStyle("bold 26px system-ui, sans-serif","#101317",18),this.viewHelper.setLabels("X","Y","Z"),this._gizmoCam=new Zn(-2,2,2,-2,0,4),this._gizmoCam.position.set(0,0,2),this._gizmoCam.updateMatrixWorld(),this._modelGroup=new fn,this._helperGroup=new fn,this._overlayGroup=new fn,this._measureGroup=new fn,r.add(this._modelGroup,this._helperGroup,this._overlayGroup,this._measureGroup),this._dotTex=vS(),this._applyBackground(),this._bindEvents(),this._ro=new ResizeObserver(()=>this.resize()),this._ro.observe(e),this.resize(),this._fitTo(Y0.iso,!1)}on(e,t){return this._listeners.has(e)||this._listeners.set(e,new Set),this._listeners.get(e).add(t),()=>this.off(e,t)}off(e,t){this._listeners.get(e)?.delete(t)}_emit(e,...t){for(let i of this._listeners.get(e)||[])i(...t)}_bindEvents(){let e=this.renderer.domElement,t=null,i=null,s=0,r=a=>({shiftKey:a.shiftKey,ctrlKey:a.ctrlKey,metaKey:a.metaKey,altKey:a.altKey,clientX:a.clientX,clientY:a.clientY}),o=()=>{s=0;let a=i;if(!a||this._disposed)return;let l=this.pick(a.clientX,a.clientY);this._emit("cursor",{point:l?l.point:null,pick:l,clientX:a.clientX,clientY:a.clientY}),this._emit("hover",l,r(a))};this._onPointerDown=a=>{t={x:a.clientX,y:a.clientY,t:performance.now(),button:a.button}},this._onPointerMove=a=>{a.buttons!==0||this._anim||(i=a,s||(s=requestAnimationFrame(o)))},this._onPointerUp=a=>{let l=t;if(t=null,!l||l.button!==0||a.button!==0||Math.hypot(a.clientX-l.x,a.clientY-l.y)>4||this._display.axes&&this._gizmoClick(a.clientX,a.clientY))return;let c=this.pick(a.clientX,a.clientY);this._emit("pick",c,r(a))},this._onPointerLeave=()=>{i=null,this._emit("cursor",{point:null,pick:null}),this._emit("hover",null,{})},e.addEventListener("pointerdown",this._onPointerDown),e.addEventListener("pointermove",this._onPointerMove),e.addEventListener("pointerup",this._onPointerUp),e.addEventListener("pointerleave",this._onPointerLeave),this._cancelHoverRaf=()=>s&&cancelAnimationFrame(s)}_gizmoClick(e,t){let i=this.renderer.domElement,s=i.getBoundingClientRect(),r=s.left+i.offsetWidth-xh,o=s.top+i.offsetHeight-xh,a=(e-r)/xh*2-1,l=-((t-o)/xh)*2+1;if(Math.abs(a)>1||Math.abs(l)>1)return!1;this._raycaster.setFromCamera(new Ie(a,l),this._gizmoCam);let c=this.viewHelper.children.filter(d=>d.isSprite),h=this._raycaster.intersectObjects(c,!1)[0];if(!h)return!1;let u=pS[h.object.userData.type];return u&&this.setView(u,{animate:!0}),!0}requestRender(){this._raf||this._disposed||(this._raf=requestAnimationFrame(e=>this._frame(e)))}_frame(e){this._raf=0,this._anim&&(this._stepAnim(e),this.requestRender()),this.controls.update(),this._renderScene(!0)}_renderScene(e){let t=this.renderer;this._updateLightsAndClip(),t.setRenderTarget(null),t.clear(),t.render(this.scene,this.camera),e&&this._display.axes&&this.viewHelper.render(t),this.css2d.render(this.scene,this.camera)}_updateLightsAndClip(){let e=this.camera;e.updateMatrixWorld();let{center:t,radius:i}=this._sceneSphere(),s=this.controls.target,r=new O(-.45,.75,.6).normalize().applyQuaternion(e.quaternion).multiplyScalar(i*4);this._key.position.copy(s).add(r),this._key.target.position.copy(s);let o=new O(.6,-.4,.5).normalize().applyQuaternion(e.quaternion).multiplyScalar(i*4);this._fill.position.copy(s).add(o),this._fill.target.position.copy(s),this._key.target.updateMatrixWorld(),this._fill.target.updateMatrixWorld();let a=e.position.distanceTo(t),l=Math.max(a-i*1.1,i*.001),c=a+i*1.1;(Math.abs(e.near-l)>1e-9||Math.abs(e.far-c)>1e-9)&&(e.near=l,e.far=c,e.updateProjectionMatrix())}_sceneSphere(){let e=this._model?this._model.sphere:new qt(new O,50),t=e.radius;return this._grid&&this._grid.visible&&(t=Math.max(t,this._grid.userData.halfDiag)),{center:e.center,radius:Math.max(t,.001)}}resize(){if(this._disposed)return;let e=Math.max(1,this.container.clientWidth),t=Math.max(1,this.container.clientHeight);this._w=e,this._h=t,this.renderer.setSize(e,t,!1),this.css2d.setSize(e,t);let i=e/t;this._persp.aspect=i,this._persp.updateProjectionMatrix(),this._setOrthoFrustum();for(let s of this._lineMaterials)s.resolution.set(e,t);this.requestRender()}_setOrthoFrustum(){let e=this._w/this._h,t=this._orthoHalfH;Object.assign(this._ortho,{left:-t*e,right:t*e,top:t,bottom:-t}),this._ortho.updateProjectionMatrix()}setTheme(e){if(ps[e]){if(this.container.classList.remove(`v3d-theme-${this.themeName}`),this.themeName=e,this.theme=ps[e],this.container.classList.add(`v3d-theme-${e}`),this._applyBackground(),this._hemi.color.set(this.theme.hemiSky),this._hemi.groundColor.set(this.theme.hemiGround),this._model){let t=this._model;t.edgeMat.color.set(this.theme.edge),t.capMat.color.set(this.theme.section),t.wire.material.color.set(this.theme.wire),t.hoverFace.material[0].color.set(this.theme.hover),t.hoverEdge.material.color.set(this.theme.hover),t.hoverPts.material.color.set(this.theme.hover),t.selFace.material[0].color.set(this.theme.select),t.selEdge.material.color.set(this.theme.select),t.selPts.material.color.set(this.theme.select),this._buildGrid(),this._buildBBox()}this._emit("theme",e),this.requestRender()}}_applyBackground(){this.scene.background&&this.scene.background.dispose(),this.scene.background=bS(this.theme.bgTop,this.theme.bgBottom)}setModel(e,t={}){this.clearModel();let i=e.mesh,s=tf(i.vertices),r=tf(i.normals),o=yS(i.triangles),a=new Rt;a.setAttribute("position",new mt(s,3)),a.setAttribute("normal",new mt(r,3)),a.setIndex(new mt(o,1)),a.computeBoundingBox(),a.computeBoundingSphere();let l=a.boundingBox.clone(),c=l.getCenter(new O),h=new qt(c.clone(),Math.max(l.getSize(new O).length()/2,.001));Object.assign(this._appearance,X0,t);let u=new kn({polygonOffset:!0,polygonOffsetFactor:1,polygonOffsetUnits:1,side:Kn}),d=new at(a,u);d.name="pieza",this._clippable.add(u);let f=(R,P)=>{let D=new gi({side:R,depthWrite:!1,depthTest:!1,colorWrite:!1,stencilWrite:!0,stencilFunc:eh,stencilFail:P,stencilZFail:P,stencilZPass:P});return this._clippable.add(D),D},m=new fn;for(let[R,P]of[[Bt,xd],[Kn,yd]]){let D=new at(a,f(R,P));D.renderOrder=1,m.add(D)}let _=new kn({color:this.theme.section,metalness:.05,roughness:.85,side:mn,stencilWrite:!0,stencilRef:0,stencilFunc:bd,stencilFail:Ia,stencilZFail:Ia,stencilZPass:Ia}),g=new at(new ks(1,1),_);g.scale.setScalar(h.radius*2.4),g.renderOrder=2,g.onAfterRender=R=>R.clearStencil(),m.add(g),m.visible=!1;let p=new Zr(new zs(a),new Fs({color:this.theme.wire,transparent:!0,opacity:.7}));p.visible=!1,this._clippable.add(p.material);let x=tf(e.edges.positions),E=new Fi;x.length&&E.setPositions(x);let b=this._lineMaterial({color:this.theme.edge,linewidth:1.5});this._clippable.add(b);let M=new po(E,b);M.renderOrder=1,this._modelGroup.add(d,m,p,M);let v=e.topology||{faces:[],edges:[],vertices:[]},A=new Map(v.faces.map(R=>[R.id,R])),y=new Map(v.edges.map(R=>[R.id,R])),w=new Map;for(let R of e.edges.edgeGroups||[])w.set(R.edgeId,{start:R.start,count:R.count,topo:y.get(R.edgeId)||null});for(let R of v.edges)w.has(R.id)||w.set(R.id,{start:0,count:0,topo:R});let L=[...i.faceGroups||[]].sort((R,P)=>R.start-P.start),T=new Map(L.map(R=>[R.faceId,R])),C=v.vertices.map(R=>({id:R.id,p:an(R.p)}));this._model={result:e,geom:a,mesh:d,mat:u,cap:m,capPlane:g,capMat:_,wire:p,edgeLines:M,edgeMat:b,edgePos:x,box:l,sphere:h,faceById:A,edgeById:w,faceGroups:L,faceRange:T,vertices:C},this._buildHighlightObjects(),this._buildGrid(),this._buildBBox(),this._applyAppearance(),this._applyDisplay(),this._applySection(),this.controls.maxDistance=h.radius*60,this.controls.minDistance=h.radius*.001,this._fitTo(this._currentDir(),!1),this._emit("model",e),this.requestRender()}clearModel(){let e=this._model;if(!e)return;this._model=null,this._hoverKey="";let t=i=>{i.traverse(s=>{s.geometry&&s.geometry!==e.geom&&s.geometry.dispose(),s.material&&(Array.isArray(s.material)?s.material:[s.material]).forEach(r=>this._disposeMaterial(r)),s.isCSS2DObject&&s.element.remove()})};for(let i of[this._modelGroup,this._overlayGroup,this._helperGroup])for(let s of[...i.children])i.remove(s),t(s);e.geom.dispose(),this._grid=null,this._bboxGroup=null,this._emit("model",null),this.requestRender()}getModel(){return this._model?this._model.result:null}getFace(e){return this._model?.faceById.get(e)||null}getEdge(e){return this._model?.edgeById.get(e)?.topo||null}getVertex(e){let t=this._model?.vertices.find(i=>i.id===e);return t?{id:t.id,p:qs(t.p)}:null}getModelRadius(){return this._model?this._model.sphere.radius:50}_disposeMaterial(e){this._lineMaterials.delete(e),this._clippable.delete(e),e.dispose()}_lineMaterial(e){let t=new fo({worldUnits:!1,...e});return t.resolution.set(this._w,this._h),this._lineMaterials.add(t),t}setAppearance(e={}){Object.assign(this._appearance,e),this._applyAppearance(),this.requestRender()}_applyAppearance(){let e=this._model;if(!e)return;let t=this._appearance;e.mat.color.set(t.color),e.mat.metalness=t.metalness,e.mat.roughness=t.roughness;let i=this._display.xray,s=i?Math.min(t.opacity??1,.22):t.opacity??1;e.mat.transparent=s<1,e.mat.opacity=s,e.mat.depthWrite=!i,e.mat.needsUpdate=!0}setFormat(e){this.format={...W0,...e||{}},this._model&&this._buildBBox(),this.requestRender()}setDisplay(e={}){Object.assign(this._display,e),this._applyDisplay(),this._applyAppearance(),this.requestRender()}getDisplay(){return{...this._display}}_applyDisplay(){let e=this._display,t=this._model;t&&(t.edgeLines.visible=e.edges,t.edgeMat.depthTest=!e.xray,t.edgeMat.linewidth=e.xray?1.25:1.5,t.mesh.visible=!e.wireframe,t.wire.visible=e.wireframe,t.cap.visible=this._section.enabled&&!e.xray&&!e.wireframe),this._grid&&(this._grid.visible=e.grid),this._bboxGroup&&(this._bboxGroup.visible=e.bbox)}_buildGrid(){this._grid&&(this._helperGroup.remove(this._grid),this._grid.traverse(g=>{g.geometry&&g.geometry.dispose(),g.material&&g.material.dispose()}),this._grid=null);let e=this._model;if(!e)return;let t=e.box.getSize(new O),i=Math.max(t.x,t.y,.001),s=MS(i/4),r=s/5,o=Math.ceil(i*.85/s)*s,a=Math.round((e.box.min.x+e.box.max.x)/2/s)*s,l=Math.round((e.box.min.y+e.box.max.y)/2/s)*s,c=e.box.min.z-e.sphere.radius*.001,h=[],u=[],d=Math.round(2*o/r);for(let g=0;g<=d;g++){let p=-o+g*r;(Math.abs(p/s-Math.round(p/s))<1e-6?u:h).push(a+p,l-o,c,a+p,l+o,c,a-o,l+p,c,a+o,l+p,c)}let f=16,m=(g,p,x)=>{let E=new Ge(p),b=[],M=[],v=(w,L)=>{let T=Math.hypot(w-a,L-l)/o,C=Math.min(1,Math.max(0,(T-.45)/.55));return x*(1-C*C*(3-2*C))};for(let w=0;w<g.length;w+=6)for(let L=0;L<f;L++)for(let T of[L/f,(L+1)/f]){let C=g[w]+(g[w+3]-g[w])*T,R=g[w+1]+(g[w+4]-g[w+1])*T;b.push(C,R,c),M.push(E.r,E.g,E.b,v(C,R))}let A=new Rt;A.setAttribute("position",new Mt(b,3)),A.setAttribute("color",new Mt(M,4));let y=new Zr(A,new Fs({vertexColors:!0,transparent:!0,depthWrite:!1}));return y.renderOrder=-1,y},_=new fn;_.add(m(h,this.theme.grid,.16),m(u,this.theme.gridMajor,.38)),_.userData.halfDiag=Math.hypot(o,o)+Math.hypot(a-e.sphere.center.x,l-e.sphere.center.y),_.userData.step={major:s,minor:r},_.visible=this._display.grid,this._grid=_,this._helperGroup.add(_)}_buildBBox(){this._bboxGroup&&(this._helperGroup.remove(this._bboxGroup),this._bboxGroup.traverse(u=>{u.geometry&&u.geometry.dispose(),u.material&&this._disposeMaterial(u.material),u.isCSS2DObject&&u.element.remove()}),this._bboxGroup=null);let e=this._model;if(!e)return;let{min:t,max:i}=e.box,s=[[t.x,t.y,t.z],[i.x,t.y,t.z],[i.x,i.y,t.z],[t.x,i.y,t.z],[t.x,t.y,i.z],[i.x,t.y,i.z],[i.x,i.y,i.z],[t.x,i.y,i.z]],r=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]],o=[];for(let[u,d]of r)o.push(...s[u],...s[d]);let a=new fn,l=this.createLine(o,{color:this.theme.bbox,width:1,dashed:!0,onTop:!1});a.add(l);let c=e.box.getSize(new O),h=(u,d)=>{let f=this.createLabel(u,d,{anchor:"center",small:!0,color:this.theme.bbox});a.add(f)};h(`X ${this.format.len(c.x)}`,[(t.x+i.x)/2,t.y,t.z]),h(`Y ${this.format.len(c.y)}`,[i.x,(t.y+i.y)/2,t.z]),h(`Z ${this.format.len(c.z)}`,[i.x,t.y,(t.z+i.z)/2]),a.visible=this._display.bbox,this._bboxGroup=a,this._helperGroup.add(a)}setSection(e={}){Object.assign(this._section,e),this._applySection(),this._applyDisplay(),this.requestRender()}getSection(){return{...this._section}}_applySection(){let e=this._section,t=this._model,i=t?t.box.getCenter(new O):new O,s=an(ef[e.axis]||ef.x);e.flip&&s.negate();let r=i.clone(),o=e.axis in ef?e.axis:"x";r[o]+=+e.offset||0,this._plane.setFromNormalAndCoplanarPoint(s,r),t&&(t.capPlane.position.copy(r),t.capPlane.quaternion.setFromUnitVectors(new O(0,0,1),s.clone().negate()));let a=e.enabled?[this._plane]:null;for(let l of this._clippable)l.clippingPlanes=a}_isClipped(e,t=0){return this._section.enabled&&this._plane.distanceToPoint(e)<-t}_currentDir(){return this.camera.position.clone().sub(this.controls.target).normalize()}setView(e,{animate:t=!1}={}){let i=Y0[e];i&&this._fitTo(i,t)}fit({animate:e=!1}={}){this._fitTo(this._currentDir(),e)}_fitTo(e,t){let i=(Array.isArray(e)?an(e):e.clone()).normalize(),s=this._model?this._model.box:new $t(new O(-50,-50,-50),new O(50,50,50)),r=s.getCenter(new O),o=new O(0,0,1).cross(i).normalize(),a=i.clone().cross(o),l=this._w/this._h,c=Math.tan(Rn.degToRad(this._persp.fov/2))/1.12,h=c*l,u=0,d=0,f=0;for(let p=0;p<8;p++){let x=new O(p&1?s.max.x:s.min.x,p&2?s.max.y:s.min.y,p&4?s.max.z:s.min.z).sub(r),E=Math.abs(x.dot(o)),b=Math.abs(x.dot(a)),M=x.dot(i);u=Math.max(u,M+E/h,M+b/c),d=Math.max(d,E),f=Math.max(f,b)}let m=s.getSize(new O).length()/2||1,_=Math.max(f,d/l,.001)*1.25,g={dir:i,target:r,dist:Math.max(u,.001),halfH:_,R:m};t?(this._anim={t0:null,from:this._camState(),to:g,dur:380},this.requestRender()):(this._anim=null,this._applyCamState(g))}_camState(){let e=this.controls.target.clone(),t=this.camera.position.clone().sub(e),i=t.length(),s=this._projection==="orthographic"?this._orthoHalfH/this._ortho.zoom:i*Math.tan(Rn.degToRad(this._persp.fov/2))/1;return{dir:t.normalize(),target:e,dist:i,halfH:s,R:this.getModelRadius()}}_applyCamState(e){if(this._stopInertia(),this.controls.target.copy(e.target),this._projection==="orthographic"){let t=Math.max(e.dist,e.R*4);this._ortho.position.copy(e.target).addScaledVector(e.dir,t),this._ortho.zoom=this._orthoHalfH/e.halfH,this._ortho.updateProjectionMatrix()}else this._persp.position.copy(e.target).addScaledVector(e.dir,e.dist);this.camera.lookAt(e.target),this.controls.update(),this.requestRender()}_stepAnim(e){let t=this._anim;t.t0===null&&(t.t0=e);let i=Math.min(1,(e-t.t0)/t.dur),s=i<.5?4*i*i*i:1-Math.pow(-2*i+2,3)/2,r=new It().setFromUnitVectors(t.from.dir,t.to.dir),o=new It().slerp(r,s),a={dir:t.from.dir.clone().applyQuaternion(o).normalize(),target:t.from.target.clone().lerp(t.to.target,s),dist:t.from.dist+(t.to.dist-t.from.dist)*s,halfH:t.from.halfH*Math.pow(t.to.halfH/t.from.halfH,s),R:t.to.R};this._projection==="perspective"&&(a.dist=t.from.dist*Math.pow(t.to.dist/t.from.dist,s)),i>=1?(this._anim=null,this._applyCamState(t.to)):this._applyCamState(a)}_stopInertia(){let e=this.controls;e._sphericalDelta&&e._sphericalDelta.set(0,0,0),e._panOffset&&e._panOffset.set(0,0,0),"_scale"in e&&(e._scale=1)}setProjection(e){if(e!=="perspective"&&e!=="orthographic"||e===this._projection)return;let t=this.controls.target,i=Math.tan(Rn.degToRad(this._persp.fov/2)),s=this.getModelRadius();if(this._stopInertia(),e==="orthographic"){let r=this._persp.position.clone().sub(t),o=r.length();this._orthoHalfH=Math.max(o*i,.001),this._ortho.zoom=1,this._setOrthoFrustum(),this._ortho.position.copy(t).addScaledVector(r.normalize(),Math.max(o,s*4)),this._ortho.quaternion.copy(this._persp.quaternion),this.camera=this._ortho}else{let r=this._ortho.position.clone().sub(t).normalize(),o=this._orthoHalfH/this._ortho.zoom;this._persp.position.copy(t).addScaledVector(r,o/i),this._persp.quaternion.copy(this._ortho.quaternion),this.camera=this._persp}this._projection=e,this.controls.object=this.camera,this.viewHelper.camera=this.camera,this.camera.lookAt(t),this.controls.update(),this.requestRender()}getProjection(){return this._projection}setPickFilter(e){this._pickKinds=e&&e.length?e.slice():null}projectToScreen(e){let t=this.renderer.domElement.getBoundingClientRect();this.camera.updateMatrixWorld();let i=an(e).project(this.camera),s=i.z>=-1&&i.z<=1&&Math.abs(i.x)<=1&&Math.abs(i.y)<=1,r=an(e);return{x:t.left+(i.x+1)/2*t.width,y:t.top+(1-i.y)/2*t.height,visible:s&&!this._isClipped(r,1e-9)&&this._isVisible(r)}}_occlusionOn(){return!this._display.xray&&!this._display.wireframe}_firstHit(e){this._raycaster.ray.copy(e),this._raycaster.near=0,this._raycaster.far=1/0;let t=this._raycaster.intersectObject(this._model.mesh,!1);for(let i of t)if(!this._isClipped(i.point,this._model.sphere.radius*1e-6))return i;return null}_rayAtNdc(e,t){return this._raycaster.setFromCamera(new Ie(e,t),this.camera),this._raycaster.ray.clone()}_isVisible(e){if(!this._model||!this._occlusionOn())return!0;let t=e.clone().project(this.camera),i=this._rayAtNdc(t.x,t.y),s=e.clone().sub(i.origin).dot(i.direction),r=this._firstHit(i),o=this._model.sphere.radius*.002+s*1e-5;return!r||r.distance>=s-o}pick(e,t,i={}){let s=this._model;if(!s)return null;let r=i.kinds||this._pickKinds||mS,o=this.renderer.domElement.getBoundingClientRect(),a=e-o.left,l=t-o.top;if(a<0||l<0||a>o.width||l>o.height)return null;let c=o.width,h=o.height,u=this.camera;u.updateMatrixWorld();let d=a/c*2-1,f=1-l/h*2,m=new tt().multiplyMatrices(u.projectionMatrix,u.matrixWorldInverse).elements,_=(x,E,b,M)=>{let v=m[3]*x+m[7]*E+m[11]*b+m[15];return v<=1e-12?!1:(M[0]=((m[0]*x+m[4]*E+m[8]*b+m[12])/v+1)/2*c,M[1]=(1-(m[1]*x+m[5]*E+m[9]*b+m[13])/v)/2*h,!0)},g=[0,0],p=s.sphere.radius*1e-6;if(r.includes("vertex")){let x=[];for(let E of s.vertices){if(!_(E.p.x,E.p.y,E.p.z,g))continue;let b=Math.hypot(g[0]-a,g[1]-l);b<=gS&&x.push({v:E,d:b})}x.sort((E,b)=>E.d-b.d);for(let{v:E}of x)if(!(this._isClipped(E.p,p)||!this._isVisible(E.p)))return{kind:"vertex",id:E.id,point:qs(E.p),snapped:!0}}if(r.includes("edge")&&s.edgePos.length){let x=s.edgePos,E=[0,0],b=[0,0],M=[];for(let[v,A]of s.edgeById){let y=1/0,w=-1;for(let L=A.start;L+1<A.start+A.count;L+=2){let T=L*3;if(!_(x[T],x[T+1],x[T+2],E)||!_(x[T+3],x[T+4],x[T+5],b))continue;let C=b[0]-E[0],R=b[1]-E[1],P=C*C+R*R,D=P>0?((a-E[0])*C+(l-E[1])*R)/P:0;D=Math.max(0,Math.min(1,D));let k=Math.hypot(E[0]+D*C-a,E[1]+D*R-l);k<y&&(y=k,w=L)}y<=_S&&M.push({id:v,g:A,d:y,seg:w})}if(M.sort((v,A)=>v.d-A.d),M.length){let v=this._rayAtNdc(d,f);for(let A of M){let y=A.seg*3,w=new O(x[y],x[y+1],x[y+2]),L=new O(x[y+3],x[y+4],x[y+5]),T=new O;if(v.distanceSqToSegment(w,L,null,T),!(this._isClipped(T,p)||!this._isVisible(T)))return{kind:"edge",id:A.id,point:qs(SS(T,A.g.topo)),snapped:!0}}}}if(r.includes("face")){let x=this._firstHit(this._rayAtNdc(d,f));if(x){let E=this._faceGroupOfTriangle(x.faceIndex);if(E){let b=s.faceById.get(E.faceId)||null,M=x.face.normal.clone(),{point:v,normal:A}=ES(x.point,M,b);return{kind:"face",id:E.faceId,point:qs(v),normal:qs(A),snapped:!1}}}}return null}_faceGroupOfTriangle(e){let t=this._model.faceGroups,i=e*3,s=0,r=t.length-1;for(;s<=r;){let o=s+r>>1,a=t[o];if(i<a.start)r=o-1;else if(i>=a.start+a.count)s=o+1;else return a}return null}raycastModel(e,t){if(!this._model)return[];this._raycaster.set(an(e),an(t).normalize()),this._raycaster.near=0,this._raycaster.far=1/0;let i=this._model.mesh,s=Array.isArray(i.material)?i.material:[i.material],r=s.map(a=>a.side);s.forEach(a=>{a.side=mn});let o;try{o=this._raycaster.intersectObject(i,!1)}finally{s.forEach((a,l)=>{a.side=r[l]})}return o.map(a=>({distance:a.distance,point:qs(a.point),normal:qs(a.face.normal),faceId:this._faceGroupOfTriangle(a.faceIndex)?.faceId??null}))}_buildHighlightObjects(){let e=this._model,t=(r,o,a)=>{let l=new Rt;l.setAttribute("position",e.geom.attributes.position),l.setAttribute("normal",e.geom.attributes.normal),l.setIndex(e.geom.index),l.boundingSphere=e.geom.boundingSphere,l.boundingBox=e.geom.boundingBox;let c=new gi({color:r,transparent:!0,opacity:o,depthWrite:!1});this._clippable.add(c);let h=new at(l,[c]);return h.renderOrder=a,h.visible=!1,h},i=(r,o)=>{let a=this._lineMaterial({color:r,linewidth:3.5});this._clippable.add(a);let l=new po(new Fi,a);return l.renderOrder=o,l.visible=!1,l},s=(r,o)=>{let a=new Rt;a.setAttribute("position",new Mt([0,0,0],3));let l=new Bs({color:r,size:11,sizeAttenuation:!1,map:this._dotTex,transparent:!0,alphaTest:.3,depthTest:!1}),c=new Kr(a,l);return c.renderOrder=o,c.visible=!1,c.frustumCulled=!1,c};e.selFace=t(this.theme.select,.45,2),e.hoverFace=t(this.theme.hover,.38,3),e.selEdge=i(this.theme.select,4),e.hoverEdge=i(this.theme.hover,5),e.selPts=s(this.theme.select,10),e.hoverPts=s(this.theme.hover,11),this._overlayGroup.add(e.selFace,e.hoverFace,e.selEdge,e.hoverEdge,e.selPts,e.hoverPts)}_fillOverlay(e,t,i,s){let r=this._model;t.geometry.clearGroups();let o=[],a=[],l=0;for(let d of e)if(d)if(d.kind==="face"){let f=r.faceRange.get(d.id);f&&(t.geometry.addGroup(f.start,f.count,0),l++)}else if(d.kind==="edge"){let f=r.edgeById.get(d.id);if(f)for(let m=f.start*3;m<(f.start+f.count)*3;m++)o.push(r.edgePos[m])}else if(d.kind==="vertex"){let f=r.vertices.find(m=>m.id===d.id);f&&a.push(f.p.x,f.p.y,f.p.z)}else d.kind==="point"&&d.p&&a.push(...d.p);t.visible=l>0;let c=i.geometry,h=new Fi;o.length&&h.setPositions(o),i.geometry=h,c.dispose(),i.visible=o.length>0;let u=s.geometry;s.geometry=new Rt,s.geometry.setAttribute("position",new Mt(a.length?a:[0,0,0],3)),u.dispose(),s.visible=a.length>0}setHighlight(e){let t=this._model;t&&(this._fillOverlay(e||[],t.selFace,t.selEdge,t.selPts),this.requestRender())}setHover(e){let t=this._model;if(!t)return;let i=e?`${e.kind}:${e.id}`:"";i!==this._hoverKey&&(this._hoverKey=i,this._fillOverlay(e?[e]:[],t.hoverFace,t.hoverEdge,t.hoverPts),this.renderer.domElement.style.cursor=e?"crosshair":"",this.requestRender())}createLine(e,{color:t,width:i=2,dashed:s=!1,onTop:r=!0}={}){let o=new Fi;o.setPositions(e);let a=this.getModelRadius(),l=this._lineMaterial({color:t||this.theme.measure,linewidth:i,dashed:s,dashSize:a*.025,gapSize:a*.018,depthTest:!r,transparent:r}),c=new po(o,l);return s&&c.computeLineDistances(),c.renderOrder=r?20:1,c}createMarker(e,{color:t,size:i=9}={}){let s=new Rt;s.setAttribute("position",new Mt(e,3));let r=new Bs({color:t||this.theme.measure,size:i,sizeAttenuation:!1,map:this._dotTex,transparent:!0,alphaTest:.3,depthTest:!1}),o=new Kr(s,r);return o.renderOrder=21,o.frustumCulled=!1,o}createLabel(e,t,{anchor:i="above",small:s=!1,color:r}={}){let o=document.createElement("div");o.className=`v3d-label${i==="center"?" v3d-center":""}`;let a=document.createElement("span");a.className=`v3d-pill${s?" v3d-small":""}`,a.textContent=e,a.style.setProperty("--v3d-accent",r||this.theme.measure),o.appendChild(a);let l=new uh(o);return l.position.copy(an(t)),i==="above"&&l.center.set(.5,1),l.userData.label={text:e,anchor:i,small:s,color:r||null},l}setLabelText(e,t){e.userData.label.text=t,e.element.firstChild.textContent=t,this.requestRender()}addOverlay(e){this._measureGroup.add(e),this.requestRender()}removeOverlay(e){e&&(this._measureGroup.remove(e),e.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&this._disposeMaterial(t.material),t.isCSS2DObject&&t.element.remove()}),this.requestRender())}getExportMesh(){let e=this._model;if(!e)return null;let t=new Rt;t.setAttribute("position",e.geom.attributes.position.clone()),t.setAttribute("normal",e.geom.attributes.normal.clone()),t.setIndex(e.geom.index.clone());let i=this._appearance,s=new kn({color:i.color,metalness:i.metalness,roughness:i.roughness}),r=new at(t,s);return r.name="pieza",r}screenshot(e=1){let t=this.renderer,i=this._w,s=this._h,r=t.capabilities.maxTextureSize||4096,o=Math.max(.1,Math.min(e||1,r/Math.max(i,s))),a=Math.round(i*o),l=Math.round(s*o),c=t.getPixelRatio(),h=document.createElement("canvas");h.width=a,h.height=l;let u=h.getContext("2d");t.setPixelRatio(1),t.setSize(a,l,!1);try{this._renderScene(!1),u.drawImage(t.domElement,0,0)}finally{t.setPixelRatio(c),t.setSize(i,s,!1),this._renderScene(!0)}return this._drawLabels(u,a,l,o),new Promise((d,f)=>{h.toBlob(m=>m?d(m):f(new Error("No se pudo generar la imagen")),"image/png")})}_drawLabels(e,t,i,s){let r=[];this.scene.traverseVisible(a=>{a.isCSS2DObject&&a.userData.label&&r.push(a)});let o=this.theme;for(let a of r){let l=a.getWorldPosition(new O).project(this.camera);if(l.z<-1||l.z>1)continue;let{text:c,anchor:h,small:u,color:d}=a.userData.label,f=(l.x+1)/2*t,m=(1-l.y)/2*i,_=(u?11:12)*s;e.font=`${u?500:600} ${_}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;let g=c.split(`
`),p=_*1.3,E=Math.max(...g.map(A=>e.measureText(A).width))+(u?12:16)*s,b=g.length*p+(u?2:6)*s,M=f-E/2,v=h==="center"?m-b/2:m-b-7*s;e.beginPath(),e.roundRect(M,v,E,b,(u?8:10)*s),e.fillStyle=o.labelBg,e.fill(),e.lineWidth=s,e.strokeStyle=d||o.measure,e.stroke(),e.fillStyle=o.labelFg,e.textAlign="center",e.textBaseline="middle",g.forEach((A,y)=>e.fillText(A,f,v+(u?1:3)*s+p*(y+.5)))}}dispose(){if(this._disposed)return;this.clearModel();for(let t of[...this._measureGroup.children])this.removeOverlay(t);this._disposed=!0,this._raf&&cancelAnimationFrame(this._raf),this._cancelHoverRaf(),this._ro.disconnect();let e=this.renderer.domElement;e.removeEventListener("pointerdown",this._onPointerDown),e.removeEventListener("pointermove",this._onPointerMove),e.removeEventListener("pointerup",this._onPointerUp),e.removeEventListener("pointerleave",this._onPointerLeave),this.controls.dispose(),this.viewHelper.dispose(),this._envTex.dispose(),this._dotTex.dispose(),this.scene.background&&this.scene.background.dispose(),this.renderer.dispose(),e.remove(),this.css2d.domElement.remove(),this.container.classList.remove("v3d-root",`v3d-theme-${this.themeName}`),this._listeners.clear()}};function SS(n,e){if(!e)return n;if(e.type==="line"&&e.start&&e.end){let t=an(e.start),s=an(e.end).clone().sub(t),r=s.lengthSq();if(r===0)return t;let o=Math.max(0,Math.min(1,n.clone().sub(t).dot(s)/r));return t.addScaledVector(s,o)}if(e.type==="circle"&&e.center&&e.normal&&e.radius){let t=an(e.center),i=an(e.normal).normalize(),s=n.clone().sub(t);return s.addScaledVector(i,-s.dot(i)),s.lengthSq()<1e-24?n:t.add(s.setLength(e.radius))}return n}function ES(n,e,t){let i=e.clone().normalize();if(t&&t.type==="plane"&&t.normal&&t.center){let s=an(t.normal).normalize();s.dot(i)<0&&s.negate();let r=an(t.center);return{point:n.clone().addScaledVector(s,-n.clone().sub(r).dot(s)),normal:s}}if(t&&t.type==="cylinder"&&t.axis&&t.radius){let s=an(t.axis.p),r=an(t.axis.d).normalize(),o=n.clone().sub(s),a=o.dot(r),l=o.addScaledVector(r,-a);if(l.lengthSq()>1e-24){let c=l.clone().normalize(),h=s.clone().addScaledVector(r,a).addScaledVector(c,t.radius);return c.dot(i)<0&&c.negate(),{point:h,normal:c}}}return{point:n.clone(),normal:i}}var ki=n=>{let e=(+n).toFixed(3);return e==="-0.000"?"0.000":e},q0={len:n=>`${ki(n)} mm`,area:n=>`${ki(n)} mm\xB2`,angle:n=>`${ki(n)}\xB0`,point:n=>`(${ki(n[0])}, ${ki(n[1])}, ${ki(n[2])}) mm`},AS=["none","inspect","point","distance","angle","radius","area","coords","thickness"],bh=["vertex","edge","face"],j0={none:null,inspect:bh,point:bh,distance:bh,angle:["edge","face"],radius:["edge","face"],area:["face"],coords:bh,thickness:["face"]},nf={inspect:["Pasa el cursor y haz clic en una cara, arista o v\xE9rtice"],point:["Selecciona el primer punto","Selecciona el segundo punto\u2026"],distance:["Selecciona la primera entidad (cara, arista o v\xE9rtice)","Selecciona la segunda entidad\u2026"],angle:["Selecciona una cara plana o una arista recta","Selecciona la segunda cara plana o arista recta\u2026"],radius:["Selecciona una arista circular o una cara cil\xEDndrica, esf\xE9rica o t\xF3rica"],area:["Haz clic en una cara (May\xFAs+clic suma caras)"],coords:["Haz clic en un punto del modelo"],thickness:["Haz clic en una cara para medir el espesor de pared"]},wS={plane:"Plano",cylinder:"Cilindro",cone:"Cono",sphere:"Esfera",torus:"Toro",bspline:"Superficie B-spline"},sf=1e-9,Oa=(n,e)=>[n[0]+e[0],n[1]+e[1],n[2]+e[2]],_n=(n,e)=>[n[0]-e[0],n[1]-e[1],n[2]-e[2]],ni=(n,e)=>[n[0]*e,n[1]*e,n[2]*e],Bi=(n,e)=>n[0]*e[0]+n[1]*e[1]+n[2]*e[2],TS=(n,e)=>[n[1]*e[2]-n[2]*e[1],n[2]*e[0]-n[0]*e[2],n[0]*e[1]-n[1]*e[0]],js=n=>Math.hypot(n[0],n[1],n[2]),Vt=n=>{let e=js(n);return e>0?ni(n,1/e):[0,0,0]},RS=(n,e)=>ni(Oa(n,e),.5),af=n=>n*180/Math.PI,Z0=n=>af(Math.acos(Math.max(-1,Math.min(1,n)))),rf=n=>`(${ki(n[0])}, ${ki(n[1])}, ${ki(n[2])})`;function CS(n){let e=/^(.*\d)(\D*)$/.exec(n);return e?[e[1],e[2]]:[n,""]}function of(n,e){let t=Vt(e.d);return Oa(e.p,ni(t,Bi(_n(n,e.p),t)))}function vh(n){return Vt(n.dir||_n(n.end,n.start))}function K0(n){return n.type==="line"?"L\xEDnea":n.type==="circle"?n.closed?"C\xEDrculo":"Arco":n.type==="ellipse"?"Elipse":n.type==="bspline"?"B-spline":"Curva"}var Mh=class{constructor(e,{kernel:t=null,format:i,onChange:s}={}){this.viewer=e,this.kernel=t,this.format={...q0,...i||{}},this.onChange=s||null,this.tool="none",this._items=[],this._nextId=1,this._pending=[],this._pendingObjs=[],this._area=null,this._inspect=null,this._inspectEnt=null,this._msg=null,this._token=0,this._hl=!1,this._off=[e.on("hover",r=>this._onHover(r)),e.on("pick",(r,o)=>this._onPick(r,o||{})),e.on("model",()=>this._onModel()),e.on("theme",()=>this._redrawAll())],this._onKey=r=>{r.key==="Escape"&&this.cancel()},window.addEventListener("keydown",this._onKey)}setTool(e){if(!AS.includes(e))throw new Error(`Herramienta de medici\xF3n desconocida: ${e}`);return this._resetInteraction(),this.tool=e,this.viewer.setPickFilter(j0[e]),this.viewer.setHover(null),this._refreshHighlight(),this._emit(),this}setFormat(e){this.format={...q0,...e||{}};for(let t of this._items)t.m.text=t.text(),this._draw(t);this._inspect&&this._inspectEnt&&(this._inspect=this._inspectInfo(this._inspectEnt)),this._emit()}list(){return this._items.map(e=>({...e.m}))}remove(e){let t=this._items.findIndex(s=>s.m.id===e);if(t<0)return this;let[i]=this._items.splice(t,1);return this._removeObjs(i.objs),this._area===i&&(this._area=null),this._refreshHighlight(),this._emit(),this}clear(){for(let e of this._items)this._removeObjs(e.objs);return this._items=[],this._area=null,this._refreshHighlight(),this._emit(),this}cancel(){return!this._pending.length&&!this._area&&!this._inspect&&!this._msg?this:(this._resetInteraction(),this._refreshHighlight(),this._emit(),this)}pinInspect(){let e=this._inspect;if(!e)return null;let t=this._inspectEnt,i=()=>this._inspectInfo(t);return{...this._add("inspect",e.title,()=>i().lines.slice(1).join(" \xB7 ")||i().text,e.values,()=>[this.viewer.createMarker(e.point),this.viewer.createLabel(i().lines.slice(0,2).join(`
`),e.point,{small:!0})]).m}}dispose(){this._resetInteraction();for(let e of this._items)this._removeObjs(e.objs);this._items=[],this._refreshHighlight(),this.viewer.setHover(null),this.viewer.setPickFilter(null);for(let e of this._off)e();window.removeEventListener("keydown",this._onKey)}_resetInteraction(){this._token++,this._pending=[],this._removeObjs(this._pendingObjs),this._pendingObjs=[],this._area=null,this._inspect=null,this._inspectEnt=null,this._msg=null}_hint(){if(this._msg)return this._msg;let e=nf[this.tool];return e?e[Math.min(this._pending.length,e.length-1)]:null}_emit(){this.onChange&&this.onChange(this.list(),{hint:this._hint(),inspect:this._inspect})}_refreshHighlight(){let e=this._pending.map(t=>({kind:t.kind,id:t.id}));if(this._area)for(let t of this._area.m.values.faces)e.push({kind:"face",id:t});this._inspect&&e.push({kind:this._inspect.kind,id:this._inspect.id}),!(!e.length&&!this._hl)&&(this._hl=e.length>0,this.viewer.setHighlight(e))}_removeObjs(e){for(let t of e)this.viewer.removeOverlay(t);e.length=0}_add(e,t,i,s,r){let o={m:{id:this._nextId++,tool:e,title:t,text:i(),values:s},text:i,build:r,objs:[]};return this._draw(o),this._items.push(o),this._emit(),o}_draw(e){this._removeObjs(e.objs),e.objs=e.build();for(let t of e.objs)this.viewer.addOverlay(t)}_redrawAll(){for(let t of this._items)this._draw(t);let e=this._pending[0];e&&(this._removeObjs(this._pendingObjs),this._pendingObjs=[this.viewer.createMarker(e.point)],this.viewer.addOverlay(this._pendingObjs[0]))}_onModel(){this._resetInteraction();for(let e of this._items)this._removeObjs(e.objs);this._items=[],this._hl=!1,this._emit()}_entity(e){let t=this.viewer,i=e.kind==="face"?t.getFace(e.id):e.kind==="edge"?t.getEdge(e.id):t.getVertex(e.id);return{kind:e.kind,id:e.id,point:e.point.slice(),normal:e.normal?e.normal.slice():null,topo:i}}_accepts(e){let t=this.tool;if(t==="none"||!e)return!1;let i=j0[t];if(i&&!i.includes(e.kind))return!1;if(t==="angle"){let s=e.kind==="face"?this.viewer.getFace(e.id):this.viewer.getEdge(e.id);return!!s&&(e.kind==="face"?s.type==="plane"&&!!s.normal:s.type==="line")}if(t==="radius"){if(e.kind==="edge"){let r=this.viewer.getEdge(e.id);return!!r&&r.type==="circle"&&r.radius>0}let s=this.viewer.getFace(e.id);return!!s&&["cylinder","sphere","torus"].includes(s.type)&&s.radius>0}return!0}_onHover(e){this.tool!=="none"&&this.viewer.setHover(this._accepts(e)?{kind:e.kind,id:e.id}:null)}_onPick(e,t){let i=this.tool;if(i==="none")return;if(i==="inspect"){this._inspectEnt=e?this._entity(e):null,this._inspect=this._inspectEnt?this._inspectInfo(this._inspectEnt):null,this._msg=null,this._refreshHighlight(),this._emit();return}if(!e)return;if(!this._accepts(e)){this._msg=`Entidad no v\xE1lida. ${nf[i][Math.min(this._pending.length,nf[i].length-1)]}`,this._emit();return}this._msg=null;let s=this._entity(e);if(i==="point"||i==="distance"||i==="angle"){if(!this._pending.length){this._pending=[s],this._pendingObjs=[this.viewer.createMarker(s.point)],this.viewer.addOverlay(this._pendingObjs[0]),this._refreshHighlight(),this._emit();return}let r=this._pending[0];this._pending=[],this._removeObjs(this._pendingObjs),this._refreshHighlight(),i==="point"?this._measurePoints(r,s):i==="angle"?this._measureAngle(r,s):this._measureDistance(r,s);return}i==="radius"?this._measureRadius(s):i==="area"?this._measureArea(s,!!t.shiftKey):i==="coords"?this._measureCoords(s):i==="thickness"&&this._measureThickness(s)}_joinLens(e){let t=e.map(([,r])=>this.format.len(r)),i=t.map(CS),s=i[0][1];return s&&i.every(([r,o])=>o===s&&/^[-+−]?[\d.,\s']+$/.test(r))?e.map(([r],o)=>`${r} ${i[o][0]}`).join(" \xB7 ")+s:e.map(([r],o)=>`${r} ${t[o]}`).join(" \xB7 ")}_dim(e,t,i,{dashed:s=!1}={}){let r=this.viewer;return[r.createLine([...e,...t],{width:2,dashed:s}),r.createMarker([...e,...t]),r.createLabel(i,RS(e,t))]}_measurePoints(e,t){let i=e.point,s=t.point,r=_n(s,i),o=js(r),a=()=>this._joinLens([["\u0394x",r[0]],["\u0394y",r[1]],["\u0394z",r[2]]]);this._add("point","Distancia entre puntos",()=>`${this.format.len(o)} \xB7 ${a()}`,{distance:o,dx:r[0],dy:r[1],dz:r[2],p1:i,p2:s},()=>this._dim(i,s,`${this.format.len(o)}
${a()}`))}async _measureDistance(e,t){let i=m=>({kind:m.kind,id:m.id}),s=i(e),r=i(t),o=e.kind==="face"&&t.kind==="face"&&e.topo?.type==="plane"&&t.topo?.type==="plane"&&Math.abs(Bi(Vt(e.topo.normal),Vt(t.topo.normal)))>1-sf,a,l=!0;if(this.kernel){let m=this._token;this._msg="Calculando distancia\u2026",this._emit();try{a=await this.kernel.distance(s,r)}catch(_){if(m!==this._token)return;this._msg=`No se pudo calcular la distancia: ${_?.message||_}`,this._emit();return}if(m!==this._token)return;this._msg=null}else l=!1,a={distance:js(_n(t.point,e.point)),p1:e.point,p2:t.point};let{distance:c,p1:h,p2:u}=a,d={distance:c,p1:h,p2:u,parallel:o,exact:l,a:s,b:r};o&&(d.planeDistance=Math.abs(Bi(_n(t.topo.center,e.topo.center),Vt(e.topo.normal))));let f=o?"caras paralelas":l?"":"entre puntos seleccionados";this._add("distance",l?"Distancia m\xEDnima":"Distancia entre puntos seleccionados",()=>`${this.format.len(c)}${f?` \xB7 ${f}`:""}`,d,()=>this._dim(h,u,`${this.format.len(c)}${f?`
${f}`:""}`))}_measureAngle(e,t){let i=e.kind==="face",s=t.kind==="face",r,o,a,l,c={angle:h=>this.format.angle(h)};if(i&&s){let h=Z0(Bi(Vt(e.topo.normal),Vt(t.topo.normal))),u=180-h;r="\xC1ngulo entre caras",o={angle:u,supplement:h},a=()=>`${c.angle(u)}
supl. ${c.angle(h)}`,l=()=>`${c.angle(u)} (suplementario ${c.angle(h)})`}else if(!i&&!s){let h=vh(e.topo),u=vh(t.topo),d=this.viewer.getModelRadius()*1e-9,f=g=>[g.start,g.end];e:for(let[g,p]of f(e.topo).entries())for(let[x,E]of f(t.topo).entries())if(js(_n(p,E))<=d){g===1&&(h=ni(h,-1)),x===1&&(u=ni(u,-1));break e}let m=Z0(Bi(h,u)),_=Math.min(m,180-m);r="\xC1ngulo entre aristas",o={angle:_,angle180:m},a=()=>`${c.angle(_)}
0\u2013180\xB0: ${c.angle(m)}`,l=()=>`${c.angle(_)} (0\u2013180\xB0: ${c.angle(m)})`}else{let h=i?e:t,u=i?t:e,d=af(Math.asin(Math.min(1,Math.abs(Bi(Vt(h.topo.normal),vh(u.topo))))));r="\xC1ngulo entre arista y cara",o={angle:d},a=()=>c.angle(d),l=a}o.a={kind:e.kind,id:e.id},o.b={kind:t.kind,id:t.id},this._add("angle",r,l,o,()=>this._dim(e.point,t.point,a(),{dashed:!0}))}_measureRadius(e){let t=e.topo,i=e.point,s=t.radius,r,o,a=null;if(e.kind==="edge")r=t.center,o=K0(t),t.normal&&(a={p:t.center,d:Vt(t.normal)});else if(t.type==="cylinder")o="Cilindro",a=t.axis,r=of(i,t.axis);else if(t.type==="sphere"){o="Esfera";let c=Vt(e.normal||_n(i,t.center)),h=_n(i,ni(c,s)),u=Oa(i,ni(c,s));r=js(_n(h,t.center))<=js(_n(u,t.center))?h:u}else o="Toro",a=t.axis||null,r=t.axis?of(i,t.axis):t.center;let l=()=>this._joinLens([["R",s],["\xD8",2*s]]);this._add("radius",`Radio (${o})`,()=>`${l()} \xB7 centro ${this.format.point(r)}`,{radius:s,diameter:2*s,center:r,axis:a,point:i,type:t.type,entity:{kind:e.kind,id:e.id}},()=>{let c=this.viewer;return[c.createLine([...r,...i],{width:1.5,dashed:!0}),c.createMarker([...r,...i]),c.createLabel(l(),i)]})}_measureArea(e,t){let i=l=>{l.area=l.faces.reduce((c,h)=>c+(this.viewer.getFace(h)?.area||0),0),l.count=l.faces.length},s=l=>()=>`${this.format.area(l.area)} \xB7 ${l.count} ${l.count===1?"cara":"caras"}`,r=t?this._area:null;if(!r){let l={labelAt:e.point},c={area:0,count:0,faces:[e.id]};i(c),this._area=this._add("area","\xC1rea",s(c),c,()=>[this.viewer.createLabel(`${this.format.area(c.area)}${c.count>1?`
${c.count} caras`:""}`,l.labelAt)]),this._area.st=l,this._refreshHighlight();return}let o=r.m.values,a=o.faces.indexOf(e.id);if(a>=0?o.faces.splice(a,1):o.faces.push(e.id),!o.faces.length){this.remove(r.m.id);return}r.st.labelAt=e.point,i(o),r.m.text=r.text(),this._draw(r),this._refreshHighlight(),this._emit()}_measureCoords(e){let t=e.point,i=()=>this._joinLens([["X",t[0]],["Y",t[1]],["Z",t[2]]]);this._add("coords","Coordenadas",()=>this.format.point(t),{point:t,x:t[0],y:t[1],z:t[2]},()=>[this.viewer.createMarker(t),this.viewer.createLabel(i(),t)])}_measureThickness(e){let t=this.viewer,i=e.point,s=Vt(e.normal||e.topo?.normal||[0,0,1]),r=t.getModelRadius(),o=4*r+1,a=_n(i,ni(s,o)),l=r*.01,c=null;for(let g of t.raycastModel(a,s)){if(g.distance>=o-r*1e-6||g.faceId===e.id&&g.distance>o-l)break;c=g}if(!c){this._msg="No se encontr\xF3 la cara opuesta en esa direcci\xF3n",this._emit();return}let h=o-c.distance,u=Oa(a,ni(s,c.distance)),d="malla",f=e.topo,m=c.faceId!=null?t.getFace(c.faceId):null;if(f&&m&&f.type==="plane"&&m.type==="plane"&&f.normal&&m.normal&&Math.abs(Bi(Vt(f.normal),Vt(m.normal)))>1-sf){let g=Vt(f.normal);h=Math.abs(Bi(_n(m.center,i),g)),u=_n(i,ni(s,h)),d="planos paralelos"}else if(f&&m&&f.type==="cylinder"&&m.type==="cylinder"&&f.axis&&m.axis){let g=Vt(f.axis.d),p=_n(m.axis.p,f.axis.p),x=js(TS(p,g));if(Math.abs(Bi(g,Vt(m.axis.d)))>1-sf&&x<=r*1e-9){let E=of(i,f.axis),b=Vt(_n(i,E));h=Math.abs(f.radius-m.radius),u=Oa(E,ni(b,m.radius)),d="cilindros coaxiales"}}let _=d!=="malla";this._add("thickness","Espesor de pared",()=>`${this.format.len(h)}${_?"":" (aprox. malla)"}`,{thickness:h,p1:i,p2:u,exact:_,method:d,faces:[e.id,c.faceId]},()=>this._dim(i,u,`Espesor ${this.format.len(h)}${_?"":" \u2248"}`))}_inspectInfo(e){let t=this.format,i=e.topo,s={point:e.point},r=[],o,a=i?.type||"other";if(e.kind==="vertex"){a="vertex",o="V\xE9rtice";let l=i?i.p:e.point;s.point=l,r.push(o,t.point(l))}else if(e.kind==="face"){let l=wS[a]||"Superficie";o=`Cara: ${l}`,r.push(l),s.type=a,i?.radius>0&&(s.radius=i.radius,s.diameter=2*i.radius,r.push(this._joinLens([["R",i.radius],["\xD8",2*i.radius]]))),i?.semiAngleDeg!=null&&(s.semiAngleDeg=i.semiAngleDeg,r.push(`Semi\xE1ngulo ${t.angle(i.semiAngleDeg)}`)),a==="plane"&&i?.normal&&(s.normal=Vt(i.normal),r.push(`Normal ${rf(s.normal)}`)),i?.axis&&(s.axis={p:i.axis.p,d:Vt(i.axis.d)},r.push(`Eje ${t.point(i.axis.p)} dir ${rf(s.axis.d)}`)),i?.area!=null&&(s.area=i.area,r.push(`\xC1rea ${t.area(i.area)}`))}else{let l=i?K0(i):"Arista";o=`Arista: ${l}`,r.push(l),s.type=a,i?.radius>0&&(s.radius=i.radius,s.diameter=2*i.radius,r.push(this._joinLens([["R",i.radius],["\xD8",2*i.radius]]))),i?.center&&(s.center=i.center,r.push(`Centro ${t.point(i.center)}`)),a==="circle"&&!i.closed&&i.radius>0&&i.length!=null&&(s.arcAngle=af(i.length/i.radius),r.push(`\xC1ngulo de arco ${t.angle(s.arcAngle)}`)),a==="line"&&(s.dir=vh(i),r.push(`Direcci\xF3n ${rf(s.dir)}`)),i?.length!=null&&(s.length=i.length,r.push(`Longitud ${t.len(i.length)}`))}return s.type=s.type||a,{kind:e.kind,id:e.id,type:a,title:o,text:r.join(" \xB7 "),lines:r,point:s.point,values:s}}};var Mn=2*Math.PI,J0=1e-12,Ua=4096,IS=1e-13,Hn=(n,e)=>(n.meta!==void 0&&(e.meta=n.meta),e),_o=(n,e)=>Math.sqrt(n*n+e*e),ms=(n,e)=>_o(n[0]-e[0],n[1]-e[1]),hf=n=>{let e=n-Mn*Math.floor(n/Mn);return e>=Mn?0:e};function PS(n){let e=hf(n);return e<J0||Mn-e<J0?Mn:e}var gs=n=>n.ccw!==!1;function Cn(n){if(n.type==="circle")return Mn;let[e,t]=n.type==="arc"?[n.a0,n.a1]:[n.t0,n.t1];return PS(gs(n)?t-e:e-t)}function eg(n){let e=n.ctrl.length,t=n.degree;if(!(t>=1)||e<t+1||n.knots.length!==e+t+1||n.weights&&n.weights.length!==e)throw new Error("Spline inv\xE1lida: grado, puntos de control, nudos o pesos inconsistentes")}var Eh=(...n)=>n.every(e=>Number.isFinite(e)),Zs=n=>Array.isArray(n)&&n.length>=2&&Eh(n[0],n[1]);function tg(n){if(!n||typeof n!="object")return"segmento vac\xEDo";switch(n.type){case"line":return Zs(n.p0)&&Zs(n.p1)?null:"l\xEDnea con coordenadas no num\xE9ricas";case"arc":return!Zs(n.c)||!Eh(n.r,n.a0,n.a1)?"arco con datos no num\xE9ricos":n.r>0?null:"arco con radio \u2264 0";case"circle":return!Zs(n.c)||!Eh(n.r)?"c\xEDrculo con datos no num\xE9ricos":n.r>0?null:"c\xEDrculo con radio \u2264 0";case"ellipse":return!Zs(n.c)||!Eh(n.rx,n.ry,n.rot,n.t0,n.t1)?"elipse con datos no num\xE9ricos":n.rx>0&&n.ry>0?null:"elipse con semieje \u2264 0";case"bezier":return Array.isArray(n.pts)&&n.pts.length===4&&n.pts.every(Zs)?null:"B\xE9zier con puntos inv\xE1lidos";case"spline":{let{degree:e,ctrl:t,knots:i,weights:s}=n;if(!Number.isInteger(e)||e<1)return"spline con grado inv\xE1lido";if(!Array.isArray(t)||!t.every(Zs))return"spline con puntos de control inv\xE1lidos";let r=t.length;if(r<e+1)return"spline con menos puntos de control que grado + 1";if(!Array.isArray(i)||i.length!==r+e+1||!i.every(o=>Number.isFinite(o)))return"spline con vector de nudos de longitud incorrecta";for(let o=1;o<i.length;o++)if(i[o]<i[o-1])return"spline con nudos decrecientes";return i[e]<i[r]?s!=null&&(!Array.isArray(s)||s.length!==r||!s.every(o=>Number.isFinite(o)&&o>0))?"spline con pesos inv\xE1lidos":null:"spline con dominio de par\xE1metro vac\xEDo"}default:return`tipo de segmento desconocido (${n.type})`}}function LS(n,e,t,i){if(i>=n[e]){let o=e-1;for(;o>t&&n[o]>=n[o+1];)o--;return o}if(i<=n[t]){let o=t;for(;o<e-1&&n[o+1]<=n[o];)o++;return o}let s=t,r=e;for(;r-s>1;){let o=s+r>>1;i<n[o]?r=o:s=o}return s}function DS(n,e){let{degree:t,ctrl:i,knots:s}=n,r=n.weights,o=i.length,a=LS(s,o,t,e),l=new Array(t+1).fill(0),c=new Array(t+1),h=new Array(t+1);l[0]=1;let u=[1];for(let M=1;M<=t;M++){c[M]=e-s[a+1-M],h[M]=s[a+M]-e;let v=0;for(let A=0;A<M;A++){let y=l[A]/(h[A+1]+c[M-A]);l[A]=v+h[A+1]*y,v=c[M-A]*y}l[M]=v,M===t-1&&(u=l.slice(0,t))}let d=M=>r?r[M]:1,f=0,m=0,_=0;for(let M=0;M<=t;M++){let v=a-t+M,A=l[M]*d(v);f+=A*i[v][0],m+=A*i[v][1],_+=A}let g=0,p=0,x=0;for(let M=0;M<t;M++){let v=a-t+M,A=s[v+t+1]-s[v+1];if(A===0||u[M]===0)continue;let y=u[M]*t/A,w=d(v),L=d(v+1);g+=y*(L*i[v+1][0]-w*i[v][0]),p+=y*(L*i[v+1][1]-w*i[v][1]),x+=y*(L-w)}let E=f/_,b=m/_;return{p:[E,b],d:[(g-x*E)/_,(p-x*b)/_]}}function Si(n){switch(n.type){case"line":case"bezier":return[0,1];case"arc":return[n.a0,n.a0+(gs(n)?1:-1)*Cn(n)];case"circle":return[0,gs(n)?Mn:-Mn];case"ellipse":return[n.t0,n.t0+(gs(n)?1:-1)*Cn(n)];case"spline":return eg(n),[n.knots[n.degree],n.knots[n.ctrl.length]]}throw new Error(`Tipo de segmento desconocido: ${n.type}`)}function Ah(n,e){switch(n.type){case"line":{let t=n.p1[0]-n.p0[0],i=n.p1[1]-n.p0[1];return{p:[n.p0[0]+e*t,n.p0[1]+e*i],d:[t,i]}}case"arc":case"circle":{let t=Math.cos(e),i=Math.sin(e);return{p:[n.c[0]+n.r*t,n.c[1]+n.r*i],d:[-n.r*i,n.r*t]}}case"ellipse":{let t=Math.cos(n.rot),i=Math.sin(n.rot),s=Math.cos(e),r=Math.sin(e),o=n.rx*s,a=n.ry*r,l=-n.rx*r,c=n.ry*s;return{p:[n.c[0]+t*o-i*a,n.c[1]+i*o+t*a],d:[t*l-i*c,i*l+t*c]}}case"bezier":{let[t,i,s,r]=n.pts,o=1-e,a=o*o*o,l=3*o*o*e,c=3*o*e*e,h=e*e*e,u=3*o*o,d=6*o*e,f=3*e*e;return{p:[a*t[0]+l*i[0]+c*s[0]+h*r[0],a*t[1]+l*i[1]+c*s[1]+h*r[1]],d:[u*(i[0]-t[0])+d*(s[0]-i[0])+f*(r[0]-s[0]),u*(i[1]-t[1])+d*(s[1]-i[1])+f*(r[1]-s[1])]}}case"spline":return DS(n,e)}throw new Error(`Tipo de segmento desconocido: ${n.type}`)}var Jt=(n,e)=>Ah(n,e).p;function uf(n){let[e,t]=Si(n);if(n.type==="spline"){let r=n.knots,o=[e];for(let a=n.degree+1;a<=n.ctrl.length;a++)r[a]>o[o.length-1]&&o.push(r[a]);return o}let i=n.type==="ellipse"?Math.max(1,Math.ceil(Math.abs(t-e)/(Math.PI/2)-1e-9)):1,s=[];for(let r=0;r<=i;r++)s.push(r===i?t:e+(t-e)*r/i);return s}function NS(n){let e=[],t=[];for(let i=1;i<=n;i++){let s=Math.cos(Math.PI*(i-.25)/(n+.5)),r=1;for(let o=0;o<100;o++){let a=1,l=0;for(let h=1;h<=n;h++){let u=l;l=a,a=((2*h-1)*s*l-(h-1)*u)/h}r=n*(s*a-l)/(s*s-1);let c=s;if(s=c-a/r,Math.abs(s-c)<=1e-16)break}e.push(s),t.push(2/((1-s*s)*r*r))}return{x:e,w:t}}var Sh=NS(16);function lf(n,e,t,i,s){let r=.5*(s-i),o=.5*(i+s),a=new Float64Array(t),l=new Float64Array(t),c=new Float64Array(t);for(let h=0;h<Sh.x.length;h++){let{p:u,d}=Ah(n,o+r*Sh.x[h]);e(u,d,c);for(let f=0;f<t;f++)a[f]+=Sh.w[h]*c[f]*r,l[f]+=Sh.w[h]*Math.abs(c[f]*r)}return{v:a,ab:l}}function df(n,e,t){let i=uf(n),s=Math.abs(i[i.length-1]-i[0]),r=[],o=new Float64Array(t),a=new Float64Array(t);for(let c=0;c+1<i.length;c++){let h=lf(n,e,t,i[c],i[c+1]);r.push(h);for(let u=0;u<t;u++)o[u]+=h.ab[u]}let l=(c,h,u,d)=>{let f=.5*(c+h),m=lf(n,e,t,c,f),_=lf(n,e,t,f,h),g=d>=50;if(!g){g=!0;for(let p=0;p<t;p++)Math.abs(m.v[p]+_.v[p]-u.v[p])>IS*o[p]*Math.abs(h-c)/s&&(g=!1)}if(g)for(let p=0;p<t;p++)a[p]+=m.v[p]+_.v[p];else l(c,f,m,d+1),l(f,h,_,d+1)};for(let c=0;c<r.length;c++)l(i[c],i[c+1],r[c],0);return a}function Wt(n){switch(n.type){case"line":return n.p0.slice();case"arc":return[n.c[0]+n.r*Math.cos(n.a0),n.c[1]+n.r*Math.sin(n.a0)];case"circle":return[n.c[0]+n.r,n.c[1]];case"ellipse":return Jt(n,n.t0);case"bezier":return n.pts[0].slice()}return Jt(n,Si(n)[0])}function ln(n){switch(n.type){case"line":return n.p1.slice();case"arc":return[n.c[0]+n.r*Math.cos(n.a1),n.c[1]+n.r*Math.sin(n.a1)];case"circle":return[n.c[0]+n.r,n.c[1]];case"ellipse":return Jt(n,n.t1);case"bezier":return n.pts[3].slice()}return Jt(n,Si(n)[1])}function ii(n,e){if(e<=0)return Wt(n);if(e>=1)return ln(n);let[t,i]=Si(n);return Jt(n,t+(i-t)*e)}function ff(n,e){let[t,i]=Si(n),s=i>=t?1:-1,{d:r}=Ah(n,t+(i-t)*e),o=_o(r[0],r[1]);if(o>0)return[s*r[0]/o,s*r[1]/o];let a=1e-6,l=ii(n,Math.max(0,e-a)),c=ii(n,Math.min(1,e+a));return o=ms(l,c)||1,[(c[0]-l[0])/o,(c[1]-l[1])/o]}function ng(n){switch(n.type){case"line":return Hn(n,{type:"line",p0:n.p1.slice(),p1:n.p0.slice()});case"arc":return Hn(n,{type:"arc",c:n.c.slice(),r:n.r,a0:n.a1,a1:n.a0,ccw:!gs(n)});case"circle":return Hn(n,{type:"circle",c:n.c.slice(),r:n.r,ccw:!gs(n)});case"ellipse":return Hn(n,{type:"ellipse",c:n.c.slice(),rx:n.rx,ry:n.ry,rot:n.rot,t0:n.t1,t1:n.t0,ccw:!gs(n)});case"bezier":return Hn(n,{type:"bezier",pts:n.pts.map(e=>e.slice()).reverse()});case"spline":{eg(n);let e=n.knots,t=e[0]+e[e.length-1];return Hn(n,{type:"spline",degree:n.degree,ctrl:n.ctrl.map(i=>i.slice()).reverse(),knots:e.map(i=>t-i).reverse(),weights:n.weights?n.weights.slice().reverse():null})}}throw new Error(`Tipo de segmento desconocido: ${n.type}`)}var OS=(n,e,t)=>{t[0]=_o(e[0],e[1])},ig=(n,e,t)=>{t[0]=.5*(n[0]*e[1]-n[1]*e[0]),t[1]=.5*n[0]*n[0]*e[1],t[2]=-.5*n[1]*n[1]*e[0]};function Fa(n){switch(n.type){case"line":return ms(n.p0,n.p1);case"arc":return n.r*Cn(n);case"circle":return n.r*Mn}return Math.abs(df(n,OS,1)[0])}function sg(n){let[e,t]=Si(n),i=t-e,s=Math.sin(e),r=Math.cos(e),o=Math.abs(Math.abs(i)-Mn)===0;return{D:i,s0:s,c0:r,s1:o?s:Math.sin(t),c1:o?r:Math.cos(t)}}function US(n){switch(n.type){case"line":return .5*(n.p0[0]*n.p1[1]-n.p1[0]*n.p0[1]);case"arc":case"circle":{let{D:e,s0:t,c0:i,s1:s,c1:r}=sg(n),o=n.r;return .5*(n.c[0]*o*(s-t)-n.c[1]*o*(r-i)+o*o*e)}case"ellipse":{let[e,t]=Si(n),i=Wt(n),s=ln(n),r=Cn(n)===Mn,o=r?0:s[0]-i[0],a=r?0:s[1]-i[1];return .5*(n.c[0]*a-n.c[1]*o+n.rx*n.ry*(t-e))}}return df(n,ig,3)[0]}function rg(n){switch(n.type){case"line":{let[t,i]=n.p0,[s,r]=n.p1;return{A:.5*(t*r-s*i),Sx:(r-i)*(t*t+t*s+s*s)/6,Sy:-(s-t)*(i*i+i*r+r*r)/6}}case"arc":case"circle":{let{D:t,s0:i,c0:s,s1:r,c1:o}=sg(n),a=n.r,[l,c]=n.c,h=r-i,u=o-s,d=2*(r*o-i*s);return{A:.5*(l*a*h-c*a*u+a*a*t),Sx:.5*(l*l*a*h+l*a*a*(t+d/2)+a*a*a*(h-(r*r*r-i*i*i)/3)),Sy:.5*(-c*c*a*u+c*a*a*(t-d/2)+a*a*a*(-u+(o*o*o-s*s*s)/3))}}}let e=df(n,ig,3);return{A:n.type==="ellipse"?US(n):e[0],Sx:e[1],Sy:e[2]}}function pf(n,e){let[t,i]=Si(n),s=Math.abs(i-t),r=i>=t?hf(e-t):hf(t-e);return r<=s?r/s:-1}function FS(n,e,t){let i=Math.abs(n)+Math.abs(e)+Math.abs(t);if(Math.abs(n)<=1e-14*i)return e!==0?[-t/e]:[];let s=e*e-4*n*t;if(s<0)return[];let r=-.5*(e+(e>=0?1:-1)*Math.sqrt(s));return r!==0?[r/n,t/r]:[0]}function Ba(n){let e;switch(n.type){case"line":e=[n.p0,n.p1];break;case"circle":return{minX:n.c[0]-n.r,minY:n.c[1]-n.r,maxX:n.c[0]+n.r,maxY:n.c[1]+n.r};case"arc":case"ellipse":{let t=n.type==="arc"?n.r:n.rx,i=n.type==="arc"?n.r:n.ry,s=n.type==="arc"?0:n.rot,r=Math.cos(s),o=Math.sin(s);e=[Wt(n),ln(n)];for(let a of[Math.atan2(-i*o,t*r),Math.atan2(i*r,t*o)])for(let l of[a,a+Math.PI])pf(n,l)>=0&&e.push(Jt(n,l));break}case"bezier":{let[t,i,s,r]=n.pts;e=[t,r];for(let o=0;o<2;o++){let a=-t[o]+3*i[o]-3*s[o]+r[o],l=2*(t[o]-2*i[o]+s[o]),c=i[o]-t[o];for(let h of FS(a,l,c))h>0&&h<1&&e.push(Jt(n,h))}break}case"spline":{let t=Q0(n.ctrl),i=_o(t.maxX-t.minX,t.maxY-t.minY)||1;e=ka(n,i*1e-6);break}default:throw new Error(`Tipo de segmento desconocido: ${n.type}`)}return Q0(e)}function Q0(n){let e=1/0,t=1/0,i=-1/0,s=-1/0;for(let[r,o]of n)r<e&&(e=r),r>i&&(i=r),o<t&&(t=o),o>s&&(s=o);return{minX:e,minY:t,maxX:i,maxY:s}}function cf(n,e,t){let i=t[0]-e[0],s=t[1]-e[1],r=i*i+s*s,o=r>0?((n[0]-e[0])*i+(n[1]-e[1])*s)/r:0;return o=o<0?0:o>1?1:o,_o(n[0]-e[0]-o*i,n[1]-e[1]-o*s)}function ka(n,e){if(!(e>0))throw new Error("La tolerancia de cuerda debe ser positiva");if(n.type==="line")return[n.p0.slice(),n.p1.slice()];let[t,i]=Si(n);if(n.type==="arc"||n.type==="circle"){let h=Math.abs(i-t),u=Math.min(e<2*n.r?4*Math.asin(Math.sqrt(e/(2*n.r))):Math.PI,Math.PI/4),d=Math.min(Ua-1,Math.max(1,Math.ceil(h/u-1e-9))),f=[Wt(n)];for(let m=1;m<d;m++)f.push(Jt(n,t+(i-t)*m/d));return f.push(ln(n)),f}let s=[],r=uf(n),o=n.type==="ellipse"||n.type==="bezier"?4:2;for(let h=0;h+1<r.length;h++)for(let u=0;u<o;u++)s.push(r[h]+(r[h+1]-r[h])*u/o);s.push(i);let a=[Wt(n)],l=(h,u,d,f,m)=>{let _=.5*(h+d),g=Jt(n,_),p=Jt(n,.5*(h+_)),x=Jt(n,.5*(_+d));if(Math.max(cf(g,u,f),cf(p,u,f),cf(x,u,f))<=e||m>=20||a.length>=Ua){a.push(f);return}l(h,u,_,g,m+1),l(_,g,d,f,m+1)};for(let h=0;h+1<s.length;h++)l(s[h],a[a.length-1],s[h+1],h+2===s.length?ln(n):Jt(n,s[h+1]),0);if(a.length<=Ua)return a;let c=[Wt(n)];for(let h=1;h<Ua-1;h++)c.push(Jt(n,t+(i-t)*h/(Ua-1)));return c.push(ln(n)),c}function zi(n,e){let[t,i,s,r,o,a]=e,l=P=>[t*P[0]+s*P[1]+o,i*P[0]+r*P[1]+a];switch(n.type){case"line":return Hn(n,{type:"line",p0:l(n.p0),p1:l(n.p1)});case"bezier":return Hn(n,{type:"bezier",pts:n.pts.map(l)});case"spline":return Hn(n,{type:"spline",degree:n.degree,ctrl:n.ctrl.map(l),knots:n.knots.slice(),weights:n.weights?n.weights.slice():null});case"arc":case"circle":case"ellipse":break;default:throw new Error(`Tipo de segmento desconocido: ${n.type}`)}let c=t*r-i*s,h=t*t+i*i+s*s+r*r;if(!(Math.abs(c)>1e-14*h))throw new Error("Transformaci\xF3n degenerada (determinante nulo)");let u=gs(n);if(n.type!=="ellipse"&&Math.abs(t*t+i*i-s*s-r*r)<=1e-12*h&&Math.abs(t*s+i*r)<=1e-12*h){let P=Math.sqrt(Math.abs(c)),D=Math.atan2(i,t),k=c<0;if(n.type==="circle")return Hn(n,{type:"circle",c:l(n.c),r:n.r*P,ccw:k?!u:u});let V=j=>k?D-j:j+D;return Hn(n,{type:"arc",c:l(n.c),r:n.r*P,a0:V(n.a0),a1:V(n.a1),ccw:k?!u:u})}let d=n.type==="ellipse"?n:{c:n.c,rx:n.r,ry:n.r,rot:0,t0:n.type==="arc"?n.a0:0,t1:n.type==="arc"?n.a1:Mn},f=Math.cos(d.rot),m=Math.sin(d.rot),_=(t*f+s*m)*d.rx,g=(i*f+r*m)*d.rx,p=(-t*m+s*f)*d.ry,x=(-i*m+r*f)*d.ry,E=_*_+g*g,b=p*p+x*x,M=_*p+g*x,v=.5*Math.atan2(2*M,E-b),A=Math.sqrt(.5*(E+b)+_o(.5*(E-b),M)),y=_*x-p*g,w=Math.abs(y)/A,L=Math.cos(v),T=Math.sin(v),C=Math.atan2(g*L+x*T,_*L+p*T),R=P=>y<0?v-P:P-v;return Hn(n,{type:"ellipse",c:l(d.c),rx:A,ry:w,rot:C,t0:R(d.t0),t1:R(d.t1),ccw:y<0?!u:u})}function og(n,e=1e-9){switch(n.type){case"circle":return!0;case"line":return!1;case"arc":case"ellipse":return Cn(n)===Mn}return ms(Wt(n),ln(n))<=e}function xo(n,e){if(n.type==="line"){let C=n.p1[0]-n.p0[0],R=n.p1[1]-n.p0[1],P=C*C+R*R,D=P>0?((e[0]-n.p0[0])*C+(e[1]-n.p0[1])*R)/P:0;D=D<0?0:D>1?1:D;let k=[n.p0[0]+D*C,n.p0[1]+D*R];return{d:ms(e,k),t:D,q:k}}if(n.type==="arc"||n.type==="circle"){let C=e[0]-n.c[0],R=e[1]-n.c[1],P=C===0&&R===0?0:pf(n,Math.atan2(R,C));if(P>=0){let q=P===0?Wt(n):ii(n,P);return{d:ms(e,q),t:P,q}}let D=Wt(n),k=ln(n),V=ms(e,D),j=ms(e,k);return V<=j?{d:V,t:0,q:D}:{d:j,t:1,q:k}}let[t,i]=Si(n),s=uf(n),r=[],o=Math.max(8,Math.ceil(64/(s.length-1)));for(let C=0;C+1<s.length;C++)for(let R=0;R<o;R++)r.push(s[C]+(s[C+1]-s[C])*R/o);r.push(i);let a=C=>{let R=Jt(n,C);return(R[0]-e[0])**2+(R[1]-e[1])**2},l=0,c=1/0;for(let C=0;C<r.length;C++){let R=a(r[C]);R<c&&(c=R,l=C)}let h=r[Math.max(0,l-1)],u=r[Math.min(r.length-1,l+1)];h>u&&([h,u]=[u,h]);let d=(Math.sqrt(5)-1)/2,f=u-d*(u-h),m=h+d*(u-h),_=a(f),g=a(m);for(let C=0;C<80;C++)_<g?(u=m,m=f,g=_,f=u-d*(u-h),_=a(f)):(h=f,f=m,_=g,m=h+d*(u-h),g=a(m));let p=.5*(h+u),x=C=>{let{p:R,d:P}=Ah(n,C);return(R[0]-e[0])*P[0]+(R[1]-e[1])*P[1]},E=Math.min(t,i),b=Math.max(t,i),M=r[Math.max(0,l-1)],v=r[Math.min(r.length-1,l+1)],A=x(M),y=x(v),w=0;if(A*y<0){for(let R=0;R<60&&Math.abs(v-M)>1e-15*(b-E);R++){let P=(M*y-v*A)/(y-A),D=x(P);if(D===0){M=v=P;break}D*y<0?(M=v,A=y,w=0):w===1?A/=2:w=1,v=P,y=D}let C=.5*(M+v);a(C)<=a(p)&&(p=C)}c<a(p)&&(p=r[l]);let L=(p-t)/(i-t),T=L<=0?Wt(n):L>=1?ln(n):Jt(n,p);return{d:ms(e,T),t:L,q:T}}function ag(n){let e=[],t=(i,s)=>e.push({p:i,kind:s});switch(n.type){case"circle":t(n.c.slice(),"center");for(let i=0;i<4;i++)t(Jt(n,i*Math.PI/2),"quadrant");return e;case"arc":case"ellipse":{let i=Cn(n)===Mn;i||(t(Wt(n),"end"),t(ln(n),"end"),t(ii(n,.5),"mid")),t(n.c.slice(),"center");for(let s=0;s<4;s++){let r=s*Math.PI/2;(i||pf(n,r)>=0)&&t(Jt(n,r),"quadrant")}return e}}return t(Wt(n),"end"),t(ln(n),"end"),t(ii(n,.5),"mid"),e}var gf=(n,e)=>Math.hypot(n[0]-e[0],n[1]-e[1]),mf=2*Math.PI;function _f(n){if(!n.length)return null;let e={minX:1/0,minY:1/0,maxX:-1/0,maxY:-1/0};for(let t of n){let i=Ba(t);i.minX<e.minX&&(e.minX=i.minX),i.minY<e.minY&&(e.minY=i.minY),i.maxX>e.maxX&&(e.maxX=i.maxX),i.maxY>e.maxY&&(e.maxY=i.maxY)}return e}function BS(n,e,t){if(n.type!==e.type)return!1;if(n.type==="line")return!0;if(n.type==="arc")return gf(ii(n,.5),ii(e,.5))<=t;for(let i of[.25,.5,.75])if(xo(e,ii(n,i)).d>t)return!1;return xo(n,ii(e,.5)).d<=t}function kS(n,e,t,i,s){if(n.type!==t.type||Math.abs(e.minX-i.minX)>s||Math.abs(e.minY-i.minY)>s||Math.abs(e.maxX-i.maxX)>s||Math.abs(e.maxY-i.maxY)>s)return!1;if(n.type==="circle")return!0;for(let r of[0,.25,.5,.75])if(xo(t,ii(n,r)).d>s)return!1;return!0}function lg(n,{tol:e=1e-6}={}){let t={segments:n.length,duplicatesRemoved:0,zeroLengthRemoved:0,loops:0,openChains:0,junctions:0},i=[],s=[],r=(T,C)=>T+","+C,o=[],a=[];for(let T of n)Fa(T)<=e?t.zeroLengthRemoved++:(og(T,e)?o:a).push(T);let l=new Map,c=[];for(let T of o){let C=Ba(T),R=Math.floor((C.minX+C.maxX)/2/e),P=Math.floor((C.minY+C.maxY)/2/e),D=!1;for(let V=R-1;V<=R+1&&!D;V++)for(let j=P-1;j<=P+1&&!D;j++)for(let q of l.get(r(V,j))||[])kS(T,C,c[q].s,c[q].b,e)&&(D=!0);if(D){t.duplicatesRemoved++;continue}let k=r(R,P);l.has(k)||l.set(k,[]),l.get(k).push(c.length),c.push({s:T,b:C}),i.push({segs:[T]})}let h=new Map,u=[],d=(T,C)=>{let R=Math.floor(T[0]/e),P=Math.floor(T[1]/e),D=-1,k=e;for(let V=R-1;V<=R+1;V++)for(let j=P-1;j<=P+1;j++){let q=h.get(r(V,j));if(q)for(let z of q){let H=gf(u[z].p,T);H<=k&&(k=H,D=z)}}if(D<0){D=u.length,u.push({p:T,fixed:!C,ends:[]});let V=r(R,P);h.has(V)||h.set(V,[]),h.get(V).push(D)}else!C&&!u[D].fixed&&(u[D].p=T,u[D].fixed=!0);return D},f=[],m=new Map;for(let T of a){let C=T.type==="line",R=d(Wt(T),C),P=d(ln(T),C);if(R===P){i.push({segs:[T]});continue}let D=R<P?R+":"+P:P+":"+R,k=m.get(D)||[];if(k.some(V=>BS(T,f[V].s,e))){t.duplicatesRemoved++;continue}k.push(f.length),m.set(D,k),u[R].ends.push(f.length),u[P].ends.push(f.length),f.push({s:T,a:R,b:P,ta:ff(T,0),tb:ff(T,1)})}for(let T of u)T.ends.length>2&&t.junctions++;let _=({e:T,fwd:C})=>{let R=f[T],P=R.s;if(P.type==="line"){let D={type:"line",p0:u[C?R.a:R.b].p.slice(),p1:u[C?R.b:R.a].p.slice()};return P.meta!==void 0&&(D.meta=P.meta),D}return C?P:ng(P)},g=(T,C)=>(C?i:s).push({segs:T.map(_)}),p=new Uint8Array(f.length),x=[],E=u.map(T=>T.ends.length),b=[];for(E.forEach((T,C)=>T===1&&b.push(C));b.length;){let T=b.pop();if(E[T]!==1)continue;let C=u[T].ends.find(D=>!p[D]);p[C]=1,x.push(C);let R=f[C],P=R.a===T?R.b:R.a;E[T]--,--E[P]===1&&b.push(P)}let M=(T,C)=>{let R=-1,P=1/0,D=-1/0;for(let k of u[T].ends){if(p[k])continue;let V=f[k],j=V.a===T?V.ta:[-V.tb[0],-V.tb[1]],q=Math.atan2(C[0]*j[1]-C[1]*j[0],C[0]*j[0]+C[1]*j[1]),z=Math.abs(q);(z<P-1e-9||z<=P+1e-9&&q>D+1e-9)&&(R=k,P=z,D=q)}return R},v=[];for(let T=0;T<f.length;T++)E[f[T].a]<=2&&E[f[T].b]<=2&&v.push(T);for(let T=0;T<f.length;T++)E[f[T].a]<=2&&E[f[T].b]<=2||v.push(T);for(let T of v){if(p[T])continue;let C=[],R=new Map([[f[T].a,0]]),P={e:T,fwd:!0};for(;;){p[P.e]=1,C.push(P);let D=f[P.e],k=P.fwd?D.b:D.a;if(R.has(k)){let q=C.splice(R.get(k));for(let z of q)R.delete(z.fwd?f[z.e].a:f[z.e].b);if(g(q,!0),!C.length)break}R.set(k,C.length);let V=P.fwd?D.tb:[-D.ta[0],-D.ta[1]],j=M(k,V);if(j<0){for(let q of C)x.push(q.e);break}P={e:j,fwd:f[j].a===k}}}let A=new Map,y=new Set,w=new Set(x);for(let T of x)for(let C of[f[T].a,f[T].b])A.set(C,(A.get(C)||0)+1);let L=(T,C)=>{let R=[],P=T,D=C;for(;;){y.add(D);let k=f[D],V=k.a===P;if(R.push({e:D,fwd:V}),P=V?k.b:k.a,P===T||A.get(P)!==2)return{path:R,closed:P===T};if(D=u[P].ends.find(j=>w.has(j)&&!y.has(j)),D===void 0)return{path:R,closed:!1}}};for(let T of x)for(let C of[f[T].a,f[T].b])!y.has(T)&&A.get(C)!==2&&g(L(C,T).path,!1);for(let T of x)if(!y.has(T)){let C=L(f[T].a,T);g(C.path,C.closed)}return t.loops=i.length,t.openChains=s.length,{loops:i,open:s,stats:t}}function zS(n){if(n.length===1){let s=n[0];if(s.type==="circle"||s.type==="arc"&&Cn(s)===mf)return{c:s.c.slice(),r:s.r};if(s.type==="ellipse"&&Cn(s)===mf&&Math.abs(s.rx-s.ry)<=1e-12*s.rx)return{c:s.c.slice(),r:s.rx}}let e=n[0];if(e.type!=="arc")return null;let t=1e-9*e.r+1e-12,i=0;for(let s of n){if(s.type!=="arc"||Math.abs(s.r-e.r)>t||gf(s.c,e.c)>t)return null;i+=(s.ccw!==!1?1:-1)*Cn(s)}return Math.abs(Math.abs(i)-mf)<=1e-9?{c:e.c.slice(),r:e.r}:null}function za(n,e=.01){let t=0,i=0,s=0,r=0,o=[];for(let c of n.segs){let h=rg(c);t+=h.A,i+=h.Sx,s+=h.Sy,r+=Fa(c);let u=ka(c,e);for(let d=o.length?1:0;d<u.length;d++)o.push(u[d])}o.length>1&&o.pop();let a=_f(n.segs),l=t!==0?[i/t,s/t]:[(a.minX+a.maxX)/2,(a.minY+a.maxY)/2];return{area:Math.abs(t),signedArea:t,perimeter:r,centroid:l,bbox:a,circle:zS(n.segs),poly:o}}function xf(n,e){let[t,i]=n,s=!1;for(let r=0,o=e.length-1;r<e.length;o=r++){let[a,l]=e[r],[c,h]=e[o];l>i!=h>i&&t<(c-a)*(i-l)/(h-l)+a&&(s=!s)}return s}function wh(n,{chordTol:e=.01}={}){let t=n.map(a=>za(a,e)),i=n.map(a=>({loop:a,parent:-1,depth:0,children:[]})),s=n.map((a,l)=>l).sort((a,l)=>t[l].area-t[a].area||a-l),r=(a,l)=>a.minX<=l.minX&&a.minY<=l.minY&&a.maxX>=l.maxX&&a.maxY>=l.maxY;for(let a=0;a<s.length;a++){let l=s[a],c=t[l],h=c.poly.length,u=[c.poly[0],c.poly[Math.floor(h/3)],c.poly[Math.floor(2*h/3)]];for(let d=a-1;d>=0;d--){let f=s[d],m=t[f];if(!(!(m.area>c.area)||!r(m.bbox,c.bbox))&&u.filter(_=>xf(_,m.poly)).length>=2){i[l].parent=f,i[l].depth=i[f].depth+1,i[f].children.push(l);break}}}for(let a of i)a.children.sort((l,c)=>l-c);let o=[];return i.forEach((a,l)=>{a.depth%2===0&&o.push({outer:l,holes:a.children.slice()})}),{nodes:i,regions:o}}var Ha=2*Math.PI,Th=10,HS=4,Ei="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",cg={top:"Planta",front:"Alzado",right:"Lateral der.",left:"Lateral izq."},VS={end:"Extremo",mid:"Punto medio",center:"Centro",quadrant:"Cuadrante",nearest:"Cercano"},hg=["end","center","mid","quadrant"],GS=new Set(["","CONTINUOUS","BYLAYER","BYBLOCK"]),Va={dark:{bg:"#16191e",gridMinor:"rgba(255,255,255,0.035)",gridMajor:"rgba(255,255,255,0.085)",fg:"#ffffff",text:"#9aa3ad",label:"#e6edf3",labelBg:"rgba(22,25,30,0.88)",labelBorder:"rgba(255,255,255,0.14)",accent:"#3d8bfd",accentFill:"rgba(61,139,253,0.17)",accentHover:"rgba(61,139,253,0.75)",accentStrong:"#8cc0ff",excl:"#7b8490",exclHatch:"rgba(150,158,168,0.42)",open:"#ff9a2e",measure:"#ffd166",calib:"#e879f9",axis:"#ff6b8b",snap:"#3ddc84",axisX:"rgba(229,83,75,0.55)",axisY:"rgba(87,171,90,0.55)",bar:"#c9d1d9"},light:{bg:"#f7f8fa",gridMinor:"rgba(0,0,0,0.04)",gridMajor:"rgba(0,0,0,0.09)",fg:"#000000",text:"#5f6b78",label:"#1f2328",labelBg:"rgba(255,255,255,0.92)",labelBorder:"rgba(0,0,0,0.16)",accent:"#1f6feb",accentFill:"rgba(31,111,235,0.13)",accentHover:"rgba(31,111,235,0.7)",accentStrong:"#0b4fc2",excl:"#8c959f",exclHatch:"rgba(110,119,129,0.38)",open:"#e8710a",measure:"#b26a00",calib:"#a21caf",axis:"#d6336c",snap:"#108a3e",axisX:"rgba(207,34,46,0.5)",axisY:"rgba(26,127,55,0.5)",bar:"#424a53"}},WS=[null,"#ff0000","#ffff00","#00ff00","#00ffff","#0000ff","#ff00ff",null,"#808080","#c0c0c0"],XS=["#333333","#505050","#696969","#828282","#bebebe","#ffffff"],yo=n=>Math.round(n).toString(16).padStart(2,"0");function yf(n,e="dark"){let t=(Va[e]||Va.dark).fg;if(n=Math.abs(Math.round(n)),n>=1&&n<=9)return WS[n]||t;if(n>=250&&n<=255)return XS[n-250];if(n>=10&&n<=249){let i=(Math.floor(n/10)-1)*15,s=n%10,r=[1,.8,.6,.5,.3][s>>1],o=s&1?.5:1,a=l=>{let c=(l+i/60)%6;return 255*r*(1-o*Math.max(0,Math.min(c,4-c,1)))};return"#"+yo(a(5))+yo(a(3))+yo(a(1))}return t}function ug(n,e){if(e!=="light"||!/^#[0-9a-f]{6}$/i.test(n))return n;let t=parseInt(n.slice(1,3),16),i=parseInt(n.slice(3,5),16),s=parseInt(n.slice(5,7),16),r=(.2126*t+.7152*i+.0722*s)/255;if(r<.7)return n;let o=.55/r;return"#"+yo(t*o)+yo(i*o)+yo(s*o)}function dg(n,e){return typeof n=="string"&&n?ug(n,e):typeof n=="number"?ug(yf(n,e),e):Va[e].fg}function YS(n){let e=Math.pow(10,Math.floor(Math.log10(n))),t=n/e;return(t<=1?1:t<=2?2:t<=5?5:10)*e}function $S(n){let e=Math.pow(10,Math.floor(Math.log10(n))),t=n/e;return(t>=5?5:t>=2?2:1)*e}var Rh=class{constructor(e,t){let i=Math.max(e.maxX-e.minX,1e-9),s=Math.max(e.maxY-e.minY,1e-9),r=Math.min(Math.max(t,1),262144),o=Math.max(Math.sqrt(i*s/r),Math.max(i,s)/512);this.minX=e.minX,this.minY=e.minY,this.cs=o,this.nx=Math.max(1,Math.min(512,Math.ceil(i/o))),this.ny=Math.max(1,Math.min(512,Math.ceil(s/o))),this.cells=new Array(this.nx*this.ny),this.big=[],this.stamp=new Int32Array(t),this.tick=0}_ix(e){return Math.max(0,Math.min(this.nx-1,Math.floor((e-this.minX)/this.cs)))}_iy(e){return Math.max(0,Math.min(this.ny-1,Math.floor((e-this.minY)/this.cs)))}insert(e,t,i,s,r){let o=this._ix(t),a=this._ix(s),l=this._iy(i),c=this._iy(r);if((a-o+1)*(c-l+1)>1024)return void this.big.push(e);for(let h=l;h<=c;h++)for(let u=o;u<=a;u++){let d=u+h*this.nx;(this.cells[d]||(this.cells[d]=[])).push(e)}}query(e,t,i,s,r){let o=++this.tick,a=this.stamp;for(let d of this.big)a[d]!==o&&(a[d]=o,r(d));let l=this._ix(e),c=this._ix(i),h=this._iy(t),u=this._iy(s);for(let d=h;d<=u;d++)for(let f=l;f<=c;f++){let m=this.cells[f+d*this.nx];if(m)for(let _ of m)a[_]!==o&&(a[_]=o,r(_))}}},Ch=class{constructor(e,{theme:t="dark",format:i=null}={}){this.container=e;let s=this.canvas=document.createElement("canvas");s.className="view2d-canvas",s.tabIndex=0,Object.assign(s.style,{display:"block",width:"100%",height:"100%",touchAction:"none",outline:"none"}),e.appendChild(s),this.ctx=s.getContext("2d"),this.mode="select",this._listeners=new Map,this._units="mm",this._format=i,this._w=0,this._h=0,this._dpr=1,this._view={scale:4,tx:0,ty:0},this._fitScale=4,this._measures=[],this._measureSeq=0,this._needFit=!1,this._pending=null,this._calib=null,this._axis=null,this._viewBoxes=[],this._mouse=null,this._snap=null,this._hover=null,this._drag=null,this._touches=new Map,this._pinch=null,this._space=!1,this._lastMiddle=0,this._raf=0,this._hoverDirty=!1,this._clear(),this.setTheme(t),this._bindEvents(),this._ro=typeof ResizeObserver<"u"?new ResizeObserver(()=>this.resize()):null,this._ro&&this._ro.observe(e),this.resize()}setDrawing(e={},t={}){let i=e.segments||[],s=this._layers;this._layers=new Map;let r=(h,u=7,d="")=>{let f=s&&s.get(h),m={name:h,color:u,linetype:String(d||"").toUpperCase(),visible:f?f.visible:!0};return this._layers.set(h,m),m};for(let h of e.layers||[])r(h.name,h.color??7,h.linetype);this._segs=i,this._segLayer=new Array(i.length);let o=this._segBB=new Float64Array(i.length*4),a={minX:1/0,minY:1/0,maxX:-1/0,maxY:-1/0},l=!1;for(let h=0;h<i.length;h++){let u=i[h],d=(u.meta&&u.meta.layer)??"0";this._segLayer[h]=this._layers.get(d)||r(d);let f=Ba(u);o.set([f.minX,f.minY,f.maxX,f.maxY],h*4),f.minX<a.minX&&(a.minX=f.minX),f.minY<a.minY&&(a.minY=f.minY),f.maxX>a.maxX&&(a.maxX=f.maxX),f.maxY>a.maxY&&(a.maxY=f.maxY),fg(u)&&(l=!0)}this._texts=(e.texts||[]).map(h=>({...h,_layer:this._layers.get(h.layer??"0")||r(h.layer??"0")})),i.length||Object.assign(a,{minX:-50,minY:-50,maxX:50,maxY:50}),this._bbox=a,this._o=[(a.minX+a.maxX)/2,(a.minY+a.maxY)/2];let c=Math.hypot(a.maxX-a.minX,a.maxY-a.minY)||1;return this._baseTol=c*2e-4,this._tessLevel=0,this._hasSpline=l,this._loops=t.loops||[],this._infos=t.loopInfos||this._loops.map(h=>za(h,this._baseTol)),this._regions=Array.isArray(t.regions)?t.regions:t.regions&&t.regions.regions||[],this._open=t.open||[],this._regionState=this._regions.map(()=>({included:!0,selected:!1,role:null})),this._outerOf=new Map,this._holeOf=new Map,this._regions.forEach((h,u)=>{this._outerOf.set(h.outer,u);for(let d of h.holes||[])this._holeOf.set(d,u)}),this._loopPaths=[],this._regionPaths=null,this._openPath=null,this._buildBatches(),this._buildIndex(),this._measures=[],this._pending=null,this._calib=null,this._hover=null,this._snap=null,this.fit(),this}setLayerVisible(e,t){let i=this._layers.get(e);return i&&(i.visible=!!t),this._hoverDirty=!0,this._requestRender(),this}setRegionState(e,t={}){let i=this._regionState[e];if(!i)return this;for(let s of["included","selected","role"])s in t&&(i[s]=t[s]);return this._regionPaths=null,this._requestRender(),this}setMode(e){return this.mode=e,this._pending=null,this._drag=null,this._hover=null,this._snap=null,this._hoverDirty=!0,this._updateCursor(),this._requestRender(),this}showAxis(e){if(e){let t=Math.hypot(e.d[0],e.d[1])||1;this._axis={p:e.p.slice(),d:[e.d[0]/t,e.d[1]/t]}}else this._axis=null;return this._requestRender(),this}showViewBoxes(e){return this._viewBoxes=(e||[]).map(t=>({role:t.role,box:{...t.box}})),this._requestRender(),this}removeMeasure(e){let t=this._measures.findIndex(i=>i.id===e);return t<0?!1:(this._measures.splice(t,1),this._requestRender(),!0)}clearMeasures(){return this._measures=[],this._pending=null,this._calib=null,this._requestRender(),this}setTheme(e){if(this.theme=Va[e]?e:"dark",this._th=Va[this.theme],this._hatch=null,this._batches)for(let t of this._batches)t.css=dg(t.color,this.theme);return this._requestRender(),this}setUnitsLabel(e){return this._units=e,this._requestRender(),this}setFormat(e){return this._format=e||null,this._requestRender(),this}formatLength(e){return this._format?this._format(e):`${e.toFixed(3)} ${this._units}`}fit(){let e=this._visibleBBox(),t=36,i=this._w,s=this._h;this._needFit=i<=1||s<=1;let r=Math.max(e.maxX-e.minX,1e-9),o=Math.max(e.maxY-e.minY,1e-9),a=Math.min(Math.max(i-2*t,10)/r,Math.max(s-2*t,10)/o);(!isFinite(a)||a<=0)&&(a=4),this._fitScale=a;let l=(e.minX+e.maxX)/2,c=(e.minY+e.maxY)/2;return this._view={scale:a,tx:i/2-l*a,ty:s/2+c*a},this._hoverDirty=!0,this._requestRender(),this}resize(){let e=this.container.getBoundingClientRect(),t=Math.max(1,Math.round(e.width)),i=Math.max(1,Math.round(e.height)),s=typeof window<"u"&&window.devicePixelRatio||1;if(t===this._w&&i===this._h&&s===this._dpr)return this;let r=this.screenToWorld([this._w/2,this._h/2]),o=this._w===0;return this._w=t,this._h=i,this._dpr=s,this.canvas.width=Math.round(t*s),this.canvas.height=Math.round(i*s),o||this._needFit&&t>1&&i>1?this.fit():(this._view.tx=t/2-r[0]*this._view.scale,this._view.ty=i/2+r[1]*this._view.scale),this.render(),this}on(e,t){return this._listeners.has(e)||this._listeners.set(e,new Set),this._listeners.get(e).add(t),()=>this._listeners.get(e).delete(t)}worldToScreen(e){let{scale:t,tx:i,ty:s}=this._view;return[e[0]*t+i,-e[1]*t+s]}screenToWorld(e){let{scale:t,tx:i,ty:s}=this._view;return[(e[0]-i)/t,(s-e[1])/t]}getTransform(){return{...this._view}}zoomAt(e,t){e=e||[this._w/2,this._h/2];let i=this.screenToWorld(e),s=Math.min(this._fitScale*2e3,Math.max(this._fitScale/50,this._view.scale*t));return this._view={scale:s,tx:e[0]-i[0]*s,ty:e[1]+i[1]*s},this._hoverDirty=!0,this._requestRender(),this}screenshot(){return this.render(),new Promise(e=>this.canvas.toBlob(e,"image/png"))}dispose(){this._raf&&cancelAnimationFrame(this._raf),this._raf=0,this._ro&&this._ro.disconnect();for(let[e,t,i]of this._domListeners)e.removeEventListener(t.type,t.fn,i);this._listeners.clear(),this.canvas.remove()}_clear(){this._segs=[],this._segLayer=[],this._segBB=new Float64Array(0),this._texts=[],this._layers=new Map,this._bbox={minX:-50,minY:-50,maxX:50,maxY:50},this._o=[0,0],this._baseTol=.01,this._tessLevel=0,this._hasSpline=!1,this._loops=[],this._infos=[],this._regions=[],this._regionState=[],this._open=[],this._outerOf=new Map,this._holeOf=new Map,this._loopPaths=[],this._regionPaths=null,this._openPath=null,this._batches=[],this._segGrid=null,this._ptGrid=null}_emit(e,t){let i=this._listeners.get(e);if(i)for(let s of[...i])s(t)}_tol(){return this._baseTol/Math.pow(2,this._tessLevel)}_buildBatches(){let e=new Map;for(let t=0;t<this._segs.length;t++){let i=this._segs[t],s=this._segLayer[t],r=i.meta||{},o=r.color!=null&&r.color!==0&&r.color!==256?r.color:s.color,a=r.dashed!=null?!!r.dashed:!GS.has(s.linetype),l=String(r.linetype||s.linetype||"").toUpperCase(),c=a&&/CENTER|EJE|DASHDOT|PHANTOM/.test(l),h=`${s.name}\0${o}\0${a?c?2:1:0}`,u=e.get(h);u||e.set(h,u={layer:s,color:o,dashed:a,dashDot:c,idx:[],hasSpline:!1,path:null,css:""}),u.idx.push(t),fg(i)&&(u.hasSpline=!0)}this._batches=[...e.values()];for(let t of this._batches)t.css=dg(t.color,this.theme),t.path=this._segsPath(t.idx.map(i=>this._segs[i]))}_segsPath(e){let t=new Path2D,i=this._tol(),s=null;for(let r of e){let o=Wt(r),a=s&&Math.abs(o[0]-s[0])<=1e-9&&Math.abs(o[1]-s[1])<=1e-9;this._appendSeg(t,r,!a,i,o),s=ln(r)}return t}_loopPath(e){let t=this._loopPaths[e];if(!t){t=this._loopPaths[e]=new Path2D;let i=this._tol();this._loops[e].segs.forEach((s,r)=>this._appendSeg(t,s,r===0,i)),t.closePath()}return t}_appendSeg(e,t,i,s,r){let o=this._o[0],a=this._o[1];if(i){let h=r||Wt(t);e.moveTo(h[0]-o,h[1]-a)}let l=t.ccw!==!1;switch(t.type){case"line":e.lineTo(t.p1[0]-o,t.p1[1]-a);return;case"circle":e.arc(t.c[0]-o,t.c[1]-a,t.r,0,l?Ha:-Ha,!l);return;case"arc":{let h=Cn(t);e.arc(t.c[0]-o,t.c[1]-a,t.r,t.a0,t.a0+(l?h:-h),!l);return}case"ellipse":{let h=Cn(t);e.ellipse(t.c[0]-o,t.c[1]-a,t.rx,t.ry,t.rot||0,t.t0,t.t0+(l?h:-h),!l);return}case"bezier":if(t.pts.length===4){let[,h,u,d]=t.pts;e.bezierCurveTo(h[0]-o,h[1]-a,u[0]-o,u[1]-a,d[0]-o,d[1]-a);return}if(t.pts.length===3){let[,h,u]=t.pts;e.quadraticCurveTo(h[0]-o,h[1]-a,u[0]-o,u[1]-a);return}}let c=ka(t,s);for(let h=1;h<c.length;h++)e.lineTo(c[h][0]-o,c[h][1]-a)}_ensureTess(){if(!this._hasSpline)return;let e=.3/(this._view.scale*this._dpr),t=0;for(;this._baseTol/Math.pow(2,t)>e&&t<24;)t++;if(!(t<=this._tessLevel)){this._tessLevel=t;for(let i of this._batches)i.hasSpline&&(i.path=this._segsPath(i.idx.map(s=>this._segs[s])));this._loopPaths=[],this._regionPaths=null,this._openPath=null}}_getRegionPaths(){if(!this._regionPaths){let e=new Path2D,t=new Path2D,i=0,s=0;this._regions.forEach((r,o)=>{let a=this._regionState[o],l=a.included?e:t;a.included?i++:s++;for(let c of[r.outer,...r.holes||[]])l.addPath(this._loopPath(c))}),this._regionPaths={inc:i?e:null,exc:s?t:null}}return this._regionPaths}_getOpenPath(){if(!this._openPath&&this._open.length){let e=this._openPath=new Path2D,t=this._tol();for(let i of this._open)i.segs.forEach((s,r)=>this._appendSeg(e,s,r===0,t))}return this._openPath}_buildIndex(){let e=this._segs.length,t=this._bbox,i=this._segBB;this._segGrid=new Rh(t,e);for(let l=0;l<e;l++)this._segGrid.insert(l,i[4*l],i[4*l+1],i[4*l+2],i[4*l+3]);let s=[],r=[],o=[],a=[];for(let l=0;l<e;l++)for(let c of ag(this._segs[l]))s.push(c.p[0]),r.push(c.p[1]),o.push(hg.indexOf(c.kind)),a.push(l);this._snapPts={xs:Float64Array.from(s),ys:Float64Array.from(r),kinds:Int8Array.from(o),owner:Int32Array.from(a)},this._ptGrid=new Rh(t,s.length);for(let l=0;l<s.length;l++)this._ptGrid.insert(l,s[l],r[l],s[l],r[l])}_visibleBBox(){let e={minX:1/0,minY:1/0,maxX:-1/0,maxY:-1/0},t=this._segBB;for(let i=0;i<this._segs.length;i++)this._segLayer[i].visible&&(t[4*i]<e.minX&&(e.minX=t[4*i]),t[4*i+1]<e.minY&&(e.minY=t[4*i+1]),t[4*i+2]>e.maxX&&(e.maxX=t[4*i+2]),t[4*i+3]>e.maxY&&(e.maxY=t[4*i+3]));return e.minX<=e.maxX?e:this._bbox}_pickLoop(e){let t=-1,i=1/0;return this._infos.forEach((s,r)=>{let o=s.bbox;e[0]<o.minX||e[0]>o.maxX||e[1]<o.minY||e[1]>o.maxY||s.area>=i||xf(e,s.poly)&&(t=r,i=s.area)}),t}_pickSeg(e,t,i){let s=null;if(!this._segGrid)return null;let r=this._segBB;return this._segGrid.query(e[0]-t,e[1]-t,e[0]+t,e[1]+t,o=>{if(!this._segLayer[o].visible||i&&!i(this._segs[o])||e[0]<r[4*o]-t||e[0]>r[4*o+2]+t||e[1]<r[4*o+1]-t||e[1]>r[4*o+3]+t)return;let a=xo(this._segs[o],e);a.d<=t&&(!s||a.d<s.d)&&(s={i:o,q:a.q,d:a.d})}),s}_findSnap(e){if(!this._ptGrid)return null;let t=this.screenToWorld(e),i=Th/this._view.scale,s=this._snapPts,r=null;if(this._ptGrid.query(t[0]-i,t[1]-i,t[0]+i,t[1]+i,a=>{if(!this._segLayer[s.owner[a]].visible)return;let l=Math.hypot(s.xs[a]-t[0],s.ys[a]-t[1]);l>i||(!r||l<r.d-1e-6*i||Math.abs(l-r.d)<=1e-6*i&&s.kinds[a]<r.k)&&(r={d:l,k:s.kinds[a],idx:a})}),r)return{p:[s.xs[r.idx],s.ys[r.idx]],kind:hg[r.k],seg:s.owner[r.idx]};let o=this._pickSeg(t,i);return o?{p:o.q,kind:"nearest",seg:o.i}:null}_bindEvents(){let e=this.canvas;this._domListeners=[];let t=(i,s,r,o)=>{let a={type:s,fn:r.bind(this)};i.addEventListener(s,a.fn,o),this._domListeners.push([i,a,o])};t(e,"pointerdown",this._onDown),t(e,"pointermove",this._onMove),t(e,"pointerup",this._onUp),t(e,"pointercancel",this._onUp),t(e,"pointerleave",this._onLeave),t(e,"wheel",this._onWheel,{passive:!1}),t(e,"contextmenu",i=>i.preventDefault()),t(e,"mousedown",i=>i.button===1&&i.preventDefault()),t(e,"auxclick",i=>i.preventDefault()),t(window,"keydown",this._onKey),t(window,"keyup",this._onKey),t(window,"blur",()=>this._space=!1)}_pt(e){let t=this.canvas.getBoundingClientRect();return[e.clientX-t.left,e.clientY-t.top]}_onKey(e){let t=e.target&&e.target.tagName;if(!(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||e.target&&e.target.isContentEditable))if(e.code==="Space"){let i=e.type==="keydown";if(i&&!this._mouse)return;e.preventDefault(),this._space!==i&&(this._space=i,this._updateCursor())}else e.key==="Escape"&&e.type==="keydown"&&(this._pending||this._drag)&&(this._pending=null,this._drag=null,this._requestRender())}_onDown(e){let t=this._pt(e);if(e.pointerType==="touch"&&(this._touches.set(e.pointerId,t),this._touches.size===2)){let[i,s]=[...this._touches.values()];this._pinch={d:Math.hypot(i[0]-s[0],i[1]-s[1]),m:[(i[0]+s[0])/2,(i[1]+s[1])/2]},this._drag=null;return}if(this.canvas.setPointerCapture?.(e.pointerId),e.button===1){e.preventDefault();let i=performance.now();if(i-this._lastMiddle<400){this._lastMiddle=0,this.fit();return}this._lastMiddle=i}e.button===1||e.button===2||e.button===0&&this._space?(this._drag={kind:"pan",last:t},this._updateCursor()):e.button===0&&(this._drag={kind:this.mode==="window"?"window":"click",start:t,cur:t,moved:!1})}_onMove(e){let t=this._pt(e);if(this._mouse=t,e.pointerType==="touch"&&this._touches.has(e.pointerId)&&(this._touches.set(e.pointerId,t),this._pinch&&this._touches.size===2)){let[s,r]=[...this._touches.values()],o=Math.hypot(s[0]-r[0],s[1]-r[1]),a=[(s[0]+r[0])/2,(s[1]+r[1])/2];this._view.tx+=a[0]-this._pinch.m[0],this._view.ty+=a[1]-this._pinch.m[1],this._pinch.d>0&&this.zoomAt(a,o/this._pinch.d),this._pinch={d:o,m:a};return}let i=this._drag;i&&i.kind==="pan"?(this._view.tx+=t[0]-i.last[0],this._view.ty+=t[1]-i.last[1],i.last=t):i&&(i.cur=t,Math.hypot(t[0]-i.start[0],t[1]-i.start[1])>HS&&(i.moved=!0)),this._hoverDirty=!0,this._requestRender()}_onUp(e){if(e.pointerType==="touch"&&(this._touches.delete(e.pointerId),this._pinch)){this._touches.size<2&&(this._pinch=null);return}let t=this._drag;if(this._drag=null,!t)return;let i=this._pt(e);if(t.kind==="pan")this._updateCursor();else if(t.kind==="window"){if(t.moved){let s=this.screenToWorld(t.start),r=this.screenToWorld(i);this._emit("window",{minX:Math.min(s[0],r[0]),minY:Math.min(s[1],r[1]),maxX:Math.max(s[0],r[0]),maxY:Math.max(s[1],r[1])})}}else!t.moved&&e.type==="pointerup"&&this._click(i,e);this._hoverDirty=!0,this._requestRender()}_onLeave(e){e.pointerType!=="touch"&&(this._mouse=null,this._snap=null,this._hover=null,this._emit("cursor",null),this._requestRender())}_onWheel(e){e.preventDefault();let t=e.deltaMode===1?16:e.deltaMode===2?this._h:1,i=e.ctrlKey?.01:.0015;this.zoomAt(this._pt(e),Math.exp(-e.deltaY*t*i))}_updateCursor(){let e=this._space||this._drag&&this._drag.kind==="pan";this.canvas.style.cursor=e?this._drag?"grabbing":"grab":this.mode==="select"?"default":"crosshair"}_click(e,t){let i=this.screenToWorld(e),s=!!t.shiftKey;switch(this.mode){case"select":{let r=this._pickLoop(i);r>=0&&!this._outerOf.has(r)?this._emit("loopClick",{loopIndex:r,regionIndex:this._holeOf.get(r)??-1,shiftKey:s,p:i}):this._emit("regionClick",{regionIndex:r>=0?this._outerOf.get(r):-1,loopIndex:r,shiftKey:s,p:i});return}case"measure":{if(s&&!this._pending){let a=this._pickSeg(i,Th/this._view.scale,l=>l.type==="circle"||l.type==="arc");if(a){let l=this._segs[a.i],c={id:++this._measureSeq,kind:"radius",r:l.r,diameter:2*l.r,c:l.c.slice(),p:a.q,segIndex:a.i};this._measures.push(c),this._emit("measure",c);return}}let r=this._findSnap(e),o=r?r.p:i;if(!this._pending)this._pending={p:o,kind:r?r.kind:null};else{let a=this._pending.p,l=o[0]-a[0],c=o[1]-a[1],h={id:++this._measureSeq,kind:"distance",p1:a,p2:o,d:Math.hypot(l,c),dx:l,dy:c,angleDeg:Math.atan2(c,l)*180/Math.PI,snap1:this._pending.kind,snap2:r?r.kind:null};this._pending=null,this._measures.push(h),this._emit("measure",h)}return}case"calibrate":{let r=this._findSnap(e),o=r?r.p:i;if(!this._pending)this._pending={p:o,kind:r?r.kind:null};else{let a=this._pending.p;this._calib={p1:a,p2:o,d:Math.hypot(o[0]-a[0],o[1]-a[1])},this._pending=null,this._emit("calibrate",{...this._calib})}return}case"axis":{let r=this._pickSeg(i,Th/this._view.scale,h=>h.type==="line");if(!r)return;let o=this._segs[r.i],a=o.p1[0]-o.p0[0],l=o.p1[1]-o.p0[1],c=Math.hypot(a,l);c>0&&this._emit("axisPick",{p:o.p0.slice(),d:[a/c,l/c],segIndex:r.i});return}}}_updateHover(){this._hoverDirty=!1;let e=this._mouse;if(this._snap=null,this._hover=null,!e||this._drag&&this._drag.kind==="pan")return;let t=this.screenToWorld(e);if(this.mode==="measure"||this.mode==="calibrate")this._snap=this._findSnap(e);else if(this.mode==="select"){let i=this._pickLoop(t);i>=0&&(this._hover={loop:i})}else if(this.mode==="axis"){let i=this._pickSeg(t,Th/this._view.scale,s=>s.type==="line");i&&(this._hover={seg:i.i})}this._emit("cursor",{x:t[0],y:t[1],snap:this._snap?{p:this._snap.p,kind:this._snap.kind}:null})}_requestRender(){this._raf||typeof requestAnimationFrame>"u"||(this._raf=requestAnimationFrame(()=>{this._raf=0,this._hoverDirty&&this._updateHover(),this.render()}))}render(){let e=this.ctx,t=this._th,i=this._dpr,{scale:s,tx:r,ty:o}=this._view;e.setTransform(1,0,0,1,0,0),e.globalAlpha=1,e.setLineDash([]),e.fillStyle=t.bg,e.fillRect(0,0,this.canvas.width,this.canvas.height),e.setTransform(i,0,0,i,0,0),this._drawGrid(),this._drawOrigin(),this._ensureTess();let a=this._o[0],l=this._o[1],c=i*s,h=i*(r+a*s),u=i*(o-l*s);e.setTransform(c,0,0,-c,h,u);let d=1/c,f=1/s;e.lineJoin="round",e.lineCap="butt";let m=this._getRegionPaths();if(m.inc&&(e.fillStyle=t.accentFill,e.fill(m.inc,"evenodd")),m.exc){let p=this._hatchPattern();p.setTransform(new DOMMatrix([1/s,0,0,-1/s,-h/c,u/c])),e.fillStyle=p,e.fill(m.exc,"evenodd"),e.strokeStyle=t.excl,e.lineWidth=1.5*f,e.stroke(m.exc)}for(let p of this._batches)p.layer.visible&&(e.strokeStyle=p.css,e.lineWidth=d,p.dashed&&(e.globalAlpha=.6,e.setLineDash((p.dashDot?[14,4,2,4]:[6,4]).map(x=>x*f))),e.stroke(p.path),p.dashed&&(e.globalAlpha=1,e.setLineDash([])));let _=this._getOpenPath();_&&(e.strokeStyle=t.open,e.lineWidth=1.5*f,e.stroke(_)),this._regions.forEach((p,x)=>{if(this._regionState[x].selected){e.strokeStyle=t.accentStrong,e.lineWidth=2.5*f;for(let E of[p.outer,...p.holes||[]])e.stroke(this._loopPath(E))}});let g=this._hover;if(g&&g.loop!=null){e.strokeStyle=t.accentHover,e.lineWidth=2*f;let p=this._outerOf.get(g.loop),x=p!=null?[g.loop,...this._regions[p].holes||[]]:[g.loop];for(let E of x)e.stroke(this._loopPath(E))}g&&g.seg!=null&&(e.strokeStyle=t.axis,e.lineWidth=3*f,e.stroke(this._segsPath([this._segs[g.seg]]))),e.setTransform(i,0,0,i,0,0),this._drawOpenEnds(),this._drawTexts(),this._drawViewBoxes(),this._drawRoleTags(),this._drawAxis(),this._drawMeasures(),this._drawSnap(),this._drawRubberBand(),this._drawScaleBar()}_hatchPattern(){if(!this._hatch){let e=document.createElement("canvas");e.width=e.height=8;let t=e.getContext("2d");t.strokeStyle=this._th.exclHatch,t.lineWidth=1,t.beginPath(),t.moveTo(-1,9),t.lineTo(9,-1),t.moveTo(-1,1),t.lineTo(1,-1),t.moveTo(7,9),t.lineTo(9,7),t.stroke(),this._hatch=this.ctx.createPattern(e,"repeat")}return this._hatch}_drawGrid(){let e=this.ctx,t=this._th,{scale:i,tx:s,ty:r}=this._view,o=this._w,a=this._h,l=YS(12/i),h=Math.round(l/Math.pow(10,Math.floor(Math.log10(l)+1e-9)))===2?5:10,u=Math.ceil(-s/i/l),d=Math.floor((o-s)/i/l),f=Math.ceil((r-a)/i/l),m=Math.floor(r/i/l),_=new Path2D,g=new Path2D;for(let p=u;p<=d;p++){let x=Math.round(p*l*i+s)+.5,E=p%h===0?g:_;E.moveTo(x,0),E.lineTo(x,a)}for(let p=f;p<=m;p++){let x=Math.round(-p*l*i+r)+.5,E=p%h===0?g:_;E.moveTo(0,x),E.lineTo(o,x)}e.lineWidth=1,e.globalAlpha=Math.min(1,Math.max(0,(l*i-12)/18)),e.strokeStyle=t.gridMinor,e.stroke(_),e.globalAlpha=1,e.strokeStyle=t.gridMajor,e.stroke(g)}_drawOrigin(){let e=this.ctx,t=this._th,[i,s]=this.worldToScreen([0,0]),r=this._w,o=this._h,a=Math.round(i)+.5,l=Math.round(s)+.5;e.lineWidth=1,l>=0&&l<=o&&(e.strokeStyle=t.axisX,e.beginPath(),e.moveTo(0,l),e.lineTo(r,l),e.stroke()),a>=0&&a<=r&&(e.strokeStyle=t.axisY,e.beginPath(),e.moveTo(a,0),e.lineTo(a,o),e.stroke());let c=i>20&&i<r-40&&s>40&&s<o-20,h=c?a:24.5,u=c?l:o-44.5,d=28;e.lineWidth=1.5;let f=(m,_,g,p)=>{e.strokeStyle=e.fillStyle=g,e.globalAlpha=1,e.beginPath(),e.moveTo(h,u),e.lineTo(h+m*d,u+_*d),e.stroke(),e.beginPath(),e.moveTo(h+m*(d+6),u+_*(d+6)),e.lineTo(h+m*d-_*3.5,u+_*d+m*3.5),e.lineTo(h+m*d+_*3.5,u+_*d-m*3.5),e.fill(),e.font=`600 10px ${Ei}`,e.textAlign="center",e.textBaseline="middle",e.fillText(p,h+m*(d+14),u+_*(d+14))};f(1,0,t.axisX.replace(/[\d.]+\)$/,"1)"),"X"),f(0,-1,t.axisY.replace(/[\d.]+\)$/,"1)"),"Y"),e.fillStyle=t.text,e.fillRect(h-2,u-2,4,4)}_drawOpenEnds(){if(!this._open.length)return;let e=this.ctx;e.strokeStyle=this._th.open,e.fillStyle=this._th.bg,e.lineWidth=1.5,e.beginPath();for(let t of this._open)if(t.segs.length)for(let i of[Wt(t.segs[0]),ln(t.segs[t.segs.length-1])]){let[s,r]=this.worldToScreen(i);e.moveTo(s+3.5,r),e.arc(s,r,3.5,0,Ha)}e.fill(),e.stroke()}_drawTexts(){let e=this.ctx,t=this._view.scale,i=this._w,s=this._h;e.fillStyle=this._th.text,e.textAlign="left",e.textBaseline="alphabetic";for(let r of this._texts){let o=(r.h||2.5)*t;if(!r._layer.visible||o<5)continue;let[a,l]=this.worldToScreen(r.p),c=o*String(r.text).length;a<-c||a>i+c||l<-c||l>s+c||(e.save(),e.translate(a,l),r.rot&&e.rotate(-r.rot),e.font=`${o}px ${Ei}`,e.fillText(r.text,0,0),e.restore())}}_pill(e,t,i,{bg:s,fg:r,border:o,font:a=`600 11px ${Ei}`,align:l="left"}={}){let c=this.ctx;c.font=a;let h=Math.ceil(c.measureText(i).width)+10,u=18,d=l==="center"?e-h/2:e;return c.beginPath(),c.roundRect(Math.round(d)+.5,Math.round(t)+.5,h,u,4),c.fillStyle=s,c.fill(),o&&(c.strokeStyle=o,c.lineWidth=1,c.stroke()),c.fillStyle=r,c.textAlign="left",c.textBaseline="middle",c.fillText(i,Math.round(d)+5.5,Math.round(t)+u/2+1),h}_drawViewBoxes(){let e=this.ctx,t=this._th;for(let i of this._viewBoxes){let[s,r]=this.worldToScreen([i.box.minX,i.box.maxY]),[o,a]=this.worldToScreen([i.box.maxX,i.box.minY]);e.strokeStyle=t.accent,e.lineWidth=1.25,e.setLineDash([7,4]),e.strokeRect(Math.round(s)+.5,Math.round(r)+.5,Math.round(o-s),Math.round(a-r)),e.setLineDash([]),this._pill(s,r-22,cg[i.role]||String(i.role),{bg:t.labelBg,fg:t.accent,border:t.accent})}}_drawRoleTags(){let e=this._th;this._regions.forEach((t,i)=>{let s=this._regionState[i].role;if(!s)return;let r=this._infos[t.outer].bbox,[o,a]=this.worldToScreen([r.minX,r.maxY]);this._pill(o+4,a+4,cg[s]||String(s),{bg:e.accent,fg:"#ffffff"})})}_drawAxis(){if(!this._axis)return;let e=this.ctx,t=this._th,{p:i,d:s}=this._axis,[r,o]=this.worldToScreen(i),a=s[0],l=-s[1],c=Math.hypot(this._w,this._h)*2+Math.hypot(r,o);e.strokeStyle=t.axis,e.lineWidth=1.5,e.setLineDash([16,4,3,4]),e.beginPath(),e.moveTo(r-a*c,o-l*c),e.lineTo(r+a*c,o+l*c),e.stroke(),e.setLineDash([]),e.fillStyle=t.axis,e.beginPath(),e.arc(r,o,3.5,0,Ha),e.fill();let h=r+a*34,u=o+l*34;e.beginPath(),e.moveTo(h+a*9,u+l*9),e.lineTo(h-l*4.5,u+a*4.5),e.lineTo(h+l*4.5,u-a*4.5),e.fill(),this._pill(r+8,o+8,"Eje de revoluci\xF3n",{bg:t.labelBg,fg:t.axis,border:t.labelBorder,font:`500 11px ${Ei}`})}_arrow(e,t,i,s,r){let o=this.ctx;o.fillStyle=r,o.beginPath(),o.moveTo(e,t),o.lineTo(e-i*9-s*3,t-s*9+i*3),o.lineTo(e-i*9+s*3,t-s*9-i*3),o.closePath(),o.fill()}_dimension(e,t,i,s,{dashed:r=!1,arrows:o=2}={}){let a=this.ctx,l=this._th,[c,h]=this.worldToScreen(e),[u,d]=this.worldToScreen(t),f=Math.hypot(u-c,d-h),m=f?(u-c)/f:1,_=f?(d-h)/f:0;a.strokeStyle=i,a.lineWidth=1.25,a.setLineDash(r?[5,4]:[]),a.beginPath(),a.moveTo(c,h),a.lineTo(u,d),a.stroke(),a.setLineDash([]),f>26&&!r&&(o>1&&this._arrow(c,h,-m,-_,i),this._arrow(u,d,m,_,i));for(let[L,T]of o>1?[[c,h],[u,d]]:[[u,d]])a.beginPath(),a.moveTo(L-4,T-4),a.lineTo(L+4,T+4),a.moveTo(L-4,T+4),a.lineTo(L+4,T-4),a.stroke();if(!s.length)return;let g=-_,p=m;(p>0||p===0&&g>0)&&(g=-g,p=-p);let x=(c+u)/2+g*16,E=(h+d)/2+p*16;a.font=`600 12px ${Ei}`;let b=a.measureText(s[0]).width;a.font=`11px ${Ei}`;let M=s[1]?a.measureText(s[1]).width:0,v=Math.ceil(Math.max(b,M))+14,A=s[1]?36:20,y=Math.round(x-v/2)+.5,w=Math.round(E-A/2)+.5;a.beginPath(),a.roundRect(y,w,v,A,4),a.fillStyle=l.labelBg,a.fill(),a.strokeStyle=i,a.lineWidth=1,a.stroke(),a.textAlign="center",a.textBaseline="middle",a.fillStyle=l.label,a.font=`600 12px ${Ei}`,a.fillText(s[0],y+v/2,w+10.5),s[1]&&(a.fillStyle=l.text,a.font=`11px ${Ei}`,a.fillText(s[1],y+v/2,w+26))}_distLines(e,t){let i=t[0]-e[0],s=t[1]-e[1],r=Math.atan2(s,i)*180/Math.PI;return[this.formatLength(Math.hypot(i,s)),`\u0394X ${this.formatLength(i)}   \u0394Y ${this.formatLength(s)}   \u2220 ${r.toFixed(2)}\xB0`]}_drawMeasures(){let e=this._th,t=this.ctx;for(let i of this._measures)if(i.kind==="radius"){let[s,r]=this.worldToScreen(i.c);t.strokeStyle=e.measure,t.lineWidth=1.25,t.beginPath(),t.moveTo(s-5,r),t.lineTo(s+5,r),t.moveTo(s,r-5),t.lineTo(s,r+5),t.stroke(),this._dimension(i.c,i.p,e.measure,[`R ${this.formatLength(i.r)}`,`\xD8 ${this.formatLength(i.diameter)}`],{arrows:1})}else this._dimension(i.p1,i.p2,e.measure,this._distLines(i.p1,i.p2));if(this._calib&&this._dimension(this._calib.p1,this._calib.p2,e.calib,[`Calibraci\xF3n: ${this.formatLength(this._calib.d)}`]),this._pending&&this._mouse){let i=this._snap?this._snap.p:this.screenToWorld(this._mouse),s=this.mode==="calibrate"?e.calib:e.measure;this._dimension(this._pending.p,i,s,this._distLines(this._pending.p,i),{dashed:!0})}}_drawSnap(){let e=this._snap;if(!e)return;let t=this.ctx,i=this._th,[s,r]=this.worldToScreen(e.p),o=6;switch(t.strokeStyle=i.snap,t.lineWidth=2,t.beginPath(),e.kind){case"end":t.rect(s-o,r-o,2*o,2*o);break;case"mid":t.moveTo(s,r-o-1),t.lineTo(s+o+1,r+o),t.lineTo(s-o-1,r+o),t.closePath();break;case"center":t.arc(s,r,o,0,Ha);break;case"quadrant":t.moveTo(s,r-o-1),t.lineTo(s+o+1,r),t.lineTo(s,r+o+1),t.lineTo(s-o-1,r),t.closePath();break;default:t.moveTo(s-o,r-o),t.lineTo(s+o,r+o),t.moveTo(s-o,r+o),t.lineTo(s+o,r-o)}t.stroke(),this._pill(s+12,r+10,VS[e.kind],{bg:i.labelBg,fg:i.snap,border:i.labelBorder,font:`500 11px ${Ei}`})}_drawRubberBand(){let e=this._drag;if(!e||e.kind!=="window"||!e.moved)return;let t=this.ctx,i=this._th,s=Math.min(e.start[0],e.cur[0]),r=Math.min(e.start[1],e.cur[1]),o=Math.abs(e.cur[0]-e.start[0]),a=Math.abs(e.cur[1]-e.start[1]);t.fillStyle=i.accentFill,t.fillRect(s,r,o,a),t.strokeStyle=i.accent,t.lineWidth=1,t.setLineDash([5,3]),t.strokeRect(Math.round(s)+.5,Math.round(r)+.5,Math.round(o),Math.round(a)),t.setLineDash([])}_drawScaleBar(){let e=this.ctx,t=this._th,i=this._view.scale,s=$S(120/i),r=s*i,o=Math.round(this._w-24-r)+.5,a=Math.round(this._h-22)+.5;e.strokeStyle=e.fillStyle=t.bar,e.lineWidth=1,e.beginPath(),e.moveTo(o,a-5),e.lineTo(o,a),e.lineTo(o+r,a),e.lineTo(o+r,a-5),e.moveTo(o+r/2,a-3),e.lineTo(o+r/2,a),e.stroke(),e.font=`500 11px ${Ei}`,e.textAlign="center",e.textBaseline="bottom",e.fillText(`${+s.toPrecision(6)} ${this._units}`,o+r/2,a-6)}};function fg(n){return n.type==="spline"||n.type==="bezier"&&n.pts.length!==3&&n.pts.length!==4}var Ih=453.59237,qS=Ih/16,pg=.036127292,bf=2.20462262185/25.4**2,jS=9806.65,ZS=8896.44,KS=4.4482216,JS=.1;function mg({build:n,material:e,profile:t=null,mode:i,thickness:s,pricePerKg:r,blankMargin:o=0,analyticVolume:a,sheetApplicable:l=!0}){let c=n.props,h=e.density,u=c.volume/1e3*h,d=u/1e3,f=h*1e-6,m={};for(let E of["Ixx","Iyy","Izz","Pxy","Pxz","Pyz"])m[E]=(c.inertia?.[E]??0)*f;let _=(c.principal?.moments??[]).map(E=>E*f),g=E=>d>0&&E>=0?Math.sqrt(E/d):0,p=c.bbox.size,x={material:{id:e.id,name:e.name,density:h,uts:e.uts??null,yieldStrength:e.yieldStrength??null,shear:e.shear??null,E:e.E??null},mode:i,mass:{g:u,kg:d,lb:u/Ih},volume:{mm3:c.volume,cm3:c.volume/1e3,in3:c.volume/25.4**3},density:{gcm3:h,kgm3:h*1e3,lbin3:h*pg},area:{mm2:c.area,cm2:c.area/100,in2:c.area/25.4**2},bbox:{size:[...p],min:[...c.bbox.min],max:[...c.bbox.max],diagonal:Math.hypot(...p)},centroid:{centroid:[...c.centroid]},inertia:m,inertiaUnits:{kgmm2:{...m},kgm2:Object.fromEntries(Object.entries(m).map(([E,b])=>[E,b*1e-6])),lbin2:Object.fromEntries(Object.entries(m).map(([E,b])=>[E,b*bf]))},principal:{moments:_,momentsKgm2:_.map(E=>E*1e-6),momentsLbin2:_.map(E=>E*bf),axes:c.principal?.axes??null},gyration:{x:g(m.Ixx),y:g(m.Iyy),z:g(m.Izz),principal:_.map(g)},sheet:null,sheetNote:null,profile:t?{...t}:null,precision:null,cost:null,topology:{counts:c.counts??{},valid:!!c.valid,closed:!!c.closed}};if(i==="extrude"&&t&&s>0&&!l)x.sheetNote="Datos de l\xE1mina no aplican: hay regiones con alturas distintas.";else if(i==="extrude"&&t&&s>0){let E=s,b=t.bbox2d,M=Math.max(0,Number(o)||0),v=b.maxX-b.minX+2*M,A=b.maxY-b.minY+2*M,y=v*A,w=(t.perimeterOuter??0)+(t.perimeterInner??0),L=e.shear??(e.uts!=null?.8*e.uts:null),T=L!=null?w*E*L:null,C=j=>({N:j,kN:j/1e3,tonf:j/jS,uston:j/ZS}),P=(j=>{let q=j*E*h/1e3;return{g:q,kg:q/1e3}})(y),D={g:u,kg:d},k=P.g-D.g,V=(t.holes??[]).filter(j=>j.op==null||j.op==="through");x.sheet={thickness:E,blankWidth:v,blankHeight:A,blankArea:y,netArea:t.netArea,utilization:y>0?t.netArea/y*100:0,cutLength:w,holes:V.length,minHoleDiameter:V.some(j=>Number.isFinite(j.d))?Math.min(...V.filter(j=>Number.isFinite(j.d)).map(j=>j.d)):null,shearStrength:L,cuttingForce:T!=null?C(T):null,strippingForce:T!=null?C(T*JS):null,grossWeight:P,netWeight:D,scrapWeight:{g:k,kg:k/1e3},scrapPct:P.g>0?k/P.g*100:0}}if(a!=null){let E=c.volume-a,b=a!==0?Math.abs(E)/Math.abs(a):0;x.precision={kernelVolume:c.volume,analyticVolume:a,absError:E,relError:b,relErrorPct:b*100}}return r!=null&&r>=0&&(x.cost={pricePerKg:r,netCost:d*r,blankCost:x.sheet?x.sheet.grossWeight.kg*r:null}),x}function _s(n="metric"){let e=n==="imperial",t=s=>Number.isFinite(s),i="\u2014";return{system:n,len:s=>t(s)?e?`${(s/25.4).toFixed(4)} in`:`${s.toFixed(3)} mm`:i,area:s=>t(s)?e?`${(s/25.4**2).toFixed(4)} in\xB2`:Math.abs(s)>=1e4?`${(s/100).toFixed(3)} cm\xB2`:`${s.toFixed(3)} mm\xB2`:i,vol:s=>t(s)?e?`${(s/25.4**3).toFixed(4)} in\xB3`:Math.abs(s)>=1e3?`${(s/1e3).toFixed(3)} cm\xB3`:`${s.toFixed(3)} mm\xB3`:i,mass:s=>t(s)?e?Math.abs(s)>=Ih?`${(s/Ih).toFixed(3)} lb`:`${(s/qS).toFixed(3)} oz`:Math.abs(s)>=1e3?`${(s/1e3).toFixed(3)} kg`:`${s.toFixed(3)} g`:i,density:s=>t(s)?e?`${(s*pg).toFixed(5)} lb/in\xB3`:`${s.toFixed(3)} g/cm\xB3`:i,inertia:s=>{if(!t(s))return i;let r=e?s*bf:s,o=Math.abs(r);return`${o!==0&&(o<.001||o>=1e9)?r.toExponential(4):r.toFixed(3)} ${e?"lb\xB7in\xB2":"kg\xB7mm\xB2"}`},force:s=>t(s)?e?`${(s/KS).toFixed(1)} lbf`:Math.abs(s)>=1e3?`${(s/1e3).toFixed(3)} kN`:`${s.toFixed(1)} N`:i,pct:s=>t(s)?`${s.toFixed(2)} %`:i,angle:s=>t(s)?`${s.toFixed(3)}\xB0`:i,point:s=>{if(!s||!s.every(t))return i;let r=o=>e?(o/25.4).toFixed(4):o.toFixed(3);return`(${s.map(r).join(", ")}) ${e?"in":"mm"}`}}}var NR=(()=>{let n=_s("metric"),e={setSystem(t){n=_s(t)},get system(){return n.system}};for(let t of["len","area","vol","mass","density","inertia","force","pct","angle","point"])e[t]=(...i)=>n[t](...i);return e})(),Fe=(n,e=6)=>n==null||!Number.isFinite(n)?"":String(+n.toPrecision(e));function gg(n,e){let t=(_,g,p,x)=>({l:_,v:g,u:p,s:x??`${g}${p?" "+p:""}`}),[i,s,r]=n.bbox.size,o=[];o.push({title:"Resumen",rows:[t("Masa",Fe(n.mass.g),"g",e.mass(n.mass.g)),t("Masa (kg)",Fe(n.mass.kg),"kg"),t("Masa (lb)",Fe(n.mass.lb),"lb"),t("Volumen",Fe(n.volume.mm3),"mm\xB3",e.vol(n.volume.mm3)),t("Densidad",Fe(n.density.gcm3),"g/cm\xB3",e.density(n.density.gcm3)),t("\xC1rea superficial",Fe(n.area.mm2),"mm\xB2",e.area(n.area.mm2)),t("Caja envolvente",`${Fe(i)} x ${Fe(s)} x ${Fe(r)}`,"mm",`${e.len(i)} \xD7 ${e.len(s)} \xD7 ${e.len(r)}`)]});let a=n.material,l=[t("Material",a.name,"",a.name),t("Densidad",Fe(a.density),"g/cm\xB3",e.density(a.density))];a.uts!=null&&l.push(t("Resistencia a la tracci\xF3n (UTS)",Fe(a.uts),"MPa")),a.yieldStrength!=null&&l.push(t("L\xEDmite de fluencia",Fe(a.yieldStrength),"MPa")),a.shear!=null&&l.push(t("Resistencia al corte",Fe(a.shear),"MPa")),a.E!=null&&l.push(t("M\xF3dulo de elasticidad (E)",Fe(a.E),"GPa")),o.push({title:"Material",rows:l}),o.push({title:"Geometr\xEDa",rows:[t("Volumen (cm\xB3)",Fe(n.volume.cm3),"cm\xB3"),t("Volumen (in\xB3)",Fe(n.volume.in3),"in\xB3"),t("\xC1rea superficial (cm\xB2)",Fe(n.area.cm2),"cm\xB2"),t("\xC1rea superficial (in\xB2)",Fe(n.area.in2),"in\xB2"),t("Dimensi\xF3n X",Fe(i),"mm",e.len(i)),t("Dimensi\xF3n Y",Fe(s),"mm",e.len(s)),t("Dimensi\xF3n Z",Fe(r),"mm",e.len(r)),t("M\xEDnimo de la caja",n.bbox.min.map(_=>Fe(_)).join("; "),"mm",e.point(n.bbox.min)),t("M\xE1ximo de la caja",n.bbox.max.map(_=>Fe(_)).join("; "),"mm",e.point(n.bbox.max)),t("Diagonal de la caja",Fe(n.bbox.diagonal),"mm",e.len(n.bbox.diagonal))]});let c=n.inertia,h=(_,g)=>t(_,Fe(g),"kg\xB7mm\xB2",e.inertia(g));o.push({title:"Centro de masa e inercia",rows:[t("Centro de masa",n.centroid.centroid.map(_=>Fe(_)).join("; "),"mm",e.point(n.centroid.centroid)),h("Ixx (centroide)",c.Ixx),h("Iyy (centroide)",c.Iyy),h("Izz (centroide)",c.Izz),h("Pxy",c.Pxy),h("Pxz",c.Pxz),h("Pyz",c.Pyz),t("Izz (kg\xB7m\xB2)",Fe(n.inertiaUnits.kgm2.Izz),"kg\xB7m\xB2"),t("Izz (lb\xB7in\xB2)",Fe(n.inertiaUnits.lbin2.Izz),"lb\xB7in\xB2"),...n.principal.moments.map((_,g)=>h(`Momento principal I${g+1}`,_)),t("Radio de giro kx",Fe(n.gyration.x),"mm",e.len(n.gyration.x)),t("Radio de giro ky",Fe(n.gyration.y),"mm",e.len(n.gyration.y)),t("Radio de giro kz",Fe(n.gyration.z),"mm",e.len(n.gyration.z))]});let u=n.sheet;if(u){let _=[t("Espesor",Fe(u.thickness),"mm",e.len(u.thickness)),t("Desarrollo (ancho)",Fe(u.blankWidth),"mm",e.len(u.blankWidth)),t("Desarrollo (alto)",Fe(u.blankHeight),"mm",e.len(u.blankHeight)),t("\xC1rea del desarrollo",Fe(u.blankArea),"mm\xB2",e.area(u.blankArea)),t("\xC1rea neta",Fe(u.netArea),"mm\xB2",e.area(u.netArea)),t("Aprovechamiento",Fe(u.utilization),"%",e.pct(u.utilization)),t("Longitud de corte",Fe(u.cutLength),"mm",e.len(u.cutLength)),t("N\xFAmero de agujeros",String(u.holes),""),t("\xD8 m\xEDnimo de agujero",Fe(u.minHoleDiameter),"mm",u.minHoleDiameter==null?"\u2014":e.len(u.minHoleDiameter))];if(u.cuttingForce){let g=u.cuttingForce;_.push(t("Resistencia al corte usada",Fe(u.shearStrength),"MPa"),t("Fuerza de corte",Fe(g.N),"N",e.force(g.N)),t("Fuerza de corte (kN)",Fe(g.kN),"kN"),t("Fuerza de corte (tonf m\xE9tricas)",Fe(g.tonf),"tonf"),t("Fuerza de corte (toneladas cortas EE. UU.)",Fe(g.uston),"ton"),t("Fuerza de extracci\xF3n (estimada, 10 % de F)",Fe(u.strippingForce.N),"N",e.force(u.strippingForce.N)))}else _.push(t("Fuerza de corte","","","N/D (material sin resistencia al corte ni UTS)"));_.push(t("Peso bruto (desarrollo)",Fe(u.grossWeight.g),"g",e.mass(u.grossWeight.g)),t("Peso neto",Fe(u.netWeight.g),"g",e.mass(u.netWeight.g)),t("Peso de merma",Fe(u.scrapWeight.g),"g",e.mass(u.scrapWeight.g)),t("Merma",Fe(u.scrapPct),"%",e.pct(u.scrapPct))),o.push({title:"L\xE1mina / troquelado",rows:_})}else n.sheetNote&&o.push({title:"L\xE1mina / troquelado",rows:[t("Nota",n.sheetNote,"",n.sheetNote)]});let d=n.profile;d&&o.push({title:"Perfil 2D",rows:[t("\xC1rea neta",Fe(d.netArea),"mm\xB2",e.area(d.netArea)),t("Per\xEDmetro exterior",Fe(d.perimeterOuter),"mm",e.len(d.perimeterOuter)),t("Per\xEDmetro interior",Fe(d.perimeterInner),"mm",e.len(d.perimeterInner)),t("Contornos",String(d.loops??""),""),t("Agujeros",String((d.holes??[]).length),"")]});let f=n.topology,m=f.counts;if(o.push({title:"Topolog\xEDa y validez",rows:[t("S\xF3lidos",String(m.solids??""),""),t("Cascos",String(m.shells??""),""),t("Caras",String(m.faces??""),""),t("Aristas",String(m.edges??""),""),t("V\xE9rtices",String(m.vertices??""),""),t("V\xE1lida",f.valid?"S\xED":"No",""),t("Cerrada (estanca)",f.closed?"S\xED":"No","")]}),n.precision){let _=n.precision;o.push({title:"Verificaci\xF3n de precisi\xF3n",rows:[t("Volumen del kernel",Fe(_.kernelVolume),"mm\xB3",e.vol(_.kernelVolume)),t("Volumen anal\xEDtico",Fe(_.analyticVolume),"mm\xB3",e.vol(_.analyticVolume)),t("Error relativo",Fe(_.relErrorPct,4),"%",`${_.relErrorPct.toExponential(3)} %`)]})}if(n.cost){let _=[t("Precio por kg",Fe(n.cost.pricePerKg),"$/kg"),t("Costo de material neto",Fe(n.cost.netCost,8),"$",n.cost.netCost.toFixed(2))];n.cost.blankCost!=null&&_.push(t("Costo de material (desarrollo)",Fe(n.cost.blankCost,8),"$",n.cost.blankCost.toFixed(2))),o.push({title:"Costo",rows:_})}return o}var QS=/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?(; [-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?)*$/i,eE=n=>{let e=n==null?"":String(n);return/^[=@+\-\t\r]/.test(e)&&!QS.test(e)&&(e=`'${e}`),/[",\n\r]/.test(e)?`"${e.replace(/"/g,'""')}"`:e};function _g(n,e=[]){let t=[["Propiedad","Valor","Unidad"]];for(let i of gg(n,_s("metric")))for(let s of i.rows)t.push([`${i.title}: ${s.l}`,s.v,s.u]);for(let i of e)t.push([`Medici\xF3n: ${i.title}`,i.text,""]);return t.map(i=>i.map(eE).join(",")).join(`
`)+`
`}function xg(n,e=[]){return JSON.stringify({...n,measurements:e},null,2)}var Vn=n=>String(n??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),tE=`
@page { size: auto; margin: 14mm; }
* { box-sizing: border-box; }
body { font: 13px/1.4 -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1c2128; margin: 0; padding: 24px; max-width: 900px; margin-inline: auto; }
header { border-bottom: 2px solid #2d6cdf; padding-bottom: 8px; margin-bottom: 14px; }
h1 { margin: 0 0 4px; font-size: 22px; }
h2 { font-size: 15px; margin: 18px 0 6px; color: #2d6cdf; break-after: avoid; }
.meta { color: #57606a; }
.meta span { margin-right: 16px; }
img.snap { display: block; max-width: 100%; max-height: 320px; margin: 10px auto; border: 1px solid #d0d7de; border-radius: 4px; }
table { width: 100%; border-collapse: collapse; break-inside: avoid; }
th, td { text-align: left; padding: 4px 8px; border-bottom: 1px solid #e3e7eb; }
th { background: #f3f5f8; font-weight: 600; }
td.v { font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.note { color: #57606a; font-size: 11px; margin-top: 4px; }
button.print { position: fixed; top: 12px; right: 12px; padding: 6px 12px; font: inherit; cursor: pointer; }
@media print { button.print { display: none; } body { padding: 0; } }
`;function yg(n,{fileName:e="",imageDataURL:t="",measurements:i=[],system:s="metric",date:r=new Date}={}){let o=_s(s),a=r instanceof Date?r.toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"}):String(r),l=(h,u)=>`<section><h2>${Vn(h)}</h2><table><tbody>${u.map(d=>`<tr><th>${Vn(d.l)}</th><td class="v">${Vn(d.s)}</td></tr>`).join("")}</tbody></table></section>`,c="";for(let h of gg(n,o))if(c+=l(h.title,h.rows),h.title==="L\xE1mina / troquelado"&&n.sheet&&(c+='<p class="note">La fuerza de extracci\xF3n es una estimaci\xF3n (\u2248 10 % de la fuerza de corte). Valores de material t\xEDpicos, no certificados.</p>'),h.title==="Perfil 2D"){let u=n.profile.holes??[];u.length&&(c+=`<table><thead><tr><th>#</th><th>\xD8</th><th>Centro (x, y)</th></tr></thead><tbody>${u.map((d,f)=>`<tr><td>${f+1}</td><td>${Vn(o.len(d.d))}</td><td>${Vn(o.point(d.c))}</td></tr>`).join("")}</tbody></table>`)}return c+=`<section><h2>Mediciones</h2>${i.length?`<table><tbody>${i.map(h=>`<tr><th>${Vn(h.title)}</th><td>${Vn(h.text)}</td></tr>`).join("")}</tbody></table>`:'<p class="note">Sin mediciones.</p>'}</section>`,`<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Reporte de pieza${e?" - "+Vn(e):""}</title>
<style>${tE}</style></head><body>
<button class="print" onclick="window.print()">Imprimir</button>
<header><h1>Reporte de pieza</h1>
<div class="meta"><span><b>Archivo:</b> ${Vn(e)}</span><span><b>Fecha:</b> ${Vn(a)}</span><span><b>Material:</b> ${Vn(n.material.name)}</span></div></header>
${t?`<img class="snap" alt="Vista 3D de la pieza" src="${Vn(t)}">`:""}
${c}
</body></html>`}var Xa="personalizado",xs="Aceros",Ga="Inoxidables",Ks="Aluminio",Wa="Cobre y aleaciones",ys="Otros metales",In="Pl\xE1sticos",Js="Otros",nE=[["acero-1008","Acero bajo carbono 1008/1010 (CRS)",xs,7.87,330,285,250,200,"#8c96a3",.9,.45],["acero-1018","Acero 1018",xs,7.87,440,370,null,205,"#8a94a1",.9,.45],["acero-a36","Acero A36",xs,7.85,450,250,null,200,"#86909e",.9,.5],["acero-1045","Acero 1045",xs,7.85,625,530,null,205,"#808a98",.9,.4],["acero-galv-g90","Acero galvanizado G90",xs,7.85,340,230,null,null,"#a3adb8",.85,.55],["acero-hsla-50","Acero HSLA grado 50",xs,7.85,450,345,null,null,"#838d9b",.9,.45],["acero-dp590","Acero DP590",xs,7.8,600,340,null,null,"#7f8997",.9,.45],["acero-4140","Acero 4140",xs,7.85,655,415,null,null,"#7b8594",.9,.4],["inox-304","Inoxidable 304",Ga,8,515,205,null,193,"#b9c1cb",1,.3],["inox-316","Inoxidable 316",Ga,8,515,205,null,null,"#b4bcc7",1,.3],["inox-430","Inoxidable 430",Ga,7.75,450,205,null,null,"#bcc3cd",1,.3],["inox-409","Inoxidable 409",Ga,7.7,415,205,null,null,"#b0b8c2",1,.35],["inox-17-4ph","Inoxidable 17-4PH",Ga,7.8,1100,1e3,null,null,"#aab2bd",1,.3],["al-1100-h14","Aluminio 1100-H14",Ks,2.71,125,115,75,69,"#d9dde2",.9,.4],["al-3003-h14","Aluminio 3003-H14",Ks,2.73,150,145,95,null,"#d6dadf",.9,.4],["al-5052-h32","Aluminio 5052-H32",Ks,2.68,230,195,140,70,"#d3d8de",.9,.4],["al-6061-t6","Aluminio 6061-T6",Ks,2.7,310,276,207,69,"#cfd4da",.9,.4],["al-6063-t5","Aluminio 6063-T5",Ks,2.69,185,null,null,null,"#d2d7dc",.9,.4],["al-7075-t6","Aluminio 7075-T6",Ks,2.81,572,503,331,72,"#c9cfd6",.9,.4],["al-2024-t3","Aluminio 2024-T3",Ks,2.78,483,345,283,null,"#ccd1d8",.9,.4],["cobre-c110","Cobre C110",Wa,8.89,220,null,150,117,"#b87333",1,.35],["laton-c260","Lat\xF3n C260",Wa,8.53,340,null,null,null,"#d4a94a",1,.35],["laton-c360","Lat\xF3n C360",Wa,8.5,385,null,null,null,"#cfa443",1,.35],["bronce-c510","Bronce fosforado C510",Wa,8.86,515,null,null,null,"#b98a4b",1,.4],["cobre-be-c172","Cobre-berilio C172",Wa,8.25,1200,null,null,null,"#c28a52",1,.35],["titanio-gr2","Titanio Gr 2",ys,4.51,345,null,null,null,"#9da3aa",.9,.4],["ti-6al-4v","Ti-6Al-4V",ys,4.43,950,null,null,null,"#8f959c",.9,.4],["zamak-3","Zamak 3",ys,6.6,283,null,null,null,"#a8adb3",.85,.5],["mg-az31b","Magnesio AZ31B",ys,1.77,260,null,null,null,"#c3c7cc",.85,.5],["niquel-200","N\xEDquel 200",ys,8.89,460,null,null,null,"#b5b9be",1,.3],["inconel-718","Inconel 718",ys,8.19,1375,null,null,null,"#8d9298",1,.35],["hierro-gris","Hierro fundido gris",ys,7.2,250,null,null,null,"#6b7078",.8,.6],["plomo","Plomo",ys,11.34,null,null,null,null,"#6e7681",.9,.55],["abs","ABS",In,1.04,null,null,null,null,"#e8e4d8",0,.5],["pla","PLA",In,1.24,null,null,null,null,"#e9edf0",0,.45],["petg","PETG",In,1.27,null,null,null,null,"#cfe6ef",0,.35],["nylon-66","Nylon 6/6",In,1.14,null,null,null,null,"#efe9d9",0,.5],["pom","POM (Delrin)",In,1.41,null,null,null,null,"#f2f2ee",0,.4],["pc","Policarbonato",In,1.2,null,null,null,null,"#dbe7ee",0,.3],["pp","Polipropileno",In,.9,null,null,null,null,"#f0f0e6",0,.5],["hdpe","HDPE",In,.95,null,null,null,null,"#eceae0",0,.55],["pmma","Acr\xEDlico (PMMA)",In,1.18,null,null,null,null,"#e3f0f6",0,.3],["ptfe","PTFE",In,2.2,null,null,null,null,"#f6f6f3",0,.45],["peek","PEEK",In,1.3,null,null,null,null,"#c9b99a",0,.45],["pvc","PVC r\xEDgido",In,1.4,null,null,null,null,"#d8dde0",0,.45],["resina-sla","Resina SLA",In,1.18,null,null,null,null,"#d9d4c7",0,.4],["pino","Pino",Js,.5,null,null,null,null,"#d8b98a",0,.6],["roble","Roble",Js,.75,null,null,null,null,"#b98f5a",0,.6],["mdf","MDF",Js,.75,null,null,null,null,"#c4a77d",0,.6],["vidrio","Vidrio",Js,2.5,null,null,null,null,"#cfe3e8",0,.3],["caucho","Caucho",Js,1.2,null,null,null,null,"#3a3d42",0,.6],["concreto","Concreto",Js,2.4,null,null,null,null,"#a8a8a2",0,.6],["cfrp","Fibra de carbono (CFRP)",Js,1.55,null,null,null,null,"#2b2e33",.2,.35]],bg=nE.map(([n,e,t,i,s,r,o,a,l,c,h])=>{let u={id:n,name:e,group:t,density:i};return s!=null&&(u.uts=s),r!=null&&(u.yieldStrength=r),o!=null&&(u.shear=o),a!=null&&(u.E=a),Object.assign(u,{color:l,metalness:c,roughness:h})});function Qs(n){return bg.find(e=>e.id===n)}function vg(){let n=[];for(let e of bg){let t=n.find(i=>i.group===e.group);t||n.push(t={group:e.group,items:[]}),t.items.push(e)}return n}function Mg(n,e="Personalizado"){return{id:Xa,name:e,group:"Personalizado",density:Number(n),color:"#9aa4b0",metalness:.5,roughness:.5}}var Ya=2*Math.PI,tr=Math.PI/180,Ef="AutoCAD Binary DXF",vf={0:["unitless",1],1:["in",25.4],2:["ft",304.8],3:["mi",1609344],4:["mm",1],5:["cm",10],6:["m",1e3],7:["km",1e6],8:["\xB5in",254e-7],9:["mil",.0254],10:["yd",914.4],11:["\xC5",1e-7],12:["nm",1e-6],13:["\xB5m",.001],14:["dm",100],15:["dam",1e4],16:["hm",1e5],17:["Gm",1e12],18:["AU",1495978707e5],19:["ly",94607304725808e5],20:["pc",3085677581491367e4],21:["ft-us",12e5/3937],22:["in-us",1e5/3937],23:["yd-us",36e5/3937],24:["mi-us",6336e6/3937]},Sg=new Set(["DIMENSION","ARC_DIMENSION","LEADER","MLEADER","MULTILEADER","HATCH","SOLID","TRACE","3DFACE","VIEWPORT","IMAGE","WIPEOUT","REGION","3DSOLID","BODY","ACAD_TABLE","XLINE","RAY","POINT","TOLERANCE","ATTDEF","ATTRIB","SURFACE","MESH","OLE2FRAME","OLEFRAME","SHAPE"]),iE=/CENTER|CENTRO|CENTRE|HIDDEN|OCULT|DASH|TRAZ|PHANTOM|DOT|PUNT|DIVIDE|BORDER|EJE/i;function Af(n){let e=n instanceof Uint8Array?n:new Uint8Array(n),t="";for(let i=0;i<Math.min(e.length,Ef.length);i++)t+=String.fromCharCode(e[i]);if(t===Ef)throw new Error("DXF binario no soportado: gu\xE1rdalo como DXF ASCII");try{return new TextDecoder("utf-8",{fatal:!0}).decode(e)}catch{try{return new TextDecoder("windows-1252").decode(e)}catch{return new TextDecoder("latin1").decode(e)}}}var er=n=>n.indexOf("\\U+")<0?n:n.replace(/\\U\+([0-9A-Fa-f]{4})/g,(e,t)=>String.fromCodePoint(parseInt(t,16)));function sE(n){return n.indexOf("%%")<0?n:n.replace(/%%(\d{3}|[cCdDpPuUoOkK%])/g,(e,t)=>/^\d/.test(t)?String.fromCharCode(+t):{c:"\xD8",d:"\xB0",p:"\xB1","%":"%"}[t.toLowerCase()]??"")}function rE(n){let e="";for(let t=0;t<n.length;t++){let i=n[t];if(i==="{"||i==="}")continue;if(i!=="\\"){e+=i;continue}let s=n[t+1];if(s===void 0)break;if(t++,s==="P"||s==="X")e+=`
`;else if(s==="~")e+=" ";else if(s==="\\"||s==="{"||s==="}")e+=s;else if(s==="S"){let r=n.indexOf(";",t);e+=n.slice(t+1,r<0?n.length:r).replace(/[\^#]/,"/"),t=r<0?n.length:r}else if("fFHWQTACcp".includes(s)){let r=n.indexOf(";",t);t=r<0?n.length:r}}return e}var Mf=(n,e)=>[n[0]*e[0]+n[2]*e[1],n[1]*e[0]+n[3]*e[1],n[0]*e[2]+n[2]*e[3],n[1]*e[2]+n[3]*e[3],n[0]*e[4]+n[2]*e[5]+n[4],n[1]*e[4]+n[3]*e[5]+n[5]],Ph=(n,e)=>[n[0]*e[0]+n[2]*e[1]+n[4],n[1]*e[0]+n[3]*e[1]+n[5]];function Sf(n){let e=n/90;return Number.isInteger(e)?[[1,0],[0,1],[-1,0],[0,-1]][(e%4+4)%4]:[Math.cos(n*tr),Math.sin(n*tr)]}function oE(n,e,t){if(n===0&&e===0&&t===1)return null;let i=Math.hypot(n,e,t);return i>0?(n/=i,e/=i,t/=i,Math.abs(n)>1e-6||Math.abs(e)>1e-6?!1:t>0?null:[-1,0,0,1,0,0]):null}function aE(n,e,t){if(Math.abs(t)<1e-12)return{type:"line",p0:n,p1:e};let i=e[0]-n[0],s=e[1]-n[1],r=Math.hypot(i,s),o=Math.abs(t),a=r*(1+o*o)/(4*o),l=r*(1-o*o)/(4*o),c=t>0?1:-1,h=(n[0]+e[0])/2-c*l*s/r,u=(n[1]+e[1])/2+c*l*i/r;return{type:"arc",c:[h,u],r:a,a0:Math.atan2(n[1]-u,n[0]-h),a1:Math.atan2(e[1]-u,e[0]-h),ccw:t>0}}function Eg(n,e){let t=[],i=n.length,s=e?i:i-1;for(let r=0;r<s;r++){let o=n[r],a=n[(r+1)%i];o.x===a.x&&o.y===a.y||t.push(aE([o.x,o.y],[a.x,a.y],o.b))}return t}function Ag(n,e,t,i){let s=e.length-2;for(;s>0&&e[s]>i;)s--;let r=[];for(let a=0;a<=t.length;a++)if(a<=s-n)r.push(t[a]);else if(a>s)r.push(t[a-1]);else{let l=e[a+n]-e[a],c=l>0?(i-e[a])/l:0,h=t[a],u=t[a-1];c===0?r.push(u):c===1?r.push(h):r.push([c*h[0]+(1-c)*u[0],c*h[1]+(1-c)*u[1],c*h[2]+(1-c)*u[2]])}let o=e.slice(0,s+1);o.push(i);for(let a=s+1;a<e.length;a++)o.push(e[a]);return{U:o,Pw:r}}function lE(n,e,t){let i=e[e.length-1]-e[0],s=1e-12*(i||1),r=e[n],o=e[t.length];e=e.map(h=>Math.abs(h-r)<=s?r:Math.abs(h-o)<=s?o:h);let a=h=>e.reduce((u,d)=>u+(d===h),0);for(let h=a(r);h<n;h++)({U:e,Pw:t}=Ag(n,e,t,r));for(let h=a(o);h<n;h++)({U:e,Pw:t}=Ag(n,e,t,o));let l=e.lastIndexOf(r)-n;e=e.slice(l),t=t.slice(l),e[0]=r;let c=e.indexOf(o)+n;return e=e.slice(0,c+1),e[c]=o,t=t.slice(0,c-n),{U:e,Pw:t}}function cE(n,e,t,i){n=n.filter((c,h)=>h===0||c[0]!==n[h-1][0]||c[1]!==n[h-1][1]);let s=n.length,r=[];if(s<2)return r;let o=e?s:s-1,a=c=>e?n[(c%s+s)%s]:n[c],l=(c,h,u)=>{let d=Math.hypot(u[0]-h[0],u[1]-h[1]);if(!c)return null;let f=Math.hypot(h[0]-c[0],h[1]-c[1]);if(f===0)return null;let m=Math.sqrt(f),_=Math.sqrt(d),g=3*m*(m+_);return[0,1].map(p=>(f*u[p]-d*c[p]+(2*f+3*m*_+d)*h[p])/g)};for(let c=0;c<o;c++){let h=a(c),u=a(c+1),d=e||c>0?a(c-1):null,f=e||c+2<s?a(c+2):null,m=Math.hypot(u[0]-h[0],u[1]-h[1]),_=l(d,h,u),g=l(f,u,h);!_&&t&&c===0&&(_=[h[0]+t[0]*m/3,h[1]+t[1]*m/3]),!g&&i&&c===o-1&&(g=[u[0]-i[0]*m/3,u[1]-i[1]*m/3]),!_&&!g?(_=[h[0]+(u[0]-h[0])/3,h[1]+(u[1]-h[1])/3],g=[h[0]+2*(u[0]-h[0])/3,h[1]+2*(u[1]-h[1])/3]):_?g||(g=[(u[0]+_[0])/2,(u[1]+_[1])/2]):_=[(h[0]+g[0])/2,(h[1]+g[1])/2],r.push({type:"bezier",pts:[h,_,g,u]})}return r}function hE(n){n.charCodeAt(0)===65279&&(n=n.slice(1));let e=n.split(/\r\n|\n|\r/),t=e.length;for(;t>0&&e[t-1].trim()==="";)t--;let i=t>>1,s=new Int32Array(i),r=new Array(i);for(let o=0;o<i;o++){let a=parseInt(e[2*o],10);if(Number.isNaN(a))throw new Error(`DXF ilegible: c\xF3digo de grupo no num\xE9rico en la l\xEDnea ${2*o+1}`);s[o]=a,r[o]=e[2*o+1]}return{codes:s,vals:r}}function wg(n){if(typeof n!="string"&&(n=Af(n)),n.startsWith(Ef))throw new Error("DXF binario no soportado: gu\xE1rdalo como DXF ASCII");if(!n.trim())throw new Error("DXF ilegible: el archivo est\xE1 vac\xEDo");let{codes:e,vals:t}=hE(n),i=e.length,s=z=>t[z].trim(),r=z=>{let H=+t[z];return Number.isFinite(H)?H:0},o=new Map,a=z=>o.set(z,(o.get(z)||0)+1),l={},c=new Map,h=[],u=new Map,d=new Map,f=null,m=!1,_=(z,H)=>{let F=[];for(;z<i;){if(e[z]!==0){z++;continue}let X=s(z).toUpperCase();if(H.has(X))break;let le=z+1;for(;le<i&&e[le]!==0;)le++;let de={type:X,s:z+1,e:le};if(z=le,X==="POLYLINE"||X==="INSERT"){let ye=[];for(;z<i&&e[z]===0;){let B=s(z).toUpperCase();if(B!=="VERTEX"&&B!=="ATTRIB"&&B!=="SEQEND")break;let G=z+1;for(;G<i&&e[G]!==0;)G++;if(B==="VERTEX"&&ye.push({s:z+1,e:G}),z=G,B==="SEQEND")break}de.verts=ye}F.push(de)}return{recs:F,k:z}},g=new Set(["ENDSEC","EOF","SECTION"]),p=new Set(["ENDBLK","ENDSEC","EOF","BLOCK","SECTION"]),x=0;for(;x<i;){if(!(e[x]===0&&s(x).toUpperCase()==="SECTION")){x++;continue}m=!0;let z=x+1<i&&e[x+1]===2?s(x+1).toUpperCase():"";if(x+=2,z==="HEADER"){let H=null;for(;x<i&&!(e[x]===0&&s(x).toUpperCase()==="ENDSEC");x++)e[x]===9?H=s(x).toUpperCase():H&&!(H in l)&&(l[H]=t[x].trim())}else if(z==="TABLES"){let H="",F=null,X=()=>{if(F){if(F.kind==="LAYER"&&F.name){let le=F.color??7,de={name:F.name,color:Math.abs(le)||7,linetype:F.linetype||"CONTINUOUS",frozen:!!(F.flags&1),off:le<0};c.has(F.name.toUpperCase())||(c.set(F.name.toUpperCase(),de),h.push(de))}else F.kind==="LTYPE"&&F.name&&u.set(F.name.toUpperCase(),{name:F.name,pattern:F.pattern});F=null}};for(;x<i;x++){let le=e[x];if(le===0){X();let de=s(x).toUpperCase();if(de==="ENDSEC")break;de==="TABLE"?H=x+1<i&&e[x+1]===2?s(x+1).toUpperCase():"":de==="ENDTAB"?H="":(de==="LAYER"||de==="LTYPE")&&H===de&&(F={kind:de,pattern:[]});continue}F&&(le===2?F.name=er(s(x)):le===62&&F.kind==="LAYER"?F.color=r(x):le===6&&F.kind==="LAYER"?F.linetype=s(x):le===70?F.flags=r(x):le===49&&F.kind==="LTYPE"&&F.pattern.push(r(x)))}}else if(z==="BLOCKS")for(;x<i;){if(e[x]!==0){x++;continue}let H=s(x).toUpperCase();if(H==="ENDSEC"||H==="EOF")break;if(H!=="BLOCK"){x++;continue}let F={name:"",base:[0,0],flags:0,ents:[]},X=x+1;for(;X<i&&e[X]!==0;X++)e[X]===2||e[X]===3&&!F.name?F.name=er(s(X)):e[X]===10?F.base[0]=r(X):e[X]===20?F.base[1]=r(X):e[X]===70&&(F.flags=r(X));let le=_(X,p);F.recs=le.recs,x=le.k,x<i&&s(x).toUpperCase()==="ENDBLK"&&x++,F.name&&d.set(F.name.toUpperCase(),F)}else if(z==="ENTITIES"){let H=_(x,g);f=(f||[]).concat(H.recs),x=H.k}}if(!m)throw new Error("DXF ilegible: no se encontr\xF3 ninguna secci\xF3n (\xBFes un archivo DXF?)");let E=[],b=parseInt(l.$INSUNITS,10);Number.isNaN(b)&&(b=null);let M;if(b&&vf[b])M={insunits:b,name:vf[b][0],toMM:vf[b][1]};else{let z=parseInt(l.$MEASUREMENT,10)===0;M={insunits:b,name:"unitless",toMM:z?25.4:1,assumed:z?"in":"mm"},E.push(z?"El DXF no define unidades ($INSUNITS); por $MEASUREMENT = 0 (ingl\xE9s) se asumen pulgadas. Verifica la escala.":"El DXF no define unidades ($INSUNITS); se asumen mil\xEDmetros. Verifica la escala.")}let v=z=>{let H=z.toUpperCase(),F=c.get(H);return F||(F={name:z,color:7,linetype:"CONTINUOUS",frozen:!1,off:!1},c.set(H,F),h.push(F)),F};v("0");let A=new Map,y=z=>{let H=z.toUpperCase(),F=A.get(H);if(F===void 0){if(H==="CONTINUOUS"||H==="BYLAYER"||H==="BYBLOCK"||H==="")F=!1;else{let X=u.get(H);F=iE.test(H)||!!(X&&X.pattern.some(le=>le<0))}A.set(H,F)}return F},w=z=>z.ent||(z.ent=L(z)),L=z=>{let{type:H,s:F,e:X}=z,le={type:H,layer:"0",color:256,linetype:"BYLAYER",handle:null,paper:!1,segs:null,texts:null,insert:null},de=0,ye=0,B=1;for(let ne=F;ne<X;ne++){let ee=e[ne];ee===8?le.layer=er(s(ne))||"0":ee===62?le.color=r(ne):ee===6?le.linetype=s(ne):ee===5?le.handle=s(ne):ee===67?le.paper=r(ne)===1:ee===210?de=r(ne):ee===220?ye=r(ne):ee===230&&(B=r(ne))}let G=H==="LINE"||H==="SPLINE"?null:oE(de,ye,B);if(G===!1&&H!=="ELLIPSE")return a(`Entidad 3D omitida (extrusi\xF3n no paralela a Z): ${H}`),le.skip=!0,le;let re=ne=>G?ne.map(ee=>zi(ee,G)):ne;switch(H){case"LINE":{let ne=[0,0],ee=[0,0];for(let ie=F;ie<X;ie++){let he=e[ie];he===10?ne[0]=r(ie):he===20?ne[1]=r(ie):he===11?ee[0]=r(ie):he===21&&(ee[1]=r(ie))}le.segs=[{type:"line",p0:ne,p1:ee}];break}case"CIRCLE":case"ARC":{let ne=[0,0],ee=0,ie=0,he=360;for(let me=F;me<X;me++){let Ve=e[me];Ve===10?ne[0]=r(me):Ve===20?ne[1]=r(me):Ve===40?ee=r(me):Ve===50?ie=r(me):Ve===51&&(he=r(me))}if(!(ee>0)){a(`${H} con radio nulo omitido`);break}let _e=H==="CIRCLE"?{type:"circle",c:ne,r:ee,ccw:!0}:{type:"arc",c:ne,r:ee,a0:ie*tr,a1:he*tr,ccw:!0};le.segs=re([_e]);break}case"LWPOLYLINE":{let ne=[],ee=0;for(let ie=F;ie<X;ie++){let he=e[ie];he===10?ne.push({x:r(ie),y:0,b:0}):he===20&&ne.length?ne[ne.length-1].y=r(ie):he===42&&ne.length?ne[ne.length-1].b=r(ie):he===70&&(ee=r(ie))}le.segs=re(Eg(ne,(ee&1)===1));break}case"POLYLINE":{let ne=0;for(let ie=F;ie<X;ie++)e[ie]===70&&(ne=r(ie));if(ne&88){a("Polil\xEDnea 3D, malla o malla de caras omitida (solo se importan polil\xEDneas 2D)"),le.skip=!0;break}let ee=[];for(let ie of z.verts||[]){let he={x:0,y:0,b:0},_e=0;for(let me=ie.s;me<ie.e;me++){let Ve=e[me];Ve===10?he.x=r(me):Ve===20?he.y=r(me):Ve===42?he.b=r(me):Ve===70&&(_e=r(me))}_e&16||ee.push(he)}le.segs=re(Eg(ee,(ne&1)===1));break}case"ELLIPSE":{let ne=[0,0],ee=[1,0],ie=1,he=0,_e=Ya;for(let Be=F;Be<X;Be++){let rt=e[Be];rt===10?ne[0]=r(Be):rt===20?ne[1]=r(Be):rt===11?ee[0]=r(Be):rt===21?ee[1]=r(Be):rt===40?ie=r(Be):rt===41?he=r(Be):rt===42&&(_e=r(Be))}let me=Math.hypot(de,ye,B);if(G===!1||!(me>0)){a("Entidad 3D omitida (extrusi\xF3n no paralela a Z): ELLIPSE"),le.skip=!0;break}let Ve=Math.hypot(ee[0],ee[1]);if(!(Ve>0)||!(ie>0)){a("ELLIPSE degenerada omitida");break}let Le=_e-he;Le-=Ya*Math.floor(Le/Ya),(Le<1e-9||Ya-Le<1e-6)&&(_e=he+Ya);let qe=B<0;le.segs=[{type:"ellipse",c:ne,rx:Ve,ry:Ve*ie,rot:Math.atan2(ee[1],ee[0]),t0:qe?-he:he,t1:qe?-_e:_e,ccw:!qe}];break}case"SPLINE":le.segs=T(F,X);break;case"INSERT":{let ne={name:"",p:[0,0],sx:1,sy:1,rot:0,cols:1,rows:1,dc:0,dr:0,M:G};for(let ee=F;ee<X;ee++){let ie=e[ee];ie===2?ne.name=er(s(ee)):ie===10?ne.p[0]=r(ee):ie===20?ne.p[1]=r(ee):ie===41?ne.sx=r(ee):ie===42?ne.sy=r(ee):ie===50?ne.rot=r(ee):ie===70?ne.cols=Math.max(1,r(ee)|0):ie===71?ne.rows=Math.max(1,r(ee)|0):ie===44?ne.dc=r(ee):ie===45&&(ne.dr=r(ee))}le.insert=ne;break}case"TEXT":case"MTEXT":{let ne=[0,0],ee=[0,0],ie=0,he=0,_e="",me="",Ve=!1,Le=null;for(let ot=F;ot<X;ot++){let W=e[ot];W===10?ne[0]=r(ot):W===20?ne[1]=r(ot):W===11?ee[0]=r(ot):W===21?ee[1]=r(ot):W===40?ie=r(ot):W===50?he=r(ot):W===1?_e=t[ot]:W===3?me+=t[ot]:(W===72||W===73)&&r(ot)!==0&&(Ve=!0)}let qe,Be=ne;if(H==="MTEXT"?(qe=rE(er(me+_e)),(ee[0]!==0||ee[1]!==0)&&(Le=Math.atan2(ee[1],ee[0])/tr)):(qe=er(_e),Ve&&(Be=ee)),qe=sE(qe).trim(),!qe)break;let rt=Be,gt=Le??he;if(H==="TEXT"&&G){rt=Ph(G,Be);let ot=Ph([G[0],G[1],G[2],G[3],0,0],Sf(he));gt=Math.atan2(ot[1],ot[0])/tr}le.texts=[{text:qe,p:rt,h:ie,rot:gt}];break}default:break}return le},T=(z,H)=>{let F=3,X=0,le=[],de=[],ye=[],B=[],G=null,re=null;for(let ie=z;ie<H;ie++){let he=e[ie];he===71?F=r(ie):he===70?X=r(ie):he===40?le.push(r(ie)):he===41?ye.push(r(ie)):he===10?de.push([r(ie),0]):he===20&&de.length?de[de.length-1][1]=r(ie):he===11?B.push([r(ie),0]):he===21&&B.length?B[B.length-1][1]=r(ie):he===12?G=[r(ie),0]:he===22&&G?G[1]=r(ie):he===13?re=[r(ie),0]:he===23&&re&&(re[1]=r(ie))}let ne=F,ee=de.length;if(ee>=ne+1&&ne>=1&&le.length===ee+ne+1){let ie=ye.length===ee?ye:null;if(ye.length&&!ie&&a("SPLINE con n\xFAmero de pesos incorrecto: se ignoran los pesos"),ie&&ie.some(Be=>!(Be>0))&&(ie=null),!le.every((Be,rt)=>rt===0||Be>=le[rt-1])||!(le[ee]>le[ne]))return a("SPLINE con vector de nudos inv\xE1lido omitida"),null;let _e=le,me=de.map((Be,rt)=>ie?[Be[0]*ie[rt],Be[1]*ie[rt],ie[rt]]:[Be[0],Be[1],1]);_e.slice(0,ne+1).every(Be=>Be===_e[0])&&_e.slice(-ne-1).every(Be=>Be===_e[_e.length-1])||({U:_e,Pw:me}=lE(ne,_e,me));let Le=me.map(Be=>Be[2]),qe=Le.some(Be=>Math.abs(Be-Le[0])>1e-12*Math.abs(Le[0]));return[{type:"spline",degree:ne,ctrl:me.map(Be=>[Be[0]/Be[2],Be[1]/Be[2]]),knots:_e,weights:qe?Le:null}]}if(B.length>=2){let ie=Le=>{let qe=Le&&Math.hypot(Le[0],Le[1]);return qe>0?[Le[0]/qe,Le[1]/qe]:null},he=B,_e=(X&1)===1,me=he[0],Ve=he[he.length-1];return _e&&he.length>2&&Math.hypot(me[0]-Ve[0],me[1]-Ve[1])<=1e-9*(Math.abs(me[0])+Math.abs(me[1])+1)&&(he=he.slice(0,-1)),_e&&he.length<3&&(_e=!1),cE(he,_e,ie(G),ie(re))}return a("SPLINE sin puntos de control ni de ajuste v\xE1lidos omitida"),null},C=[],R=[],P={entities:{},ignored:{}},D=(z,H)=>z[H]=(z[H]||0)+1,k=new Map,V=new Set(["LINE","ARC","CIRCLE","LWPOLYLINE","POLYLINE","ELLIPSE","SPLINE","INSERT","TEXT","MTEXT"]),j=(z,H)=>{let F=w(z);if(F.skip)return;let X=H&&F.layer==="0"?H.layer:F.layer,le=v(X),de=F.color;de===256?de=le.color:de===0&&(de=H?H.color:7),de=Math.abs(de);let ye=F.linetype,B=ye.toUpperCase();if(B==="BYBLOCK"?ye=H?H.linetype:"CONTINUOUS":B==="BYLAYER"&&(ye=le.linetype),F.insert)return q(F,H,{layer:le.name,color:de,linetype:ye});if(F.segs&&F.segs.length){let G={layer:le.name,entity:F.type,color:de,linetype:ye,dashed:y(ye)};F.handle&&(G.handle=F.handle),H&&(G.block=H.block);for(let re of F.segs){let ne=H?zi(re,H.M):{...re};ne.meta=G,C.push(ne)}}if(F.texts)for(let G of F.texts)if(!H)R.push({text:G.text,p:G.p,h:G.h,rot:G.rot,layer:le.name});else{let re=H.M,ne=Ph([re[0],re[1],re[2],re[3],0,0],Sf(G.rot)),ee=Math.sqrt(Math.abs(re[0]*re[3]-re[1]*re[2]));R.push({text:G.text,p:Ph(re,G.p),h:G.h*ee,rot:Math.atan2(ne[1],ne[0])/tr,layer:le.name})}},q=(z,H,F)=>{let X=z.insert,le=X.name.toUpperCase(),de=d.get(le);if(!de)return a(`Bloque inexistente omitido: ${X.name}`);if(de.flags&4)return a(`Referencia externa (xref) no incluida: ${X.name}`);let ye=H?H.stack:[];if(ye.includes(le))return a(`Referencia circular de bloques omitida: ${X.name}`);if(ye.length>=64)return a(`Anidamiento de bloques demasiado profundo: ${X.name}`);if(!(X.sx!==0&&X.sy!==0))return a(`INSERT con escala nula omitido: ${X.name}`);let[B,G]=Sf(X.rot),re=Mf([B,G,-G,B,0,0],[X.sx,0,0,X.sy,-X.sx*de.base[0],-X.sy*de.base[1]]),ne=H?H.M:null;for(let ee=0;ee<X.rows;ee++)for(let ie=0;ie<X.cols;ie++){let he=ie*X.dc,_e=ee*X.dr,me=re.slice();me[4]+=X.p[0]+B*he-G*_e,me[5]+=X.p[1]+G*he+B*_e,X.M&&(me=Mf(X.M,me)),ne&&(me=Mf(ne,me));let Ve={M:me,layer:F.layer,color:F.color,linetype:F.linetype,block:de.name,stack:[...ye,le]};for(let Le of de.recs)Sg.has(Le.type)||j(Le,Ve)}};for(let z of f||[]){let H=z.type;if(Sg.has(H)){D(P.ignored,H);continue}if(!V.has(H)){D(P.ignored,H),k.set(H,(k.get(H)||0)+1);continue}if(w(z).paper){D(P.ignored,"PAPERSPACE");continue}D(P.entities,H),j(z,null)}f?f.length||E.push("El DXF no contiene entidades"):E.push("El DXF no contiene la secci\xF3n ENTITIES");for(let[z,H]of k)E.push(`Entidad no soportada ignorada: ${z} (${H})`);for(let[z,H]of o)E.push(H>1?`${z} (\xD7${H})`:z);return{units:M,version:l.$ACADVER||null,layers:h,linetypes:[...u.values()].map(z=>z.name),segments:C,texts:R,stats:P,warnings:E}}var Dh=2*Math.PI,Rg=[1,0,0,1,0,0],uE=[1,0,0,-1,0,0],dE={amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:"\xA0"};function fE(n,e){return n.indexOf("&")<0?n:n.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[\w.:-]+);/g,(t,i)=>{if(i[0]==="#"){let s=i[1]==="x"||i[1]==="X"?parseInt(i.slice(2),16):parseInt(i.slice(1),10);return s>=0&&s<=1114111?String.fromCodePoint(s):t}return e[i]??t})}var nr=n=>n===32||n===9||n===10||n===13;function pE(n){let e={...dE},t={name:"#doc",attrs:{},children:[],parent:null},i=t,s=0,r=n.length;for(;s<r;){let o=n.indexOf("<",s);if(o<0)break;let a=(l,c)=>{let h=n.indexOf(l,c);s=h<0?r:h+l.length};if(n.startsWith("<!--",o))a("-->",o+4);else if(n.startsWith("<![CDATA[",o))a("]]>",o+9);else if(n.startsWith("<?",o))a("?>",o+2);else if(n[o+1]==="!"){let l=o+2,c=0;for(;l<r;l++){let h=n[l];if(h==="[")c++;else if(h==="]")c--;else if(h===">"&&c<=0)break}for(let h of n.slice(o,l+1).matchAll(/<!ENTITY\s+([\w.:-]+)\s+(["'])([\s\S]*?)\2\s*>/g))e[h[1]]=h[3];s=l+1}else if(n[o+1]==="/"){let l=n.indexOf(">",o),c=n.slice(o+2,l<0?r:l).trim(),h=i;for(;h!==t&&h.name!==c;)h=h.parent;h!==t&&(i=h.parent),s=l<0?r:l+1}else{let l=o+1;for(;l<r&&!nr(n.charCodeAt(l))&&n[l]!==">"&&n[l]!=="/";)l++;let c=n.slice(o+1,l),h={},u=!1;for(;;){for(;l<r&&nr(n.charCodeAt(l));)l++;if(l>=r)break;if(n[l]===">"){l++;break}if(n[l]==="/"){if(l++,n[l]===">"){u=!0,l++;break}continue}let f=l;for(;l<r&&!nr(n.charCodeAt(l))&&n[l]!=="="&&n[l]!==">"&&n[l]!=="/";)l++;let m=n.slice(f,l);for(;l<r&&nr(n.charCodeAt(l));)l++;let _="";if(n[l]==="="){for(l++;l<r&&nr(n.charCodeAt(l));)l++;let g=n[l];if(g==='"'||g==="'"){let p=n.indexOf(g,l+1);_=n.slice(l+1,p<0?r:p),l=p<0?r:p+1}else{let p=l;for(;l<r&&!nr(n.charCodeAt(l))&&n[l]!==">";)l++;_=n.slice(p,l)}}m&&(h[m]=fE(_,e)),l===f&&l++}let d={name:c,attrs:h,children:[],parent:i};i.children.push(d),!u&&c&&(i=d),s=l}}return t}var Tg=n=>n.startsWith("svg:")?n.slice(4):n,mE=/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g,wf=/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y,Lh=n=>n?(n.match(mE)||[]).map(Number):[],bs={mm:1,cm:10,in:25.4,pt:25.4/72,pc:25.4/6,px:25.4/96,q:.25},gE={mm:"mm",cm:"cm",in:"in",pt:"pt",pc:"pt",px:"px",q:"mm"};function Tf(n){if(n==null)return null;let e=/^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*([a-zA-Z%]*)\s*$/.exec(n);return e?{v:Number(e[1]),unit:e[2].toLowerCase()}:null}function _E(n){let e={};if(!n)return e;for(let t of n.split(";")){let i=t.indexOf(":");i>0&&(e[t.slice(0,i).trim().toLowerCase()]=t.slice(i+1).trim())}return e}function vs(n,e){return[n[0]*e[0]+n[2]*e[1],n[1]*e[0]+n[3]*e[1],n[0]*e[2]+n[2]*e[3],n[1]*e[2]+n[3]*e[3],n[0]*e[4]+n[2]*e[5]+n[4],n[1]*e[4]+n[3]*e[5]+n[5]]}function xE(n){let e=Rg;if(!n)return e;let t=Math.PI/180;for(let i of n.matchAll(/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g)){let s=Lh(i[2]),r=null;switch(i[1]){case"matrix":s.length>=6&&(r=s.slice(0,6));break;case"translate":s.length>=1&&(r=[1,0,0,1,s[0],s[1]??0]);break;case"scale":s.length>=1&&(r=[s[0],0,0,s[1]??s[0],0,0]);break;case"rotate":{if(!s.length)break;let o=Math.cos(s[0]*t),a=Math.sin(s[0]*t);r=[o,a,-a,o,0,0],s.length>=3&&(r=vs(vs([1,0,0,1,s[1],s[2]],r),[1,0,0,1,-s[1],-s[2]]));break}case"skewX":s.length&&(r=[1,0,Math.tan(s[0]*t),1,0,0]);break;case"skewY":s.length&&(r=[1,Math.tan(s[0]*t),0,1,0,0]);break}r&&(e=vs(e,r))}return e}var Ai=(n,e)=>({type:"line",p0:n,p1:e}),bo=(n,e)=>n[0]===e[0]&&n[1]===e[1];function yE(n,e,t,i,s,r,o){if(bo(n,o))return null;if(e=Math.abs(e),t=Math.abs(t),!(e>0)||!(t>0))return Ai(n,o);let a=i%360*Math.PI/180,l=Math.cos(a),c=Math.sin(a),h=(n[0]-o[0])/2,u=(n[1]-o[1])/2,d=l*h+c*u,f=-c*h+l*u,m=d*d/(e*e)+f*f/(t*t);if(m>1){let C=Math.sqrt(m);e*=C,t*=C}let _=e*e,g=t*t,p=_*f*f+g*d*d,x=Math.sqrt(Math.max(0,(_*g-p)/p));s===r&&(x=-x);let E=x*e*f/t,b=-x*t*d/e,M=[l*E-c*b+(n[0]+o[0])/2,c*E+l*b+(n[1]+o[1])/2],v=(d-E)/e,A=(f-b)/t,y=(-d-E)/e,w=(-f-b)/t,L=Math.atan2(A,v),T=Math.atan2(v*w-A*y,v*y+A*w);return!r&&T>0?T-=Dh:r&&T<0&&(T+=Dh),Math.abs(e-t)<=1e-12*Math.max(e,t)?{type:"arc",c:M,r:e,a0:L+a,a1:L+T+a,ccw:r}:{type:"ellipse",c:M,rx:e,ry:t,rot:a,t0:L,t1:L+T,ccw:r}}var bE=(n,e,t)=>({type:"bezier",pts:[n,[n[0]+2/3*(e[0]-n[0]),n[1]+2/3*(e[1]-n[1])],[t[0]+2/3*(e[0]-t[0]),t[1]+2/3*(e[1]-t[1])],t]});function vE(n,e,t){let i=0,s="",r="",o=n.length,a=[0,0],l=[0,0],c=null,h=null,u=()=>{for(;i<o&&(nr(n.charCodeAt(i))||n[i]===",");)i++},d=()=>{u(),wf.lastIndex=i;let g=wf.exec(n);if(!g)throw new Error("num");return i=wf.lastIndex,Number(g[0])},f=()=>{u();let g=n[i];if(g!=="0"&&g!=="1")throw new Error("flag");return i++,g==="1"},m=g=>{let p=d(),x=d();return g?[a[0]+p,a[1]+x]:[p,x]},_=g=>{bo(a,g)||e.push(Ai(a,g)),a=g};try{for(;u(),!(i>=o);){let g=n[i];if(/[a-zA-Z]/.test(g)){if(!"MmLlHhVvCcSsQqTtAaZz".includes(g))throw new Error("cmd");s=g,i++}else if(!s)throw new Error("cmd");let p=s===s.toLowerCase(),x=s.toUpperCase(),E=null,b=null;switch(x){case"M":a=l=m(p),s=p?"l":"L";break;case"L":_(m(p));break;case"H":{let M=d();_([p?a[0]+M:M,a[1]]);break}case"V":{let M=d();_([a[0],p?a[1]+M:M]);break}case"C":case"S":{let M=x==="C"?m(p):c&&"CS".includes(r)?[2*a[0]-c[0],2*a[1]-c[1]]:a,v=m(p),A=m(p);e.push({type:"bezier",pts:[a,M,v,A]}),E=v,a=A;break}case"Q":case"T":{let M=x==="Q"?m(p):h&&"QT".includes(r)?[2*a[0]-h[0],2*a[1]-h[1]]:a,v=m(p);e.push(bE(a,M,v)),b=M,a=v;break}case"A":{let M=d(),v=d(),A=d(),y=f(),w=f(),L=m(p),T=yE(a,M,v,A,y,w,L);T&&e.push(T),a=L;break}case"Z":_(l),a=l,s="";break}c=E,h=b,r=x}}catch{t(`Datos de trayecto inv\xE1lidos cerca de la posici\xF3n ${i}; se conserva lo le\xEDdo hasta ah\xED.`)}}function ME(n,e,t,i,s,r){if(!(t>0)||!(i>0))return[];if(s==null&&r==null?s=r=0:s==null?s=r:r==null&&(r=s),s=Math.min(Math.max(s,0),t/2),r=Math.min(Math.max(r,0),i/2),!(s>0)||!(r>0))return[Ai([n,e],[n+t,e]),Ai([n+t,e],[n+t,e+i]),Ai([n+t,e+i],[n,e+i]),Ai([n,e+i],[n,e])];let o=[],a=(c,h)=>!bo(c,h)&&o.push(Ai(c,h)),l=(c,h,u)=>o.push(s===r?{type:"arc",c:[c,h],r:s,a0:u,a1:u+Math.PI/2,ccw:!0}:{type:"ellipse",c:[c,h],rx:s,ry:r,rot:0,t0:u,t1:u+Math.PI/2,ccw:!0});return a([n+s,e],[n+t-s,e]),l(n+t-s,e+r,-Math.PI/2),a([n+t,e+r],[n+t,e+i-r]),l(n+t-s,e+i-r,0),a([n+t-s,e+i],[n+s,e+i]),l(n+s,e+i-r,Math.PI/2),a([n,e+i-r],[n,e+r]),l(n+s,e+r,Math.PI),o}function SE(n,e){let t=[];for(let s=0;s+1<n.length;s+=2)t.push([n[s],n[s+1]]);let i=[];for(let s=0;s+1<t.length;s++)bo(t[s],t[s+1])||i.push(Ai(t[s],t[s+1]));return e&&t.length>2&&!bo(t[t.length-1],t[0])&&i.push(Ai(t[t.length-1],t[0])),i}function EE(n){if(n.type!=="ellipse"||Math.abs(n.rx-n.ry)>1e-9*Math.max(n.rx,n.ry))return n;let e=(n.rx+n.ry)/2,t=n.ccw!==!1,i,s=t?n.t1-n.t0:n.t0-n.t1;return Math.abs(Math.abs(s)-Dh)<1e-12?i={type:"circle",c:n.c,r:e,ccw:t}:i={type:"arc",c:n.c,r:e,a0:n.rot+n.t0,a1:n.rot+n.t1,ccw:t},n.meta!==void 0&&(i.meta=n.meta),i}var AE=new Set(["text","image","foreignObject"]),wE=new Set(["defs","clipPath","mask","marker","pattern","linearGradient","radialGradient","filter","style","script","title","desc","metadata"]);function Cg(n){if(typeof n!="string")throw new Error("El SVG debe ser texto.");let e=pE(n),t=[],i=v=>t.includes(v)||t.push(v),s=null,r=new Map,o=v=>{!s&&Tg(v.name)==="svg"&&(s=v),v.attrs.id&&!r.has(v.attrs.id)&&r.set(v.attrs.id,v);for(let A of v.children)o(A)};if(o(e),!s)throw new Error("No es un archivo SVG v\xE1lido: falta el elemento <svg>.");let a=Lh(s.attrs.viewBox);a=a.length>=4&&a[2]>0&&a[3]>0?a:null;let l=Tf(s.attrs.width),c=Tf(s.attrs.height),h=v=>v&&v.v>0&&v.unit!=="%"&&(v.unit===""||v.unit in bs),u={name:"px",toMM:bs.px},d=(v,A)=>v.v*bs[v.unit||"px"]/(a?A:v.v*(bs[v.unit||"px"]/bs.px)),f=[h(l)&&[l,a?.[2]],h(c)&&[c,a?.[3]]].filter(Boolean);if(f.length){let v=f.map(([A,y])=>d(A,y));u.toMM=Math.min(...v),u.name=gE[f[0][0].unit||"px"],v.length===2&&Math.abs(v[0]-v[1])>1e-6*Math.max(...v)&&i("La proporci\xF3n de width/height no coincide con viewBox; se usa la escala menor.")}(!f.length||!f[0][0].unit)&&i("El SVG no declara unidades f\xEDsicas (mm, cm, in); se asumen p\xEDxeles a 96 ppp. Puede que haya que ajustar la escala.");let m=a?a[2]:h(l)?l.v:100,_=a?a[3]:h(c)?c.v:100,g=(v,A)=>{let y=Tf(v);return y?y.unit==="%"?y.v/100*A:y.unit in bs?y.v*bs[y.unit]/bs.px:y.v:null},p=Math.hypot(m,_)/Math.SQRT2,x=[],E={},b=new Set,M=(v,A,y=!1)=>{let w=Tg(v.name);if(AE.has(w)){E[w]=(E[w]||0)+1;return}if(wE.has(w)||w==="symbol"&&!y)return;let L=_E(v.attrs.style),T=F=>L[F]??v.attrs[F];if(T("display")==="none")return;let C=vs(A.m,xE(v.attrs.transform)),R=F=>{let X=T(F);return X==null||X==="inherit"?A[F]:X},P={m:C,layer:A.layer,stroke:R("stroke"),fill:R("fill")},D=v.attrs,k=(F,X=0)=>g(D[F],m)??X,V=(F,X=0)=>g(D[F],_)??X,j=null;switch(w){case"svg":{if(v!==s){P.m=C=vs(C,[1,0,0,1,k("x"),V("y")]);let F=Lh(D.viewBox),X=g(D.width,m),le=g(D.height,_);if(F.length>=4&&F[2]>0&&F[3]>0&&X>0&&le>0){let de=Math.min(X/F[2],le/F[3]);P.m=vs(C,[de,0,0,de,-de*F[0],-de*F[1]])}}for(let F of v.children)M(F,P);return}case"g":case"a":case"switch":case"symbol":w==="g"&&(D["inkscape:label"]||D.id)&&(P.layer=D["inkscape:label"]||D.id);for(let F of v.children)M(F,P);return;case"use":{let F=D.href??D["xlink:href"],X=F&&F[0]==="#"?r.get(F.slice(1)):null;if(!X){i(`Referencia <use> no encontrada: ${F??"(vac\xEDa)"}.`);return}if(b.has(X)){i(`Referencia <use> circular: ${F}.`);return}P.m=vs(C,[1,0,0,1,k("x"),V("y")]),b.add(X),M(X,P,!0),b.delete(X);return}case"path":j=[],vE(D.d||"",j,i);break;case"rect":j=ME(k("x"),V("y"),k("width"),V("height"),D.rx!=null&&D.rx!=="auto"?g(D.rx,m):null,D.ry!=null&&D.ry!=="auto"?g(D.ry,_):null);break;case"circle":{let F=g(D.r,p);j=F>0?[{type:"circle",c:[k("cx"),V("cy")],r:F,ccw:!0}]:[];break}case"ellipse":{let F=D.rx!=null&&D.rx!=="auto"?g(D.rx,m):null,X=D.ry!=null&&D.ry!=="auto"?g(D.ry,_):null;F??=X,X??=F;let le=[k("cx"),V("cy")];!(F>0)||!(X>0)?j=[]:F===X?j=[{type:"circle",c:le,r:F,ccw:!0}]:j=[{type:"ellipse",c:le,rx:F,ry:X,rot:0,t0:0,t1:Dh,ccw:!0}];break}case"line":{let F=[k("x1"),V("y1")],X=[k("x2"),V("y2")];j=bo(F,X)?[]:[Ai(F,X)];break}case"polyline":case"polygon":j=SE(Lh(D.points),w==="polygon");break;default:return}let q=vs(uE,P.m),z=P.stroke&&P.stroke!=="none"?P.stroke:P.fill&&P.fill!=="none"?P.fill:null,H={layer:P.layer,entity:w,color:z};try{for(let F of j){let X=EE(zi(F,q));X.meta=H,x.push(X)}}catch{i(`Se omiti\xF3 un <${w}> con transformaci\xF3n degenerada.`)}};M(s,{m:Rg,layer:"svg",stroke:null,fill:null});for(let[v,A]of Object.entries(E))i(`Se ignoraron ${A} elemento(s) <${v}> (no aportan geometr\xEDa).`);return{units:u,segments:x,warnings:t}}var Ms=2*Math.PI,Ig=10*Math.PI/180,Pg=()=>typeof performance<"u"?performance.now():Date.now();function Dg(n,e={}){let t=Pg(),{threshold:i="auto",invert:s=!1,minArea:r=20,simplifyTol:o=.6,fitCircles:a=!0,fitArcs:l=!0}=e,c=n?.width|0,h=n?.height|0,u=n?.data;if(!(c>0&&h>0)||!u||u.length<c*h*4)throw new Error("Imagen RGBA inv\xE1lida (ancho, alto o datos).");if(i!=="auto"&&!(Number.isFinite(+i)&&+i>=0&&+i<=255))throw new Error('Umbral inv\xE1lido: use "auto" o un valor entre 0 y 255.');let d=c+2,f=h+2,m=new Float32Array(d*f),_=new Float64Array(256);TE(u,c,h,m,_);let g=i==="auto"?RE(_):+i,p=g+.5;if(s)for(let v=1;v<=h;v++)for(let A=1,y=v*d+1;A<=c;A++,y++)m[y]=2*p-m[y];let x=Math.max(p+1,s?2*p:255);for(let v=0;v<d;v++)m[v]=m[(f-1)*d+v]=x;for(let v=0;v<f;v++)m[v*d]=m[v*d+d-1]=x;let E=IE(m,d,f,p,h).filter(v=>Math.abs(v.area)>=r),b=[],M={contours:0,circles:0,arcs:0,lines:0,ms:0};for(let v of E){let A=LE(v,{tol:o,fitCircles:a,fitArcs:l});for(let y of A)b.push(y),M[y.type==="line"?"lines":y.type==="arc"?"arcs":"circles"]++;M.contours++}return M.ms=Pg()-t,{segments:b,stats:M,threshold:g}}function TE(n,e,t,i,s){let r=e+2;for(let o=0,a=0;o<t;o++){let l=(o+1)*r+1;for(let c=0;c<e;c++,a+=4,l++){let h=n[a+3]/255,u=(.299*n[a]+.587*n[a+1]+.114*n[a+2])*h+255*(1-h);i[l]=u,s[u<0?0:u>255?255:Math.round(u)]++}}}function RE(n){let e=0,t=0;for(let u=0;u<256;u++)e+=n[u],t+=u*n[u];let i=new Float64Array(256),s=0,r=0,o=0;for(let u=0;u<255;u++){s+=n[u],r+=u*n[u];let d=e-s;if(s>0&&d>0){let f=r/s-(t-r)/d;i[u]=s*d*f*f,i[u]>o&&(o=i[u])}}if(!(o>0))return 127.5;let a=o*1e-9,l=0;for(;i[l]<o-a;)l++;let c=l;for(;c+1<255&&i[c+1]>=o-a;)c++;let h=(l+c)/2;for(let u=0;u<20;u++){let d=Math.floor(h),f=0,m=0;for(let g=0;g<=d;g++)f+=n[g],m+=g*n[g];if(!(f>0&&f<e))break;let _=(m/f+(t-m)/(e-f))/2-.5;if(Math.abs(_-h)<1e-9)break;h=_}return h}var CE=(()=>{let n=[];for(let e=0;e<16;e++){let t=[e>>3&1,e>>2&1,e>>1&1,e&1],i=[],s=[];for(let o=0;o<4;o++)!t[o]&&t[o+1&3]&&i.push(o),t[o]&&!t[o+1&3]&&s.push(o);let r=(o,a)=>{for(let l=1;l<4;l++){let c=o+a*l+4&3;if(s.includes(c))return c}return-1};n.push([i.map(o=>[o,r(o,1)]),i.map(o=>[o,r(o,-1)])])}return n})();function IE(n,e,t,i,s){let r=e*t,o=new Uint8Array(r);for(let d=0;d<r;d++)o[d]=n[d]<i?1:0;let a=(e-1)*t,l=a+e*(t-1),c=new Int32Array(l).fill(-1),h=new Int32Array(4);for(let d=0;d<t-1;d++){let f=d*e,m=f+e;for(let _=0;_<e-1;_++){let g=o[f+_]<<3|o[f+_+1]<<2|o[m+_+1]<<1|o[m+_];if(g===0||g===15)continue;h[0]=d*(e-1)+_,h[1]=a+d*e+_+1,h[2]=(d+1)*(e-1)+_,h[3]=a+d*e+_;let p=0;(g===5||g===10)&&(p=(n[f+_]+n[f+_+1]+n[m+_+1]+n[m+_])/4<i?1:0);for(let[x,E]of CE[g][p])c[h[x]]=h[E]}}let u=[];for(let d=0;d<l;d++){if(c[d]<0)continue;let f=[],m=[],_=d;do{let p,x,E,b;if(_<a){x=Math.floor(_/(e-1)),p=_-x*(e-1);let v=n[x*e+p],A=n[x*e+p+1];E=p+(i-v)/(A-v),b=x}else{let v=_-a;x=Math.floor(v/e),p=v-x*e;let A=n[x*e+p],y=n[(x+1)*e+p];E=p,b=x+(i-A)/(y-A)}f.push(E-.5),m.push(s-b+.5);let M=c[_];c[_]=-1,_=M}while(_!==d&&_>=0);let g=0;for(let p=0,x=f.length,E=x-1;p<x;E=p++)g+=f[E]*m[p]-f[p]*m[E];u.push({xs:f,ys:m,area:g/2})}return u}function Ng(n,e,t,i){let s=i-t+1,r=0,o=0;for(let f=t;f<=i;f++)r+=n[f],o+=e[f];r/=s,o/=s;let a=0,l=0,c=0;for(let f=t;f<=i;f++){let m=n[f]-r,_=e[f]-o;a+=m*m,l+=_*_,c+=m*_}let h=.5*Math.atan2(2*c,a-l),u=Math.cos(h),d=Math.sin(h);return u*(n[i]-n[t])+d*(e[i]-e[t])<0&&(u=-u,d=-d),{type:"line",px:r,py:o,dx:u,dy:d}}function Cf(n,e,t,i){let s=i-t+1;if(s<4)return null;let r=0,o=0;for(let v=t;v<=i;v++)r+=n[v],o+=e[v];r/=s,o/=s;let a=0,l=0,c=0,h=0,u=0,d=0,f=0;for(let v=t;v<=i;v++){let A=n[v]-r,y=e[v]-o,w=A*A,L=y*y;a+=w,l+=L,c+=A*y,h+=w*A,u+=L*y,d+=A*L,f+=y*w}let m=a*l-c*c;if(!(Math.abs(m)>1e-12*(a+l)*(a+l)))return null;let _=.5*(h+d),g=.5*(u+f),p=(_*l-g*c)/m,x=(a*g-c*_)/m,E=r+p,b=o+x,M=Math.sqrt(p*p+x*x+(a+l)/s);for(let v=0;v<10;v++){let A=0,y=0,w=0,L=0,T=0,C=0,R=0,P=0;for(let X=t;X<=i;X++){let le=n[X]-E,de=e[X]-b,ye=Math.hypot(le,de);if(ye<1e-12)continue;let B=le/ye,G=de/ye,re=ye-M;A+=B*B,y+=B*G,w+=B,L+=G*G,T+=G,C-=B*re,R-=G*re,P-=re}let D=s,k=A*(L*D-T*T)-y*(y*D-T*w)+w*(y*T-L*w);if(!(Math.abs(k)>1e-300))break;let V=-C,j=-R,q=-P,z=(V*(L*D-T*T)-y*(j*D-T*q)+w*(j*T-L*q))/k,H=(A*(j*D-T*q)-V*(y*D-T*w)+w*(y*q-j*w))/k,F=(A*(L*q-j*T)-y*(y*q-j*w)+V*(y*T-L*w))/k;if(E+=z,b+=H,M+=F,Math.abs(z)+Math.abs(H)+Math.abs(F)<1e-10*(1+M))break}return M>0&&M<1e7&&Number.isFinite(E)&&Number.isFinite(b)?{type:"arc",cx:E,cy:b,r:M,ccw:!0}:null}var If=(n,e,t)=>n.type==="line"?Math.abs((e-n.px)*n.dy-(t-n.py)*n.dx):Math.abs(Math.hypot(e-n.cx,t-n.cy)-n.r);function Nh(n,e,t,i,s){let r=0;for(let o=i;o<=s;o++){let a=If(n,e[o],t[o]);a>r&&(r=a)}return r}function Og(n,e,t,i,s,r){let o=Math.atan2(e[t]-r,n[t]-s),a=0;for(let l=t+1;l<=i;l++){let c=Math.atan2(e[l]-r,n[l]-s),h=c-o;h>Math.PI?h-=Ms:h<-Math.PI&&(h+=Ms),a+=h,o=c}return a}var PE=n=>n>=15?3:n>=9?1:0;function vo(n,e,t,i,s){let r=PE(i-t+1);if(s==="arc"){let o=Cf(n,e,t+r,i-r);if(o){let a=Og(n,e,t,i,o.cx,o.cy);return o.ccw=a>0,o.sweep=Math.abs(a),o}}return Ng(n,e,t+r,i-r)}function Rf(n,e,t,i,s,r){let o=[[t,i]];for(;o.length;){let[a,l]=o.pop();if(l-a<2)continue;let c=n[a],h=e[a],u=n[l]-c,d=e[l]-h,f=Math.hypot(u,d),m=-1,_=-1;for(let g=a+1;g<l;g++){let p=f>1e-12?Math.abs((n[g]-c)*d-(e[g]-h)*u)/f:Math.hypot(n[g]-c,e[g]-h);p>m&&(m=p,_=g)}m>s&&(r.push(_),o.push([a,_],[_,l]))}return r}function LE(n,{tol:e,fitCircles:t,fitArcs:i}){let s=n.xs.length,r=n.area>0,o=new Float64Array(4*s+1),a=new Float64Array(4*s+1);for(let p=0;p<=4*s;p++)o[p]=n.xs[p%s],a[p]=n.ys[p%s];if(t&&s>=8){let p=Cf(o,a,0,s-1);if(p&&Nh(p,o,a,0,s-1)<Math.max(1,.01*p.r))return[{type:"circle",c:[p.cx,p.cy],r:p.r,ccw:r}]}let l=0,c=-1;for(let p=1;p<s;p++){let x=(o[p]-o[0])**2+(a[p]-a[0])**2;x>c&&(c=x,l=p)}let h=[0,l];Rf(o,a,0,l,e,h),Rf(o,a,l,s,e,h),h=[...new Set(h.map(p=>p%s))].sort((p,x)=>p-x),h.length<3&&(h=[0,Math.floor(s/3),Math.floor(2*s/3)]);let u=()=>UE(o,a,h);if(s<8)return u();let d=0,f=-1;for(let p=0;p<h.length;p++){let x=h[p],E=p+1<h.length?h[p+1]:h[0]+s,b=Math.hypot(o[E]-o[x],a[E]-a[x]);b>f&&(f=b,d=p)}let m=[];for(let p=0;p<=h.length;p++){let x=d+p;m.push(h[x%h.length]+s+(x>=h.length?s:0))}let _=[],g=m.length-1;for(let p=0;p<g;){let x=p+1;for(;x<g&&Nh(Ng(o,a,m[p],m[x+1]),o,a,m[p],m[x+1])<=e;)x++;let E=-1;if(i){let v=null;for(let A=p+1;A<=g;A++){let y=m[A]-m[p]>=5?Cf(o,a,m[p],m[A]):null;if(!y||Nh(y,o,a,m[p],m[A])>e){if(m[A]-m[p]>=5)break;continue}v=y,E=A}v&&Math.abs(Og(o,a,m[p],m[E],v.cx,v.cy))<Ig&&(E=-1)}let b=E>x,M=b?E:x;_.push({s:m[p],e:m[M],type:b?"arc":"line"}),p=M}if(_.length>2){let p=_[_.length-1],x=_[0];if(p.type===x.type){let E=vo(o,a,p.s,x.e+s,p.type);E.type===p.type&&Nh(E,o,a,p.s,x.e+s)<=e&&(E.type==="line"||E.sweep<Ms-Ig)&&(_.pop(),x.s=p.s-s)}}$a(_,s);for(let p of _)p.P=vo(o,a,p.s,p.e,p.type);for(let p=0;p<3&&_.length>1;p++){for(let x=0;x<_.length;x++)DE(o,a,_,x,s),$a(_,s);for(let x of _)x.P=vo(o,a,x.s,x.e,x.type)}for(let p=0;p<_.length&&_.length>3;){let x=_[p],E=_.length,b=Math.hypot(o[x.e]-o[x.s],a[x.e]-a[x.s]),M=_[(p-1+E)%E],v=_[(p+1)%E],A=Math.round((x.s+x.e)/2),y=[o[A],a[A]];if(b<1+2*e&&Bg(M.P,v.P,e).some(w=>Uh(w,y)<=3+2*e)){M.e=p===0?A+s:A,v.s=p===E-1?A-s:A,_.splice(p,1),$a(_,s);for(let w of[M,v])w.P=vo(o,a,w.s,w.e,w.P.type)}else p++}for(let p=0;p<12&&!(_.length<2||_.length<3&&_.every(b=>b.P.type==="line"));p++){let x=OE(o,a,_,s,e);if(x.ok)return x.segs;let E=_[x.bad];if(E.P.type==="arc"){let b=Rf(o,a,E.s,E.e,e,[E.s,E.e]).sort((v,A)=>v-A),M=[];for(let v=0;v+1<b.length;v++)M.push({s:b[v],e:b[v+1],type:"line",P:vo(o,a,b[v],b[v+1],"line")});_.splice(x.bad,1,...M)}else{let b=_.length,M=Math.round((E.s+E.e)/2),v=_[(x.bad-1+b)%b],A=_[(x.bad+1)%b];v.e=x.bad===0?M+s:M,A.s=x.bad===b-1?M-s:M,_.splice(x.bad,1),$a(_,s);for(let y of[v,A])y.P=vo(o,a,y.s,y.e,y.P.type)}$a(_,s)}return u()}function $a(n,e){if(!n.length)return;let t=n[0].s<e?e:n[0].s>=2*e?-e:0;if(t)for(let i of n)i.s+=t,i.e+=t}function DE(n,e,t,i,s){let r=t.length,o=t[i],a=t[(i-1+r)%r],l=i===0?-s:0,c=a.s+l,h=a.e+l;if(h!==o.s)return;let u=c+Math.ceil((h-c)/2),d=o.s+Math.floor((o.e-o.s)/2);if(d-u<2)return;let f=d-u+1,m=new Float64Array(f+1),_=new Float64Array(f+1);for(let x=0;x<f;x++){let E=n[u+x],b=e[u+x];m[x+1]=m[x]+If(a.P,E,b)**2,_[x+1]=_[x]+If(o.P,E,b)**2}let g=1/0,p=o.s;for(let x=Math.max(u,c+2);x<=Math.min(d,o.e-2);x++){let E=x-u,b=m[E+1]+(_[f]-_[E]);b<g&&(g=b,p=x)}a.e=p-l,o.s=p}var Ug=(n,e,t)=>{let i=(e-n.px)*n.dx+(t-n.py)*n.dy;return[n.px+i*n.dx,n.py+i*n.dy]},Fg=(n,e,t)=>{let i=e-n.cx,s=t-n.cy,r=Math.hypot(i,s)||1;return[n.cx+n.r*i/r,n.cy+n.r*s/r]},Oh=(n,e)=>n.type==="line"?Ug(n,e[0],e[1]):Fg(n,e[0],e[1]),Uh=(n,e)=>Math.hypot(n[0]-e[0],n[1]-e[1]);function Bg(n,e,t){if(n.type==="line"&&e.type==="line"){let l=n.dx*e.dy-n.dy*e.dx;if(Math.abs(l)<1e-9)return[];let c=((e.px-n.px)*e.dy-(e.py-n.py)*e.dx)/l;return[[n.px+c*n.dx,n.py+c*n.dy]]}if(n.type==="arc"&&e.type==="arc"){let l=e.cx-n.cx,c=e.cy-n.cy,h=Math.hypot(l,c);if(h<1e-12||h>n.r+e.r||h<Math.abs(n.r-e.r))return[];let u=(n.r*n.r-e.r*e.r+h*h)/(2*h),d=Math.sqrt(Math.max(0,n.r*n.r-u*u)),f=n.cx+u*l/h,m=n.cy+u*c/h;return[[f+d*c/h,m-d*l/h],[f-d*c/h,m+d*l/h]]}let i=n.type==="line"?n:e,s=n.type==="line"?e:n,r=Ug(i,s.cx,s.cy),o=Uh(r,[s.cx,s.cy]);if(Math.abs(o-s.r)<=t&&o>1e-12)return[Fg(s,r[0],r[1])];if(o>s.r)return[];let a=Math.sqrt(s.r*s.r-o*o);return[[r[0]+a*i.dx,r[1]+a*i.dy],[r[0]-a*i.dx,r[1]-a*i.dy]]}var Lg=(n,e)=>[n.cx+n.r*Math.cos(e),n.cy+n.r*Math.sin(e)],NE=n=>(n%Ms+Ms)%Ms;function OE(n,e,t,i,s){let r=t.length,o=3+2*s,a=[];for(let h=0;h<r;h++){let u=t[(h-1+r)%r].P,d=t[h].P,f=[n[t[h].s],e[t[h].s]],m=null,_=1/0;for(let g of Bg(u,d,s)){let p=Uh(g,f);p<_&&(_=p,m=g)}if(m&&_<=o)a.push({endA:m,startB:m,bridge:!1});else if(u.type==="line"&&d.type==="line"){let g=Oh(u,f),p=Oh(d,f),x=[(g[0]+p[0])/2,(g[1]+p[1])/2];a.push({endA:x,startB:x,bridge:!1})}else a.push({endA:Oh(u,f),startB:Oh(d,f),bridge:!0})}let l=[];for(let h=0;h<r;h++){let u=t[h],d=u.P,f=a[h].startB,m=a[(h+1)%r].endA;if(d.type==="line"){let g=m[0]-f[0],p=m[1]-f[1];if(!(g*d.dx+p*d.dy>1e-6))return{ok:!1,bad:h};l.push({type:"line",p0:f,p1:m})}else{let g=Math.atan2(f[1]-d.cy,f[0]-d.cx),p=Math.atan2(m[1]-d.cy,m[0]-d.cx),x=NE(d.ccw?p-g:g-p);if(x<1e-12&&(x=Ms),Math.abs(x-d.sweep)>.5*d.sweep+2*o/d.r||x>=Ms-1e-9)return{ok:!1,bad:h};l.push({type:"arc",c:[d.cx,d.cy],r:d.r,a0:g,a1:p,ccw:d.ccw})}let _=a[(h+1)%r];_.bridge&&Uh(_.endA,_.startB)>1e-9&&l.push({type:"line",p0:_.endA,p1:_.startB,bridge:!0})}let c=l.length;for(let h=0;h<c;h++){let u=l[h],d=l[(h+1)%c];u.type==="arc"&&d.type==="line"?d.p0=Lg({cx:u.c[0],cy:u.c[1],r:u.r},u.a1):u.type==="line"&&d.type==="arc"?u.p1=Lg({cx:d.c[0],cy:d.c[1],r:d.r},d.a0):u.type==="line"&&d.type==="line"&&(d.p0=u.p1)}for(let h of l)delete h.bridge;return{ok:!0,segs:l}}function UE(n,e,t){let i=[];for(let s=0;s<t.length;s++){let r=t[s],o=t[(s+1)%t.length];i.push({type:"line",p0:[n[r],e[r]],p1:[n[o],e[o]]})}for(let s=0;s<i.length;s++)i[(s+1)%i.length].p0=i[s].p1;return i}var kg={mm:1,cm:10,m:1e3,in:25.4,ft:304.8},FE={top:"superior",front:"frontal",right:"lateral derecha",left:"lateral izquierda"},BE=["top","front","right","left"],kE=new Set(["png","jpg","jpeg","bmp","gif","webp"]);function Gg(n,e){let t=String(n||"").toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];if(t==="dxf")return"dxf";if(t==="svg")return"svg";if(kE.has(t))return"image";if(e!=null){let i=e;if(typeof i!="string"){i="";for(let s=0;s<Math.min(e.length,256);s++)i+=String.fromCharCode(e[s])}if(/^\s*0\s*\r?\n\s*SECTION\b/.test(i))return"dxf"}return null}function kh(n,e,t=""){if(n==="dxf"){let i=wg(e),s=i.units;return{format:n,fileName:t,units:{name:s.assumed??s.name,toMM:s.toMM,detected:!s.assumed},layers:i.layers,segments:i.segments,texts:i.texts,warnings:i.warnings,stats:i.stats}}if(n==="svg"){let i=Cg(e),s=i.units||{name:"mm",toMM:1},r=[...new Set(i.segments.map(o=>o.meta?.layer).filter(o=>o!=null))];return{format:n,fileName:t,units:{name:s.name,toMM:s.toMM,detected:s.detected??(s.name!=="px"&&s.name!=="unitless")},layers:(r.length?r:["SVG"]).map(o=>({name:o})),segments:i.segments,texts:[],warnings:i.warnings||[],stats:{segments:i.segments.length}}}throw new Error(`Formato de plano no soportado: ${n}`)}function Wg(n,e={}){let{mmPerPx:t,fileName:i="",...s}=e,r=Dg(n,s),o={layer:"Trazado",entity:"TRACE"};return{format:"image",fileName:i,units:{name:"px",toMM:t??1,detected:!1},threshold:r.threshold,layers:[{name:"Trazado"}],segments:r.segments.map(a=>a.meta?a:{...a,meta:o}),texts:[],warnings:r.warnings||[],stats:r.stats}}function Xg(n,{unitOverride:e="auto",ignoreDashed:t=!0,hiddenLayers:i=[],tol:s=.01,chordTol:r=.01,detectFrame:o=!0,frameLoops:a=null,concentricAsAnnotation:l=!0,annotationLoops:c=null}={}){let h;if(e==null||e==="auto")h=n.units.toMM;else if(typeof e=="number"&&e>0)h=e;else if(kg[e])h=kg[e];else throw new Error(`Unidad desconocida: ${e}`);let u=new Set((n.layers||[]).filter(R=>R.frozen||R.off).map(R=>R.name)),d=new Set([...u,...i]),f=[h,0,0,h,0,0],m=R=>h===1?R:zi(R,f),_=[],g=[],p=0,x=0,E=new Map;for(let R of n.segments){let P=tg(R);if(P){E.set(P,(E.get(P)||0)+1);continue}let D=R.meta?.layer,k=!!R.meta?.dashed;if(k&&R.type==="line"&&!d.has(D)){let V=m(R);g.push({p0:V.p0,p1:V.p1,length:Fa(V)})}d.has(D)?p++:t&&k?x++:_.push(m(R))}g.sort((R,P)=>P.length-R.length);let b=lg(_,{tol:s}),M=b.loops.map(R=>za(R,r)),v=[];for(let[R,P]of E)v.push(`Se omitieron ${P} entidad(es) con geometr\xEDa inv\xE1lida: ${R}.`);let A;Array.isArray(a)?A=[...new Set(a)].filter(R=>Number.isInteger(R)&&R>=0&&R<b.loops.length).sort((R,P)=>R-P):o?(A=zE(b.loops,M,wh(b.loops,{chordTol:r}).nodes,s),A.length&&v.push("Se detect\xF3 el marco del plano y se excluy\xF3 del modelo (act\xEDvalo con \xABIncluir marco en el modelo\xBB en el paso 1).")):A=[];let y=new Set(A),w=[];if(Array.isArray(c))w=[...new Set(c)].filter(R=>Number.isInteger(R)&&R>=0&&R<b.loops.length&&!y.has(R)).sort((R,P)=>R-P);else if(l){let R=HE(b.loops,M,Hg(b.loops,A,r).nodes,s);if(w=R.map(P=>P.outer),R.length){let P=R.slice(0,3).map(D=>(2*M[D.inner].circle.r).toFixed(3)).join(", ");v.push(`Se interpretaron ${R.length} pares de c\xEDrculos conc\xE9ntricos como avellanado o rosca: se usa el c\xEDrculo interior como barreno (\xD8 ${P}).`)}}let{nodes:L,regions:T}=Hg(b.loops,[...A,...w],r,new Set(w)),C=T.reduce((R,P)=>R+P.holes.length,0);return b.loops.length||v.push("No se encontraron contornos cerrados en el plano."),b.open.length&&v.push(`${b.open.length} cadena(s) abierta(s) no forman contorno y no se usar\xE1n en 3D.`),{toMM:h,tol:s,segments:_,loops:b.loops,loopInfos:M,open:b.open,regions:T,nodes:L,frameLoops:A,annotationLoops:w,axisLines:g,stats:{segmentsIn:n.segments.length,segmentsUsed:_.length,hiddenRemoved:p,dashedRemoved:x,duplicatesRemoved:b.stats.duplicatesRemoved,zeroLengthRemoved:b.stats.zeroLengthRemoved,loops:b.loops.length,regions:T.length,holes:C,openChains:b.open.length},bbox:_f(_),warnings:v}}function zg(n,e){let t=e.bbox,i=Math.max(t.maxX-t.minX,t.maxY-t.minY),s=1e-9*Math.max(1,i);if(!n.segs.every(o=>o.type==="line"&&(Math.abs(o.p0[0]-o.p1[0])<=s||Math.abs(o.p0[1]-o.p1[1])<=s)))return!1;let r=(t.maxX-t.minX)*(t.maxY-t.minY);return r>0&&Math.abs(e.area-r)<=1e-6*r}function Yg(n,e,t){return!!(n.circle&&e.circle)&&Math.hypot(n.circle.c[0]-e.circle.c[0],n.circle.c[1]-e.circle.c[1])<=t}function zE(n,e,t,i){let s=t.map((r,o)=>o).filter(r=>t[r].parent===-1&&zg(n[r],e[r])).sort((r,o)=>e[o].area-e[r].area);for(let r of s){let o=t[r].children,a=e[r].bbox;if(o.length===1&&t[o[0]].children.length>=1&&zg(n[o[0]],e[o[0]])){let l=e[o[0]].bbox,c=Math.max(20,.08*Math.min(a.maxX-a.minX,a.maxY-a.minY));if([l.minX-a.minX,l.minY-a.minY,a.maxX-l.maxX,a.maxY-l.maxY].every(u=>u>0&&u<=c))return[r,o[0]].sort((u,d)=>u-d)}if(o.some(l=>t[l].children.some(c=>!Yg(e[l],e[c],i))))return[r]}return[]}function HE(n,e,t,i){let s=[];return t.forEach((r,o)=>{if(r.frame||r.depth%2!==1||!e[o].circle)return;let a=r.children.find(l=>Yg(e[o],e[l],i)&&e[l].circle.r<e[o].circle.r);a!=null&&s.push({outer:o,inner:a})}),s}function Hg(n,e,t,i=new Set){if(!e.length)return wh(n,{chordTol:t});let s=new Set(e),r=n.map((c,h)=>h).filter(c=>!s.has(c)),o=wh(r.map(c=>n[c]),{chordTol:t}),a=n.map((c,h)=>({loop:c,parent:-1,depth:0,children:[],...i.has(h)?{annotation:!0}:{frame:!0}}));o.nodes.forEach((c,h)=>{a[r[h]]={loop:c.loop,parent:c.parent<0?-1:r[c.parent],depth:c.depth,children:c.children.map(u=>r[u])}});let l=o.regions.map(c=>({outer:r[c.outer],holes:c.holes.map(h=>r[h])}));return{nodes:a,regions:l}}function zh(n){let e=[],t=n.regions.map(r=>({included:!0,height:null,z0:null,holes:r.holes.map(()=>({op:"through",depth:null}))})),i={axisKind:"x",axis:{p:[0,0],d:[1,0]},angleDeg:360},s=n.axisLines?.[0];if(s){let r=[s.p1[0]-s.p0[0],s.p1[1]-s.p0[1]],o=Math.hypot(r[0],r[1]);r=[r[0]/o,r[1]/o],(r[0]<-1e-12||Math.abs(r[0])<=1e-12&&r[1]<0)&&(r=[-r[0],-r[1]]);let a=n.tol??.01;Math.abs(r[1])<=1e-9&&Math.abs(s.p0[1])<=a?i={axisKind:"x",axis:{p:[0,0],d:[1,0]},angleDeg:360}:Math.abs(r[0])<=1e-9&&Math.abs(s.p0[0])<=a?i={axisKind:"y",axis:{p:[0,0],d:[0,1]},angleDeg:360}:i={axisKind:"line",axis:{p:s.p0.slice(),d:r},angleDeg:360}}return{mode:"extrude",thickness:2,symmetric:!1,regions:t,fillets:{vertical:0,top:0,chamferTop:0},revolve:i,multiview:{windows:{top:null,front:null,right:null,left:null}},warnings:e}}function $g(n,e={}){let t={...n};return e.mode&&(t.mode=e.mode),e.thickness!=null&&(t.thickness=e.thickness),e.revolve&&(t.revolve={...n.revolve,...e.revolve}),e.multiview?.windows&&(t.multiview={...n.multiview,windows:{...n.multiview.windows,...e.multiview.windows}}),t}var Fh=n=>({segs:n.segs.map(({meta:e,...t})=>t)}),Mo=(n,e)=>n.regions?.[e]??{included:!0,height:null,z0:null,holes:[]},So=(n,e)=>n.holes?.[e]??{op:"through",depth:null},Pf=(n,e)=>e.height??n.thickness,qg=(n,e)=>n.depth??e/2,Bh=(n,e)=>{let t=Pf(n,e),i=e.z0??(n.symmetric?-t/2:0);return[i,i+t]};function jg(n,e){let t=new Map(n.regions.map((i,s)=>[i.outer,s]));return n.regions.map(i=>{let s=n.nodes[i.outer].parent;for(;s>=0;){let r=t.get(n.nodes[s].parent);if(r==null)return-1;let o=Mo(e,r);if(o.included!==!1&&So(o,n.regions[r].holes.indexOf(s)).op==="none")return r;s=n.nodes[n.regions[r].outer].parent}return-1})}function Zg(n){return n.axisKind==="y"?{p:[0,0],d:[0,1]}:n.axisKind==="line"?{p:n.axis.p.slice(),d:n.axis.d.slice()}:{p:[0,0],d:[1,0]}}function VE(n){return{minX:Math.min(n.minX,n.maxX),minY:Math.min(n.minY,n.maxY),maxX:Math.max(n.minX,n.maxX),maxY:Math.max(n.minY,n.maxY)}}var Vg={low:[.001,.3],high:[5e-5,.08]};function Kg(n,e,{meshQuality:t="normal"}={}){let i={mode:e.mode,tol:n.tol??.01,regions:[]},s=n.regions.map((r,o)=>({r,i:o,rs:Mo(e,o)})).filter(r=>r.rs.included!==!1);if(e.mode==="extrude"||e.mode==="revolve"){if(!s.length)throw new Error("No hay regiones incluidas para construir la pieza.");i.regions=s.map(({r,i:o,rs:a})=>{let l=Pf(e,a),c=[];r.holes.forEach((u,d)=>{let f=So(a,d);f.op!=="none"&&c.push({loop:Fh(n.loops[u]),op:f.op,depth:f.op==="blind"?qg(f,l):void 0})});let h={id:o+1,outer:Fh(n.loops[r.outer]),holes:c};return a.height!=null&&(h.height=a.height),a.z0!=null&&(h.z0=a.z0),h}),e.mode==="extrude"?i.extrude={thickness:e.thickness,symmetric:!!e.symmetric,fillets:{vertical:0,top:0,chamferTop:0,...e.fillets}}:i.revolve={axis:Zg(e.revolve),angleDeg:e.revolve.angleDeg??360}}else if(e.mode==="multiview"){let r=i.tol,o=[];for(let a of BE){let l=e.multiview?.windows?.[a];if(!l)continue;let c=VE(l),h=s.filter(({r:u})=>{let d=n.loopInfos[u.outer].bbox;return d.minX>=c.minX-r&&d.minY>=c.minY-r&&d.maxX<=c.maxX+r&&d.maxY<=c.maxY+r}).map(({r:u,rs:d})=>({outer:Fh(n.loops[u.outer]),holes:u.holes.filter((f,m)=>So(d,m).op!=="none").map(f=>Fh(n.loops[f]))}));if(!h.length)throw new Error(`La vista ${FE[a]} no contiene ninguna regi\xF3n; ajuste su ventana.`);o.push({role:a,regions:h})}if(o.length<2)throw new Error("Defina al menos dos vistas (ventanas) para reconstruir la pieza.");i.multiview={views:o}}else throw new Error(`Modo de construcci\xF3n desconocido: ${e.mode}`);if(typeof t=="object"&&t)i.mesh={...t};else if(Vg[t]&&n.bbox){let r=n.bbox,o=Math.hypot(r.maxX-r.minX,r.maxY-r.minY),[a,l]=Vg[t];i.mesh={tolerance:Math.max(.001,o*a),angularTolerance:l}}return i}function GE(n,e){let t=0,i=0,s=0,r=0,o=[],a=null,l=jg(n,e);return n.regions.forEach((c,h)=>{let u=Mo(e,h);if(u.included===!1||l[h]>=0)return;let d=n.loopInfos[c.outer];t+=d.area,i+=d.perimeter,r++;let f=d.bbox;a=a?{minX:Math.min(a.minX,f.minX),minY:Math.min(a.minY,f.minY),maxX:Math.max(a.maxX,f.maxX),maxY:Math.max(a.maxY,f.maxY)}:{...f},c.holes.forEach((m,_)=>{let g=So(u,_).op;if(g==="none")return;let p=n.loopInfos[m];r++,g==="through"&&(t-=p.area,s+=p.perimeter),o.push({d:p.circle?2*p.circle.r:null,c:(p.circle?p.circle.c:p.centroid).slice(),area:p.area,perimeter:p.perimeter,op:g})})}),{netArea:t,perimeterOuter:i,perimeterInner:s,loops:r,holes:o,bbox2d:a}}function WE(n,e){let t=jg(n,e),i=n.regions.map((o,a)=>({r:o,i:a,rs:Mo(e,a)})).filter(o=>o.rs.included!==!1);if(!i.length)return null;if(e.mode==="extrude")for(let{i:o,rs:a}of i){if(t[o]<0)continue;let[l,c]=Bh(e,a),[h,u]=Bh(e,Mo(e,t[o]));if(l<h||c>u)return null}let s=i.filter(o=>t[o.i]<0),r=o=>n.loopInfos[o];if(e.mode==="extrude"){let o=e.fillets||{};if((o.vertical||0)>0||(o.top||0)>0||(o.chamferTop||0)>0)return null;let a=0;for(let{r:l,rs:c}of s){let h=Pf(e,c),u=r(l.outer).area;l.holes.forEach((d,f)=>{let m=So(c,f);m.op==="through"?u-=r(d).area:m.op==="blind"&&(u-=r(d).area*Math.min(qg(m,h),h)/h)}),a+=u*h}return a}if(e.mode==="revolve"){let{p:o,d:a}=Zg(e.revolve),l=Math.hypot(a[0],a[1]),c=d=>(a[0]*(d[1]-o[1])-a[1]*(d[0]-o[0]))/l,h=0,u=0;for(let{r:d,rs:f}of s){let m=r(d.outer),_=Math.sign(c(m.centroid));if(u&&_&&_!==u)return null;u=u||_,h+=m.area*Math.abs(c(m.centroid)),d.holes.forEach((g,p)=>{So(f,p).op!=="none"&&(h-=r(g).area*Math.abs(c(r(g).centroid)))})}return(e.revolve.angleDeg??360)*Math.PI/180*h}return null}function Jg({build:n,profile:e,op:t,material:i,pricePerKg:s,blankMargin:r=0}){let o=!0;if(t.mode==="extrude"){let[a,l]=Bh(t,{});o=e.regions.every((c,h)=>{let u=Mo(t,h);if(u.included===!1)return!0;let[d,f]=Bh(t,u);return Math.abs(d-a)<=1e-9&&Math.abs(f-l)<=1e-9})}return mg({build:n,material:i,mode:t.mode,profile:GE(e,t),thickness:t.mode==="extrude"?t.thickness:void 0,pricePerKg:s,blankMargin:r,sheetApplicable:o,analyticVolume:WE(e,t)??void 0})}var Qg=`  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1015
  9
$INSUNITS
 70
4
  9
$MEASUREMENT
 70
1
  0
ENDSEC
  0
SECTION
  2
TABLES
  0
TABLE
  2
LTYPE
 70
3
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CONTINUOUS
 70
0
  3
Solid line
 72
65
 73
0
 40
0
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CENTER
 70
0
  3
Center ____ _ ____ _
 72
65
 73
4
 40
50.800000000000004
 49
31.75
 49
-6.35
 49
6.35
 49
-6.35
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
HIDDEN
 70
0
  3
Hidden __ __ __
 72
65
 73
2
 40
9.524999999999999
 49
6.35
 49
-3.175
  0
ENDTAB
  0
TABLE
  2
LAYER
 70
7
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
0
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
CONTORNO
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
BARRENOS
 70
0
 62
3
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
EJES
 70
0
 62
1
  6
CENTER
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
OCULTAS
 70
0
 62
6
  6
HIDDEN
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
COTAS
 70
0
 62
2
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
TEXTO
 70
0
 62
4
  6
CONTINUOUS
  0
ENDTAB
  0
ENDSEC
  0
SECTION
  2
BLOCKS
  0
BLOCK
  8
0
100
AcDbBlockBegin
  2
*D1
 70
1
 10
0
 20
0
 30
0
  3
*D1
  0
LINE
  5
100
100
AcDbEntity
  8
0
100
AcDbLine
 10
0
 20
0
 30
0
 11
0
 21
-12
 31
0
  0
LINE
  5
101
100
AcDbEntity
  8
0
100
AcDbLine
 10
150
 20
0
 30
0
 11
150
 21
-12
 31
0
  0
LINE
  5
102
100
AcDbEntity
  8
0
100
AcDbLine
 10
0
 20
-12
 30
0
 11
150
 21
-12
 31
0
  0
ENDBLK
  8
0
100
AcDbBlockEnd
  0
BLOCK
  8
0
100
AcDbBlockBegin
  2
*D2
 70
1
 10
0
 20
0
 30
0
  3
*D2
  0
LINE
  5
103
100
AcDbEntity
  8
0
100
AcDbLine
 10
150
 20
0
 30
0
 11
150
 21
0
 31
0
  0
LINE
  5
104
100
AcDbEntity
  8
0
100
AcDbLine
 10
150
 20
80
 30
0
 11
150
 21
0
 31
0
  0
LINE
  5
105
100
AcDbEntity
  8
0
100
AcDbLine
 10
150
 20
0
 30
0
 11
150
 21
0
 31
0
  0
ENDBLK
  8
0
100
AcDbBlockEnd
  0
BLOCK
  8
0
100
AcDbBlockBegin
  2
*D3
 70
1
 10
0
 20
0
 30
0
  3
*D3
  0
LINE
  5
106
100
AcDbEntity
  8
0
100
AcDbLine
 10
65
 20
0
 30
0
 11
65
 21
-6
 31
0
  0
LINE
  5
107
100
AcDbEntity
  8
0
100
AcDbLine
 10
85
 20
0
 30
0
 11
85
 21
-6
 31
0
  0
LINE
  5
108
100
AcDbEntity
  8
0
100
AcDbLine
 10
65
 20
-6
 30
0
 11
85
 21
-6
 31
0
  0
ENDBLK
  8
0
100
AcDbBlockEnd
  0
ENDSEC
  0
SECTION
  2
ENTITIES
  0
LWPOLYLINE
  5
109
100
AcDbEntity
  8
CONTORNO
100
AcDbPolyline
 90
12
 70
1
 10
6
 20
0
 10
65
 20
0
 10
65
 20
15
 10
85
 20
15
 10
85
 20
0
 10
144
 20
0
 42
0.41421356237309503
 10
150
 20
6
 10
150
 20
74
 42
0.41421356237309503
 10
144
 20
80
 10
6
 20
80
 42
0.41421356237309503
 10
0
 20
74
 10
0
 20
6
 42
0.41421356237309503
  0
LWPOLYLINE
  5
10A
100
AcDbEntity
  8
CONTORNO
100
AcDbPolyline
 90
4
 70
1
 10
65
 20
62
 10
85
 20
62
 42
1
 10
85
 20
72
 10
65
 20
72
 42
1
  0
CIRCLE
  5
10B
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
15
 20
15
 30
0
 40
4.25
  0
LINE
  5
10C
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
8
 20
15
 30
0
 11
22
 21
15
 31
0
  0
LINE
  5
10D
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
15
 20
8
 30
0
 11
15
 21
22
 31
0
  0
CIRCLE
  5
10E
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
135
 20
15
 30
0
 40
4.25
  0
LINE
  5
10F
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
128
 20
15
 30
0
 11
142
 21
15
 31
0
  0
LINE
  5
110
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
135
 20
8
 30
0
 11
135
 21
22
 31
0
  0
CIRCLE
  5
111
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
15
 20
65
 30
0
 40
4.25
  0
LINE
  5
112
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
8
 20
65
 30
0
 11
22
 21
65
 31
0
  0
LINE
  5
113
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
15
 20
58
 30
0
 11
15
 21
72
 31
0
  0
CIRCLE
  5
114
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
135
 20
65
 30
0
 40
4.25
  0
LINE
  5
115
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
128
 20
65
 30
0
 11
142
 21
65
 31
0
  0
LINE
  5
116
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
135
 20
58
 30
0
 11
135
 21
72
 31
0
  0
CIRCLE
  5
117
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
75
 20
40
 30
0
 40
12.5
  0
LINE
  5
118
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
59
 20
40
 30
0
 11
91
 21
40
 31
0
  0
LINE
  5
119
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
75
 20
24
 30
0
 11
75
 21
56
 31
0
  0
LINE
  5
11A
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
58
 20
67
 30
0
 11
92
 21
67
 31
0
  0
DIMENSION
  5
11B
100
AcDbEntity
  8
COTAS
100
AcDbDimension
  2
*D1
 10
75
 20
-12
 30
0
 70
1
100
AcDbAlignedDimension
 13
0
 23
0
 33
0
 14
150
 24
0
 34
0
  0
DIMENSION
  5
11C
100
AcDbEntity
  8
COTAS
100
AcDbDimension
  2
*D2
 10
162
 20
40
 30
0
 70
1
100
AcDbAlignedDimension
 13
150
 23
0
 33
0
 14
150
 24
80
 34
0
  0
DIMENSION
  5
11D
100
AcDbEntity
  8
COTAS
100
AcDbDimension
  2
*D3
 10
75
 20
-6
 30
0
 70
1
100
AcDbAlignedDimension
 13
65
 23
0
 33
0
 14
85
 24
0
 34
0
  0
TEXT
  5
11E
100
AcDbEntity
  8
TEXTO
100
AcDbText
 10
0
 20
90
 30
0
 40
5
  1
PLACA SOPORTE  e=3 mm  4x%%c8.5
 50
0
100
AcDbText
  0
MTEXT
  5
11F
100
AcDbEntity
  8
TEXTO
100
AcDbMText
 10
0
 20
100
 30
0
 40
3.5
 71
1
  1
{\\fArial|b0;Material:} Acero SAE 1010\\PTolerancia \\U+00B10.1
  0
ENDSEC
  0
EOF
`;var e_=`  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1015
  9
$INSUNITS
 70
4
  9
$MEASUREMENT
 70
1
  0
ENDSEC
  0
SECTION
  2
TABLES
  0
TABLE
  2
LTYPE
 70
3
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CONTINUOUS
 70
0
  3
Solid line
 72
65
 73
0
 40
0
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CENTER
 70
0
  3
Center ____ _ ____ _
 72
65
 73
4
 40
50.800000000000004
 49
31.75
 49
-6.35
 49
6.35
 49
-6.35
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
HIDDEN
 70
0
  3
Hidden __ __ __
 72
65
 73
2
 40
9.524999999999999
 49
6.35
 49
-3.175
  0
ENDTAB
  0
TABLE
  2
LAYER
 70
7
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
0
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
CONTORNO
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
BARRENOS
 70
0
 62
3
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
EJES
 70
0
 62
1
  6
CENTER
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
OCULTAS
 70
0
 62
6
  6
HIDDEN
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
COTAS
 70
0
 62
2
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
TEXTO
 70
0
 62
4
  6
CONTINUOUS
  0
ENDTAB
  0
ENDSEC
  0
SECTION
  2
BLOCKS
  0
BLOCK
  8
0
100
AcDbBlockBegin
  2
BARRENO
 70
0
 10
0
 20
0
 30
0
  3
BARRENO
  0
CIRCLE
  5
100
100
AcDbEntity
  8
0
 62
0
100
AcDbCircle
 10
0
 20
0
 30
0
 40
7
  0
ENDBLK
  8
0
100
AcDbBlockEnd
  0
BLOCK
  8
0
100
AcDbBlockBegin
  2
BARRENO_PCD
 70
0
 10
10
 20
10
 30
0
  3
BARRENO_PCD
  0
INSERT
  5
101
100
AcDbEntity
  8
0
100
AcDbBlockReference
  2
BARRENO
 10
65
 20
10
 30
0
 41
1
 42
1
 43
1
 50
0
  0
ENDBLK
  8
0
100
AcDbBlockEnd
  0
ENDSEC
  0
SECTION
  2
ENTITIES
  0
CIRCLE
  5
102
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
0
 20
0
 30
0
 40
75
  0
ARC
  5
103
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
0
 20
0
 30
0
 40
30
100
AcDbArc
 50
99.59406822686046
 51
80.40593177313954
  0
LINE
  5
104
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
5
 20
29.58039891549808
 30
0
 11
5
 21
34
 31
0
  0
LINE
  5
105
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
5
 20
34
 30
0
 11
-5
 21
34
 31
0
  0
LINE
  5
106
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
-5
 20
34
 30
0
 11
-5
 21
29.58039891549808
 31
0
  0
INSERT
  5
107
100
AcDbEntity
  8
BARRENOS
100
AcDbBlockReference
  2
BARRENO_PCD
 10
0
 20
0
 30
0
 41
1
 42
1
 43
1
 50
22.5
  0
INSERT
  5
108
100
AcDbEntity
  8
BARRENOS
100
AcDbBlockReference
  2
BARRENO_PCD
 10
0
 20
0
 30
0
 41
1
 42
1
 43
1
 50
67.5
  0
INSERT
  5
109
100
AcDbEntity
  8
BARRENOS
100
AcDbBlockReference
  2
BARRENO_PCD
 10
0
 20
0
 30
0
 41
1
 42
1
 43
1
 50
112.5
  0
INSERT
  5
10A
100
AcDbEntity
  8
BARRENOS
100
AcDbBlockReference
  2
BARRENO_PCD
 10
0
 20
0
 30
0
 41
1
 42
1
 43
1
 50
157.5
  0
INSERT
  5
10B
100
AcDbEntity
  8
BARRENOS
100
AcDbBlockReference
  2
BARRENO_PCD
 10
0
 20
0
 30
0
 41
1
 42
1
 43
1
 50
202.5
  0
INSERT
  5
10C
100
AcDbEntity
  8
BARRENOS
100
AcDbBlockReference
  2
BARRENO_PCD
 10
0
 20
0
 30
0
 41
1
 42
1
 43
1
 50
247.5
  0
INSERT
  5
10D
100
AcDbEntity
  8
BARRENOS
100
AcDbBlockReference
  2
BARRENO_PCD
 10
0
 20
0
 30
0
 41
1
 42
1
 43
1
 50
292.5
  0
INSERT
  5
10E
100
AcDbEntity
  8
BARRENOS
100
AcDbBlockReference
  2
BARRENO_PCD
 10
0
 20
0
 30
0
 41
1
 42
1
 43
1
 50
337.5
  0
CIRCLE
  5
10F
100
AcDbEntity
  8
EJES
100
AcDbCircle
 10
0
 20
0
 30
0
 40
55
  0
LINE
  5
110
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
-82
 20
0
 30
0
 11
82
 21
0
 31
0
  0
LINE
  5
111
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
0
 20
-82
 30
0
 11
0
 21
82
 31
0
  0
TEXT
  5
112
100
AcDbEntity
  8
TEXTO
100
AcDbText
 10
-40
 20
-95
 30
0
 40
5
  1
BRIDA %%c150 - 8 BARRENOS %%c14 EN PCD 110
 50
0
100
AcDbText
  0
ENDSEC
  0
EOF
`;var t_=`  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1015
  9
$INSUNITS
 70
4
  9
$MEASUREMENT
 70
1
  0
ENDSEC
  0
SECTION
  2
TABLES
  0
TABLE
  2
LTYPE
 70
3
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CONTINUOUS
 70
0
  3
Solid line
 72
65
 73
0
 40
0
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CENTER
 70
0
  3
Center ____ _ ____ _
 72
65
 73
4
 40
50.800000000000004
 49
31.75
 49
-6.35
 49
6.35
 49
-6.35
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
HIDDEN
 70
0
  3
Hidden __ __ __
 72
65
 73
2
 40
9.524999999999999
 49
6.35
 49
-3.175
  0
ENDTAB
  0
TABLE
  2
LAYER
 70
7
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
0
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
CONTORNO
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
BARRENOS
 70
0
 62
3
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
EJES
 70
0
 62
1
  6
CENTER
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
OCULTAS
 70
0
 62
6
  6
HIDDEN
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
COTAS
 70
0
 62
2
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
TEXTO
 70
0
 62
4
  6
CONTINUOUS
  0
ENDTAB
  0
ENDSEC
  0
SECTION
  2
BLOCKS
  0
ENDSEC
  0
SECTION
  2
ENTITIES
  0
LINE
  5
100
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
0
 20
0
 30
0
 11
0
 21
9
 31
0
  0
LINE
  5
101
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
0
 20
9
 30
0
 11
1
 21
10
 31
0
  0
LINE
  5
102
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
1
 20
10
 30
0
 11
38
 21
10
 31
0
  0
ARC
  5
103
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
38
 20
12
 30
0
 40
2
100
AcDbArc
 50
270
 51
360
  0
LINE
  5
104
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
40
 20
12
 30
0
 11
40
 21
14
 31
0
  0
LINE
  5
105
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
40
 20
14
 30
0
 11
41
 21
15
 31
0
  0
LINE
  5
106
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
41
 20
15
 30
0
 11
79
 21
15
 31
0
  0
LINE
  5
107
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
79
 20
15
 30
0
 11
80
 21
14
 31
0
  0
LINE
  5
108
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
80
 20
14
 30
0
 11
80
 21
12
 31
0
  0
LINE
  5
109
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
80
 20
12
 30
0
 11
100
 21
12
 31
0
  0
LINE
  5
10A
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
100
 20
12
 30
0
 11
100
 21
10.5
 31
0
  0
LINE
  5
10B
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
100
 20
10.5
 30
0
 11
103
 21
10.5
 31
0
  0
LINE
  5
10C
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
103
 20
10.5
 30
0
 11
103
 21
12
 31
0
  0
LINE
  5
10D
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
103
 20
12
 30
0
 11
119
 21
12
 31
0
  0
LINE
  5
10E
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
119
 20
12
 30
0
 11
120
 21
11
 31
0
  0
LINE
  5
10F
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
120
 20
11
 30
0
 11
120
 21
0
 31
0
  0
LINE
  5
110
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
120
 20
0
 30
0
 11
0
 21
0
 31
0
  0
LINE
  5
111
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
-10
 20
0
 30
0
 11
130
 21
0
 31
0
  0
TEXT
  5
112
100
AcDbEntity
  8
TEXTO
100
AcDbText
 10
0
 20
-10
 30
0
 40
4
  1
FLECHA - MEDIO PERFIL (REVOLUCION EN X)
 50
0
100
AcDbText
  0
ENDSEC
  0
EOF
`;var n_=`  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1015
  9
$INSUNITS
 70
4
  9
$MEASUREMENT
 70
1
  0
ENDSEC
  0
SECTION
  2
TABLES
  0
TABLE
  2
LTYPE
 70
3
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CONTINUOUS
 70
0
  3
Solid line
 72
65
 73
0
 40
0
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CENTER
 70
0
  3
Center ____ _ ____ _
 72
65
 73
4
 40
50.800000000000004
 49
31.75
 49
-6.35
 49
6.35
 49
-6.35
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
HIDDEN
 70
0
  3
Hidden __ __ __
 72
65
 73
2
 40
9.524999999999999
 49
6.35
 49
-3.175
  0
ENDTAB
  0
TABLE
  2
LAYER
 70
7
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
0
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
CONTORNO
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
BARRENOS
 70
0
 62
3
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
EJES
 70
0
 62
1
  6
CENTER
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
OCULTAS
 70
0
 62
6
  6
HIDDEN
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
COTAS
 70
0
 62
2
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
TEXTO
 70
0
 62
4
  6
CONTINUOUS
  0
ENDTAB
  0
ENDSEC
  0
SECTION
  2
BLOCKS
  0
ENDSEC
  0
SECTION
  2
ENTITIES
  0
LWPOLYLINE
  5
100
100
AcDbEntity
  8
CONTORNO
100
AcDbPolyline
 90
6
 70
1
 10
0
 20
0
 10
80
 20
0
 10
80
 20
12
 10
12
 20
12
 10
12
 20
40
 10
0
 20
40
  0
LINE
  5
101
100
AcDbEntity
  8
OCULTAS
100
AcDbLine
 10
38
 20
0
 30
0
 11
38
 21
12
 31
0
  0
LINE
  5
102
100
AcDbEntity
  8
OCULTAS
100
AcDbLine
 10
54
 20
0
 30
0
 11
54
 21
12
 31
0
  0
LWPOLYLINE
  5
103
100
AcDbEntity
  8
CONTORNO
100
AcDbPolyline
 90
4
 70
1
 10
0
 20
70
 10
80
 20
70
 10
80
 20
120
 10
0
 20
120
  0
LINE
  5
104
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
12
 20
70
 30
0
 11
12
 21
120
 31
0
  0
CIRCLE
  5
105
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
46
 20
95
 30
0
 40
8
  0
LWPOLYLINE
  5
106
100
AcDbEntity
  8
CONTORNO
100
AcDbPolyline
 90
4
 70
1
 10
110
 20
0
 10
160
 20
0
 10
160
 20
40
 10
110
 20
40
  0
LINE
  5
107
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
110
 20
12
 30
0
 11
160
 21
12
 31
0
  0
LINE
  5
108
100
AcDbEntity
  8
OCULTAS
100
AcDbLine
 10
127
 20
0
 30
0
 11
127
 21
12
 31
0
  0
LINE
  5
109
100
AcDbEntity
  8
OCULTAS
100
AcDbLine
 10
143
 20
0
 30
0
 11
143
 21
12
 31
0
  0
TEXT
  5
10A
100
AcDbEntity
  8
TEXTO
100
AcDbText
 10
0
 20
-10
 30
0
 40
4
  1
BLOQUE L - VISTAS (3er ANGULO)
 50
0
100
AcDbText
  0
ENDSEC
  0
EOF
`;var i_=`  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1015
  9
$INSUNITS
 70
1
  9
$MEASUREMENT
 70
0
  0
ENDSEC
  0
SECTION
  2
TABLES
  0
TABLE
  2
LTYPE
 70
3
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CONTINUOUS
 70
0
  3
Solid line
 72
65
 73
0
 40
0
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CENTER
 70
0
  3
Center ____ _ ____ _
 72
65
 73
4
 40
50.800000000000004
 49
31.75
 49
-6.35
 49
6.35
 49
-6.35
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
HIDDEN
 70
0
  3
Hidden __ __ __
 72
65
 73
2
 40
9.524999999999999
 49
6.35
 49
-3.175
  0
ENDTAB
  0
TABLE
  2
LAYER
 70
7
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
0
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
CONTORNO
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
BARRENOS
 70
0
 62
3
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
EJES
 70
0
 62
1
  6
CENTER
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
OCULTAS
 70
0
 62
6
  6
HIDDEN
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
COTAS
 70
0
 62
2
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
TEXTO
 70
0
 62
4
  6
CONTINUOUS
  0
ENDTAB
  0
ENDSEC
  0
SECTION
  2
BLOCKS
  0
ENDSEC
  0
SECTION
  2
ENTITIES
  0
SPLINE
  5
100
100
AcDbEntity
  8
CONTORNO
100
AcDbSpline
210
0
220
0
230
1
 70
9
 71
3
 72
16
 73
12
 74
0
 40
0
 40
0
 40
0
 40
0
 40
1
 40
2
 40
3
 40
4
 40
5
 40
6
 40
7
 40
8
 40
9
 40
9
 40
9
 40
9
 10
1.308621408462355
 20
5.551115123125783e-17
 30
0
 10
1.308621408462355
 20
0.8409999131058147
 30
0
 10
0.7081184024939148
 20
1.5505630158938637
 30
0
 10
-0.2703711804230402
 20
1.8804728649269757
 30
0
 10
-1.3615872611009523
 20
1.5713554648845414
 30
0
 10
-2.097281369432277
 20
0.6158173732113744
 30
0
 10
-2.097281369432277
 20
-0.6158173732113739
 30
0
 10
-1.3615872611009527
 20
-1.5713554648845407
 30
0
 10
-0.2703711804230406
 20
-1.8804728649269755
 30
0
 10
0.7081184024939141
 20
-1.5505630158938641
 30
0
 10
1.308621408462355
 20
-0.8409999131058146
 30
0
 10
1.308621408462355
 20
5.551115123125783e-17
 30
0
  0
CIRCLE
  5
101
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
0
 20
0
 30
0
 40
0.375
  0
ELLIPSE
  5
102
100
AcDbEntity
  8
CONTORNO
100
AcDbEllipse
 10
0
 20
-0.9
 30
0
 11
0.35
 21
0
 31
0
210
0
220
0
230
-1
 40
0.4285714285714286
 41
0
 42
6.283185307179586
  0
ARC
  5
103
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
1.3739468239544418e-17
 20
1.2307179676972448
 30
0
 40
0.06
100
AcDbArc
 50
59.99999999999989
 51
120.00000000000011
  0
LINE
  5
104
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
-0.029999999999999995
 20
1.282679491924311
 30
0
 11
-0.2731088913245535
 21
1.1423205080756889
 31
0
  0
ARC
  5
105
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
0.24310889132455354
 20
1.0903589838486225
 30
0
 40
0.06
100
AcDbArc
 50
0
 51
60.00000000000004
210
0
220
0
230
-1
  0
LINE
  5
106
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
-0.30310889132455354
 20
1.0903589838486225
 30
0
 11
-0.3031088913245535
 21
0.8096410161513775
 31
0
  0
ARC
  5
107
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
-0.2431088913245535
 20
0.8096410161513774
 30
0
 40
0.06
100
AcDbArc
 50
179.9999999999999
 51
-120.00000000000001
  0
LINE
  5
108
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
-0.27310889132455346
 20
0.7576794919243112
 30
0
 11
-0.030000000000000075
 21
0.6173205080756887
 31
0
  0
ARC
  5
109
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
5.660210620970178e-17
 20
0.6692820323027551
 30
0
 40
0.06
100
AcDbArc
 50
240
 51
300
210
0
220
0
230
-1
  0
LINE
  5
10A
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
0.029999999999999947
 20
0.6173205080756887
 30
0
 11
0.2731088913245534
 21
0.757679491924311
 31
0
  0
ARC
  5
10B
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
0.24310889132455343
 20
0.8096410161513774
 30
0
 40
0.06
100
AcDbArc
 50
-60.000000000000036
 51
0
  0
LINE
  5
10C
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
0.30310889132455343
 20
0.8096410161513774
 30
0
 11
0.3031088913245535
 21
1.0903589838486225
 31
0
  0
ARC
  5
10D
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
-0.2431088913245535
 20
1.0903589838486225
 30
0
 40
0.06
100
AcDbArc
 50
119.99999999999997
 51
180
210
0
220
0
230
-1
  0
LINE
  5
10E
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
0.27310889132455346
 20
1.1423205080756889
 30
0
 11
0.030000000000000034
 21
1.282679491924311
 31
0
  0
LINE
  5
10F
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
-0.6
 20
0
 30
0
 11
0.6
 21
0
 31
0
  0
LINE
  5
110
100
AcDbEntity
  8
EJES
100
AcDbLine
 10
0
 20
-0.6
 30
0
 11
0
 21
0.6
 31
0
  0
TEXT
  5
111
100
AcDbEntity
  8
TEXTO
100
AcDbText
 10
-1
 20
-2.6
 30
0
 40
0.15
  1
LEVA - PULGADAS
 50
0
100
AcDbText
  0
ENDSEC
  0
EOF
`;var s_=`  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1015
  9
$INSUNITS
 70
4
  9
$MEASUREMENT
 70
1
  0
ENDSEC
  0
SECTION
  2
TABLES
  0
TABLE
  2
LTYPE
 70
3
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CONTINUOUS
 70
0
  3
Solid line
 72
65
 73
0
 40
0
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CENTER
 70
0
  3
Center ____ _ ____ _
 72
65
 73
4
 40
50.800000000000004
 49
31.75
 49
-6.35
 49
6.35
 49
-6.35
  0
LTYPE
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
HIDDEN
 70
0
  3
Hidden __ __ __
 72
65
 73
2
 40
9.524999999999999
 49
6.35
 49
-3.175
  0
ENDTAB
  0
TABLE
  2
LAYER
 70
7
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
0
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
CONTORNO
 70
0
 62
7
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
BARRENOS
 70
0
 62
3
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
EJES
 70
0
 62
1
  6
CENTER
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
OCULTAS
 70
0
 62
6
  6
HIDDEN
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
COTAS
 70
0
 62
2
  6
CONTINUOUS
  0
LAYER
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
TEXTO
 70
0
 62
4
  6
CONTINUOUS
  0
ENDTAB
  0
ENDSEC
  0
SECTION
  2
BLOCKS
  0
ENDSEC
  0
SECTION
  2
ENTITIES
  0
ARC
  5
100
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
-50
 20
25
 30
0
 40
10
100
AcDbArc
 50
90
 51
180
  0
LINE
  5
101
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
50
 20
35
 30
0
 11
-50
 21
35
 31
0
  0
LINE
  5
102
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
40
 20
20
 30
0
 11
-40
 21
20
 31
0
  0
ARC
  5
103
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
50
 20
-25
 30
0
 40
10
100
AcDbArc
 50
270
 51
360
  0
ARC
  5
104
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
-52.5
 20
0
 30
0
 40
3
100
AcDbArc
 50
0
 51
180
  0
ARC
  5
105
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
40
 20
-15
 30
0
 40
5
100
AcDbArc
 50
270
 51
360
  0
ARC
  5
106
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
52.5
 20
0
 30
0
 40
3
100
AcDbArc
 50
180
 51
360
  0
LINE
  5
107
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
45
 20
-15
 30
0
 11
45
 21
15
 31
0
  0
ARC
  5
108
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
-52.5
 20
0
 30
0
 40
3
100
AcDbArc
 50
180
 51
360
  0
LINE
  5
109
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
40
 20
-20
 30
0
 11
-40
 21
-20
 31
0
  0
ARC
  5
10A
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
0
 20
-27.5
 30
0
 40
3
100
AcDbArc
 50
0
 51
180
  0
LINE
  5
10B
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
-60
 20
25
 30
0
 11
-60
 21
-25
 31
0
  0
ARC
  5
10C
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
-40
 20
-15
 30
0
 40
5
100
AcDbArc
 50
180
 51
270
  0
ARC
  5
10D
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
0
 20
27.5
 30
0
 40
3
100
AcDbArc
 50
180
 51
360
  0
ARC
  5
10E
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
0
 20
27.5
 30
0
 40
3
100
AcDbArc
 50
0
 51
180
  0
LINE
  5
10F
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
45
 20
15
 30
0
 11
45
 21
-15
 31
0
  0
ARC
  5
110
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
40
 20
15
 30
0
 40
5
100
AcDbArc
 50
0
 51
90
  0
ARC
  5
111
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
-40
 20
15
 30
0
 40
5
100
AcDbArc
 50
90
 51
180
  0
LINE
  5
112
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
50.0005
 20
-35
 30
0
 11
-50
 21
-35
 31
0
  0
LINE
  5
113
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
-45
 20
15
 30
0
 11
-45
 21
-15
 31
0
  0
ARC
  5
114
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
52.5
 20
0
 30
0
 40
3
100
AcDbArc
 50
0
 51
180
  0
ARC
  5
115
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
50
 20
25
 30
0
 40
10
100
AcDbArc
 50
0
 51
90
  0
ARC
  5
116
100
AcDbEntity
  8
CONTORNO
100
AcDbCircle
 10
-50
 20
-25
 30
0
 40
10
100
AcDbArc
 50
180
 51
270
  0
ARC
  5
117
100
AcDbEntity
  8
BARRENOS
100
AcDbCircle
 10
0
 20
-27.5
 30
0
 40
3
100
AcDbArc
 50
180
 51
360
  0
LINE
  5
118
100
AcDbEntity
  8
CONTORNO
100
AcDbLine
 10
60
 20
25
 30
0
 11
60
 21
-25
 31
0
  0
ENDSEC
  0
EOF
`;var r_=`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Placa troquelada de ejemplo, 160 \xD7 100 mm. Contorno con esquinas R8 y muesca inferior,
     recorte decorativo B\xE9zier, ranura redondeada, ranura girada 30\xB0, elipse y 4 barrenos \xD87. -->
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
     xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
     width="160mm" height="100mm" viewBox="0 0 160 100" version="1.1">
  <title>Placa con logo &amp; barrenos</title>
  <sodipodi:namedview id="namedview1" inkscape:document-units="mm" />
  <defs>
    <circle id="barreno" cx="0" cy="0" r="3.5" />
    <style><![CDATA[ .corte { fill: none; stroke: #000; } ]]></style>
  </defs>
  <g id="layer1" inkscape:groupmode="layer" inkscape:label="Contorno"
     style="fill:none;stroke:#000000;stroke-width:0.25">
    <path id="contorno" d="M 8 0 H 152 A 8 8 0 0 1 160 8 V 92 A 8 8 0 0 1 152 100 H 100 V 90 H 60 V 100 H 8
             A 8 8 0 0 1 0 92 V 8 A 8 8 0 0 1 8 0 Z" />
  </g>
  <g id="layer2" inkscape:groupmode="layer" inkscape:label="Recortes" style="fill:none;stroke:#0000ff">
    <!-- recorte decorativo (hoja) con B\xE9zier c\xFAbicas -->
    <path id="hoja" d="M 25 40 C 25 22 45 14 55 16 C 53 30 40 42 25 40 Z" />
    <rect id="ranura" x="70" y="20" width="40" height="12" rx="6" />
    <ellipse id="ventana" cx="40" cy="65" rx="10" ry="6" />
    <g id="ranura-girada" transform="rotate(30 120 50)">
      <path d="M 110 47 H 130 A 3 3 0 0 1 130 53 H 110 A 3 3 0 0 1 110 47 Z" />
    </g>
  </g>
  <g id="layer3" inkscape:groupmode="layer" inkscape:label="Barrenos" style="fill:none;stroke:#ff0000">
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="148" cy="12" r="3.5" />
    <use xlink:href="#barreno" x="12" y="78" />
    <use href="#barreno" x="148" y="78" />
  </g>
  <text x="80" y="75" style="font-size:6px;fill:#000000">OMNI-01</text>
</svg>
`;var o_="data:image/png;base64,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";var a_={"placa-soporte":{mode:"extrude",thickness:2,materialId:"acero-1008"},"brida-bloques":{mode:"extrude",thickness:12,materialId:"acero-a36"},"eje-perfil":{mode:"revolve",thickness:2,materialId:"acero-1045",revolve:{axisKind:"x",axis:{p:[0,0],d:[1,0]},angleDeg:360}},"bloque-vistas":{mode:"multiview",thickness:2,materialId:"acero-1018",multiview:{windows:{front:{minX:-5,minY:-5,maxX:85,maxY:45},top:{minX:-5,minY:65,maxX:85,maxY:125},right:{minX:105,minY:-5,maxX:165,maxY:45}}}},"leva-spline":{mode:"extrude",thickness:12.7,materialId:"al-6061-t6"},"junta-arcos":{mode:"extrude",thickness:1.5,materialId:"al-1100-h14"},"placa-logo":{mode:"extrude",thickness:2,materialId:"al-5052-h32"},"pieza-escaneada":{mode:"extrude",thickness:1.5,materialId:"caucho",mmPerPx:.15}};var Ss=(n,e,t,i,s,r)=>({id:n,title:e,description:t,format:i,fileName:s,content:r,suggested:a_[n]}),Lf=[Ss("placa-soporte","Placa soporte","Placa troquelada 150\xD780 mm con esquinas R6, muesca, ranura, 4 barrenos \xD88.5 y uno \xD825. Extrusi\xF3n de 2 mm.","dxf","placa-soporte.dxf",Qg),Ss("brida-bloques","Brida con bloques","Brida \xD8150 con barreno \xD860 y cu\xF1ero; 8 barrenos \xD814 en PCD 110 definidos con bloques anidados. Extrusi\xF3n de 12 mm.","dxf","brida-bloques.dxf",e_),Ss("eje-perfil","Flecha escalonada","Medio perfil de una flecha con hombros, chaflanes y ranura; revoluci\xF3n de 360\xB0 alrededor de su l\xEDnea de centros.","dxf","eje-perfil.dxf",t_),Ss("bloque-vistas","Bloque en L (vistas)","Vistas frontal, superior y lateral derecha (tercer \xE1ngulo) de un bloque en L con barreno \xD816; reconstrucci\xF3n por vistas.","dxf","bloque-vistas.dxf",n_),Ss("leva-spline","Leva (pulgadas)","Leva dibujada en pulgadas con contorno SPLINE, ranura el\xEDptica y ventana hexagonal. Extrusi\xF3n de 12.7 mm (\xBD in).","dxf","leva-spline.dxf",i_),Ss("junta-arcos","Junta (solo l\xEDneas y arcos)","Junta con entidades desordenadas, una duplicada y un hueco de 0.0005 mm que se cierra solo. Extrusi\xF3n de 1.5 mm.","dxf","junta-arcos.dxf",s_),Ss("placa-logo","Placa con logo (SVG)","Placa 160\xD7100 mm en SVG (mm) con recorte B\xE9zier, ranuras, elipse y 4 barrenos \xD87. Extrusi\xF3n de 2 mm.","svg","placa-logo.svg",r_),Ss("pieza-escaneada","Junta escaneada (imagen)","Imagen 1200\xD7800 px de una junta 1000\xD7600 px con barrenos \xD880/\xD860/\xD860 y ranura; a 0.15 mm/px mide 150\xD790 mm. Extrusi\xF3n de 1.5 mm.","image","pieza-escaneada.png",o_)];var Ze=pe,Eo=Je,l_=25.4,c_=["#4c8dff","#3fb950","#d29922","#a371f7","#f778ba","#39c5cf","#f0883e","#8b949e"],QE={extrude:"Extrusi\xF3n",revolve:"Revoluci\xF3n",multiview:"Multivista"},eA={dxf:"DXF",svg:"SVG",image:"Imagen"};function Vh(n){let e=String(n).lastIndexOf(" ");return e<0?[String(n),""]:[n.slice(0,e),n.slice(e+1)]}var Es=(n,e)=>Vh(n.len(e))[0],ir=n=>n.system==="imperial"?"in":"mm",h_=(n,e)=>String(Number((n.system==="imperial"?e/25.4:e).toFixed(n.system==="imperial"?3:2))),qa=(n,e)=>n.toLocaleString("es-MX",{minimumFractionDigits:e,maximumFractionDigits:e});function Hh(n,e,t){let[i,s]=Vh(e);Ze(n).innerHTML=`${Eo(i)}<span class="unit">${Eo(s)}</span>`,Ze(`${n}Sub`).textContent=t}function Df(n,e,{hiddenLayers:t,theme:i}){let s=e.stats,r=eA[n.format]||n.format;Ze("stepPlanoSummary").textContent=`${r} \xB7 ${n.segments.length} entidades`,Ze("infoFormat").textContent=r;let o=n.units;Ze("infoUnits").textContent=n.format==="image"?"px (escala manual)":`${o.name}${o.detected?"":" (supuesto)"}`,Ze("infoScale").textContent=`\xD7 ${+e.toMM.toPrecision(6)} mm`,Ze("infoEntities").textContent=String(n.segments.length),Ze("infoClosed").textContent=String(s.loops),Ze("infoRegions").textContent=`${s.regions} \xB7 ${s.holes} agujeros`,Ze("infoOpen").textContent=String(s.openChains),Ze("infoOpenRow").hidden=!s.openChains,Ze("infoOpenRow").classList.toggle("is-warn",s.openChains>0),Ze("imageSection").hidden=n.format!=="image",Ze("selDrawingUnits").disabled=n.format==="image";let a=new Map;for(let u of n.segments){let d=u.meta?.layer??"0";a.set(d,(a.get(d)||0)+1)}let l=(n.layers||[]).map(u=>u.name);for(let u of a.keys())l.includes(u)||l.push(u);let c=new Map((n.layers||[]).map(u=>[u.name,u])),h=l.filter(u=>a.get(u)||c.get(u)?.color!=null).map(u=>{let d=c.get(u)?.color;return{name:u,color:d!=null?yf(d,i):"#9aa4b0",count:a.get(u)||0,visible:!t.has(u)&&!c.get(u)?.frozen&&!c.get(u)?.off}});Cs(Ze("layerList"),h,fu),Ze("layerCount").textContent=String(h.length)}function Ao(n,e,t,{selected:i=-1,open:s=new Set}={}){let r=a=>a==null?"":String(+a.toFixed(3)),o=n.regions.map((a,l)=>{let c=e.regions[l],h=n.loopInfos[a.outer],u=a.holes.length;return{index:l,color:c_[l%c_.length],included:c.included,selected:l===i,open:s.has(l),meta:`${u?`${u} agujero${u>1?"s":""}`:"sin agujeros"} \xB7 ${t.area(h.area)}`,height:r(c.height),z0:r(c.z0),holes:a.holes.map((d,f)=>{let m=n.loopInfos[d],_=c.holes[f];return{label:m.circle?`\xD8 ${t.len(2*m.circle.r)}`:"",free:!m.circle,op:_.op==="none"?"fill":_.op,depth:r(_.depth)}})}});Cs(Ze("regionList"),o,pu);for(let a of Ze("regionList").querySelectorAll("input[data-field]"))a.placeholder=a.dataset.field==="z0"?"0":"auto";Ze("regionCount").textContent=String(o.length)}function ja(n,e){let t={top:"slotTop",front:"slotFront",right:"slotRight",left:"slotLeft"};for(let[i,s]of Object.entries(t)){let r=n.multiview?.windows?.[i],o=Ze(s).querySelector(".slot-status");o.dataset.state=r?"set":"empty",o.textContent=r?`${h_(e,Math.abs(r.maxX-r.minX))} \xD7 ${h_(e,Math.abs(r.maxY-r.minY))} ${ir(e)}`:"sin definir"}}function Gh(n,e){let t=s=>String(+(+s).toFixed(4)||0),i=s=>`(${Es(e,s[0])}, ${Es(e,s[1])}) ${ir(e)}`;return n.axisKind==="x"?`Eje X \xB7 por ${i([0,0])} \xB7 dir (1, 0)`:n.axisKind==="y"?`Eje Y \xB7 por ${i([0,0])} \xB7 dir (0, 1)`:`L\xEDnea \xB7 por ${i(n.axis.p)} \xB7 dir (${t(n.axis.d[0])}, ${t(n.axis.d[1])})`}function u_(n,e,{thickness:t}={}){mr(!0);let i=e.system==="imperial",s=(...C)=>C.join(" \xB7 ");Ze("propsSubtitle").textContent=s(QE[n.mode]||n.mode,n.material.name,...n.mode==="extrude"&&t?[e.len(t)]:[]);let r=n.mass;Hh("kpiMass",e.mass(r.g),i?s(`${qa(r.g,2)} g`,`${r.kg.toFixed(4)} kg`):s(`${r.lb.toFixed(4)} lb`,`${r.kg.toFixed(4)} kg`));let o=n.volume;Hh("kpiVolume",e.vol(o.mm3),i?s(`${qa(o.mm3,1)} mm\xB3`,`${o.cm3.toFixed(3)} cm\xB3`):s(`${qa(o.mm3,0)} mm\xB3`,`${o.in3.toFixed(3)} in\xB3`));let a=n.area;Hh("kpiArea",e.area(a.mm2),i?s(`${qa(a.mm2,1)} mm\xB2`,`${a.cm2.toFixed(2)} cm\xB2`):s(`${qa(a.mm2,1)} mm\xB2`,`${a.in2.toFixed(3)} in\xB2`));let l=n.bbox.size,c=C=>String(+(i?C/l_:C).toFixed(i?3:2));Hh("kpiDims",`${l.map(c).join(" \xD7 ")} ${ir(e)}`,i?l.map(C=>C.toFixed(2)).join(" \xD7 ")+" mm":l.map(C=>(C/l_).toFixed(3)).join(" \xD7 ")+" in"),Ze("kpiDims").classList.add("kpi-value-sm"),Ze("viewInfo").textContent=`${l.map(C=>Es(e,C)).join(" \xD7 ")} ${ir(e)}`;let h=n.material,u=C=>C!=null?{value:String(C),unit:"MPa"}:{value:"\u2014"};On(Ze("propMaterial"),[{label:"Material",value:h.name},{label:"Densidad",value:e.density(n.density.gcm3)},{label:"Resistencia a tracci\xF3n",...u(h.uts)},{label:"L\xEDmite el\xE1stico",...u(h.yieldStrength)},{label:"Resistencia al corte",...u(h.shear),hint:"Usada para la fuerza de corte"},h.E!=null&&{label:"M\xF3dulo de Young",value:String(h.E),unit:"GPa"}]);let d=n.bbox,f=C=>e.point(C.map(R=>Math.abs(R)<5e-7?0:R)).replace(/^\(|\)/g,"");On(Ze("propBBox"),[{label:"M\xEDn (x, y, z)",value:f(d.min)},{label:"M\xE1x (x, y, z)",value:f(d.max)},{label:"Tama\xF1o",value:`${l.map(c).join(" \xD7 ")}`,unit:ir(e)},{label:"Diagonal",value:e.len(d.diagonal)}]);let m=n.centroid.centroid;On(Ze("propCOM"),["X","Y","Z"].map((C,R)=>({label:C,value:e.len(Math.abs(m[R])<5e-7?0:m[R])})));let _=n.inertia,g=Vh(e.inertia(1))[1],p=C=>Vh(e.inertia(C))[0];Ze("inertiaUnit").textContent=g;let x=[[_.Ixx,-_.Pxy,-_.Pxz],[-_.Pxy,_.Iyy,-_.Pyz],[-_.Pxz,-_.Pyz,_.Izz]],E=1e-9*Math.max(Math.abs(_.Ixx),Math.abs(_.Iyy),Math.abs(_.Izz));Ze("inertiaTensor").innerHTML="<thead><tr><th></th><th>X</th><th>Y</th><th>Z</th></tr></thead><tbody>"+x.map((C,R)=>`<tr><th>${"XYZ"[R]}</th>${C.map((P,D)=>`<td class="${R===D?"diag":"off"}">${Eo(p(Math.abs(P)<E?0:P))}</td>`).join("")}</tr>`).join("")+"</tbody>";let b=n.gyration;On(Ze("propInertia"),[{section:"Momentos principales"},...n.principal.moments.map((C,R)=>({label:`I${"\u2081\u2082\u2083"[R]}`,value:e.inertia(C)})),{section:"Radios de giro"},{label:"kx",value:e.len(b.x)},{label:"ky",value:e.len(b.y)},{label:"kz",value:e.len(b.z)}]);let M=n.sheet;if(Ze("propSheet").closest(".prop-section").hidden=!M,M){let C=M.utilization;On(Ze("propSheet"),[{label:"Espesor",value:e.len(M.thickness)},{label:"Blank",value:`${Es(e,M.blankWidth)} \xD7 ${Es(e,M.blankHeight)}`,unit:ir(e)},{label:"\xC1rea del blank",value:e.area(M.blankArea)},{label:"\xC1rea neta",value:e.area(M.netArea)},{label:"Aprovechamiento",value:e.pct(C),bar:C/100,barCls:C>=70?"is-good":C>=45?"":"is-warn"},{label:"Longitud de corte",value:e.len(M.cutLength)},{label:"Agujeros",value:String(M.holes)},M.minHoleDiameter!=null&&{label:"Agujero m\xEDnimo",value:`\xD8 ${e.len(M.minHoleDiameter)}`,cls:M.minHoleDiameter<M.thickness?"is-warn":"",hint:"Recomendado \u2265 espesor"},{label:"Fuerza de corte",value:M.cuttingForce?`${e.force(M.cuttingForce.N)} \xB7 ${M.cuttingForce.tonf.toFixed(2)} tonf`:"\u2014 (sin \u03C4 del material)",hint:"L \xD7 t \xD7 \u03C4"},M.strippingForce&&{label:"Fuerza de extracci\xF3n",value:e.force(M.strippingForce.N),hint:"Estimaci\xF3n: 10 % de la de corte"},{label:"Peso bruto",value:e.mass(M.grossWeight.g)},{label:"Peso neto",value:e.mass(M.netWeight.g)},{label:"Desperdicio",value:`${e.mass(M.scrapWeight.g)} \xB7 ${e.pct(M.scrapPct)}`,cls:M.scrapPct>50?"is-warn":""}])}let v=n.profile;if(Ze("propProfile").closest(".prop-section").hidden=!v,v){On(Ze("propProfile"),[{label:"\xC1rea neta",value:e.area(v.netArea)},{label:"Per\xEDmetro exterior",value:e.len(v.perimeterOuter)},{label:"Per\xEDmetro de agujeros",value:e.len(v.perimeterInner)},{label:"Contornos",value:String(v.loops)},{label:"Agujeros",value:String(v.holes.length)}]);let C=ir(e);Ze("holesTable").innerHTML=v.holes.length?`<thead><tr><th>#</th><th>\xD8 (${C})</th><th>Centro X</th><th>Centro Y</th><th>Tipo</th></tr></thead><tbody>`+v.holes.map((R,P)=>`<tr><td>${P+1}</td><td>${R.d!=null?Eo(Es(e,R.d)):"libre"}</td><td>${Eo(Es(e,R.c[0]))}</td><td>${Eo(Es(e,R.c[1]))}</td><td>${R.op==="blind"?"ciego":"pasante"}</td></tr>`).join("")+"</tbody>":""}let A=n.topology,y=A.counts||{},w=(C,R,P)=>`<span class="badge ${C?"badge-success":"badge-danger"}">${C?"\u2713":"\u2717"} ${C?R:P}</span>`;Ze("topoBadges").innerHTML=w(A.valid,"S\xF3lido v\xE1lido","S\xF3lido no v\xE1lido")+w(A.closed,"Cerrado (estanco)","Abierto")+`<span class="badge">${y.solids??1} s\xF3lido${(y.solids??1)===1?"":"s"}</span>`,On(Ze("propTopology"),[{label:"Caras \xB7 aristas \xB7 v\xE9rtices",value:`${y.faces??"\u2014"} \xB7 ${y.edges??"\u2014"} \xB7 ${y.vertices??"\u2014"}`},y.shells!=null&&{label:"Cascarones",value:String(y.shells)}]);let L=n.precision;if(Ze("propAccuracy").closest(".prop-section").hidden=!1,L){let C=L.relError<1e-9,R=C||L.relError<1e-6?"badge-success":L.relError<.001?"badge-warning":"badge-danger";Ze("accuracyBadge").innerHTML=`<span class="badge ${R}">${C?"\u2713 Volumen exacto":`Error relativo ${L.relError.toExponential(2)}`}</span>`,On(Ze("propAccuracy"),[{label:"Volumen B-rep",value:e.vol(L.kernelVolume)},{label:"Volumen anal\xEDtico 2D",value:e.vol(L.analyticVolume)},{label:"Error absoluto",value:`${L.absError.toExponential(3)} mm\xB3`},{label:"Error relativo",value:C?`${L.relError.toExponential(2)} (exacto)`:L.relError.toExponential(3)}])}else Ze("accuracyBadge").innerHTML='<span class="badge">Sin referencia anal\xEDtica</span>',On(Ze("propAccuracy"),[{label:"Volumen B-rep",value:e.vol(n.volume.mm3),hint:"Redondeos, multivista o revoluci\xF3n a ambos lados del eje"}]);let T=n.cost;Ze("propCost").closest(".prop-section").hidden=!T,T&&On(Ze("propCost"),[{label:"Precio material",value:T.pricePerKg.toFixed(2),unit:"$/kg"},{label:"Costo neto",value:T.netCost.toFixed(3),unit:"$"},T.blankCost!=null&&{label:"Costo con blank",value:T.blankCost.toFixed(3),unit:"$",cls:"is-strong"}])}function d_(n){let e=new Set,t=new Set,i=new Set,s=new Set,{S:r,actions:o}=n;return{kernel:n.kernel,viewer:n.viewer,measure:n.measure,view2d:n.view2d,getState:()=>({drawing:r.drawing,profile:r.profile,op:r.op,build:r.build,partData:r.partData,material:r.material,formatter:r.F,system:r.F.system,sampleId:r.sampleId,building:r.building,appliedJob:r.appliedJob,dirty:r.dirty,buildError:r.buildError}),onBuilt:a=>(e.add(a),()=>e.delete(a)),onProfile:a=>(s.add(a),()=>s.delete(a)),onMeasureChange:a=>(t.add(a),()=>t.delete(a)),setViewWindow:(a,l)=>o.setViewWindow(a,l),onUnitsChange:a=>(i.add(a),()=>i.delete(a)),setRevolveAxis:a=>o.setRevolveAxis(a),setImageScale:a=>o.setImageScale(a),rebuild:()=>o.rebuild(),pickAxis:()=>o.pickAxis(),setMode2d:a=>o.setMode2d(a),setFrameLoops:a=>o.setFrameLoops(a),prepareExport:()=>o.prepareExport(),ensureKernelShape:()=>o.ensureKernelShape(),loadSample:a=>o.loadSample(a),openFiles:a=>o.openFiles(a),_emitBuilt:()=>{for(let a of e)a(r.partData,r.build)},_emitUnits:()=>{for(let a of i)a(r.F)},_emitProfile:a=>{for(let l of s)l(a)},_emitMeasure:(a,l)=>{for(let c of t)c(a,l)}}}var{$:As}=Is,tA={i:"inspect",p:"point",d:"distance",a:"angle",r:"radius",f:"area",c:"coords",t:"thickness"},f_={1:"iso",2:"front",3:"top",4:"right"},p_={e:"edges",x:"xray",w:"wireframe"};function m_(n,e){let t=e.map(([,s])=>n.len(s)),i=t[0].match(/ (\S+)$/)?.[1];return i&&t.every(s=>s.endsWith(` ${i}`))?`${e.map(([s],r)=>`${s} ${t[r].slice(0,-i.length-1)}`).join(" \xB7 ")} ${i}`:e.map(([s],r)=>`${s} ${t[r]}`).join(" \xB7 ")}function nA(n,e){return n.kind==="radius"?{title:"Radio 2D (plano)",text:`${m_(e,[["R",n.r],["\xD8",n.diameter]])} \xB7 centro ${e.point(n.c)}`}:{title:"Distancia 2D (plano)",text:`${e.len(n.d)} \xB7 ${m_(e,[["\u0394X",n.dx],["\u0394Y",n.dy]])} \xB7 ${e.angle(n.angleDeg)}`}}var g_=n=>/[",\r\n]/.test(n)?`"${n.replace(/"/g,'""')}"`:n;function iA(n){return String(n?.fileName||"pieza").replace(/\.[^.]+$/,"").replace(/[\\/:*?"<>|]+/g,"_").trim()||"pieza"}async function sA(n){try{return await navigator.clipboard.writeText(n),!0}catch{let e=document.createElement("textarea");e.value=n,e.setAttribute("readonly",""),e.style.cssText="position:fixed;left:-9999px;top:0",document.body.appendChild(e),e.select();let t=!1;try{t=document.execCommand("copy")}catch{t=!1}return e.remove(),t}}function __(n){let{measure:e,view2d:t}=n,i=()=>n.getState().formatter,s=[],r=[],o=null,a=As("measureList");a.dataset.empty="Mide en la vista 3D con la paleta de herramientas o en el plano 2D con el modo Medir.";let l=document.createElement("div");l.id="inspectCard",l.className="inspect-card",l.hidden=!0,a.before(l);function c(){let f=i();return[...s.map(m=>({id:`3d-${m.id}`,tool:m.tool,title:m.title,text:m.text})),...r.map(m=>({id:m.id,tool:"measure2d",...nA(m.m,f)}))]}n.getMeasurements=()=>c().map(({title:f,text:m})=>({title:f,text:m}));function h(){let f=c();Cs(a,f,mu),As("measureCount").textContent=String(f.length);for(let m of["btnMeasureCopy","btnMeasureCSV","btnMeasureClear"])As(m).disabled=!f.length}function u(){if(l.hidden=!o,!o)return l.innerHTML="";let f=o.lines.slice(1).map(m=>`<div class="inspect-line">${Je(m)}</div>`).join("");l.innerHTML=`<div class="inspect-head"><span class="inspect-title">${Je(o.title)}</span>
<button class="btn btn-sm" type="button" data-action="pin" data-tip="A\xF1adir a la lista de mediciones"><i data-icon="plus"></i>Fijar</button></div>${f}`,dr(l)}l.addEventListener("click",f=>{f.target.closest('[data-action="pin"]')&&e.pinInspect()&&At("Inspecci\xF3n fijada en la lista",{type:"success",timeout:2e3})}),n.onMeasureChange((f,m)=>{s=f,o=m.inspect||null,gr(As("toolPalette"),"tool",e.tool==="none"?null:e.tool),h(),u()}),t.on("measure",f=>{r.push({id:`2d-${f.id}`,m:f}),h()});for(let f of["clearMeasures","setDrawing"]){let m=t[f].bind(t);t[f]=(..._)=>{let g=m(..._);return r.length&&(r=[],h()),g}}n.onUnitsChange(()=>h()),a.addEventListener("click",f=>{let m=f.target.closest('[data-action="delete"]');if(!m)return;let _=m.closest("[data-measure]").dataset.measure;if(_.startsWith("3d-"))e.remove(Number(_.slice(3)));else{let g=r.find(p=>p.id===_);if(!g)return;t.removeMeasure(g.m.id),r=r.filter(p=>p!==g),h()}}),As("btnMeasureCopy").addEventListener("click",async()=>{let f=c();if(!f.length)return;let m=await sA(f.map(_=>`${_.title}: ${_.text}`).join(`
`));At(m?`${f.length} ${f.length===1?"medici\xF3n copiada":"mediciones copiadas"} al portapapeles`:"No se pudo copiar al portapapeles",{type:m?"success":"warn"})}),As("btnMeasureCSV").addEventListener("click",()=>{let f=c();if(!f.length)return;let m=`\uFEFFMedici\xF3n,Valor\r
${f.map(g=>`${g_(g.title)},${g_(g.text)}`).join(`\r
`)}\r
`,_=`${iA(n.getState().drawing)}-mediciones.csv`;Fo(new Blob([m],{type:"text/csv;charset=utf-8"}),_),At(`Descargado ${_}`,{type:"success"})}),As("btnMeasureClear").addEventListener("click",()=>{e.clear(),t.clearMeasures()});let d=f=>document.querySelector(f)?.click();for(let[f,m]of Object.entries(tA))tn(f,()=>{Nn()==="2d"&&Sn("3d"),d(`#toolPalette [data-tool="${m}"]`)});for(let[f,m]of Object.entries(f_))tn(f,()=>d(`#viewBar [data-view="${m}"]`));for(let[f,m]of Object.entries(p_))tn(f,()=>d(`#displayBar [data-display="${m}"]`));tn("Home",()=>{let f=Nn();f!=="3d"&&d("#btn2dFit"),f!=="2d"&&d('#viewBar [data-view="fit"]')}),tn("o",()=>d("#btnProjection")),tn("s",()=>d("#chkSection")),tn("g",()=>d("#btnGenerate")),document.addEventListener("keydown",f=>{f.key!=="Escape"||f.defaultPrevented||!As("modal").hidden||f.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(f.target.tagName)||(e.tool!=="none"&&e.setTool("none"),t.mode&&t.mode!=="select"&&d('#toolbar2d [data-mode2d="select"]'))});for(let[f,m]of Object.entries(f_)){let _=document.querySelector(`#viewBar [data-view="${m}"]`);_&&(_.dataset.kbd=f)}for(let[f,m]of Object.entries(p_)){let _=document.querySelector(`#displayBar [data-display="${m}"]`);_&&(_.dataset.kbd=f.toUpperCase())}for(let f of document.querySelectorAll("#toolbar2d [data-mode2d]"))delete f.dataset.kbd;h()}var Wh=class{parse(e){let t="",i=0,s=0,r=0,o=new O,a=new Ge,l=new O,c=new Ie,h=[];function u(m){let _=0,g=0,p=0,x=m.geometry,E=new $e,b=x.getAttribute("position"),M=x.getAttribute("normal"),v=x.getAttribute("uv"),A=x.getIndex();if(t+="o "+m.name+`
`,m.material&&m.material.name&&(t+="usemtl "+m.material.name+`
`),b!==void 0)for(let y=0,w=b.count;y<w;y++,_++)o.fromBufferAttribute(b,y),o.applyMatrix4(m.matrixWorld),t+="v "+o.x+" "+o.y+" "+o.z+`
`;if(v!==void 0)for(let y=0,w=v.count;y<w;y++,p++)c.fromBufferAttribute(v,y),t+="vt "+c.x+" "+c.y+`
`;if(M!==void 0){E.getNormalMatrix(m.matrixWorld);for(let y=0,w=M.count;y<w;y++,g++)l.fromBufferAttribute(M,y),l.applyMatrix3(E).normalize(),t+="vn "+l.x+" "+l.y+" "+l.z+`
`}if(A!==null)for(let y=0,w=A.count;y<w;y+=3){for(let L=0;L<3;L++){let T=A.getX(y+L)+1;h[L]=i+T+(M||v?"/"+(v?s+T:"")+(M?"/"+(r+T):""):"")}t+="f "+h.join(" ")+`
`}else for(let y=0,w=b.count;y<w;y+=3){for(let L=0;L<3;L++){let T=y+L+1;h[L]=i+T+(M||v?"/"+(v?s+T:"")+(M?"/"+(r+T):""):"")}t+="f "+h.join(" ")+`
`}i+=_,s+=p,r+=g}function d(m){let _=0,g=m.geometry,p=m.type,x=g.getAttribute("position");if(t+="o "+m.name+`
`,x!==void 0)for(let E=0,b=x.count;E<b;E++,_++)o.fromBufferAttribute(x,E),o.applyMatrix4(m.matrixWorld),t+="v "+o.x+" "+o.y+" "+o.z+`
`;if(p==="Line"){t+="l ";for(let E=1,b=x.count;E<=b;E++)t+=i+E+" ";t+=`
`}if(p==="LineSegments")for(let E=1,b=E+1,M=x.count;E<M;E+=2,b=E+1)t+="l "+(i+E)+" "+(i+b)+`
`;i+=_}function f(m){let _=0,g=m.geometry,p=g.getAttribute("position"),x=g.getAttribute("color");if(t+="o "+m.name+`
`,p!==void 0){for(let E=0,b=p.count;E<b;E++,_++)o.fromBufferAttribute(p,E),o.applyMatrix4(m.matrixWorld),t+="v "+o.x+" "+o.y+" "+o.z,x!==void 0&&(a.fromBufferAttribute(x,E),Qe.workingToColorSpace(a,wt),t+=" "+a.r+" "+a.g+" "+a.b),t+=`
`;t+="p ";for(let E=1,b=p.count;E<=b;E++)t+=i+E+" ";t+=`
`}i+=_}return e.traverse(function(m){m.isMesh===!0&&u(m),m.isLine===!0&&d(m),m.isPoints===!0&&f(m)}),t}};var x_={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]},ws=class{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(e){return new Bf(e)}),this.register(function(e){return new kf(e)}),this.register(function(e){return new Gf(e)}),this.register(function(e){return new Wf(e)}),this.register(function(e){return new Xf(e)}),this.register(function(e){return new Yf(e)}),this.register(function(e){return new zf(e)}),this.register(function(e){return new Hf(e)}),this.register(function(e){return new Vf(e)}),this.register(function(e){return new $f(e)}),this.register(function(e){return new qf(e)}),this.register(function(e){return new jf(e)}),this.register(function(e){return new Zf(e)}),this.register(function(e){return new Kf(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}setTextureUtils(e){return this.textureUtils=e,this}parse(e,t,i,s){let r=new Ff,o=[];for(let a=0,l=this.pluginCallbacks.length;a<l;a++)o.push(this.pluginCallbacks[a](r));r.setPlugins(o),r.setTextureUtils(this.textureUtils),r.writeAsync(e,t,s).catch(i)}parseAsync(e,t){let i=this;return new Promise(function(s,r){i.parse(e,s,r,t)})}},st={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},Nf="KHR_mesh_quantization",Pn={};Pn[Ut]=st.NEAREST;Pn[gc]=st.NEAREST_MIPMAP_NEAREST;Pn[Ws]=st.NEAREST_MIPMAP_LINEAR;Pn[Ft]=st.LINEAR;Pn[io]=st.LINEAR_MIPMAP_NEAREST;Pn[xi]=st.LINEAR_MIPMAP_LINEAR;Pn[Fn]=st.CLAMP_TO_EDGE;Pn[kr]=st.REPEAT;Pn[zr]=st.MIRRORED_REPEAT;var y_={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},rA=new Ge,b_=12,oA=1179937895,aA=2,v_=8,lA=1313821514,cA=5130562;function Hi(n,e){return n.length===e.length&&n.every(function(t,i){return t===e[i]})}function hA(n){return new TextEncoder().encode(n).buffer}function uA(n){return Hi(n.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function dA(n,e,t){let i={min:new Array(n.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(n.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let s=e;s<e+t;s++)for(let r=0;r<n.itemSize;r++){let o;n.itemSize>4?o=n.array[s*n.itemSize+r]:(r===0?o=n.getX(s):r===1?o=n.getY(s):r===2?o=n.getZ(s):r===3&&(o=n.getW(s)),n.normalized===!0&&(o=Rn.normalize(o,n.array))),i.min[r]=Math.min(i.min[r],o),i.max[r]=Math.max(i.max[r],o)}return i}function M_(n){return Math.ceil(n/4)*4}function Of(n,e=0){let t=M_(n.byteLength);if(t!==n.byteLength){let i=new Uint8Array(t);if(i.set(new Uint8Array(n)),e!==0)for(let s=n.byteLength;s<t;s++)i[s]=e;return i.buffer}return n}function Uf(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function fA(n,e){if(typeof OffscreenCanvas<"u"&&n instanceof OffscreenCanvas){let t;return e==="image/jpeg"?t=.92:e==="image/webp"&&(t=.8),n.convertToBlob({type:e,quality:t})}else return new Promise(t=>n.toBlob(t,e))}var Ff=class{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter r186"}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map,normalMaps:new Map},this.textureUtils=null}setPlugins(e){this.plugins=e}setTextureUtils(e){this.textureUtils=e}async writeAsync(e,t,i={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1,copyright:null},i),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(e),await Promise.all(this.pending);let s=this,r=s.buffers,o=s.json;i=s.options;let a=s.extensionsUsed,l=s.extensionsRequired,c=new Blob(r,{type:"application/octet-stream"}),h=Object.keys(a),u=Object.keys(l);if(h.length>0&&(o.extensionsUsed=h),u.length>0&&(o.extensionsRequired=u),o.buffers&&o.buffers.length>0&&(o.buffers[0].byteLength=c.size),i.copyright&&(o.asset.copyright=i.copyright),i.binary===!0){let d=new FileReader;d.readAsArrayBuffer(c),d.onloadend=function(){let f=Of(d.result),m=new DataView(new ArrayBuffer(v_));m.setUint32(0,f.byteLength,!0),m.setUint32(4,cA,!0);let _=Of(hA(JSON.stringify(o)),32),g=new DataView(new ArrayBuffer(v_));g.setUint32(0,_.byteLength,!0),g.setUint32(4,lA,!0);let p=new ArrayBuffer(b_),x=new DataView(p);x.setUint32(0,oA,!0),x.setUint32(4,aA,!0);let E=b_+g.byteLength+_.byteLength+m.byteLength+f.byteLength;x.setUint32(8,E,!0);let b=new Blob([p,g,_,m,f],{type:"application/octet-stream"}),M=new FileReader;M.readAsArrayBuffer(b),M.onloadend=function(){t(M.result)}}}else if(o.buffers&&o.buffers.length>0){let d=new FileReader;d.readAsDataURL(c),d.onloadend=function(){let f=d.result;o.buffers[0].uri=f,t(o)}}else t(o)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;let i=this.options,s=this.extensionsUsed;try{let r=JSON.parse(JSON.stringify(e.userData));if(i.includeCustomExtensions&&r.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(let o in r.gltfExtensions)t.extensions[o]=r.gltfExtensions[o],s[o]=!0;delete r.gltfExtensions}Object.keys(r).length>0&&(t.extras=r)}catch(r){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+r.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){let s=new Map;s.set(!0,this.uid++),s.set(!1,this.uid++),this.uids.set(e,s)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;let i=new O;for(let s=0,r=e.count;s<r;s++)if(Math.abs(i.fromBufferAttribute(e,s).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){let t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);let i=e.clone(),s=new O;for(let r=0,o=i.count;r<o;r++)s.fromBufferAttribute(i,r),s.x===0&&s.y===0&&s.z===0?s.setX(1):s.normalize(),i.setXYZ(r,s.x,s.y,s.z);return t.attributesNormalized.set(e,i),i}applyTextureTransform(e,t){let i=!1,s={};(t.offset.x!==0||t.offset.y!==0)&&(s.offset=t.offset.toArray(),i=!0),t.rotation!==0&&(s.rotation=t.rotation,i=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(s.scale=t.repeat.toArray(),i=!0),i&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=s,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(e,t){if(e===t)return e;function i(f){return f.colorSpace===wt?function(_){return _<.04045?_*.0773993808:Math.pow(_*.9478672986+.0521327014,2.4)}:function(_){return _}}e instanceof ts&&(e=await this.decompressTextureAsync(e)),t instanceof ts&&(t=await this.decompressTextureAsync(t));let s=e?e.image:null,r=t?t.image:null,o=Math.max(s?s.width:0,r?r.width:0),a=Math.max(s?s.height:0,r?r.height:0),l=Uf();l.width=o,l.height=a;let c=l.getContext("2d",{willReadFrequently:!0});c.fillStyle="#00ffff",c.fillRect(0,0,o,a);let h=c.getImageData(0,0,o,a);if(s){c.drawImage(s,0,0,o,a);let f=i(e),m=c.getImageData(0,0,o,a).data;for(let _=2;_<m.length;_+=4)h.data[_]=f(m[_]/256)*256}if(r){c.drawImage(r,0,0,o,a);let f=i(t),m=c.getImageData(0,0,o,a).data;for(let _=1;_<m.length;_+=4)h.data[_]=f(m[_]/256)*256}c.putImageData(h,0,0);let d=(e||t).clone();return d.source=new Oi(l),d.colorSpace=ti,d.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),d}async buildNormalMapTextureAsync(e,t,i){e instanceof ts&&(e=await this.decompressTextureAsync(e));let s=e.image,r=Uf();r.width=s.width,r.height=s.height;let o=r.getContext("2d",{willReadFrequently:!0});o.drawImage(s,0,0,r.width,r.height);let a=o.getImageData(0,0,r.width,r.height),l=a.data;for(let h=0;h<l.length;h+=4)t&&(l[h+0]=255-l[h+0]),i&&(l[h+1]=255-l[h+1]);o.putImageData(a,0,0);let c=e.clone();return c.source=new Oi(r),c}async decompressTextureAsync(e,t=1/0){if(this.textureUtils===null)throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");return await this.textureUtils.decompress(e,t)}processBuffer(e){let t=this.json,i=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),i.push(e),0}processBufferView(e,t,i,s,r){let o=this.json;o.bufferViews||(o.bufferViews=[]);let a;switch(t){case st.BYTE:case st.UNSIGNED_BYTE:a=1;break;case st.SHORT:case st.UNSIGNED_SHORT:a=2;break;default:a=4}let l=e.itemSize*a;r===st.ARRAY_BUFFER&&(l=Math.ceil(l/4)*4);let c=M_(s*l),h=new DataView(new ArrayBuffer(c)),u=0;for(let m=i;m<i+s;m++){for(let _=0;_<e.itemSize;_++){let g;e.itemSize>4?g=e.array[m*e.itemSize+_]:(_===0?g=e.getX(m):_===1?g=e.getY(m):_===2?g=e.getZ(m):_===3&&(g=e.getW(m)),e.normalized===!0&&(g=Rn.normalize(g,e.array))),t===st.FLOAT?h.setFloat32(u,g,!0):t===st.INT?h.setInt32(u,g,!0):t===st.UNSIGNED_INT?h.setUint32(u,g,!0):t===st.SHORT?h.setInt16(u,g,!0):t===st.UNSIGNED_SHORT?h.setUint16(u,g,!0):t===st.BYTE?h.setInt8(u,g):t===st.UNSIGNED_BYTE&&h.setUint8(u,g),u+=a}u%l!==0&&(u+=l-u%l)}let d={buffer:this.processBuffer(h.buffer),byteOffset:this.byteOffset,byteLength:c};return r!==void 0&&(d.target=r),r===st.ARRAY_BUFFER&&(d.byteStride=l),this.byteOffset+=c,o.bufferViews.push(d),{id:o.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){let t=this,i=t.json;return i.bufferViews||(i.bufferViews=[]),new Promise(function(s){let r=new FileReader;r.readAsArrayBuffer(e),r.onloadend=function(){let o=Of(r.result),a={buffer:t.processBuffer(o),byteOffset:t.byteOffset,byteLength:o.byteLength};t.byteOffset+=o.byteLength,s(i.bufferViews.push(a)-1)}})}processAccessor(e,t,i,s){let r=this.json,o={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"},a;if(e.array.constructor===Float32Array)a=st.FLOAT;else if(e.array.constructor===Int32Array)a=st.INT;else if(e.array.constructor===Uint32Array)a=st.UNSIGNED_INT;else if(e.array.constructor===Int16Array)a=st.SHORT;else if(e.array.constructor===Uint16Array)a=st.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)a=st.BYTE;else if(e.array.constructor===Uint8Array)a=st.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+e.array.constructor.name);if(i===void 0&&(i=0),(s===void 0||s===1/0)&&(s=e.count),s===0)return null;let l=dA(e,i,s),c;t!==void 0&&(c=e===t.index?st.ELEMENT_ARRAY_BUFFER:st.ARRAY_BUFFER);let h=this.processBufferView(e,a,i,s,c),u={bufferView:h.id,byteOffset:h.byteOffset,componentType:a,count:s,max:l.max,min:l.min,type:o[e.itemSize]};return e.normalized===!0&&(u.normalized=!0),r.accessors||(r.accessors=[]),r.accessors.push(u)-1}processImage(e,t,i,s="image/png"){if(e!==null){let r=this,o=r.cache,a=r.json,l=r.options,c=r.pending;o.images.has(e)||o.images.set(e,{});let h=o.images.get(e),u=s+":flipY/"+i.toString();if(h[u]!==void 0)return h[u];a.images||(a.images=[]);let d={mimeType:s},f=Uf();f.width=Math.min(e.width,l.maxTextureSize),f.height=Math.min(e.height,l.maxTextureSize);let m=f.getContext("2d",{willReadFrequently:!0});if(i===!0&&(m.translate(0,f.height),m.scale(1,-1)),e.data!==void 0){t!==bn&&console.error("GLTFExporter: Only RGBAFormat is supported.",t),(e.width>l.maxTextureSize||e.height>l.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);let g=new Uint8ClampedArray(e.height*e.width*4);for(let p=0;p<g.length;p+=4)g[p+0]=e.data[p+0],g[p+1]=e.data[p+1],g[p+2]=e.data[p+2],g[p+3]=e.data[p+3];m.putImageData(new ImageData(g,e.width,e.height),0,0)}else if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas)m.drawImage(e,0,0,f.width,f.height);else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");l.binary===!0?c.push(fA(f,s).then(g=>r.processBufferViewImage(g)).then(g=>{d.bufferView=g})):d.uri=Xr.getDataURL(f,s);let _=a.images.push(d)-1;return h[u]=_,_}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(e){let t=this.json;t.samplers||(t.samplers=[]);let i={magFilter:Pn[e.magFilter],minFilter:Pn[e.minFilter],wrapS:Pn[e.wrapS],wrapT:Pn[e.wrapT]};return t.samplers.push(i)-1}async processTextureAsync(e){let i=this.options,s=this.cache,r=this.json;if(s.textures.has(e))return s.textures.get(e);r.textures||(r.textures=[]),e instanceof ts&&(e=await this.decompressTextureAsync(e,i.maxTextureSize));let o=e.userData.mimeType,a=this.processImage(e.image,e.format,e.flipY,o),l={sampler:this.processSampler(e)};o==="image/webp"?(l.extensions=l.extensions||{},l.extensions.EXT_texture_webp={source:a},this.extensionsUsed.EXT_texture_webp=!0,this.extensionsRequired.EXT_texture_webp=!0):l.source=a,e.name&&(l.name=e.name),await this._invokeAllAsync(async function(h){h.writeTexture&&await h.writeTexture(e,l)});let c=r.textures.push(l)-1;return s.textures.set(e,c),c}async processMaterialAsync(e,t){let i=this.cache,s=this.json,r=t!==void 0&&t.hasAttribute("tangent"),o=e.normalMap?e.uuid+":"+r:e.uuid;if(i.materials.has(o))return i.materials.get(o);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;s.materials||(s.materials=[]);let a={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");let l=e.color.toArray().concat([e.opacity]);if(Hi(l,[1,1,1,1])||(a.pbrMetallicRoughness.baseColorFactor=l),e.isMeshStandardMaterial?(a.pbrMetallicRoughness.metallicFactor=e.metalness,a.pbrMetallicRoughness.roughnessFactor=e.roughness):(a.pbrMetallicRoughness.metallicFactor=0,a.pbrMetallicRoughness.roughnessFactor=1),e.metalnessMap||e.roughnessMap){let h=await this.buildMetalRoughTextureAsync(e.metalnessMap,e.roughnessMap),u={index:await this.processTextureAsync(h),texCoord:h.channel};this.applyTextureTransform(u,h),a.pbrMetallicRoughness.metallicRoughnessTexture=u}if(e.map){let h={index:await this.processTextureAsync(e.map),texCoord:e.map.channel};this.applyTextureTransform(h,e.map),a.pbrMetallicRoughness.baseColorTexture=h}if(e.emissive){let h=e.emissive;if(Math.max(h.r,h.g,h.b)>0&&(a.emissiveFactor=e.emissive.toArray()),e.emissiveMap){let d={index:await this.processTextureAsync(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(d,e.emissiveMap),a.emissiveTexture=d}}if(e.normalMap){let h=e.normalScale,u=h.x<0,d=r?h.y<0:h.y>0,f=e.normalMap;if(u||d){i.normalMaps.has(e.normalMap)===!1&&i.normalMaps.set(e.normalMap,{});let _=i.normalMaps.get(e.normalMap),g=`${u}:${d}`;_[g]===void 0&&(_[g]=await this.buildNormalMapTextureAsync(e.normalMap,u,d)),f=_[g]}let m={index:await this.processTextureAsync(f),texCoord:e.normalMap.channel};Math.abs(h.x)!==1&&(m.scale=Math.abs(h.x)),this.applyTextureTransform(m,e.normalMap),a.normalTexture=m}if(e.aoMap){let h={index:await this.processTextureAsync(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(h.strength=e.aoMapIntensity),this.applyTextureTransform(h,e.aoMap),a.occlusionTexture=h}e.transparent?a.alphaMode="BLEND":e.alphaTest>0&&(a.alphaMode="MASK",a.alphaCutoff=e.alphaTest),e.side===mn&&(a.doubleSided=!0),e.name!==""&&(a.name=e.name),this.serializeUserData(e,a),await this._invokeAllAsync(async function(h){h.writeMaterialAsync&&await h.writeMaterialAsync(e,a)});let c=s.materials.push(a)-1;return i.materials.set(o,c),c}async processMeshAsync(e){let t=this.cache,i=this.json,s=[e.geometry.uuid];if(Array.isArray(e.material))for(let b=0,M=e.material.length;b<M;b++)s.push(e.material[b].uuid);else s.push(e.material.uuid);let r=s.join(":");if(t.meshes.has(r))return t.meshes.get(r);let o=e.geometry,a;e.isLineSegments?a=st.LINES:e.isLineLoop?a=st.LINE_LOOP:e.isLine?a=st.LINE_STRIP:e.isPoints?a=st.POINTS:a=e.material.wireframe?st.LINES:st.TRIANGLES;let l={},c={},h=[],u=[],d={uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},f=o.getAttribute("normal");f!==void 0&&!this.isNormalizedNormalAttribute(f)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),o.setAttribute("normal",this.createNormalizedNormalAttribute(f)));let m=null;for(let b in o.attributes){if(b.slice(0,5)==="morph")continue;let M=o.attributes[b];if(b=d[b]||b.toUpperCase(),!/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(b)&&!b.startsWith("_")&&(b="_"+b),t.attributes.has(this.getUID(M))){c[b]=t.attributes.get(this.getUID(M));continue}m=null;let A=M.array;b==="JOINTS_0"&&!(A instanceof Uint16Array)&&!(A instanceof Uint8Array)?(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),m=ws.Utils.toTypedBufferAttribute(M,Uint16Array)):(A instanceof Uint32Array||A instanceof Int32Array)&&!b.startsWith("_")&&(console.warn(`GLTFExporter: Attribute "${b}" converted to type FLOAT.`),m=ws.Utils.toTypedBufferAttribute(M,Float32Array));let y=this.processAccessor(m||M,o);y!==null&&(b.startsWith("_")||this.detectMeshQuantization(b,M),c[b]=y,t.attributes.set(this.getUID(M),y))}if(f!==void 0&&o.setAttribute("normal",f),Object.keys(c).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){let b=[],M=[],v={};if(e.morphTargetDictionary!==void 0)for(let A in e.morphTargetDictionary)v[e.morphTargetDictionary[A]]=A;for(let A=0;A<e.morphTargetInfluences.length;++A){let y={},w=!1;for(let L in o.morphAttributes){if(L!=="position"&&L!=="normal"){w||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),w=!0);continue}let T=o.morphAttributes[L][A],C=L.toUpperCase(),R=o.attributes[L];if(t.attributes.has(this.getUID(T,!0))){y[C]=t.attributes.get(this.getUID(T,!0));continue}let P=T.clone();if(!o.morphTargetsRelative)for(let D=0,k=T.count;D<k;D++)for(let V=0;V<T.itemSize;V++)V===0&&P.setX(D,T.getX(D)-R.getX(D)),V===1&&P.setY(D,T.getY(D)-R.getY(D)),V===2&&P.setZ(D,T.getZ(D)-R.getZ(D)),V===3&&P.setW(D,T.getW(D)-R.getW(D));y[C]=this.processAccessor(P,o),t.attributes.set(this.getUID(R,!0),y[C])}u.push(y),b.push(e.morphTargetInfluences[A]),e.morphTargetDictionary!==void 0&&M.push(v[A])}l.weights=b,M.length>0&&(l.extras={},l.extras.targetNames=M)}let _=Array.isArray(e.material);if(_&&o.groups.length===0)return null;let g=!1;if(_&&o.index===null){let b=[];for(let M=0,v=o.attributes.position.count;M<v;M++)b[M]=M;o.setIndex(b),g=!0}let p=_?e.material:[e.material],x=_?o.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let b=0,M=x.length;b<M;b++){let v={mode:a,attributes:c};if(this.serializeUserData(o,v),u.length>0&&(v.targets=u),o.index!==null){let y=this.getUID(o.index);(x[b].start!==void 0||x[b].count!==void 0)&&(y+=":"+x[b].start+":"+x[b].count),t.attributes.has(y)?v.indices=t.attributes.get(y):(v.indices=this.processAccessor(o.index,o,x[b].start,x[b].count),t.attributes.set(y,v.indices)),v.indices===null&&delete v.indices}let A=await this.processMaterialAsync(p[x[b].materialIndex],o);A!==null&&(v.material=A),h.push(v)}g===!0&&o.setIndex(null),l.primitives=h,i.meshes||(i.meshes=[]),await this._invokeAllAsync(function(b){b.writeMesh&&b.writeMesh(e,l)});let E=i.meshes.push(l)-1;return t.meshes.set(r,E),E}detectMeshQuantization(e,t){if(this.extensionsUsed[Nf])return;let i;switch(t.array.constructor){case Int8Array:i="byte";break;case Uint8Array:i="unsigned byte";break;case Int16Array:i="short";break;case Uint16Array:i="unsigned short";break;default:return}t.normalized&&(i+=" normalized");let s=e.split("_",1)[0];x_[s]&&x_[s].includes(i)&&(this.extensionsUsed[Nf]=!0,this.extensionsRequired[Nf]=!0)}processCamera(e){let t=this.json;t.cameras||(t.cameras=[]);let i=e.isOrthographicCamera,s={type:i?"orthographic":"perspective"};return i?s.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:s.perspective={aspectRatio:e.aspect,yfov:Rn.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(s.name=e.type),t.cameras.push(s)-1}processAnimation(e,t){let i=this.json,s=this.nodeMap;i.animations||(i.animations=[]),e=ws.Utils.mergeMorphTargetTracks(e.clone(),t);let r=e.tracks,o=[],a=[];for(let c=0;c<r.length;++c){let h=r[c],u=ft.parseTrackName(h.name),d=ft.findNode(t,u.nodeName),f=y_[u.propertyName];if(u.objectName==="bones"&&(d.isSkinnedMesh===!0?d=d.skeleton.getBoneByName(u.objectIndex):d=void 0),!d||!f){console.warn('THREE.GLTFExporter: Could not export animation track "%s".',h.name);continue}let m=1,_=h.values.length/h.times.length;f===y_.morphTargetInfluences&&(_/=d.morphTargetInfluences.length);let g;h.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(g="CUBICSPLINE",_/=3):h.getInterpolation()===Us?g="STEP":g="LINEAR",a.push({input:this.processAccessor(new mt(h.times,m)),output:this.processAccessor(new mt(h.values,_)),interpolation:g}),o.push({sampler:a.length-1,target:{node:s.get(d),path:f}})}let l={name:e.name||"clip_"+i.animations.length,samplers:a,channels:o};return this.serializeUserData(e,l),i.animations.push(l),i.animations.length-1}processSkin(e){let t=this.json,i=this.nodeMap,s=t.nodes[i.get(e)],r=e.skeleton;if(r===void 0)return null;let o=e.skeleton.bones[0];if(o===void 0)return null;let a=[],l=new Float32Array(r.bones.length*16),c=new tt;for(let u=0;u<r.bones.length;++u)a.push(i.get(r.bones[u])),c.copy(r.boneInverses[u]),c.multiply(e.bindMatrix).toArray(l,u*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new mt(l,16)),joints:a,skeleton:i.get(o)}),s.skin=t.skins.length-1}async processNodeAsync(e){let t=this.json,i=this.options,s=this.nodeMap;if(t.nodes||(t.nodes=[]),e.pivot!==null)return await this._processNodeWithPivotAsync(e);let r={};if(i.trs){let a=e.quaternion.toArray(),l=e.position.toArray(),c=e.scale.toArray();Hi(a,[0,0,0,1])||(r.rotation=a),Hi(l,[0,0,0])||(r.translation=l),Hi(c,[1,1,1])||(r.scale=c)}else e.matrixAutoUpdate&&e.updateMatrix(),uA(e.matrix)===!1&&(r.matrix=e.matrix.elements);if(e.name!==""&&(r.name=String(e.name)),this.serializeUserData(e,r),e.isMesh||e.isLine||e.isPoints){let a=await this.processMeshAsync(e);a!==null&&(r.mesh=a)}else e.isCamera&&(r.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);let o=t.nodes.push(r)-1;if(s.set(e,o),e.children.length>0){let a=[];for(let l=0,c=e.children.length;l<c;l++){let h=e.children[l];if(h.visible||i.onlyVisible===!1){let u=await this.processNodeAsync(h);u!==null&&a.push(u)}}a.length>0&&(r.children=a)}return await this._invokeAllAsync(function(a){a.writeNode&&a.writeNode(e,r)}),o}async _processNodeWithPivotAsync(e){let t=this.json,i=this.options,s=this.nodeMap,r=e.pivot,o={},a=e.quaternion.toArray(),l=[e.position.x+r.x,e.position.y+r.y,e.position.z+r.z],c=e.scale.toArray();Hi(a,[0,0,0,1])||(o.rotation=a),Hi(l,[0,0,0])||(o.translation=l),Hi(c,[1,1,1])||(o.scale=c),o.extras={pivot:r.toArray()},e.name!==""&&(o.name=String(e.name)),this.serializeUserData(e,o);let h=t.nodes.push(o)-1;s.set(e,h);let u={},d=[-r.x,-r.y,-r.z];if(Hi(d,[0,0,0])||(u.translation=d),e.isMesh||e.isLine||e.isPoints){let _=await this.processMeshAsync(e);_!==null&&(u.mesh=_)}else e.isCamera&&(u.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);let m=[t.nodes.push(u)-1];if(e.children.length>0){let _=[];for(let g=0,p=e.children.length;g<p;g++){let x=e.children[g];if(x.visible||i.onlyVisible===!1){let E=await this.processNodeAsync(x);E!==null&&_.push(E)}}_.length>0&&(u.children=_)}return o.children=m,await this._invokeAllAsync(function(_){_.writeNode&&_.writeNode(e,o)}),h}async processSceneAsync(e){let t=this.json,i=this.options;t.scenes||(t.scenes=[],t.scene=0);let s={};e.name!==""&&(s.name=e.name),t.scenes.push(s);let r=[];for(let o=0,a=e.children.length;o<a;o++){let l=e.children[o];if(l.visible||i.onlyVisible===!1){let c=await this.processNodeAsync(l);c!==null&&r.push(c)}}r.length>0&&(s.nodes=r),this.serializeUserData(e,s)}async processObjectsAsync(e){let t=new pi;t.name="AuxScene";for(let i=0;i<e.length;i++)t.children.push(e[i]);await this.processSceneAsync(t)}async processInputAsync(e){let t=this.options;e=e instanceof Array?e:[e],await this._invokeAllAsync(function(s){s.beforeParse&&s.beforeParse(e)});let i=[];for(let s=0;s<e.length;s++)e[s]instanceof pi?await this.processSceneAsync(e[s]):i.push(e[s]);i.length>0&&await this.processObjectsAsync(i);for(let s=0;s<this.skins.length;++s)this.processSkin(this.skins[s]);if(e.length===1)for(let s=0;s<t.animations.length;++s)this.processAnimation(t.animations[s],e[0]);else for(let s=0;s<e.length;s++){let r=t.animations[s]||[];for(let o=0;o<r.length;++o)this.processAnimation(r[o],e[s])}await this._invokeAllAsync(function(s){s.afterParse&&s.afterParse(e)})}async _invokeAllAsync(e){for(let t=0,i=this.plugins.length;t<i;t++)await e(this.plugins[t])}},Bf=class{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);return}let i=this.writer,s=i.json,r=i.extensionsUsed,o={};e.name&&(o.name=e.name),o.color=e.color.toArray(),o.intensity=e.intensity,e.isDirectionalLight?o.type="directional":e.isPointLight?(o.type="point",e.distance>0&&(o.range=e.distance)):e.isSpotLight&&(o.type="spot",e.distance>0&&(o.range=e.distance),o.spot={},o.spot.innerConeAngle=(1-e.penumbra)*e.angle,o.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),r[this.name]||(s.extensions=s.extensions||{},s.extensions[this.name]={lights:[]},r[this.name]=!0);let a=s.extensions[this.name].lights;a.push(o),t.extensions=t.extensions||{},t.extensions[this.name]={light:a.length-1}}},kf=class{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}async writeMaterialAsync(e,t){if(!e.isMeshBasicMaterial)return;let s=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},s[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}},zf=class{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.clearcoat===0)return;let i=this.writer,s=i.extensionsUsed,r={};if(r.clearcoatFactor=e.clearcoat,e.clearcoatMap){let o={index:await i.processTextureAsync(e.clearcoatMap),texCoord:e.clearcoatMap.channel};i.applyTextureTransform(o,e.clearcoatMap),r.clearcoatTexture=o}if(r.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){let o={index:await i.processTextureAsync(e.clearcoatRoughnessMap),texCoord:e.clearcoatRoughnessMap.channel};i.applyTextureTransform(o,e.clearcoatRoughnessMap),r.clearcoatRoughnessTexture=o}if(e.clearcoatNormalMap){let o={index:await i.processTextureAsync(e.clearcoatNormalMap),texCoord:e.clearcoatNormalMap.channel};e.clearcoatNormalScale.x!==1&&(o.scale=e.clearcoatNormalScale.x),i.applyTextureTransform(o,e.clearcoatNormalMap),r.clearcoatNormalTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Hf=class{constructor(e){this.writer=e,this.name="KHR_materials_dispersion"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.dispersion===0)return;let s=this.writer.extensionsUsed,r={};r.dispersion=e.dispersion,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Vf=class{constructor(e){this.writer=e,this.name="KHR_materials_iridescence"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.iridescence===0)return;let i=this.writer,s=i.extensionsUsed,r={};if(r.iridescenceFactor=e.iridescence,e.iridescenceMap){let o={index:await i.processTextureAsync(e.iridescenceMap),texCoord:e.iridescenceMap.channel};i.applyTextureTransform(o,e.iridescenceMap),r.iridescenceTexture=o}if(r.iridescenceIor=e.iridescenceIOR,r.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],r.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1],e.iridescenceThicknessMap){let o={index:await i.processTextureAsync(e.iridescenceThicknessMap),texCoord:e.iridescenceThicknessMap.channel};i.applyTextureTransform(o,e.iridescenceThicknessMap),r.iridescenceThicknessTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Gf=class{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let i=this.writer,s=i.extensionsUsed,r={};if(r.transmissionFactor=e.transmission,e.transmissionMap){let o={index:await i.processTextureAsync(e.transmissionMap),texCoord:e.transmissionMap.channel};i.applyTextureTransform(o,e.transmissionMap),r.transmissionTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Wf=class{constructor(e){this.writer=e,this.name="KHR_materials_volume"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let i=this.writer,s=i.extensionsUsed,r={};if(r.thicknessFactor=e.thickness,e.thicknessMap){let o={index:await i.processTextureAsync(e.thicknessMap),texCoord:e.thicknessMap.channel};i.applyTextureTransform(o,e.thicknessMap),r.thicknessTexture=o}e.attenuationDistance!==1/0&&(r.attenuationDistance=e.attenuationDistance),r.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Xf=class{constructor(e){this.writer=e,this.name="KHR_materials_ior"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.ior===1.5)return;let s=this.writer.extensionsUsed,r={};r.ior=e.ior,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Yf=class{constructor(e){this.writer=e,this.name="KHR_materials_specular"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.specularIntensity===1&&e.specularColor.equals(rA)&&!e.specularIntensityMap&&!e.specularColorMap)return;let i=this.writer,s=i.extensionsUsed,r={};if(e.specularIntensityMap){let o={index:await i.processTextureAsync(e.specularIntensityMap),texCoord:e.specularIntensityMap.channel};i.applyTextureTransform(o,e.specularIntensityMap),r.specularTexture=o}if(e.specularColorMap){let o={index:await i.processTextureAsync(e.specularColorMap),texCoord:e.specularColorMap.channel};i.applyTextureTransform(o,e.specularColorMap),r.specularColorTexture=o}r.specularFactor=e.specularIntensity,r.specularColorFactor=e.specularColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},$f=class{constructor(e){this.writer=e,this.name="KHR_materials_sheen"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.sheen==0)return;let i=this.writer,s=i.extensionsUsed,r={};if(e.sheenRoughnessMap){let o={index:await i.processTextureAsync(e.sheenRoughnessMap),texCoord:e.sheenRoughnessMap.channel};i.applyTextureTransform(o,e.sheenRoughnessMap),r.sheenRoughnessTexture=o}if(e.sheenColorMap){let o={index:await i.processTextureAsync(e.sheenColorMap),texCoord:e.sheenColorMap.channel};i.applyTextureTransform(o,e.sheenColorMap),r.sheenColorTexture=o}r.sheenRoughnessFactor=e.sheenRoughness,r.sheenColorFactor=e.sheenColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},qf=class{constructor(e){this.writer=e,this.name="KHR_materials_anisotropy"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.anisotropy==0)return;let i=this.writer,s=i.extensionsUsed,r={};if(e.anisotropyMap){let o={index:await i.processTextureAsync(e.anisotropyMap)};i.applyTextureTransform(o,e.anisotropyMap),r.anisotropyTexture=o}r.anisotropyStrength=e.anisotropy,r.anisotropyRotation=e.anisotropyRotation,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},jf=class{constructor(e){this.writer=e,this.name="KHR_materials_emissive_strength"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.emissiveIntensity===1)return;let s=this.writer.extensionsUsed,r={};r.emissiveStrength=e.emissiveIntensity,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Zf=class{constructor(e){this.writer=e,this.name="EXT_materials_bump"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.bumpScale===1&&!e.bumpMap)return;let i=this.writer,s=i.extensionsUsed,r={};if(e.bumpMap){let o={index:await i.processTextureAsync(e.bumpMap),texCoord:e.bumpMap.channel};i.applyTextureTransform(o,e.bumpMap),r.bumpTexture=o}r.bumpFactor=e.bumpScale,t.extensions=t.extensions||{},t.extensions[this.name]=r,s[this.name]=!0}},Kf=class{constructor(e){this.writer=e,this.name="EXT_mesh_gpu_instancing"}writeNode(e,t){if(!e.isInstancedMesh)return;let i=this.writer,s=e,r=new Float32Array(s.count*3),o=new Float32Array(s.count*4),a=new Float32Array(s.count*3),l=new tt,c=new O,h=new It,u=new O;for(let f=0;f<s.count;f++)s.getMatrixAt(f,l),l.decompose(c,h,u),c.toArray(r,f*3),h.toArray(o,f*4),u.toArray(a,f*3);let d={TRANSLATION:i.processAccessor(new mt(r,3)),ROTATION:i.processAccessor(new mt(o,4)),SCALE:i.processAccessor(new mt(a,3))};s.instanceColor&&(d._COLOR_0=i.processAccessor(s.instanceColor)),t.extensions=t.extensions||{},t.extensions[this.name]={attributes:d},i.extensionsUsed[this.name]=!0,i.extensionsRequired[this.name]=!0}};ws.Utils={insertKeyframe:function(n,e){let i=n.getValueSize(),s=new n.TimeBufferType(n.times.length+1),r=new n.ValueBufferType(n.values.length+i),o=n.createInterpolant(new n.ValueBufferType(i)),a;if(n.times.length===0){s[0]=e;for(let l=0;l<i;l++)r[l]=0;a=0}else if(e<n.times[0]){if(Math.abs(n.times[0]-e)<.001)return 0;s[0]=e,s.set(n.times,1),r.set(o.evaluate(e),0),r.set(n.values,i),a=0}else if(e>n.times[n.times.length-1]){if(Math.abs(n.times[n.times.length-1]-e)<.001)return n.times.length-1;s[s.length-1]=e,s.set(n.times,0),r.set(n.values,0),r.set(o.evaluate(e),n.values.length),a=s.length-1}else for(let l=0;l<n.times.length;l++){if(Math.abs(n.times[l]-e)<.001)return l;if(n.times[l]<e&&n.times[l+1]>e){s.set(n.times.slice(0,l+1),0),s[l+1]=e,s.set(n.times.slice(l+1),l+2),r.set(n.values.slice(0,(l+1)*i),0),r.set(o.evaluate(e),(l+1)*i),r.set(n.values.slice((l+1)*i),(l+2)*i),a=l+1;break}}return n.times=s,n.values=r,a},mergeMorphTargetTracks:function(n,e){let t=[],i={},s=n.tracks;for(let r=0;r<s.length;++r){let o=s[r],a=ft.parseTrackName(o.name),l=ft.findNode(e,a.nodeName);if(a.propertyName!=="morphTargetInfluences"||a.propertyIndex===void 0){t.push(o);continue}if(o.createInterpolant!==o.InterpolantFactoryMethodDiscrete&&o.createInterpolant!==o.InterpolantFactoryMethodLinear){if(o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),o=o.clone(),o.setInterpolation(Hr)}let c=l.morphTargetInfluences.length,h=l.morphTargetDictionary[a.propertyIndex];if(h===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+a.propertyIndex);let u;if(i[l.uuid]===void 0){u=o.clone();let f=new u.ValueBufferType(c*u.times.length);for(let m=0;m<u.times.length;m++)f[m*c+h]=u.values[m];u.name=(a.nodeName||"")+".morphTargetInfluences",u.values=f,i[l.uuid]=u,t.push(u);continue}let d=o.createInterpolant(new o.ValueBufferType(1));u=i[l.uuid];for(let f=0;f<u.times.length;f++)u.values[f*c+h]=d.evaluate(u.times[f]);for(let f=0;f<o.times.length;f++){let m=this.insertKeyframe(u,o.times[f]);u.values[m*c+h]=o.values[f]}}return n.tracks=t,n},toTypedBufferAttribute:function(n,e){let t=new mt(new e(n.count*n.itemSize),n.itemSize,!1);if(!n.normalized&&!n.isInterleavedBufferAttribute)return t.array.set(n.array),t;for(let i=0,s=n.count;i<s;i++)for(let r=0;r<n.itemSize;r++)t.setComponent(i,r,n.getComponent(i,r));return t}};var Xh=class{parse(e,t,i={}){function s(L){e.traverse(function(T){if(T.isMesh===!0||T.isPoints){let C=T,R=C.geometry;R.hasAttribute("position")===!0&&L(C,R)}})}i=Object.assign({binary:!1,excludeAttributes:[],littleEndian:!1,customPropertyMapping:{}},i);let o=i.excludeAttributes,a=i.customPropertyMapping,l=Object.keys(a),c=!0,h=!1,u=!1,d=!1,f="float",m="float",_="float",g="uchar",p={};for(let L of l)p[L]="float";let x=0,E=0;e.traverse(function(L){if(L.isMesh===!0){let C=L.geometry,R=C.getAttribute("position"),P=C.getAttribute("normal"),D=C.getAttribute("uv"),k=C.getAttribute("color"),V=C.getIndex();if(R===void 0)return;x+=R.count,E+=V?V.count/3:R.count/3,f=Vi(R.array),P!==void 0&&(h=!0,m=Vi(P.array)),D!==void 0&&(d=!0,_=Vi(D.array)),k!==void 0&&(u=!0,g=Vi(k.array));for(let j of l){let q=C.getAttribute(j);q!==void 0&&(p[j]=Vi(q.array))}}else if(L.isPoints){let C=L.geometry,R=C.getAttribute("position"),P=C.getAttribute("normal"),D=C.getAttribute("color");x+=R.count,f=Vi(R.array),P!==void 0&&(h=!0,m=Vi(P.array)),D!==void 0&&(u=!0,g=Vi(D.array));for(let k of l){let V=C.getAttribute(k);V!==void 0&&(p[k]=Vi(V.array))}c=!1}});let b=new Ge;if(c=c&&o.indexOf("index")===-1,h=h&&o.indexOf("normal")===-1,u=u&&o.indexOf("color")===-1,d=d&&o.indexOf("uv")===-1,c&&E!==Math.floor(E))return console.error("PLYExporter: Failed to generate a valid PLY file with triangle indices because the number of indices is not divisible by 3."),null;let M=4,v=`ply
format ${i.binary?i.littleEndian?"binary_little_endian":"binary_big_endian":"ascii"} 1.0
element vertex ${x}
property ${f} x
property ${f} y
property ${f} z
`;h===!0&&(v+=`property ${m} nx
property ${m} ny
property ${m} nz
`),d===!0&&(v+=`property ${_} s
property ${_} t
`),u===!0&&(v+=`property ${g} red
property ${g} green
property ${g} blue
`);for(let L of l){let T=p[L];for(let C of a[L])v+=`property ${T} ${C}
`}c===!0&&(v+=`element face ${E}
property list uchar int vertex_index
`),v+=`end_header
`;let A=new O,y=new $e,w=null;if(i.binary===!0){let L=new TextEncoder().encode(v),T=Za(f),C=h?Za(m):null,R=d?Za(_):null,P=u?Za(g):null,D=sr(g),k=E_(g),V={},j={},q=0;for(let ye of l){let B=p[ye],G=Za(B);V[ye]=G,j[ye]=sr(B),q+=a[ye].length*G.size}let z=x*(3*T.size+(h?3*C.size:0)+(d?2*R.size:0)+(u?3*P.size:0)+q),H=c?E*(M*3+1):0,F=new DataView(new ArrayBuffer(L.length+z+H));new Uint8Array(F.buffer).set(L,0);let X=L.length,le=L.length+z,de=0;s(function(ye,B){let G=B.getAttribute("position"),re=B.getAttribute("normal"),ne=B.getAttribute("uv"),ee=B.getAttribute("color"),ie=B.getIndex();y.getNormalMatrix(ye.matrixWorld);for(let he=0,_e=G.count;he<_e;he++){if(A.fromBufferAttribute(G,he),A.applyMatrix4(ye.matrixWorld),T.write(F,X,A.x,i.littleEndian),X+=T.size,T.write(F,X,A.y,i.littleEndian),X+=T.size,T.write(F,X,A.z,i.littleEndian),X+=T.size,h===!0&&(re!=null?(A.fromBufferAttribute(re,he),A.applyMatrix3(y).normalize(),C.write(F,X,A.x,i.littleEndian),X+=C.size,C.write(F,X,A.y,i.littleEndian),X+=C.size,C.write(F,X,A.z,i.littleEndian),X+=C.size):(C.write(F,X,0,i.littleEndian),X+=C.size,C.write(F,X,0,i.littleEndian),X+=C.size,C.write(F,X,0,i.littleEndian),X+=C.size)),d===!0&&(ne!=null?(R.write(F,X,ne.getX(he),i.littleEndian),X+=R.size,R.write(F,X,ne.getY(he),i.littleEndian),X+=R.size):(R.write(F,X,0,i.littleEndian),X+=R.size,R.write(F,X,0,i.littleEndian),X+=R.size)),u===!0)if(ee!=null){b.fromBufferAttribute(ee,he),Qe.workingToColorSpace(b,wt);let me=D?b.r:Math.round(b.r*k),Ve=D?b.g:Math.round(b.g*k),Le=D?b.b:Math.round(b.b*k);P.write(F,X,me,i.littleEndian),X+=P.size,P.write(F,X,Ve,i.littleEndian),X+=P.size,P.write(F,X,Le,i.littleEndian),X+=P.size}else{let me=D?1:k;P.write(F,X,me,i.littleEndian),X+=P.size,P.write(F,X,me,i.littleEndian),X+=P.size,P.write(F,X,me,i.littleEndian),X+=P.size}for(let me of l){let Ve=V[me],Le=a[me].length,qe=B.getAttribute(me),Be=j[me];for(let rt=0;rt<Le;rt++){let gt=qe!=null?S_(qe,he,rt):0;Ve.write(F,X,Be?gt:Math.round(gt),i.littleEndian),X+=Ve.size}}}if(c===!0)if(ie!==null)for(let he=0,_e=ie.count;he<_e;he+=3)F.setUint8(le,3),le+=1,F.setUint32(le,ie.getX(he+0)+de,i.littleEndian),le+=M,F.setUint32(le,ie.getX(he+1)+de,i.littleEndian),le+=M,F.setUint32(le,ie.getX(he+2)+de,i.littleEndian),le+=M;else for(let he=0,_e=G.count;he<_e;he+=3)F.setUint8(le,3),le+=1,F.setUint32(le,de+he,i.littleEndian),le+=M,F.setUint32(le,de+he+1,i.littleEndian),le+=M,F.setUint32(le,de+he+2,i.littleEndian),le+=M;de+=G.count}),w=F.buffer}else{let L=0,T="",C="",R=sr(f),P=sr(m),D=sr(_),k=sr(g),V=E_(g),j={};for(let z of l)j[z]=sr(p[z]);let q=(z,H)=>H?z:Math.round(z);s(function(z,H){let F=H.getAttribute("position"),X=H.getAttribute("normal"),le=H.getAttribute("uv"),de=H.getAttribute("color"),ye=H.getIndex();y.getNormalMatrix(z.matrixWorld);for(let B=0,G=F.count;B<G;B++){A.fromBufferAttribute(F,B),A.applyMatrix4(z.matrixWorld);let re=q(A.x,R)+" "+q(A.y,R)+" "+q(A.z,R);if(h===!0&&(X!=null?(A.fromBufferAttribute(X,B),A.applyMatrix3(y).normalize(),re+=" "+q(A.x,P)+" "+q(A.y,P)+" "+q(A.z,P)):re+=" 0 0 0"),d===!0&&(le!=null?re+=" "+q(le.getX(B),D)+" "+q(le.getY(B),D):re+=" 0 0"),u===!0)if(de!=null){b.fromBufferAttribute(de,B),Qe.workingToColorSpace(b,wt);let ne=k?b.r:Math.round(b.r*V),ee=k?b.g:Math.round(b.g*V),ie=k?b.b:Math.round(b.b*V);re+=` ${ne} ${ee} ${ie}`}else{let ne=k?1:V;re+=` ${ne} ${ne} ${ne}`}for(let ne of l){let ee=a[ne].length,ie=H.getAttribute(ne),he=j[ne];for(let _e=0;_e<ee;_e++){let me=ie!=null?S_(ie,B,_e):0;re+=" "+q(me,he)}}T+=re+`
`}if(c===!0){if(ye!==null)for(let B=0,G=ye.count;B<G;B+=3)C+=`3 ${ye.getX(B+0)+L}`,C+=` ${ye.getX(B+1)+L}`,C+=` ${ye.getX(B+2)+L}
`;else for(let B=0,G=F.count;B<G;B+=3)C+=`3 ${L+B} ${L+B+1} ${L+B+2}
`;E+=ye?ye.count/3:F.count/3}L+=F.count}),w=`${v}${T}${c?`${C}
`:`
`}`}return typeof t=="function"&&requestAnimationFrame(()=>t(w)),w}};function Vi(n){return n instanceof Int8Array?"char":n instanceof Uint8Array||n instanceof Uint8ClampedArray?"uchar":n instanceof Int16Array?"short":n instanceof Uint16Array?"ushort":n instanceof Int32Array?"int":n instanceof Uint32Array?"uint":n instanceof Float32Array?"float":n instanceof Float64Array?"double":"float"}function Za(n){switch(n){case"char":return{write:(e,t,i)=>e.setInt8(t,i),size:1};case"uchar":return{write:(e,t,i)=>e.setUint8(t,i),size:1};case"short":return{write:(e,t,i,s)=>e.setInt16(t,i,s),size:2};case"ushort":return{write:(e,t,i,s)=>e.setUint16(t,i,s),size:2};case"int":return{write:(e,t,i,s)=>e.setInt32(t,i,s),size:4};case"uint":return{write:(e,t,i,s)=>e.setUint32(t,i,s),size:4};case"float":return{write:(e,t,i,s)=>e.setFloat32(t,i,s),size:4};case"double":return{write:(e,t,i,s)=>e.setFloat64(t,i,s),size:8}}}function sr(n){return n==="float"||n==="double"}function S_(n,e,t){switch(t){case 0:return n.getX(e);case 1:return n.getY(e);case 2:return n.getZ(e);case 3:return n.getW(e)}}function E_(n){switch(n){case"uchar":return 255;case"ushort":return 65535;default:return 1}}var A_={tolerance:.005,angularTolerance:.05};function pA(n,e){let t=URL.createObjectURL(n),i=document.createElement("a");i.href=t,i.download=e,i.style.display="none",document.body.appendChild(i),i.click(),i.remove(),setTimeout(()=>URL.revokeObjectURL(t),1e4)}function mA(n){return new Promise((e,t)=>{let i=new FileReader;i.onload=()=>e(i.result),i.onerror=()=>t(i.error||new Error("No se pudo leer la imagen.")),i.readAsDataURL(n)})}async function Jf(n,e,t){let i=await n.tessellate(A_),s=new Rt;s.setAttribute("position",new mt(new Float32Array(i.vertices),3)),i.normals&&i.normals.length&&s.setAttribute("normal",new mt(new Float32Array(i.normals),3)),s.setIndex(new mt(new Uint32Array(i.triangles),1));let r=e?.material&&Qs(e.material.id),o=new kn({color:r?.color??"#9aa4ad",metalness:r?.metalness??.8,roughness:r?.roughness??.45});o.name=e?.material?.name??"material";let a=new at(s,o);return a.name=t,a}var Qf=n=>{n.geometry.dispose(),n.material.dispose()};async function ep(n,{kernel:e,viewer:t,partData:i,measurements:s=[],fileBase:r="pieza",fileName:o,system:a="metric"}={}){let l=(c,h,u)=>({blob:c instanceof Blob?c:new Blob([c],{type:h}),filename:`${r}.${u}`});switch(n){case"step":{let c=await e.exportShape({format:"step",name:r});return l(c.data,"application/step","step")}case"stl":case"stl-ascii":{let c=await e.exportShape({format:n,...A_,name:r});return l(c.data,"model/stl","stl")}case"obj":{let c=await Jf(e,i,r);try{return l(new Wh().parse(c),"model/obj","obj")}finally{Qf(c)}}case"glb":{let c=await Jf(e,i,r);c.scale.setScalar(.001);try{let h=await new ws().parseAsync(c,{binary:!0});return l(h,"model/gltf-binary","glb")}finally{Qf(c)}}case"ply":{let c=await Jf(e,i,r);try{let h=await new Promise(u=>new Xh().parse(c,u,{binary:!0}));return l(h,"application/octet-stream","ply")}finally{Qf(c)}}case"csv":return l("\uFEFF"+_g(i,s),"text/csv;charset=utf-8","csv");case"json":return l(xg(i,s),"application/json","json");case"report-html":{let c=t?await mA(await t.screenshot(2)):"",h=yg(i,{fileName:o??r,imageDataURL:c,measurements:s,system:a});return{blob:new Blob([h],{type:"text/html;charset=utf-8"}),filename:`${r}-reporte.html`}}case"png":return l(await t.screenshot(2),"image/png","png");default:throw new Error(`Formato de exportaci\xF3n desconocido: ${n}`)}}function w_(n,e="reporte.html"){let t=window.open("","_blank");if(!t)return pA(new Blob([n],{type:"text/html;charset=utf-8"}),e),!1;t.document.open(),t.document.write(n),t.document.close();let i=!1,s=()=>{i||t.closed||(i=!0,t.focus(),t.print())};return t.document.readyState==="complete"?setTimeout(s,200):t.addEventListener("load",()=>setTimeout(s,100),{once:!0}),setTimeout(s,3e3),!0}var tp={step:"STEP",stl:"STL","stl-ascii":"STL ASCII",obj:"OBJ",glb:"GLB",ply:"PLY","report-print":"el reporte","report-html":"el reporte HTML",csv:"CSV",json:"JSON",png:"PNG"};function gA(n){return String(n?.fileName||"pieza").replace(/\.[^.]+$/,"").replace(/[\\/:*?"<>|]+/g,"_").trim()||"pieza"}function T_(n){let e=pe("btnExport"),t=!1;async function i(s){if(!n.getState().drawing)return At("No hay pieza que exportar: abra un plano o un ejemplo y genere la pieza 3D.",{type:"warn"});if(t)return At("Ya hay una exportaci\xF3n en curso\u2026",{type:"info"});t=!0,e.setAttribute("aria-busy","true"),e.classList.add("is-busy");let r=At(`Exportando ${tp[s]||s}\u2026`,{timeout:0});try{let o=await n.prepareExport(),a=n.getState();if(o)return At(`No se puede exportar ${tp[s]||s}: ${o}`,{type:"warn"});if(!a.build||!a.partData)return At("A\xFAn no hay pieza 3D: pulse \xABGenerar pieza 3D\xBB (Ctrl+Enter) y vuelva a exportar.",{type:"warn"});/^(png|report)/.test(s)&&Nn()==="2d"&&(Sn("3d"),await new Promise(c=>requestAnimationFrame(()=>requestAnimationFrame(c))));let l={kernel:n.ensureKernelShape(),viewer:n.viewer,partData:a.partData,measurements:n.getMeasurements?n.getMeasurements():n.measure.list(),fileBase:gA(a.drawing),fileName:a.drawing?.fileName,system:a.system};if(s==="report-print"){let{blob:c,filename:h}=await ep("report-html",l),u=w_(await c.text(),h);At(u?"Reporte abierto: impr\xEDmalo o gu\xE1rdelo como PDF.":`El navegador bloque\xF3 la ventana; se descarg\xF3 ${h}.`,{type:u?"success":"warn"})}else{let{blob:c,filename:h}=await ep(s,l);Fo(c,h),At(`Exportado ${h}`,{type:"success"})}}catch(o){At(`No se pudo exportar ${tp[s]||s}: ${o?.message||o}`,{type:"error"})}finally{r(),t=!1,e.setAttribute("aria-busy","false"),e.classList.remove("is-busy")}}Bo("export",s=>i(s)),tn("s",()=>i("step"),{ctrl:!0}),tn("p",()=>i("report-print"),{ctrl:!0}),n.exportAs=i}var Ln=pe,R_=["top","front","right","left"],_A={top:"slotTop",front:"slotFront",right:"slotRight",left:"slotLeft"},xA={top:"Arrastra un rect\xE1ngulo alrededor de la vista Planta (vista desde arriba)",front:"Arrastra un rect\xE1ngulo alrededor de la vista Alzado (vista de frente)",right:"Arrastra un rect\xE1ngulo alrededor de la vista Lateral derecha",left:"Arrastra un rect\xE1ngulo alrededor de la vista Lateral izquierda"},yA=/no coinciden/;function C_(n){let{view2d:e}=n,t=null,i=0,s=()=>{Nn()==="3d"&&Sn("2d")},r=u=>{t=u;for(let d of R_)Ln(_A[d]).classList.toggle("is-active",d===u)},o=()=>{t&&(r(null),n.setMode2d("select"))};Ln("panelMultiview").addEventListener("click",u=>{let d=u.target.closest("[data-action]"),f=d&&d.closest(".slot[data-role]");if(!f)return;let m=f.dataset.role;d.dataset.action==="clear"?(t===m&&o(),n.setViewWindow(m,null)):d.dataset.action==="define"&&n.getState().profile&&(s(),n.setMode2d("window"),r(m),hi(xA[m],"2d"))}),e.on("window",u=>{if(!t)return;let d=t;r(null),n.setMode2d("select"),n.setViewWindow(d,u),R_.filter(m=>n.getState().op?.multiview.windows[m]).length<2&&hi("Define al menos una vista m\xE1s para reconstruir la pieza","2d")}),Ln("toolbar2d").addEventListener("click",u=>{let d=u.target.closest("[data-mode2d]");d&&d.dataset.mode2d!=="window"&&r(null)}),document.addEventListener("keydown",u=>{u.key!=="Escape"||!Ln("modal").hidden||(t?o():(e.mode==="calibrate"||e.mode==="axis")&&n.setMode2d("select"))});let a=Ln("mvWarn");n.onBuilt((u,d)=>{let f=n.getState().op?.mode==="multiview"?(d?.warnings||[]).filter(m=>yA.test(m)):[];a.hidden=!f.length,a.querySelector("span").textContent=f.join(" ")}),Ln("btnCalibrate").addEventListener("click",()=>{n.getState().profile&&(s(),e.clearMeasures(),n.setMode2d("calibrate"))}),e.on("calibrate",({d:u})=>{n.setMode2d("select");let d=n.getState();if(d.drawing?.format!=="image"){e.clearMeasures(),At("La calibraci\xF3n con 2 puntos solo se aplica a im\xE1genes; en DXF/SVG elija las \xABUnidades del plano\xBB.",{type:"info"});return}if(!(u>1e-9))return e.clearMeasures();l(u,d.formatter,d.profile.toMM)});function l(u,d,f){rl("Calibrar escala de la imagen",`
      <form id="calibForm" class="form calib-form">
        <p class="calib-measured">Distancia medida con la escala actual: <strong>${Je(d.len(u))}</strong></p>
        <label class="row"><span class="row-label">Distancia real entre los puntos (mm)</span>
          <span class="num-field"><input id="inpCalibDist" type="text" inputmode="decimal" value="${+u.toFixed(3)}" aria-label="Distancia real entre los puntos (mm)"><span class="unit">mm</span></span>
        </label>
        <p id="calibError" class="calib-error" hidden>Escriba una distancia mayor que cero.</p>
        <div class="calib-actions">
          <button id="btnCalibCancel" class="btn" type="button">Cancelar</button>
          <button id="btnCalibOk" class="btn btn-primary" type="submit">Aceptar</button>
        </div>
      </form>`);let m=Ln("inpCalibDist");m.focus(),m.select(),Ln("btnCalibCancel").addEventListener("click",()=>{Rs(),e.clearMeasures()}),Ln("calibForm").addEventListener("submit",_=>{_.preventDefault();let g=Number(String(m.value).trim().replace(",","."));if(!(g>0)||!Number.isFinite(g)){Ln("calibError").hidden=!1;return}Rs(),e.clearMeasures();let p=f*(g/u);n.setImageScale(p),At(`Escala calibrada: ${+p.toPrecision(6)} mm/px`,{type:"success"})})}let c=Ln("chkIncludeFrame"),h=u=>{let d=n.getState().profile;d&&(u&&(c.checked=!1),c.checked||(i=d.frameLoops.length),Ln("frameRow").hidden=!i,Ln("frameInfo").textContent=`Marco del plano detectado (${i} ${i===1?"contorno":"contornos"})`)};n.onProfile(u=>{u&&r(null),h(u)}),c.addEventListener("change",()=>n.setFrameLoops(c.checked?[]:null))}var fe=pe,L_="plano3d.prefs",bA=400,$h=.25,D_={regions:[],loopInfos:[]},Ja=["top","front","right","left"],vA={extrude:"drawing",revolve:"revolve",multiview:"multiview"},MA={select:"Clic en una regi\xF3n para incluirla o excluirla \xB7 rueda para zoom",measure:"Clic en dos puntos para medir \xB7 May\xFAs+clic en un c\xEDrculo para el radio",window:"Arrastra un rect\xE1ngulo alrededor de una vista",axis:"Haz clic en la l\xEDnea de eje (l\xEDnea de centros)",calibrate:"Haz clic en dos puntos de distancia conocida (se ajustan a extremos, centros y puntos medios)"},U={drawing:null,profile:null,op:null,build:null,partData:null,builtProfile:null,builtOp:null,material:Qs("acero-1008"),F:_s("metric"),sampleId:null,hiddenLayers:new Set,selected:-1,openRegions:new Set,image:null,mmPerPx:$h,buildSeq:0,building:!1,everBuilt:!1,kernelReady:!1,buildWarnings:[],buildError:null,profileError:null,loadError:null,appliedJob:null,inputVer:0,dirty:!1,errorVer:-1};function SA(){try{return JSON.parse(localStorage.getItem(L_)||"{}")||{}}catch{return{}}}function lp(){try{localStorage.setItem(L_,JSON.stringify({units:U.F.system==="imperial"?"in":"mm",materialId:fe("selMaterial").value,density:lt.density.get(),thickness:U.op?U.op.thickness:lt.thickness.get(),price:lt.price.get(),blankMargin:lt.margin.get()}))}catch{}}var oi,Pt,Ro,Lt,si,lt={},ip=0,To=null,qh=null;document.addEventListener("DOMContentLoaded",()=>{let{examplesMenu:n}=_u(),e=SA();fr(!0,"Preparando la interfaz\u2026","Cargando motor CAD"),pr({text:"Cargando motor CAD\u2026",state:"loading",mode:"Motor: cargando"}),e.units==="in"&&(U.F=_s("imperial"),No(fe("unitsSeg"),"in"),fe("statusUnits").textContent="in");let t=Do();Lt=new Ch(fe("view2d"),{theme:t,format:U.F.len}),Pt=new yh(fe("view3d"),{theme:t,format:U.F}),oi=new al,Ro=new Mh(Pt,{kernel:P_(),format:U.F,onChange:(i,s)=>{EA()&&hi(s.hint||"","3d"),si?._emitMeasure(i,s)}}),si=d_({S:U,kernel:oi,viewer:Pt,measure:Ro,view2d:Lt,actions:{setViewWindow:OA,setRevolveAxis:jh,setImageScale:X_,rebuild:rr,pickAxis:rp,loadSample:U_,openFiles:O_,setMode2d:Ka,setFrameLoops:UA,prepareExport:kA,ensureKernelShape:P_}}),window.__app=si,AA(e),wA(e),RA(n),FA(),HA(),__(si),T_(si),C_(si),qi("2d",!0),qi("3d",!0),mr(!1),Lo(!1),hi("","both"),oi.start({onStatus:i=>{fr(!0,i),pr({text:i})}}).then(()=>{U.kernelReady=!0;let i=oi.mode==="worker"?"worker":"hilo principal";pr({text:"Motor CAD listo",state:"ready",mode:`Motor: OpenCascade \xB7 ${i}`}),fr(!1),U.profile&&rr()}).catch(i=>{console.warn("Motor CAD:",i),fr(!1),pr({text:"Motor CAD no disponible",state:"error",mode:"Motor: no disponible"}),At(`No se pudo iniciar el motor CAD (${i.message||i}). La importaci\xF3n y la vista 2D siguen disponibles; recargue la p\xE1gina para reintentar.`,{type:"error",timeout:0})})});var EA=()=>Nn()!=="2d";function AA(n){lt.joinTol=ui(fe("inpJoinTol"),{min:1e-4,max:10,step:.001,decimals:3,onChange:()=>Gi()}),lt.pxScale=ui(fe("inpPxScale"),{min:1e-4,max:1e3,step:.01,decimals:4,onChange:t=>X_(t)}),U.mmPerPx=lt.pxScale.get(),lt.thickness=ui(fe("inpThickness"),{min:.01,max:1e4,step:.1,decimals:3,onChange:t=>sp(t)}),n.thickness>0&&lt.thickness.set(n.thickness);let e=(t,i)=>ui(fe(t),{min:0,max:1e3,step:.1,decimals:2,onChange:s=>ri(r=>r.fillets={...r.fillets,[i]:s})});lt.fv=e("inpFilletVertical","vertical"),lt.ft=e("inpFilletTop","top"),lt.ct=e("inpChamferTop","chamferTop"),lt.angle=ui(fe("inpAngle"),{min:1,max:360,step:1,decimals:1,onChange:t=>W_(t)}),lt.density=ui(fe("inpDensity"),{min:.01,max:30,step:.01,decimals:3,onChange:()=>Yh()}),lt.price=ui(fe("inpPrice"),{min:0,max:1e5,step:.01,decimals:2,onChange:()=>Yh()}),lt.margin=ui(fe("inpBlankMargin"),{min:0,max:1e3,step:.5,decimals:1,onChange:()=>Yh()}),n.density>0&&lt.density.set(n.density),n.price>=0&&lt.price.set(n.price),n.blankMargin>=0&&lt.margin.set(n.blankMargin)}function wA(n){let e=fe("selMaterial");e.innerHTML=vg().map(t=>`<optgroup label="${Je(t.group)}">${t.items.map(i=>`<option value="${i.id}">${Je(i.name)}</option>`).join("")}</optgroup>`).join("")+`<optgroup label="Otro"><option value="${Xa}">Personalizado (densidad)</option></optgroup>`,e.value=n.materialId&&(Qs(n.materialId)||n.materialId===Xa)?n.materialId:"acero-1008",e.addEventListener("change",()=>Yh()),cp()}function cp(){let n=fe("selMaterial").value,e=n===Xa;U.material=e?Mg(lt.density.get()):Qs(n),fe("densityField").hidden=!e,fe("densityReadout").hidden=e,fe("densityReadout").innerHTML=`${U.material.density.toFixed(3)} <span class="unit">g/cm\xB3</span>`;let t=U.material.name.replace(/\s*\(.*\)$/,"");fe("stepMaterialSummary").textContent=`${t} \xB7 ${U.material.density} g/cm\xB3`}var N_=()=>({color:U.material.color,metalness:U.material.metalness,roughness:U.material.roughness});function Yh(){cp(),lp(),U.build&&(Pt.setAppearance(N_()),hp())}function TA(n){Qs(n)&&(fe("selMaterial").value=n,cp())}function hp(){U.build&&(U.partData=Jg({build:U.build,profile:U.builtProfile,op:U.builtOp,material:U.material,pricePerKg:lt.price.get(),blankMargin:lt.margin.get()}),u_(U.partData,U.F,{thickness:U.builtOp.thickness}),ap(),si._emitBuilt())}function RA(n){gu(fe("dropzone"),O_),xu(Lf.map(e=>({value:e.id,label:e.title,desc:`${e.format==="image"?"Imagen":e.format.toUpperCase()} \xB7 ${{extrude:"extrusi\xF3n",revolve:"revoluci\xF3n",multiview:"multivista"}[e.suggested.mode]}`,icon:e.format==="image"?"image":vA[e.suggested.mode]}))),Bo("examples",e=>U_(e)),fe("btnDropExample").addEventListener("click",e=>{e.stopPropagation(),n.open()})}var wo=0;async function O_(n){let e=n[0];if(!e)return;let t=++wo,i=()=>t===wo,s=null;try{let r=new Uint8Array(await e.slice(0,256).arrayBuffer());if(!i())return;if(s=Gg(e.name,r),!s)throw new Error(`Formato no reconocido: ${e.name}. Use DXF, SVG o una imagen (PNG/JPG).`);let o,a=null;if(s==="dxf")o=kh("dxf",Af(new Uint8Array(await e.arrayBuffer())),e.name);else if(s==="svg")o=kh("svg",await e.text(),e.name);else{let l=URL.createObjectURL(e);try{a=await F_(l,e.name)}finally{URL.revokeObjectURL(l)}if(!i())return;o=up(a,{mmPerPx:$h,auto:!0,invert:!1})}if(!i())return;U.sampleId=null,H_(o,null,a&&{image:a,mmPerPx:$h})}catch(r){if(!i())return;console.warn(r),At(`No se pudo abrir ${e.name}: ${r.message||r}`,{type:"error"}),s&&dp(e.name,s,r.message||String(r))}}async function U_(n){let e=Lf.find(i=>i.id===n);if(!e)return;let t=++wo;try{let i,s=null,r=e.suggested.mmPerPx||$h;if(e.format==="image"){if(s=await F_(e.content,e.fileName),t!==wo)return;i=up(s,{mmPerPx:r,auto:!0,invert:!1})}else i=kh(e.format,e.content,e.fileName);if(t!==wo)return;U.sampleId=n,H_(i,e.suggested,s&&{image:s,mmPerPx:r})}catch(i){if(t!==wo)return;console.warn(i),At(`No se pudo cargar el ejemplo: ${i.message||i}`,{type:"error"}),dp(e.fileName,e.format,i.message||String(i))}}async function F_(n,e){let t=new Image;t.src=n,await t.decode();let i=document.createElement("canvas");i.width=t.naturalWidth,i.height=t.naturalHeight;let s=i.getContext("2d",{willReadFrequently:!0});return s.fillStyle="#fff",s.fillRect(0,0,i.width,i.height),s.drawImage(t,0,0),{data:s.getImageData(0,0,i.width,i.height),fileName:e}}function up(n,{mmPerPx:e,auto:t,invert:i,threshold:s}){let r={mmPerPx:e,fileName:n.fileName,invert:i};return t||(r.threshold=s),Wg(n.data,r)}function CA(n){let e=fe("chkThresholdAuto").checked,t=up(U.image,{mmPerPx:n,auto:e,invert:fe("chkInvert").checked,threshold:Number(fe("rngThreshold").value)});return e&&B_(t.threshold),t}function B_(n){n!=null&&(ji(fe("rngThreshold"),n),fe("thresholdValue").textContent=String(Math.round(n)))}function k_(n){U.mmPerPx=n,lt.pxScale.set(n)}function z_(){Object.assign(U,{drawing:null,profile:null,op:null,image:null,selected:-1,frameLoops:null,profileError:null,loadError:null}),U.hiddenLayers=new Set,U.openRegions=new Set,qh=null,fe("selDrawingUnits").value="auto",fe("chkIgnoreAux").checked=!0,Ro.clear(),Lt.clearMeasures(),Ka("select"),ji(fe("rngSection"),0),IA()}function dp(n,e,t){z_(),U.loadError=t,ol({name:n,format:e==="image"?"img":e}),Lo(!1),qi("2d",!0),Lt.setDrawing({},{}),Ao(D_,{regions:[]},U.F),ja({},U.F),Co(),si._emitProfile(!0)}function H_(n,e,t=null){if(z_(),U.drawing=n,t&&(U.image=t.image,k_(t.mmPerPx),fe("chkThresholdAuto").checked=!0,fe("chkInvert").checked=!1,B_(n.threshold)),!V_())return dp(n.fileName||"plano",n.format,U.profileError);let i=zh(U.profile);i.thickness=lt.thickness.get(),e&&(i=$g(i,e),e.materialId&&TA(e.materialId)),U.op=i,qh=U.profile,ol({name:n.fileName||"plano",format:n.format==="image"?"img":n.format}),Lo(!0),qi("2d",!1),U.everBuilt||Sn("2d"),Y_(),fp(!0),G_(),Co(),si._emitProfile(!0),Zh(!0)}function IA(){++U.buildSeq,Kh(!1),Object.assign(U,{build:null,partData:null,appliedJob:null,builtProfile:null,builtOp:null,buildError:null,buildWarnings:[],dirty:!0}),U.inputVer++,Pt.clearModel(),qi("3d",!0),mr(!1),fe("propsSubtitle").textContent="Genera una pieza para ver sus datos",fe("viewInfo").textContent="",Po(""),Jh()}function V_(){let n=U.drawing,e=fe("selDrawingUnits").value;try{return U.profile=Xg(n,{unitOverride:n.format==="image"?U.mmPerPx:e,ignoreDashed:fe("chkIgnoreAux").checked,hiddenLayers:[...U.hiddenLayers],tol:lt.joinTol.get(),frameLoops:U.frameLoops??null}),U.profileError=null,!0}catch(t){return U.profile=null,U.profileError=t.message||String(t),At(U.profileError,{type:"error"}),!1}}function Gi(n=!1){if(!U.drawing)return;if(n&&U.image)try{U.drawing=CA(U.mmPerPx)}catch(t){At(`No se pudo volver a trazar la imagen: ${t.message||t}`,{type:"error"});return}if(!V_()){Lt.setDrawing({},{}),Ao(D_,{regions:[]},U.F),Co(),Zh();return}let e=U.op;U.op=e?PA(zh(U.profile),e,qh,U.profile):zh(U.profile),qh=U.profile,U.selected=-1,Y_(),fp(!0),G_(),Co(),si._emitProfile(!1),Zh()}function PA(n,e,t,i){let s=t?i.toMM/t.toMM:1;Object.assign(n,{mode:e.mode,thickness:e.thickness,symmetric:e.symmetric,fillets:{...e.fillets}});let r=e.revolve;n.revolve={...r,axis:{p:r.axisKind==="line"?r.axis.p.map(a=>a*s):r.axis.p.slice(),d:r.axis.d.slice()}};let o={};for(let[a,l]of Object.entries(e.multiview.windows))o[a]=l&&{...l,minX:l.minX*s,minY:l.minY*s,maxX:l.maxX*s,maxY:l.maxY*s};return n.multiview={...e.multiview,windows:o},t&&DA(t,i,s)?n.regions=structuredClone(e.regions):e.regions.some(LA)&&At("Las opciones por regi\xF3n se restablecieron porque cambiaron los contornos",{type:"info"}),n}var LA=n=>!n.included||n.height!=null||n.z0!=null||n.holes.some(e=>e.op!=="through"||e.depth!=null);function DA(n,e,t){if(n.regions.length!==e.regions.length)return!1;let i=2*Math.max((n.tol??.01)*t,e.tol??.01)+1e-9;return n.regions.every((s,r)=>{let o=e.regions[r];if(s.holes.length!==o.holes.length)return!1;let a=n.loopInfos[s.outer].bbox,l=e.loopInfos[o.outer].bbox;return["minX","minY","maxX","maxY"].every(c=>Math.abs(a[c]*t-l[c])<=i)})}function fp(n){let e=U.drawing,t=U.profile;if(n){let i=t.toMM,s=[i,0,0,i,0,0],r=i===1?e.segments:e.segments.map(a=>zi(a,s)),o=i===1?e.texts:(e.texts||[]).map(a=>({...a,p:[a.p[0]*i,a.p[1]*i],h:(a.h||2.5)*i}));Lt.setDrawing({segments:r,texts:o,layers:e.layers},{loops:t.loops,loopInfos:t.loopInfos,open:t.open,regions:t.regions});for(let a of U.hiddenLayers)Lt.setLayerVisible(a,!1);U.need2dFit=!fe("view2d").clientWidth}t.regions.forEach((i,s)=>Lt.setRegionState(s,{included:U.op.regions[s].included,selected:s===U.selected})),Lt.showAxis(U.op.mode==="revolve"?NA(U.op.revolve):null),Lt.showViewBoxes(U.op.mode==="multiview"?Ja.filter(i=>U.op.multiview.windows[i]).map(i=>({role:i,box:U.op.multiview.windows[i]})):[])}function NA(n){return n.axisKind==="y"?{p:[0,0],d:[0,1]}:n.axisKind==="line"?n.axis:{p:[0,0],d:[1,0]}}function G_(){Df(U.drawing,U.profile,{hiddenLayers:U.hiddenLayers,theme:Do()}),Ao(U.profile,U.op,U.F,{selected:U.selected,open:U.openRegions}),ja(U.op,U.F)}function ri(n,{regions:e=!1}={}){U.op&&(n(U.op),e&&Ao(U.profile,U.op,U.F,{selected:U.selected,open:U.openRegions}),fp(!1),Zh())}function sp(n){$_(n),lp(),ri(e=>e.thickness=n)}function W_(n){lt.angle.set(n),ji(fe("rngAngle"),Math.round(n)),ri(e=>e.revolve={...e.revolve,angleDeg:n})}function jh(n){if(!U.op)return;let e;if(n==="x")e={axisKind:"x",axis:{p:[0,0],d:[1,0]}};else if(n==="y")e={axisKind:"y",axis:{p:[0,0],d:[0,1]}};else{let t=Math.hypot(n.d[0],n.d[1])||1;e={axisKind:"line",axis:{p:n.p.slice(),d:[n.d[0]/t,n.d[1]/t]}}}U.op.revolve={...U.op.revolve,...e},fe("selAxis").value=e.axisKind,fe("axisReadout").textContent=Gh(U.op.revolve,U.F),ri(()=>{})}function rp(){U.profile&&(Nn()==="3d"&&Sn("2d"),Ka("axis"))}function OA(n,e){!U.op||!Ja.includes(n)||(U.op.multiview={...U.op.multiview,windows:{...U.op.multiview.windows,[n]:e?{...e}:null}},ja(U.op,U.F),ri(()=>{}))}function UA(n){U.frameLoops=n,Gi()}function X_(n){n>0&&(k_(n),U.drawing?.format==="image"&&Gi())}function Y_(){let n=U.op;No(fe("opSeg"),n.mode);let e=fe("opSeg").querySelector('[aria-pressed="true"]');fe("stepOpSummary").textContent=e?e.textContent.trim():"",lt.thickness.set(n.thickness),$_(n.thickness),fe("chkSymmetric").checked=!!n.symmetric,lt.fv.set(n.fillets.vertical||0),lt.ft.set(n.fillets.top||0),lt.ct.set(n.fillets.chamferTop||0),fe("selAxis").value=n.revolve.axisKind,fe("axisReadout").textContent=Gh(n.revolve,U.F),lt.angle.set(n.revolve.angleDeg??360),ji(fe("rngAngle"),Math.round(n.revolve.angleDeg??360))}function $_(n){fe("selGauge").value=[...fe("selGauge").options].some(e=>e.value&&Number(e.value)===n)?String(n):"";for(let e of fe("thicknessChips").querySelectorAll("[data-value]"))e.setAttribute("aria-pressed",String(Number(e.dataset.value)===n))}function FA(){$i(fe("opSeg"),t=>{ri(i=>i.mode=t),t==="multiview"&&U.op&&Ja.filter(i=>U.op.multiview.windows[i]).length<2&&hi("Multivista: defina al menos dos ventanas de vista en el plano","2d")}),fe("selGauge").addEventListener("change",t=>{t.target.value&&(lt.thickness.set(Number(t.target.value)),sp(lt.thickness.get()))}),fe("thicknessChips").addEventListener("click",t=>{let i=t.target.closest("[data-value]");i&&(lt.thickness.set(Number(i.dataset.value)),sp(lt.thickness.get()))}),fe("chkSymmetric").addEventListener("change",t=>ri(i=>i.symmetric=t.target.checked)),fe("rngAngle").addEventListener("input",t=>W_(Number(t.target.value))),fe("selAxis").addEventListener("change",t=>{let i=t.target.value;if(i!=="line")return jh(i);let s=U.profile?.axisLines?.[0];s?jh({p:s.p0,d:[s.p1[0]-s.p0[0],s.p1[1]-s.p0[1]]}):rp()}),fe("btnPickAxis").addEventListener("click",rp),fe("selDrawingUnits").addEventListener("change",()=>Gi()),fe("chkIgnoreAux").addEventListener("change",()=>Gi()),fe("layerList").addEventListener("change",t=>{let i=t.target;if(!i.matches('[data-action="visible"]'))return;let s=i.closest("[data-layer]").dataset.layer;i.checked?U.hiddenLayers.delete(s):U.hiddenLayers.add(s),Gi()}),fe("rngThreshold").addEventListener("change",()=>{fe("chkThresholdAuto").checked=!1,Gi(!0)}),fe("rngThreshold").addEventListener("input",t=>fe("thresholdValue").textContent=t.target.value),fe("chkThresholdAuto").addEventListener("change",()=>Gi(!0)),fe("chkInvert").addEventListener("change",()=>Gi(!0));let n=fe("regionList"),e=t=>{let i=Number(String(t).trim().replace(",","."));return String(t).trim()===""||!Number.isFinite(i)?null:i};n.addEventListener("change",t=>{let i=t.target,s=i.closest("[data-region]");if(!s||!U.op)return;let r=Number(s.dataset.region),o=U.op.regions[r];if(i.matches('[data-action="include"]'))o.included=i.checked,ri(()=>{});else if(i.dataset.field==="height"||i.dataset.field==="z0"){let a=e(i.value);o[i.dataset.field]=i.dataset.field==="height"&&a!=null&&a<=0?null:a,ri(()=>{})}else if(i.closest("[data-hole]")){let a=o.holes[Number(i.closest("[data-hole]").dataset.hole)];if(i.dataset.field==="op"&&(a.op=i.value==="fill"?"none":i.value),i.dataset.field==="depth"){let l=e(i.value);a.depth=l!=null&&l>0?l:null}ri(()=>{})}}),n.addEventListener("click",t=>{let i=t.target.closest("[data-region]");if(!i)return;let s=Number(i.dataset.region);t.target.closest('[data-action="toggle"]')&&(i.classList.contains("is-open")?U.openRegions.add(s):U.openRegions.delete(s)),t.target.closest("input, select")||q_(s)}),fe("btnGenerate").addEventListener("click",()=>rr()),tn("Enter",()=>rr(),{ctrl:!0})}function q_(n){U.selected=n;for(let e of fe("regionList").querySelectorAll("[data-region]"))e.classList.toggle("is-selected",Number(e.dataset.region)===n);U.profile&&U.profile.regions.forEach((e,t)=>Lt.setRegionState(t,{selected:t===n}))}function Zh(n=!1){if(clearTimeout(ip),U.inputVer++,U.dirty=!0,Jh(),!!U.profile){if(n){rr();return}fe("chkAutoUpdate").checked&&(U.op?.mode==="multiview"&&Ja.filter(e=>U.op.multiview.windows[e]).length<2||(ip=setTimeout(()=>rr(),bA)))}}function Kh(n){U.building=n;let e=fe("btnGenerate");e.setAttribute("aria-busy",String(n)),e.classList.toggle("is-busy",n),Jh()}async function rr(){if(clearTimeout(ip),!U.profile||!U.op)return;if(!U.kernelReady){Po("Esperando al motor CAD\u2026");return}let n,e=structuredClone(U.op),t=U.profile,i=U.inputVer;try{n=Kg(t,e,{meshQuality:"normal"})}catch(a){++U.buildSeq,To=null,Kh(!1),U.buildError=a.message,U.errorVer=i,Co(),At(a.message,{type:"warn"});return}let s=++U.buildSeq;n.buildId=s,Kh(!0);let r=performance.now(),o=BA(n,s,i,t,e,r);return To={ver:i,promise:o},o}async function BA(n,e,t,i,s,r){try{let o=await oi.build(n);if(e!==U.buildSeq)return;U.build=o,U.appliedJob=n,U.dirty=t!==U.inputVer,U.builtProfile=i,U.builtOp=s,U.buildError=null,U.buildWarnings=o.warnings||[],Pt.setModel(o,N_()),qi("3d",!1),U.everBuilt||(U.everBuilt=!0,Nn()==="2d"&&Sn("3d"),Pt.setView("iso")),hp();let a=o.timings||{},l=c=>Math.round(c||0);Po(`Generado en ${l(performance.now()-r)} ms \xB7 B-rep ${l(a.buildMs)} \xB7 malla ${l(a.meshMs)} \xB7 props ${l(a.propsMs)} ms \xB7 ${oi.mode==="worker"?"worker":"hilo principal"}`)}catch(o){if(e!==U.buildSeq)return;U.buildError=o.message||String(o),U.errorVer=t,At(`Error al generar la pieza: ${U.buildError}`,{type:"error"})}finally{e===U.buildSeq&&(To=null,Kh(!1),Co())}}function Jh(){let n=fe("propsStale"),e="",t="";U.building?[e,t]=["Actualizando\u2026","busy"]:U.dirty&&U.buildError&&U.errorVer===U.inputVer?[e,t]=[`No se pudo generar: ${U.buildError}`,"error"]:U.dirty&&!U.profile&&U.profileError?[e,t]=[`Perfil no v\xE1lido: ${U.profileError}`,"error"]:U.dirty&&U.profile&&([e,t]=[U.op?.mode==="multiview"&&Ja.filter(s=>U.op.multiview.windows[s]).length<2?"Multivista: defina al menos dos vistas y pulsa Generar":"Cambios sin aplicar \u2014 pulsa Generar","dirty"]),n.hidden=!e,n.textContent=e,n.dataset.state=t,fe("propsBody").classList.toggle("is-stale",!!e)}async function kA(){let n=document.activeElement;return n&&/^(INPUT|TEXTAREA|SELECT)$/.test(n.tagName)&&n.blur(),(U.dirty||U.building)&&(To&&To.ver===U.inputVer?await To.promise:await rr()),U.dirty?U.kernelReady?U.profile?U.errorVer===U.inputVer&&U.buildError||"hay cambios sin generar":U.profileError?`el plano no tiene un perfil v\xE1lido (${U.profileError})`:"el plano no tiene un perfil v\xE1lido":"el motor CAD a\xFAn no est\xE1 listo":null}async function np(n){let e=U.appliedJob;if(!e)throw new Error("No hay pieza generada.");try{return await n(e.buildId)}catch(t){if(t?.code!=="STALE_SHAPE"||U.appliedJob!==e)throw t;let i=await oi.build(e),s=new Map;for(let[r,o]of[["face","faces"],["edge","edges"],["vertex","vertices"]])(U.build?.topology?.[o]||[]).forEach((a,l)=>{let c=i.topology[o][l];c&&s.set(`${r}:${a.id}`,c.id)});return op={job:e,map:s},n(e.buildId)}}var op=null,I_=n=>n&&n.id!=null&&op?.job===U.appliedJob?{...n,id:op.map.get(`${n.kind}:${n.id}`)??n.id}:n;function P_(){return{get mode(){return oi.mode},distance:(n,e)=>np(t=>oi.distance(I_(n),I_(e),t)),exportShape:(n={})=>np(e=>oi.exportShape({...n,buildId:e})),tessellate:(n={})=>np(e=>oi.tessellate({...n,buildId:e}))}}function Co(){let n=[];U.loadError&&n.push({text:`No se pudo abrir el plano: ${U.loadError}`,level:"error"}),U.profileError&&n.push({text:U.profileError,level:"error"}),U.buildError&&n.push({text:U.buildError,level:"error"});for(let e of U.drawing?.warnings||[])n.push({text:e,level:"info"});for(let e of U.profile?.warnings||[])n.push({text:e});for(let e of U.op?.warnings||[])n.push({text:e});for(let e of U.buildError?[]:U.buildWarnings)n.push({text:e});cu(n),Jh()}function Ka(n){gr(fe("toolbar2d"),"mode2d",n),Lt.setMode(n),hi(MA[n]||"","2d")}function ap(){if(!U.partData)return;let n=Oo(fe("sectionAxisSeg"))||"x",e=U.partData.bbox.size["xyz".indexOf(n)]/2,t=fe("rngSection");t.min=String(-e),t.max=String(e),t.step=String(Math.max(e/500,1e-4));let i=Math.max(-e,Math.min(e,Number(t.value)||0));ji(t,i),fe("sectionValue").textContent=j_(n,i),Pt.setSection({axis:n,offset:i})}function j_(n,e){let t="xyz".indexOf(n),i=U.partData?.bbox,s=i?(i.min[t]+i.max[t])/2:0;return`${n.toUpperCase()} = ${U.F.len(s+e)}`}function zA(n){U.F=_s(n==="in"?"imperial":"metric"),Lt.setFormat(U.F.len),Pt.setFormat(U.F),Ro.setFormat(U.F),lp(),U.profile&&(Ao(U.profile,U.op,U.F,{selected:U.selected,open:U.openRegions}),ja(U.op,U.F),fe("axisReadout").textContent=Gh(U.op.revolve,U.F)),U.build&&hp(),si._emitUnits()}function HA(){$i(fe("unitsSeg"),zA),uu(n=>{Pt.setTheme(n),Lt.setTheme(n),U.drawing&&U.profile&&Df(U.drawing,U.profile,{hiddenLayers:U.hiddenLayers,theme:n})}),hu(()=>requestAnimationFrame(()=>{Lt.resize(),Pt.resize();let n=fe("view2d").clientWidth;n&&(U.need2dFit||n!==U.last2dWidth)&&(U.need2dFit=!1,Lt.fit()),n&&(U.last2dWidth=n);let e=fe("view3d").clientWidth;e&&U.build&&U.last3dWidth&&e!==U.last3dWidth&&Pt.fit(),e&&(U.last3dWidth=e)})),Uo(fe("toolbar2d"),{attr:"mode2d",mode:"single"},n=>Ka(n)),fe("btn2dFit").addEventListener("click",()=>Lt.fit()),fe("btn2dClearDims").addEventListener("click",()=>Lt.clearMeasures()),Lt.on("regionClick",n=>{if(Lt.mode!=="select"||!U.op)return;if(n.regionIndex<0)return q_(-1);let e=U.op.regions[n.regionIndex];e.included=!e.included,U.selected=n.regionIndex,ri(()=>{},{regions:!0})}),Lt.on("axisPick",n=>{jh({p:n.p,d:n.d}),Ka("select")}),Lt.on("cursor",n=>{if(!n)return Io("");let e=n.snap?n.snap.p:[n.x,n.y];Io(`X ${U.F.len(e[0])}  Y ${U.F.len(e[1])}`)}),fe("viewBar").addEventListener("click",n=>{let e=n.target.closest("[data-view]");e&&(e.dataset.view==="fit"?Pt.fit({animate:!0}):Pt.setView(e.dataset.view,{animate:!0}))}),du(n=>Pt.setProjection(n)),Uo(fe("displayBar"),{attr:"display",mode:"multi"},(n,e)=>Pt.setDisplay({[n]:e})),Uo(fe("toolPalette"),{attr:"tool",mode:"optional"},n=>{Ro.setTool(n||"none"),n||hi("","3d")}),fe("btnClearMeasures").addEventListener("click",()=>Ro.clear()),Pt.on("cursor",n=>{n.point&&Io(U.F.point(n.point))}),fe("chkSection").addEventListener("change",n=>{Pt.setSection({enabled:n.target.checked}),ap()}),$i(fe("sectionAxisSeg"),()=>{ji(fe("rngSection"),0),ap()}),fe("rngSection").addEventListener("input",n=>{let e=Number(n.target.value);fe("sectionValue").textContent=j_(Oo(fe("sectionAxisSeg"))||"x",e),Pt.setSection({offset:e})}),fe("btnSectionFlip").addEventListener("click",()=>Pt.setSection({flip:!Pt.getSection().flip})),Pt.setSection({enabled:fe("chkSection").checked,axis:Oo(fe("sectionAxisSeg"))||"x",offset:0})}})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
