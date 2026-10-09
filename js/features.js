import { FAQS, FAQ_CATEGORIES, GUIDES, KNOWN_ISSUES } from "./help-data.js";
import { MODS, getProjectName } from "./mods.js";
import { UPDATES } from "./updates.js";
import { updateCard } from "./components.js";

export const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));

async function copyText(text) {
  if (!text) throw new Error("Generate some text before copying.");
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const ok = document.execCommand("copy");
  field.remove();
  if (!ok) throw new Error("Copy is unavailable. Select the preview text and copy it manually.");
}
const byId = id => document.getElementById(id);

export function initSupportFeatures() {
  const list = document.querySelector("[data-faq-list]");
  if (!list) return;
  const filters = document.querySelector("[data-faq-categories]");
  const search = document.querySelector("[data-faq-search]");
  const clear = document.querySelector("[data-faq-clear]");
  const count = document.querySelector("[data-faq-count]");
  const empty = document.querySelector("[data-faq-empty]");
  let category = "All";

  filters.innerHTML = FAQ_CATEGORIES.map(name =>
    '<button type="button" class="filter-chip" data-faq-category="' + name + '" aria-pressed="' + (name === category) + '">' + name + '</button>'
  ).join("");

  function highlightedQuestion(text, query) {
    if (!query) return escapeHtml(text);
    const at = text.toLowerCase().indexOf(query);
    if (at < 0) return escapeHtml(text);
    return escapeHtml(text.slice(0,at)) + '<mark>' + escapeHtml(text.slice(at,at+query.length)) + '</mark>' + escapeHtml(text.slice(at+query.length));
  }
  function render() {
    const q = search.value.trim().toLowerCase();
    const items = FAQS.filter(faq => (category==="All" || faq.category===category) &&
      [faq.question,faq.answer,faq.category].join(" ").toLowerCase().includes(q));
    filters.querySelectorAll("[data-faq-category]").forEach(button=>{
      const selected = button.dataset.faqCategory === category;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("active", selected);
    });
    list.innerHTML = items.map(faq =>
      '<article class="faq-item" id="' + faq.id + '">' +
      '<button type="button" data-accordion-button aria-expanded="false"><span class="faq-question">' + highlightedQuestion(faq.question,q) + '</span><span data-accordion-symbol aria-hidden="true">+</span></button>' +
      '<div class="faq-answer"><div><p>' + escapeHtml(faq.answer) + '</p><div class="faq-meta"><span>' + escapeHtml(faq.category) + '</span>' +
      (faq.href ? '<a href="' + faq.href + '">Related help ↗</a>' : '') +
      '<button type="button" data-copy-url="' + faq.id + '">Copy link ↗</button></div></div></div></article>'
    ).join("");
    count.textContent = items.length + " of " + FAQS.length + " questions";
    empty.hidden = items.length > 0;
  }

  filters.addEventListener("click", event=>{
    const target=event.target.closest("[data-faq-category]");
    if (!target) return;
    category = target.dataset.faqCategory;
    render();
  });
  search.addEventListener("input",render);
  clear.addEventListener("click",()=>{ search.value=""; category="All"; render(); search.focus(); });
  list.addEventListener("click",async event=>{
    const target=event.target.closest("[data-copy-url]");
    if(!target)return;
    try{
      await copyText(location.origin + location.pathname + "#" + target.dataset.copyUrl);
      target.textContent="Link copied ✓";
    }catch(error){target.textContent=error.message;}
  });
  render();
  if (location.hash && FAQS.some(faq=>"#"+faq.id===location.hash)) {
    category="All";search.value="";render();
    const item=byId(location.hash.slice(1));
    if(item){
      item.classList.add("open");
      item.querySelector("[data-accordion-button]")?.setAttribute("aria-expanded","true");
      const icon=item.querySelector("[data-accordion-symbol]");
      if(icon)icon.textContent="−";
      requestAnimationFrame(()=>item.scrollIntoView({block:"start"}));
    }
  }
}

