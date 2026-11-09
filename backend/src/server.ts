import { app } from './app.js';
import { env } from './config/env.js';

const port = env.PORT;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port} (${env.NODE_ENV})`);
});
