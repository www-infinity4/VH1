(function(root){
"use strict";
const SLOT_SECONDS=300,SLOTS_PER_DAY=288;
function pad(n){return String(n).padStart(2,"0")}
function dateKey(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function weekKey(d){const local=new Date(d.getFullYear(),d.getMonth(),d.getDate());const day=(local.getDay()+6)%7;local.setDate(local.getDate()-day);return dateKey(local)}
function hash(text){let value=2166136261;for(let i=0;i<text.length;i++)value=Math.imul(value^text.charCodeAt(i),16777619);return value>>>0}
function shuffled(items,seedText){const copy=items.slice();let seed=hash(seedText);const rnd=()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};for(let i=copy.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
function midnightMs(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0,0).getTime()}
function scheduleFor(now,catalog,channelId,failed){const day=dateKey(now),week=weekKey(now),start=midnightMs(now),usable=catalog.filter(x=>x&&x.videoId&&!failed.has(x.videoId)&&Number(x.durationSeconds)>0&&Number(x.durationSeconds)<=SLOT_SECONDS);if(!usable.length)throw new Error("No playable music videos are available.");const result=[];let previous="";for(let cycle=0;result.length<SLOTS_PER_DAY;cycle++){let batch=shuffled(usable,`${channelId}|${week}|${day}|cycle:${cycle}`);if(batch.length>1&&batch[0].videoId===previous)batch.push(batch.shift());for(const video of batch){if(result.length>=SLOTS_PER_DAY)break;const index=result.length,startsAtMs=start+index*SLOT_SECONDS*1000;result.push({id:`${day}-${pad(index)}`,index,video,startsAtMs,endsAtMs:startsAtMs+SLOT_SECONDS*1000});previous=video.videoId}}return result}
function resolve(nowMs,schedule){const start=schedule[0].startsAtMs;let index=Math.floor((nowMs-start)/(SLOT_SECONDS*1000));index=Math.max(0,Math.min(schedule.length-1,index));const slot=schedule[index],elapsed=Math.max(0,Math.min(SLOT_SECONDS-1,Math.floor((nowMs-slot.startsAtMs)/1000)));return{slot,index,elapsed,kind:"video",mediaSeconds:elapsed,remaining:SLOT_SECONDS-elapsed,intermissionRemaining:Math.max(0,SLOT_SECONDS-elapsed),videoRemaining:Math.max(0,SLOT_SECONDS-elapsed)}}
root.MusicTVEngine={SLOT_SECONDS,SLOTS_PER_DAY,dateKey,weekKey,scheduleFor,resolve};
})(window);