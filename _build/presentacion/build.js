// Genera docs/C4-Desarrollo-de-Software-Biblioteca.pptx
//   node docs/_build/presentacion/build.js [salida.pptx]
// Requiere pptxgenjs (instalado globalmente o con NODE_PATH hacia ../../../../herramientas/node_modules).
const fs = require('fs');
const path = require('path');
const { Deck, THEME } = require('./lib');
const { applyTheme } = require('./apply_theme.js');

/** pptxgenjs puede repetir el id de una forma dentro de una diapositiva (p. ej. el número de página);
 *  PowerPoint exige ids únicos, así que se renumeran al terminar. */
async function idsUnicos(archivo) {
  const JSZip = require(require.resolve('jszip', { paths: [require.resolve('pptxgenjs')] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(archivo));
  for (const nombre of Object.keys(zip.files)) {
    if (!/^ppt\/slides\/slide\d+\.xml$/.test(nombre)) continue;
    let n = 1;
    const xml = (await zip.file(nombre).async('string')).replace(/<p:cNvPr id="\d+"/g, () => `<p:cNvPr id="${++n}"`);
    zip.file(nombre, xml);
  }
  fs.writeFileSync(archivo, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

(async () => {
  const salida = process.argv[2] || path.join(__dirname, '..', '..', 'C4-Desarrollo-de-Software-Biblioteca.pptx');
  const d = Deck();
  require('./contenido')(d);
  await d.pres.writeFile({ fileName: salida });
  await applyTheme(salida, THEME);
  await idsUnicos(salida);
  console.log('ok', path.resolve(salida));
})().catch((e) => { console.error(e); process.exit(1); });
