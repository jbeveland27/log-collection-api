import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import LogsController from '../controllers/log.controller';

export class LogRoute implements Routes {
  public path = '/logs';
  public router = Router();
  public logs = new LogsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.logs.getLogs);

    // /logs/<LOGNAME>
    this.router.get(`${this.path}/:logName`, this.logs.getLogByNameWithEntries);

    // /logs/<LOGNAME>/entries/<COUNT>
    this.router.get(`${this.path}/:logName/entries/:entries`, this.logs.getLogByNameWithEntries);
  }
}
