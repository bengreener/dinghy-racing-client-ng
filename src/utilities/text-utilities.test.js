import { toTitleCase, insertSpaceInCamelCase, getPropertyLabel } from './text-utilities';

it('inserts spaces into camel cased strings', () => {
    const camelCase = 'theQuickBrownFox';
    const expectedResult = 'the Quick Brown Fox'
    const result = insertSpaceInCamelCase(camelCase);
    expect(result).toBe(expectedResult); 
})

it('converts a string to title case', () =>{
    const input = 'the quick brown fox';
    const expectedResult = 'The Quick Brown Fox';
    const result = toTitleCase(input);
    expect(result).toBe(expectedResult);
})

it('converts a property name to a title for display', () => {
    const input = 'theQuickBrownFox';
    const expectedResult = 'The Quick Brown Fox';
    const result = getPropertyLabel(input);
    expect(result).toBe(expectedResult);
})