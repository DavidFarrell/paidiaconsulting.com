/* 2 Nov 2026: About page headline, "We are [Founders] who build."
   The coral word rolls like a slot: the old word glides up and out while the next glides up into place,
   inside a clipped window so the two never overlap. 2.6 s hold, 700ms roll, smooth ease-in-out.
   The window is as wide as the longest word, so nothing around it moves. Reduced motion: "Founders" only.
   Screen readers get one full sentence from the hidden text in the h1.
   4 Nov 2026, 9.40pm: about.html already contains every word span and the is-ready class, so the headline has its
   final size before this script runs (it used to grow by a line on load and push the page down). The script rebuilds
   the same spans. */
(function(){
  var rot=document.querySelector('.ab-rot[data-words]'); if(!rot) return;
  var words=rot.getAttribute('data-words').split('|'); if(words.length<2) return;
  rot.textContent='';
  var els=words.map(function(w,i){var s=document.createElement('span');s.className='rot-w'+(i===0?' is-on':'');s.textContent=w;rot.appendChild(s);return s;});
  rot.classList.add('is-ready');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)'), cur=0, timer=null, HOLD=1200, ROLL=350; // 4 Nov: 2600 and 700, then 1800 and 450; 8.55pm Nikki: faster still, and "Humans" added last
  function show(i){
    var o=els[cur], n=els[i];
    o.classList.remove('is-on'); o.classList.add('is-out');
    n.classList.add('is-on');
    setTimeout(function(){ o.classList.add('no-tr'); o.classList.remove('is-out'); void o.offsetWidth; o.classList.remove('no-tr'); }, ROLL+50);
    cur=i;
  }
  function loop(){clearTimeout(timer);if(reduce.matches)return;timer=setTimeout(function(){show((cur+1)%els.length);loop();},HOLD+ROLL);}
  function reset(){clearTimeout(timer);els.forEach(function(e,i){e.classList.add('no-tr');e.classList.toggle('is-on',i===0);e.classList.remove('is-out');void e.offsetWidth;e.classList.remove('no-tr');});cur=0;}
  document.addEventListener('visibilitychange',function(){ if(document.hidden) clearTimeout(timer); else loop(); });
  if(reduce.addEventListener)reduce.addEventListener('change',function(){if(reduce.matches)reset();else loop();});
  loop();
})();
