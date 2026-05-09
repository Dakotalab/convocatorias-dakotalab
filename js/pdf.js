/* pdf.js - Exportar resultados a PDF via ventana de impresion */

function exportPDF() {
  if (!allResults.length) {
      showToast('No hay resultados para exportar', 'err');
          return;
            }

              // Titulo dinamico en el documento de impresion
                const original = document.title;
                  const fecha    = new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' });
                    document.title = `DakotaLab - Radar de Convocatorias - \${fecha}`;

                      window.print();

                        // Restaurar titulo original tras cerrar el dialogo
                          setTimeout(() => { document.title = original; }, 1000);
                          }
                          
