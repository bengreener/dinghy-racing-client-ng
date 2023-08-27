import { sortArray, findIndexOfLowest } from './utilities';

it('finds lowest value in array', () => {
    const array = ['d', 'b', 'h', 'z'];
    const lowestIndex = findIndexOfLowest(array, (value) => value);
    expect(lowestIndex).toBe(1);
});

it('sorts an array', () => {
    const startArray = [ 2, 7, 3, 12, 1];
    const sortedArray = sortArray(startArray, (value) => value);
    expect(sortedArray).toEqual([1, 2, 3, 7, 12]);
});

