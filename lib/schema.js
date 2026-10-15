/* Shared by the API (whitelist/sanitise), build.js (Node) and the admin panel (form generation). */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Schema=f()})(this,function(){
var s=function(l,m,x){return Object.assign({t:'s',l:l,max:m||200},x||{})},T=function(l,m){return s(l,m||1200,{ml:1})},
U=function(l){return{t:'u',l:l,max:300}},I=function(l){return{t:'i',l:l,max:300}},C=function(l,q){return{t:'c',l:l,req:q}},N=function(l){return{t:'n',l:l}},
D=function(l){return{t:'d',l:l}},E=function(l,o){return{t:'e',l:l,o:o}},M=function(l){return{t:'m',l:l,max:120}},Ph=function(l){return{t:'p',l:l,max:30}},H={t:'h'},
L=function(l,i,m,x){return Object.assign({t:'l',l:l,item:i,max:m||40},x||{})},O=function(l,f){return{t:'o',l:l,f:f}};
var ICONS=['target','search','share','trend','play','users','chart','mail','chat','star'],SOC=['facebook','instagram','linkedin','tiktok','youtube','x'];
var btn=function(l){return O(l,{t:s('Button text',40),u:U('Button link')})};
var hdr=function(){return O('Page header',{eyebrow:s('Small label above heading',40),l1:s('Heading line 1',60),l2:s('Heading line 2 (gradient)',60),intro:T('Intro paragraph',500)})};
var cta=function(){return O('Page call to action',{title:s('Heading',80),text:T('Text',300),btn:btn('Primary button'),b2:btn('Secondary button')})};
var meta={title:s('Browser tab title (page name)',60),desc:T('Search engine description',300)};
var ROOT=O('',{
site:O('Website',{name:s('Brand name',80),short:s('Logo initials',4),logo:I('Logo image'),favicon:I('Browser tab icon'),title:s('Browser title (Home page)',120),desc:T('Search engine description',300),footerDesc:T('Footer text',300),email:M('Email address'),phone:Ph('Phone number'),phone2:Ph('Second phone number'),whatsapp:Ph('WhatsApp number'),cc:s('Country code for phone/WhatsApp links (digits only, e.g. 880)',5)}),
theme:O('Theme colours',{c1:C('Accent colour 1',1),c2:C('Accent colour 2',1),c3:C('Accent colour 3',1),bg:C('Background colour',1)}),
socials:L('Social links',O('Link',{n:E('Platform',SOC),u:U('Profile URL')}),8,{nm:'n'}),
hero:O('Hero',{avail:s('Availability pill',60),profession:s('Profession',80),specialities:L('Rotating roles / specialities',s('Role',80),12),tagline:T('Tagline',200),intro:T('Intro paragraph',800),b1:btn('First button'),b2:btn('Second button'),portrait:I('Portrait photo'),cards:L('Floating cards',O('Card',{n:s('Headline number',20),l:s('Label',40)}),2,{nm:'n'})}),
stats:L('Stats',O('Stat',{n:N('Number'),p:s('Prefix',6),s:s('Suffix',6),l:s('Label',60)}),4,{nm:'l'}),
services:O('Services',{eyebrow:s('Section label',40),title:s('Section heading',80),items:L('Services',O('Service',{id:H,t:s('Service name',80),tag:s('Category tag',30),i:E('Icon',ICONS),d:T('Short description (Home page card)',250),long:T('Description (Services page)',600),inc:L("What's included",s('Item',100),8),note:s('Footer note',60)}),12,{nm:'t',idp:'svc-'})}),
work:O('My Work',{eyebrow:s('Section label',40),title:s('Section heading',80),items:L('Projects',O('Project',{id:H,t:s('Title',80),d:T('Short description',300),img:I('Screenshot'),date:D('Date (newest four appear on Home)')}),60,{nm:'t',idp:'w-'})}),
about:O('About teaser',{eyebrow:s('Small label',40),title:s('Heading',80),img:I('Photo'),badge:O('Photo badge',{n:s('Number',10),l:s('Two-word label',30)}),p:L('Paragraphs',T('Paragraph',600),3),bullets:L('Ticked bullet points',s('Bullet',80),8),btn:btn('Button')}),
tools:O('Tools & expertise',{eyebrow:s('Small label',40),title:s('Heading',80),chips:L('Tools used daily',s('Tool',40),24),marquee:L('Scrolling marquee keywords',s('Keyword',60),30)}),
testi:O('Testimonials',{eyebrow:s('Home slider label',40),title:s('Home slider heading',80),btn:btn('Button below slider'),items:L('Reviews',O('Review',{q:T('Review text',600),n:s('Name',60),r:s('Role',60),tag:s('Service tag',60),ini:s('Avatar initials (blank = automatic)',3),a1:C('Avatar colour 1 (blank = automatic)'),a2:C('Avatar colour 2 (blank = automatic)')}),30,{nm:'n'})}),
cta:O('Home closing call to action',{title:s('Heading',80),text:T('Text',300),btn:btn('Primary button')}),
servicesPage:O('Services page',{title:meta.title,desc:meta.desc,header:hdr(),cta:cta()}),
workPage:O('My Work page',{title:meta.title,desc:meta.desc,header:hdr(),cta:cta()}),
aboutPage:O('About Me page',{title:meta.title,desc:meta.desc,header:hdr(),story:O('Story',{eyebrow:s('Small label',40),lead:T('Opening line',300),paras:L('Story paragraphs',T('Paragraph',900),6),img:I('Photo'),sigName:s('Signature name',80),sigTitle:s('Signature title',80)}),cta:cta()}),
testiPage:O('Testimonials page',{title:meta.title,desc:meta.desc,header:hdr(),cta:cta()}),
contactPage:O('Contact page',{title:meta.title,desc:meta.desc,header:hdr(),form:O('Form wording',{title:s('Form heading',60),sub:s('Sub-heading',120),notSure:s('"Not sure" dropdown option',40),placeholder:s('Message box hint',160),note:s('Privacy note',160)}),hints:O('Contact card hints',{email:s('Email card hint',80),phone:s('Phone card hint',80),wa:s('WhatsApp card hint',80)}),online:s('"Find me online" heading',40)})
});
function str(v,max,ml){v=v==null?'':String(v);v=ml?v.replace(/\r/g,'').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,''):v.replace(/[\u0000-\u001f\u007f]+/g,' ');return v.trim().slice(0,max)}
var slug=function(x){return String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,24)||'item'};
function empty(x){if(Array.isArray(x))return !x.length;if(x&&typeof x==='object')return Object.keys(x).every(function(k){return empty(x[k])});return x===''||x===0||x==null}
function clean(n,v,d){
if(v===undefined&&d!==undefined)v=d;
switch(n.t){
case'o':{var o={},k;for(k in n.f)o[k]=clean(n.f[k],v&&typeof v==='object'&&!Array.isArray(v)?v[k]:undefined,d&&typeof d==='object'?d[k]:undefined);return o}
case'l':{var a=(Array.isArray(v)?v:[]).slice(0,n.max).map(function(x){return clean(n.item,x)}).filter(function(x){return !empty(x)}).filter(function(x){return !n.nm||typeof x!=='object'||(x[n.nm]!==''&&x[n.nm]!==undefined)});
if(n.item.t==='o'&&n.item.f.id){var seen={};a.forEach(function(x){var b=x.id;if(!b||seen[b])b=(n.idp||'')+slug(x.t);var i=2,c=b;while(seen[c])c=b+'-'+i++;x.id=c;seen[c]=1})}return a}
case'u':{var x=str(v,300);return /^(https?:\/\/[^\s"'<>]+|mailto:[^\s"'<>]+|tel:[^\s"'<>]+|\/(?!\/)[^\s"'<>]*|#[\w-]*|[\w.-]+\.html(#[\w-]*)?)$/i.test(x)?x:''}
case'i':{var y=str(v,300);return /^(assets\/img\/[\w.\-]+|\/api\/img\/[\w.\-]+|https:\/\/[^\s"'<>]+)$/.test(y)?y:''}
case'c':{var z=str(v,9);if(/^#[0-9a-f]{6}$/i.test(z))return z.toLowerCase();return n.req?(/^#[0-9a-f]{6}$/i.test(d||'')?d:'#7c5cff'):''}
case'n':{var q=Math.round(Number(v));return isFinite(q)?Math.max(0,Math.min(1e9,q)):0}
case'd':{var w=str(v,10);return /^\d{4}-\d{2}-\d{2}$/.test(w)?w:''}
case'e':return n.o.indexOf(v)>=0?v:n.o[0];
case'm':{var m=str(v,120);return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(m)?m:''}
case'p':return str(v,30).replace(/[^0-9+()\- ]/g,'');
case'h':{var h=str(v,40);return /^[a-z0-9-]{1,40}$/.test(h)?h:''}
default:return str(v,n.max,n.ml)}}
function canon(v){if(Array.isArray(v))return '['+v.map(canon).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(function(k){return JSON.stringify(k)+':'+canon(v[k])}).join(',')+'}';return JSON.stringify(v)}
function blank(n){switch(n.t){case'o':var o={};for(var k in n.f)o[k]=blank(n.f[k]);return o;case'l':return[];case'n':return 0;case'e':return n.o[0];case'd':return new Date().toISOString().slice(0,10);default:return ''}}
return{ROOT:ROOT,ICONS:ICONS,SOC:SOC,clean:clean,blank:blank,
sanitize:function(v,d){return clean(ROOT,v,d)},
hash:function(v){return require('crypto').createHash('sha256').update(canon(v)).digest('hex').slice(0,16)}}});
