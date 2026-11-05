/* 2 Nov 2026: Our work headline types itself out, letter by letter, with a blinking cursor.
   Every letter is laid out from the start (just invisible), so nothing below the headline moves while it types.
   Screen readers read the hidden full sentence in the h1. Reduced motion or no script: the headline simply shows. */
(function(){
  var el=document.querySelector('[data-tw]'); if(!el) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var chars=[];
  (function wrap(node){
    [].slice.call(node.childNodes).forEach(function(n){
      if(n.nodeType===3){
        var frag=document.createDocumentFragment();
        n.textContent.split('').forEach(function(ch){var s=document.createElement('span');s.className='tw-c';s.textContent=ch;frag.appendChild(s);chars.push(s);});
        node.replaceChild(frag,n);
      } else if(n.nodeType===1 && n.tagName!=='BR'){ wrap(n); }
    });
  })(el);
  var caret=document.createElement('span'); caret.className='tw-caret';
  el.classList.add('is-typing');
  el.insertBefore(caret, el.firstChild);
  var i=0;
  function step(){
    if(i>=chars.length){ el.classList.add('is-done'); setTimeout(function(){caret.classList.add('is-gone');},2600); return; }
    var c=chars[i++]; c.classList.add('on');
    if(c.nextSibling) c.parentNode.insertBefore(caret,c.nextSibling); else c.parentNode.appendChild(caret);
    var ch=c.textContent, d=ch===' '?25:(ch==='.'?160:30+Math.random()*25); // 4 Nov (Nikki: faster). Was 40, 260, 55 to 100ms
    if(c.nextSibling && c.nextSibling.nextSibling && c.nextSibling.nextSibling.tagName==='BR') d=200;
    setTimeout(step,d);
  }
  setTimeout(step,250);
})();
