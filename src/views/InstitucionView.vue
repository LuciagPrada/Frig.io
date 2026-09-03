<template>
  <div>
    <AppHeader @open-auth="showAuth = true"/>

    <!-- ====== BIBLIOTECA DE UNA INSTITUCIÓN ====== -->
    <div v-if="instAbierta" class="page-container">
      <div class="institution-library-toolbar" style="display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap">
        <div>
          <button class="btn btn-secondary" style="margin-bottom:0.75rem" @click="cerrarBiblioteca">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Mis instituciones
          </button>
          <h1 class="page-title" style="display:flex;align-items:center;gap:0.75rem;margin:0 0 0.4rem">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="10" width="4" height="10"/><rect x="10" y="10" width="4" height="10"/>
              <rect x="16" y="10" width="4" height="10"/><path d="M2 22h20"/><path d="M12 2L2 8h20L12 2z"/>
            </svg>
            {{ instAbierta.nombre }}
          </h1>
          <p class="page-subtitle" style="margin:0">Partituras compartidas con esta institución</p>
        </div>
        <div class="institution-library-actions" style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0">
          <!-- filtros por etiqueta propia / instrumento / género / me gusta -->
          <ScoreFilterMenu
            v-if="!loadingBiblioteca && partiturasInst.length"
            :partituras="partiturasInst"
            :liked-ids="likedIds"
            :mis-etiquetas="misEtiquetas"
            @filtered="partiturasFiltradas = $event"
          />
          <button class="btn btn-primary" style="display:flex;align-items:center;gap:0.5rem" @click="abrirAjustes">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            Ajustes
          </button>
        </div>
      </div>

      <div v-if="loadingBiblioteca" style="display:flex;justify-content:center;padding:3rem">
        <div class="spinner"/>
      </div>

      <div v-else-if="partiturasFiltradas.length" class="score-grid">
        <ScoreCard
          v-for="p in partiturasFiltradas"
          :key="p.id_partitura"
          :partitura="p"
          @click="abrirDetalle(p)"
        />
      </div>

      <div v-else style="text-align:center;padding:4rem 2rem">
        <div style="margin-bottom:1rem;color:var(--color-text-secondary)">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <h3 style="font-weight:700;margin:0 0 0.5rem">
          {{ partiturasInst.length ? 'Ninguna partitura coincide con el filtro' : 'Esta institución no tiene partituras compartidas aún' }}
        </h3>
        <p style="color:var(--color-text-secondary);margin:0">
          {{ partiturasInst.length ? 'Prueba con otros filtros o límpialos' : 'Comparte una partitura desde su ficha para que aparezca aquí' }}
        </p>
      </div>
    </div>

    <!-- ====== SELECTOR DE INSTITUCIONES ====== -->
    <div v-else class="page-container" style="max-width:860px">
      <!-- cabecera -->
      <div class="institution-heading" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem">
        <div>
          <h1 class="page-title" style="display:flex;align-items:center;gap:0.75rem;margin:0 0 0.4rem">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="10" width="4" height="10"/><rect x="10" y="10" width="4" height="10"/>
              <rect x="16" y="10" width="4" height="10"/><path d="M2 22h20"/><path d="M12 2L2 8h20L12 2z"/>
            </svg>
            Mis instituciones
          </h1>
          <p class="page-subtitle" style="margin:0">Gestiona las instituciones a las que perteneces o que administras</p>
        </div>

        <!-- botón + con menú -->
        <div style="position:relative">
          <button class="btn btn-primary" style="display:flex;align-items:center;gap:0.5rem" @click="toggleMenu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Añadir
          </button>
          <div v-if="showMenu" class="card" style="position:absolute;right:0;top:calc(100% + 0.5rem);z-index:100;min-width:200px;padding:0.5rem;box-shadow:0 8px 30px rgba(0,0,0,0.25)">
            <button class="dropdown-item" @click="openCrear">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              Crear institución
            </button>
            <button class="dropdown-item" @click="openUnirse">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              Unirme a institución
            </button>
          </div>
        </div>
      </div>

      <!-- cargando -->
      <div v-if="loading" style="display:flex;justify-content:center;padding:4rem">
        <div class="spinner"/>
      </div>

      <!-- sin instituciones -->
      <div v-else-if="!instituciones.length" style="text-align:center;padding:5rem 2rem">
        <div style="margin:0 auto 1.5rem;width:72px;height:72px;border-radius:50%;background:var(--color-bg);border:2px solid var(--color-border);display:flex;align-items:center;justify-content:center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" stroke-width="1.5">
            <rect x="4" y="10" width="4" height="10"/><rect x="10" y="10" width="4" height="10"/>
            <rect x="16" y="10" width="4" height="10"/><path d="M2 22h20"/><path d="M12 2L2 8h20L12 2z"/>
          </svg>
        </div>
        <h3 style="font-weight:700;margin:0 0 0.5rem">Aún no estás en ninguna institución</h3>
        <p style="color:var(--color-text-secondary);margin:0 0 2rem">Crea una nueva o únete a una institución existente</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" @click="openCrear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Crear institución
          </button>
          <button class="btn btn-secondary" @click="openUnirse">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
            Unirme a institución
          </button>
        </div>
      </div>

      <!-- grid de cards -->
      <div v-else class="inst-grid">
        <div
          v-for="inst in instituciones"
          :key="inst.id_institucion"
          class="inst-card"
          @click="abrirBiblioteca(inst)"
        >
          <div class="inst-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="10" width="4" height="10"/><rect x="10" y="10" width="4" height="10"/>
              <rect x="16" y="10" width="4" height="10"/><path d="M2 22h20"/><path d="M12 2L2 8h20L12 2z"/>
            </svg>
          </div>
          <h3 class="inst-card-name">{{ inst.nombre }}</h3>
          <p v-if="inst.descripcion" class="inst-card-desc">{{ inst.descripcion }}</p>
          <div class="inst-card-footer">
            <span class="inst-card-members">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {{ (inst.miembros_institucion || []).length }}
            </span>
            <span class="inst-card-badge" :class="inst.rolUsuario === 'ADMINISTRADOR' ? 'badge-admin' : 'badge-member'">
              {{ inst.rolUsuario === 'ADMINISTRADOR' ? 'Administrador' : 'Miembro' }}
            </span>
          </div>
        </div>
      </div>

      <AuthModal v-if="showAuth" initial-tab="login" @close="showAuth = false"/>
    </div>

    <div v-if="showMenu" style="position:fixed;inset:0;z-index:99" @click="showMenu = false"/>

    <!-- crear institución -->
    <div v-if="showCrear" class="modal-overlay" @click.self="showCrear = false">
      <div class="modal-box card" style="max-width:460px;width:90%;padding:2rem">
        <div class="modal-head">
          <h2 class="modal-title">Crear institución</h2>
          <button class="btn-icon" @click="showCrear = false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        </div>
        <form @submit.prevent="handleCrear">
          <div class="form-group">
            <label class="form-label">Nombre *</label>
            <input v-model="nombreNueva" type="text" class="form-input" placeholder="Ej: Conservatorio Nacional" required/>
          </div>
          <div class="form-group">
            <label class="form-label">Descripción (opcional)</label>
            <textarea v-model="descNueva" class="form-input" rows="3" placeholder="Describe brevemente la institución" style="resize:vertical"/>
          </div>
          <div v-if="crearError" class="alert alert-error" style="margin-bottom:1rem">{{ crearError }}</div>
          <div style="display:flex;gap:0.75rem;justify-content:flex-end">
            <button type="button" class="btn btn-secondary" @click="showCrear = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="instCtrl.loading.value">
              <span v-if="instCtrl.loading.value" class="spinner spinner-sm"/>
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- unirse a institución -->
    <div v-if="showUnirse" class="modal-overlay" @click.self="showUnirse = false">
      <div class="modal-box card" style="max-width:460px;width:90%;padding:2rem">
        <div class="modal-head">
          <h2 class="modal-title">Unirme a institución</h2>
          <button class="btn-icon" @click="showUnirse = false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        </div>
        <!-- Confirmación: la solicitud queda pendiente hasta que el admin la apruebe -->
        <template v-if="unirseEnviada">
          <div class="alert alert-success" style="margin-bottom:1.5rem">
            Solicitud enviada. El administrador debe aprobarla antes de que tengas acceso
            a la institución y a su biblioteca.
          </div>
          <div style="display:flex;justify-content:flex-end">
            <button type="button" class="btn btn-primary" @click="showUnirse = false">Entendido</button>
          </div>
        </template>

        <template v-else>
          <p style="color:var(--color-text-secondary);font-size:0.9rem;margin:0 0 1.5rem">
            Introduce el ID de la institución que te ha proporcionado el administrador.
            Se enviará una solicitud al administrador, que debe aprobarla antes de que
            tengas acceso.
          </p>
          <form @submit.prevent="handleUnirse">
            <div class="form-group">
              <label class="form-label">ID de la institución *</label>
              <input v-model="instIdUnirse" type="text" class="form-input" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required/>
            </div>
            <div v-if="unirseError" class="alert alert-error" style="margin-bottom:1rem">{{ unirseError }}</div>
            <div style="display:flex;gap:0.75rem;justify-content:flex-end">
              <button type="button" class="btn btn-secondary" @click="showUnirse = false">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="instCtrl.loading.value">
                <span v-if="instCtrl.loading.value" class="spinner spinner-sm"/>
                Enviar solicitud
              </button>
            </div>
          </form>
        </template>
      </div>
    </div>

    <!-- gestionar institución -->
    <div v-if="instSeleccionada" class="modal-overlay" @click.self="cerrarGestionar">
      <div class="modal-box card" style="max-width:680px;width:95%;padding:0;overflow:hidden">
        <div class="manage-modal-header" style="padding:1.5rem 2rem;border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between">
          <div>
            <h2 style="margin:0 0 0.3rem;font-size:1.1rem;font-weight:700">{{ instSeleccionada.nombre }}</h2>
            <span class="inst-card-badge" :class="instSeleccionada.rolUsuario === 'ADMINISTRADOR' ? 'badge-admin' : 'badge-member'" style="font-size:0.75rem">
              {{ instSeleccionada.rolUsuario === 'ADMINISTRADOR' ? 'Administrador' : 'Miembro' }}
            </span>
          </div>
          <button class="btn-icon" @click="cerrarGestionar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
        </div>

        <div class="manage-modal-body" style="padding:1.5rem 2rem">
          <!-- ID para compartir con miembros (visible para cualquier miembro) -->
          <div class="alert alert-info" style="margin-bottom:1.5rem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-dark)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <div style="flex:1;min-width:0">
              <p style="margin:0 0 0.2rem;font-size:0.8rem;font-weight:600">ID para compartir con miembros:</p>
              <code style="font-size:0.78rem;word-break:break-all">{{ instSeleccionada.id_institucion }}</code>
            </div>
            <button class="btn-icon" style="flex-shrink:0" @click="copiarId(instSeleccionada.id_institucion)" title="Copiar ID">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>

          <div v-if="gestionSuccess" class="alert alert-success" style="margin-bottom:1.5rem">{{ gestionSuccess }}</div>

          <!-- Tabla de miembros -->
          <div class="card members-table-wrap" style="overflow:hidden;margin-bottom:1.5rem">
            <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--color-border);font-weight:700;display:flex;align-items:center;gap:0.5rem;font-size:0.95rem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Miembros ({{ (instSeleccionada.miembros_institucion || []).length }})
            </div>
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:var(--color-bg)">
                  <th style="padding:0.6rem 1.25rem;text-align:left;font-size:0.75rem;color:var(--color-text-secondary);font-weight:600;text-transform:uppercase">Nombre</th>
                  <th style="padding:0.6rem 1.25rem;text-align:left;font-size:0.75rem;color:var(--color-text-secondary);font-weight:600;text-transform:uppercase">Email</th>
                  <th style="padding:0.6rem 1.25rem;text-align:left;font-size:0.75rem;color:var(--color-text-secondary);font-weight:600;text-transform:uppercase">Rol</th>
                  <th v-if="instSeleccionada.rolUsuario === 'ADMINISTRADOR'" style="padding:0.6rem 1.25rem;text-align:right;font-size:0.75rem;color:var(--color-text-secondary);font-weight:600;text-transform:uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in (instSeleccionada.miembros_institucion || [])" :key="m.id_usuario" style="border-top:1px solid var(--color-border)">
                  <td style="padding:0.75rem 1.25rem;font-weight:500">{{ m.usuarios?.nombre }} {{ m.usuarios?.apellidos }}</td>
                  <td style="padding:0.75rem 1.25rem;color:var(--color-text-secondary);font-size:0.85rem">{{ m.usuarios?.email }}</td>
                  <!-- El rol aquí es el rol DENTRO de esta institución (quién la
                       administra), no el rol global del usuario en la aplicación. -->
                  <td style="padding:0.75rem 1.25rem">
                    <span :class="esAdminDeLaInstitucion(m) ? 'badge badge-success' : 'badge badge-warning'">
                      {{ esAdminDeLaInstitucion(m) ? 'Admin' : 'Miembro' }}
                    </span>
                  </td>
                  <td v-if="instSeleccionada.rolUsuario === 'ADMINISTRADOR'" style="padding:0.75rem 1.25rem;text-align:right">
                    <button v-if="m.id_usuario !== authStore.user?.id" class="btn-icon" style="margin-left:auto" @click="confirmarEliminarMiembro(m)" title="Eliminar miembro">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="!(instSeleccionada.miembros_institucion || []).length">
                  <td :colspan="instSeleccionada.rolUsuario === 'ADMINISTRADOR' ? 4 : 3" style="padding:1.25rem;text-align:center;color:var(--color-text-secondary)">No hay miembros todavía</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- invitar miembro (solo para el admin) -->
          <div v-if="instSeleccionada.rolUsuario === 'ADMINISTRADOR'" class="card" style="padding:1.25rem;margin-bottom:1rem">
            <h3 style="margin:0 0 1rem;font-size:0.95rem;font-weight:700">Invitar miembro por email</h3>
            <form class="invite-form" @submit.prevent="handleInvitar" style="display:flex;gap:0.75rem">
              <input v-model="emailInvitacion" type="email" class="form-input" placeholder="usuario@email.com" required style="flex:1"/>
              <button type="submit" class="btn btn-primary" :disabled="instCtrl.loading.value">
                <span v-if="instCtrl.loading.value" class="spinner spinner-sm"/>
                <span v-else>Invitar</span>
              </button>
            </form>
            <div v-if="inviteError" class="alert alert-error" style="margin-top:0.75rem;margin-bottom:0">{{ inviteError }}</div>
          </div>

          <!-- acciones destructivas -->
          <div class="institution-danger-actions" style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:0.5rem">
            <button v-if="instSeleccionada.rolUsuario === 'MIEMBRO'" class="btn btn-danger" style="display:flex;align-items:center;gap:0.5rem" @click="confirmarSalir">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Salirme de la institución
            </button>
            <button v-if="instSeleccionada.rolUsuario === 'ADMINISTRADOR'" class="btn btn-danger" style="display:flex;align-items:center;gap:0.5rem" @click="confirmarEliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Eliminar institución
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- confirmar salirse -->
    <div v-if="showConfirmSalir" class="modal-overlay" @click.self="showConfirmSalir = false">
      <div class="modal-box card" style="max-width:420px;width:90%;padding:2rem">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="width:56px;height:56px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </div>
          <h2 style="margin:0 0 0.75rem;font-size:1.1rem;font-weight:700">¿Salirte de la institución?</h2>
          <p style="color:var(--color-text-secondary);font-size:0.9rem;margin:0">
            Perderás el acceso a las partituras institucionales de <strong>{{ instSeleccionada?.nombre }}</strong>.
          </p>
        </div>
        <div v-if="actionError" class="alert alert-error" style="margin-bottom:1rem">{{ actionError }}</div>
        <div style="display:flex;gap:0.75rem;justify-content:center">
          <button class="btn btn-secondary" @click="showConfirmSalir = false">Cancelar</button>
          <button class="btn btn-danger" @click="handleSalir" :disabled="instCtrl.loading.value">
            <span v-if="instCtrl.loading.value" class="spinner spinner-sm"/>
            Sí, salirme
          </button>
        </div>
      </div>
    </div>

    <!-- confirmar eliminar -->
    <div v-if="showConfirmEliminar" class="modal-overlay" @click.self="showConfirmEliminar = false">
      <div class="modal-box card" style="max-width:420px;width:90%;padding:2rem">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="width:56px;height:56px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <h2 style="margin:0 0 0.75rem;font-size:1.1rem;font-weight:700">¿Eliminar la institución?</h2>
          <p style="color:var(--color-text-secondary);font-size:0.9rem;margin:0">
            Se eliminará <strong>{{ instSeleccionada?.nombre }}</strong> y todos sus miembros perderán el acceso.
            Esta acción <strong>no se puede deshacer</strong>.
          </p>
        </div>
        <div v-if="actionError" class="alert alert-error" style="margin-bottom:1rem">{{ actionError }}</div>
        <div style="display:flex;gap:0.75rem;justify-content:center">
          <button class="btn btn-secondary" @click="showConfirmEliminar = false">Cancelar</button>
          <button class="btn btn-danger" @click="handleEliminar" :disabled="instCtrl.loading.value">
            <span v-if="instCtrl.loading.value" class="spinner spinner-sm"/>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- confirmar eliminar miembro -->
    <div v-if="showConfirmEliminarMiembro" class="modal-overlay" @click.self="showConfirmEliminarMiembro = false">
      <div class="modal-box card" style="max-width:420px;width:90%;padding:2rem">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="width:56px;height:56px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <h2 style="margin:0 0 0.75rem;font-size:1.1rem;font-weight:700">¿Eliminar al miembro?</h2>
          <p style="color:var(--color-text-secondary);font-size:0.9rem;margin:0">
            <strong>{{ memberAEliminar?.usuarios?.nombre }} {{ memberAEliminar?.usuarios?.apellidos }}</strong> ({{ memberAEliminar?.usuarios?.email }})
            perderá el acceso a las partituras institucionales.
          </p>
        </div>
        <div v-if="actionError" class="alert alert-error" style="margin-bottom:1rem">{{ actionError }}</div>
        <div style="display:flex;gap:0.75rem;justify-content:center">
          <button class="btn btn-secondary" @click="showConfirmEliminarMiembro = false">Cancelar</button>
          <button class="btn btn-danger" @click="handleEliminarMiembro" :disabled="instCtrl.loading.value">
            <span v-if="instCtrl.loading.value" class="spinner spinner-sm"/>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AuthModal from '../components/AuthModal.vue'
