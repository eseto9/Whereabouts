/* =========================================================
   Boot
   ========================================================= */
async function boot(){
  netInit();cloudInit();
  try{await Promise.race([Promise.all([document.fonts.load('40px "Lilita One"'),document.fonts.load('900 30px Nunito')]),new Promise(r=>setTimeout(r,2500))]);}catch(e){}
  buildGround();buildSky();buildWater();buildClouds();
  buildPlaza();buildMarket();buildHarbor();buildHill();buildPark();buildFarm();buildOrchard();buildExtras();buildRoads();
  buildCullList();
  onResize();
  $('#loading').hidden=true;
  requestAnimationFrame(frame);
}
boot();
// offline play for the stand-alone web version (never inside Claude)
if(!window.claude&&'serviceWorker' in navigator&&(location.protocol==='https:'||/^(localhost|127\.0\.0\.1)$/.test(location.hostname))){
  addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});
}
window.__wb={spySelect,W,P,get G(){return G;},H,startGame,clickAt,makeLadder,locationLine,letterLine,onMsg,commit,joinRoom,players,frame,districtAt,objCenter,Remote,emit,Wallet,dailyPlan,renderer,GFX,Cull,Daily,Cloud,enableTouch,joy};
