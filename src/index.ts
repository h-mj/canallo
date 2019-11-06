/**
 * Constructor type of type `T`.
 */
type Class<T extends object> = new (...parameters: any[]) => T;

/**
 * Defines a right that instance of type `A` is allowed to perform an action
 * named `N` on instance of type `T`.
 */
interface Right<A extends object, N extends string, T extends object> {
  /**
   * Action performer class.
   */
  actorClass: Class<A>;

  /**
   * Action identifier.
   */
  action: N;

  /**
   * Target on which specified action is performed.
   */
  targetClass: Class<T>;

  /**
   * Optional condition whether instance of type `A` is allowed to perform this
   * action on instance of type `T`.
   */
  condition?: (actor: A, target: T) => boolean | Promise<boolean>;
}

/**
 * Default not authorized exception callback.
 */
const onNotAuthorizedDefault = (
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
export class Canallo {
  /**
   * All defined rights.
   */
  private rights: Array<Right<any, string, any>> = [];

  /**
   * Function that is called when action is not authorized within `authorize`
   * function.
   */
  private onNotAuthorized: (actor: any, action: string, target: any) => any;

  /**
   * Creates a new instance of `Canallo` with specified not authorized exception
   * handler.
   */
  public constructor(
    onNotAuthorized: (
      actor: any,
      action: string,
      target: any
    ) => any = onNotAuthorizedDefault
  ) {
    this.onNotAuthorized = onNotAuthorized;
  }

  /**
   * Defines a right that instance of type `A` is allowed to perform an action
   * named `N` on target of type `T` only if optional condition is met.
   */
  public allow = <A extends object, N extends string, T extends object>(
    actorClass: Class<A>,
    action: N,
    targetClass: Class<T>,
    condition?: (actor: A, target: T) => boolean | Promise<boolean>
  ) => {
    this.rights.push({
      actorClass,
      action,
      targetClass,
      condition
    });
  };

  /**
   * Returns whether specified `actor` is allowed to perform an action named
   * `action` on specified `target`.
   */
  public can = async <A extends object, N extends string, T extends object>(
    actor: A,
    action: N,
    target: T
  ) => {
    for (const right of this.rights) {
      if (
        actor instanceof right.actorClass &&
        action === right.action &&
        target instanceof right.targetClass &&
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
  public cannot = async <A extends object, N extends string, T extends object>(
    actor: A,
    action: N,
    target: T
  ) => !(await this.can(actor, action, target));

  /**
   * Similar to `can`, but executes `exceptionHandler` function if condition is
   * not met.
   */
  public authorize = async <
    A extends object,
    N extends string,
    T extends object
  >(
    actor: A,
    action: N,
    target: T
  ) => {
    if (this.cannot(actor, action, target)) {
      return this.onNotAuthorized(actor, action, target);
    }
  };
}
