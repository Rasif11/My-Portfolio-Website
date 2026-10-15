(function(){
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))},H=document.documentElement;
H.classList.add('js');var fine=matchMedia('(hover:hover) and (pointer:fine)').matches,timers=[],obs=[];
function fmt(el,v){el.textContent=el.dataset.p+Math.round(v)+el.dataset.s}
function count(el){var n=+el.dataset.n,o={v:0};if(window.gsap){gsap.to(o,{v:n,duration:2,ease:'power2.out',onUpdate:function(){fmt(el,o.v)}})}else{var t0=performance.now();(function f(t){var k=Math.min(1,(t-t0)/1800);fmt(el,n*k);if(k<1)requestAnimationFrame(f)})(t0)}}
function io(sel,cb,th){var o=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){o.unobserve(x.target);cb(x.target)}})},{threshold:th||.15,rootMargin:'0px 0px -6% 0px'});$$(sel).forEach(function(el){o.observe(el)});obs.push(o)}
function slider(sl){var tr=$('.tr',sl),n=tr.children.length,dots=$$('.dots button',sl),i=0,t,x0=null;
function go(k){i=(k+n)%n;tr.style.transform='translateX(-'+i*100+'%)';dots.forEach(function(d,j){d.classList.toggle('on',j==i)})}
function auto(){clearInterval(t);t=setInterval(function(){go(i+1)},6000);timers.push(t)}
$$('.ar',sl).forEach(function(b){b.onclick=function(){go(i+ +b.dataset.d);auto()}});dots.forEach(function(d,j){d.onclick=function(){go(j);auto()}});
sl.ontouchstart=function(e){x0=e.touches[0].clientX};sl.ontouchend=function(e){if(x0==null)return;var d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>40){go(i+(d<0?1:-1));auto()}x0=null};
sl.onmouseenter=function(){clearInterval(t)};sl.onmouseleave=auto;go(0);auto()}
function init(){
timers.forEach(clearInterval);timers=[];obs.forEach(function(o){o.disconnect()});obs=[];
if(window.ScrollTrigger)ScrollTrigger.getAll().forEach(function(k){k.kill()});
$$('[data-rot]').forEach(function(el){var s=$$('span',el),i=0;if(!s.length)return;s[0].classList.add('on');if(s.length>1)timers.push(setInterval(function(){s[i].classList.remove('on');i=(i+1)%s.length;s[i].classList.add('on')},2200))});
var on=function(el){el.classList.add('on')};
if(window.gsap&&window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);ScrollTrigger.batch('.rv',{start:'top 90%',once:true,onEnter:function(b){b.forEach(function(el,i){setTimeout(function(){on(el)},i*90)})}})}else io('.rv',on,.1);
$$('[data-n]').forEach(function(el){fmt(el,0)});io('[data-n]',count,.6);
$$('[data-sl]').forEach(slider);if(!hashDone&&/^#[a-z0-9-]+$/.test(location.hash)){hashDone=true;var hc=document.getElementById(location.hash.slice(1));if(hc&&hc.classList.contains('gc'))setTimeout(function(){openV(hc)},800)}
var hd=$('.hd');if(hd){hd.classList.toggle('sc',scrollY>30);var bg=$('.bg',hd);bg.onclick=function(){var o=H.classList.toggle('nv');bg.setAttribute('aria-expanded',o);hd.classList.toggle('nv',o)};$$('.nav a',hd).forEach(function(a){a.onclick=function(){H.classList.remove('nv');hd.classList.remove('nv')}})}
}
var lastF=null,hashDone=false;
function vw(){return $('#vw')}
function openV(c){var v=vw();if(!v)return;var im=$('img',c);$('img',v).src=im.src;$('img',v).alt=im.alt;$('h3',v).textContent=$('h3',c).textContent;$('p',v).textContent=$('p',c).textContent;lastF=c;v.classList.add('open');v.setAttribute('aria-hidden','false');H.classList.add('lock');setTimeout(function(){$('.vx',v).focus()},30)}
function closeV(){var v=vw();if(!v||!v.classList.contains('open'))return;v.classList.remove('open');v.setAttribute('aria-hidden','true');H.classList.remove('lock');if(lastF)lastF.focus({preventScroll:true})}
var busy=false;
function rd(el){var a=$('.av',el);return{t:$('.rt',el).textContent,q:$('.rq',el).textContent,n:$('.rn',el).textContent,r:$('.rr',el).textContent,i:a.textContent,s:a.getAttribute('style')||'',c:a.className.split(' ').filter(function(x){return /^a\d$/.test(x)})[0]}}
function wr(el,d){$('.rt',el).textContent=d.t;$('.rq',el).textContent=d.q;$('.rn',el).textContent=d.n;$('.rr',el).textContent=d.r;var a=$('.av',el);a.textContent=d.i;a.className='av '+d.c;if(d.s)a.setAttribute('style',d.s);else a.removeAttribute('style');if(el.classList.contains('tc'))el.setAttribute('aria-label','Feature the review by '+d.n)}
function swapT(card){var f=$('#feat');if(!f||busy)return;busy=true;var fb=$('.fb2',f),cb=$('.fb2',card),a=rd(f),b=rd(card);fb.classList.add('sw');cb.classList.add('sw');
setTimeout(function(){wr(f,b);wr(card,a);$$('.tc').forEach(function(x){x.classList.remove('act');x.removeAttribute('aria-current')});card.classList.add('act');card.setAttribute('aria-current','true');fb.classList.remove('sw');cb.classList.remove('sw');busy=false},280);
f.scrollIntoView({behavior:'smooth',block:'start'})}
document.addEventListener('click',function(e){var t=e.target.closest('.tc');if(t){swapT(t);return}var c=e.target.closest('.gc');if(c){openV(c);return}if(e.target.closest('.vx')||e.target===vw())closeV()});
document.addEventListener('keydown',function(e){var v=vw();if(v&&v.classList.contains('open')){if(e.key==='Escape')closeV();else if(e.key==='Tab'){e.preventDefault();$('.vx',v).focus()}return}
if((e.key==='Enter'||e.key===' ')&&e.target.classList){if(e.target.classList.contains('gc')){e.preventDefault();openV(e.target)}else if(e.target.classList.contains('tc')){e.preventDefault();swapT(e.target)}}});
var cfg={contactEndpoint:'/api/contact'};/* point this at the server, e.g. '/api/contact', when the backend exists */
var VAL={name:function(v){v=v.trim();return !v?'Please enter your name.':v.length<2?'Your name looks too short.':''},email:function(v){v=v.trim();return !v?'Please enter your email address.':/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)?'':'Please enter a valid email address, like name@example.com.'},service:function(v){return v?'':'Please choose a service.'},message:function(v){v=v.trim();return !v?'Please tell me a little about your project.':v.length<10?'Please add a few more details so I can help.':''}};
function chk(el){var f=el.closest('.fld'),m=VAL[el.dataset.f](el.value);f.classList.toggle('bad',!!m);$('.em',f).textContent=m;el.setAttribute('aria-invalid',m?'true':'false');return !m}
/* the single function that sends the message; resolves only when the server confirms it stored the message */
function sendMessage(d){if(!cfg.contactEndpoint)return Promise.reject({code:'noserver'});
return fetch(cfg.contactEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(r.ok&&j&&j.ok===true)return j;throw{code:'server',msg:j&&j.error}})},function(){throw{code:'net'}})}
function submitForm(fm){var bad=$$('[data-f]',fm).filter(function(x){return !chk(x)});
if(bad.length){bad[0].focus();bad[0].scrollIntoView({behavior:'smooth',block:'center'});return}
var hp=$('[name=website]',fm).value;if(hp)return;
var btn=$('.send',fm),lb=$('span',btn),old=lb.innerHTML,st=$('#fs');st.textContent='';st.className='fs';btn.disabled=true;lb.textContent='Sending\u2026';
var d={name:fm.name.value.trim(),email:fm.email.value.trim(),service:fm.service.value,message:fm.message.value.trim(),website:hp};
sendMessage(d).then(function(){fm.reset();var cn=$('#cnt');if(cn)cn.textContent='0 / 3000';$$('.fld',fm).forEach(function(f){f.classList.remove('bad');$('.em',f).textContent=''});$('.fw').hidden=true;var ok=$('#ok');ok.hidden=false;ok.focus();$('#fp').scrollIntoView({behavior:'smooth',block:'start'})},function(er){
var m=er&&er.code==='noserver'?'This form cannot send messages yet because the message service has not been connected. Nothing was sent. Please email or call me directly instead.':er&&er.code==='net'?'I could not reach the server, so your message was not sent. Please check your connection and try again.':(er&&er.msg)||'The server could not save your message, so it was not sent. Please try again in a moment.';
st.textContent=m;st.className='fs err'}).then(function(){btn.disabled=false;lb.innerHTML=old})}
document.addEventListener('focusout',function(e){var t=e.target;if(t.matches&&t.matches('.fm [data-f]'))chk(t)});
document.addEventListener('input',function(e){var t=e.target;if(t.matches&&t.matches('.fm [data-f]')&&t.closest('.fld').classList.contains('bad'))chk(t)});
document.addEventListener('input',function(e){if(e.target.id==='f-m'){var c=$('#cnt');if(c)c.textContent=e.target.value.length+' / 3000'}});
document.addEventListener('submit',function(e){if(e.target.id==='cf'){e.preventDefault();submitForm(e.target)}});
document.addEventListener('click',function(e){if(e.target.closest('.again')){$('.fw').hidden=false;$('#ok').hidden=true;$('#f-n').focus()}});
window.Site={init:init,config:cfg};
addEventListener('scroll',function(){var h=$('.hd');if(h)h.classList.toggle('sc',scrollY>30)},{passive:true});
document.addEventListener('click',function(e){if(!e.target.closest('.hd')){var h=$('.hd');if(h)h.classList.remove('nv')}});
/* delegated effects survive re-renders */
if(fine){H.classList.add('cur');var cd=$('.cd'),cr=$('.cr'),mx=-99,my=-99,rx=-99,ry=-99;
addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;cd.style.transform='translate('+mx+'px,'+my+'px)'});
(function f(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;cr.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(f)})();
document.addEventListener('mouseover',function(e){cr.classList.toggle('big',!!e.target.closest('a,button,.card,.wk,.gc,.tc,select'))});
document.addEventListener('mousemove',function(e){
var m=e.target.closest('.mag');if(m){var r=m.getBoundingClientRect();m.style.transform='translate('+(e.clientX-r.left-r.width/2)*.22+'px,'+(e.clientY-r.top-r.height/2)*.3+'px)'}
$$('.mag').forEach(function(x){if(x!==m)x.style.transform=''});
var c=e.target.closest('.card');if(c){var q=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-q.left+'px');c.style.setProperty('--my',e.clientY-q.top+'px')}
var t=e.target.closest('[data-tilt]');$$('[data-tilt]').forEach(function(x){if(x!==t)x.style.transform=''});
if(t){var b=t.getBoundingClientRect(),px=(e.clientX-b.left)/b.width-.5,py=(e.clientY-b.top)/b.height-.5;t.style.transform='rotateY('+px*16+'deg) rotateX('+-py*16+'deg)'}})}
function ready(){init();setTimeout(function(){document.body.classList.add('ready')},650)}
if(document.readyState==='complete')ready();else addEventListener('load',ready);
setTimeout(function(){document.body.classList.add('ready')},3500);
/* boot: ask the server for the content hash; re-render only if it differs from the baked-in one */
fetch('/api/hash',{headers:{Accept:'application/json'},cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){
if(!j||!j.hash||j.hash===window.__H||!window.Render)return;
return fetch('/api/content',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(d){
if(!d||!d.content)return;var c=d.content,k=window.__PAGE||'home';$('#app').innerHTML=Render.page(k,c);var s=$('#theme');if(s)s.textContent=Render.theme(c.theme||{});
var m=Render.meta(k,c);document.title=m.title;var md=$('meta[name=description]');if(md)md.setAttribute('content',m.desc);var ic=$('link[rel=icon]');if(ic)ic.setAttribute('href',m.fav);
window.__H=d.hash;init()})}).catch(function(){});
})();
