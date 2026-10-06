const q=document.querySelector.bind(document);const qa=document.querySelectorAll.bind(document);
const input=q('[data-search]'); if(input){input.addEventListener('input',e=>{const v=e.target.value.trim().toLowerCase();qa('[data-mod-card]').forEach(c=>{c.style.display=!v||c.innerText.toLowerCase().includes(v)?'':'none'})});}
qa('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());
