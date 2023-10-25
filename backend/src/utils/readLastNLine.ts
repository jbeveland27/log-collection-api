import * as fs from 'fs';
import { logger } from './logger';
const readline = require('readline');

// Thanks StackOverflow: https://stackoverflow.com/a/41439945
export function countFileLines(filePath) {
  return new Promise<number>((resolve, reject) => {
    let lineCount = 0;
    const newLineChar = String.fromCharCode(10);
    fs.createReadStream(filePath)
      .on('data', buffer => {
        let idx = -1;
        lineCount--; // Because the loop will run once for idx=-1
        do {
          idx = buffer.indexOf(newLineChar, idx + 1);
          lineCount++;
        } while (idx !== -1);
      })
      .on('end', () => {
        resolve(lineCount);
      })
      .on('error', reject);
  });
}

/**
 * This function contains a few optimizations over the initial version where
 * we read and processed each line. These optimizations resulted in ~5X speed
 * up.
 *
 * First, previously this used `for await...of` to process each line; Node
 * docs indicate this is a bit slower, so switched up to using Promises and
 * listening for the 'line' event.
 *
 * Then, found that reading large files gets much more efficient by calculating
 * an offset and only processing once we've hit that offset. Here, we're
 * using the function above to count the number of file lines in the file
 * first.
 *
 * Next, our array is initialized with numLines to avoid unnecessarily
 * growing the underlying array as we add values.
 *
 * We calculate an offset from the end of the file, and only
 * push values into the array once we reach that offset. Also, we
 * add values to the array starting from the end and working back to
 * the beginning. This is because our expected output has the most
 * recent log lines first.
 *
 * Doing all of this resulted in ~5X speed up from previous implementation
 * where we read and processed each line.
 */
async function readLastNLines(filePath, numLines) {
  return new Promise<string[]>(async (resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      logger.error(`File ${filePath} does not exist`);
      reject(`File ${filePath} does not exist`);
    }

    try {
      const numOfLinesInFile = await countFileLines(filePath);

      const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity,
      });

      const lines = new Array(numLines);
      const targetIndex = numOfLinesInFile - numLines;
      let lineCounter = 0;
      let arrCounter = 1;

      // main processing logic for each line
      rl.on('line', line => {
        lineCounter++;
        if (lineCounter >= targetIndex) {
          lines[lines.length - arrCounter++] = line;
        }
      });

      rl.on('error', (error: any) => {
        reject(error);
      });

      rl.on('close', () => {
        resolve(lines);
      });
    } catch (error) {
      logger.error('Error occurred while reading file', error);
      reject(error);
    }
  });
}

export default readLastNLines;
