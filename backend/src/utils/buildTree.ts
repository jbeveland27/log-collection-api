import * as fs from 'fs/promises';
import { logger } from './logger';
import path from 'path';

export class TreeNode {
  public id: number;
  public name: string;
  public path: string;
  public children?: Array<TreeNode>;

  constructor(id: number, name: string, path: string) {
    this.id = id;
    this.name = name;
    this.path = path;
  }
}

export const buildTree = async (rootPath: string) => {
  let counter = 1;
  const root = new TreeNode(counter, path.basename(rootPath), rootPath);

  const stack = [root];

  while (stack.length) {
    const currentNode = stack.pop();

    if (currentNode) {
      const children = await fs.readdir(currentNode.path);

      if (children && !currentNode.children) {
        currentNode.children = [];
      }

      for (const child of children) {
        counter++;
        const childPath = `${currentNode.path}/${child}`;
        const childNode = new TreeNode(counter, path.basename(childPath), childPath);

        currentNode.children.push(childNode);
        try {
          const stat = await fs.stat(childNode.path);
          if (stat.isDirectory()) {
            stack.push(childNode);
          }
        } catch (e) {
          logger.debug(e);
        }
      }
    }
  }

  return root;
};
