import * as fs from 'fs';
import { logger } from './logger';
import { HttpException } from '../exceptions/HttpException';

/**
 * Number of bytes to read in at a time; larger number will allow faster processing
 * of more entries (at the expense of memory utilization). 100k seems to be reasonable
 * from testing.
 */
const CHUNK_SIZE: number = 100 * 1024;

/**
 * Helper function for reading in a chunk of file data
 * @param {fs.Stats} stat                - object providing information about the file
 * @param {number} file                  - the file descriptor
 * @param {number} currentCharacterCount - current number of characters that have been processed in file
 * @param {BufferEncoding} encoding      - character encoding to use; defaults to utf-8
 * @param {number} chunkSize             - size of chunks that should be read in, defaults to CHUNK_SIZE
 *
 * @returns {promise} a promise resolved with the file data or rejected with an error
 */
async function readChunk(
  stat: fs.Stats,
  file: number,
  currentCharacterCount: number,
  encoding: BufferEncoding = 'utf-8',
  chunkSize: number = CHUNK_SIZE,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const offset = stat.size - currentCharacterCount;
    fs.read(file, Buffer.alloc(chunkSize), 0, chunkSize, offset, (err, bytesRead, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString(encoding));
      }
    });
  });
}

/**
 * Helper function for loading file stats
 * @param {string} filePath  - path to file
 *
 * @returns {promise} a promise resolved with the file stats or rejected with an error
 */
async function loadFileStats(filePath: string): Promise<fs.Stats> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stat) => {
      if (err) {
        reject(err);
      } else {
        resolve(stat);
      }
    });
  });
}

/**
 * Helper function for opening a file
 * @param {string} filePath - path to file
 *
 * @returns {promise} a promise resolved with the file or rejected with an error.
 */
async function openFile(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    fs.open(filePath, 'r', (err, file) => {
      if (err) {
        reject(err);
      } else {
        resolve(file);
      }
    });
  });
}

/**
 * Helper function for main line processing logic. Not sure this is cleaner than inlining
 * the logic in the original function.
 *
 * Also includes support for filtering via search argument
 * @param {string} contents             - current contents of the file
 * @param {number} lineCount            - current line count
 * @param {number} maxLineCount         - max number of lines to process
 * @param {string[]} lines              - array of the already processed lines
 * @param {string} search               - search string to filter results
 * @param {boolean} processedCharsCount - current number of characters that have been processed in file
 * @param {fs.Stats} stat               - object providing information about the file
 *
 * @returns an object containing the modified contents, lineCount, and lines
 */
function processLines(contents: string, lineCount: number, maxLineCount: number, lines: string[], processedCharsCount: number, stat: fs.Stats) {
  if (contents.includes('\n')) {
    const split = contents.split('\n');

    // load into lines array in reverse chronological order
    for (let i = split.length - 1; i > 0 && lineCount < maxLineCount; i--) {
      lines[lineCount] = split[i];
      lineCount++;
    }

    // processing loop will continue to read more chunks in; if we're
    // headed back into loop, need to set current value of contents
    if (processedCharsCount < stat.size && lineCount < maxLineCount) {
      contents = split[0];
    } else if (lineCount < maxLineCount) {
      // Here's we're in the final chunk, so need to set last line
      lines[lineCount] = split[0];
      lineCount++;
    }
  }

  return {
    contents,
    lineCount,
    lines,
  };
}

/**
 * Read in the last `n` lines of a file and output in reverse chronological order
 * @param  {string}   filePath       - path to file
 * @param  {int}      maxLineCount   - max number of lines to read in.
 * @param  {encoding} encoding       - character encoding to use; defaults to utf-8
 * @param  {search} search           - search string to filter results
 *
 * @return {promise}  a promise resolved with the lines or rejected with an error.
 */
export async function readLastLinesFromEndOfFile(
  filePath: string,
  maxLineCount: number,
  encoding: BufferEncoding = 'utf8',
  search?: string,
): Promise<string[]> {
  if (!fs.existsSync(filePath)) {
    logger.error(`File ${filePath} does not exist`);
    throw new HttpException(400, `File ${filePath} does not exist`);
  }

  const [stat, file] = await Promise.all([loadFileStats(filePath), openFile(filePath)]);

  let processedCharsCount = CHUNK_SIZE;
  let lineCount = 0;
  let contents = '';
  let lines = [];

  // Case: Empty file, just return
  if (stat.size === 0) {
    return lines;
  }

  // Process as long as the file is large enough to be
  // broken down into chunks
  while (processedCharsCount < stat.size && lineCount < maxLineCount) {
    const nextChunk = await readChunk(stat, file, processedCharsCount, encoding, CHUNK_SIZE);
    contents = nextChunk + contents;

    // If file ends with a newline, strip off \n so splitting works appropriately in the loop
    // Otherwise we end up with an extra line at the front
    if (processedCharsCount === CHUNK_SIZE && contents.endsWith('\n')) {
      contents = contents.slice(0, -1);
    }

    ({ contents, lineCount, lines } = processLines(contents, lineCount, maxLineCount, lines, processedCharsCount, stat));

    processedCharsCount += CHUNK_SIZE;
  }

  // Grab the rest of the file (or entire file if the chunk size is larger than the file)
  if (processedCharsCount - stat.size >= 0) {
    const remainingBytes = stat.size - (processedCharsCount - CHUNK_SIZE);

    let lastChunk = await readChunk(stat, file, stat.size, encoding, remainingBytes);

    // If file ends with a newline, strip off \n so splitting works appropriately in the loop
    // Otherwise we end up with an extra line at the front
    if (stat.size === remainingBytes && lastChunk.endsWith('\n')) {
      lastChunk = lastChunk.slice(0, -1);

      // Special case where we have just a single line - return it
      if (!lastChunk.includes('\n')) {
        return [lastChunk];
      }
    }

    // Grab any bytes that were left over from last iteration
    // and append to the last chunk
    contents = lastChunk + contents;
    ({ lines } = processLines(contents, lineCount, maxLineCount, lines, processedCharsCount, stat));
  }

  fs.closeSync(file);

  // Note: criteria stated `ability to filter the results based on basic text/keyword matches`
  // Here, we're filtering the lines _after_ searching through the file for the desired
  // number of entries. I had a version of this function where it searched through the file
  // with the search phrase as lines were processed, but it suffered a severe slowdown and limited
  // the number of logs that could be fetched. The implementation would need to be reworked to
  // facilitate searching and returning X total logs.
  if (search) {
    return lines.filter(l => l.includes(search));
  }

  return lines;
}
