(function(){
var SUPABASE_URL="https://aosyeewlrzibqaklhcxp.supabase.co";
var SUPABASE_KEY="sb_publishable_MNA_y086hJoleBjry7sm1Q_Mt0yNAnv";
var SITE_KEY="ma-gestion-web";
var client=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
var buttons=Array.prototype.slice.call(document.querySelectorAll(".swatch"));
var status=document.getElementById("color-status");
var authStatus=document.getElementById("auth-status");
var authForm=document.getElementById("auth-form");
var userPanel=document.getElementById("user-panel");
var userEmail=document.getElementById("user-email");
var root=document.documentElement;
function applyColor(color){root.style.setProperty("--ac",color);root.style.setProperty("--ac2","color-mix(in srgb, "+color+" 55%, white)");buttons.forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.color===color))});}
function setStatus(t){status.textContent=t;}
function setAuthUI(user){var swatches=document.querySelector(".color-system .swatches");var colorStatus=document.getElementById("color-status");if(swatches){swatches.style.display=user?"":"none";}if(colorStatus){colorStatus.style.display=user?"":"none";}if(user){authForm.hidden=true;userPanel.hidden=false;userEmail.textContent="Connecté : "+user.email;loadPreference();}else{authForm.hidden=false;userPanel.hidden=true;userEmail.textContent="";setStatus("Connecte-toi pour enregistrer une couleur.");applyColor("#b9d6ee");}}
async function loadPreference(){var user=(await client.auth.getUser()).data.user;if(!user)return;var r=await client.from("site_color_preferences").select("circle_color").eq("user_id",user.id).eq("site_key",SITE_KEY).maybeSingle();if(r.error){setStatus("Erreur de lecture : "+r.error.message);return;}if(r.data&&r.data.circle_color){applyColor(r.data.circle_color);setStatus("Couleur enregistrée : "+r.data.circle_color);}else{setStatus("Aucune couleur enregistrée pour ce site.");}}
async function savePreference(color){var user=(await client.auth.getUser()).data.user;if(!user){setStatus("Connecte-toi pour enregistrer une couleur.");return;}applyColor(color);setStatus("Enregistrement…");var r=await client.from("site_color_preferences").upsert({user_id:user.id,site_key:SITE_KEY,circle_color:color},{onConflict:"user_id,site_key"});if(r.error){setStatus("Erreur d’enregistrement : "+r.error.message);return;}setStatus("Couleur enregistrée : "+color);}
document.getElementById("sign-in").addEventListener("click",async function(){var email=document.getElementById("email").value;var password=document.getElementById("password").value;authStatus.textContent="Connexion…";var r=await client.auth.signInWithPassword({email:email,password:password});if(r.error){authStatus.textContent=r.error.message;return;}authStatus.textContent="";setAuthUI(r.data.user);});
document.getElementById("sign-up").addEventListener("click",async function(){var email=document.getElementById("email").value;var password=document.getElementById("password").value;authStatus.textContent="Création…";var r=await client.auth.signUp({email:email,password:password});if(r.error){authStatus.textContent=r.error.message;return;}authStatus.textContent=r.data.session?"Compte créé et connecté.":"Compte créé. Vérifie ton e-mail si une confirmation est demandée.";setAuthUI(r.data.user);});
document.getElementById("sign-out").addEventListener("click",async function(){await client.auth.signOut();setAuthUI(null);});
buttons.forEach(function(b){b.addEventListener("click",function(){savePreference(b.dataset.color);});});
client.auth.onAuthStateChange(function(e,s){setAuthUI(s?s.user:null);});
client.auth.getSession().then(function(r){setAuthUI(r.data.session?r.data.session.user:null);});
})();