import ScoreCard from '../components/ScoreCard.vue'
import ScoreFilterMenu from '../components/ScoreFilterMenu.vue'
import { useAuthStore } from '../stores/authStore.js'
import { useInstitucionController } from '../controllers/InstitucionController.js'
import InstitucionRepository from '../repositories/InstitucionRepository.js'
import PartituraRepository from '../repositories/PartituraRepository.js'
import EtiquetaRepository from '../repositories/EtiquetaRepository.js'

const router = useRouter()
const authStore = useAuthStore()
const instCtrl = useInstitucionController()
const { instituciones, loading } = instCtrl

//Biblioteca de la institución abierta (estado local, sin sub-rutas)
const instAbierta = ref(null)
const partiturasInst = ref([])
const partiturasFiltradas = ref([])
const likedIds = ref([])
const misEtiquetas = ref([])
const loadingBiblioteca = ref(false)

const showAuth = ref(false)
const showMenu = ref(false)
const showCrear = ref(false)
const showUnirse = ref(false)
const instSeleccionada = ref(null)
const showConfirmSalir = ref(false)
const showConfirmEliminar = ref(false)
const showConfirmEliminarMiembro = ref(false)
const memberAEliminar = ref(null)

const nombreNueva = ref('')
const descNueva = ref('')
const crearError = ref('')
const instIdUnirse = ref('')
const unirseError = ref('')
const unirseEnviada = ref(false)
const emailInvitacion = ref('')
const inviteError = ref('')
const gestionSuccess = ref('')
const actionError = ref('')

