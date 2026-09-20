import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
if(!fs.existsSync(path.join(root,'build-info.json')))throw new Error('Run npm run build first.');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2','.svg':'image/svg+xml'};
const port=Number(process.env.PORT||4173);
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory()) {
      if(!url.pathname.endsWith('/')){res.writeHead(302,{Location:url.pathname+'/'+url.search}).end();return;}
      file=path.join(file,'index.html');
    }
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){
      const fallback=path.join(root,'404.html');
      if(fs.existsSync(fallback)){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});fs.createReadStream(fallback).pipe(res);}
      else res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');
      return;
    }
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(400).end('Bad request');}
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is in use. Choose PORT; do not stop another server.`:e);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}/ — serving ${root}`));
