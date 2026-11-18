const {redis,json,cookieValue,tokenHash,clearSessionCookie,validOrigin}=require("./_lib/auth");
module.exports=async function(req,res){
  if(req.method!=="POST") return json(res,405,{error:"Méthode non autorisée."});
  if(!validOrigin(req)) return json(res,403,{error:"Origine refusée."});
  try{
    const token=cookieValue(req);
    if(token) await redis(["DEL","mgw:auth:session:"+tokenHash(token)]);
    clearSessionCookie(res);
    return json(res,200,{ok:true});
  }catch(e){clearSessionCookie(res);return json(res,503,{error:"Déconnexion momentanément indisponible."});}
};
