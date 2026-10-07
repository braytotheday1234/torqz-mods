import { SITE_CONFIG, configured } from "./config.js";
import { MODS, getModBySlug, getProjectName, displayValue, projectCategories, projectCategoryLabel, resolvedDownloadState } from "./mods.js";
import { UPDATES, updatesForProject } from "./updates.js";
import { mountHeader, mountFooter, projectCard, projectMedia, featureCard, updateCard, supportCard, statusBadge, button, sectionTitle, icon } from "./components.js";

const $=(s,scope=document)=>scope.querySelector(s);
const $$=(s,scope=document)=>[...scope.querySelectorAll(s)];
const base=document.body.dataset.root||"";
const focusable='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])';

mountHeader(document.body.dataset.page||"");
mountFooter();
$$("[data-year]").forEach(n=>n.textContent=new Date().getFullYear());
document.documentElement.classList.add("js");
document.body.classList.add("page-entering");
setTimeout(()=>document.body.classList.remove("page-entering"),360);

function toast(message){
  const node=$("[data-toast]");
  if(!node)return;
  node.textContent=message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>node.classList.remove("show"),2200);
}

$$("[data-placeholder-link]").forEach(node=>node.addEventListener("click",e=>{e.preventDefault();toast("Coming soon.");}));
$$("[data-discord-link]").forEach(node=>node.addEventListener("click",e=>{
  e.preventDefault();
  const url=configured(SITE_CONFIG.discordUrl);
  if(url)window.open(url,"_blank","noopener,noreferrer");
  else toast("Discord is coming soon.");
}));

const header=$("[data-header]");
if(header){
  const update=()=>header.classList.toggle("scrolled",window.scrollY>12);
  update();window.addEventListener("scroll",update,{passive:true});
}

const shortcut=$("[data-search-shortcut]");
if(shortcut)shortcut.textContent=/Mac|iPhone|iPad/.test(navigator.platform)?"⌘ K":"Ctrl K";

function trapFocus(event,container){
  if(event.key!=="Tab"||!container)return;
  const nodes=$$(focusable,container).filter(n=>n.offsetParent!==null);
  if(!nodes.length)return;
  if(event.shiftKey&&document.activeElement===nodes[0]){event.preventDefault();nodes.at(-1).focus();}
  else if(!event.shiftKey&&document.activeElement===nodes.at(-1)){event.preventDefault();nodes[0].focus();}
}

const menu=$("[data-mobile-nav]");
const menuToggle=$("[data-menu-toggle]");
let menuFocus=null;
function openMenu(){
  menuFocus=document.activeElement;
  menu?.classList.add("open");
  menu?.setAttribute("aria-hidden","false");
  menuToggle?.setAttribute("aria-expanded","true");
  document.body.classList.add("menu-open");
  setTimeout(()=>$("[data-menu-close]",menu)?.focus(),20);
}
function closeMenu(){
  menu?.classList.remove("open");
  menu?.setAttribute("aria-hidden","true");
  menuToggle?.setAttribute("aria-expanded","false");
  document.body.classList.remove("menu-open");
  menuFocus?.focus?.();
}
menuToggle?.addEventListener("click",()=>menu?.classList.contains("open")?closeMenu():openMenu());
$("[data-menu-close]")?.addEventListener("click",closeMenu);
$$(".mobile-nav a").forEach(a=>a.addEventListener("click",closeMenu));

const searchOverlay=$("[data-search-overlay]");
const searchDialog=$("[data-search-dialog]");
const searchInput=$("[data-global-search]");
const searchResults=$("[data-search-results]");
let searchIndex=-1;
let searchFocus=null;

