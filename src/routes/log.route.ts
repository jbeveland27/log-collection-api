import { Request, Response, Router } from 'express';
import { Routes } from '@interfaces/routes.interface';

export class LogRoute implements Routes {
  public path = '/log';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, (req: Request, res: Response) => {
      res.status(200).json({ message: 'hello, world!' });
    });
  }
}
