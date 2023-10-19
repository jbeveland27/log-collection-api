import { ParamsDto } from '@dtos/params.dto';
import LogsService from '@services/logs.service';
import { logger } from '@utils/logger';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { DEFAULTS } from '../constants';
import { LogResponse } from '../interfaces/logResponse.interface';
import { TreeNode } from '../utils/buildTree';

class LogsController {
  public logsService = new LogsService();

  public getDirectoryListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug(
      'getDirectoryListing: ' +
        JSON.stringify(
          {
            pathParams: req.params,
            queryParams: req.query,
          },
          null,
          2,
        ),
    );

    try {
      const nodes: TreeNode = await this.logsService.getDirectoryListing();
      res.status(200).json(nodes);
    } catch (error) {
      next(error);
    }
  };

  public getLogByNameWithEntries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug(
      'getLogByName: ' +
        JSON.stringify(
          {
            pathParams: req.params,
            queryParams: req.query,
          },
          null,
          2,
        ),
    );

    try {
      const constraintsViolated = await this.validateParams(req);
      if (constraintsViolated) {
        res.status(400).json({ constraintsViolated });
        return;
      }

      const params: ParamsDto = {
        logName: req.params.logName,
        entries: Number(req.params.entries) || DEFAULTS.NUMBER_OF_LINES,
        search: req.query.search as string,
      };

      const logs: string[] = await this.logsService.getLogByNameWithEntries(params);

      res.status(200).json({ logs, count: logs.length } as LogResponse);
    } catch (error) {
      next(error);
    }
  };

  private validateParams = async (req: Request) => {
    const paramsDto = new ParamsDto(req.params.logName, parseInt(req.params.entries), req.query.search as string);
    logger.info(JSON.stringify(paramsDto));

    const errors = await validate(paramsDto);
    if (errors.length > 0) {
      const constraints = {};
      errors.forEach(error => {
        const propertyName = error.property;
        const errorConstraints = Object.values(error.constraints);
        constraints[propertyName] = errorConstraints;
      });
      return constraints;
    }
    return null;
  };

  // public getLogByNameWithEntries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   logger.debug(
  //     'getLogWithEntries: ' +
  //       JSON.stringify(
  //         {
  //           pathParams: req.params,
  //           queryParams: req.query,
  //         },
  //         null,
  //         2,
  //       ),
  //   );

  //   const { logName, entries } = req.params;
  //   console.log(logName, entries);
  //   try {
  //     const logs: string[] = await this.logsService.getLogByNameWithEntries(logName, entries as unknown as number);
  //     res.status(200).json({ logs });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default LogsController;
