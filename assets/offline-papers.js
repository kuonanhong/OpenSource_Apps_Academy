'use strict';
/* Classic scripts intentionally support local file URLs; payloads are gzip JSON, never eval. */
(() => {
 const root=document.body.dataset.root||'./',pending=new Map();
 function script(path){return new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=root+path;el.onload=()=>resolve();el.onerror=()=>{el.remove();reject(new Error('Offline source file is missing. Extract the complete ZIP before opening index.html.'))};document.head.append(el)})}
 let inflateReady;
 window.OpenLabPaper={async load(p){
  const id=String(p.id||'');if(!/^[A-Za-z0-9_-]{1,120}$/.test(id))throw Error('Invalid paper identifier');
  if(pending.has(id))return pending.get(id);
  const task=(async()=>{
   if(!window.OPENLAB_PAPER_GZIP?.[id])await script('data/paper_offline/'+id+'.js');
   if(!window.pako){inflateReady=inflateReady||script('vendor/pako/pako_inflate.min.js');await inflateReady}
   const b64=window.OPENLAB_PAPER_GZIP[id];if(typeof b64!=='string'||b64.length>10000000)throw Error('Invalid offline source record');
   const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
   const data=JSON.parse(window.pako.ungzip(bytes,{to:'string'}));
   delete window.OPENLAB_PAPER_GZIP[id];return data;
  })();pending.set(id,task);
  try{return await task}catch(e){pending.delete(id);throw e}
 }};
})();
