import { defineConfig } from 'vite';

const internalRoutes = /^\/(rooms(?:\/[^/?#]+)?|annex|facilities|blaze-and-jacob|about|gallery|contact|booking|blog(?:\/[^/?#]+)?|manage-booking)\/?$/;

export default defineConfig({
  plugins:[{
    name:'st-jacobs-pretty-routes',
    configureServer(server){server.middlewares.use((req,_res,next)=>{if(req.url&&internalRoutes.test(req.url.split('?')[0]))req.url='/internal.html';next();});},
    configurePreviewServer(server){server.middlewares.use((req,_res,next)=>{if(req.url&&internalRoutes.test(req.url.split('?')[0]))req.url='/internal.html';next();});},
  }],
  build:{rollupOptions:{input:{home:'index.html',internal:'internal.html',notFound:'404.html'}}},
});
