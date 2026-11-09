<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const logout = () => {
  auth.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <nav v-if="auth.isLoggedIn" class="navbar">
    <RouterLink to="/tasks" class="navbar-brand">Class Task Tracker</RouterLink>
    <div class="navbar-right">
      <span class="navbar-user">
        {{ auth.user?.name }}
        <span class="badge">{{ auth.user?.role === 'TEACHER' ? 'Guru' : 'Siswa' }}</span>
      </span>
      <button class="btn btn-sm" @click="logout">Keluar</button>
    </div>
  </nav>
  <main class="container">
    <RouterView />
  </main>
</template>