onMounted(async () => { await instCtrl.cargar() })

function toggleMenu() { showMenu.value = !showMenu.value }
function openCrear()  { showMenu.value = false; crearError.value = ''; nombreNueva.value = ''; descNueva.value = ''; showCrear.value = true }
function openUnirse() { showMenu.value = false; unirseError.value = ''; unirseEnviada.value = false; instIdUnirse.value = ''; showUnirse.value = true }
function cerrarGestionar() { instSeleccionada.value = null }

//Abrir la biblioteca de una institución al pulsar su tarjeta
async function abrirBiblioteca(inst) {
  instAbierta.value = inst
  partiturasInst.value = []
  partiturasFiltradas.value = []
  loadingBiblioteca.value = true
  try {
    partiturasInst.value = await instCtrl.getBibliotecaInstitucion(inst.id_institucion)
    partiturasFiltradas.value = partiturasInst.value
    if (authStore.user?.id) {
      //Likes y etiquetas privadas se cargan una sola vez al abrir la
      //biblioteca; el panel de filtro trabaja después en cliente.
      const [likes, etiquetas] = await Promise.all([
        PartituraRepository.getLikesByUser(authStore.user.id),
        EtiquetaRepository.getMisEtiquetas(authStore.user.id),
      ])
      likedIds.value = likes
      misEtiquetas.value = etiquetas
    }
  } finally {
    loadingBiblioteca.value = false
  }
}

