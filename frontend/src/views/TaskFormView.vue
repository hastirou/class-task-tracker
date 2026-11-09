<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, ApiClientError } from '../api/client';
import type { Task } from '../types';

const route = useRoute();
const router = useRouter();

const isEdit = Boolean(route.params.id);
const taskId = route.params.id as string | undefined;

const title = ref('');
const description = ref('');
const dueDate = ref('');
const className = ref('');
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const fieldErrors = ref<Record<string, string>>({});

onMounted(async () => {
  if (!isEdit) return;
  loading.value = true;
  try {
    const res = await api.get<{ data: Task }>(`/tasks/${taskId}`);
    const task = res.data;
    title.value = task.title;
    description.value = task.description ?? '';
    className.value = task.className;
    dueDate.value = task.dueDate.slice(0, 10);
  } catch (err) {
    if (err instanceof ApiClientError) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = 'Gagal memuat tugas.';
    }
  } finally {
    loading.value = false;
  }
});

const submit = async () => {
  saving.value = true;
  errorMessage.value = '';
  fieldErrors.value = {};

  const payload = {
    title: title.value,
    description: description.value || undefined,
    dueDate: new Date(dueDate.value).toISOString(),
    className: className.value,
  };

  try {
    if (isEdit && taskId) {
      await api.put(`/tasks/${taskId}`, payload);
    } else {
      await api.post('/tasks', payload);
    }
    router.push({ name: 'tasks' });
  } catch (err) {
    if (err instanceof ApiClientError) {
      errorMessage.value = err.message;
      if (err.details) {
        for (const d of err.details) {
          fieldErrors.value[d.field] = d.message;
        }
      }
    } else {
      errorMessage.value = 'Terjadi kesalahan. Coba lagi.';
    }
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <h1>{{ isEdit ? 'Ubah Tugas' : 'Tambah Tugas' }}</h1>

    <div v-if="loading" class="loading-state">
      <p>Memuat tugas…</p>
    </div>

    <form v-else class="auth-form" @submit.prevent="submit">
      <label>
        Judul
        <input v-model="title" type="text" required placeholder="Judul tugas" />
        <span v-if="fieldErrors.title" class="field-error">{{ fieldErrors.title }}</span>
      </label>

      <label>
        Deskripsi
        <textarea v-model="description" rows="3" placeholder="Deskripsi (opsional)"></textarea>
        <span v-if="fieldErrors.description" class="field-error">{{ fieldErrors.description }}</span>
      </label>

      <label>
        Tenggat
        <input v-model="dueDate" type="date" required />
        <span v-if="fieldErrors.dueDate" class="field-error">{{ fieldErrors.dueDate }}</span>
      </label>

      <label>
        Kelas
        <input v-model="className" type="text" required placeholder="Contoh: X-A" />
        <span v-if="fieldErrors.className" class="field-error">{{ fieldErrors.className }}</span>
      </label>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div class="form-actions">
        <button type="submit" :disabled="saving" class="btn btn-primary">
          {{ saving ? 'Menyimpan…' : isEdit ? 'Simpan' : 'Tambah' }}
        </button>
        <RouterLink to="/tasks" class="btn">Batal</RouterLink>
      </div>
    </form>
  </div>
</template>
