export const DAY=86400000,START=Date.UTC(2026,9,9),EXAM=Date.UTC(2026,11,19),FOUNDATION_DAYS=10,PRACTICE_DAYS=20;
export const courses=[
 ['稳态误差',[[17,'稳态误差-终值定理法','23:47'],[18,'稳态误差-静态误差系数法','28:27']]],
 ['根轨迹基础',[[19,'根轨迹的定义','03:52'],[20,'180度与0度根轨迹','09:59'],[21,'幅值条件与相角条件','08:43'],[22,'复变函数','06:02'],[23,'求传递函数的角度-简化版','07:28'],[24,'求传递函数的角度-完整版','18:15']]],
 ['根轨迹绘制',[[25,'根轨迹的绘制','36:41'],[26,'起始角终止角','11:10']]],
 ['频率特性基础',[[27,'频率特性','23:11'],[28,'典型环节的奈氏图','16:24']]],
 ['奈氏图绘制',[[29,'奈氏图绘制','42:29'],[30,'奈氏图与坐标轴交点','09:51']]],
 ['奈奎斯特判据与伯德图基础',[[31,'奈奎斯特稳定判据','30:24'],[32,'伯德图的定义','04:26'],[33,'典型环节伯德图','14:41']]],
 ['伯德图绘制与逆向分析',[[34,'伯德图的绘制','35:06'],[35,'伯德图求传递函数','24:31']]],
 ['稳定裕度与超前校正',[[36,'稳定裕度','25:38'],[37,'超前校正','27:32']]],
 ['滞后校正与离散系统基础',[[38,'滞后校正','20:30'],[39,'Z变换','18:23'],[40,'朱丽判据','15:22']]],
 ['离散系统与综合复习',[[41,'开环脉冲传递函数','16:07'],[42,'离散系统的稳态误差','15:49']]]
];
export const registrations={
 '2026-10-09':{kind:'pre',short:'预报开始',label:'预报名开始',time:'09:00'},'2026-10-12':{kind:'pre',short:'预报结束',label:'预报名结束',time:'22:00'},'2026-10-15':{kind:'formal',short:'正式开始',label:'正式报名开始',time:'09:00'},'2026-10-24':{kind:'formal',short:'正式结束',label:'正式报名结束',time:'22:00'}
};
function spread(parts){return parts.flatMap(([title,days])=>Array.from({length:days},(_,i)=>({title,day:i+1,total:days})))}
const calculus=spread([['积分',2],['多元函数微分',2],['二重积分',3],['微分方程',2]]),algebra=spread([['矩阵',2],['向量',2],['线性方程组',2],['矩阵相似',2],['二次型',2]]);
export const courseSeconds=items=>items.reduce((s,[, ,t])=>{const [m,sec]=t.split(':').map(Number);return s+m*60+sec},0);
export const duration=seconds=>`${Math.floor(seconds/60)}分${String(seconds%60).padStart(2,'0')}秒`;
export const days=Array.from({length:71},(_,i)=>{
 const stamp=START+i*DAY,date=new Date(stamp).toISOString().slice(0,10),phase=i<10?'foundation':i<30?'practice':'open',tasks=[];
 const add=(kind,subject,title,notes='',extra={})=>tasks.push({id:date+':'+kind,date,subject,title,notes,builtin:true,...extra});
 if(phase==='foundation'){
  if(calculus[i]){const p=calculus[i];add('calculus','数学',`880 · ${p.title}`,`高数 · 第 ${p.day} / ${p.total} 天`,{topic:p.title,track:'高数'})}
  const p=algebra[i];add('algebra','数学',`880 · ${p.title}`,`线代 · 第 ${p.day} / ${p.total} 天`,{topic:p.title,track:'线代'});
 }
 if(phase==='practice')for(const [kind,subject]of [['politics','政治'],['english','英语'],['math','数学'],['control','自控']])add(kind,subject,`${2007+i-10} 年${subject}真题 · 1 套`,'每日一整套：政治、英语、数学、自动控制理论。',{year:2007+i-10});
 add('words','英语','背诵 200 个核心单词',`核心词第 ${Math.floor(i/10)+1} 周期 · 第 ${i%10+1}/10 天 · 第 ${i%10*200+1}—${(i%10+1)*200} 词`);
 if(phase==='foundation'&&courses[i]){const [title,lessons]=courses[i],seconds=courseSeconds(lessons);add('control-video','自控',`看课 · ${title}`,`国科大 857 · 第 ${lessons[0][0]}—${lessons.at(-1)[0]} 节 · ${duration(seconds)}`,{lessons,seconds});add('control-notes','自控',`写讲义 · ${title}`,'边看课边完成对应讲义与例题，整理疑问。')}
 return {i,date,stamp,short:date.slice(5).replace('-','.'),phase,phaseDay:phase==='foundation'?i+1:phase==='practice'?i-9:i-29,year:phase==='practice'?2007+i-10:null,event:registrations[date],tasks,calculus:calculus[i]&&i<10?calculus[i]:null,algebra:i<10?algebra[i]:null,course:i<10?courses[i]:null};
});
export const byDate=new Map(days.map(d=>[d.date,d]));
export function todayStamp(now=new Date()){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(x=>[x.type,x.value]));return Date.UTC(+parts.year,+parts.month-1,+parts.day)}
export function tasksFor(day,doc){return [...day.tasks,...doc.customTasks.filter(t=>t.date===day.date&&!doc.deletedTasks.includes(t.id))]}
export function phaseProgress(phase,doc){const set=new Set(doc.checked),rows=days.filter(d=>d.phase===phase),tasks=rows.flatMap(d=>tasksFor(d,doc));return {done:tasks.filter(t=>set.has(t.id)).length,total:tasks.length,daysDone:rows.filter(d=>tasksFor(d,doc).every(t=>set.has(t.id))).length,days:rows.length}}
