import path from 'path';
import { buildTree } from './buildTree';

describe('buildTree', () => {
  const initialPath = path.join(__dirname, '../test/var/log');

  it('should return root node', () => {
    const rootNode = buildTree(initialPath);
    expect(rootNode).not.toBeNull();
    expect(rootNode).toHaveProperty('path', initialPath);
    expect(rootNode).toHaveProperty('children');
  });

  it('should return root node with exactly 3 children', () => {
    const rootNode = buildTree(initialPath);
    expect(rootNode.children.length).toEqual(3);

    const childrenPath = rootNode.children.map(child => child.path);
    expect(childrenPath.includes(`${initialPath}/testDir`)).toEqual(true);
    expect(childrenPath.includes(`${initialPath}/log1.txt`)).toEqual(true);
    expect(childrenPath.includes(`${initialPath}/log2.txt`)).toEqual(true);
  });

  it('should add testDir node with its children inside root', () => {
    const rootNode = buildTree(initialPath);
    const testDir = rootNode.children.find(child => child.path === `${initialPath}/testDir`);

    expect(testDir).not.toBeNull();
    expect(testDir?.children.length).toEqual(2);
    expect(testDir?.children[0]?.path).toEqual(`${initialPath}/testDir/log3.txt`);
    expect(testDir?.children[1]?.path).toEqual(`${initialPath}/testDir/log4.txt`);
  });
});