function searchText(mod){
  return [mod.publicName,mod.internalName,mod.tagline,mod.subtitle,mod.shortDescription,mod.category,...(mod.categories||[]),...(mod.tags||[])].filter(Boolean).join(" ").toLowerCase();
}
function renderSearch(){
  if(!searchInput||!searchResults)return;
  const q=searchInput.value.trim().toLowerCase();
  if(!q){
    searchResults.innerHTML='<div class="search-empty"><strong>Search Torqz Mods</strong><span>Try “Torqz Garage”, “mileage”, or “vehicle data”.</span></div>';
    searchIndex=-1;return;
  }
  const matches=MODS.filter(mod=>searchText(mod).includes(q));
  if(!matches.length){
    searchResults.innerHTML='<div class="search-empty"><strong>No project found.</strong><span>Try another search.</span></div>';
    searchIndex=-1;return;
  }
  searchResults.innerHTML=matches.map((mod,index)=>
    '<a class="search-result '+(index===0?"selected":"")+'" href="'+base+'mods/'+mod.slug+'.html" data-search-result>'+
      '<div class="search-result-thumb">'+projectMedia(mod,false,true)+'</div>'+
      '<div><strong>'+getProjectName(mod)+'</strong><span>'+mod.subtitle+'</span></div><b>→</b>'+
    '</a>'
  ).join("");
  searchIndex=0;
}
function openSearch(){
  closeMenu();
  searchFocus=document.activeElement;
  searchOverlay?.classList.add("open");
  searchOverlay?.setAttribute("aria-hidden","false");
  document.body.classList.add("search-open");
  renderSearch();
  setTimeout(()=>searchInput?.focus(),20);
}
function closeSearch(){
  searchOverlay?.classList.remove("open");
  searchOverlay?.setAttribute("aria-hidden","true");
  document.body.classList.remove("search-open");
  searchIndex=-1;
  searchFocus?.focus?.();
}
function moveSearch(delta){
  const results=$$("[data-search-result]");
  if(!results.length)return;
  searchIndex=Math.max(0,Math.min(results.length-1,searchIndex+delta));
  results.forEach((n,i)=>n.classList.toggle("selected",i===searchIndex));
  results[searchIndex]?.scrollIntoView({block:"nearest"});
}
$("[data-search-trigger]")?.addEventListener("click",openSearch);
$$("[data-search-close]").forEach(n=>n.addEventListener("click",closeSearch));
searchInput?.addEventListener("input",renderSearch);

document.addEventListener("keydown",event=>{
  const typing=["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName);
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();openSearch();return;}
  if(event.key==="/"&&!typing&&!searchOverlay?.classList.contains("open")){event.preventDefault();openSearch();return;}
  if(event.key==="Escape"){
    if(searchOverlay?.classList.contains("open")){closeSearch();return;}
    if(menu?.classList.contains("open")){closeMenu();return;}
    if($("[data-lightbox]")?.classList.contains("open")){closeLightbox();return;}
  }
  if(searchOverlay?.classList.contains("open")){
    trapFocus(event,searchDialog);
    if(event.key==="ArrowDown"){event.preventDefault();moveSearch(1);}
    if(event.key==="ArrowUp"){event.preventDefault();moveSearch(-1);}
    if(event.key==="Enter"&&searchIndex>=0){
      const target=$$("[data-search-result]")[searchIndex];
      if(target)location.href=target.href;
    }
  } else if(menu?.classList.contains("open")) trapFocus(event,menu);
});

const revealObserver="IntersectionObserver"in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.remove("reveal-pending");
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
},{threshold:.08,rootMargin:"0px 0px -18px"}):null;
function wireReveal(scope=document){
  $("[data-reveal]",scope).forEach(node=>{
    const rect=node.getBoundingClientRect();
    if(!revealObserver||rect.top<window.innerHeight*1.05){
      node.classList.add("visible");
      return;
    }
    node.classList.add("reveal-pending");
    revealObserver.observe(node);
  });
}
wireReveal();

const videoObserver="IntersectionObserver"in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const video=entry.target;
    const source=$("source[data-src]",video);
    if(source&&!source.src){source.src=source.dataset.src;video.load();}
    videoObserver.unobserve(video);
  });
},{rootMargin:"220px"}):null;
function wireVideos(scope=document){
  $$("[data-lazy-video]",scope).forEach(v=>videoObserver?videoObserver.observe(v):v.load());
}
wireVideos();

function projectForUpdate(update){return MODS.find(mod=>mod.id===update.projectId)||null;}

