import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { randomBytes } from 'node:crypto';

const port = Number(process.env.PORT || 5183);
const root = join(process.cwd(),'dist');
const dataDir = join(process.cwd(),'.data');
const dataFile = join(dataDir,'test-data.json');
const empty = { enquiries:[] };
let writeQueue = Promise.resolve();

async function load(){try{return JSON.parse(await readFile(dataFile,'utf8'))}catch{return structuredClone(empty)}}
async function save(data){await mkdir(dataDir,{recursive:true});writeQueue=writeQueue.then(()=>writeFile(dataFile,JSON.stringify(data,null,2)));return writeQueue}
function json(res,status,data){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(data))}
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>100000)throw new Error('Request too large')}return JSON.parse(raw||'{}')}
const reference=()=>`TST-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
async function api(req,res,url){
  if(req.method==='POST'&&url.pathname==='/api/test-enquiries'){
    const input=await body(req);if(!input.name?.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email||'')||!input.message?.trim())return json(res,422,{error:'Complete all fields with a valid email address.'});const data=await load();data.enquiries.push({id:reference(),createdAt:new Date().toISOString(),name:input.name.trim(),email:input.email.trim().toLowerCase(),message:input.message.trim(),status:'LOCAL TEST — EMAIL NOT SENT'});await save(data);return json(res,201,{message:'Test enquiry saved locally. Email delivery is not connected.'});
  }
  return json(res,404,{error:'API route not found.'});
}

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff'};
const internal=/^\/(rooms(?:\/[^/?#]+)?|annex|facilities|blaze-and-jacob|about|gallery|contact|booking|blog(?:\/[^/?#]+)?|manage-booking)\/?$/;
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/'))return await api(req,res,url);let pathname=url.pathname==='/'?'/index.html':internal.test(url.pathname)?'/internal.html':url.pathname;const safe=normalize(pathname).replace(/^(\.\.(\/|\\|$))+/,''),file=join(root,safe);if(!file.startsWith(root)||!existsSync(file)){res.writeHead(404,{'content-type':'text/html; charset=utf-8'});return res.end('<h1>Page not found</h1><p><a href="/">Return home</a></p>')}const content=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'});res.end(content)}catch(error){json(res,500,{error:'Development server error.',detail:process.env.NODE_ENV==='development'?error.message:undefined})}}).listen(port,'127.0.0.1',()=>console.log(`St. Jacobs local server: http://127.0.0.1:${port}/`));
