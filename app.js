const menu=document.querySelector('.mobile-menu');menu.onclick=()=>{const open=document.querySelector('nav').classList.toggle('open');menu.setAttribute('aria-expanded',open)};document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>{document.querySelector('nav').classList.remove('open');menu.setAttribute('aria-expanded','false')});
const portal=document.querySelector('#portal-dialog'),portalBody=document.querySelector('#portal-body'),portalTitle=document.querySelector('#portal-title');let portalRole='provider';
function showPortal(role){portalRole=role;portalTitle.textContent=role==='provider'?'Provider login':'Employee login';portalBody.innerHTML=`<p class="dialog-note">Sign in with your email and the access code Carepak sent you.</p><form class="portal-form"><label class="portal-label" for="portal-email">Email</label><input class="portal-code portal-email" id="portal-email" name="email" type="email" autocomplete="username" required><label class="portal-label" for="portal-code">Access code</label><input class="portal-code" id="portal-code" name="access-code" type="password" autocomplete="off" required aria-describedby="portal-error"><p id="portal-error" class="portal-error" role="alert"></p><button class="btn blue" type="submit">Continue <span>→</span></button></form><p class="portal-preview-note">Need access? Call your Carepak team at <a href="tel:18006017092">1.800.601.7092</a>.</p>`;if(!portal.open)portal.showModal();document.querySelector('#portal-email').focus();portalBody.querySelector('form').onsubmit=e=>{e.preventDefault();const em=document.querySelector('#portal-email').value.trim(),v=document.querySelector('#portal-code').value.trim();document.querySelector('#portal-error').textContent=!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)?'Please enter your email.':v?'We couldn’t verify that code. Please contact your Carepak team at 1.800.601.7092.':'Please enter your access code.'}}
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
