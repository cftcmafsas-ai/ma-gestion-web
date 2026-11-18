const {redis,json,parseBody,validOrigin,clientKey,passwordMatches,tokenHash,setSessionCookie,SESSION_TTL}=require("./_lib/auth");
const {randomBytes}=require("node:crypto");
module.exports=async function(req,res){
  if(req.method!=="POST") return json(res,405,{error:"Méthode non autorisée."});
  if(!validOrigin(req)) return json(res,403,{error:"Origine refusée."});
  try{
    const body=await parseBody(req), password=String(body.password||"");
    const key="mgw:auth:fail:"+clientKey(req);
    const blocked=await redis(["GET",key]);
    if(Number(blocked)>=5) return json(res,429,{error:"Trop de tentatives. Réessayez dans 15 minutes."});
    const raw=await redis(["GET","mgw:auth:user"]);
    if(!raw) return json(res,409,{error:"Le compte n’est pas encore initialisé."});
    let valid=false; try{valid=passwordMatches(password,JSON.parse(raw));}catch{}
    if(!valid){
      const count=await redis(["EVAL","local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],900) end; return n","1",key]);
      if(Number(count)>=5) return json(res,429,{error:"Trop de tentatives. Réessayez dans 15 minutes."});
      return json(res,401,{error:"Mot de passe incorrect."});
    }
    await redis(["DEL",key]);
    const token=randomBytes(32).toString("base64url");
    await redis(["SET","mgw:auth:session:"+tokenHash(token),"1","EX",String(SESSION_TTL)]);
    setSessionCookie(res,token);
    return json(res,200,{ok:true});
  }catch(e){return json(res,500,{error:"Service d’authentification momentanément indisponible."});}
};
