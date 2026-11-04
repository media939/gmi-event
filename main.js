'use strict';
(() => {
  const event = window.EVENT_DATA;
  if (!event) { console.error('content.js 내용을 불러오지 못했습니다.'); return; }
  // 상단과 하단의 "은혜한인교회"와 "GraceMinistriesInternational"의
  // 실제 표시 길이를 동일하게 맞춥니다. 글자 형태는 바꾸지 않고 자간만 조절합니다.
  function fitBrandNames() {
    document.querySelectorAll('.brand-type').forEach(box => {
      const target = box.getBoundingClientRect().width;
      box.querySelectorAll('.brand-korean, .brand-english').forEach(line => {
        line.style.letterSpacing = '0px';
        const measured = line.getBoundingClientRect().width;
        const count = Array.from(line.textContent.trim()).length;
        if (!count || !measured) return;
        let tracking = (target - measured) / count;
        line.style.letterSpacing = tracking.toFixed(5) + 'px';
        const result = line.getBoundingClientRect().width;
        if (Math.abs(result - target) > 0.05) {
          tracking += (target - result) / count;
          line.style.letterSpacing = tracking.toFixed(5) + 'px';
        }
      });
    });
  }
  fitBrandNames();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitBrandNames);
  }
  window.addEventListener('resize', fitBrandNames, {passive:true});
  const $ = id => document.getElementById(id);
  const esc = text => String(text).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const pad = n => String(n).padStart(2,'0');
  const talks = event.talks;
  const dateDisplay = (iso) => Number(iso.slice(8,10));
  const shownTime = t => `${t.time.slice(0,2)}:${t.time.slice(3)}`;
  let toastTimer;
  function toast(message) { const box=$('toast'); box.textContent=message; box.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>box.classList.remove('show'),3000); }
  function ytId(raw){
    if(!raw) return null;
    try { const u=new URL(raw); const host=u.hostname.replace(/^www\./,'');
      if(host==='youtu.be')return /^[\w-]{11}$/.test(u.pathname.slice(1))?u.pathname.slice(1):null;
      if(['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(host)) {
        const id=u.searchParams.get('v') || (u.pathname.match(/^\/(?:embed|live|shorts)\/([\w-]{11})/)||[])[1];
        return id && /^[\w-]{11}$/.test(id)?id:null;
      }
    }catch(_err){} return null;
  }
  function card(t){
    const video=ytId(t.youtubeUrl);
    return `<article class="schedule-card">
      <div class="schedule-date"><small>${esc(t.english)}</small><strong>${dateDisplay(t.date)}</strong><span>11월 ${esc(t.shortDay)}요일</span></div>
      <div class="schedule-card-info"><div class="schedule-card-top"><span class="sermon-label">${esc(t.label)}</span><span class="time-pill">${shownTime(t)} AM</span></div>
      <h3>${esc(t.title)}</h3><div class="schedule-card-bottom"><p>본문 · ${esc(t.scripture)}</p>${video ? `<a class="watch-link" href="https://www.youtube.com/watch?v=${video}" target="_blank" rel="noopener noreferrer">영상 보기 ↗</a>` : '<span class="coming-label">영상 공개 예정</span>'}</div></div>
    </article>`;
  }
  function renderSchedule(filter='all'){
    const active=filter==='all'?talks:talks.filter(t=>t.date===filter);
    $('schedule-list').innerHTML=active.map(card).join('');
    document.querySelectorAll('.day-filter').forEach(btn=>{
      const on=btn.dataset.filter===filter;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on));
    });
  }
  $('day-filters').insertAdjacentHTML('beforeend',talks.map(t=>`<button class="day-filter" type="button" data-filter="${esc(t.date)}" aria-pressed="false">11.${pad(dateDisplay(t.date))} <span>${esc(t.shortDay)}</span></button>`).join(''));
  $('day-filters').addEventListener('click',e=>{ const btn=e.target.closest('button[data-filter]'); if(btn)renderSchedule(btn.dataset.filter); });
  renderSchedule();
  $('intro-text').textContent=event.intro;
  $('broadcast-link').href=event.livestreamUrl||event.website;
  function renderVideos(){
    const linked=talks.map(t=>({...t,id:ytId(t.youtubeUrl)})).filter(t=>t.id);
    if(linked.length===0){
      $('video-container').innerHTML=`<div class="video-empty"><div><span class="play-circle" aria-hidden="true">▶</span><h3>집회 영상은 곧 이곳에서 만나실 수 있습니다</h3><p>11월 16일 집회 시작 후, 영상 링크가 등록되면<br>이 자리에서 바로 시청하실 수 있습니다.</p></div></div>`;
      return;
    }
    $('video-container').innerHTML=`<div class="video-grid">${linked.map(t=>`<article class="video-item"><div class="video-frame"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${t.id}" title="${esc(t.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><div class="video-meta"><small>11.${pad(dateDisplay(t.date))} ${esc(t.shortDay)}요일 · ${esc(t.scripture)}</small><h3>${esc(t.title)}</h3></div></article>`).join('')}</div>`;
  }
  renderVideos();
  const nav=$('navigation'), menu=$('menu-toggle'), header=$('site-header');
  menu.addEventListener('click',()=>{
    const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');nav.classList.toggle('open',open);header.classList.toggle('menu-open',open);
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','메뉴 열기');header.classList.remove('menu-open');}));
  window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>40),{passive:true});
  header.classList.toggle('scrolled',window.scrollY>40);
  const first=new Date(talks[0].date+'T'+talks[0].time+':00-08:00');
  const last=new Date(talks[talks.length-1].date+'T'+talks[talks.length-1].time+':00-08:00');
  const units=['days','hours','minutes','seconds'];
  function countdown(){
    const now=new Date(), delta=first-now;
    if(delta<=0){ $('countdown-heading').textContent=now<new Date(last.getTime()+2*60*60*1000)?'은혜의 집회가 진행 중입니다':'감사의 새벽을 함께해 주셔서 감사합니다';
      const c=$('countdown');c.innerHTML=`<span style="font-size:16px;font-weight:700;color:#20314d">${now<new Date(last.getTime()+2*60*60*1000)?'2026.11.16 — 11.21 · 비전센터 본당':'집회 영상은 다시보기에서 확인하세요'}</span>`;
      return false;
    }
    const sec=Math.floor(delta/1000); const values=[Math.floor(sec/86400),Math.floor(sec%86400/3600),Math.floor(sec%3600/60),sec%60];
    units.forEach((unit,i)=>{const el=$('cd-'+unit);if(el)el.textContent=pad(values[i]);}); return true;
  }
  if(countdown()) { const timer=setInterval(()=>{if(!countdown())clearInterval(timer);},1000); }
  const makeICS = () => {
    const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const icsEscape=v=>String(v).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
    const events=talks.map((t,i)=>{
      const start=t.date.replace(/-/g,'')+'T'+t.time.replace(':','')+'00';
      return ['BEGIN:VEVENT',`UID:gmi-thanksgiving-2026-${i+1}@gracemi.com`,`DTSTAMP:${stamp}`,`DTSTART;TZID=America/Los_Angeles:${start}`,'DURATION:PT1H',`SUMMARY:${icsEscape(event.title+' — '+t.label)}`,`DESCRIPTION:${icsEscape(t.title+' / '+t.scripture+' | 일정 편의를 위해 1시간으로 등록했습니다. 실제 종료 시간은 교회 안내를 확인하세요.')}`,`LOCATION:${icsEscape(event.venue+' / '+event.address)}`,'END:VEVENT'].join('\r\n');
    });
    return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Grace Ministries International//Thanksgiving Revival 2026//KO','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:2026 추수감사 특별새벽부흥회',...events,'END:VCALENDAR',''].join('\r\n');
  };
  $('add-calendar').addEventListener('click',()=>{
    const blob=new Blob([makeICS()],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='GMI-2026-추수감사-특별새벽부흥회.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('일정 파일이 저장되었습니다. 종료 시간은 임시로 1시간 설정됩니다.');
  });
  const mapQuery=encodeURIComponent(event.address);$('map-directions').href='https://www.google.com/maps/search/?api=1&query='+mapQuery;
  async function copyText(text){
    if(navigator.clipboard && window.isSecureContext){try{await navigator.clipboard.writeText(text);return true;}catch(_){}}
    const node=document.createElement('textarea');node.value=text;node.style.position='fixed';node.style.left='-9999px';document.body.appendChild(node);node.select();let result=false;
    try{result=document.execCommand('copy');}catch(_err){}node.remove();return result;
  }
  $('copy-address').addEventListener('click',async()=>toast(await copyText(event.address)?'교회 주소가 복사되었습니다.':'주소 복사에 실패했습니다.'));
  $('share-button').addEventListener('click',async()=>{
    const data={title:`2026 ${event.title}`,text:`${event.theme} · 11월 16–21일 · ${event.venue}`,url:location.href.split('#')[0]};
    if(navigator.share){try{await navigator.share(data);return;}catch(e){if(e.name==='AbortError')return;}}
    toast(await copyText(data.url)?'홈페이지 주소를 복사했습니다.':'주소를 복사할 수 없습니다. 브라우저 주소창에서 복사해 주세요.');
  });
})();
