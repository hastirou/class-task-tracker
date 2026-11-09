import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry.js';
import './auth.openapi.js';
import './tasks.openapi.js';

export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Class Task Tracker API',
    description: 'REST API untuk manajemen tugas kelas',
    version: '1.0.0',
  },
  servers: [{ url: '/api/v1' }],
});
