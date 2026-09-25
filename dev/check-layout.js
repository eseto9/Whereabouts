// Dev helper: in the console on a dev page, run `await checkLayout()` to list buttons that
// something else covers (on the title screen, in the lobby, in the shop and during a clue).
window.checkLayout = async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const $ = s => document.querySelector(s);
  const covered = (except) => {
    const out = [];
    for (const el of document.querySelectorAll('#hud button, #hud input, #title button, #title input')) {
      if (except && except(el)) continue;
      if (el.closest('[hidden]') || el.offsetParent === null) continue;
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (r.width < 2 || x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
      let p = el.parentElement, scrolledAway = false;
      while (p) { if (/(auto|scroll)/.test(getComputedStyle(p).overflowY)) { const pr = p.getBoundingClientRect(); if (y < pr.top || y > pr.bottom) scrolledAway = true; } p = p.parentElement; }
      if (scrolledAway) continue;
      const hit = document.elementFromPoint(x, y);
      if (hit !== el && !el.contains(hit)) out.push(`${el.id || el.textContent.trim().slice(0, 20)} ← ${hit ? hit.id || hit.className || hit.tagName : '?'}`);
    }
    return out;
  };
  const inHud = el => !!el.closest('#hud');
  const res = { size: innerWidth + 'x' + innerHeight, title: covered() };
  if (!window.__wb || !__wb.P.bean) { $('#nameIn').value ||= 'Tester'; $('#createBtn').click(); await wait(800); }
  $('#lobby').scrollTop = 0; res.lobby = covered();
  $('#lobby').scrollTop = 1e5; res.lobbyScrolled = covered();
  $('#coinBtn').click(); await wait(300);
  $('#title').scrollTop = 0; res.shopTop = covered(inHud);
  $('#title').scrollTop = 1e5; res.shopBottom = covered(inHud);
  $('#doneBtn').click(); await wait(200);
  return res;
};

// dev only: park the camera anywhere and draw one frame, e.g. view(0,150,1, 0,0,0, 60)
window.view=(x,y,z,lx,ly,lz,fov)=>{
  window.__camHold=1;
  for(const e of document.querySelectorAll('#title,#hud,#lobby,.panel'))e.style.visibility='hidden';
  const c=__wb.camera;c.position.set(x,y,z);c.fov=fov||55;c.updateProjectionMatrix();c.lookAt(lx,ly,lz);
  __wb.renderer.render(__wb.scene,c);return 'ok';
};
// dev only: view() plus a copy of the frame pinned to the top-left quarter (the preview pane's
// screenshots sometimes only show that quarter of a WebGL canvas)
window.snap=(...a)=>{
  view(...a);const src=document.querySelector('#c');const c=document.createElement('canvas');c.width=src.width/2;c.height=src.height/2;
  c.getContext('2d').drawImage(src,0,0,c.width,c.height);
  let im=document.getElementById('snapimg');
  if(!im){im=document.createElement('img');im.id='snapimg';im.style.cssText='position:fixed;left:0;top:0;width:50vw;height:50vh;z-index:99999;pointer-events:none';document.body.appendChild(im);}
  im.src=c.toDataURL();return 'ok';
};
// dev only: render a view and save it as dev/.shots/<name>.png through the dev server
window.shot=async(name,...a)=>{view(...a);const u=document.querySelector('#c').toDataURL('image/png');await fetch('/__shot?name='+name,{method:'POST',body:u});return name;};