function cerrarBiblioteca() { instAbierta.value = null; partiturasInst.value = []; partiturasFiltradas.value = [] }

//El panel de gestión ahora se abre desde el botón "Ajustes"
function abrirAjustes() {
  instSeleccionada.value = instAbierta.value
  inviteError.value = ''
  gestionSuccess.value = ''
  actionError.value = ''
}

function abrirDetalle(p) { router.push('/partitura/' + p.id_partitura) }

//Un miembro es "Admin" si es el administrador DE ESTA institución. Antes se
//miraba m.usuarios.rol, que es el rol global del usuario en la aplicación
//(casi siempre USUARIO_REGISTRADO) y no tenía nada que ver con la institución.
function esAdminDeLaInstitucion(m) {
  return !!instSeleccionada.value && m.id_usuario === instSeleccionada.value.id_administrador
}

async function handleCrear() {
  crearError.value = ''
  try {
    await instCtrl.crear(nombreNueva.value)
    showCrear.value = false
  } catch (e) { crearError.value = e.message || 'Error al crear la institución' }
}

//Ya no se entra directamente: se envía una solicitud que el administrador
//debe aprobar, así que el modal solo confirma que quedó pendiente (no se abre
//la biblioteca de una institución a la que todavía no se pertenece).
async function handleUnirse() {
  unirseError.value = ''
  try {
    await instCtrl.unirse(instIdUnirse.value.trim())
    unirseEnviada.value = true
  } catch (e) { unirseError.value = e.message || 'No se pudo enviar la solicitud. Verifica el ID.' }
}

