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
    <router-link :to="authStore.isAuthenticated ? '/dashboard' : '/'" class="logo">
      <img src="../assets/Frigio.svg" alt="Frigio Logo" width="24" height="24" style="width:24px;height:24px;object-fit:contain"/>
      <span>{{ appName }}</span>
    </router-link>

    <!-- Nav: anónimo -->
    <div v-if="!authStore.isAuthenticated" class="flex gap-2">
      <button class="btn btn-secondary" style="border-radius:9999px;padding:0.5rem 1.25rem" @click="$emit('openAuth', 'login')">
        Iniciar Sesión
      </button>
      <button class="btn btn-primary" style="border-radius:9999px;padding:0.5rem 1.25rem" @click="$emit('openAuth', 'register')">
        Registrarse
      </button>
    </div>

    <!-- Nav: autenticado -->
    <div v-else class="flex gap-4 items-center">
      <!-- Pestañas de navegación principal -->
      <nav style="display:flex;gap:1.5rem;margin-right:1rem;font-weight:600;color:var(--color-navy)">
        <router-link to="/dashboard" style="text-decoration:none;color:inherit" active-class="text-teal-600">
          Transcribir
        </router-link>
        <router-link to="/biblioteca" style="text-decoration:none;color:inherit" active-class="text-teal-600">
          Biblioteca
        </router-link>
        <router-link to="/comunidad" style="text-decoration:none;color:inherit" active-class="text-teal-600">
          Comunidad
        </router-link>
      </nav>

      <div style="position:relative">
        <button class="avatar-btn" @click="toggleDropdown" style="padding:0;border-radius:50%;overflow:hidden;border:2px solid var(--color-teal);width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:var(--color-bg)">
          <img v-if="authStore.user?.avatar_seed" :src="`https://api.dicebear.com/9.x/avataaars/svg?seed=${authStore.user.avatar_seed}`" alt="Avatar" style="width:100%;height:100%;object-fit:cover"/>
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
          <router-link to="/institucion" class="dropdown-item" @click="closeDropdown">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.5rem"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
            Mis instituciones
          </router-link>
          <hr class="dropdown-divider"/>
          <button class="dropdown-item danger" @click="handleLogout">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.5rem"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Backdrop para cerrar dropdown -->
  <div v-if="dropdownOpen" style="position:fixed;inset:0;z-index:99" @click="closeDropdown"/>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

defineEmits(['openAuth'])

const appName = 'Frig.io'
const authStore = useAuthStore()
const router = useRouter()
const dropdownOpen = ref(false)

function toggleDropdown() { dropdownOpen.value = !dropdownOpen.value }
function closeDropdown() { dropdownOpen.value = false }

async function handleLogout() {
  closeDropdown()
  await authStore.logout()
  router.push('/')
}
</script>
