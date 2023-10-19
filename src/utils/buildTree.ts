import * as fs from 'fs';
import { logger } from './logger';

export class TreeNode {
  public id: number;
  public name: string;
  public children?: Array<TreeNode>;

  constructor(id: number, path: string) {
    this.id = id;
    this.name = path;
  }
}

export const buildTree = (rootPath: string) => {
  let counter = 1;
  const root = new TreeNode(counter, rootPath);

  const stack = [root];

  while (stack.length) {
    const currentNode = stack.pop();

    if (currentNode) {
      counter++;
      const children = fs.readdirSync(currentNode.name);

      if (children && !currentNode.children) {
        currentNode.children = [];
      }

      for (const child of children) {
        counter++;
        const childPath = `${currentNode.name}/${child}`;
        const childNode = new TreeNode(counter, childPath);

        currentNode.children.push(childNode);
        try {
          if (fs.statSync(childNode.name).isDirectory()) {
            stack.push(childNode);
          }
        } catch (e) {
          logger.info(e);
        }
      }
    }
  }

  return root;
};
