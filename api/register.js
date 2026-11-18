const {config,redis,json,parseBody,validOrigin,passwordRecord,tokenHash,setSessionCookie,SESSION_TTL}=require("./_lib/auth");
const {timingSafeEqual}=require("node:crypto");
module.exports=async function(req,res){
  if(req.method!=="POST") return json(res,405,{error:"Méthode non autorisée."});
  if(!validOrigin(req)) return json(res,403,{error:"Origine refusée."});
  try{
    const c=config(), body=await parseBody(req);
    const password=String(body.password||""), confirmation=String(body.confirmation||""), supplied=String(body.setupToken||"");
    if(password.length<12 || password.length>256) return json(res,400,{error:"Choisissez un mot de passe d’au moins 12 caractères."});
    if(password!==confirmation) return json(res,400,{error:"Les deux mots de passe ne correspondent pas."});
    if(!c.setup || !supplied) return json(res,403,{error:"Code propriétaire requis."});
    const a=Buffer.from(supplied), b=Buffer.from(c.setup);
    if(a.length!==b.length || !timingSafeEqual(a,b)) return json(res,403,{error:"Code propriétaire invalide."});
    const record=passwordRecord(password);
    const result=await redis(["EVAL","local user=redis.call('GET',KEYS[1]); if user then return 0 end; local used=redis.call('GET',KEYS[2]); if used then return 0 end; redis.call('SET',KEYS[2],'1','EX',31536000); redis.call('SET',KEYS[1],ARGV[1]); return 1","2","mgw:auth:user","mgw:auth:setup-used",JSON.stringify(record)]);
    if(Number(result)!==1) return json(res,409,{error:"Le compte est déjà initialisé."});
    const token=require("node:crypto").randomBytes(32).toString("base64url");
    await redis(["SET","mgw:auth:session:"+tokenHash(token),"1","EX",String(SESSION_TTL)]);
    setSessionCookie(res,token);
    return json(res,201,{ok:true});
  }catch(e){return json(res,500,{error:"Service d’authentification momentanément indisponible."});}
};
