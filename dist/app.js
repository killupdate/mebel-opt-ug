const $=s=>document.querySelector(s);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const stages=[['01 / ПРОЕКТИРОВАНИЕ','Всё начинается с вашей идеи.','Согласуем размеры, материалы и конструкцию. Зафиксируем детали до запуска в производство.','01 — ЧЕРТЁЖ'],['02 / ПРОИЗВОДСТВО','Из проекта — в изделие.','Воплотим согласованную конструкцию. Проверим геометрию, обработку и комплектацию.','02 — 3D-МОДЕЛЬ'],['03 / КОМПЛЕКТАЦИЯ','Продумано до последнего винта.','Корпус, фасады, ящики и фурнитура. Подготовим комплект к упаковке и отгрузке.','03 — ДЕТАЛИ']];let progress=0,draw=()=>{};
function update(p){progress=Math.max(0,Math.min(1,p));const n=progress<.25?0:progress<.65?1:2;['#step-number','#step-title','#step-text','#view-name'].forEach((s,i)=>$(s).textContent=stages[n][i]);document.querySelectorAll('[data-stage]').forEach((b,i)=>b.setAttribute('aria-pressed',i===n));$('#parts-labels').style.opacity=n===2?1:0;draw();}
function onScroll(){if(reduced)return;const r=$('.journey').getBoundingClientRect();update(-r.top/Math.max(1,r.height-innerHeight));}addEventListener('scroll',onScroll,{passive:true});document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>{const p=[0,.46,1][Number(b.dataset.stage)];if(reduced){update(p);return;}const r=$('.journey').getBoundingClientRect();scrollTo({top:scrollY+r.top+p*(r.height-innerHeight),behavior:'smooth'});}));
const fields=['product','quantity','city','deadline'];function brief(){return 'Здравствуйте! Прошу рассчитать партию мебели.\n'+['Изделие','Количество','Город поставки','Желаемый срок'].map((s,i)=>s+': '+($('#'+fields[i]).value.trim()||'уточним')).join('\n')+'\nРаботаем как ЮЛ/ИП. Минимальный заказ от 300 000 ₽.';}function email(){ $('#email-brief').href='mailto:optmebelug@mail.ru?subject='+encodeURIComponent('Расчёт партии мебели')+'&body='+encodeURIComponent(brief());}fields.forEach(id=>$('#'+id).addEventListener('input',email));email();document.querySelectorAll('[data-interest]').forEach(a=>a.addEventListener('click',()=>{$('#product').value=a.dataset.interest;email();}));$('#copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(brief());$('#brief-status').textContent='Запрос скопирован. Вставьте его в Telegram.';}catch{$('#brief-status').textContent='Копирование недоступно. Используйте «Отправить по email».';}});
async function init(){try{const T=await import('./assets/three.module.js');const host=$('#scene'),scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,100);const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0xffffff,0);host.appendChild(renderer.domElement);$('.fallback').remove();scene.add(new T.HemisphereLight(0xe9f7ff,0x617b8c,2.8));const light=new T.DirectionalLight(0xffffff,3.5);light.position.set(-3,6,5);scene.add(light);const root=new T.Group();scene.add(root);const pieces=[];const timber=0xb9b0a2,white=0xe8e6e2,metal=0x555c61;
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
 const ex=[(i-1)*.58,0,.94+i*.08];
 part([.396,2.158,.018],[x,0,.259],ex,white);
 const hx=x+(i===2?-.15:.15);
 part([.012,.43,.022],[hx,-.12,.281],ex,0x262a2b);
 for(const hy of [-.31,.07])part([.012,.012,.025],[hx,hy,.27],ex,0x262a2b);
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
const smooth=(a,b,v)=>{const t=T.MathUtils.clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};draw=()=>{const solid=smooth(.06,.38,progress),explode=smooth(.55,.98,progress);root.rotation.y=-.08+solid*.54;root.rotation.x=solid*.055;for(const p of pieces){p.g.position.copy(p.pos).addScaledVector(p.ex,explode);p.mesh.material.opacity=solid;p.mesh.visible=solid>.01;p.edges.material.opacity=1-solid*.8;p.edges.material.color.set(solid>.6?0x35566b:0x00baff);}const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.set(0,.15,Math.max(5.8,4.2/camera.aspect)+explode*1.25);camera.lookAt(0,0,0);camera.updateProjectionMatrix();renderer.render(scene,camera);};new ResizeObserver(draw).observe(host);onScroll();draw();}catch(e){console.warn('3D preview unavailable',e);$('.fallback').textContent='Проектирование → Производство → Комплектация';}}
init();
