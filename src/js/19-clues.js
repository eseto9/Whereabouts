/* =========================================================
   Clue generator
   ========================================================= */
const DPH={square:'around Town Square',market:'along Market Street',harbor:'down by the Harbor',hill:'up on Hillside',park:'over in the Park',farm:'out on the Farm',orchard:'up in the Orchard',sea:'out on the water'};
function objCenter(o){const b=new THREE.Box3().setFromObject(o.obj);const c=new V3();if(b.isEmpty())o.obj.getWorldPosition(c);else b.getCenter(c);return c;}
function districtAt(x,y,z){
  if(y>18)return 'sky';
  const e=edgeDist(x,z);
  if(e<5.2)return z>28?'harbor':'sea';
  if(Math.hypot(x,z)<17)return 'square';
  if(x>28&&z>14&&z<=30)return 'farm';if(x>28&&z<-14&&z>-30)return 'orchard';
  if(z>28)return 'harbor';if(z<-17)return 'hill';if(x>13)return 'market';if(x<-13)return 'park';
  return 'square';
}
function heightPhrase(c){const g=Math.max(landH(c.x,c.z),-0.45);const r=c.y-g;if(r>3.4)return 'up high';if(r<0.75)return 'down low';return 'around eye level';}
function locationLine(o){
  const c=objCenter(o);const d=districtAt(c.x,c.y,c.z);
  if(d==='sky')return '…look up. Way, way up in the sky.';
  return `…look ${DPH[d]}, ${heightPhrase(c)}.`;
}
function letterLine(o){
  const w=o.k.trim();const first=w[0].toUpperCase();const words=w.split(/\s+/);
  const base=words.length>1?`…it's ${words.length} words, and the first starts with “${first}”`:`…it starts with “${first}” and has ${w.length} letters`;
  return base+(o.mv?'. And it never stays put!':'.');
}
function objSize(o){
  if(o.size==null){const s=new V3();new THREE.Box3().setFromObject(o.obj).getSize(s);o.size=Math.max(s.x,s.y,s.z)||1;}
  return o.size;
}
function ladderFormats(o){
  const f=[];if(o.c&&o.c.length)f.push('classic');if(o.v)f.push('vibe');if(o.snd)f.push('sound');if(o.u)f.push('use');if(o.e)f.push('emoji');if(riddlesOf(o).length)f.push('riddle');
  return f;
}
// what each difficulty prefers when it isn't a riddle
const EASY_FMTS=['classic','vibe','use'],HARD_FMTS=['emoji','sound','use'];
const RIDDLE_SHARE=0.5;   // half the clues in every mode are riddles
/* pref: a format to use (the daily hunt), or a list of formats to prefer (difficulty).
   rnd: the random source (the daily hunt passes a seeded one so everyone gets the same). */
function makeLadder(o,last,pref,rnd){
  rnd=rnd||Math.random;
  const f=ladderFormats(o),rs=riddlesOf(o);
  let fmt;
  if(typeof pref==='string'&&f.includes(pref))fmt=pref;
  else if(rs.length&&rnd()<RIDDLE_SHARE)fmt='riddle';
  else{
    let opts=f.filter(x=>x!=='riddle'&&x!==last);if(!opts.length)opts=f.filter(x=>x!=='riddle');if(!opts.length)opts=f;
    if(Array.isArray(pref)){const p=opts.filter(x=>pref.includes(x));if(p.length)opts=p;}
    fmt=opts[Math.floor(rnd()*opts.length)];
  }
  const col=o.c&&o.c.length?o.c.join(' and '):null;
  const riddle=rs.length?rs[Math.floor(rnd()*rs.length)]:'';
  const l1={classic:`I spy something ${col}…`,vibe:`I spy something that looks ${o.v}…`,sound:`I spy something that goes “${o.snd}”…`,use:`I spy something you could ${o.u}…`,emoji:`I spy… ${o.e}`,riddle}[fmt];
  const facts=[];
  if(fmt!=='classic'&&col)facts.push(`it's ${col}`);
  if(fmt==='classic'&&o.v)facts.push(`it looks ${o.v}`);
  if(o.s)facts.push(`it's ${o.s}`);
  if(o.m&&facts.length<2)facts.push(`it's made of ${o.m}`);
  const l2='…'+facts.slice(0,2).join(', and ')+'.';
  return {fmt,l1,l2};
}
