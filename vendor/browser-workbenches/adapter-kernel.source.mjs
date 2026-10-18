import Fuse from 'fuse.js';
import yaml from 'js-yaml';
import {diffLines} from 'diff';
import QRCode from 'qrcode';
import {v4,validate as uuidValidate,version as uuidVersion} from 'uuid';
import Ajv from 'ajv';
import Decimal from 'decimal.js';
import * as fflate from 'fflate';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import validator from 'validator';
dayjs.extend(utc);dayjs.extend(customParseFormat);
const text=(x,max=100000)=>{x=String(x??'');if(x.length>max)throw Error('Input exceeds '+max+' characters');return x;};
const json=x=>JSON.parse(text(x));
const output=(value,name='result.txt')=>({kind:'text',text:typeof value==='string'?value:JSON.stringify(value,null,2),name});
const schemaGuard=(x,depth=0)=>{if(depth>20)throw Error('Schema depth exceeds 20');if(!x||typeof x!=='object')return;for(const [k,v]of Object.entries(x)){if(['pattern','patternProperties','$ref','$dynamicRef'].includes(k))throw Error(k+' is disabled in this bounded offline workbench');schemaGuard(v,depth+1);}};
export async function run(id,p){
  switch(id){
  case 'fuse':{const docs=json(p.input);if(!Array.isArray(docs)||docs.length>2000)throw Error('Use a JSON array with at most 2,000 items');const keys=text(p.keys||'title,description',200).split(',').map(s=>s.trim()).filter(Boolean);const threshold=Number(p.threshold??.35);if(!Number.isFinite(threshold)||threshold<0||threshold>1)throw Error('Threshold must be 0–1');const fuse=new Fuse(docs,{keys,includeScore:true,threshold,ignoreLocation:true});return output(fuse.search(text(p.query,200),{limit:30}),'search-results.json');}
  case 'yaml':{if(p.operation==='json-to-yaml')return output(yaml.dump(json(p.input),{noRefs:true,lineWidth:90}),'converted.yaml');return output(yaml.load(text(p.input),{schema:yaml.JSON_SCHEMA}),'converted.json');}
  case 'diff':{const left=text(p.input,20000),right=text(p.second,20000);const changes=diffLines(left,right,{timeout:1000,maxEditLength:2000});if(!changes)throw Error('Comparison exceeded the bounded diff budget');return {kind:'diff',changes,text:changes.map(c=>c.value.split('\n').map(l=>(c.added?'+':c.removed?'-':' ')+l).join('\n')).join('\n'),name:'comparison.diff'};}
  case 'qrcode':{const value=text(p.input,1500);if(!value)throw Error('Enter text or a URL');const svg=await QRCode.toString(value,{type:'svg',errorCorrectionLevel:p.level||'M',margin:4,width:320});return {kind:'svg',svg,text:value,name:'qrcode.svg'};}
  case 'uuid':{if(p.operation==='validate'){const s=text(p.input,100).trim();return output({value:s,valid:uuidValidate(s),version:uuidValidate(s)?uuidVersion(s):null},'uuid-validation.json');}const count=Number(p.count||5);if(!Number.isInteger(count)||count<1||count>100)throw Error('Count must be 1–100');return output(Array.from({length:count},()=>v4()).join('\n'),'uuid-v4.txt');}
  case 'ajv':{const schema=JSON.parse(text(p.second,15000));schemaGuard(schema);const validate=new Ajv({allErrors:true,strict:true,validateFormats:false,ownProperties:true}).compile(schema);const valid=validate(json(p.input));return output({valid,errors:validate.errors||[],dialect:'JSON Schema draft-07 subset; $ref, patterns and formats are not evaluated'},'schema-validation.json');}
  case 'decimal':{const D=Decimal.clone({precision:Math.max(5,Math.min(100,Number(p.precision)||40))});const a=new D(text(p.input,200)),b=new D(text(p.second,200));const methods={add:'plus',subtract:'minus',multiply:'times',divide:'div',power:'pow'};if(!methods[p.operation])throw Error('Unknown operation');if(p.operation==='power'&&(!b.isInteger()||b.abs().gt(1000)))throw Error('Power exponent must be an integer within ±1000');const value=a[methods[p.operation]](b);if(!value.isFinite())throw Error('Result is not finite');return output({result:value.toString(),precision:D.precision,operation:p.operation},'decimal-result.json');}
  case 'fflate':{if(p.operation==='decompress'){const bytes=new Uint8Array(p.bytes||[]);if(bytes.length<18||bytes.length>2*1024*1024||bytes[0]!==31||bytes[1]!==139)throw Error('Use a gzip file up to 2 MiB');const size=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(bytes.length-4,true);if(size>8*1024*1024)throw Error('Expanded text limit: 8 MiB');const out=fflate.gunzipSync(bytes);if(out.length>8*1024*1024)throw Error('Expanded text limit exceeded');return output(fflate.strFromU8(out),'decompressed.txt');}const bytes=fflate.strToU8(text(p.input,1000000));const zipped=fflate.gzipSync(bytes,{level:6});return {kind:'binary',bytes:zipped,text:JSON.stringify({inputBytes:bytes.length,gzipBytes:zipped.length,ratio:bytes.length?zipped.length/bytes.length:0},null,2),name:'text.txt.gz',mime:'application/gzip'};}
  case 'dayjs':{const first=dayjs.utc(text(p.input,40),'YYYY-MM-DD HH:mm:ss',true),second=dayjs.utc(text(p.second,40),'YYYY-MM-DD HH:mm:ss',true);if(!first.isValid()||!second.isValid())throw Error('Use valid UTC timestamps YYYY-MM-DD HH:mm:ss');const days=Number(p.days||0);if(!Number.isFinite(days)||Math.abs(days)>365000)throw Error('Days must be within ±365000');return output({firstUTC:first.toISOString(),secondUTC:second.toISOString(),differenceSeconds:second.diff(first,'second'),differenceDays:second.diff(first,'day',true),firstPlusDays:first.add(days,'day').toISOString()},'date-calculation.json');}
  case 'validator':{const values=text(p.input,20000).split(/\r?\n/).filter(Boolean);if(values.length>500)throw Error('Maximum 500 lines');return output(values.map(value=>({value,isEmail:validator.isEmail(value),isURL:validator.isURL(value,{require_protocol:true,protocols:['http','https'],allow_underscores:false}),isIP:validator.isIP(value),isISO8601:validator.isISO8601(value,{strict:true}),isNumeric:validator.isNumeric(value)})),'validation.json');}
  default:throw Error('Unknown tool: '+id);
  }
}
