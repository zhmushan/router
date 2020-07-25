export declare class Node {
  #private;
  children: Map<string, Node>;
  path: string;
  func: Function | undefined;
  constructor(node?: Partial<Node>);
  add(path: string, func: Function): void;
  find(path: string): [Function | undefined, Map<string, string>];
}
