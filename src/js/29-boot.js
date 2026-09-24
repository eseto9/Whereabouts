/* =========================================================
   Boot
   ========================================================= */
async function boot(){
  netInit();cloudInit();
  try{await Promise.race([Promise.all([document.fonts.load('40px "Lilita One"'),document.fonts.load('900 30px Nunito')]),new Promise(r=>setTimeout(r,2500))]);}catch(e){}
  buildGround();buildSky();buildWater();buildClouds();
  buildPlaza();buildMarket();buildHarbor();buildHill();buildPark();buildRoads();
  onResize();
  $('#loading').hidden=true;
  requestAnimationFrame(frame);
}
boot();
window.__wb={spySelect,W,P,get G(){return G;},H,startGame,clickAt,makeLadder,locationLine,letterLine,onMsg,commit,joinRoom,players,frame,districtAt,objCenter,Remote,emit,Wallet,dailyPlan,Daily,Cloud,enableTouch,joy};
