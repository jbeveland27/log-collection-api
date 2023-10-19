import * as fs from 'fs';
import { logger } from './logger';
const readline = require('readline');

const readLastNLines = async (filePath, numLines) => {
  try {
    const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });

    const lines = [];

    for await (const line of rl) {
      lines.unshift(line);
      if (lines.length > numLines) {
        lines.pop();
      }
    }

    return lines;
  } catch (error) {
    logger.error('Error occurred while reading file');
    throw new Error(error);
  }
};

export default readLastNLines;
