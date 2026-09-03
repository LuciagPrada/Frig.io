<template>
  <header class="app-header">
    <!-- Logo -->
    <!--<router-link :to="authStore.isAuthenticated ? '/dashboard' : '/'" class="logo">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
      <span>{{ appName }}</span>
    </router-link>--> <!--LOGO ANTIGUO AHORA IMAGEN-->
    <!-- Bloque izquierdo: logo + navegación principal juntos -->
    <div class="header-left">
      <router-link :to="authStore.isAuthenticated ? '/dashboard' : '/'" class="logo">
        <img src="../assets/Frigio.svg" alt="Frigio Logo" width="24" height="24" style="width:24px;height:24px;object-fit:contain"/>
        <span>{{ appName }}</span>
      </router-link>

      <!-- Pestañas de navegación principal -->
      <nav v-if="authStore.isAuthenticated" class="main-nav">
        <router-link to="/biblioteca" active-class="text-teal-600">
          Mi biblioteca
        </router-link>
        
        <router-link to="/mis-instituciones" active-class="text-teal-600">
          Mis instituciones
        </router-link>
        <router-link to="/comunidad" active-class="text-teal-600">
          Comunidad
        </router-link>
      </nav>
    </div>

    <!-- Bloque derecho: acceso anónimo -->
    <div v-if="!authStore.isAuthenticated" class="header-auth-actions">
      <button class="btn btn-secondary" style="border-radius:9999px;padding:0.5rem 1.25rem" @click="$emit('openAuth', 'login')">
        Iniciar sesión
      </button>
      <button class="btn btn-primary" style="border-radius:9999px;padding:0.5rem 1.25rem" @click="$emit('openAuth', 'register')">
        Registrarse
      </button>
    </div>

    <!-- Bloque derecho: campana de notificaciones + avatar -->
    <div v-else class="header-user-actions">
      <NotificacionesBell/>

      <div style="position:relative">
        <button class="avatar-btn" @click="toggleDropdown" style="padding:0;border-radius:50%;overflow:hidden;border:2px solid var(--color-teal);width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:var(--color-bg)">
          <img v-if="authStore.user?.avatar_seed && !avatarLoadFailed" :src="`https://api.dicebear.com/9.x/avataaars/svg?seed=${authStore.user.avatar_seed}`" alt="Avatar" style="width:100%;height:100%;object-fit:cover" @error="avatarLoadFailed = true"/>
          <svg v-else width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="rgba(15,23,42,0.12)"/>
            <circle cx="20" cy="16" r="7" fill="rgba(15,23,42,0.55)"/>
            <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="rgba(15,23,42,0.55)"/>
          </svg>
        </button>

        <div v-if="dropdownOpen" class="dropdown">
          <router-link to="/ajustes" class="dropdown-item" @click="closeDropdown">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.5rem"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Ajustes de cuenta
          </router-link>
          <hr class="dropdown-divider"/>
          <button class="dropdown-item danger" @click="handleLogout">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.5rem"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <button
        class="mobile-menu-btn"
        type="button"
        aria-label="Abrir menú de navegación"
        aria-controls="mobile-navigation"
        :aria-expanded="mobileMenuOpen"
        @click="toggleMobileMenu"
      >
        <svg v-if="!mobileMenuOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  </header>

  <nav v-if="authStore.isAuthenticated && mobileMenuOpen" id="mobile-navigation" class="mobile-nav">
    <router-link to="/dashboard" active-class="active" @click="closeMobileMenu">Transcribir</router-link>
    <router-link to="/biblioteca" active-class="active" @click="closeMobileMenu">Mi biblioteca</router-link>
    <router-link to="/mis-instituciones" active-class="active" @click="closeMobileMenu">Mis instituciones</router-link>
    <router-link to="/comunidad" active-class="active" @click="closeMobileMenu">Comunidad</router-link>
  </nav>

  <div v-if="mobileMenuOpen" class="mobile-nav-backdrop" @click="closeMobileMenu"/>

  <!-- Backdrop para cerrar dropdown -->
  <div v-if="dropdownOpen" style="position:fixed;inset:0;z-index:99" @click="closeDropdown"/>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import NotificacionesBell from './NotificacionesBell.vue'

defineEmits(['openAuth'])

const appName = 'Frig.io'
const authStore = useAuthStore()
const router = useRouter()
const dropdownOpen = ref(false)
const avatarLoadFailed = ref(false)
const mobileMenuOpen = ref(false)

function toggleDropdown() {
  mobileMenuOpen.value = false
  dropdownOpen.value = !dropdownOpen.value
}
function closeDropdown() { dropdownOpen.value = false }
function toggleMobileMenu() {
  dropdownOpen.value = false
  mobileMenuOpen.value = !mobileMenuOpen.value
}
function closeMobileMenu() { mobileMenuOpen.value = false }

async function handleLogout() {
  closeDropdown()
  closeMobileMenu()
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
/* Logo y navegación agrupados a la izquierda; el avatar queda solo a la derecha. */
.header-left {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  min-width: 0;
}

.main-nav,
.header-auth-actions,
.header-user-actions {
  display: flex;
  align-items: center;
}
.main-nav { gap: 1.5rem; font-weight: 600; color: var(--color-navy); }
.main-nav a { color: inherit; text-decoration: none; white-space: nowrap; }
.header-auth-actions { gap: 0.5rem; }
.header-user-actions { gap: 0.75rem; }
.mobile-menu-btn,
.mobile-nav,
.mobile-nav-backdrop { display: none; }

@media (max-width: 768px) {
  .header-left { gap: 0; }
  .main-nav { display: none; }
  .header-user-actions { gap: 0.4rem; }
  .mobile-menu-btn {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    color: var(--color-navy);
    cursor: pointer;
  }
  .mobile-nav {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    z-index: 120;
    display: grid;
    padding: 0.5rem 0.75rem 0.75rem;
    background: var(--color-teal);
    border-top: 1px solid rgba(15,23,42,0.12);
    box-shadow: 0 10px 24px rgba(15,23,42,0.18);
  }
  .mobile-nav a {
    padding: 0.8rem 0.9rem;
    border-radius: var(--radius-sm);
    color: var(--color-navy);
    font-weight: 650;
    text-decoration: none;
  }
  .mobile-nav a.active { background: rgba(255,255,255,0.48); }
  .mobile-nav-backdrop {
    position: fixed;
    inset: 64px 0 0;
    z-index: 99;
    display: block;
    background: rgba(15,23,42,0.3);
  }
}

@media (max-width: 480px) {
  .header-auth-actions { gap: 0.35rem; }
  .header-auth-actions .btn {
    padding: 0.45rem 0.7rem !important;
    font-size: 0.76rem;
  }
}
</style>
