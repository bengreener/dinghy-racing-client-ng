const DinghyRacingModel = {
    /**
     * Creates a new dinghy class
     * @param {DinghyClass} dinghyClass 
     * @returns {Result}
     */
    createDinghyClass: async function (dinghyClass) {
        const uri = 'http://localhost:8081/dinghyracing/api/dinghyclasses';
        const response = await fetch(uri, {method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, body: dinghyClass}); // need to handle reject case; for example if network or target unavailable
        const json = await response.json();
        switch(response.status) {
            case 200:
            case 201:
                return Promise.resolve({'success': true});
                break;
            default:
                const message = json.message ? 'HTTP Error: ' + response.status + ' Message: ' + json.message : 'HTTP Error: ' + response.status + 'Message: No additional information available';
                return Promise.resolve({'success': false, 'message': message});
        }
    }
}

export default DinghyRacingModel;