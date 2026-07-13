document.write('<script src="owners-playbook.js"></script>');
const sections=[...document.querySelectorAll('main>details')];
const nav=document.querySelector('#tocNav');
const search=document.querySelector('#guideSearch');
const status=document.querySelector('#searchStatus');
const noResults=document.querySelector('#noResults');
const expandButton=document.querySelector('#expandAll');
sections.forEach(section=>{const a=document.createElement('a');a.href=`#${section.id}`;a.textContent=section.querySelector('summary').textContent.trim();nav.append(a)});
const links=[...nav.querySelectorAll('a')];
search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();let count=0;sections.forEach(section=>{const match=!q||section.textContent.toLowerCase().includes(q);section.classList.toggle('search-hidden',!match);if(match){count++;if(q)section.open=true}});noResults.hidden=count!==0;status.textContent=q?`${count} section${count===1?'':'s'} found`:''});
expandButton.addEventListener('click',()=>{const open=sections.some(s=>!s.open&&!s.classList.contains('search-hidden'));sections.forEach(s=>{if(!s.classList.contains('search-hidden'))s.open=open});expandButton.textContent=open?'Collapse all sections':'Expand all sections'});
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.hash===`#${entry.target.id}`))}})},{rootMargin:'-10% 0px -75% 0px'});sections.forEach(s=>observer.observe(s));
if(location.hash){const target=document.querySelector(location.hash);if(target?.tagName==='DETAILS')target.open=true}
