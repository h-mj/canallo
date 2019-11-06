/**
 * Constructor type of type `T`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Class<T extends object> = new (...parameters: any) => T;

/**
 * Condition whether actor of type `A` is allowed to perform an action on target
 * of type `T`.
 */
export type Condition<A extends object, T extends object> = (
  actor: A,
  target: T
) => boolean | Promise<boolean>;

/**
 * Type that represents a right that instance of type `A` is allowed to perform
 * an action named `N` on instance of type `T`.
 */
export interface Right<A extends object, N extends string, T extends object> {
  /**
   * Actor instance class.
   */
  actorClass: Class<A>;

  /**
   * Performed action name.
   */
  action: N;

  /**
   * Target instance class.
   */
  targetClass: Class<T>;

  /**
   * Condition which must be met before the right is granted.
   */
  condition?: Condition<A, T>;
}

/**
 * Right type with any actor and target.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRight = Right<any, string, any>;

/**
 * Infers all actors of union of rights `R`.
 */
export type InferActors<R extends AnyRight> = R extends infer IRight
  ? IRight extends Right<infer IActor, infer _1, infer _2>
    ? IActor
    : never
  : never;

/**
 * Infers all actions that actors of type `A` can perform within union of
 * rights `R`.
 */
export type InferActions<
  R extends AnyRight,
  A extends InferActors<R>
> = R extends infer IRight
  ? IRight extends Right<A, infer IAction, infer _>
    ? IAction
    : never
  : never;

/**
 * Infers all targets on which actors of type `A` can perform actions of type
 * `N` within union of rights `R`.
 */
export type InferTargets<
  R extends AnyRight,
  A extends InferActors<R>,
  N extends InferActions<R, A>
> = R extends infer IRight
  ? IRight extends Right<A, N, infer ITarget>
    ? ITarget
    : never
  : never;
