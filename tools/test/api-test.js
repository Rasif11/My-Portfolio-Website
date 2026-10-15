/* API tests against the real bundled function logic (storage = on-disk mock of Netlify Blobs). Run: node api-test.js */
const {spawn}=require('child_process'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const DIR='/tmp/blobs-test-'+process.pid,PORT=8791,B='http://localhost:'+PORT;let srv,pass=0,fail=0;
const start=()=>new Promise(r=>{srv=spawn('node',[path.join(__dirname,'server.js'),PORT],{env:Object.assign({},process.env,{BLOBS_DIR:DIR})});setTimeout(r,700)});
const stop=()=>new Promise(r=>{srv.kill();setTimeout(r,300)});
const T=(name,ok,info)=>{ok?pass++:fail++;console.log((ok?'PASS ':'FAIL ')+name+(info?'  -> '+info:''))};
async function call(m,p,o={}){const h={'Content-Type':'application/json','x-test-ip':o.ip||'10.0.0.1'};if(o.cookie)h.cookie=o.cookie;if(o.admin!==false&&m!=='GET')h['x-requested-with']='admin';
const r=await fetch(B+p,{method:m,headers:h,body:o.body===undefined?undefined:JSON.stringify(o.body),redirect:'manual'});const t=await r.text();let j;try{j=JSON.parse(t)}catch(e){j=null}
const sc=r.headers.get('set-cookie');return{s:r.status,j,h:r.headers,raw:t,cookie:sc?sc.split(';')[0]:null,sc}}
const login=(u,p,ip)=>call('POST','/api/login',{body:{username:u,password:p},ip});
(async()=>{fs.rmSync(DIR,{recursive:true,force:true});await start();
const idx=fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8'),baked=idx.match(/__H='([a-f0-9]+)'/)[1];
let r=await call('GET','/api/hash');T('public hash equals the hash baked into the built pages (untouched site never re-renders)',r.j.hash===baked,r.j.hash+' vs '+baked);
r=await call('GET','/api/content');T('public content readable without login',r.s===200&&r.j.content.services.items.length===6);
for(const [m,p,b] of [['PUT','/api/content',{content:{}}],['POST','/api/media',{name:'a.png',data:'x'}],['DELETE','/api/media/0123456789abcdef.png'],['GET','/api/media'],['GET','/api/inbox'],['DELETE','/api/inbox/abc'],['POST','/api/account',{current:'x'}],['POST','/api/reset',{}],['GET','/api/me']]){r=await call(m,p,{body:b});T('401 without session: '+m+' '+p,r.s===401)}
r=await login('admin','wrong1','10.0.0.2');T('wrong password rejected',r.s===401&&!r.cookie,r.j.error);
r=await login('wrong','ChangeMe123!','10.0.0.2');T('wrong username rejected (even with right password)',r.s===401);
for(let i=0;i<3;i++)r=await login('admin','bad'+i,'10.0.0.2');T('5th wrong attempt locks login',r.s===429&&r.j.locked,r.j.error);
r=await login('admin','ChangeMe123!','10.0.0.2');T('correct password refused while locked',r.s===429);
r=await login('admin','ChangeMe123!','10.0.0.3');const ck=r.cookie;T('login with right credentials',r.s===200&&ck&&r.j.defaultPw===true);
T('cookie flags HttpOnly + Secure + SameSite=Lax + Max-Age',/HttpOnly/.test(r.sc)&&/Secure/.test(r.sc)&&/SameSite=Lax/.test(r.sc)&&/Max-Age=\d+/.test(r.sc));
T('cookie is HMAC-signed (tampered cookie rejected)',(await call('GET','/api/me',{cookie:ck.slice(0,-3)+'abc'})).s===401&&(await call('GET','/api/me',{cookie:ck})).s===200);
const exp=JSON.parse(Buffer.from(ck.split('=')[1].split('.')[0],'base64url').toString());T('session has expiry in the future',exp.exp>Date.now()+864e5);
const auth=JSON.parse(fs.readFileSync(DIR+'/site/'+encodeURIComponent('auth.json')));T('password stored as scrypt hash with salt, not plain text',/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/.test(auth.hash)&&!fs.readFileSync(DIR+'/site/'+encodeURIComponent('auth.json'),'utf8').includes('ChangeMe123'));
r=await call('PUT','/api/content',{cookie:ck,admin:false,body:{content:{}}});T('write without X-Requested-With header refused (CSRF guard)',r.s===403);
/* content save / sanitise / persistence */
let c=(await call('GET','/api/content')).j.content;c.hero.tagline='Edited tagline <b>x</b>';c.evil={a:1};c.hero.b1.u='javascript:alert(1)';c.hero.portrait='http://evil/x.png';c.theme.c1='#ff0000';c.site.name='Rasif <img src=x onerror=alert(1)>';
r=await call('PUT','/api/content',{cookie:ck,body:{content:c}});T('save content',r.s===200&&r.j.content.hero.tagline.includes('Edited'));
T('unknown keys dropped',!('evil' in r.j.content));T('javascript: link removed',r.j.content.hero.b1.u==='');T('non-https/non-local image path removed',r.j.content.hero.portrait==='');T('theme colour saved',r.j.content.theme.c1==='#ff0000');
const pub=(await call('GET','/api/content')).j;T('public content shows the edit; hash changed',pub.content.hero.tagline.includes('Edited')&&pub.hash!==baked);
const R=require('../../assets/js/render.js');T('typed HTML is escaped on output',!R.page('home',pub.content).includes('<img src=x onerror'));
/* delete last item stays deleted */
c=pub.content;c.services.items=[];c.testi.items=[];r=await call('PUT','/api/content',{cookie:ck,body:{content:c}});T('delete every service/testimonial -> stays empty (defaults do not refill)',r.j.content.services.items.length===0&&(await call('GET','/api/content')).j.content.testi.items.length===0);
/* images */
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',up=(n,b)=>call('POST','/api/media',{cookie:ck,body:{name:n,data:Buffer.isBuffer(b)?b.toString('base64'):b}});
r=await up('shot.png',png);const pf=r.j&&r.j.file;T('upload valid PNG',r.s===200&&/^[0-9a-f]{16}\.png$/.test(pf));
r=await call('GET','/api/img/'+pf);T('image served back at /api/img/<key> with right type',r.s===200&&r.h.get('content-type')==='image/png'&&r.h.get('x-content-type-options')==='nosniff');
T('PNG renamed to .jpg rejected (signature mismatch)',(await up('fake.jpg',png)).s===400);
T('text file renamed .png rejected',(await up('a.png',Buffer.from('hello world not an image'))).s===400);
T('.exe / .html / .php rejected by extension',(await up('a.exe',png)).s===400&&(await up('a.html',png)).s===400&&(await up('a.php.png.php',png)).s===400);
T('SVG with <script> rejected',(await up('x.svg',Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).s===400);
T('SVG with onload handler rejected',(await up('x.svg',Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>'))).s===400);
T('SVG with javascript: link / external href rejected',(await up('x.svg',Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><rect/></a></svg>'))).s===400&&(await up('y.svg',Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><image href="http://evil/x.png"/></svg>'))).s===400);
r=await up('ok.svg',Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#7c5cff"/></svg>'));const sf=r.j&&r.j.file;T('clean SVG accepted',r.s===200);
r=await call('GET','/api/img/'+sf);T('SVG served with sandbox CSP',/sandbox/.test(r.h.get('content-security-policy')||''));
r=await up('big.png',Buffer.concat([Buffer.from(png,'base64'),Buffer.alloc(3.2*1024*1024)]));T('oversized image (>3 MB) rejected',r.s===413);
r=await call('GET','/api/media',{cookie:ck});T('media list',r.j.items.length===2);
r=await call('DELETE','/api/media/'+pf,{cookie:ck});T('delete image',r.s===200&&(await call('GET','/api/img/'+pf)).s===404&&(await call('GET','/api/media',{cookie:ck})).j.items.length===1);
/* contact form + inbox */
const msg={name:'John Smith',email:'john@example.com',service:'TikTok Marketing',message:'Hello, I need help with my ads.'};
r=await call('POST','/api/contact',{body:msg,ip:'10.0.1.1'});T('contact form stores message (server confirms ok:true)',r.s===200&&r.j.ok===true);
T('invalid contact rejected',(await call('POST','/api/contact',{body:Object.assign({},msg,{email:'nope'}),ip:'10.0.1.1'})).s===400&&(await call('POST','/api/contact',{body:Object.assign({},msg,{message:'short'}),ip:'10.0.1.1'})).s===400);
r=await call('POST','/api/contact',{body:Object.assign({},msg,{website:'spam'}),ip:'10.0.1.1'});T('honeypot: bot told ok but nothing stored',r.s===200);
r=await call('GET','/api/inbox',{cookie:ck});T('inbox lists exactly the 1 real message',r.j.items.length===1&&r.j.items[0].name==='John Smith');const mid=r.j.items[0].id;
let last;for(let i=0;i<6;i++)last=await call('POST','/api/contact',{body:msg,ip:'10.0.9.9'});T('contact flood rate-limited',last.s===429);
r=await call('DELETE','/api/inbox/'+mid,{cookie:ck});T('delete message',r.s===200&&(await call('GET','/api/inbox',{cookie:ck})).j.items.every(x=>x.id!==mid));
/* account */
r=await call('POST','/api/account',{cookie:ck,body:{current:'nope',password:'BrandNewPass99!'},ip:'10.0.5.5'});T('password change needs the right current password',r.s===403);
r=await call('POST','/api/account',{cookie:ck,body:{current:'ChangeMe123!',password:'short'}});T('weak new password rejected',r.s===400);
r=await call('POST','/api/account',{cookie:ck,body:{current:'ChangeMe123!',username:'rasif',password:'BrandNewPass99!'}});const ck2=r.cookie;T('change username + password',r.s===200&&r.j.user==='rasif'&&r.j.defaultPw===false&&ck2);
T('old sessions invalidated by the change',(await call('GET','/api/me',{cookie:ck})).s===401&&(await call('PUT','/api/content',{cookie:ck,body:{content:c}})).s===401);
T('old username/password no longer work',(await login('admin','ChangeMe123!','10.0.6.1')).s===401&&(await login('rasif','ChangeMe123!','10.0.6.1')).s===401);
r=await login('rasif','BrandNewPass99!','10.0.6.2');const ck3=r.cookie;T('new credentials work',r.s===200&&r.j.defaultPw===false);
/* reset keeps theme + images + login */
r=await call('POST','/api/reset',{cookie:ck3,body:{}});T('reset restores default content',r.s===200&&r.j.content.services.items.length===6&&r.j.content.hero.tagline.startsWith('Turning'));
T('reset keeps theme, images and login',r.j.content.theme.c1==='#ff0000'&&(await call('GET','/api/media',{cookie:ck3})).j.items.length===1&&(await login('rasif','BrandNewPass99!','10.0.6.3')).s===200);
/* persistence across restart + logout */
c=(await call('GET','/api/content')).j.content;c.hero.avail='Persisted after restart';await call('PUT','/api/content',{cookie:ck3,body:{content:c}});
await stop();await start();T('content persists after server restart',(await call('GET','/api/content')).j.content.hero.avail==='Persisted after restart');T('login still works after restart',(await login('rasif','BrandNewPass99!','10.0.7.1')).s===200);
r=await call('POST','/api/logout',{cookie:ck3});T('logout clears cookie',/Max-Age=0/.test(r.sc||''));
T('after sign-out (no cookie) nothing can be saved',(await call('PUT','/api/content',{body:{content:c}})).s===401&&(await call('POST','/api/media',{body:{name:'a.png',data:png}})).s===401);
await stop();fs.rmSync(DIR,{recursive:true,force:true});console.log('\n'+pass+' passed, '+fail+' failed');process.exit(fail?1:0)})().catch(e=>{console.error(e);process.exit(2)});
