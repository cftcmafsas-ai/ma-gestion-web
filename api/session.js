const {redis,json,cookieValue,tokenHash}=require("./_lib/auth");
module.exports=async function(req,res){
  if(req.method!=="GET") return json(res,405,{error:"Méthode non autorisée."});
  try{
    const initialized=!!(await redis(["EXISTS","mgw:auth:user"]));
    const token=cookieValue(req);
    const authenticated=!!(token && await redis(["EXISTS","mgw:auth:session:"+tokenHash(token)]));
    return json(res,200,{initialized,authenticated});
  }catch(e){return json(res,503,{error:"Service d’authentification indisponible."});}
};
