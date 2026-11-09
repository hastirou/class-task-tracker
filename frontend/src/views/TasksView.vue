<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, ApiClientError } from '../api/client';
import { useAuthStore } from '../stores/auth';
import type { Task, PaginationMeta } from '../types';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const tasks = ref<Task[]>([]);
const meta = ref<PaginationMeta | null>(null);
const loading = ref(false);
const errorMessage = ref('');
const searchInput = ref((route.query.search as string) || '');

let searchDebounce: ReturnType<typeof setTimeout> | undefined;

const status = computed(() => (route.query.status as string) || '');
const page = computed(() => Number(route.query.page) || 1);

const fetchTasks = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const params = new URLSearchParams();
    if (route.query.search) params.set('search', route.query.search as string);
    if (route.query.status) params.set('status', route.query.status as string);
    if (page.value > 1) params.set('page', String(page.value));
    const qs = params.toString();
    const res = await api.get<{ data: Task[]; meta: PaginationMeta }>(
      `/tasks${qs ? `?${qs}` : ''}`,
    );
    tasks.value = res.data;
    meta.value = res.meta;
  } catch (err) {
    if (err instanceof ApiClientError) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = 'Gagal memuat tugas. Coba lagi.';
    }
  } finally {
    loading.value = false;
  }
};

const updateQuery = (patch: Record<string, string | undefined>) => {
  const query = { ...route.query, ...patch };
  for (const key of Object.keys(query)) {
    if (!query[key]) delete query[key];
  }
  router.push({ query });
};

const onSearchInput = () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    updateQuery({ search: searchInput.value || undefined, page: undefined });
  }, 300);
};

const onStatusChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  updateQuery({ status: value || undefined, page: undefined });
};

const goToPage = (p: number) => {
  updateQuery({ page: p > 1 ? String(p) : undefined });
};

const toggleComplete = async (task: Task) => {
  try {
    if (task.completed) {
      await api.delete(`/tasks/${task.id}/complete`);
    } else {
      await api.post(`/tasks/${task.id}/complete`);
    }
    await fetchTasks();
  } catch (err) {
    if (err instanceof ApiClientError) {
      errorMessage.value = err.message;
    }
  }
};

const deleteTask = async (task: Task) => {
  if (!confirm(`Hapus tugas "${task.title}"?`)) return;
  try {
    await api.delete(`/tasks/${task.id}`);
    await fetchTasks();
  } catch (err) {
    if (err instanceof ApiClientError) {
      errorMessage.value = err.message;
    }
  }
};

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const isOverdue = (task: Task): boolean => {
  return !task.completed && new Date(task.dueDate) < new Date();
};

watch(() => route.query, fetchTasks);
onMounted(fetchTasks);
</script>

<template>
  <div class="tasks-page">
    <div class="tasks-header">
      <h1>Daftar Tugas</h1>
      <RouterLink v-if="auth.isTeacher" to="/tasks/new" class="btn btn-primary">
        + Tambah Tugas
      </RouterLink>
    </div>

    <div class="tasks-controls">
      <input
        v-model="searchInput"
        type="search"
        placeholder="Cari judul tugas…"
        class="search-input"
        @input="onSearchInput"
      />
      <select v-if="auth.isStudent" :value="status" class="status-filter" @change="onStatusChange">
        <option value="">Semua</option>
        <option value="pending">Belum Selesai</option>
        <option value="done">Selesai</option>
      </select>
    </div>

    <p v-if="errorMessage" class="error-message">
      {{ errorMessage }}
      <button class="btn btn-sm" @click="fetchTasks">Coba Lagi</button>
    </p>

    <div v-if="loading" class="loading-state">
      <p>Memuat tugas…</p>
    </div>

    <div v-else-if="tasks.length === 0" class="empty-state">
      <p>Tidak ada tugas.</p>
    </div>

    <ul v-else class="task-list">
      <li v-for="task in tasks" :key="task.id" class="task-card" :class="{ done: task.completed, overdue: isOverdue(task) }">
        <div class="task-main">
          <label v-if="auth.isStudent" class="task-check">
            <input
              type="checkbox"
              :checked="task.completed"
              @change="toggleComplete(task)"
            />
          </label>
          <div class="task-info">
            <h3 :class="{ strikethrough: task.completed }">{{ task.title }}</h3>
            <p v-if="task.description">{{ task.description }}</p>
            <div class="task-meta">
              <span class="badge">{{ task.className }}</span>
              <span :class="{ 'overdue-text': isOverdue(task) }">
                Tenggat: {{ formatDate(task.dueDate) }}
              </span>
              <span v-if="isOverdue(task)" class="badge badge-danger">Lewat tenggat</span>
              <span v-if="task.completed" class="badge badge-success">Selesai</span>
            </div>
          </div>
        </div>
        <div v-if="auth.isTeacher" class="task-actions">
          <RouterLink :to="`/tasks/${task.id}/edit`" class="btn btn-sm">Ubah</RouterLink>
          <button class="btn btn-sm btn-danger" @click="deleteTask(task)">Hapus</button>
        </div>
      </li>
    </ul>

    <div v-if="meta && meta.totalPages > 1" class="pagination">
      <button
        :disabled="page <= 1"
        class="btn btn-sm"
        @click="goToPage(page - 1)"
      >
        ← Sebelumnya
      </button>
      <span>Halaman {{ page }} dari {{ meta.totalPages }}</span>
      <button
        :disabled="page >= (meta?.totalPages ?? 1)"
        class="btn btn-sm"
        @click="goToPage(page + 1)"
      >
        Berikutnya →
      </button>
    </div>
  </div>
</template>
