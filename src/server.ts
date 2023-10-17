import { App } from '@/app';
import { LogRoute } from '@routes/log.route';
import { ValidateEnv } from '@utils/validateEnv';

ValidateEnv();

const app = new App([new LogRoute()]);

app.listen();
