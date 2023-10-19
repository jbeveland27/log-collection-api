import path from 'path';
import readLastNLines from '@utils/readLastNLine';
import { ParamsDto } from '@dtos/params.dto';
import { logger } from '@utils/logger';
import { TreeNode, buildTree } from '@utils/buildTree';
import { API_LOG_DIR } from '@config';

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
    const filePath = path.resolve(API_LOG_DIR, logName);
    const lines = await readLastNLines(filePath, entries);
    logger.info(`File: ${filePath} numLines: ${entries} linesBeforeSearch: ${JSON.stringify(lines, null, 2)}`);

    if (search) {
      return lines.filter(l => l.includes(search));
    }

    return lines;
  };
}

export default LogsService;