const featuredMount=$("[data-featured-project]");
if(featuredMount){
  const mod=MODS.find(m=>m.featured);
  if(mod){
    featuredMount.innerHTML=
      '<div class="featured-media">'+projectMedia(mod)+'</div>'+
      '<div class="featured-copy">'+statusBadge(mod.status,true)+'<span class="eyebrow">Featured Project</span><h2>'+getProjectName(mod)+'</h2><p class="featured-tagline">'+mod.subtitle+'</p><p>'+mod.shortDescription+'</p>'+
      '<div class="highlight-list"><span>Persistent Vehicle Identity</span><span>Mileage Tracking</span><span>Garage Records</span></div>'+
      '<a class="text-link strong" href="mods/'+mod.slug+'.html">View Torqz Garage <span>→</span></a></div>';
  }
}

const featuresMount=$("[data-home-features]");
if(featuresMount){
  const mod=MODS.find(m=>m.featured);
  if(mod)featuresMount.innerHTML=mod.features.slice(0,4).map((f,i)=>featureCard(f,i)).join("");
}

const latestMount=$("[data-latest-updates]");
if(latestMount)latestMount.innerHTML=UPDATES.slice(0,3).map(u=>updateCard(u,projectForUpdate(u))).join("");

const modsMount=$("[data-mod-grid]");
const categoryMount=$("[data-category-list]");
if(categoryMount){
  const cats=["All",...new Set(MODS.flatMap(projectCategories))];
  categoryMount.innerHTML=cats.map((c,i)=>'<button class="filter-chip '+(i===0?"active":"")+'" type="button" data-category-filter="'+c+'">'+c+'</button>').join("");
}
if(modsMount){
  const localSearch=$("[data-mod-search]");
  const sort=$("[data-sort]");
  function renderMods(){
    const active=$("[data-category-filter].active")?.dataset.categoryFilter||"All";
    const query=localSearch?.value.trim().toLowerCase()||"";
    let items=MODS.filter(mod=>(active==="All"||projectCategories(mod).includes(active))&&searchText(mod).includes(query));
    if(sort?.value==="az")items=[...items].sort((a,b)=>getProjectName(a).localeCompare(getProjectName(b)));
    if(sort?.value==="updated")items=[...items].sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));
    modsMount.innerHTML=items.length?items.map(mod=>projectCard(mod,base)).join(""):'<div class="empty-state"><strong>No matching projects.</strong><span>Try another search or filter.</span></div>';
    const count=$("[data-result-count]");
    if(count)count.textContent=items.length+(items.length===1?" project":" projects");
    const note=$("[data-project-note]");
    if(note)note.hidden=MODS.length!==1;
    wireVideos(modsMount);
  }
  categoryMount?.addEventListener("click",e=>{
    const btn=e.target.closest("[data-category-filter]");
    if(!btn)return;
    $$("[data-category-filter]",categoryMount).forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");renderMods();
  });
  localSearch?.addEventListener("input",renderMods);
  sort?.addEventListener("change",renderMods);
  renderMods();
}

const updatesMount=$("[data-updates-list]");
if(updatesMount)updatesMount.innerHTML=UPDATES.map(u=>updateCard(u,projectForUpdate(u))).join("");

const supportMount=$("[data-support-cards]");
if(supportMount){
  const discord=configured(SITE_CONFIG.discordUrl);
  const bug=configured(SITE_CONFIG.bugReportUrl);
  const suggest=configured(SITE_CONFIG.suggestionUrl);
  supportMount.innerHTML=
    supportCard("help","Discord Support","Chat with the Torqz community and get help with projects.",discord?"Available":"Coming soon",discord?'<a class="support-action" href="'+discord+'" target="_blank" rel="noopener noreferrer">Open Discord →</a>':"")+
    supportCard("download","Installation Help","Find install information for Torqz projects when releases are ready.","Available",'<a class="support-action" href="install.html">Open Guide →</a>')+
    supportCard("bug","Report a Bug","Send a bug report when the Torqz report form is ready.",bug?"Available":"Coming soon",bug?'<a class="support-action" href="'+bug+'" target="_blank" rel="noopener noreferrer">Report Bug →</a>':"")+
    supportCard("plus","Suggest an Idea","Share mod ideas and suggestions when submissions open.",suggest?"Available":"Coming soon",suggest?'<a class="support-action" href="'+suggest+'" target="_blank" rel="noopener noreferrer">Suggest Idea →</a>':"")+
    supportCard("help","FAQ","Quick answers about Torqz Garage, downloads, and compatibility.","Available",'<a class="support-action" href="#faq">Open FAQ ↓</a>');
}

