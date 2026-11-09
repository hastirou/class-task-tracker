import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api, setToken, clearToken, getToken } from '../api/client';
import type { AuthUser, AuthResponse } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const token = ref<string | null>(getToken());

  const isLoggedIn = computed(() => token.value !== null);
  const isTeacher = computed(() => user.value?.role === 'TEACHER');
  const isStudent = computed(() => user.value?.role === 'STUDENT');

  const login = async (email: string, password: string): Promise<void> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    token.value = res.token;
    user.value = res.user;
    setToken(res.token);
  };

  const register = async (input: {
    name: string;
    email: string;
    password: string;
    role: 'TEACHER' | 'STUDENT';
    className?: string;
    teacherCode?: string;
  }): Promise<void> => {
    const res = await api.post<AuthResponse>('/auth/register', input);
    token.value = res.token;
    user.value = res.user;
    setToken(res.token);
  };

  const fetchMe = async (): Promise<void> => {
    const res = await api.get<{ user: AuthUser }>('/auth/me');
    user.value = res.user;
  };

  const logout = (): void => {
    token.value = null;
    user.value = null;
    clearToken();
  };

  return { user, token, isLoggedIn, isTeacher, isStudent, login, register, fetchMe, logout };
});
