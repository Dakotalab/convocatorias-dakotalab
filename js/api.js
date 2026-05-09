/* api.js - Llamadas a Serper.dev y Google Gemini */

// -- SERPER (busqueda web) ---------------------------------------------------
async function searchSerper(query, serperKey) {
    const resp = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: query, gl: 'co', hl: 'es', num: 10 })
    });
    if (!resp.ok) throw new Error('Serper error ' + resp.status);
    const data = await resp.json();
    return data.organic || [];
}

// -- GEMINI (analisis unico en lote) ----------------------------------------
async function analyzeWithGemini(organic, geminiKey, categoriasSeleccionadas) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;

  const customPrompt =
        SYSTEM_PROMPT +
        `\n\n=== ATENCION: BUSQUEDA MULTIPLE ===\n` +
        `Analiza para TODAS estas categorias en una sola pasada:\n` +
        `[ ${categoriasSeleccionadas.join(', ')} ]\n\n` +
        `Extrae todas las convocatorias aplicables de los resultados consolidados.`;

  const body = {
        system_instruction: { parts: [{ text: customPrompt }] },
        contents: [{ parts: [{ text: 'Resultados de busqueda web CONSOLIDADOS:\n\n' + JSON.stringify(organic) }] }],
        generationConfig: { responseMimeType: 'application/json' }
  };

  const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
  });

  if (!resp.ok) {
        if (resp.status === 429) throw new Error('429_RATE_LIMIT');
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Gemini error ' + resp.status);
  }

  const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return parseGeminiJSON(text);
}

// -- PARSER -----------------------------------------------------------------
function parseGeminiJSON(text) {
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    try { return JSON.parse(cleaned); }
    catch {
          const match = cleaned.match(/\{[\s\S]*\}/);
          if (match) return JSON.parse(match[0]);
          throw new Error('JSON invalido de Gemini');
    }
}
