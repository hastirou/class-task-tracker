<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ApiClientError } from '../api/client';

const router = useRouter();
const auth = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref<'TEACHER' | 'STUDENT'>('STUDENT');
const className = ref('');
const teacherCode = ref('');
const loading = ref(false);
const errorMessage = ref('');
const fieldErrors = ref<Record<string, string>>({});

const isStudent = computed(() => role.value === 'STUDENT');

const submit = async () => {
  loading.value = true;
  errorMessage.value = '';
  fieldErrors.value = {};

  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
      className: isStudent.value ? className.value : undefined,
      teacherCode: !isStudent.value ? teacherCode.value : undefined,
    });
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
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <h1>Daftar</h1>
    <p class="subtitle">Buat akun guru atau siswa</p>

    <form class="auth-form" @submit.prevent="submit">
      <label>
        Nama
        <input v-model="name" type="text" required placeholder="Nama lengkap" />
        <span v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</span>
      </label>

      <label>
        Email
        <input v-model="email" type="email" required placeholder="nama@sekolah.id" />
        <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
      </label>

      <label>
        Password
        <input v-model="password" type="password" required minlength="8" placeholder="Minimal 8 karakter" />
        <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>
      </label>

      <fieldset>
        <legend>Peran</legend>
        <label class="radio-label">
          <input v-model="role" type="radio" value="STUDENT" />
          Siswa
        </label>
        <label class="radio-label">
          <input v-model="role" type="radio" value="TEACHER" />
          Guru
        </label>
      </fieldset>

      <label v-if="isStudent">
        Kelas
        <input v-model="className" type="text" required placeholder="Contoh: X-A" />
        <span v-if="fieldErrors.className" class="field-error">{{ fieldErrors.className }}</span>
      </label>

      <label v-if="!isStudent">
        Kode Guru
        <input v-model="teacherCode" type="text" required placeholder="Kode dari sekolah" />
        <span v-if="fieldErrors.teacherCode" class="field-error">{{ fieldErrors.teacherCode }}</span>
      </label>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Memproses…' : 'Daftar' }}
      </button>
    </form>

    <p class="auth-link">
      Sudah punya akun?
      <RouterLink to="/login">Masuk</RouterLink>
    </p>
  </div>
</template>
