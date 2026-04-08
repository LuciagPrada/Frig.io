<template>
  <div
    class="dropzone"
    :class="{ 'drag-over': isDragging, 'has-file': file }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="triggerInput"
  >
    <input
      ref="inputRef"
      type="file"
      accept="image/jpeg,image/png"
      style="display:none"
      @change="onFileChange"
    />

    <!-- Fichero no seleccionado-->
    <div v-if="!file" style="text-align:center">
      <svg class="upload-icon" style="margin:0 auto 0.75rem;display:block" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <p style="font-weight:600;color:var(--color-navy);margin:0">Haz clic para subir</p>
      <p style="color:var(--color-text-secondary);font-size:0.85rem;margin:0.25rem 0 0">
        o arrastra y suelta tu archivo aquí
      </p>
      <p style="color:var(--color-text-secondary);font-size:0.75rem;margin:0.5rem 0 0">
        JPG, PNG — máx. 10 MB
      </p>
    </div>

    <!-- Fichero seleccionado -->
    <div v-else style="text-align:center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" stroke-width="1.5" style="margin:0 auto 0.5rem;display:block">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
      <p style="font-weight:600;color:var(--color-navy);margin:0">{{ file.name }}</p>
      <p style="color:var(--color-text-secondary);font-size:0.8rem;margin:0.25rem 0 0.75rem">
        {{ formatFileSize(file.size) }}
      </p>
      <button type="button" class="btn btn-ghost" style="font-size:0.8rem;padding:0.35rem 0.9rem" @click.stop="clearFile">
        Cambiar archivo
      </button>
    </div>
  </div>

  <!-- Error -->
  <div v-if="validationError" class="alert alert-error" style="margin-top:0.75rem;display:flex;align-items:center;gap:0.5rem">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    {{ validationError }}
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { validateImageFile } from '../utils/validators.js'

const emit = defineEmits(['update:file'])
const props = defineProps({ modelValue: { default: null } })

const file = ref(null)
const isDragging = ref(false)
const validationError = ref('')
const inputRef = ref(null)

function triggerInput() { inputRef.value?.click() }

function onFileChange(e) { setFile(e.target.files[0]) }
function onDrop(e) { isDragging.value = false; setFile(e.dataTransfer.files[0]) }

function setFile(f) {
  if (!f) return
  const result = validateImageFile(f)
  if (!result.valid) { validationError.value = result.error; return }
  validationError.value = ''
  file.value = f
  emit('update:file', f)
}

function clearFile() {
  file.value = null
  validationError.value = ''
  emit('update:file', null)
  if (inputRef.value) inputRef.value.value = ''
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>
