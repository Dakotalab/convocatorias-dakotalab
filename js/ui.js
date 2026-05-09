/* ui.js - Componentes visuales: chips, tarjetas, filtros, secciones colapsables, toast */

// -- CHIPS (categorias) ------------------------------------------------------
function buildChips() {
    const grid = document.getElementById('chips-grid');
    grid.innerHTML = CATEGORIES.map(c => `
        <div class="chip" id="chip-${c.id}" role="button" aria-pressed="false"
                 tabindex="0" onclick="toggleCat('${c.id}')"
                          onkeydown="if(event.key==='Enter'||event.key===' ')toggleCat('${c.id}')">
                                <span class="chip-emoji">${c.emoji}</span>
                                      <span class="chip-label">${c.label}</span>
                                            <span class="chip-check">v</span>
                                                </div>`).join('');
}

function toggleCat(id) {
    const chip    = document.getElementById('chip-' + id);
    const pressed = chip.getAttribute('aria-pressed') === 'true';
    chip.setAttribute('aria-pressed', String(!pressed));
    checkSearchBtn();
}

function selectAllCats() {
    CATEGORIES.forEach(c => document.getElementById('chip-' + c.id).setAttribute('aria-pressed', 'true'));
    checkSearchBtn();
}

function deselectAllCats() {
    CATEGORIES.forEach(c => document.getElementById('chip-' + c.id).setAttribute('aria-pressed', 'false'));
    checkSearchBtn();
}

function getSelectedCats() {
    return CATEGORIES.filter(c => document.getElementById('chip-' + c.id)?.getAttribute('aria-pressed') === 'true');
}

// -- SECTIONS (colapsables) --------------------------------------------------
function toggleSection(name) {
    const body = document.getElementById(name + '-body');
    const btn  = document.getElementById(name + '-toggle-btn');
    if (!collapsedSections[name]) {
          collapsedSections[name] = true;
          body.classList.add('collapsed');
          btn.textContent = 'Mostrar';
    } else {
          collapsedSections[name] = false;
          body.classList.remove('collapsed');
          body.style.maxHeight = name === 'keys' ? '400px' : '600px';
          btn.textContent = 'Ocultar';
    }
}

// -- SEARCH BUTTON STATE -----------------------------------------------------
function checkSearchBtn() {
    const btn     = document.getElementById('search-btn');
    const hasKeys = !!getKeys();
    const hasCats = getSelectedCats().length > 0;
    btn.disabled  = !(hasKeys && hasCats);
}

// -- FILTERS -----------------------------------------------------------------
function setTypeFilter(val, el) {
    activeTypeFilter = val;
    document.querySelectorAll('[data-filter-type]').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    applyFilters();
}

function setUrgFilter(val, el) {
    activeUrgFilter = val;
    document.querySelectorAll('[data-filter-urg]').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    applyFilters();
}

function applyFilters() {
    document.querySelectorAll('.card').forEach(card => {
          const matchType = activeTypeFilter === 'all' || card.dataset.tipo     === activeTypeFilter;
          const matchUrg  = activeUrgFilter  === 'all' || card.dataset.urgencia === activeUrgFilter;
          card.style.display = (matchType && matchUrg) ? '' : 'none';
    });
}

// -- RENDER CARDS -------------------------------------------------------------
function renderCards(convs) {
    const grid = document.getElementById('results-grid');
    if (!convs.length) {
          grid.innerHTML = `<div class="empty-state">
                <div class="empty-icon">Q</div>
                      <div class="empty-title">No se encontraron convocatorias</div>
                            <div style="font-size:.8rem;color:var(--muted);margin-top:6px">Intenta seleccionar mas categorias o ampliar la busqueda.</div>
                                </div>`;
          return;
    }
    grid.innerHTML = convs.map((c, i) => cardHTML(c, i)).join('');
}

