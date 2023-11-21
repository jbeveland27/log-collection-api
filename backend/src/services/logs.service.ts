import path from 'path';
import { ParamsDto } from '@dtos/params.dto';
import { logger } from '@utils/logger';
import { TreeNode, buildTree } from '@utils/buildTree';
import { API_LOG_DIR } from '@config';
import { HttpException } from '../exceptions/HttpException';
import { readLastLinesFromEndOfFile } from '../utils/readFileLines';

class LogsService {
  public getDirectoryListing = async (): Promise<TreeNode> => {
    try {
      const rootNode = buildTree(API_LOG_DIR);

      return rootNode;
    } catch (error) {
      logger.error('Unable to scan directory: ' + error);
      throw new Error(error);
    }
  };

  public getLogByNameWithEntries = async ({ logName, entries, search }: ParamsDto): Promise<string[]> => {
    try {
      const basePath = path.resolve(API_LOG_DIR);
      const filePath = path.resolve(API_LOG_DIR, logName);

      if (filePath.indexOf(basePath) !== 0) {
        throw new HttpException(400, 'Access denied: Invalid path');
      }

      const lines = await readLastLinesFromEndOfFile(filePath, entries, 'utf-8', search);
      logger.debug(`File: ${filePath} numLines: ${entries} linesBeforeSearch: ${JSON.stringify(lines, null, 2)}`);

      return lines;
    } catch (error) {
      throw new HttpException(error.status, error.message);
    }
  };
}

export default LogsService;
