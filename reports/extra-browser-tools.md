# Three.js 與 PDF.js 實際瀏覽器轉接器 / Actual browser adapters

`assets/extra-browser-tools.js` provides `window.renderExtraBrowserTool(id, host, window.OL)` for IDs `threejs` and `pdfjs`. Load this ordinary script with `defer` before `assets/tools.js`; the caller can return its Promise. Libraries are loaded lazily as local classic scripts and are entirely bundled. The original ESM-only implementation has been replaced by classic IIFE bundles for direct-file use.

## 功能 / Features

- **Three.js 0.179.1 (MIT):** `TorusGeometry`, `MeshStandardMaterial`, lighting and `WebGLRenderer` create a real parametric torus. Major/tube radius controls rebuild the geometry; drag and arrow keys rotate it; wireframe, speed, pause and reset are provided. Mobile uses fewer triangles and a lower pixel ratio. Missing WebGL 2 is reported, not replaced with a simulated output.
- **Mozilla PDF.js 5.6.205 (Apache-2.0):** `getDocument`, `getPage`, `render`, and `getTextContent` process a locally selected PDF. The first page is rendered; the first 1–10 pages can be extracted to text. Text and page-one PNG downloads are provided. Local CMaps, standard fonts and image-decoder WASM are bundled. Compatibility/legacy builds are shipped to include JavaScript polyfills. PDF JavaScript is not executed, and PDF contents are not uploaded. Scanned PDFs without a text layer require a separate OCR tool.

## 啟動 / Start

Open the complete package's `index.html` in a browser. These two adapters no longer require an HTTP server: Three.js is a classic bundle; PDF.js uses its standard same-thread worker fallback, with fonts, CMaps and decoder binaries embedded in a classic JavaScript resource. No browser security settings are weakened. A local HTTP server remains optional. Both modules use `OL.ROOT` so they work from the site root or individual application pages. PDF same-thread processing may temporarily occupy the UI for large documents; scans require separate OCR, and color-profile fidelity can differ from a dedicated print-proofing viewer.

## 檢查範圍 / Validation scope

`data/extra-browser-validation.json` records real-library Node checks: Three.js generated and bounded a 2,880-triangle torus; PDF.js loaded a generated PDF, recovered the exact expected text and rendered a 4,398-byte PNG using a native test canvas. `node --check` passed for the adapter. The original browser build exposed an unsupported `Uint8Array.toHex` in the Node test; switching both PDF module and worker to the official legacy builds resolved it without modifying upstream code.

The updated `data/direct-file-libraries-validation.json` records execution of the actual classic scripts in a browser-like VM with **all fetch blocked**: Three.js geometry generation passed; PDF.js loaded a generated document, extracted the expected text and rendered a 3,921-byte PNG with zero fetch calls. The delivery environment did not provide visual browser automation. WebGL display, mobile gestures, OS file-opening associations and download controls have not been visually verified in a browser. The UI states this limitation. This is actual library integration, not a claim of a completed cross-browser test suite.

## 授權與大小 / Licenses and size

Upstream license files are in `vendor/threejs/LICENSE` and `vendor/pdfjs/LICENSE`. PDF.js decoder/font directories also preserve their supplied license notices. Exact versions, source URLs, shipped file hashes and byte counts are appended to `vendor/manifest.json`. The direct-file update retains original modules plus classic bundles and embedded resource copies; the manifest provides exact delivered byte counts.

## Ten further offline workbenches

`assets/browser-workbenches.js` provides `renderOfflineBrowserWorkbench(id, host, OL)` for `fuse`, `yaml`, `diff`, `qrcode`, `uuid`, `ajv`, `decimal`, `fflate`, `dayjs`, and `validator`. A single pinned classic library bundle is stored in `vendor/browser-workbenches/`. A JavaScript-encoded copy starts a self-contained Blob worker with a three-second timeout; it performs no `fetch` or `importScripts`. If a browser blocks Blob workers, the UI reports that limitation. Data never leaves the device.

The adapter kernel source, package manifest, package lock and 44 upstream dependency notices are bundled. `data/browser-additions-validation.json` records successful actual-library tests for all ten tools, including gzip roundtrip and the JSON Schema restriction checks. Schema references, regex patterns and format keywords are not evaluated in the bounded Ajv interface. UUID v4 uses browser cryptographic randomness; Day.js uses UTC only; validator.js checks formats rather than existence or trust.
