// Paidia Consulting - small site behaviours. No dependencies.
// BOOKING_URL: paste the Papperlapapp booking page (David's calendar on hello@) here once it exists.
// While it is empty, every "Book a call" link goes to the contact page instead.
var PAIDIA = { BOOKING_URL: "", EMAIL: "info@paidiaconsulting.com" };

(function () {
  document.documentElement.classList.add("js");
  // Quotes rise gently into view; everything is visible without this
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
  } else { document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  document.querySelectorAll("[data-book]").forEach(function (a) {
    if (PAIDIA.BOOKING_URL) { a.href = PAIDIA.BOOKING_URL; a.target = "_blank"; a.rel = "noopener"; }
    else { a.href = a.getAttribute("data-fallback") || "contact.html"; }
  });

  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
      if (open) { var first = nav.querySelector("a"); if (first) first.focus(); } // 4 Nov 2026: focus moves into the open menu
    });
    var closeMenu = function (refocus) { if (nav.classList.contains("open")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.textContent = "Menu"; if (refocus) btn.focus(); } };
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(true); });
    // 4 Nov 2026: tabbing out of the open menu closes it
    nav.addEventListener("focusout", function (e) { if (nav.classList.contains("open") && e.relatedTarget && !e.relatedTarget.closest(".site-header")) closeMenu(false); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".site-header")) closeMenu(); });
  }

  // Header: tuck away when scrolling down, come back on scroll up or keyboard focus
  var head = document.querySelector(".site-header");
  if (head) {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY, menuOpen = nav && nav.classList.contains("open");
        if (Math.abs(y - lastY) > 120) { lastY = y; ticking = false; return; } // an anchor jump, not a scroll: leave the header as it is
        if (y > 160 && y > lastY + 4 && !menuOpen && window.innerWidth > 900) head.classList.add("is-hidden");
        else if (y < lastY - 4 || y <= 160) head.classList.remove("is-hidden");
        lastY = y; ticking = false;
      });
    }, { passive: true });
    document.addEventListener("keydown", function (e) { if (e.key === "Tab") head.classList.remove("is-hidden"); });
  }

  // Forms: build an email draft (nothing is sent or stored by the site). Replace with Tally / Cal.com / Luma before launch.
  document.querySelectorAll("form[data-mail]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var subject = f.getAttribute("data-subject") || "Hello from the website", lines = [];
      f.querySelectorAll("input,textarea,select").forEach(function (i) {
        if (i.type === "checkbox" || i.type === "radio") { if (i.checked) lines.push((i.getAttribute("data-label") || i.name) + ": " + (i.value === "on" ? "yes" : i.value)); }
        else if (i.value) lines.push((i.getAttribute("data-label") || i.name) + ": " + i.value);
      });
      var msg = f.querySelector(".form-msg"); if (msg) msg.hidden = false;
      window.location.href = "mailto:" + PAIDIA.EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
    });
  });
})();

// The scroll-linked fade (a16z-style) was removed on 25 Oct 2026 after site review 3: it took the bottom third of every screen below WCAG contrast. Backup: site.js.bak-2026-10-25-tiera

/* 28 Oct 2026: home quote carousel */
document.querySelectorAll('.qc').forEach(function(qc){
  var t=qc.querySelector('.qc-track'),cards=[].slice.call(t.children),prev=qc.querySelector('.qc-prev'),next=qc.querySelector('.qc-next'),count=qc.querySelector('.qc-count');
  if(!t||!cards.length)return;
  function atEnd(){return t.scrollLeft+t.clientWidth>=t.scrollWidth-4}
  function idx(){if(atEnd())return cards.length-1;var best=0,min=1e9;cards.forEach(function(c,i){var d=Math.abs(c.offsetLeft-cards[0].offsetLeft-t.scrollLeft);if(d<min){min=d;best=i}});return best}
  function upd(){count.textContent=(idx()+1)+' / '+cards.length;prev.disabled=t.scrollLeft<4;next.disabled=atEnd()}
  function go(d){var i=Math.max(0,Math.min(cards.length-1,idx()+d));t.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:'smooth'})}
  prev.addEventListener('click',function(){go(-1)});next.addEventListener('click',function(){go(1)});
  var raf;t.addEventListener('scroll',function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(upd)},{passive:true});
  window.addEventListener('resize',upd);upd();
});