function cardHTML(c, i) {
    const stateBadge = {
          abierta:   '<span class="badge badge-open">v Abierta</span>',
          proxima:   '<span class="badge badge-soon">v Proxima</span>',
          periodica: '<span class="badge badge-periodic">v Periodica</span>',
    }[c.estado] || `<span class="badge badge-other">${c.estado || '-'}</span>`;

  const typeBadge = {
        financiamiento:   '<span class="badge badge-fin">$ Financiamiento</span>',
        contrato:         '<span class="badge badge-tech">C Contrato</span>',
        premio:           '<span class="badge badge-prize">P Premio</span>',
        rse:              '<span class="badge badge-grant">R RSE</span>',
        fondo_publico:    '<span class="badge badge-periodic">G Fondo publico</span>',
        dotacion_equipos: '<span class="badge badge-other">E Equipos</span>',
        otro:             '<span class="badge badge-other">O Otro</span>',
  }[c.tipo] || `<span class="badge badge-other">O ${c.tipo || '-'}</span>`;

  const urgBadge = c.urgencia === 'alta'
      ? '<span class="badge badge-urgent">! Urgente</span>'
        : '';

  const date     = c.fecha_cierre && c.fecha_cierre !== 'Por confirmar'
      ? `<span class="date-val">D ${c.fecha_cierre}</span>`
        : `<span style="color:var(--muted)">Por confirmar</span>`;

  const linkBtn  = c.url
      ? `<a href="${escape(c.url)}" target="_blank" rel="noopener" class="view-btn">Ver convocatoria -></a>`
        : `<span class="no-url">Sin URL disponible</span>`;

  return \`
    <div class="card" data-tipo="\${escape(c.tipo)}" data-urgencia="\${escape(c.urgencia)}" style="animation-delay:\${i * 0.05}s">
        <div class="card-header">
              \${stateBadge}\${typeBadge}\${urgBadge}
                  </div>
                      <div class="card-body">
                            <div class="card-name">\${escape(c.nombre || '-')}</div>
                                  <div class="card-entity">\${escape(c.entidad || '-')}</div>
                                        <div class="card-desc">\${escape(c.descripcion || '')}</div>
                                              \${c.requisitos ? \`<div class="card-reqs"><strong>Requisitos</strong>\${escape(c.requisitos)}</div>\` : ''}
                                                  </div>
                                                      <div class="card-footer">
                                                            <div class="card-date">\${date}
                                                                    \${c.fuente ? \`<span style="color:var(--muted);font-size:.7rem">. \${escape(c.fuente)}</span>\` : ''}
                                                                          </div>
                                                                                \${linkBtn}
                                                                                    </div>
                                                                                      </div>\`;
                                                                                      }

                                                                                      function escape(str) {
                                                                                        return String(str)
                                                                                            .replace(/&/g, '&amp;')
                                                                                                .replace(/</g, '&lt;')
                                                                                                    .replace(/>/g, '&gt;')
                                                                                                        .replace(/"/g, '&quot;');
                                                                                                        }
                                                                                                        
                                                                                                        // -- STATUS (header pill) -----------------------------------------------------
                                                                                                        function setStatus(type, text) {
                                                                                                          const dot  = document.getElementById('status-dot');
                                                                                                            const span = document.getElementById('status-text');
                                                                                                              dot.className    = 'status-dot ' + type;
                                                                                                                span.textContent = text;
                                                                                                                }
                                                                                                                
                                                                                                                // -- COPY RESULTS -------------------------------------------------------------
                                                                                                                function copyResults() {
                                                                                                                  if (!allResults.length) return;
                                                                                                                    const text = allResults.map((c, i) => [
                                                                                                                        \`\${i + 1}. \${c.nombre}\`,
                                                                                                                            \`   Entidad: \${c.entidad}\`,
                                                                                                                                \`   Tipo: \${c.tipo} | Estado: ${c.estado} | Urgencia: ${c.urgencia}`,
        `   ${c.descripcion}`,
        `   Cierre: ${c.fecha_cierre}`,
        c.url ? `   URL: ${c.url}` : '',
        ''
    ].filter(Boolean).join('\n')).join('\n');

  navigator.clipboard.writeText(text)
      .then(()  => showToast('C Copiado al portapapeles', 'success'))
      .catch(()  => showToast('Error al copiar', 'err'));
}

// -- TOAST ---------------------------------------------------------------------
let toastTimer;
function showToast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className   = 'toast ' + type + ' show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}
