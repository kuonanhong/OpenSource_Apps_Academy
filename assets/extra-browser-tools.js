/* Real vendored Three.js and Mozilla PDF.js adapters. No remote file upload. */
(function () {
  'use strict';
  let disposeActive = () => {};
  const loading = new Map();
  const load = (url, name) => {
    if (window[name]) return Promise.resolve(window[name]);
    if (!loading.has(url)) loading.set(url, new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=()=>resolve(window[name]);s.onerror=()=>{loading.delete(url);reject(new Error('Unable to load local script: '+url));};document.head.append(s);}));
    return loading.get(url);
  };

  window.renderExtraBrowserTool = async function (id, host, OL) {
    disposeActive();
    const { ROOT, esc, zh, saveBlob } = OL;
    const say = (z, e) => zh() ? z : e;
    const asset = path => new URL(ROOT + path, document.baseURI).href;
    const isThree = id === 'threejs';
    if (!['threejs', 'pdfjs'].includes(id)) throw new Error('Unsupported browser adapter');
    let closed = false;
    const cleanup = [];
    host.innerHTML = `<div class="breadcrumb"><a href="${esc(ROOT)}index.html#tools">${say('開源工具','Open-source tools')}</a> / ${isThree ? 'Three.js' : 'PDF.js'}</div>
      <div class="eyebrow">${isThree ? 'WEBGL / THREE.JS 0.179.1 / MIT' : 'DOCUMENTS / MOZILLA PDF.JS 5.6.205 / APACHE-2.0'}</div>
      <h1>${isThree ? say('參數化 3D 圓環實驗室','Parametric 3D torus lab') : say('本機 PDF 閱讀與文字擷取','Local PDF rendering and text extraction')}</h1>
      <p class="muted">${isThree ? say('實際使用隨附 Three.js 建立幾何、光照與 WebGL 繪圖。拖曳旋轉，調整主半徑及管半徑。','The bundled Three.js library builds geometry, lighting and WebGL rendering. Drag to rotate and adjust the major and tube radii.') : say('實際使用隨附 Mozilla PDF.js 解析、繪製第一頁並擷取最多前 10 頁文字。檔案留在此瀏覽器，不上傳伺服器；雙擊開啟也使用相同本機函式庫。','The bundled Mozilla PDF.js parses and renders page one, then extracts text from up to ten pages. Files remain in this browser and are not uploaded; double-click mode uses the same bundled libraries.')}</p>
      <div class="detail-meta"><span class="tag green">${say('瀏覽器內執行','Runs in your browser')}</span><a href="${isThree ? 'https://github.com/mrdoob/three.js' : 'https://github.com/mozilla/pdf.js'}" target="_blank" rel="noopener">${say('官方開源碼','Official source')} ↗</a></div>
      <div data-extra-root></div>
      <p class="small muted">${say('已做原始函式庫與資料路徑檢查；此交付環境未能完成真實瀏覽器視覺測試。','Library/data-path checks were performed; visual browser testing was not available in the delivery environment.')}</p>`;
    const panel = host.querySelector('[data-extra-root]');
    const dispose = () => {
      if (closed) return;
      closed = true;
      cleanup.splice(0).forEach(fn => { try { fn(); } catch (_) {} });
    };
    disposeActive = dispose;
    const observer = new MutationObserver(() => { if (!host.contains(panel)) dispose(); });
    observer.observe(host, { childList: true });
    cleanup.push(() => observer.disconnect());
    window.addEventListener('pagehide', dispose, { once: true });
    cleanup.push(() => window.removeEventListener('pagehide', dispose));
    panel.innerHTML = `<p role="status">${say('正在載入本機開源函式庫…','Loading the bundled open-source library…')}</p>`;
    try {
      if (isThree) await torus(); else await pdf();
    } catch (error) {
      if (!closed) { panel.replaceChildren(); const p = document.createElement('p'); p.className='notice warn'; p.textContent=say('模組無法啟動：','Unable to start: ')+error.message; panel.append(p); }
    }

    async function torus() {
      const THREE = await load(asset('vendor/threejs/three.offline.js'),'THREE_OFFLINE');
      if (closed) return;
      panel.innerHTML = `<div class="tool-workspace"><section class="workspace-panel">
        <label for="extra-radius">${say('主半徑 R','Major radius R')} <output data-radius-value>1.4</output></label><input id="extra-radius" type="range" min="0.7" max="2" step="0.05" value="1.4">
        <label for="extra-tube">${say('管半徑 r','Tube radius r')} <output data-tube-value>0.4</output></label><input id="extra-tube" type="range" min="0.1" max="0.65" step="0.05" value="0.4">
        <label for="extra-speed">${say('自動旋轉速度','Auto-rotation speed')}</label><input id="extra-speed" type="range" min="0" max="2" step="0.1" value="0.5">
        <label><input data-wire type="checkbox"> ${say('線框顯示','Wireframe')}</label>
        <p><button data-pause>${say('暫停旋轉','Pause rotation')}</button> <button data-reset>${say('重設','Reset')}</button></p>
        <p class="small muted">${say('拖曳畫面或以方向鍵旋轉。背景頁會暫停繪圖；無 WebGL 2 的裝置會顯示原因。','Drag or use arrow keys to rotate. Rendering pauses when the tab is hidden; devices without WebGL 2 receive an explicit error.')}</p>
        <p class="code">x=(R+r cos v)cos u<br>y=(R+r cos v)sin u<br>z=r sin v</p>
        <p data-geometry-info class="small"></p>
      </section><section class="workspace-panel"><div data-view style="width:100%;height:min(58vh,480px);min-height:260px;border-radius:16px;overflow:hidden;background:#eef3ed"></div><p data-status role="status" class="small"></p></section></div>
      <div class="steps"><div class="step">${say('旋轉觀察：調整 R 和 r，比較孔洞與管面的變化。','Rotate and change R and r to inspect the hole and surface.')}</div><div class="step">${say('開啟線框，看見 Three.js 三角網格；這是幾何示範，不是 CAD 精密建模。','Enable wireframe to inspect the Three.js triangle mesh; this is a geometry demo, not a precision CAD system.')}</div><div class="step">${say('手機使用較少網格與較低像素倍率，維持可操作性。','Mobile devices use fewer mesh segments and a lower pixel ratio.')}</div></div>`;
      const view = panel.querySelector('[data-view]'), status=panel.querySelector('[data-status]');
      const canvas=document.createElement('canvas'); canvas.tabIndex=0;canvas.setAttribute('aria-label',say('可拖曳與方向鍵旋轉的三維圓環','3D torus: drag or use arrow keys to rotate'));canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none';
      const gl=canvas.getContext('webgl2',{antialias:true,alpha:false});
      if(!gl) throw new Error(say('這個裝置或瀏覽器未提供 WebGL 2；請啟用硬體加速或改用支援的瀏覽器。沒有輸出模擬圖。','WebGL 2 is unavailable. Enable hardware acceleration or use a supported browser. No simulated result is substituted.'));
      const renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true}); view.append(canvas);
      const small=matchMedia('(max-width:700px)').matches;
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,small?1.25:1.75));
      renderer.setClearColor(0xeef3ed,1);
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,0.1,50);camera.position.set(0,0,7.4);
      scene.add(new THREE.HemisphereLight(0xffffff,0x294a3a,2.7));
      const light=new THREE.DirectionalLight(0xffefcd,3.2);light.position.set(4,5,6);scene.add(light);
      const material=new THREE.MeshStandardMaterial({color:0x28785c,roughness:0.3,metalness:0.25});
      const mesh=new THREE.Mesh(new THREE.TorusGeometry(1.4,0.4,small?12:20,small?40:72),material);mesh.rotation.set(0.55,0.2,0);scene.add(mesh);
      let paused=false,drag=null,frame=0,previous=0,contextLost=false;
      function dimensions(){if(closed)return;const w=Math.max(240,view.clientWidth),h=Math.max(260,view.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
      const resize=new ResizeObserver(dimensions);resize.observe(view);dimensions();
      function geometry(){mesh.geometry.dispose();const R=Number(panel.querySelector('#extra-radius').value),r=Number(panel.querySelector('#extra-tube').value);mesh.geometry=new THREE.TorusGeometry(R,r,small?12:20,small?40:72);panel.querySelector('[data-radius-value]').textContent=R.toFixed(2);panel.querySelector('[data-tube-value]').textContent=r.toFixed(2);panel.querySelector('[data-geometry-info]').textContent=`R=${R.toFixed(2)} · r=${r.toFixed(2)} · ${mesh.geometry.index.count/3} triangles`;}
      panel.querySelector('#extra-radius').oninput=geometry;panel.querySelector('#extra-tube').oninput=geometry;geometry();
      panel.querySelector('[data-wire]').onchange=e=>{material.wireframe=e.target.checked;};
      function pause(){paused=!paused;panel.querySelector('[data-pause]').textContent=paused?say('恢復旋轉','Resume rotation'):say('暫停旋轉','Pause rotation');}
      panel.querySelector('[data-pause]').onclick=pause;
      panel.querySelector('[data-reset]').onclick=()=>{panel.querySelector('#extra-radius').value=1.4;panel.querySelector('#extra-tube').value=.4;panel.querySelector('#extra-speed').value=.5;panel.querySelector('[data-wire]').checked=false;material.wireframe=false;mesh.rotation.set(.55,.2,0);geometry();if(paused)pause();};
      canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);};
      canvas.onpointermove=e=>{if(!drag)return;mesh.rotation.y+=(e.clientX-drag.x)*.009;mesh.rotation.x+=(e.clientY-drag.y)*.009;drag={x:e.clientX,y:e.clientY};};
      canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;};
      canvas.onkeydown=e=>{const rotations={ArrowLeft:[0,-.12],ArrowRight:[0,.12],ArrowUp:[-.12,0],ArrowDown:[.12,0]};if(rotations[e.key]){e.preventDefault();mesh.rotation.x+=rotations[e.key][0];mesh.rotation.y+=rotations[e.key][1];}};
      canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;status.textContent=say('WebGL 內容已遺失，請重新開啟本工具。','WebGL context was lost. Reopen this tool.');});
      function tick(now){if(closed)return;frame=requestAnimationFrame(tick);const dt=Math.min((now-previous)/1000,.05);previous=now;if(document.hidden||contextLost)return;if(!paused&&!drag){mesh.rotation.y+=dt*Number(panel.querySelector('#extra-speed').value);mesh.rotation.x+=dt*.08;}renderer.render(scene,camera);}
      frame=requestAnimationFrame(tick);status.textContent=`Three.js r${THREE.REVISION} · WebGL 2 · ${say('本機繪圖','local rendering')}`;
      cleanup.push(()=>{cancelAnimationFrame(frame);resize.disconnect();mesh.geometry.dispose();material.dispose();renderer.dispose();});
    }

    async function pdf() {
      await load(asset('vendor/pdfjs/pdf.worker.offline.js'),'pdfjsWorker');
      await load(asset('vendor/pdfjs/pdf.binary-assets.js'),'OL_PDF_BINARY_ASSETS');
      const pdfjs=await load(asset('vendor/pdfjs/pdf.offline.js'),'pdfjsOffline');
      if(closed)return;
      // The official same-thread worker fallback sees window.pdfjsWorker; no file:// fetch or module worker is needed.
      class EmbeddedBinaryDataFactory {async fetch({kind,filename}) {const raw=window.OL_PDF_BINARY_ASSETS[kind+'/'+filename];if(!raw)throw new Error('Bundled PDF resource missing: '+filename);return Uint8Array.from(atob(raw),c=>c.charCodeAt(0));}}
      panel.innerHTML=`<div class="tool-workspace"><section class="workspace-panel">
        <label for="extra-pdf">${say('選擇本機 PDF（最多 20 MiB）','Choose a local PDF (maximum 20 MiB)')}</label><input id="extra-pdf" type="file" accept="application/pdf,.pdf">
        <label for="extra-pages">${say('擷取文字頁數（由第 1 頁開始）','Text pages to extract (starting at page 1)')}</label><input id="extra-pages" type="number" min="1" max="10" value="3">
        <button data-run class="primary">${say('繪製並擷取','Render and extract')} →</button>
        <p data-pdf-status role="status" aria-live="polite" class="small muted"></p>
        <p><button data-text-download hidden>${say('下載文字','Download text')}</button> <button data-image-download hidden>${say('下載第一頁 PNG','Download page-one PNG')}</button></p>
        <p class="small muted">${say('本工具不執行 PDF JavaScript。掃描影像不含文字層時，不會自動 OCR；多欄與數學文字的閱讀順序可能需要修正。密碼保護的檔案請先在可信任工具中解密。','PDF JavaScript is not executed. Scans without a text layer are not automatically OCRed; multi-column and mathematical reading order may need correction. Decrypt password-protected files first with a trusted tool.')}</p>
      </section><section class="workspace-panel"><canvas data-pdf-canvas style="display:none;width:100%;height:auto;border:1px solid #d3ddd5" aria-label="PDF page one"></canvas></section></div>
      <section class="workspace-panel"><h2>${say('實際擷取文字','Extracted text')}</h2><pre data-pdf-text style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:36rem;overflow:auto"></pre></section>
      <div class="steps"><div class="step">${say('選取 PDF 並指定前幾頁，按「繪製並擷取」。','Choose a PDF, select the number of initial pages, and press Render and extract.')}</div><div class="step">${say('第一頁由 PDF.js 繪製，文字由 getTextContent() 取得；沒有使用 AI 猜測內容。','PDF.js renders page one and getTextContent() extracts text; content is not inferred by AI.')}</div><div class="step">${say('可下載純文字及第一頁 PNG；此工具不會修改原 PDF。','Download plain text or page-one PNG. The original PDF is not modified.')}</div></div>`;
      let task=null,documentPDF=null,renderTask=null,text='',baseName='document';
      const run=panel.querySelector('[data-run]'),status=panel.querySelector('[data-pdf-status]'),canvas=panel.querySelector('[data-pdf-canvas]');
      const textButton=panel.querySelector('[data-text-download]'),imageButton=panel.querySelector('[data-image-download]');
      const wipe=async()=>{if(renderTask){renderTask.cancel();renderTask=null;}if(task){await task.destroy();task=null;}documentPDF=null;};
      cleanup.push(()=>{wipe().catch(()=>{});});
      run.onclick=async()=>{
        if(run.disabled)return;
        run.disabled=true;textButton.hidden=true;imageButton.hidden=true;canvas.style.display='none';panel.querySelector('[data-pdf-text]').textContent='';text='';
        try{
          const file=panel.querySelector('#extra-pdf').files[0];
          if(!file)throw new Error(say('請選擇一個 PDF 檔。','Select a PDF file.'));
          if(file.size>20*1024*1024)throw new Error(say('檔案超過 20 MiB。','The file exceeds 20 MiB.'));
          const requested=Number(panel.querySelector('#extra-pages').value);
          if(!Number.isInteger(requested)||requested<1||requested>10)throw new Error(say('頁數必須是 1 至 10 的整數。','Page count must be an integer from 1 to 10.'));
          await wipe();if(closed)return;
          const bytes=new Uint8Array(await file.arrayBuffer());if(closed)return;
          status.textContent=say('正在解析 PDF…','Parsing PDF…');baseName=file.name.replace(/\.pdf$/i,'').replace(/[\\/]/g,'_');
          task=pdfjs.getDocument({data:bytes,cMapUrl:asset('vendor/pdfjs/cmaps/'),cMapPacked:true,standardFontDataUrl:asset('vendor/pdfjs/standard_fonts/'),wasmUrl:asset('vendor/pdfjs/wasm/'),isEvalSupported:false,enableXfa:false,useSystemFonts:false,useWorkerFetch:false,BinaryDataFactory:EmbeddedBinaryDataFactory,maxImageSize:16000000});
          documentPDF=await task.promise;if(closed)return;
          const total=documentPDF.numPages,pages=Math.min(total,requested),first=await documentPDF.getPage(1);if(closed)return;
          const unit=first.getViewport({scale:1}),scale=Math.min(1.5,1200/Math.max(unit.width,unit.height),Math.sqrt(1800000/(unit.width*unit.height))),vp=first.getViewport({scale});
          canvas.width=Math.max(1,Math.floor(vp.width));canvas.height=Math.max(1,Math.floor(vp.height));
          renderTask=first.render({canvasContext:canvas.getContext('2d'),viewport:vp,background:'rgb(255,255,255)'});await renderTask.promise;renderTask=null;if(closed)return;
          canvas.style.display='block';imageButton.hidden=false;
          const chunks=[];
          for(let n=1;n<=pages;n++){
            status.textContent=say(`正在擷取第 ${n}/${pages} 頁…`,`Extracting page ${n}/${pages}…`);
            const page=n===1?first:await documentPDF.getPage(n);const content=await page.getTextContent();if(closed)return;
            let pageText='';for(const item of content.items){if(typeof item.str==='string')pageText+=item.str+(item.hasEOL?'\n':' ');}
            chunks.push(`--- ${say('頁','Page')} ${n} ---\n${pageText.trim()}`);
            if(n!==1)page.cleanup();
          }
          text=chunks.join('\n\n');panel.querySelector('[data-pdf-text]').textContent=text;textButton.hidden=false;
          const chars=text.replace(/---[^\n]*---/g,'').trim().length;
          status.textContent=say(`共 ${total} 頁；已繪製第 1 頁、擷取前 ${pages} 頁。${chars?'':'沒有擷取到文字層；掃描檔需要另外 OCR。'}`,`${total} pages; rendered page 1 and extracted the first ${pages}. ${chars?'':'No text layer found; scanned pages require separate OCR.'}`);
          first.cleanup();
        }catch(error){if(!closed)status.textContent=(error.name==='PasswordException')?say('此 PDF 需要密碼；請先解密再載入。','This PDF requires a password; decrypt it before loading.'):say('無法處理：','Unable to process: ')+error.message;}
        finally{if(!closed)run.disabled=false;}
      };
      textButton.onclick=()=>saveBlob(baseName+'-text.txt',new Blob([text],{type:'text/plain;charset=utf-8'}));
      imageButton.onclick=()=>canvas.toBlob(blob=>{if(blob)saveBlob(baseName+'-page1.png',blob);},'image/png');
      status.textContent=`PDF.js ${pdfjs.version} · ${say('等待檔案','Awaiting a file')}`;
    }
  };
})();
