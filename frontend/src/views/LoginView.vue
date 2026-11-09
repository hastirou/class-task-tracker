<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ApiClientError } from '../api/client';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const submit = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push({ name: 'tasks' });
  } catch (err) {
    if (err instanceof ApiClientError) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = 'Terjadi kesalahan. Coba lagi.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <h1>Masuk</h1>
    <p class="subtitle">Masuk untuk mengelola tugas kelas</p>

    <form class="auth-form" @submit.prevent="submit">
      <label>
        Email
        <input v-model="email" type="email" required placeholder="nama@sekolah.id" />
      </label>
      <label>
        Password
        <input v-model="password" type="password" required placeholder="Minimal 8 karakter" />
      </label>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Memproses…' : 'Masuk' }}
      </button>
    </form>

    <p class="auth-link">
      Belum punya akun?
      <RouterLink to="/register">Daftar</RouterLink>
    </p>
  </div>
</template>