export function initHelpGuides() {
  const list=document.querySelector("[data-guide-list]");
  if(!list)return;
  const search=document.querySelector("[data-guide-search]");
  const count=document.querySelector("[data-guide-count]");
  const empty=document.querySelector("[data-guide-empty]");
  function render(){
    const q=search.value.trim().toLowerCase();
    const items=GUIDES.filter(g=>[g.title,g.category,g.intro,...g.causes,...g.steps].join(" ").toLowerCase().includes(q));
    list.innerHTML=items.map((guide,i)=>'<details class="guide-item" id="'+guide.id+'"><summary><span class="guide-number">'+String(GUIDES.indexOf(guide)+1).padStart(2,"0")+'</span><span><small>'+escapeHtml(guide.category)+' · General BeamNG guidance</small><strong>'+escapeHtml(guide.title)+'</strong></span><b aria-hidden="true">+</b></summary><div class="guide-details"><p>'+escapeHtml(guide.intro)+'</p><h3>Possible causes</h3><ul>'+guide.causes.map(x=>'<li>'+escapeHtml(x)+'</li>').join("")+'</ul><h3>Steps to try</h3><ol class="guide-steps">'+guide.steps.map(step=>'<li><label><input type="checkbox"><span>'+escapeHtml(step)+'</span></label></li>').join("")+'</ol><h3>What to check afterward</h3><p>'+escapeHtml(guide.check)+'</p><h3>If the problem remains</h3><p>'+escapeHtml(guide.report)+'</p><div class="guide-actions"><button class="small-quiet-button" type="button" data-guide-copy="'+guide.id+'">Copy guide link ↗</button><a href="report.html#bug" class="text-link">Prepare a report <span>→</span></a></div><p class="guide-note">Checkmarks are local to this page and do not mean the issue is fixed.</p></div></details>').join("");
    count.textContent=items.length+" guides";
    empty.hidden=items.length>0;
  }
  search.addEventListener("input",render);
  document.querySelector("[data-guide-clear]")?.addEventListener("click",()=>{search.value="";render();search.focus();});
  list.addEventListener("click",async event=>{
    const button=event.target.closest("[data-guide-copy]");
    if(!button)return;
    try{await copyText(location.origin+location.pathname+"#"+button.dataset.guideCopy);button.textContent="Link copied ✓";}
    catch(error){button.textContent=error.message;}
  });
  render();
  const wanted=location.hash.slice(1);
  if(GUIDES.some(g=>g.id===wanted)){
    const guide=byId(wanted);
    if(guide){guide.open=true;requestAnimationFrame(()=>guide.scrollIntoView({block:"start"}));}
  }
}

export function initKnownIssues() {
  const root=document.querySelector("[data-known-issues]");
  if(!root)return;
  if(!KNOWN_ISSUES.length) {
    root.innerHTML='<div class="known-issue-empty"><span class="eyebrow">No published records</span><h3>No known issues have been published yet.</h3><p>This is not a guarantee that unreleased or development versions are free of bugs. Verified issues will appear here when they are published.</p><a class="text-link" href="mods/project-01.html">View Torqz Garage status <span>→</span></a></div>';
    return;
  }
  root.innerHTML='<div class="known-issue-list">'+KNOWN_ISSUES.map(item=>
    '<article class="known-issue"><span class="status-badge">'+escapeHtml(item.status)+'</span><h3>'+escapeHtml(item.title)+'</h3><p>'+escapeHtml(item.description||"")+'</p><p><strong>Project:</strong> '+escapeHtml(item.projectName)+'</p>'+(item.workaround?'<p><strong>Workaround:</strong> '+escapeHtml(item.workaround)+'</p>':"")+(item.updatedAt?'<small>Updated '+escapeHtml(item.updatedAt)+'</small>':"")+'</article>').join("")+'</div>';
}

export function initReportBuilders(){
  const tabs=[...document.querySelectorAll("[data-builder-tab]")];
  if(!tabs.length)return;
  const modes=["bug","idea"];
  function switchTo(mode,focus=false) {
    if(!modes.includes(mode))return;
    tabs.forEach(tab=>{
      const selected=tab.dataset.builderTab===mode;
      tab.setAttribute("aria-selected",String(selected));
      tab.tabIndex=selected?0:-1;
      if(selected&&focus)tab.focus();
    });
    document.querySelectorAll("[data-builder-panel]").forEach(panel=>{
      panel.hidden=panel.dataset.builderPanel!==mode;
    });
    history.replaceState(null,"","#"+mode);
  }
  tabs.forEach(tab=>{
    tab.addEventListener("click",()=>switchTo(tab.dataset.builderTab));
    tab.addEventListener("keydown",event=>{
      if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
      event.preventDefault();
      const index=modes.indexOf(tab.dataset.builderTab);
      let next=event.key==="Home"?0:event.key==="End"?1:(index+(event.key==="ArrowRight"?1:-1)+modes.length)%modes.length;
      switchTo(modes[next],true);
    });
  });
  for(const mode of modes){
    const form=document.querySelector('[data-builder-form="'+mode+'"]');
    const output=document.querySelector('[data-builder-output="'+mode+'"]');
    const copy=document.querySelector('[data-builder-copy="'+mode+'"]');
    const feedback=document.querySelector('[data-builder-feedback="'+mode+'"]');
    if(!form||!output||!copy)continue;
    form.addEventListener("input",()=>{feedback.textContent="Fields changed. Generate a new preview before copying.";copy.disabled=true;});
    form.addEventListener("change",()=>{feedback.textContent="Fields changed. Generate a new preview before copying.";copy.disabled=true;});
    form.addEventListener("submit",event=>{
      event.preventDefault();
      if(!form.reportValidity())return;
      const data=new FormData(form);
      const field=name=>String(data.get(name)||"").trim();
      const line=(label,value)=>label+":\n"+(value||"Not provided")+"\n";
      const txt=mode==="bug"?
        ["TORQZ MODS — PREPARED BUG REPORT","(Not submitted)","",line("Project",field("project")),line("BeamNG version",field("version")),line("Issue title",field("title")),line("Problem",field("description")),line("Steps to reproduce",field("steps")),line("Expected behavior",field("expected")),line("Actual behavior",field("actual")),line("Relevant errors",field("errors"))].join("\n"):
        ["TORQZ MODS — PREPARED FEATURE SUGGESTION","(Not submitted)","",line("Project",field("project")),line("Feature title",field("title")),line("Description",field("description")),line("Why it helps",field("benefit")),line("Additional details",field("details"))].join("\n");
      output.textContent=txt;
      copy.disabled=false;
      feedback.textContent="Preview generated locally. No information has been submitted.";
    });
    copy.addEventListener("click",async()=>{
      try{await copyText(output.textContent);feedback.textContent="Copied to clipboard. Nothing was submitted.";}
      catch(error){feedback.textContent=error.message;}
    });
  }
  switchTo(location.hash==="#idea"?"idea":"bug");
  window.addEventListener("hashchange",()=>{if(location.hash==="#bug"||location.hash==="#idea")switchTo(location.hash.slice(1));});
}

