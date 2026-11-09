import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('../views/TasksView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks/new',
      name: 'task-new',
      component: () => import('../views/TaskFormView.vue'),
      meta: { requiresAuth: true, teacherOnly: true },
    },
    {
      path: '/tasks/:id/edit',
      name: 'task-edit',
      component: () => import('../views/TaskFormView.vue'),
      meta: { requiresAuth: true, teacherOnly: true },
    },
    { path: '/', redirect: '/tasks' },
    { path: '/:pathMatch(.*)*', redirect: '/tasks' },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (auth.isLoggedIn && !auth.user) {
    try {
      await auth.fetchMe();
    } catch {
      auth.logout();
    }
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login' };
  }

  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'tasks' };
  }

  if (to.meta.teacherOnly && !auth.isTeacher) {
    return { name: 'tasks' };
  }
});

export default router;
