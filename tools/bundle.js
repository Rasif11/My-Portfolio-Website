/* Rebuilds netlify/functions/api.js (single file, no dependencies). Run: cd tools && npm install && npm run bundle  (add "test" to build the local test copy) */
const esbuild=require('esbuild'),path=require('path'),root=path.join(__dirname,'..');
const base={entryPoints:[root+'/src/api.src.js'],bundle:true,platform:'node',target:'node18',format:'cjs',loader:{'.json':'json'},legalComments:'none',nodePaths:[__dirname+'/node_modules']};
esbuild.buildSync({...base,outfile:root+'/netlify/functions/api.js'});console.log('bundled netlify/functions/api.js');
if(process.argv[2]==='test'){esbuild.buildSync({...base,alias:{'@netlify/blobs':__dirname+'/test/mock-blobs.js'},outfile:__dirname+'/test/api.test.js'});console.log('bundled test copy (mock storage)')}