function currentDevelopment(mod){
  return '<div class="development-timeline">'+(mod.milestones||[]).map((m,i)=>{
    const label={complete:"Complete","in-progress":"In progress",planned:i===2?"Next":"Planned",blocked:"Blocked"}[m.status]||m.status;
    return '<div class="timeline-item '+m.status+'"><i></i><div><strong>'+m.name+'</strong><span>'+label+'</span></div></div>';
  }).join("")+'</div>';
}

function featureGrid(mod){
  return '<div class="feature-grid project-features">'+(mod.features||[]).map((f,i)=>featureCard(f,i)).join("")+'</div>';
}

function mediaGallery(mod){
  const items=[...(mod.projectMedia||[]),...(mod.developmentMedia||[])];
  if(!items.length)return '<div class="single-media-placeholder">'+projectMedia(mod,true)+'<p>Real BeamNG screenshots and development captures will appear here as they are made.</p></div>';
  return '<div class="media-grid">'+items.map((item,index)=>{
    const prefix="../";
    const type=item.type||"image";
    const src=prefix+(item.src||"");
    const poster=prefix+(item.poster||"");
    const caption=item.caption||"Torqz Garage media";
    return '<button class="media-item" type="button" data-gallery-src="'+src+'" data-gallery-type="'+type+'" data-gallery-poster="'+poster+'" data-gallery-label="'+caption+'">'+
      (type==="video"?'<video muted playsinline preload="metadata" '+(poster?'poster="'+poster+'"':'')+'><source src="'+src+'"></video>':'<img src="'+src+'" alt="'+caption+'" loading="lazy">')+
      '<span>'+caption+'</span></button>';
  }).join("")+'</div>';
}

const detail=$("[data-mod-detail]");
if(detail){
  const mod=getModBySlug(document.body.dataset.modSlug||"");
  if(!mod){
    detail.innerHTML='<section class="not-found"><div class="site-shell"><h1>Project not found.</h1>'+button("Back to Mods","../mods.html","primary")+'</div></section>';
  }else{
    document.title=getProjectName(mod)+" | Torqz Mods";
    const updates=updatesForProject(mod.id);
    const compat=mod.beamngCompatibility||{};
    const downloadState=resolvedDownloadState(mod);
    detail.innerHTML=
      '<section class="project-hero"><div class="site-shell project-hero-grid">'+
        '<div class="project-hero-media">'+projectMedia(mod,true)+'</div>'+
        '<div class="project-hero-copy"><span class="eyebrow">'+mod.internalName+'</span><h1>'+getProjectName(mod)+'</h1><p class="project-hero-tagline">'+mod.tagline+'</p>'+statusBadge(mod.status)+'<div class="hero-actions">'+
          '<a class="button primary" href="../updates.html">Latest Update <span>→</span></a>'+
          '<button class="button secondary disabled" type="button" disabled>Installation — Not Released</button>'+
        '</div></div>'+
      '</div><div class="site-shell project-meta-row"><div><span>Category</span><strong>'+projectCategoryLabel(mod)+'</strong></div><div><span>Status</span><strong>'+mod.status+'</strong></div><div><span>Current Focus</span><strong>'+displayValue(mod.currentPhase)+'</strong></div></div></section>'+
      '<section class="content-section"><div class="site-shell two-col-copy">'+sectionTitle("About","What is Torqz Garage?")+'<div><p>'+mod.fullDescription+'</p><p>'+mod.featureSummary+'</p></div></div></section>'+
      '<section class="content-section alt"><div class="site-shell">'+sectionTitle("Features","Built around your cars.","Useful vehicle ownership features, with planned ideas clearly marked.")+featureGrid(mod)+'</div></section>'+
      '<section class="content-section"><div class="site-shell two-col-copy">'+sectionTitle("Current Development","Where things are right now.")+'<div>'+currentDevelopment(mod)+'</div></div></section>'+
      '<section class="content-section alt"><div class="site-shell">'+sectionTitle("Media","Torqz Garage media.")+mediaGallery(mod)+'</div></section>'+
      (updates.length?'<section class="content-section"><div class="site-shell">'+sectionTitle("Latest Updates","What I’m working on.")+'<div class="updates-list">'+updates.map(u=>updateCard(u,mod,"../")).join("")+'</div></div></section>':"")+
      '<section class="content-section alt"><div class="site-shell info-grid">'+
        '<article><div class="info-icon">'+icon("download")+'</div><span>Installation</span><h3>Not released yet</h3><p>Install steps will be posted when Torqz Garage has a real public release.</p></article>'+
        '<article><div class="info-icon">'+icon("car")+'</div><span>Compatibility</span><h3>'+displayValue(compat.testedVersion)+'</h3><p>Supported BeamNG.drive versions will be listed after testing.</p></article>'+
        '<article><div class="info-icon">'+icon("bug")+'</div><span>Known Issues</span><h3>'+(mod.knownIssues?.length?mod.knownIssues.length+" listed":"None published")+'</h3><p>Useful issue information will appear here when there is something to report.</p></article>'+
      '</div></section>'+
      '<section class="content-section"><div class="site-shell credits"><span>Credits</span><strong>'+(mod.credits||[]).join(" · ")+'</strong></div></section>';
    wireVideos(detail);
  }
}

