/**
 * Sort an array in ascending order based on value returned by getValueFunction
 * @param {Array} array Array to sort
 * @param {Function} getValueFunction Function that returns the value to sort by
 * @returns {Array}
 */
function sortArray(array, getValueFunction) {
    const newArray = [];
    
    while(array.length > 0) {
        // find index of lowest value in array
        const lowestIndex = findIndexOfLowest(array, getValueFunction);
        // put lowest item into a new array
        newArray.push(array[lowestIndex]);
        // remove item from old array
        array.splice(lowestIndex, 1);
    }
    return newArray;
}

/**
 * Find the index of the lowest value in an array
 * @param {Array} array 
 * @param {Function} getValueFunction Function that returns the value of the property to sort against; must be a primitive value or an array
 * @returns {number}
 */
function findIndexOfLowest(array, getValueFunction) {
    var lowestIndex = 0;
    var lowestValue = getValueFunction(array[lowestIndex]);
    for (var i = 1; i < array.length; i++) {
        const value = getValueFunction(array[i]);
        // compare array based on values
        if (Array.isArray(value)) {
            for (var x = 0; x < value.length; x++) {
                // if value greater than current lowest value move on to next item
                if (value[x] > lowestValue[x]) {
                    break;
                }
                if (value[x] < lowestValue[x]) {
                    lowestValue = value;
                    lowestIndex = i;
                    break;
                }
            }
        }
        else {
            if(value < lowestValue) {
                lowestValue = value;
                lowestIndex = i;
            }
        }
    }
    return lowestIndex;
}

export { sortArray, findIndexOfLowest }