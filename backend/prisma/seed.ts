import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

import { env } from '../src/config/env.js';
import { prisma } from '../src/db/prisma.js';
import { hashPassword } from '../src/utils/password.js';

const TEACHER_ROLE = 'TEACHER' as const;
const STUDENT_ROLE = 'STUDENT' as const;

const teacher = {
  name: 'Guru',
  email: 'guru@example.com',
  password: env.DEFAULT_PW_GURU,
  role: TEACHER_ROLE,
};

const students = [
  { name: 'Siswa 1', email: 'siswa1@example.com', password: env.DEFAULT_PW_SISWA, className: 'X-A' },
  { name: 'Siswa 2', email: 'siswa2@example.com', password: env.DEFAULT_PW_SISWA, className: 'X-A' },
  { name: 'Siswa 3', email: 'siswa3@example.com', password: env.DEFAULT_PW_SISWA, className: 'X-B' },
];

const taskData = [
  {
    title: 'Matematika X-A 1',
    description: 'Kerjakan latihan halaman 12',
    dueOffsetDays: -1,
    className: 'X-A',
  },
  {
    title: 'Bahasa Indonesia X-A',
    description: 'Tulis resensi',
    dueOffsetDays: 1,
    className: 'X-A',
  },
  { title: 'IPA X-A', description: 'Ringkas bab 3', dueOffsetDays: 7, className: 'X-A' },
  {
    title: 'Matematika X-A 2',
    description: 'Latihan soal ujian',
    dueOffsetDays: -4,
    className: 'X-A',
  },
  { title: 'Fisika X-A', description: 'Laporan praktikum', dueOffsetDays: 7, className: 'X-A' },

  {
    title: 'Matematika X-B 1',
    description: 'Kerjakan latihan halaman 15',
    dueOffsetDays: -1,
    className: 'X-B',
  },
  {
    title: 'Bahasa Inggris X-B',
    description: 'Hafalkan kosakata',
    dueOffsetDays: 1,
    className: 'X-B',
  },
  { title: 'Kimia X-B', description: 'Tulis reaksi', dueOffsetDays: 7, className: 'X-B' },
  { title: 'Sejarah X-B', description: 'Timeline peristiwa', dueOffsetDays: -4, className: 'X-B' },
  { title: 'Seni Budaya X-B', description: 'Gambar poster', dueOffsetDays: 7, className: 'X-B' },
];

async function main() {
  await prisma.taskCompletion.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const teacherUser = await prisma.user.create({
    data: {
      name: teacher.name,
      email: teacher.email,
      passwordHash: await hashPassword(teacher.password),
      role: teacher.role,
    },
  });

  const studentUsers = await Promise.all(
    students.map(async (s) =>
      prisma.user.create({
        data: {
          name: s.name,
          email: s.email,
          passwordHash: await hashPassword(s.password),
          role: STUDENT_ROLE,
          className: s.className,
        },
      }),
    ),
  );

  const now = new Date();
  const tasks = await Promise.all(
    taskData.map(async (t) =>
      prisma.task.create({
        data: {
          title: t.title,
          description: t.description,
          dueDate: new Date(now.getTime() + t.dueOffsetDays * 24 * 60 * 60 * 1000),
          className: t.className,
          createdById: teacherUser.id,
        },
      }),
    ),
  );

  const xAStudent1 = studentUsers[0];
  if (xAStudent1) {
    await prisma.taskCompletion.createMany({
      data: tasks
        .filter((t) => t.className === 'X-A')
        .slice(0, 2)
        .map((t) => ({
          taskId: t.id,
          studentId: xAStudent1.id,
          completedAt: new Date(),
        })),
    });
  }

  console.log('Seeding complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
