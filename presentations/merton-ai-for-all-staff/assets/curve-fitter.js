/*
 * Interactive curve fitter (slides "AI learns patterns" + "How AI fits the curve").
 * Ported 7 Oct 2026 from Session_1_Introduction_to_AI (the ZINC-era Editorial Mono
 * deck, commits b6cf7c6 / 57faab4 / 4e36c78) into the Riso Zine deck:
 * recoloured to the four inks, larger type for the 1920x1080 stage, Chart.js
 * vendored locally (assets/chart.umd.js, v4.4.1) so it works offline, and the
 * old reveal.js key-swallowing on buttons replaced with blur-after-click.
 * Each block finds its slide by [data-pptx-slide="8"] / [data-pptx-slide="8b"].
 */
if (window.Chart) {
  Chart.defaults.font.family = '"JetBrains Mono", ui-monospace, monospace';
  Chart.defaults.font.size = 18;
  Chart.defaults.color = 'rgba(26,20,56,0.75)';
}

/* Slide 8 - interactive curve fitter */
(function(){
  const slideEl = document.querySelector('[data-pptx-slide="8"]');
  if (!slideEl) return;
  let mode = 'quad';
  let data = [];
  let chart;
  const $ = (id) => document.getElementById(id);

  function generateData() {
    const trueA = (Math.random() - 0.5) * 1.6;
    const trueB = (Math.random() - 0.5) * 8;
    const trueC = (Math.random() - 0.5) * 30;
    const noise = 4;
    const pts = [];
    for (let i = 0; i < 35; i++) {
      const x = -10 + (i / 34) * 20 + (Math.random() - 0.5) * 0.4;
      const y = trueA * x * x + trueB * x + trueC + (Math.random() - 0.5) * 2 * noise;
      pts.push({ x: +x.toFixed(2), y: +y.toFixed(2) });
    }
    return pts;
  }
  function predict(x, p) {
    if (mode === 'quad') return p.a * x * x + p.b * x + p.c;
    return p.m * x + p.c;
  }
  function getParams() {
    return {
      a: parseFloat($('cf-s-a').value),
      b: parseFloat($('cf-s-b').value),
      m: parseFloat($('cf-s-m').value),
      c: parseFloat($('cf-s-c').value),
    };
  }
  function curvePoints(p) {
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const x = -12 + (i / 100) * 24;
      pts.push({ x, y: predict(x, p) });
    }
    return pts;
  }
  function computeStats(p) {
    const ys = data.map(d => d.y);
    const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
    let sse = 0, sst = 0;
    for (const d of data) {
      const yhat = predict(d.x, p);
      sse += (d.y - yhat) ** 2;
      sst += (d.y - meanY) ** 2;
    }
    const r2 = sst === 0 ? 0 : 1 - sse / sst;
    return { sse, r2 };
  }
  const fmt = (n, d=2) => n.toFixed(d);
  const fmtSigned = (n, d=2) => (n >= 0 ? '+ ' : '- ') + Math.abs(n).toFixed(d);

  function initChart() {
    const ctx = $('cf-chart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'Data', data: data, backgroundColor: '#1a1438', borderColor: '#1a1438', pointRadius: 7, pointHoverRadius: 9 },
          { label: 'Fit', data: [], type: 'line', borderColor: '#ff5fa2', backgroundColor: 'transparent', borderWidth: 6, pointRadius: 0, tension: 0.1 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { type: 'linear', min: -12, max: 12, grid: { color: 'rgba(26,20,56,0.12)' }, ticks: { color: 'rgba(26,20,56,0.65)', font: { size: 18 } } },
          y: { grid: { color: 'rgba(26,20,56,0.12)' }, ticks: { color: 'rgba(26,20,56,0.65)', font: { size: 18 } } }
        }
      }
    });
  }
  function update() {
    const p = getParams();
    $('cf-o-a').textContent = fmt(p.a);
    $('cf-o-b').textContent = fmt(p.b);
    $('cf-o-m').textContent = fmt(p.m);
    $('cf-o-c').textContent = fmt(p.c, 1);
    let eq;
    if (mode === 'quad') {
      eq = `y = ${fmt(p.a)}x² ${fmtSigned(p.b)}x ${fmtSigned(p.c, 1)}`;
    } else {
      eq = `y = ${fmt(p.m)}x ${fmtSigned(p.c, 1)}`;
    }
    $('cf-eq').textContent = eq;
    const { sse, r2 } = computeStats(p);
    $('cf-sse').textContent = sse.toFixed(1);
    $('cf-r2').textContent = r2.toFixed(3);
    chart.data.datasets[1].data = curvePoints(p);
    chart.update('none');
  }
  function setMode(newMode) {
    mode = newMode;
    slideEl.querySelector('[data-param="a"]').style.display = mode === 'quad' ? 'flex' : 'none';
    slideEl.querySelector('[data-param="b"]').style.display = mode === 'quad' ? 'flex' : 'none';
    slideEl.querySelector('[data-param="m"]').style.display = mode === 'lin' ? 'flex' : 'none';
    $('cf-mode-quad').classList.toggle('cf-btn-active', mode === 'quad');
    $('cf-mode-lin').classList.toggle('cf-btn-active', mode === 'lin');
    update();
  }
  function regenerate() {
    data = generateData();
    chart.data.datasets[0].data = data;
    const ys = data.map(d => d.y);
    const pad = (Math.max(...ys) - Math.min(...ys)) * 0.15;
    chart.options.scales.y.min = Math.min(...ys) - pad;
    chart.options.scales.y.max = Math.max(...ys) + pad;
    update();
  }
  function boot() {
    if (typeof Chart === 'undefined') { setTimeout(boot, 100); return; }
    data = generateData();
    initChart();
    const ys = data.map(d => d.y);
    const pad = (Math.max(...ys) - Math.min(...ys)) * 0.15;
    chart.options.scales.y.min = Math.min(...ys) - pad;
    chart.options.scales.y.max = Math.max(...ys) + pad;
    ['cf-s-a','cf-s-b','cf-s-m','cf-s-c'].forEach(id => {
      $(id).addEventListener('input', update);
    });
    $('cf-mode-quad').addEventListener('click', () => setMode('quad'));
    $('cf-mode-lin').addEventListener('click', () => setMode('lin'));
    $('cf-regen').addEventListener('click', regenerate);
    update();
    // Prevent reveal.js arrow-key navigation from firing while interacting with sliders
    // Merton port: sliders keep their own arrow keys (the deck already ignores
    // INPUT targets); buttons hand focus straight back so Left/Right/Space
    // keep driving the deck after a click.
    slideEl.querySelectorAll('button').forEach(el => {
      el.addEventListener('click', () => { setTimeout(() => el.blur(), 0); });
    });
  }
  boot();
})();