/* 28 Oct 2026, 4.30pm: home quote carousel, Dribbble style (active card wide, drag, ring cursor, keys, swipe on phones) */
document.querySelectorAll('.tc').forEach(function(tc){
  var vp=tc.querySelector('.tc-viewport'),track=tc.querySelector('.tc-track'),cards=[].slice.call(track.children),
      prev=tc.querySelector('.tc-prev'),next=tc.querySelector('.tc-next'),count=tc.querySelector('.tc-count'),ring=tc.querySelector('.tc-ring');
  if(!cards.length)return;
  var i=0,wide=window.matchMedia('(min-width:761px)'),sx=null,dx=0,moved=false;
  var sw=290,gap=20;
  function measure(){var cs=getComputedStyle(tc);sw=parseFloat(cs.getPropertyValue('--tc-s'))||290;gap=parseFloat(cs.getPropertyValue('--tc-g'))||20}
  function shift(){var aw=Math.min(660,window.innerWidth*0.56),n=cards.length,total=(n-1)*sw+aw+(n-1)*gap,cs=getComputedStyle(vp),avail=vp.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);return Math.max(0,Math.min(i*(sw+gap),total-avail))}
  function place(extra){if(!wide.matches){track.style.transform='';return}track.style.transform='translateX('+(-shift()+(extra||0))+'px)'}
  function mark(){cards.forEach(function(c,k){c.classList.toggle('is-active',k===i)});count.textContent=(i+1)+' / '+cards.length;prev.disabled=i===0;next.disabled=i===cards.length-1}
  function go(n,fromScroll){i=Math.max(0,Math.min(cards.length-1,n));mark();
    if(wide.matches)place();else if(!fromScroll)vp.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:'smooth'})}
  prev.addEventListener('click',function(){go(i-1)});next.addEventListener('click',function(){go(i+1)});
  vp.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(i+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(i-1)}});
  cards.forEach(function(c,k){c.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();return}if(k!==i){e.preventDefault();go(k)}})});
  vp.addEventListener('pointerdown',function(e){if(!wide.matches||e.button!==0)return;sx=e.clientX;dx=0;moved=false;track.classList.add('is-drag')});
  window.addEventListener('pointermove',function(e){
    if(ring&&wide.matches){var r=vp.getBoundingClientRect();ring.style.transform='translate('+(e.clientX-r.left)+'px,'+(e.clientY-r.top)+'px)'}
    if(sx===null)return;dx=e.clientX-sx;if(Math.abs(dx)>6)moved=true;place(dx*0.9)});
  window.addEventListener('pointerup',function(){if(sx===null)return;track.classList.remove('is-drag');sx=null;
    if(dx<-70)go(i+1);else if(dx>70)go(i-1);else place();setTimeout(function(){moved=false},0)});
  vp.addEventListener('pointerenter',function(){vp.classList.add('is-over')});vp.addEventListener('pointerleave',function(){vp.classList.remove('is-over')});
  vp.addEventListener('dragstart',function(e){e.preventDefault()});
  /* 29 Oct 2026: trackpad sideways swipe moves one card; momentum is swallowed so one swipe is one card */
  var wacc=0,wlock=0;vp.addEventListener('wheel',function(e){if(!wide.matches||Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();
    var now=Date.now();if(now<wlock){wlock=now+180;wacc=0;return}wacc+=e.deltaX;if(Math.abs(wacc)>36){go(i+(wacc>0?1:-1));wacc=0;wlock=now+420}},{passive:false});
  var raf;vp.addEventListener('scroll',function(){if(wide.matches)return;cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){
    var best=0,min=1e9;cards.forEach(function(c,k){var d=Math.abs(c.offsetLeft-cards[0].offsetLeft-vp.scrollLeft);if(d<min){min=d;best=k}});
    if(vp.scrollLeft+vp.clientWidth>=vp.scrollWidth-4)best=cards.length-1;if(best!==i){i=best;mark()}})},{passive:true});
  function reset(){measure();if(!wide.matches)track.style.transform='';go(i,true)}
  window.addEventListener('resize',reset);if(wide.addEventListener)wide.addEventListener('change',reset);
  measure();go(0,true);
});