async function handleInvitar() {
  inviteError.value = ''; gestionSuccess.value = ''
  try {
    await instCtrl.invitarMiembro(instSeleccionada.value.id_institucion, emailInvitacion.value)
    const instActualizada = instituciones.value.find(i => i.id_institucion === instSeleccionada.value.id_institucion)

    gestionSuccess.value = 'Miembro añadido.'
    emailInvitacion.value = ''
    if (instActualizada) instSeleccionada.value = instActualizada
  } catch (e) { inviteError.value = e.message || 'Error al invitar al miembro' }
}

function confirmarSalir()    { actionError.value = ''; showConfirmSalir.value = true }
function confirmarEliminar() { actionError.value = ''; showConfirmEliminar.value = true }
function confirmarEliminarMiembro(m) { actionError.value = ''; memberAEliminar.value = m; showConfirmEliminarMiembro.value = true }

async function handleSalir() {
  actionError.value = ''
  try {
    const uid = authStore.user?.id
    await InstitucionRepository.removeMiembro(instSeleccionada.value.id_institucion, uid)

    showConfirmSalir.value = false
    instSeleccionada.value = null
    cerrarBiblioteca()
    await instCtrl.cargar()
  } catch (e) { actionError.value = e.message || 'Error al salir de la institución' }
}

