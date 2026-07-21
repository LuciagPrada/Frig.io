// Carga perezosa y compartida del toolkit WASM de Verovio.
// El script define `window.verovio` en cuanto se ejecuta, pero el runtime
// WASM (`verovio.module`) todavía tarda un poco en inicializarse: construir
// el toolkit antes de que `onRuntimeInitialized` dispare provoca errores
// tipo "getToolkitFunction(...) is not a function" o renders a medias.
// La promesa se cachea en el módulo para que solo se cargue/inicialice una
// vez aunque varios componentes la pidan (o la pidan varias veces).
let verovioReadyPromise = null

const VEROVIO_SRC = 'https://www.verovio.org/javascript/latest/verovio-toolkit-wasm.js'

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = () => reject(new Error(`No se pudo cargar el script ${src}`))
    document.head.appendChild(s)
  })
}

export async function getVerovioToolkit() {
  if (!verovioReadyPromise) {
    verovioReadyPromise = loadScriptOnce(VEROVIO_SRC).then(
      () => new Promise((resolve) => { window.verovio.module.onRuntimeInitialized = resolve })
    )
  }
  await verovioReadyPromise
  return new window.verovio.toolkit()
}
