import { cleanEnv, num, port, str } from 'envalid';

export const ValidateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    LOG_FORMAT: str(),
    LOG_DIR: str(),
    API_LOG_DIR: str(),
    ORIGIN: str(),
    NUMBER_OF_LINES: num(),
    MAX_NUMBER_OF_LINES: num(),
  });
};
