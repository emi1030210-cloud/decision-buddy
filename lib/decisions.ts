export type Food={name:string;price:number;convenience:number;health:number;craving:number}
export type Weights={budget:number;health:number;convenience:number;craving:number}
export function scoreFood(food:Food,w:Weights){const priceScore=Math.max(1,6-food.price);const total=w.budget+w.health+w.convenience+w.craving;return Math.round((priceScore*w.budget+food.health*w.health+food.convenience*w.convenience+food.craving*w.craving)/(total*5)*100)}
export type BuyAnswers={owns:number;condition:number;wanted:number;usage:number;pain:number;reason:number}
export function scoreBuy(a:BuyAnswers){const score=a.owns+a.condition+a.wanted+a.usage+a.reason-a.pain;return {score,verdict:score>=12?'BUY IT':score>=6?'WAIT 7 DAYS':"MAYBE DON'T."}}
export type Task={name:string;deadline:number;duration:number;importance:number;energy:number}
export function rankTasks(tasks:Task[],available:number){return [...tasks].map(t=>({...t,score:(6-Math.min(t.deadline,5))*3+t.importance*3+(t.duration<=available?3:-2)+(6-t.energy)})).sort((a,b)=>b.score-a.score)}
export function compare(options:string[],criteria:{name:string;weight:number;ratings:number[]}[]){const max=criteria.reduce((s,c)=>s+c.weight*5,0);return options.map((name,i)=>({name,score:Math.round(criteria.reduce((s,c)=>s+c.weight*c.ratings[i],0)/max*100)})).sort((a,b)=>b.score-a.score)}
