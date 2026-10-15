/* Local stand-in for @netlify/blobs (files on disk). Used ONLY by the local tests. */
const fs=require('fs'),path=require('path');
const dir=n=>{const d=path.join(process.env.BLOBS_DIR||'/tmp/blobs',n);fs.mkdirSync(d,{recursive:true});return d};
const f=(n,k)=>path.join(dir(n),encodeURIComponent(k));
exports.connectLambda=()=>{};
exports.getStore=o=>{const n=typeof o==='string'?o:o.name;return{
async get(k,op){try{const b=fs.readFileSync(f(n,k));const t=op&&op.type;return t==='json'?JSON.parse(b):t==='arrayBuffer'?b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength):b.toString()}catch(e){return null}},
async set(k,v){fs.writeFileSync(f(n,k),typeof v==='string'?v:Buffer.from(v))},
async setJSON(k,v){fs.writeFileSync(f(n,k),JSON.stringify(v))},
async delete(k){try{fs.unlinkSync(f(n,k))}catch(e){}},
async list(op){const p=(op&&op.prefix)||'';return{blobs:fs.readdirSync(dir(n)).map(decodeURIComponent).filter(k=>k.startsWith(p)).map(key=>({key}))}}}};
