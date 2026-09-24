/* ---------- sky, water, foam, clouds ---------- */
function buildSky(){
  const g=new THREE.SphereGeometry(900,32,16);
  const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
    uniforms:{sunDir:{value:SUN_DIR}},
    vertexShader:`varying vec3 vd;void main(){vd=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform vec3 sunDir;varying vec3 vd;void main(){
      float h=vd.y;
      vec3 top=vec3(0.33,0.52,0.98), mid=vec3(0.62,0.80,1.0), hor=vec3(1.0,0.83,0.64), low=vec3(1.0,0.72,0.55);
      vec3 c=mix(hor,mid,smoothstep(0.0,0.22,h)); c=mix(c,top,smoothstep(0.22,0.8,h)); c=mix(low,c,smoothstep(-0.2,0.02,h));
      float s=max(dot(vd,normalize(sunDir)),0.);
      c+=vec3(1.0,0.75,0.45)*pow(s,8.)*0.35+vec3(1.,0.95,0.8)*smoothstep(0.9975,0.999,s);
      gl_FragColor=vec4(c,1.);}`});
  const sky=new THREE.Mesh(g,m); sky.renderOrder=-1; scene.add(sky); W.sky=sky;
}
let waterMat;
function buildWater(){
  waterMat=new THREE.ShaderMaterial({fog:false,
    uniforms:{t:{value:0},fogC:{value:HORIZON}},
    vertexShader:`varying vec3 wp;void main(){vec4 w=modelMatrix*vec4(position,1.);wp=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`uniform float t;uniform vec3 fogC;varying vec3 wp;void main(){
      vec3 deep=vec3(0.13,0.52,0.78), light=vec3(0.33,0.78,0.90), shal=vec3(0.52,0.90,0.90);
      float w=sin(wp.x*0.16+t*0.8)+sin(wp.z*0.19-t*0.6)+0.8*sin((wp.x+wp.z)*0.11+t*0.45);
      vec3 c=mix(deep,light,smoothstep(0.7,1.25,w));
      float d=length(wp.xz);
      c=mix(c,shal,smoothstep(95.,58.,d)*0.75);
      float sp=step(2.35,w+0.55*sin(wp.x*1.4+t*2.1)*sin(wp.z*1.2-t*1.7));
      c=mix(c,vec3(1.),sp*0.85);
      float f=smoothstep(140.,560.,distance(wp,cameraPosition));
      gl_FragColor=vec4(mix(c,fogC,f),1.);}`});
  const w=new THREE.Mesh(new THREE.PlaneGeometry(1600,1600,1,1),waterMat);
  w.rotation.x=-Math.PI/2; w.position.y=-0.45; scene.add(w); W.water=w;
  // foam ring hugging the shoreline
  const pos=[],idx=[]; const N=220;
  for(let i=0;i<N;i++){const a=i/N*TAU, r=shoreR(a)-5.15;
    for(const o of[-0.5,0.9]){pos.push(Math.cos(a)*(r+o),-0.4,Math.sin(a)*(r+o));}}
  for(let i=0;i<N;i++){const a=i*2,b=((i+1)%N)*2;idx.push(a,b,a+1,b,b+1,a+1);}
  const fg=new THREE.BufferGeometry(); fg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); fg.setIndex(idx);
  const foam=new THREE.Mesh(fg,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.6,side:THREE.DoubleSide,depthWrite:false}));
  scene.add(foam); W.foam=foam;
}
function buildClouds(){
  for(let i=0;i<14;i++){
    const g=new THREE.Group(); const n=4+Math.floor(srand()*4);
    for(let k=0;k<n;k++){const s=sph(sr(3,6),'#FFFFFF',8,6,{w:0.25,shadow:false});s.position.set(k*3.2-n*1.6,sr(-0.5,1.5),sr(-1.5,1.5));s.scale.y=0.7;g.add(s);}
    const a=srand()*TAU, r=sr(40,140); g.position.set(Math.cos(a)*r,sr(48,70),Math.sin(a)*r);
    g.userData.v=sr(0.6,1.4);
    F(g,{k:'cloud',n:'a cloud',c:['white'],s:'puffy',m:'fluff',p:false});
    W.movers.push((t,dt)=>{g.position.x+=g.userData.v*dt;if(g.position.x>190)g.position.x=-190;});
  }
}

/* keyframe path helper: [{p:[x,y,z],d:seconds,hop:height}] loops forever */
function loopPath(keys){
  const total=keys.reduce((s,k)=>s+k.d,0);
  return function(t,out){
    let u=((t%total)+total)%total;
    for(let i=0;i<keys.length;i++){
      const k=keys[i];
      if(u<=k.d||i===keys.length-1){
        const n=keys[(i+1)%keys.length]; const f=k.d>0?Math.min(1,u/k.d):1;
        out.set(lerp(k.p[0],n.p[0],f),lerp(k.p[1],n.p[1],f)+(k.hop?k.hop*Math.sin(Math.PI*f):0),lerp(k.p[2],n.p[2],f));
        return {dx:n.p[0]-k.p[0],dz:n.p[2]-k.p[2],moving:(n.p[0]!==k.p[0]||n.p[2]!==k.p[2]),f};
      }
      u-=k.d;
    }
  };
}
function onGround(obj,x,z,yo){obj.position.set(x,landH(x,z)+(yo||0),z);return obj;}

