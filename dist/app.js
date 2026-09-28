const $=s=>document.querySelector(s);
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const chapters=[...document.querySelectorAll('.chapter')];
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
// Each pose is anchored to a real content chapter. Scroll is never intercepted.
const poses=[
 {x:.5,y:.76,scale:.76,yaw:-.4,tilt:.02,solid:1,explode:0,open:0},
 {x:.27,y:.02,scale:1.18,yaw:.55,tilt:.035,solid:0,explode:0,open:0},
 {x:.74,y:0,scale:1.27,yaw:-.45,tilt:.025,solid:1,explode:0,open:0},
 {x:.27,y:0,scale:1.12,yaw:.65,tilt:.025,solid:1,explode:0,open:0},
 {x:.74,y:0,scale:1.03,yaw:-.28,tilt:.035,solid:1,explode:.05,open:1},
 {x:.27,y:.04,scale:.89,yaw:.35,tilt:.08,solid:1,explode:1,open:1},
 {x:.74,y:0,scale:.95,yaw:-.23,tilt:.04,solid:1,explode:.4,open:.8},
 {x:.27,y:0,scale:1.12,yaw:.38,tilt:.025,solid:1,explode:0,open:0},
 {x:.5,y:.05,scale:1.08,yaw:-.2,tilt:0,solid:1,explode:0,open:0}
];
let state={...poses[0]},renderScene=()=>{},scheduled=false;
function updateStory(){
 scheduled=false;
 const vh=innerHeight, sy=scrollY, narrow=innerWidth<=700;
 let index=0;
 for(let i=0;i<chapters.length;i++)if(sy>=chapters[i].offsetTop)index=i;
 const start=chapters[index].offsetTop;
 const end=chapters[index+1]?.offsetTop ?? document.querySelector('footer').offsetTop;
 const local=clamp((sy-start)/Math.max(1,end-start));
 const next=Math.min(index+1,poses.length-1);
 const t=smooth(.18,.9,local), a=poses[index], b=poses[next];
 for(const key of Object.keys(a))state[key]=a[key]+(b[key]-a[key])*t;
 if(motionPreference.matches)state={...poses[index]};
 const mobileTop=i=>i===chapters.length-1?vh*.48:Math.max(100,Math.min(vh*.44,vh-98-chapters[i].querySelector('.chapter-copy').offsetHeight));
 state.mobileTop=mobileTop(index)+(mobileTop(next)-mobileTop(index))*t;
 for(const chapter of chapters){
  const r=chapter.getBoundingClientRect(), copy=chapter.querySelector('.chapter-copy');
  if(!chapter.classList.contains('final-chapter')&&!motionPreference.matches)copy.style.top=`${narrow?Math.max(100,Math.min(vh*.44,vh-98-copy.offsetHeight)):Math.max(100,Math.min(vh*.22,vh-65-copy.offsetHeight))}px`;
  else copy.style.removeProperty('top');
  if(chapter.id==='intro'&&!narrow&&!motionPreference.matches)copy.style.top=`${Math.max(vh*.5,vh-copy.offsetHeight-42)}px`;
  const enter=1-smooth(vh*.3,vh*.92,r.top);
  // Keep tall interactive chapters readable until they leave the viewport.
  const exit=chapter.classList.contains('final-chapter')?1:smooth(vh*.15,vh*.72,r.bottom);
  const alpha=motionPreference.matches?1:enter*exit;
  copy.style.opacity=alpha;
  copy.style.transform=motionPreference.matches?'none':`translateY(${(1-enter)*48-(1-exit)*30}px)`;
  copy.style.pointerEvents=alpha>.06?'auto':'none';
  copy.inert=alpha<.025;
 }
 const labelIndex=t>.6?Math.min(index+1,chapters.length-1):index;
 $('#view-name').textContent=chapters[labelIndex].dataset.view;
 $('.blueprint-grid').style.opacity=(1-state.solid)*.38;
 $('.world-word').style.opacity=0;
 $('#scene').style.opacity=index===poses.length-1?(narrow?.25:.24):1-smooth(.3,.95,index===poses.length-2?local:0)*.76;
 $('.story-progress span').style.transform=`scaleX(${clamp(sy/Math.max(1,document.documentElement.scrollHeight-vh))})`;
 $('#scene').dataset.chapter=String(index);
 $('#scene').dataset.pose=JSON.stringify(state);
 renderScene();
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(updateStory);}}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
motionPreference.addEventListener('change',schedule);
new ResizeObserver(schedule).observe(document.querySelector('main'));
// An anchor remains usable even when its text chapter was faded out.
addEventListener('hashchange',schedule);
document.addEventListener('toggle',schedule,true);
updateStory();
const fields=['product','quantity','city','deadline'];function brief(){return 'Здравствуйте! Прошу рассчитать партию мебели.\n'+['Изделие','Количество','Город поставки','Желаемый срок'].map((s,i)=>s+': '+($('#'+fields[i]).value.trim()||'уточним')).join('\n')+'\nРаботаем как ЮЛ/ИП. Минимальный заказ от 300 000 ₽.';}function email(){ $('#email-brief').href='mailto:optmebelug@mail.ru?subject='+encodeURIComponent('Расчёт партии мебели')+'&body='+encodeURIComponent(brief());}fields.forEach(id=>$('#'+id).addEventListener('input',email));email();document.querySelectorAll('[data-interest]').forEach(a=>a.addEventListener('click',()=>{$('#product').value=a.dataset.interest;email();}));$('#copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(brief());$('#brief-status').textContent='Запрос скопирован. Вставьте его в Telegram.';}catch{$('#brief-status').textContent='Копирование недоступно. Используйте «Отправить по email».';}});
async function init(){try{const T=await import('./assets/three.module.js');const host=$('#scene'),scene=new T.Scene(),camera=new T.OrthographicCamera(-4,4,2.3,-2.3,.1,100);const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0x000000,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;host.appendChild(renderer.domElement);$('.fallback')?.remove();scene.add(new T.HemisphereLight(0xdce7ff,0x131116,1.25));const light=new T.DirectionalLight(0xfff1df,4.5);light.position.set(-3,5,4);scene.add(light);const rim=new T.DirectionalLight(0x9cbfff,3.2);rim.position.set(4,1,-2);scene.add(rim);const fill=new T.DirectionalLight(0xffffff,.8);fill.position.set(0,1,5);scene.add(fill);const root=new T.Group();scene.add(root);const pieces=[];const timber=0x968779,white=0xd8d6d1,metal=0x74787c;
function part(size,pos,explode,color=white,geometry=null){const geo=geometry||new T.BoxGeometry(...size);const mat=new T.MeshStandardMaterial({color,roughness:color===metal?.32:.65,metalness:color===metal?.8:0,transparent:true});const mesh=new T.Mesh(geo,mat);const edges=new T.LineSegments(new T.EdgesGeometry(geo),new T.LineBasicMaterial({color:0x00b9ff,transparent:true}));const g=new T.Group();g.add(mesh,edges);g.position.set(...pos);root.add(g);pieces.push({g,mesh,edges,pos:new T.Vector3(...pos),ex:new T.Vector3(...explode)});return g;}
// Reference wardrobe: 1200 W × 500 D × 2200 H, three equal doors.
// Narrow left shelving bay with two internal drawers; double-width hanging bay right.
const board=.018, left=-.394, right=.197;
part([board,2.2,.5],[-.591,0,0],[-.42,0,0],timber);
part([board,2.2,.5],[.591,0,0],[.42,0,0],timber);
part([1.164,board,.5],[0,1.091,0],[0,.33,0],timber);
part([1.164,board,.5],[0,-1.091,0],[0,-.25,0],timber);
part([1.164,2.164,.008],[0,0,-.246],[0,0,-.42],timber);
part([board,2.164,.476],[-.206,0,0],[-.05,0,0],timber);
// Four shelves above the two drawers, including their top cover.
for(const y of [.72,.31,-.1,-.49]) part([.376,board,.46],[left,y,0],[-.13,(y+.1)*.1,.13],timber);
for(const y of [.72,-.74]) part([.779,board,.46],[right,y,0],[.12,y*.12,.13],timber);
// The rail belongs to the wide RIGHT compartment.
part([.73,.024,.024],[right,.57,0],[.12,.1,.26],metal,new T.CylinderGeometry(.012,.012,.73,20)).rotation.z=Math.PI/2;
// Three full-height white fronts with black vertical handles.
for(const [i,x] of [-.4,0,.4].entries()){
 const doorStart=pieces.length;
 const ex=[(i-1)*.36,0,.25+i*.04];
 part([.396,2.158,.018],[x,0,.259],ex,white);
 const hx=x+(i===2?-.15:.15);
 part([.012,.43,.022],[hx,-.12,.281],ex,0x262a2b);
 for(const hy of [-.31,.07])part([.012,.012,.025],[hx,hy,.27],ex,0x262a2b);
 for(const p of pieces.slice(doorStart))p.door={pivot:new T.Vector3(x+(i===2?.198:-.198),0,.259),sign:i===2?1:-1};
}
// Two drawers hidden behind the left door: fronts, bottoms, sides and backs.
for(const [i,y] of [-.635,-.91].entries()){
 const dz=.68+i*.22, dy=-.06-i*.1;
 part([.344,.235,.018],[left,y,.226],[-.18,dy,dz+.25],timber);
 part([.324,.006,.414],[left,y-.105,-.005],[-.18,dy-.06,dz],white);
 for(const side of [-1,1]){
  const x=left+side*.171;
  part([.012,.2,.42],[x,y,-.005],[-.18+side*.1,dy,dz],timber);
  part([.009,.035,.425],[x+side*.012,y-.065,-.008],[-.18+side*.27,dy,.37],metal);
 }
 part([.324,.2,.012],[left,y,-.221],[-.18,dy,dz-.16],timber);
 part([.065,.009,.018],[left,y+.07,.243],[-.18,dy,dz+.25],0x262a2b);
}
// Three hinge sets and carcass confirmat fasteners.
for(const x of [-.568,-.185,.568])for(const y of [-.78,0,.78]){
 const ex=[x<0?-.68:.7,y*.06,.46];
 part([.025,.065,.008],[x,y,.218],ex,metal);
 part([.045,.02,.025],[x,y,.244],ex,metal);
 part([.035,.035,.012],[x,y,.254],ex,metal,new T.CylinderGeometry(.0175,.0175,.012,20)).rotation.x=Math.PI/2;
}
for(const x of [-.602,.602])for(const y of [-1.05,1.05]){
 const ex=[x<0?-.62:.62,y*.08,.05];
 part([.007,.065,.007],[x,y,0],ex,metal,new T.CylinderGeometry(.0035,.0035,.065,12)).rotation.z=Math.PI/2;
 part([.012,.012,.004],[x,y,.005],ex,metal,new T.CylinderGeometry(.006,.006,.004,16)).rotation.z=Math.PI/2;
}

const axis=new T.Vector3(0,1,0);
for(const p of pieces)p.baseRotation=p.g.rotation.clone();
camera.position.set(0,0,10);camera.lookAt(0,0,0);
let currentW=0,currentH=0;
renderScene=()=>{
 const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
 if(w!==currentW||h!==currentH){currentW=w;currentH=h;renderer.setSize(w,h,false);const aspect=w/h;camera.left=-2.3*aspect;camera.right=2.3*aspect;camera.top=2.3;camera.bottom=-2.3;camera.updateProjectionMatrix();}
 const mobile=w<=700, worldWidth=4.6*w/h;
 const mobileCenter=(82+state.mobileTop)/2;
 const mobileScale=Math.max(.17,(state.mobileTop-96)*.88/h*4.6/2.2/1.25);
 root.position.set(mobile?Math.sin(state.yaw)*.08:(state.x-.5)*worldWidth,mobile?2.3-mobileCenter/h*4.6:state.y,0);
 root.scale.setScalar(state.scale*(mobile?mobileScale:1));
 root.rotation.set(state.tilt,state.yaw,0);
 for(const p of pieces){
  p.g.position.copy(p.pos);p.g.rotation.copy(p.baseRotation);
  if(p.door){const angle=p.door.sign*state.open*1.42;p.g.position.sub(p.door.pivot).applyAxisAngle(axis,angle).add(p.door.pivot);p.g.rotation.y+=angle;}
  p.g.position.addScaledVector(p.ex,state.explode);
  p.mesh.material.opacity=state.solid;p.mesh.material.depthWrite=state.solid>.98;p.mesh.visible=state.solid>.005;
  p.edges.material.opacity=1-state.solid*.96;p.edges.material.color.set(state.solid>.6?0x898582:0x29bfff);
 }
 renderer.render(scene,camera);
};
new ResizeObserver(schedule).observe(host);updateStory();
}catch(e){console.warn('3D preview unavailable',e);const fallback=$('.fallback');if(fallback)fallback.textContent='Проектирование → Производство → Комплектация';}}
init();
