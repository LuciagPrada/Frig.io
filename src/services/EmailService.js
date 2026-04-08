// EmailService, envío de emails transaccionales via FastAPI

const getApiUrl = () => import.meta.env.VITE_OMR_API_URL || 'http://localhost:8000'
const FROM_NAME = 'Frig.io'

//Envía un email via el endpoint POST /send-email del servidor FastAPI
async function send({ to, subject, html }) {
  const url = `${getApiUrl()}/send-email`
  const body = {
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.detail || `Error ${res.status} al enviar el email`
    console.error('[EmailService]', msg)
    throw new Error(msg)
  }

  return res.json()
}

// Plantilla base
function _base(contenido) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;
                padding:32px 24px;background:#f1f5f9;border-radius:16px">
      <div style="text-align:center;margin-bottom:24px">
        <span style="font-size:1.4rem;font-weight:800;color:#0f172a">${FROM_NAME}</span>
      </div>
      <div style="background:#fff;border-radius:12px;padding:28px 24px;border:1px solid #e2e8f0">
        ${contenido}
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:0.78rem;margin-top:20px">
        Este es un email automático — no respondas a este mensaje
      </p>
    </div>
  `
}

// Plantillas de institución

//Confirmación al usuario que se sale de una institución 
export async function sendSalidaInstitucion({ emailUsuario, nombreUsuario, nombreInstitucion }) {
  return send({
    to: emailUsuario,
    subject: `Has salido de la institución "${nombreInstitucion}" — ${FROM_NAME}`,
    html: _base(`
      <h2 style="margin:0 0 12px;font-size:1.1rem;color:#0f172a">Has abandonado una institución</h2>
      <p style="color:#475569;margin:0 0 16px">
        Hola <strong>${nombreUsuario || emailUsuario}</strong>,
      </p>
      <p style="color:#475569;margin:0 0 16px">
        Te confirmamos que has abandonado correctamente la institución
        <strong>"${nombreInstitucion}"</strong>.
        Ya no tienes acceso a sus partituras institucionales.
      </p>
      <p style="color:#475569;margin:0">
        Si crees que esto es un error, pide al administrador que te vuelva a añadir.
      </p>
    `),
  })
}

//Aviso a todos los miembros cuando se elimina una institución
export async function sendEliminacionInstitucion({ emails, nombreInstitucion }) {
  if (!emails?.length) return
  return send({
    to: emails,
    subject: `La institución "${nombreInstitucion}" ha sido eliminada — ${FROM_NAME}`,
    html: _base(`
      <h2 style="margin:0 0 12px;font-size:1.1rem;color:#0f172a">Institución eliminada</h2>
      <p style="color:#475569;margin:0 0 16px">
        Te informamos de que la institución <strong>"${nombreInstitucion}"</strong>
        ha sido eliminada por su administrador.
      </p>
      <p style="color:#475569;margin:0">
        Ya no tienes acceso a sus partituras institucionales.
      </p>
    `),
  })
}

//Notificación al nuevo miembro cuando es añadido a una institución
export async function sendInvitacionInstitucion({ emailUsuario, nombreUsuario, nombreInstitucion, appUrl }) {
  return send({
    to: emailUsuario,
    subject: `Te han añadido a "${nombreInstitucion}" — ${FROM_NAME}`,
    html: _base(`
      <h2 style="margin:0 0 12px;font-size:1.1rem;color:#0f172a">¡Bienvenido/a a la institución!</h2>
      <p style="color:#475569;margin:0 0 16px">
        Hola <strong>${nombreUsuario || emailUsuario}</strong>,
      </p>
      <p style="color:#475569;margin:0 0 20px">
        Has sido añadido/a como miembro de la institución
        <strong>"${nombreInstitucion}"</strong>.
        Ya puedes acceder a sus partituras institucionales desde tu biblioteca.
      </p>
      <a href="${appUrl || 'https://frigio.app'}/biblioteca"
         style="display:inline-block;background:#99C2B9;color:#0f172a;font-weight:700;
                padding:10px 28px;border-radius:9999px;text-decoration:none">
        Ir a mi biblioteca →
      </a>
    `),
  })
}

export default { sendSalidaInstitucion, sendEliminacionInstitucion, sendInvitacionInstitucion }
