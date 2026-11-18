(function(){
  var sites=[
    {id:"guerisseur",name:"Guérisseur de l’Âme",url:"https://guerisseur-de-lame.vercel.app/"},
    {id:"bleupro",name:"BLEU PRO",url:"https://transfert-bleu-pro.vercel.app/"},
    {id:"documents",name:"Mes Documents",url:"https://transfert-mes-documents.vercel.app/"},
    {id:"gestion",name:"Ma Gestion Web",url:"https://transfert-ma-gestion-web.vercel.app/"},
    {id:"creatif",name:"Espace Créatif",url:"https://espace-creatif.vercel.app/"}
  ];
  var path=location.hostname;
  var current=path.indexOf("guerisseur-de-lame")>=0?"guerisseur":path.indexOf("transfert-bleu-pro")>=0?"bleupro":path.indexOf("transfert-mes-documents")>=0?"documents":path.indexOf("transfert-ma-gestion-web")>=0?"gestion":"creatif";
  var targets=current==="creatif"?sites.filter(function(s){return s.id!=="creatif";}):sites.filter(function(s){return s.id==="creatif";});
  var old=document.getElementById("cross-site-navigation");if(old)old.remove();
  var nav=document.createElement("nav");nav.id="project-sites-nav";nav.setAttribute("aria-label","Autres espaces");
  var label=document.createElement("strong");label.textContent=current==="creatif"?"Retrouver les autres espaces":"Découvrir aussi";nav.appendChild(label);
  targets.forEach(function(s){var a=document.createElement("a");a.href=s.url;a.textContent=s.name;a.rel="noopener";nav.appendChild(a);});
  var css=document.createElement("style");css.textContent=
    "#project-sites-nav{display:flex;align-items:center;justify-content:center;gap:9px;flex-wrap:wrap;padding:14px 16px;background:var(--site-soft,#e8f2fa);border-bottom:1px solid var(--site-border,#dceaf4);font:14px system-ui,sans-serif}" +
    "#project-sites-nav strong{font-size:13px;color:var(--site-text,#435d73)}" +
    "#project-sites-nav a{display:inline-block;padding:8px 13px;border-radius:999px;background:var(--site-card,#fff);border:1px solid var(--site-border,#dceaf4);color:var(--site-text,#435d73);text-decoration:none;font-weight:600}" +
    "#project-sites-nav a:hover{filter:brightness(.97)}";
  document.head.appendChild(css);
  var header=document.querySelector("header");
  if(header&&header.parentNode)header.insertAdjacentElement("afterend",nav);else document.body.insertBefore(nav,document.body.firstChild);
})();