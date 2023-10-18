import path from 'path';
import { readdir, lstat } from 'fs/promises';
import { DirectoryList } from '../interfaces/DirectoryList.interface';
import readLastNLines from '../utils/readLastNLine';
import { ParamsDto } from '../dtos/params.dto';
import { logger } from '@utils/logger';
import { DEFAULTS } from '../constants';

class LogsService {
  public getLogs = async (): Promise<DirectoryList> => {
    try {
      const directoryList = [],
        filesList = [];
      const files = await readdir(DEFAULTS.LOG_DIRECTORY);
      for (const file of files) {
        const fileDetails = await lstat(path.resolve(DEFAULTS.LOG_DIRECTORY, file));
        if (fileDetails.isDirectory()) {
          directoryList.push(file);
        } else {
          filesList.push(file);
        }
      }

      return { directories: directoryList, files: filesList } as DirectoryList;
    } catch (error) {
      logger.error('Unable to scan directory: ' + error);
      throw new Error(error);
    }
  };

  public getLogByNameWithEntries = async ({ logName, entries, search }: ParamsDto): Promise<string[]> => {
    const filePath = path.resolve(DEFAULTS.LOG_DIRECTORY, logName);
    const lines = await readLastNLines(filePath, entries);
    logger.info(`File: ${filePath} numLines: ${entries} linesBeforeSearch: ${JSON.stringify(lines, null, 2)}`);

    if (search) {
      return lines.filter(l => l.includes(search));
    }

    return lines;
  };
}

export default LogsService;
