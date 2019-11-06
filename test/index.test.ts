import { Canallo } from "../src";

it("works", async () => {
  class A {
    public constructor(public id: string) {}
  }

  class T {
    public constructor(public id: string) {}
  }

  const canallo = new Canallo()
    .allow(A, "see", T)
    .allow(A, "delete", T, (a, t) => a.id === t.id);

  const { can } = canallo;

  const a1 = new A("1");
  const a2 = new A("2");
  const t1 = new T("1");

  expect(await can(a1, "delete", t1)).toBe(true); // ok
  expect(await can(a2, "delete", t1)).toBe(false); // condition not met
  expect(await can(a1, "see", a1)).toBe(false); // right `A` see `A` does not exist
});
