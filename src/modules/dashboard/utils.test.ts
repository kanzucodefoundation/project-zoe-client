import { aggregateValue, aggregateValues } from "./utils";

describe("aggregateValue", () => {
  it("works", () => {
    const data = [
      {
        myNumber: "3",
      },
      {
        myNumber: 2,
      },
      {
        myNumber: undefined,
      },
    ];
    const result = aggregateValue(data, "myNumber");
    expect(result).toEqual(5);
  });
  it("works for nested objects", () => {
    const data = [
      {
        myNumber: "3",
        child: {
          childNumber: 6,
        },
      },
      {
        myNumber: 2,
        child: {
          childNumber: 1,
        },
      },
      {
        myNumber: undefined,
        child: {
          childNumber: undefined,
        },
      },
      {
        myNumber: undefined,
        child: {
          childNumber: "foo",
        },
      },
    ];
    const result = aggregateValue(data, "child.childNumber");
    expect(result).toEqual(7);
  });
});

describe("aggregateValues", () => {
  it("works", () => {
    const data = [
      {
        myNumber: "3",
        another: "2",
      },
      {
        myNumber: 2,
      },
      {
        myNumber: undefined,
      },
    ];
    const result = aggregateValues(data, [
      { path: "myNumber", name: "myNumber" },
      { path: "another", name: "another" },
    ]);
    expect(result).toEqual({ myNumber: 5, another: 2 });
  });
});