export function initUpdatesFilters(){
  const mount=document.querySelector("[data-updates-list]");
  const query=document.querySelector("[data-update-query]");
  const cat=document.querySelector("[data-update-category]");
  const order=document.querySelector("[data-update-order]");
  if(!mount||!query||!cat||!order)return;
  const cats=[...new Set(UPDATES.map(u=>u.category).filter(Boolean))].sort();
  cat.innerHTML='<option value="All">All categories</option>'+cats.map(c=>'<option value="'+escapeHtml(c)+'">'+escapeHtml(c)+'</option>').join("");
  const count=document.querySelector("[data-update-count]");
  const empty=document.querySelector("[data-update-empty]");
  function render(){
    const q=query.value.trim().toLowerCase();
    const items=UPDATES.filter(u=>(cat.value==="All"||u.category===cat.value)&&
      [u.title,u.category,u.description,u.displayDate].join(" ").toLowerCase().includes(q))
      .sort((a,b)=>{
        const d=(a.date||"").localeCompare(b.date||"") || a.id.localeCompare(b.id);
        return order.value==="oldest"?d:-d;
      });
    mount.innerHTML=items.map(update=>updateCard(update,MODS.find(mod=>mod.id===update.projectId)||null)).join("");
    count.textContent=items.length+" of "+UPDATES.length+" verified updates";
    empty.hidden=items.length>0;
  }
  query.addEventListener("input",render);
  cat.addEventListener("change",render);
  order.addEventListener("change",render);
  document.querySelector("[data-update-clear]")?.addEventListener("click",()=>{query.value="";cat.value="All";order.value="newest";render();query.focus();});
  render();
  const hash=location.hash.slice(1);
  if(hash.startsWith("update-"))requestAnimationFrame(()=>byId(hash)?.scrollIntoView({block:"start"}));
}

export function buildSiteSearchCatalog(){
  const projects=MODS.map(mod=>({kind:"Projects",title:getProjectName(mod),subtitle:mod.subtitle,href:"mods/"+mod.slug+".html",terms:[mod.tags?.join(" "),mod.currentPhase,mod.shortDescription,mod.features?.map(f=>f.title).join(" ")].join(" ")}));
  const faqs=FAQS.map(f=>({kind:"FAQ",title:f.question,subtitle:f.answer,href:"support.html#"+f.id,terms:f.category}));
  const guides=GUIDES.map(g=>({kind:"Troubleshooting",title:g.title,subtitle:g.intro,href:"help.html#"+g.id,terms:[g.category,...g.causes,...g.steps].join(" ")}));
  const issues=KNOWN_ISSUES.map(g=>({kind:"Known Issues",title:g.title,subtitle:g.description||g.status,href:"known-issues.html",terms:g.projectName+" "+g.status}));
  const updates=UPDATES.map(u=>({kind:"Updates",title:u.title,subtitle:u.description,href:"updates.html#update-"+u.id,terms:u.category+" "+u.displayDate}));
  const pages=[
    {kind:"Help Pages",title:"Torqz Support Center",subtitle:"FAQs, troubleshooting, and reporting tools",href:"support.html",terms:"support help faq"},
    {kind:"Help Pages",title:"Installation Help",subtitle:"Current Torqz Garage release status and general guidance",href:"install.html",terms:"installation install download"},
    {kind:"Help Pages",title:"Bug Report Builder",subtitle:"Generate and copy a report without submitting",href:"report.html#bug",terms:"bug error report"},
    {kind:"Help Pages",title:"Feature Suggestion Builder",subtitle:"Prepare a copyable feature idea",href:"report.html#idea",terms:"suggestion idea feature"},
    {kind:"Help Pages",title:"Known Issues",subtitle:"Verified Torqz issue records",href:"known-issues.html",terms:"issue status problems"}
  ];
  return [...projects,...faqs,...guides,...issues,...updates,...pages];
}