/* 28 Oct 2026: workshop page sticky "Book your place" bar, shown once the hero button has scrolled away */
(function(){var bar=document.querySelector('.w-sticky'),cta=document.querySelector('.w-cta');if(!bar||!cta||!('IntersectionObserver' in window))return;
  var link=bar.querySelector('a');
  new IntersectionObserver(function(es){var off=!es[0].isIntersecting&&es[0].boundingClientRect.top<0;bar.classList.toggle('is-on',off);bar.setAttribute('aria-hidden',off?'false':'true');link.tabIndex=off?0:-1}).observe(cta);
})();

/* 29 Oct 2026: home factory line. One supplier email travels the line; the panel below says what each station did.
   Plays when in view, pauses off screen, stops for good once someone picks a station. Reduced motion: no autoplay. */
document.querySelectorAll('[data-fx]').forEach(function(fx){
  var belt=fx.querySelector('.fx-belt'),stage=fx.querySelector('.fx-stage'),doc=fx.querySelector('.fx-doc'),
      imgs=[].slice.call(fx.querySelectorAll('.fx-img')),btns=[].slice.call(fx.querySelectorAll('[data-go]')),
      panels=[].slice.call(fx.querySelectorAll('.fx-panel')),play=fx.querySelector('.fx-play'),pl=fx.querySelector('.fx-pl');
  if(!belt||!play)return; // 2 Nov: the home fox hero also uses data-fx; without this guard the error stopped the rest of this file (story pop-ups)
  var calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // where the email sits at each station, as % of the whole line (x, y, tilt)
  var spots=[[7.4,33,12],[33.6,47,-6],[50.8,47,3],[69.2,46,-2],[92.5,33,-12]],focus=[10,30,50,70,90],N=imgs.length,L=N-1;
  var i=0,timer=null,playing=false,visible=false,touched=false;
  fx.classList.add('is-on');
  function pan(){var sw=stage.clientWidth,bw=belt.scrollWidth;if(bw<=sw+2){belt.style.transform='';return}
    var x=sw/2-bw*focus[i]/100;x=Math.max(sw-bw,Math.min(0,x));belt.style.transform='translateX('+x+'px)'}
  function show(n){i=(n+N)%N;var s=spots[i];doc.setAttribute('data-s',i);
    doc.style.setProperty('--x',s[0]+'%');doc.style.setProperty('--y',s[1]+'%');doc.style.setProperty('--r',s[2]+'deg');
    imgs.forEach(function(im,k){im.classList.toggle('is-cur',k===i)});
    btns.forEach(function(b,k){if(k===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
    panels.forEach(function(p,k){p.hidden=k!==i});pan()}
  function tick(){show(i+1);timer=setTimeout(tick,i===L?6500:4800)}
  function start(){if(playing)return;playing=true;play.setAttribute('aria-pressed','true');pl.textContent='Pause';timer=setTimeout(tick,i===L?2500:3600)}
  function stop(){playing=false;clearTimeout(timer);play.setAttribute('aria-pressed','false');pl.textContent='Play'}
  btns.forEach(function(b,k){b.addEventListener('click',function(){touched=true;stop();show(k)})});
  play.addEventListener('click',function(){if(playing){touched=true;stop()}else{touched=false;if(i===L)show(0);start()}});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting;
    if(visible&&!touched&&!calm)start();else if(!visible&&playing){stop()}},{threshold:.45}).observe(stage);
  window.addEventListener('resize',pan);
  show(0);
});

/* 29 Oct 2026: home "Our work" cards open the story in a sheet; arrows, keys and swipe move between them.
   Without JS (or <dialog>) the cards are plain links to work.html. */
document.querySelectorAll('[data-cs]').forEach(function(grid){
  var sec=grid.closest('section'),dlg=sec.querySelector('.cs-sheet');
  if(!dlg||typeof dlg.showModal!=='function')return;
  var stories=[].slice.call(dlg.querySelectorAll('.cs-story')),prev=dlg.querySelector('.cs-prev'),next=dlg.querySelector('.cs-next'),
      count=dlg.querySelector('.cs-count'),body=dlg.querySelector('.cs-body'),i=0;
  function show(n){i=Math.max(0,Math.min(stories.length-1,n));
    stories.forEach(function(s,k){s.hidden=k!==i;var h=s.querySelector('h3');if(k===i)h.id='cs-title';else h.removeAttribute('id')});
    count.textContent=(i+1)+' / '+stories.length;prev.disabled=i===0;next.disabled=i===stories.length-1;body.scrollTop=0}
  grid.querySelectorAll('[data-case]').forEach(function(a){a.addEventListener('click',function(e){
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0)return;e.preventDefault();show(+a.getAttribute('data-case'));dlg.showModal()})});
  prev.addEventListener('click',function(){show(i-1)});next.addEventListener('click',function(){show(i+1)});
  dlg.querySelector('.cs-close').addEventListener('click',function(){dlg.close()});
  dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
  dlg.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();show(i+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(i-1)}});
  var sx=null,sy=0;
  body.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse')return;sx=e.clientX;sy=e.clientY});
  body.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx,dy=e.clientY-sy;sx=null;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)show(i+(dx<0?1:-1))});
  body.addEventListener('pointercancel',function(){sx=null});
});


