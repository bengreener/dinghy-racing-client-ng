/**
 * Converts a string to Title Case 
 * @param {string} string String to convert
 * @returns {string} 
 */
function toTitleCase(string) {
      return string.replace(/\w\S*/g, function(text) {
        return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
    });
}

/**
 * Inserts spaces between the words in a camelCase string
 * @param {string} string String to insert spaces into
 * @returns {string}
 */
function insertSpaceInCamelCase(string) {
    const regex = /[A-Z]/g;
    return string.replaceAll(regex, x => ` ${x}`);
}

/**
 * Formats a schema property name for display
 * Converts to title case and inserts spaces
 * @param {string} propertyName The string to format
 * @returns {string}
 */
function getPropertyLabel(propertyName) {
    return toTitleCase(insertSpaceInCamelCase(propertyName));
}

export { toTitleCase, insertSpaceInCamelCase, getPropertyLabel }