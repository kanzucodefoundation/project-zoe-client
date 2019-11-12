import {chunkArray, createArray} from "./arrayHelpers";

it('chunkArray can split an array', () => {
    const result = chunkArray([1, 2, 3, 4, 5], 2)
    expect(result.length).toEqual(2);
});


it('createArray can create an array', () => {
    const fake = () => "foo"
    const result = createArray(5, fake)
    expect(result.length).toEqual(5);
    expect(result).toContain("foo");
});
