export declare class Node<T = Function> {
  #private;
  children: Map<string, Node<T>>;
  path: string;
  handler: T | undefined;
  constructor(node?: Partial<Node<T>>);
  add(path: string, handler: T): void;
  find(path: string): [handler: T | undefined, params: Map<string, string>];
}
