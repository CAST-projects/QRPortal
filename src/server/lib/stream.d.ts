/* eslint-disable valid-jsdoc */

import { IComparator } from "../sorting/interfaces";


type StreamOpType = 'COLLECT' | 'FILTER' | 'MAP'
type Delegate<T, Y> = (obj: T, index: number, arr: Array<T>) => Y

export class StreamOp<T, Y> {
  private delegate: Delegate<T, Y>
  protected type: StreamOpType
  constructor(type: StreamOpType, delegate: Delegate<T, Y>)

  public execute(obj: T, index: number, arr: Array<T>): Y
}

class GroupedStream<T> extends Stream<Record<string, T[]>> {
  /**
   * if the operation stack is empty, will return an object containing the items devided into groups
   * Flushes operation stack
   */
  public collect(): Record<string, T[]>
}
export class Stream<T> {
  private appendOp<Y>(type: StreamOpType, callback: Delegate<T, Y>): this
  public filter(callback: Delegate<T, boolean>): this
  public map<Y>(callback: Delegate<T, Y>): Stream<Y>

  public each(callback: Delegate<T, void>): this

  public sort(order: 'asc' | 'desc', orderBy: string | ((obj: T) => Any)): this
  public sort(comparator: IComparator<T>): this

  /**
   * Aggregate operations and mutate the stream with output of the operations
   * Flushes operation stack
   */
  public collect(): Array<T>

  /**
   * items that return true from the grouping callback will be assigned to a group with the provided name once `collectGroup` 
   * is called, this action will not do anything in the case `result` or `collect` are called
   */
  public groupAs(name: string, groupingCb: (obj: T) => bool): this

  /**
   * will group items of type `Object` into an array matching the provided key on that object once `collectGroup` 
   * is called, this action will not do anything in the case `result` or `collect` are called
   */
  public groupOn(key: string): this

  /**
   * if the operation stack is empty, will return an object containing the items devided into groups
   * Flushes operation stack, 
   */
  public collectGroup(): Record<string, T[]>

  /**
   * Aggregate operations and return the maximum value found
   * Flushes operation stack
   */
  public max(selector?: (obj: T) => number): T

  /**
   * Aggregate operations and return the minimum value found
   * Flushes operation stack
   */
  public min(selector?: (obj: T) => number): T

  /**
   * Aggregate operations and return the total value of elements
   * Flushes operation stack
   */
  public sum(selector?: (obj: T) => number)

  /**
   * if the operation stack is empty, will return the number of items in the stream
   * if the operation stack contains elements will first call `collect()` before returning the stream
   * Flushes operation stack
   */
  public count(): number
}

export function stream<T>(arr: Array<T>): Stream<T>