(function(){
  var sites=[
    {id:'guerisseur',name:'Guérisseur de l’Âme',url:'https://guerisseur-de-lame.vercel.app/'},
    {id:'bleupro',name:'Transfert BLEU PRO',url:'https://transfert-bleu-pro.vercel.app/'},
    {id:'documents',name:'Transfert Mes Documents',url:'https://mes-documents-seven.vercel.app/'},
    {id:'gestion',name:'Transfert Ma Gestion Web',url:'https://ma-gestion-web.vercel.app/'},
    {id:'creatif',name:'Espace Créatif',url:'https://espace-creatif.vercel.app/'}
  ];
  var host=location.hostname;
  var current=host.indexOf('guerisseur-de-lame')>=0?'guerisseur':host.indexOf('transfert-bleu-pro')>=0?'bleupro':host.indexOf('mes-documents')>=0?'documents':host.indexOf('ma-gestion-web')>=0?'gestion':'creatif';
  var targets=sites.filter(function(s){return s.id!==current;});
  var old=document.getElementById('project-sites-nav');if(old)old.remove();
  var nav=document.createElement('nav');nav.id='project-sites-nav';nav.setAttribute('aria-label','Accès direct aux autres sites');
  var label=document.createElement('strong');label.textContent='Accès direct aux autres sites';nav.appendChild(label);
  targets.forEach(function(s){var a=document.createElement('a');a.href=s.url;a.textContent=s.name;a.rel='noopener';nav.appendChild(a);});
  var css=document.createElement('style');css.textContent='#project-sites-nav{display:flex;align-items:center;justify-content:center;gap:9px;flex-wrap:wrap;padding:14px 16px;background:var(--site-soft,#e8f2fa);border-bottom:1px solid var(--site-border,#dceaf4);font:14px system-ui,sans-serif}#project-sites-nav strong{font-size:13px;color:var(--site-text,#435d73);width:100%;text-align:center}#project-sites-nav a{display:inline-block;padding:8px 13px;border-radius:999px;background:var(--site-card,#fff);border:1px solid var(--site-border,#dceaf4);color:var(--site-text,#435d73);text-decoration:none;font-weight:600}#project-sites-nav a:hover{filter:brightness(.97)}';
  document.head.appendChild(css);var header=document.querySelector('header');
  if(header&&header.parentNode)header.insertAdjacentElement('afterend',nav);else document.body.insertBefore(nav,document.body.firstChild);
})();