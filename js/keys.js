/* keys.js - Gestion de API Keys (Gemini + Serper) */

function loadKeys() {
  const gk = localStorage.getItem(LS + 'gemini');
  const sk = localStorage.getItem(LS + 'serper');
  if (gk) document.getElementById('gemini-key').value = gk;
  if (sk) document.getElementById('serper-key').value  = sk;
  if (gk && sk) {
    document.getElementById('keys-badge').style.display = 'inline-flex';
    collapseKeys();
  }
  checkSearchBtn();
}

function saveKeys() {
  const gk = document.getElementById('gemini-key').value.trim();
  const sk = document.getElementById('serper-key').value.trim();
  if (!gk || !sk) { showToast('Completa ambas claves', 'err'); return; }
  localStorage.setItem(LS + 'gemini', gk);
  localStorage.setItem(LS + 'serper', sk);
  document.getElementById('keys-badge').style.display = 'inline-flex';
  collapseKeys();
  showToast('v Claves guardadas correctamente', 'success');
  checkSearchBtn();
}

function collapseKeys() {
  if (!collapsedSections.keys) toggleSection('keys');
}

function getKeys() {
  const gk = localStorage.getItem(LS + 'gemini');
  const sk = localStorage.getItem(LS + 'serper');
  return (gk && sk) ? { geminiKey: gk, serperKey: sk } : null;
}

function toggleEye(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') { inp.type = 'text';     btn.textContent = 'E'; }
  else                         { inp.type = 'password'; btn.textContent = 'E'; }
}
