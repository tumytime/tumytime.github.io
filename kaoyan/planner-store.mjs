const ROOT='https://api.github.com/repos/tumytime/tumytime.github.io/contents/kaoyan/logs/';
const FILE='planner-v3.json', LOCAL='kaoyan-planner-v3', QUEUE='kaoyan-planner-queue-v3', TOKEN='exam-days-auto-token-v1';
const customID=/^custom:[a-f0-9-]{36}$/;
const dateOK=d=>{if(typeof d!=='string'||!/^2026-\d{2}-\d{2}$/.test(d)||d<'2026-10-09'||d>='2026-12-19')return false;const stamp=Date.parse(d+'T00:00:00Z');return Number.isFinite(stamp)&&new Date(stamp).toISOString().slice(0,10)===d};
const checkOK=id=>/^(2026-\d{2}-\d{2}:[a-z-]+|custom:[a-f0-9-]{36})$/.test(id);
const subjects=['数学','英语','自控','政治','其他'];
export function emptyDocument(){return {version:3,savedAt:null,checked:[],customTasks:[],deletedTasks:[],legacyChecked:[]}}
export function validateTask(t){
 if(!t||!customID.test(t.id)||!dateOK(t.date)||typeof t.title!=='string'||!t.title.trim()||t.title.length>160||typeof t.notes!=='string'||t.notes.length>2000||!subjects.includes(t.subject)||!Number.isFinite(Date.parse(t.createdAt)))throw new Error('任务数据格式不正确，已保留原记录。');
 return {id:t.id,date:t.date,title:t.title.trim(),notes:t.notes,subject:t.subject,createdAt:t.createdAt};
}
export function validateDocument(d){
 if(!d||d.version!==3||d.savedAt!==null&&!Number.isFinite(Date.parse(d.savedAt))||!Array.isArray(d.checked)||!Array.isArray(d.customTasks)||!Array.isArray(d.deletedTasks)||!Array.isArray(d.legacyChecked)||d.customTasks.length>2000||d.checked.length>5000||d.deletedTasks.length>10000||d.legacyChecked.length>1000)throw new Error('仓库数据格式不正确，已停止同步以保护记录。');
 if(d.checked.some(k=>typeof k!=='string'||!checkOK(k))||d.deletedTasks.some(k=>!customID.test(k))||d.legacyChecked.some(k=>typeof k!=='string'||k.length>100))throw new Error('仓库记录包含无效的任务编号。');
 const tasks=d.customTasks.map(validateTask);if(new Set(tasks.map(t=>t.id)).size!==tasks.length)throw new Error('仓库任务编号重复。');
 return {version:3,savedAt:d.savedAt,checked:[...new Set(d.checked)].sort(),customTasks:tasks.sort((a,b)=>a.id.localeCompare(b.id)),deletedTasks:[...new Set(d.deletedTasks)].sort(),legacyChecked:[...new Set(d.legacyChecked)].sort()};
}
export function mergeDocument(base,pending){
 const d=validateDocument(base),tasks=new Map(d.customTasks.map(t=>[t.id,t])),deleted=new Set(d.deletedTasks),checks=new Set(d.checked);
 for(const [id,task]of Object.entries(pending.tasks||{})){if(task===null){tasks.delete(id);deleted.add(id);checks.delete(id)}else if(!deleted.has(id))tasks.set(id,validateTask(task))}
 for(const [id,done]of Object.entries(pending.checks||{}))if(checkOK(id)&&(!id.startsWith('custom:')||tasks.has(id))&&!deleted.has(id)){done?checks.add(id):checks.delete(id)}
 for(const id of deleted){tasks.delete(id);checks.delete(id)}
 return {...d,checked:[...checks].sort(),customTasks:[...tasks.values()].sort((a,b)=>a.id.localeCompare(b.id)),deletedTasks:[...deleted].sort()};
}
const payload=d=>JSON.stringify({...d,savedAt:null});
export class PlannerStore{
 constructor({storage,fetcher=(...args)=>fetch(...args),onChange=()=>{},onStatus=()=>{}}){
  this.storage=storage;this.fetcher=fetcher;this.onChange=onChange;this.onStatus=onStatus;this.doc=emptyDocument();this.pending={checks:{},tasks:{}};this.token='';this.running=false;this.generation=0;this.retryDelay=5000;this.halted=false;this.error='';this.timer=null;this.storageFailed=false;
  try{const raw=storage.getItem(LOCAL);if(raw)this.doc=validateDocument(JSON.parse(raw));const q=JSON.parse(storage.getItem(QUEUE)||'{}');for(const[k,v]of Object.entries(q.checks||{}))if(checkOK(k)&&typeof v==='boolean')this.pending.checks[k]=v;for(const[k,v]of Object.entries(q.tasks||{}))if(customID.test(k)&&(v===null||validateTask(v).id===k))this.pending.tasks[k]=v;this.token=storage.getItem(TOKEN)||'';const old=JSON.parse(storage.getItem('exam-days-checks-v1')||'{}');this.doc.legacyChecked=[...new Set([...this.doc.legacyChecked,...Object.keys(old).filter(k=>old[k]===true)])].sort()}catch{this.error='部分本机数据无法读取，原始记录未删除。'}
  this.doc=mergeDocument(this.doc,this.pending);
 }
 status(){this.onStatus({connected:!!this.token,running:this.running,pending:Object.keys(this.pending.checks).length+Object.keys(this.pending.tasks).length,savedAt:this.doc.savedAt,error:this.error,storageFailed:this.storageFailed})}
 persist(){try{this.storage.setItem(LOCAL,JSON.stringify(this.doc));this.storage.setItem(QUEUE,JSON.stringify(this.pending));this.storageFailed=false}catch{this.storageFailed=true}}
 emit(){this.onChange(this.doc);this.status()}
 edit(id,done){if(!checkOK(id))return;this.pending.checks[id]=!!done;this.doc=mergeDocument(this.doc,this.pending);this.persist();this.emit();this.schedule()}
 addTask(task){task=validateTask(task);this.pending.tasks[task.id]=task;this.doc=mergeDocument(this.doc,this.pending);this.persist();this.emit();this.schedule()}
 deleteTask(id){if(!customID.test(id))return;this.pending.tasks[id]=null;delete this.pending.checks[id];this.doc=mergeDocument(this.doc,this.pending);this.persist();this.emit();this.schedule()}
 schedule(delay=1200){clearTimeout(this.timer);if(this.token&&!this.halted)this.timer=setTimeout(()=>this.sync(),delay)}
 disconnect(){this.generation++;this.token='';this.error='';this.halted=false;clearTimeout(this.timer);try{this.storage.removeItem(TOKEN)}catch{}this.status()}
 async connect(value,remember){if(this.running)throw new Error('正在同步，请稍后再试。');if(!/^github_pat_[A-Za-z0-9_]+$/.test(value.trim()))throw new Error('授权格式不正确。');this.token=value.trim();this.generation++;this.halted=false;const ok=await this.sync(true);if(!ok){this.token='';this.status();throw new Error(this.error||'连接失败')}try{remember?this.storage.setItem(TOKEN,this.token):this.storage.removeItem(TOKEN)}catch{this.error='已连接，但当前浏览器无法记住授权。';this.status()}}
 async request(method,body,file=FILE){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);let response;
  try{response=await this.fetcher(ROOT+file+(method==='GET'?'?ref=main':''),{method,cache:'no-store',signal:controller.signal,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+this.token,'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})})}catch{throw new Error('网络暂时不可用，联网后会自动重试。')}finally{clearTimeout(timeout)}
  if(response.status===404&&method==='GET')return null;
  if(!response.ok){const error=new Error(response.status===401?'授权已过期，请重新连接。':response.status===403?'GitHub 暂时拒绝访问，请稍后重试或检查授权。':response.status===404?'没有仓库写入权限。':[409,422].includes(response.status)?'记录刚被其他设备更新，正在重新合并。':'GitHub 暂时无法保存，稍后自动重试。');error.code=response.status;throw error}
  return response.json();
 }
 decode(file){return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0))))}
 async sync(force=false){
  if(!this.token||this.running||this.halted&&!force)return false;
  clearTimeout(this.timer);this.running=true;this.halted=false;this.error='';this.status();const generation=this.generation;let success=false;
  try{for(let attempt=0;attempt<4;attempt++){
   const file=await this.request('GET');if(generation!==this.generation)return false;
   let base=file?validateDocument(this.decode(file)):emptyDocument();
   if(!file){const old=await this.request('GET',null,'auto-checkins.json');if(old){const raw=this.decode(old);if(Array.isArray(raw.checked))base.legacyChecked=raw.checked.filter(k=>typeof k==='string'&&k.length<100)}}
   const originalPayload=payload(base);base.legacyChecked=[...new Set([...base.legacyChecked,...this.doc.legacyChecked])].sort();
   const edits=JSON.parse(JSON.stringify(this.pending)),merged=mergeDocument(base,edits),changed=!file||payload(merged)!==originalPayload;
   if(changed){merged.savedAt=new Date().toISOString();const bytes=new TextEncoder().encode(JSON.stringify(merged,null,2)+'\n');let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);try{await this.request('PUT',{message:'Save kaoyan tasks and progress '+merged.savedAt,branch:'main',content:btoa(binary),...(file?{sha:file.sha}:{})})}catch(error){if([409,422].includes(error.code)&&attempt<3)continue;throw error}}
   if(generation!==this.generation)return false;
   for(const group of ['checks','tasks'])for(const[k,v]of Object.entries(edits[group]))if(JSON.stringify(this.pending[group][k])===JSON.stringify(v))delete this.pending[group][k];
   this.doc=mergeDocument(merged,this.pending);this.persist();this.retryDelay=5000;success=true;this.onChange(this.doc);break;
  }}catch(error){this.error=error.message;this.halted=[401,403,404].includes(error.code)||!error.code&&!/网络|暂时/.test(error.message);if(!this.halted){this.schedule(this.retryDelay);this.retryDelay=Math.min(this.retryDelay*2,60000)}}finally{this.running=false;this.status();if(success&&(Object.keys(this.pending.checks).length||Object.keys(this.pending.tasks).length))this.schedule()}
  return success;
 }
}
