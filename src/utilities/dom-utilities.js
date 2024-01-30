/**
 * Check document cookie cache and return value of cookie.
 * If cookie not found returns empty string.
 * @param {String} name of cookie to find 
 * @returns {String} Value of cookie
 */
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.pop().split(';').shift();
}

export { getCookieValue };