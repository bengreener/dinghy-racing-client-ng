/**
 * Get a Promise that resolves to the properties for connection to the web service and web socket service of a Dinghy Racing server
 * @param {string} resource URL of the server that will provide the properties
 * @returns {Promise<Object>}
 */
async function getDinghyRacingProperties(resource) {
    const response =  await fetch(resource, {method: 'GET', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, cache: 'no-store'});
    return response.json();
}

export default getDinghyRacingProperties;