/* 29 Oct 2026: workshop "Sketch your own factory". Everything runs in the page; nothing is sent anywhere. */
document.querySelectorAll('[data-tf]').forEach(function(tf){
  var form=tf.querySelector('form'),out=tf.querySelector('.tf-out'),other=tf.querySelector('.tf-other'),
      what=tf.querySelector('#tf-what'),outI=tf.querySelector('#tf-out'),never=tf.querySelector('#tf-never');
  var K={
    emails:{one:'email',many:'emails',out:'a reply to each one',never:'agree a price, a discount or new terms',
      pull:['Who it is from','What they are asking for','Any dates, amounts or deadlines','Anything a person needs to decide']},
    forms:{one:'form',many:'forms or applications',out:'a summary a reviewer can decide from',never:'approve or reject anything',
      pull:['Who it is from and what they are applying for','The key facts they have given','Anything missing or inconsistent','Anything a person needs to decide']},
    reports:{one:'report',many:'reports',out:'a one-page summary for the leadership team',never:'state a figure that is not in the report',
      pull:['The main findings','Figures that changed, with the numbers','Anything flagged as a risk','Questions the report leaves open']},
    sheets:{one:'spreadsheet',many:'spreadsheets',out:'a short update on what moved and why it matters',never:'change or round the source figures',
      pull:['What changed since last time','Totals and the biggest movements','Anything outside the usual range','Anything that looks like an error']},
    notes:{one:'set of meeting notes',many:'meeting notes',out:'a follow-up email with actions and owners',never:'give an action to someone who was not in the meeting',
      pull:['Decisions made','Actions, with owners and dates','Open questions','Anything that was disagreed on']},
    other:{one:'item',many:'items',out:'a short summary with next steps',never:'make a decision on my behalf',
      pull:['The key facts','What is being asked or decided','Any dates, amounts or deadlines','Anything unclear or missing']}
  };
  function kind(){return form.querySelector('input[name="tf-kind"]:checked').value}
  function sync(){var k=K[kind()];other.hidden=kind()!=='other';outI.placeholder=k.out;never.placeholder=k.never}
  form.addEventListener('change',function(e){if(e.target.name==='tf-kind'){outI.value='';never.value='';sync()}});
  function el(t,c,txt){var n=document.createElement(t);if(c)n.className=c;if(txt!=null)n.textContent=txt;return n}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim().replace(/[.!]+$/,'')}
  form.addEventListener('submit',function(e){e.preventDefault();
    var k=K[kind()],one=k.one,many=k.many;
    if(kind()==='other'){var w=clean(what.value);if(w){many=w;one=w.replace(/s$/,'')}}
    var o=clean(outI.value)||k.out,nv=clean(never.value)||k.never;nv=nv.replace(/^(never|do not|don't)\s+/i,'');
    var st=[['line-1-reads','Reads','Opens each '+one+' and pulls out: '+k.pull.join('; ').toLowerCase()+'.'],
            ['line-2-drafts','Drafts','Turns that into '+o+'.'],
            ['line-3-checks','Checks','Tests every draft against your rules, including “never '+nv+'”. Anything that fails goes back.'],
            ['line-4-you','You sign off','You read the finished work and decide. Nothing goes out without you.']];
    out.textContent='';
    var ol=el('ol','tf-line');ol.setAttribute('aria-label','Your factory, in four stations');
    st.forEach(function(s,n){var li=el('li',n===3?'you':'');var im=el('img');im.src='assets/line/'+s[0]+'.webp';im.alt='';im.width=600;im.height=460;
      var d=el('div');d.appendChild(el('b',null,(n+1)+'. '+s[1]));d.appendChild(el('p',null,s[2]));li.appendChild(im);li.appendChild(d);ol.appendChild(li)});
    out.appendChild(ol);
    var prompt='You are the first step in a small process I run every week. Your only job is to read one '+one+' and pull out the facts. Do not draft anything, reply to anyone or take any action.\n\n'
      +'From the '+one+' below, give me a short list under these headings:\n'+k.pull.map(function(x){return '- '+x}).join('\n')
      +'\n\nIf something is unclear or missing, say so rather than guessing. Later steps will use your list to produce '+o+', so keep to the facts.\n\n'
      +'Here is the '+one+':\n[paste one real example here, with anything sensitive taken out]';
    var pr=el('div','tf-prompt');pr.appendChild(el('h3',null,'Your first step, ready to paste'));
    pr.appendChild(el('p','muted','Paste this into ChatGPT, Claude, Copilot or Gemini with one real example. That is station one running.'));
    var ta=el('textarea');ta.readOnly=true;ta.value=prompt;ta.setAttribute('aria-label','First step prompt');pr.appendChild(ta);
    var acts=el('div','tf-acts'),cb=el('button','btn btn-ghost','Copy the prompt'),ok=el('span','tf-copied');cb.type='button';ok.setAttribute('role','status');
    cb.addEventListener('click',function(){function done(){ok.textContent='Copied';setTimeout(function(){ok.textContent=''},2500)}
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(prompt).then(done,function(){ta.select();document.execCommand('copy');done()});else{ta.select();document.execCommand('copy');done()}});
    acts.appendChild(cb);acts.appendChild(ok);pr.appendChild(acts);
    var nx=el('div','tf-next');nx.appendChild(el('p',null,'In the workshop we build the other three stations on your real task and chain them together, with the check in the middle.'));
    var bk=el('a','btn btn-lime','Book your place');bk.href='book.html';nx.appendChild(bk);pr.appendChild(nx);
    out.appendChild(pr);
    if(window.innerWidth<900)out.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });
  sync();
});


/* 29 Oct 2026: home quotes drift by. Pauses on hover, focus or the Pause button; reduced motion shows them still. */
document.querySelectorAll('[data-qm]').forEach(function(qm){
  var sets=qm.querySelectorAll('.qm-set'),btn=qm.querySelector('.qm-btn');
  if(sets.length===2&&!sets[1].children.length)sets[1].innerHTML=sets[0].innerHTML;
  if(btn)btn.addEventListener('click',function(){var p=qm.classList.toggle('is-paused');btn.setAttribute('aria-pressed',p?'true':'false');btn.textContent=p?'Play':'Pause'});
});

/* 2 Nov 2026, 3.45pm, revised 3.50pm: animated wordmark in the menu bar (Nikki's "Animated wordmark" video: PAIDIA
   CONSULTING types itself in and a fox leaps in and sits down). The logo is assets/brand/wordmark.webp (the video's last
   frame, paper background removed). The animation (assets/brand/wordmark.mp4, 6 seconds, no sound, drawn on white and
   blended with "multiply" so the white disappears into the menu bar) plays over it:
   - when someone arrives on the site from elsewhere, or reloads the page (Nikki expected a reload to replay it);
   - not when moving between pages of the site, so it does not repeat on every click;
   - again whenever the mouse moves onto the logo (Nikki: replay on hover).
   Never with reduced motion: the still logo only. */
/* 4 Nov 2026, 6.25pm (Nikki: the logo animation lagged). It used to create the video only when it was needed, so the
   file had to download and decode first, and the logo was hidden in the meantime, so it blinked. Now one video is
   created as soon as the page loads (it starts downloading straight away), stays invisible, and only takes over from the
   still logo once its first frame is actually on screen; at the end it hands back to the still, which is the same last
   frame, so there is no jump. Replays on hover are instant because the video is already decoded. Same rules as before:
   on arrival or reload, again on hover, never with reduced motion. */
/* 6.45pm speed pass: the logo animation file is requested once the page has loaded, so it never slows the first screen;
   the still logo (preloaded) shows until then. */
(function(){var b=document.querySelector('.site-header .brand');if(!b)return;
  var rm=window.matchMedia('(prefers-reduced-motion: reduce)');if(rm.matches)return;
  function init(){
  var v=document.createElement('video');v.className='brand-wm';v.muted=true;v.playsInline=true;v.preload='auto';
  v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');
  v.src='assets/brand/fox-logo-3.mp4';b.appendChild(v);
  var busy=false,failed=false;
  function show(){b.classList.add('wm-playing')}
  function done(){busy=false;b.classList.remove('wm-playing')}
  v.addEventListener('ended',done);v.addEventListener('error',function(){failed=true;done()});
  function onFirstFrame(){if('requestVideoFrameCallback' in v)v.requestVideoFrameCallback(show);else show()}
  v.addEventListener('playing',onFirstFrame);
  function play(){if(busy||failed||rm.matches)return;busy=true;
    try{v.currentTime=0}catch(e){}
    var p=v.play();if(p&&p.catch)p.catch(done)}
  var nav={},inside=false;
  try{nav=performance.getEntriesByType('navigation')[0]||{}}catch(e){}
  try{inside=!!document.referrer&&new URL(document.referrer).origin===location.origin}catch(e){}
  if(!inside||nav.type==='reload'){if(v.readyState>=3)play();else v.addEventListener('canplaythrough',function f(){v.removeEventListener('canplaythrough',f);play()})}
  if(window.matchMedia('(hover: hover)').matches)b.addEventListener('mouseenter',play);
  }
  if(document.readyState==='complete')init();else window.addEventListener('load',init);
})();

/* 4 Nov 2026: one spacing rhythm. When two neighbouring blocks in <main> share a background (transparent counts as the
   page's ivory), the second loses its top padding (.sec-join in site.css) so the gap between them is the same 96px as
   everywhere else instead of 192px. Runs once on load; hidden, empty and fixed elements are skipped. */
(function(){var m=document.querySelector('main');if(!m)return;
  function bg(e){var s=getComputedStyle(e),c=s.backgroundColor,img=s.backgroundImage;if(img&&img!=='none')return 'img';
    if(!c||c==='transparent'||/rgba\(.*,\s*0\)$/.test(c))return 'page';return c.replace(/\s/g,'')}
  var page=getComputedStyle(document.body).backgroundColor.replace(/\s/g,''),prev=null;
  [].slice.call(m.children).forEach(function(e){var s=getComputedStyle(e);
    if(s.display==='none'||s.position==='fixed'||s.position==='absolute'||e.getBoundingClientRect().height<4)return;
    var b=bg(e);if(b===page)b='page';
    if(prev&&b===prev.b&&b!=='img'&&!e.classList.contains('hl-hero')&&!prev.e.classList.contains('hl-hero')&&e.tagName!=='NAV'&&prev.e.tagName!=='NAV')e.classList.add('sec-join');
    prev={e:e,b:b}});
})();

/* 4 Nov 2026, 6.10pm (Nikki): the menu pill gets a little smaller once you scroll down (.is-compact in site.css).
   On after 40px, off again above 10px, so it never flickers at the threshold. All pages. */
(function(){var h=document.querySelector('.site-header');if(!h)return;var on=false;
  function f(){var y=window.scrollY;if(!on&&y>40){on=true;h.classList.add('is-compact')}else if(on&&y<10){on=false;h.classList.remove('is-compact')}}
  window.addEventListener('scroll',f,{passive:true});f();})();

/* 4 Nov 2026, 6.20pm (Nikki): the fennec fox walks along the top of the footer, right to left, small and slow, then is
   gone for a few seconds before it comes round again. Sprite: assets/brand/fox-walk.webp (23 frames cut from Nikki's
   "Animated fennec fox logo" walking video, background removed). The walk only runs while the footer is on screen, starts
   from the right edge each time the footer comes into view, and never runs for reduced-motion visitors (they see the
   fox standing at the right). Decorative: hidden from screen readers. CSS: "fox walking along the footer" in site.css. */
(function(){var f=document.querySelector('.site-footer');if(!f||f.querySelector('.fox-walk'))return;
  var lane=document.createElement('div');lane.className='fox-walk';lane.setAttribute('aria-hidden','true');
  var fox=document.createElement('span');lane.appendChild(fox);f.insertBefore(lane,f.firstChild);
  function size(){var h=fox.getBoundingClientRect().height||52,w=h*218/104;
    var speed=h*0.73; // the fox's own walking pace in the video, in pixels a second at this size, so the feet do not slide
    var walk=(window.innerWidth+w)/speed;lane.style.setProperty('--fox-dur',(walk*2).toFixed(2)+'s');/* there and back, no pause (Nikki, 6.30pm) */}
  size();window.addEventListener('resize',size);
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){lane.classList.toggle('is-on',es[0].isIntersecting)},{rootMargin:'0px 0px 40px 0px'}).observe(f);
    // speed pass: the walk picture is only fetched when the footer is within about a screen of view
    var near=new IntersectionObserver(function(es){if(es[0].isIntersecting){lane.classList.add('is-near');near.disconnect()}},{rootMargin:'0px 0px 900px 0px'});near.observe(f);}
  else lane.classList.add('is-on','is-near');
})();

/* 4 Nov 2026, 8.10pm (Nikki): when the menu pill shrinks on scroll it also gets narrower, so the fox and the menu links
   move close together instead of sitting at opposite ends with a wide empty middle. Desktop only (901px and up; phones
   already have just the logo and Menu). This sets --pill-w on the header to the width the logo, a 48px gap and the links
   need; site.css ("narrower pill after scrolling") animates the pill's max-width to it, centred, and back on the way up. */
(function(){var h=document.querySelector('.site-header');if(!h)return;var bar=h.querySelector('.bar'),brand=h.querySelector('.brand'),nav=h.querySelector('.nav');if(!bar||!brand||!nav)return;
  var mq=window.matchMedia('(min-width:901px)');
  function fit(){if(!mq.matches){h.style.removeProperty('--pill-w');return}
    var cs=getComputedStyle(bar),pad=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight)+parseFloat(cs.borderLeftWidth)+parseFloat(cs.borderRightWidth);
    var w=Math.ceil(pad+60+48+nav.scrollWidth);/* 60 = compact logo width */
    h.style.setProperty('--pill-w',w+'px')}
  fit();window.addEventListener('resize',fit);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  new MutationObserver(fit).observe(h,{attributes:true,attributeFilter:['class']});})();
