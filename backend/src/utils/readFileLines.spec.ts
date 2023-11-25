import path from 'path';
import { readLastLinesFromEndOfFile } from './readFileLines';

describe('readFileLines', () => {
  const initialPath = path.join(__dirname, '../test/var/log');
  const DEFAULT_ENTRIES = 500;

  it('should error when file does not exist', async () => {
    expect.assertions(1);

    const filePath = 'invalid';
    await expect(async () => {
      await readLastLinesFromEndOfFile(filePath, DEFAULT_ENTRIES);
    }).rejects.toThrow(`File ${filePath} does not exist`);
  });

  it('should return empty list for empty file', async () => {
    expect.assertions(2);
    const emptyFile = path.join(initialPath, 'empty-file.log');

    const lines = await readLastLinesFromEndOfFile(emptyFile, DEFAULT_ENTRIES);
    expect(lines).toHaveLength(0);
    expect(lines).toEqual([]);
  });

  it('should return exactly 1 newline', async () => {
    expect.assertions(3);
    const fileWithNewline = path.join(initialPath, 'file-with-newline.log');

    const lines = await readLastLinesFromEndOfFile(fileWithNewline, DEFAULT_ENTRIES);

    expect(lines).not.toBeNull();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('');
  });
  it('should return exactly 1 file line', async () => {
    const fileWithNewline = path.join(initialPath, 'file-with-line.log');

    const lines = await readLastLinesFromEndOfFile(fileWithNewline, DEFAULT_ENTRIES);

    expect(lines).not.toBeNull();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('/dev/rdisk2s1: fsck_apfs completed at Wed Nov  1 00:18:33 2023');
  });

  it('should return exactly 1 empty line', async () => {
    expect.assertions(3);
    const fileWithLines = path.join(initialPath, 'file-with-15-lines.log');
    const entries = 1;

    const lines = await readLastLinesFromEndOfFile(fileWithLines, entries);

    expect(lines).not.toBeNull();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('');
  });

  it('should return all lines', async () => {
    expect.assertions(4);
    const fileWithLines = path.join(initialPath, 'file-with-15-lines.log');

    const lines = await readLastLinesFromEndOfFile(fileWithLines, DEFAULT_ENTRIES);

    expect(lines).not.toBeNull();
    expect(lines).toHaveLength(15);
    expect(lines[0]).toBe('');
    expect(lines[13]).toBe('/dev/rdisk3s6: fsck_apfs started at Wed Oct 25 23:24:06 2023');
  });

  it('should return specified number of lines', async () => {
    expect.assertions(8);
    const fileWithLines = path.join(initialPath, 'file-with-15-lines.log');
    const entries = 6;

    const lines = await readLastLinesFromEndOfFile(fileWithLines, entries);

    expect(lines).not.toBeNull();
    expect(lines).toHaveLength(6);
    expect(lines[0]).toBe('');
    expect(lines[1]).toBe('/dev/rdisk3s3: fsck_apfs completed at Wed Oct 25 23:24:35 2023');
    expect(lines[2]).toBe('/dev/rdisk3s3: ** QUICKCHECK ONLY; FILESYSTEM CLEAN');
    expect(lines[3]).toBe('/dev/rdisk3s3: fsck_apfs started at Wed Oct 25 23:24:34 2023');
    expect(lines[4]).toBe('');
    expect(lines[5]).toBe('');
  });

  it('should return default number of lines on large file', async () => {
    expect.assertions(4);
    const fileWithLines = path.join(initialPath, 'testDir/android_2k.log');

    const lines = await readLastLinesFromEndOfFile(fileWithLines, DEFAULT_ENTRIES);

    expect(lines).not.toBeNull();
    expect(lines).toHaveLength(500);
    expect(lines[0]).toBe('03-17 16:16:09.141  1702  1820 D DisplayPowerController: Animating brightness: target=38, rate=200');
    expect(lines[499]).toBe(
      '03-17 16:15:49.576  1702  2618 D PowerManagerService: release:lock=189667585, flg=0x0, tag="*launch*", name=android", ws=WorkSource{10111}, uid=1000, pid=1702',
    );
  });

  it('should filter using search param', async () => {
    expect.assertions(4);
    const fileWithLines = path.join(initialPath, 'file-with-15-lines.log');
    const search = 'FILESYSTEM';

    const lines = await readLastLinesFromEndOfFile(fileWithLines, DEFAULT_ENTRIES, 'utf-8', search);

    expect(lines).not.toBeNull();
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('/dev/rdisk3s3: ** QUICKCHECK ONLY; FILESYSTEM CLEAN');
    expect(lines[1]).toBe('/dev/rdisk3s1s1: ** QUICKCHECK ONLY; FILESYSTEM CLEAN');
  });

  it('should filter using search param in large file', async () => {
    expect.assertions(3);
    const fileWithLines = path.join(initialPath, 'testDir/android_2k.log');
    const entries = 2000;
    const search = '1702';

    const lines = await readLastLinesFromEndOfFile(fileWithLines, entries, 'utf-8', search);

    expect(lines).not.toBeNull();
    expect(lines).toHaveLength(1095);
    expect(lines[1094]).toBe(
      '03-17 16:13:38.811  1702  2395 D WindowManager: printFreezingDisplayLogsopening app wtoken = AppWindowToken{9f4ef63 token=Token{a64f992 ActivityRecord{de9231d u0 com.tencent.qt.qtl/.activity.info.NewsDetailXmlActivity t761}}}, allDrawn= false, startingDisplayed =  false, startingMoved =  false, isRelaunching =  false',
    );
  });
});