$$("[data-accordion-button]").forEach(button=>button.addEventListener("click",()=>{
  const item=button.closest(".faq-item");
  const open=item.classList.toggle("open");
  button.setAttribute("aria-expanded",String(open));
  const symbol=$("[data-accordion-symbol]",button);
  if(symbol)symbol.textContent=open?"−":"+";
}));

let galleryItems=[];
let galleryIndex=0;
const lightbox=$("[data-lightbox]");
const lightboxStage=$("[data-lightbox-stage]");
const lightboxLabel=$("[data-lightbox-label]");
function showLightbox(index){
  if(!galleryItems.length||!lightboxStage||!lightbox)return;
  galleryIndex=(index+galleryItems.length)%galleryItems.length;
  const item=galleryItems[galleryIndex];
  const src=item.dataset.gallerySrc||"";
  const type=item.dataset.galleryType||"image";
  const poster=item.dataset.galleryPoster||"";
  const label=item.dataset.galleryLabel||"";
  lightboxStage.innerHTML=type==="video"?'<video controls muted playsinline '+(poster?'poster="'+poster+'"':'')+'><source src="'+src+'"></video>':'<img src="'+src+'" alt="'+label+'">';
  if(lightboxLabel)lightboxLabel.textContent=label;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden","false");
  document.body.classList.add("search-open");
}
function closeLightbox(){
  lightbox?.classList.remove("open");
  lightbox?.setAttribute("aria-hidden","true");
  document.body.classList.remove("search-open");
  if(lightboxStage)lightboxStage.innerHTML="";
}
document.addEventListener("click",e=>{
  const item=e.target.closest("[data-gallery-src]");
  if(item){galleryItems=$$("[data-gallery-src]");showLightbox(galleryItems.indexOf(item));}
});
$("[data-lightbox-close]")?.addEventListener("click",closeLightbox);
$("[data-lightbox-prev]")?.addEventListener("click",()=>showLightbox(galleryIndex-1));
$("[data-lightbox-next]")?.addEventListener("click",()=>showLightbox(galleryIndex+1));

document.addEventListener("click",event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href]');
  if(!link||link.target==="_blank"||link.hasAttribute("download"))return;
  const href=link.getAttribute("href")||"";
  if(href.startsWith("#")||href.startsWith("mailto:")||href.startsWith("tel:")||href.startsWith("javascript:"))return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin)return;
  if(url.pathname===location.pathname&&url.search===location.search)return;
  event.preventDefault();
  closeSearch();
  closeMenu();
  document.body.classList.add("page-leaving");
  const navigate=()=>{location.href=link.href;};
  const timer=setTimeout(navigate,190);
  document.body.addEventListener("transitionend",event=>{
    if(event.propertyName!=="opacity")return;
    clearTimeout(timer);
    navigate();
  },{once:true});
});

window.addEventListener("pageshow",()=>{
  document.body.classList.remove("page-leaving");
  document.body.classList.add("page-entering");
  setTimeout(()=>document.body.classList.remove("page-entering"),360);
});
