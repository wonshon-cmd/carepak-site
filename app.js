const menu=document.querySelector('.mobile-menu');menu.onclick=()=>{const open=document.querySelector('nav').classList.toggle('open');menu.setAttribute('aria-expanded',open)};document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>{document.querySelector('nav').classList.remove('open');menu.setAttribute('aria-expanded','false')});
const portal=document.querySelector('#portal-dialog'),portalBody=document.querySelector('#portal-body'),portalTitle=document.querySelector('#portal-title');let portalRole='provider';
function showPortal(role){portalRole=role;portalTitle.textContent=role==='provider'?'Provider login':'Employee login';portalBody.innerHTML=`<p class="dialog-note">Enter your access code to continue.</p><form class="portal-form"><label class="portal-label" for="portal-code">Access code</label><input class="portal-code" id="portal-code" name="access-code" type="password" autocomplete="off" required aria-describedby="portal-error portal-preview"><p id="portal-error" class="portal-error" role="alert"></p><button class="btn blue" type="submit">Continue <span>→</span></button></form><p class="portal-preview-note" id="portal-preview">Interactive preview only. No live accounts or patient records.</p><button class="demo-code" type="button">Try a demo code</button>`;if(!portal.open)portal.showModal();document.querySelector('#portal-code').focus();portalBody.querySelector('.demo-code').onclick=()=>{document.querySelector('#portal-code').value=role==='provider'?'CPK-PROVIDER-DEMO':'CPK-EMPLOYEE-DEMO';document.querySelector('#portal-code').focus()};portalBody.querySelector('form').onsubmit=e=>{e.preventDefault();const expected=role==='provider'?'CPK-PROVIDER-DEMO':'CPK-EMPLOYEE-DEMO';if(document.querySelector('#portal-code').value.trim().toUpperCase()!==expected){document.querySelector('#portal-error').textContent='Code not recognized. Use “Try a demo code” for this preview.';return}portalTitle.textContent=role==='provider'?'Provider workspace':'Employee workspace';portalBody.innerHTML=`<p class="dialog-note">Welcome to your Carepak portal preview.</p>${role==='provider'?'<a class="portal-resource" href="https://start.carepakpharmacy.com/letsconnect">Explore connected care →<small>See the Carepak service showcase.</small></a><a class="portal-resource" href="tel:18006017092">Contact your Carepak team →<small>Call to discuss coordination and next steps.</small></a>':'<a class="portal-resource" href="https://carepak-onboarding.onrender.com/contractor">Onboarding →<small>Complete your onboarding with the code Carepak sent you.</small></a><a class="portal-resource" href="https://start.carepakpharmacy.com/letsconnect">Carepak service showcase →<small>Get familiar with our patient care experience.</small></a>'}<p class="portal-preview-note">Demo workspace only. Secure account access will be connected before launch.</p><button type="button" class="portal-signout">Back to code entry</button>`;portalBody.querySelector('.portal-signout').onclick=()=>showPortal(role)}}
document.querySelectorAll('[data-portal]').forEach(b=>b.onclick=()=>{document.querySelector('nav').classList.remove('open');menu.setAttribute('aria-expanded','false');showPortal(b.dataset.portal)});document.querySelector('#portal-close').onclick=()=>portal.close();portal.addEventListener('click',e=>{if(e.target===portal){const r=portal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)portal.close()}});

// Keep the circling dots exactly on the outer ring at every screen size.
(function(){const scene=document.querySelector('.orbit-scene'),ring=scene&&scene.querySelector('.outer-track');if(!ring)return;
const set=()=>scene.style.setProperty('--orbit-r',(ring.offsetWidth/2)+'px');set();addEventListener('resize',set)})();

// ---- Illustrative care-coordination chat (fictional patient; nothing is sent anywhere) ----
(function(){
  const stream=document.querySelector('.chat-stream'),typing=document.querySelector('.chat-typing'),status=document.querySelector('.care-status');
  if(!stream)return;
  const tabs=[...document.querySelectorAll('[data-scenario]')];
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SCENARIOS=[
    {done:'Medications ready · Free home delivery arranged',msgs:[
      ['in','Medical assistant · 10:48 AM','Evelyn is being discharged at 11:30 AM. Can you have her medications delivered to her home?'],
      ['out','Carepak pharmacist · 10:50 AM','Her medications are ready. We’ll deliver them to her home today, free of charge.'],
      ['out','Carepak coordinator · 10:51 AM','We’ve notified Evelyn’s daughter and sent the patient a text update.']]},
    {done:'Refills synchronized · One coordinated delivery',msgs:[
      ['in','Evelyn’s daughter · 9:12 AM','Mom’s refills keep coming due on different days. Can they come together?'],
      ['out','Carepak coordinator · 9:15 AM','Yes. We’ll synchronize her maintenance medications so everything refills at once.'],
      ['out','Carepak pharmacist · 9:20 AM','Her next delivery will include everything, packaged by day and time, with an updated medication list.']]},
    {done:'Access coordinated · Delivery scheduled',msgs:[
      ['in','Medical assistant · 2:05 PM','Her new medication needs a prior authorization. Can you help us coordinate?'],
      ['out','Carepak coordinator · 2:08 PM','We’re coordinating the plan requirements and supporting information with your office now.'],
      ['out','Carepak coordinator · 4:40 PM','It’s approved. We’ll deliver today, and Evelyn will get a text when it’s on the way.']]}
  ];
  let run=0;
  function play(i){
    const id=++run,sc=SCENARIOS[i];
    tabs.forEach(t=>t.setAttribute('aria-selected',String(+t.dataset.scenario===i)));
    stream.replaceChildren();typing.classList.remove('on');status.className='care-status';status.textContent='Request received';
    let k=0;
    const next=()=>{
      if(id!==run)return;
      if(k>=sc.msgs.length){typing.classList.remove('on');status.className='care-status done';status.textContent=sc.done;return}
      const [dir,who,text]=sc.msgs[k++];
      const add=()=>{
        if(id!==run)return;
        typing.classList.remove('on');
        const m=document.createElement('div');m.className='chat-msg '+dir;
        const s=document.createElement('small');s.textContent=who;
        const d=document.createElement('div');d.textContent=text;
        m.append(s,d);stream.append(m);
        if(k===2)status.textContent='In progress';
        setTimeout(next,reduce?0:900);
      };
      if(dir==='out'&&!reduce){typing.classList.add('on');setTimeout(add,1300)}else add();
    };
    next();
  }
  tabs.forEach(t=>t.addEventListener('click',()=>play(+t.dataset.scenario)));
  document.getElementById('replay-chat').addEventListener('click',()=>{const cur=tabs.find(t=>t.getAttribute('aria-selected')==='true')||tabs[0];play(+cur.dataset.scenario)});
  // Start when the chat scrolls into view
  if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){play(0);io.disconnect()}},{threshold:.3});io.observe(document.querySelector('.care-chat'))}else play(0);
})();
