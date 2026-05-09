/* search.js - Logica principal de busqueda y progreso */

// -- PROGRESO -----------------------------------------------------------------
function showProgress(cats) {
    document.getElementById('progress-panel').style.display = 'block';
    document.getElementById('progress-bar').style.width     = '0%';
    const container = document.getElementById('progress-steps');
    container.innerHTML = cats.map(c => `
        <div class="step-item" id="step-${c.id}">
              <span class="step-icon">T</span>
                    <span>${c.emoji} ${c.label}</span>
                        </div>`).join('');
}

function updateStep(id, state, msg = '') {
    const el   = document.getElementById('step-' + id);
    if (!el) return;
    const icon = el.querySelector('.step-icon');
    el.className = 'step-item ' + state;
    if (state === 'active')      icon.innerHTML  = '<span class="spinning">G</span>';
    else if (state === 'done')   icon.textContent = 'v';
    else if (state === 'error') {
          icon.textContent = 'x';
          if (msg) el.innerHTML += ` <span style="color:var(--danger);font-size:.75rem;margin-left:8px;">(\${msg})</span>`;
    }
}

function setProgress(pct) {
    document.getElementById('progress-bar').style.width = pct + '%';
}

// -- RATE LIMIT COUNTDOWN -----------------------------------------------------
function startCountdown() {
    const msgEl   = document.getElementById('rate-limit-msg');
    const timerEl = document.getElementById('countdown-timer');
    const btn     = document.getElementById('search-btn');
    msgEl.style.display = 'block';
    let left = 60;
    timerEl.textContent = left;
    timerInterval = setInterval(() => {
          left--;
          timerEl.textContent = left;
          if (left <= 0) {
                  clearInterval(timerInterval);
                  msgEl.style.display = 'none';
                  btn.disabled        = false;
                  checkSearchBtn();
          }
    }, 1000);
}

// -- MAIN SEARCH ---------------------------------------------------------------
async function startSearch() {
    const keys = getKeys();
    const cats = getSelectedCats();
    if (!keys || !cats.length) return;

  clearInterval(timerInterval);
    document.getElementById('search-btn').disabled           = true;
    document.getElementById('rate-limit-msg').style.display  = 'none';
    document.getElementById('ai-batch-indicator').style.display = 'block';
    document.getElementById('filters-bar').style.display     = 'none';
    document.getElementById('results-grid').innerHTML        = '';
    allResults = [];
    setStatus('searching', 'Buscando...');

  // Anadir paso extra de Gemini al panel de progreso
  showProgress([
        ...cats,
    { id: 'ai-gemini', emoji: 'R', label: 'Analisis global inteligente (Gemini)' }
      ]);

  const total           = cats.length + 1; // N llamadas Serper + 1 Gemini
  let done              = 0;
    const errors          = [];
    const combinedOrganic = [];

  // FASE 1 - Busqueda web (Serper), una categoria a la vez
  for (const cat of cats) {
        updateStep(cat.id, 'active');
        try {
                const organic = await searchSerper(cat.query, keys.serperKey);
                combinedOrganic.push(...organic);
                updateStep(cat.id, 'done');
        } catch (e) {
                updateStep(cat.id, 'error', `Serper: \${e.message}`);
                errors.push(`\${cat.label}: Serper - \${e.message}`);
        }
        done++;
        setProgress(done / total * 100);
        await new Promise(r => setTimeout(r, 200)); // Pausa minima entre llamadas
  }

  // FASE 2 - Analisis unico con Gemini (batch)
  if (combinedOrganic.length > 0) {
        updateStep('ai-gemini', 'active');
        try {
                const labels = cats.map(c => c.label);
                const parsed = await analyzeWithGemini(combinedOrganic, keys.geminiKey, labels);
                allResults   = parsed.convocatorias || [];
                updateStep('ai-gemini', 'done');
        } catch (e) {
                const is429 = e.message === '429_RATE_LIMIT';
                updateStep('ai-gemini', 'error', is429 ? 'Limite de velocidad (429)' : e.message);
                if (is429) {
                          startCountdown();
                          setStatus('error', 'Limite de velocidad');
                          document.getElementById('search-btn').disabled = true;
                          return;
                }
                errors.push(`Gemini - \${e.message}`);
        }
        done++;
        setProgress(done / total * 100);
  } else {
        updateStep('ai-gemini', 'error', 'No hay resultados web para analizar');
  }

  // Deduplicar y ordenar por urgencia / estado
  allResults = deduplicate(allResults);
    allResults.sort((a, b) => {
          const up = { alta: 0, media: 1, baja: 2 };
          const us = { abierta: 0, proxima: 1, periodica: 2 };
          if ((up[a.urgencia] ?? 1) !== (up[b.urgencia] ?? 1))
                  return (up[a.urgencia] ?? 1) - (up[b.urgencia] ?? 1);
          return (us[a.estado] ?? 2) - (us[b.estado] ?? 2);
    });

  renderCards(allResults);

  if (allResults.length > 0) {
        document.getElementById('filters-bar').style.display   = 'block';
        document.getElementById('results-count').textContent   = allResults.length + ' convocatorias encontradas';
  }

  setStatus(errors.length ? 'error' : 'done',
                        errors.length ? errors.length + ' error(es)' : allResults.length + ' encontradas');

  document.getElementById('search-btn').disabled = false;
    checkSearchBtn();
}

// -- DEDUPLICACION -------------------------------------------------------------
function deduplicate(arr) {
    const seen = new Set();
    return arr.filter(c => {
          const key = (c.nombre || '').toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
    });
}
