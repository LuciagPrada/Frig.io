/*
Copyright (C) 2026 Frigio
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see https://gnu.org.
*/

// Carga del toolkit WASM de Verovio
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
