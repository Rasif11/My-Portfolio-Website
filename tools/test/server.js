/* Local test server: serves the site and routes /api/* to the bundled function, like Netlify does. Usage: BLOBS_DIR=/tmp/b node server.js 8765 */
const http=require('http'),fs=require('fs'),path=require('path'),root=path.join(__dirname,'../..'),{handler}=require('./api.test.js');
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.txt':'text/plain'};
http.createServer((rq,rs)=>{const u=new URL(rq.url,'http://x');
if(u.pathname.startsWith('/api/')){const ch=[];rq.on('data',c=>ch.push(c));rq.on('end',async()=>{const b=Buffer.concat(ch);
const r=await handler({httpMethod:rq.method,path:'/.netlify/functions/api'+u.pathname.slice(4),headers:Object.assign({},rq.headers,{'x-nf-client-connection-ip':rq.headers['x-test-ip']||rq.socket.remoteAddress}),body:b.length?b.toString('base64'):null,isBase64Encoded:true,blobs:''});
const h=Object.assign({},r.headers);rs.writeHead(r.statusCode,h);rs.end(r.isBase64Encoded?Buffer.from(r.body,'base64'):r.body)});return}
let p=path.join(root,decodeURIComponent(u.pathname));if(p.endsWith('/'))p+='index.html';
if(!p.startsWith(root)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){rs.writeHead(404,{'Content-Type':'text/html'});return rs.end(fs.readFileSync(root+'/404.html'))}
rs.writeHead(200,{'Content-Type':T[path.extname(p)]||'application/octet-stream'});rs.end(fs.readFileSync(p))}).listen(+process.argv[2]||8765);
