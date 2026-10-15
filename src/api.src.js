'use strict';
/* ONE Netlify Function. Source file: bundled by tools/bundle.js into netlify/functions/api.js (no dependencies to install). */
const crypto=require('crypto');
const {connectLambda,getStore}=require('@netlify/blobs');
const Schema=require('../lib/schema.js');
const DEFAULTS_RAW=require('../data/content.json');
const DEFAULTS=Schema.sanitize(DEFAULTS_RAW,DEFAULTS_RAW);
const DEF_USER='admin',DEF_PASS='ChangeMe123!',SESSION_MS=7*864e5,MAX_IMG=3*1024*1024;
const rand=n=>crypto.randomBytes(n||16).toString('hex');
const json=(code,body,h)=>({statusCode:code,headers:Object.assign({'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'},h||{}),body:JSON.stringify(body)});
/* ---- passwords & sessions ---- */
const hashPw=pw=>{const s=crypto.randomBytes(16);return 'scrypt$'+s.toString('hex')+'$'+crypto.scryptSync(pw,s,64).toString('hex')};
const checkPw=(pw,st)=>{const p=String(st||'').split('$');if(p.length!==3||p[0]!=='scrypt')return false;const h=crypto.scryptSync(String(pw),Buffer.from(p[1],'hex'),64),t=Buffer.from(p[2],'hex');return t.length===h.length&&crypto.timingSafeEqual(h,t)};
const eq=(a,b)=>{const x=crypto.createHash('sha256').update(String(a)).digest(),y=crypto.createHash('sha256').update(String(b)).digest();return crypto.timingSafeEqual(x,y)};
const sign=(a,p)=>{const b=Buffer.from(JSON.stringify(p)).toString('base64url');return b+'.'+crypto.createHmac('sha256',a.secret).update(b).digest('base64url')};
function verify(a,tok){if(!tok)return null;const i=tok.indexOf('.');if(i<1)return null;const b=tok.slice(0,i),sig=Buffer.from(tok.slice(i+1)),ex=Buffer.from(crypto.createHmac('sha256',a.secret).update(b).digest('base64url'));if(sig.length!==ex.length||!crypto.timingSafeEqual(sig,ex))return null;let d;try{d=JSON.parse(Buffer.from(b,'base64url').toString())}catch(e){return null}return d&&d.exp>Date.now()&&d.v===a.v&&d.u===a.user?d:null}
const cookie=(t,age)=>'rs_sid='+t+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+age;
const newSession=a=>cookie(sign(a,{u:a.user,v:a.v,exp:Date.now()+SESSION_MS}),SESSION_MS/1000);
const getCookie=(h,n)=>{const m=(h.cookie||'').split(/;\s*/).find(x=>x.startsWith(n+'='));return m?m.slice(n.length+1):''};
/* ---- storage ---- */
function strongOk(ev){try{const d=JSON.parse(Buffer.from(ev.blobs||'','base64').toString());return !!(d&&(d.uncachedEdgeURL||d.uncached_edge_url))}catch(e){return false}}
function stores(ev){const o=strongOk(ev)?{consistency:'strong'}:{};return{site:getStore(Object.assign({name:'site'},o)),media:getStore(Object.assign({name:'media'},o)),inbox:getStore(Object.assign({name:'inbox'},o))}}
async function getAuth(S){let a=await S.site.get('auth.json',{type:'json'});if(!a){a={user:DEF_USER,hash:hashPw(DEF_PASS),v:rand(),secret:rand(32),def:true};await S.site.setJSON('auth.json',a)}return a}
const loadContent=async S=>{const st=await S.site.get('content.json',{type:'json'});return st?Schema.sanitize(st,DEFAULTS):DEFAULTS};
/* ---- lockout (5 wrong passwords = 5 minutes), per visitor address; stored in Blobs and in memory ---- */
const mem=new Map();
const ipKey=ev=>crypto.createHash('sha256').update(ev.headers['x-nf-client-connection-ip']||String(ev.headers['x-forwarded-for']||'').split(',')[0].trim()||'unknown').digest('hex').slice(0,16);
async function lockState(S,k){const b=await S.site.get('lock/'+k,{type:'json'})||{n:0,until:0},m=mem.get(k)||{n:0,until:0};return{n:Math.max(b.n,m.n),until:Math.max(b.until,m.until)}}
async function lockSave(S,k,r){mem.set(k,r);await S.site.setJSON('lock/'+k,r)}
async function lockFail(S,k){const r=await lockState(S,k);if(r.until&&r.until<=Date.now()){r.n=0;r.until=0}r.n++;if(r.n>=5){r.until=Date.now()+300000;r.n=0}await lockSave(S,k,r);return r}
const lockMsg=u=>json(429,{ok:false,error:'Too many wrong attempts. Login is locked for '+Math.max(1,Math.ceil((u-Date.now())/60000))+' more minute(s).',locked:true});
/* ---- images ---- */
const EXT={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml'};
function sigOk(ext,b){const at=(o,h)=>{const x=Buffer.from(h,'hex');return b.length>=o+x.length&&b.slice(o,o+x.length).equals(x)};
if(ext==='png')return at(0,'89504e470d0a1a0a');if(ext==='jpg'||ext==='jpeg')return at(0,'ffd8ff');if(ext==='gif')return at(0,'474946383761')||at(0,'474946383961');if(ext==='webp')return at(0,'52494646')&&at(8,'57454250');
if(ext==='svg'){const t=b.toString('utf8').replace(/^\uFEFF/,'');if(!/^\s*(<\?xml[^>]*\?>\s*)?(<!--[\s\S]*?-->\s*)?<svg[\s>]/i.test(t))return false;
return ![/<script/i,/\son[a-z]+\s*=/i,/javascript:/i,/<foreignObject/i,/<(iframe|embed|object|audio|video)/i,/<!(ENTITY|DOCTYPE)/i,/(xlink:)?href\s*=\s*["']\s*(?!#)/i,/@import/i,/url\(\s*["']?\s*(https?:|data:|javascript:)/i,/&#x?[0-9a-f]+;/i].some(r=>r.test(t))}return false}
const ab=b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
/* ---- handler ---- */
exports.handler=async function(event){
try{connectLambda(event);}catch(e){}
try{
const S=stores(event),H=event.headers||{},M=event.httpMethod,path=(event.path||'').replace(/^\/(\.netlify\/functions\/api|api)/,'')||'/';
let body={};if(event.body){const raw=event.isBase64Encoded?Buffer.from(event.body,'base64').toString():event.body;if(raw.length>5.5*1024*1024)return json(413,{ok:false,error:'Request too large'});try{body=JSON.parse(raw)}catch(e){body={}}}
/* public GET */
if(M==='GET'&&path==='/hash'){return json(200,{hash:Schema.hash(await loadContent(S))})}
if(M==='GET'&&path==='/content'){const c=await loadContent(S);return json(200,{content:c,hash:Schema.hash(c)})}
let m=path.match(/^\/img\/([a-f0-9]{16}\.(png|jpg|gif|webp|svg))$/);
if(M==='GET'&&m){const buf=await S.media.get('img/'+m[1],{type:'arrayBuffer'});if(!buf)return json(404,{ok:false,error:'Not found'});const h={'Content-Type':EXT[m[2]],'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'};if(m[2]==='svg')h['Content-Security-Policy']="default-src 'none'; style-src 'unsafe-inline'; sandbox";return{statusCode:200,headers:h,body:Buffer.from(buf).toString('base64'),isBase64Encoded:true}}
/* public contact form */
if(M==='POST'&&path==='/contact'){
if(body.website)return json(200,{ok:true});
const n=String(body.name||'').trim(),e=String(body.email||'').trim(),sv=String(body.service||'').trim(),ms=String(body.message||'').trim();
if(n.length<2||n.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)||e.length>200||!sv||sv.length>120||ms.length<10||ms.length>3000)return json(400,{ok:false,error:'Please check the form and try again.'});
const k='rl/'+ipKey(event),r=await S.site.get(k,{type:'json'})||{n:0,s:Date.now()};if(Date.now()-r.s>6e5){r.n=0;r.s=Date.now()}if(r.n>=5)return json(429,{ok:false,error:'Too many messages sent. Please try again in a few minutes.'});r.n++;await S.site.setJSON(k,r);
const id=String(Date.now()).padStart(13,'0')+'-'+rand(3);await S.inbox.setJSON('m/'+id,{id,name:n,email:e,service:sv,message:ms,at:new Date().toISOString()});return json(200,{ok:true})}
const A=await getAuth(S);
if(M==='POST'&&path==='/login'){const k=ipKey(event),st=await lockState(S,k);if(st.until>Date.now())return lockMsg(st.until);
const okPw=checkPw(body.password||'',A.hash),okUser=eq(body.username||'',A.user);
if(okPw&&okUser){mem.delete(k);await S.site.delete('lock/'+k);return json(200,{ok:true,defaultPw:!!A.def},{'Set-Cookie':newSession(A)})}
const r=await lockFail(S,k);if(r.until>Date.now())return lockMsg(r.until);return json(401,{ok:false,error:'Incorrect username or password.'})}
if(M==='POST'&&path==='/logout')return json(200,{ok:true},{'Set-Cookie':cookie('',0)});
/* everything below needs a valid session */
const ses=verify(A,getCookie(H,'rs_sid'));
if(!ses)return json(401,{ok:false,error:'Not signed in'});
if(M!=='GET'&&H['x-requested-with']!=='admin')return json(403,{ok:false,error:'Forbidden'});
if(M==='GET'&&path==='/me')return json(200,{ok:true,user:A.user,defaultPw:!!A.def});
if(M==='PUT'&&path==='/content'){if(!body.content||typeof body.content!=='object')return json(400,{ok:false,error:'No content'});const c=Schema.sanitize(body.content,DEFAULTS);await S.site.setJSON('content.json',c);return json(200,{ok:true,hash:Schema.hash(c),content:c})}
if(M==='POST'&&path==='/reset'){const cur=await loadContent(S),raw=Object.assign({},DEFAULTS_RAW,{theme:cur.theme}),c=Schema.sanitize(raw,raw);await S.site.setJSON('content.json',c);return json(200,{ok:true,hash:Schema.hash(c),content:c})}
if(M==='GET'&&path==='/media'){const ix=await S.site.get('media-index.json',{type:'json'})||[];return json(200,{ok:true,items:ix})}
if(M==='POST'&&path==='/media'){
const name=String(body.name||'image').replace(/[^\w.\- ]/g,'').slice(0,80)||'image',ext=(name.split('.').pop()||'').toLowerCase();
if(!EXT[ext])return json(400,{ok:false,error:'Only PNG, JPG, GIF, WEBP or SVG images are allowed.'});
const buf=Buffer.from(String(body.data||'').replace(/^data:[^,]*,/,''),'base64');
if(!buf.length)return json(400,{ok:false,error:'Empty file.'});if(buf.length>MAX_IMG)return json(413,{ok:false,error:'Image is too large (maximum 3 MB).'});
if(!sigOk(ext,buf))return json(400,{ok:false,error:ext==='svg'?'This SVG is not allowed (it must be a plain SVG without scripts or external links).':'This file is not a real '+ext.toUpperCase()+' image.'});
const fe=ext==='jpeg'?'jpg':ext,file=rand(8)+'.'+fe;await S.media.set('img/'+file,ab(buf));
const ix=await S.site.get('media-index.json',{type:'json'})||[];ix.unshift({file,name,type:EXT[fe],size:buf.length,at:new Date().toISOString()});await S.site.setJSON('media-index.json',ix);return json(200,{ok:true,file,path:'/api/img/'+file})}
m=path.match(/^\/media\/([a-f0-9]{16}\.(png|jpg|gif|webp|svg))$/);
if(M==='DELETE'&&m){await S.media.delete('img/'+m[1]);const ix=(await S.site.get('media-index.json',{type:'json'})||[]).filter(x=>x.file!==m[1]);await S.site.setJSON('media-index.json',ix);return json(200,{ok:true})}
if(M==='GET'&&path==='/inbox'){const l=await S.inbox.list({prefix:'m/'}),ks=l.blobs.map(b=>b.key).sort().reverse().slice(0,300),items=(await Promise.all(ks.map(k=>S.inbox.get(k,{type:'json'})))).filter(Boolean);return json(200,{ok:true,items})}
m=path.match(/^\/inbox\/([\w-]+)$/);
if(M==='DELETE'&&m){await S.inbox.delete('m/'+m[1]);return json(200,{ok:true})}
if(M==='POST'&&path==='/account'){const k=ipKey(event),st=await lockState(S,k);if(st.until>Date.now())return lockMsg(st.until);
if(!checkPw(body.current||'',A.hash)){const r=await lockFail(S,k);return r.until>Date.now()?lockMsg(r.until):json(403,{ok:false,error:'Your current password is not correct.'})}
const nu=String(body.username||A.user).trim(),np=body.password?String(body.password):'';
if(!/^[A-Za-z0-9_.-]{3,32}$/.test(nu))return json(400,{ok:false,error:'Username must be 3-32 letters, numbers, dots, dashes or underscores.'});
if(np&&(np.length<10||np.length>200||np===DEF_PASS||np.toLowerCase()===nu.toLowerCase()))return json(400,{ok:false,error:'New password must be at least 10 characters and different from the default password and your username.'});
if(nu===A.user&&!np)return json(400,{ok:false,error:'Nothing to change.'});
const B=Object.assign({},A,{user:nu,v:rand(),secret:rand(32)});if(np){B.hash=hashPw(np);B.def=false}await S.site.setJSON('auth.json',B);mem.delete(k);
return json(200,{ok:true,user:B.user,defaultPw:!!B.def},{'Set-Cookie':newSession(B)})}
return json(404,{ok:false,error:'Not found'});
}catch(err){console.error(err);return json(500,{ok:false,error:'Server error'})}};
