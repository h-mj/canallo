import {
  AnyRight,
  Class,
  Condition,
  InferActions,
  InferActors,
  InferTargets,
  Right
} from "./Right";

/**
 * Function type that is called if actor is not authorized to perform an action of
 * some target.
 */
export type OnNotAuthorized = (
  actor: object,
  action: string,
  target: object
) => never;

/**
 * Default not authorized exception callback.
 */
const defaultOnNotAuthorized = (
  actor: object,
  action: string,
  target: object
) => {
  throw new Error(
    `${actor.constructor.name} is not allowed to ${action} ${target.constructor.name}.`
  );
};

/**
 * Stores defined rights and based on stored rights returns whether some actor
 * is allowed to perform some action on some target.
 *
 * Conditions are checked **one by one** in order they were defined in, so it is
 * good idea to define conditions that at commonly met first.
 */
export class Canallo<R extends AnyRight = never> {
  /**
   * Array of defined rights.
   */
  private rights: R[];

  /**
   * Function that is called when action is not authorized within `authorize`
   * function.
   */
  private onNotAuthorized: OnNotAuthorized;

  /**
   * Creates a new instance of `Canallo` with specified rights array.
   */
  public constructor(
    onNotAuthorized: OnNotAuthorized = defaultOnNotAuthorized
  ) {
    this.rights = [];
    this.onNotAuthorized = onNotAuthorized;
  }

  /**
   * Defines a right that instance of type `A` is allowed to perform an action
   * named `N` on target of type `T` only if optional condition is met.
   */
  public allow<A extends object, N extends string, T extends object>(
    this: Canallo<R | Right<A, N, T>>,
    actorClass: Class<A>,
    action: N,
    targetClass: Class<T>,
    condition?: Condition<A, T>
  ) {
    this.rights.push({
      actorClass,
      action,
      targetClass,
      condition
    });

    return this;
  }

  /**
   * Returns whether specified `actor` is allowed to perform an action named
   * `action` on specified `target`.
   */
  public can = async <
    A extends InferActors<R>,
    N extends InferActions<R, A>,
    T extends InferTargets<R, A, N>
  >(
    actor: A,
    action: N,
    target: T
  ) => {
    for (const right of this.rights) {
      if (
        (actor as object) instanceof right.actorClass &&
        action === right.action &&
        (target as object) instanceof right.targetClass &&
        (right.condition === undefined ||
          (await right.condition(actor, target)))
      ) {
        return true;
      }
    }

    return false;
  };

  /**
   * Returns the opposite to `can`.
   */
  public cannot = async <
    A extends InferActors<R>,
    N extends InferActions<R, A>,
    T extends InferTargets<R, A, N>
  >(
    actor: A,
    action: N,
    target: T
  ) => !(await this.can(actor, action, target));

  /**
   * Similar to `can`, but calls `onNotAuthorized` function if condition is not
   * met.
   */
  public authorize = async <
    A extends InferActors<R>,
    N extends InferActions<R, A>,
    T extends InferTargets<R, A, N>
  >(
    actor: A,
    action: N,
    target: T
  ) => {
    if (this.cannot(actor, action, target)) {
      this.onNotAuthorized(actor, action, target);
    }
  };
}