async function handleEliminar() {
  actionError.value = ''
  try {
    await InstitucionRepository.eliminar(instSeleccionada.value.id_institucion)

    showConfirmEliminar.value = false
    instSeleccionada.value = null
    cerrarBiblioteca()
    await instCtrl.cargar()
  } catch (e) { actionError.value = e.message || 'Error al eliminar la institución' }
}

async function handleEliminarMiembro() {
  actionError.value = ''
  try {
    await InstitucionRepository.removeMiembro(instSeleccionada.value.id_institucion, memberAEliminar.value.id_usuario)

    showConfirmEliminarMiembro.value = false
    memberAEliminar.value = null
    await instCtrl.cargar()
    const instActualizada = instituciones.value.find(i => i.id_institucion === instSeleccionada.value.id_institucion)
    if (instActualizada) instSeleccionada.value = instActualizada
  } catch (e) { actionError.value = e.message || 'Error al eliminar al miembro' }
}

function copiarId(id) {
  navigator.clipboard.writeText(id).then(() => alert('ID copiado al portapapeles'))
}
</script>

<style scoped>
.inst-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}
.inst-card {
  background: var(--color-teal);
  border-radius: 14px;
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  box-shadow: 0 4px 16px rgba(153,194,185,0.35);
  border: 1px solid rgba(255,255,255,0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  color: var(--color-navy);
}
.inst-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(153,194,185,0.5); }
.inst-card-icon {
  width: 44px; height: 44px; border-radius: 10px;
  background: rgba(255,255,255,0.45);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--color-navy);
}
.inst-card-name { margin: 0.2rem 0 0; font-size: 1rem; font-weight: 700; line-height: 1.3; color: var(--color-navy); }
.inst-card-desc { color: rgba(15,23,42,0.65); font-size: 0.85rem; margin: 0; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.inst-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.5rem; }
.inst-card-members { display: flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; color: rgba(15,23,42,0.65); }
.inst-card-badge { display: inline-flex; align-items: center; padding: 0.2rem 0.65rem; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; }
.badge-admin  { background: rgba(255,255,255,0.6); color: var(--color-navy); }
.badge-member { background: rgba(255,255,255,0.35); color: var(--color-navy); }

