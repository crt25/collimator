/* eslint-disable @typescript-eslint/explicit-function-return-type,@typescript-eslint/no-explicit-any */
import { Abstract, Type } from "@nestjs/common";

/**
 * @license MIT License
 * @author Micael Levi L. C.
 * @see based on https://github.com/micalevisk/nestjs-conditional-exception-filter
 *
 * Allows the creation of dynamic exception filters based on a predicate.
 * @example```
 * @Catch(
 *   filter({
 *     // Define for which instance this filter should be applied.
 *     // This is optional, so your filter no longer needs to work over class instances only
 *     for: YourErrorClass,
 *     // And add your refined condition in this callback predicate function
 *     when: (err) => true
 *   })
 * )
 * export class YourFilter implements ExceptionFilter {
 *   // ...
 * }
 * ```
 */
export function ConditionalExceptionFilter<
  T extends Type | Abstract<any>,
>(opts: {
  /** Objects instance of this `for` class will be caught for the given `when` condition. */
  for?: T;
  /** The condition in which the instance of that `for` class are caught. */
  when: (
    exception: T extends Type<infer E> | Abstract<infer E> ? E : unknown,
  ) => boolean;
}): T {
  class DynamicPredicatedBasedClass {
    static [Symbol.hasInstance](instance: unknown) {
      return opts.for
        ? instance instanceof opts.for && opts.when(instance as any)
        : opts.when(instance as any);
    }
  }

  return DynamicPredicatedBasedClass as T;
}
