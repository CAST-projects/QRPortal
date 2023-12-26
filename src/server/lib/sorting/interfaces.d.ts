
export interface IComparer<T> {
  (a: T, b: T, orderBy: string): -1 | 1 | 0;
}

export type IComparator<T> = (a: T, b: T) => -1 | 1 | 0