@media (prefers-color-scheme: dark) {
  .inst-card { background: #1e3a5f; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 4px 16px rgba(0,0,0,0.35); color: #fff; }
  .inst-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.5); }
  .inst-card-icon  { background: rgba(255,255,255,0.1); color: #fff; }
  .inst-card-name  { color: #fff; }
  .inst-card-desc  { color: rgba(255,255,255,0.65); }
  .inst-card-members { color: rgba(255,255,255,0.6); }
  .badge-admin  { background: rgba(255,255,255,0.2); color: #fff; }
  .badge-member { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); }
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px); display: flex; align-items: center;
  justify-content: center; z-index: 1000;
}
.modal-box { animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
.modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.modal-title { margin: 0; font-size: 1.1rem; font-weight: 700; }
.btn-icon {
  width: 32px; height: 32px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer;
  color: var(--color-text-secondary); transition: background 0.15s;
}
.btn-icon:hover { background: var(--color-bg); color: var(--color-text-primary); }
.dropdown-item {
  display: flex; align-items: center; gap: 0.6rem; width: 100%;
  padding: 0.6rem 0.75rem; background: none; border: none; border-radius: 6px;
  cursor: pointer; font-size: 0.9rem; text-align: left;
  color: var(--color-text-primary); transition: background 0.15s;
}
.dropdown-item:hover { background: var(--color-bg); }

@media (max-width: 768px) {
  .institution-library-toolbar,
  .institution-heading {
    align-items: stretch !important;
    flex-direction: column;
    gap: 1rem;
  }
  .institution-library-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  .institution-library-actions > .btn { flex: 1 1 auto; }
  .inst-grid { grid-template-columns: 1fr; }

  .modal-overlay { padding: 0.75rem; }
  .modal-box {
    width: 100% !important;
    max-height: calc(100dvh - 1.5rem);
    overflow-y: auto !important;
  }
  .manage-modal-header,
  .manage-modal-body { padding: 1rem !important; }
  .members-table-wrap { overflow-x: auto !important; }
  .members-table-wrap table { min-width: 520px; }
  .invite-form,
  .institution-danger-actions {
    flex-direction: column;
  }
  .invite-form .btn,
  .institution-danger-actions .btn { width: 100%; }
}
</style>
