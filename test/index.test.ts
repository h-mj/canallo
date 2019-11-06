import { randomNumber } from "../src";

it("returns a totally random number", () => {
  expect(randomNumber()).toBe(12);
});
