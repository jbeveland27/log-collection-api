import path from 'path';
import { buildTree } from './buildTree';

describe('buildTree', () => {
  const initialPath = path.join(__dirname, '../test/var/log');

  it('should return root node', async () => {
    const rootNode = await buildTree(initialPath);
    expect(rootNode).not.toBeNull();
    expect(rootNode).toHaveProperty('path', initialPath);
    expect(rootNode).toHaveProperty('children');
  });

  it('should return root node with exactly 5 children', async () => {
    const rootNode = await buildTree(initialPath);
    expect(rootNode.children.length).toEqual(5);

    const childrenPath = rootNode.children.map(child => child.path);
    expect(childrenPath.includes(`${initialPath}/testDir`)).toEqual(true);
    expect(childrenPath.includes(`${initialPath}/empty-file.log`)).toEqual(true);
    expect(childrenPath.includes(`${initialPath}/file-with-15-lines.log`)).toEqual(true);
    expect(childrenPath.includes(`${initialPath}/file-with-line.log`)).toEqual(true);
    expect(childrenPath.includes(`${initialPath}/file-with-newline.log`)).toEqual(true);
  });

  it('should add testDir node with its children inside root', async () => {
    const rootNode = await buildTree(initialPath);
    const testDir = rootNode.children.find(child => child.path === `${initialPath}/testDir`);

    expect(testDir).not.toBeNull();
    expect(testDir?.children.length).toEqual(2);
    expect(testDir?.children[0]?.path).toEqual(`${initialPath}/testDir/android_2k.log`);
    expect(testDir?.children[1]?.path).toEqual(`${initialPath}/testDir/apache_2k.log`);
  });
});
