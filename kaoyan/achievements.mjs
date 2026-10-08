import {days,tasksFor,DAY} from './plan.mjs?v=20261009e';
export function achievements(doc,today){
 const checked=new Set(doc.checked),all=days.flatMap(d=>tasksFor(d,doc)),done=all.filter(t=>checked.has(t.id));
 const complete=d=>tasksFor(d,doc).every(t=>checked.has(t.id));
 const full=days.filter(complete),active=days.filter(d=>d.stamp<=today&&tasksFor(d,doc).some(t=>checked.has(t.id)));
 const stamps=new Set(active.map(d=>d.stamp));let cursor=Math.min(today,days.at(-1).stamp),streak=0;
 if(!stamps.has(cursor))cursor-=DAY;
 while(stamps.has(cursor)){streak++;cursor-=DAY}
 const words=done.filter(t=>t.id.endsWith(':words')).length*200,papers=done.filter(t=>t.builtin&&t.year).length;
 const lessons=done.reduce((n,t)=>n+(t.lessons?.length||0),0),math=done.filter(t=>t.builtin&&t.track).length;
 const cycles=Array.from({length:7},(_,i)=>days.slice(i*10,i*10+10).every(d=>checked.has(d.date+':words'))).filter(Boolean).length;
 const base=days.filter(d=>d.phase==='foundation').filter(complete).length,practice=days.filter(d=>d.phase==='practice').filter(complete).length;
 const badges=[['first','第一步已落地',done.length,1,'完成第一项任务'],['ten','十次兑现',done.length,10,'累计完成 10 项任务'],['day','一天圆满',full.length,1,'完成任意一天全部任务'],['words','核心词一轮',cycles,1,'完成任意一个完整单词周期'],['base','基础筑成',base,10,'基础阶段 10 天全部完成'],['papers','二十年走完',practice,20,'真题阶段 20 天全部完成']].map(([id,title,value,target,note])=>({id,title,value,target,note,earned:value>=target}));
 return {total:done.length,fullDays:full.length,activeDays:active.length,streak,words,papers,lessons,math,badges};
}