/* Slide 8b - curve fitter with gradient descent */
(function(){
  const slideEl = document.querySelector('[data-pptx-slide="8b"]');
  if (!slideEl) return;
  let mode = 'quad';
  let data = [];
  let chart;
  let proposal = null;
  let runHandle = null;
  let iter = 0;
  const $ = (id) => document.getElementById(id);

  const LR = { a: 0.0003, b: 0.008, m: 0.008, c: 0.03 };

  function generateData() {
    const trueA = (Math.random() - 0.5) * 1.6;
    const trueB = (Math.random() - 0.5) * 8;
    const trueC = (Math.random() - 0.5) * 30;
    const noise = 4;
    const pts = [];
    for (let i = 0; i < 35; i++) {
      const x = -10 + (i / 34) * 20 + (Math.random() - 0.5) * 0.4;
      const y = trueA * x * x + trueB * x + trueC + (Math.random() - 0.5) * 2 * noise;
      pts.push({ x: +x.toFixed(2), y: +y.toFixed(2) });
    }
    return pts;
  }
  function predict(x, p) {
    if (mode === 'quad') return p.a * x * x + p.b * x + p.c;
    return p.m * x + p.c;
  }
  function getParams() {
    return {
      a: parseFloat($('cf2-s-a').value),
      b: parseFloat($('cf2-s-b').value),
      m: parseFloat($('cf2-s-m').value),
      c: parseFloat($('cf2-s-c').value),
    };
  }
  function setParams(p) {
    if ('a' in p) $('cf2-s-a').value = clamp(p.a, -2, 2);
    if ('b' in p) $('cf2-s-b').value = clamp(p.b, -10, 10);
    if ('m' in p) $('cf2-s-m').value = clamp(p.m, -10, 10);
    if ('c' in p) $('cf2-s-c').value = clamp(p.c, -30, 30);
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function curvePoints(p) {
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const x = -12 + (i / 100) * 24;
      pts.push({ x, y: predict(x, p) });
    }
    return pts;
  }
  function computeStats(p) {
    const ys = data.map(d => d.y);
    const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
    let sse = 0, sst = 0;
    for (const d of data) {
      const yhat = predict(d.x, p);
      sse += (d.y - yhat) ** 2;
      sst += (d.y - meanY) ** 2;
    }
    const r2 = sst === 0 ? 0 : 1 - sse / sst;
    return { sse, r2 };
  }
  function computeGradient(p) {
    const N = data.length;
    let gA = 0, gB = 0, gM = 0, gC = 0;
    for (const d of data) {
      const yhat = predict(d.x, p);
      const err = d.y - yhat; // residual
      if (mode === 'quad') {
        gA += -2 * d.x * d.x * err;
        gB += -2 * d.x * err;
      } else {
        gM += -2 * d.x * err;
      }
      gC += -2 * err;
    }
    return { a: gA/N, b: gB/N, m: gM/N, c: gC/N };
  }
  function computeStep(p) {
    const g = computeGradient(p);
    if (mode === 'quad') {
      return { a: -LR.a * g.a, b: -LR.b * g.b, c: -LR.c * g.c };
    } else {
      return { m: -LR.m * g.m, c: -LR.c * g.c };
    }
  }
  const fmt = (n, d=2) => n.toFixed(d);
  const fmtSigned = (n, d=2) => (n >= 0 ? '+ ' : '- ') + Math.abs(n).toFixed(d);
  const fmtDelta = (n, d=3) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(d);

  function initChart() {
    const ctx = $('cf2-chart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'Data', data: data, backgroundColor: '#1a1438', borderColor: '#1a1438', pointRadius: 7, pointHoverRadius: 9 },
          { label: 'Fit', data: [], type: 'line', borderColor: '#ff5fa2', backgroundColor: 'transparent', borderWidth: 6, pointRadius: 0, tension: 0.1 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { type: 'linear', min: -12, max: 12, grid: { color: 'rgba(26,20,56,0.12)' }, ticks: { color: 'rgba(26,20,56,0.65)', font: { size: 18 } } },
          y: { grid: { color: 'rgba(26,20,56,0.12)' }, ticks: { color: 'rgba(26,20,56,0.65)', font: { size: 18 } } }
        }
      }
    });
  }
  function showProposal(step) {
    proposal = step;
    let txt;
    if (mode === 'quad') {
      txt = `Δa ${fmtDelta(step.a, 4)}  ·  Δb ${fmtDelta(step.b, 3)}  ·  Δc ${fmtDelta(step.c, 2)}`;
    } else {
      txt = `Δm ${fmtDelta(step.m, 3)}  ·  Δc ${fmtDelta(step.c, 2)}`;
    }
    const el = $('cf2-gd-deltas');            // Merton: proposal panel removed; keep this harmless
    if (el) el.textContent = txt;
  }
  function recomputeProposal() {
    showProposal(computeStep(getParams()));
  }
  function applyStep(step) {
    const p = getParams();
    const next = { ...p };
    if ('a' in step) next.a = p.a + step.a;
    if ('b' in step) next.b = p.b + step.b;
    if ('m' in step) next.m = p.m + step.m;
    if ('c' in step) next.c = p.c + step.c;
    setParams(next);
    iter++;
    update();
  }
  function fmtGrad(label, val, digits) {
    const cls = val >= 0 ? 'cf-grad-pos' : 'cf-grad-neg';
    const sign = val >= 0 ? '+' : '−';
    return `<span class="${cls}">∇${label} = ${sign}${Math.abs(val).toFixed(digits)}</span>`;
  }
  function update() {
    const p = getParams();
    $('cf2-o-a').textContent = fmt(p.a);
    $('cf2-o-b').textContent = fmt(p.b);
    $('cf2-o-m').textContent = fmt(p.m);
    $('cf2-o-c').textContent = fmt(p.c, 1);
    let eq;
    if (mode === 'quad') {
      eq = `y = ${fmt(p.a)}x² ${fmtSigned(p.b)}x ${fmtSigned(p.c, 1)}`;
    } else {
      eq = `y = ${fmt(p.m)}x ${fmtSigned(p.c, 1)}`;
    }
    $('cf2-eq').textContent = eq;
    const { sse, r2 } = computeStats(p);
    $('cf2-sse').textContent = sse.toFixed(1);
    $('cf2-r2').textContent = r2.toFixed(3);
    $('cf2-iter').textContent = iter > 0 ? `(iter ${iter})` : '';
    const g = computeGradient(p);
    let gradHtml;
    if (mode === 'quad') {
      gradHtml = [fmtGrad('a', g.a, 2), fmtGrad('b', g.b, 2), fmtGrad('c', g.c, 2)].join('   ·   ');
    } else {
      gradHtml = [fmtGrad('m', g.m, 2), fmtGrad('c', g.c, 2)].join('   ·   ');
    }
    $('cf2-grads').innerHTML = gradHtml;
    chart.data.datasets[1].data = curvePoints(p);
    chart.update('none');
  }
  function setMode(newMode) {
    mode = newMode;
    slideEl.querySelector('[data-param="a"]').style.display = mode === 'quad' ? 'flex' : 'none';
    slideEl.querySelector('[data-param="b"]').style.display = mode === 'quad' ? 'flex' : 'none';
    slideEl.querySelector('[data-param="m"]').style.display = mode === 'lin' ? 'flex' : 'none';
    $('cf2-mode-quad').classList.toggle('cf-btn-active', mode === 'quad');
    $('cf2-mode-lin').classList.toggle('cf-btn-active', mode === 'lin');
    iter = 0;
    update();
    recomputeProposal();
  }
  function regenerate() {
    stopRun();
    data = generateData();
    chart.data.datasets[0].data = data;
    const ys = data.map(d => d.y);
    const pad = (Math.max(...ys) - Math.min(...ys)) * 0.15;
    chart.options.scales.y.min = Math.min(...ys) - pad;
    chart.options.scales.y.max = Math.max(...ys) + pad;
    iter = 0;
    update();
    recomputeProposal();
  }
  function resetParams() {
    stopRun();
    setParams({ a: 0, b: 0, m: 0, c: 0 });
    iter = 0;
    update();
    recomputeProposal();
  }
  function stepOnce() {
    recomputeProposal();
  }
  function applyProposal() {
    if (!proposal) recomputeProposal();
    applyStep(proposal);
    recomputeProposal();
  }
  function stopRun() {
    if (runHandle) { clearInterval(runHandle); runHandle = null; }
    $('cf2-gd-run').textContent = 'Auto-run ▶';
    $('cf2-gd-run').classList.remove('cf-btn-active');
  }
  function toggleRun() {
    if (runHandle) { stopRun(); return; }
    $('cf2-gd-run').textContent = 'Stop ■';
    $('cf2-gd-run').classList.add('cf-btn-active');
    runHandle = setInterval(() => {
      const step = computeStep(getParams());
      applyStep(step);
      showProposal(computeStep(getParams()));
    }, 200);                                     // Merton: one visible move every 0.2 s (David, 8 Oct)
  }
  function boot() {
    if (typeof Chart === 'undefined') { setTimeout(boot, 100); return; }
    data = generateData();
    initChart();
    const ys = data.map(d => d.y);
    const pad = (Math.max(...ys) - Math.min(...ys)) * 0.15;
    chart.options.scales.y.min = Math.min(...ys) - pad;
    chart.options.scales.y.max = Math.max(...ys) + pad;
    ['cf2-s-a','cf2-s-b','cf2-s-m','cf2-s-c'].forEach(id => {
      $(id).addEventListener('input', () => { update(); recomputeProposal(); });
    });
    $('cf2-mode-quad').addEventListener('click', () => setMode('quad'));
    $('cf2-mode-lin').addEventListener('click', () => setMode('lin'));
    $('cf2-regen').addEventListener('click', regenerate);
    $('cf2-reset').addEventListener('click', resetParams);
    if ($('cf2-gd-step')) $('cf2-gd-step').addEventListener('click', stepOnce);
    if ($('cf2-gd-apply')) $('cf2-gd-apply').addEventListener('click', applyProposal);
    $('cf2-gd-run').addEventListener('click', toggleRun);
    update();
    recomputeProposal();
    // Merton port: sliders keep their own arrow keys (the deck already ignores
    // INPUT targets); buttons hand focus straight back so Left/Right/Space
    // keep driving the deck after a click.
    slideEl.querySelectorAll('button').forEach(el => {
      el.addEventListener('click', () => { setTimeout(() => el.blur(), 0); });
    });
  }
  boot();
})();

