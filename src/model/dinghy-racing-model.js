const DinghyRacingModel = {
    /**
     * Creates a new dinghy class
     * @param {DinghyClass} dinghyClass 
     * @returns {Result}
     */
    createDinghyClass: async function (dinghyClass) {
        const uri = 'http://localhost:8081/dinghyracing/api/dinghyclasses';
        try {
            const response = await fetch(uri, {method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/hal+json'}, body: dinghyClass});
            const json = await response.json();
            if(response.ok) {
                return Promise.resolve({'success': true});
            }
            else {
                const message = json.message ? 'HTTP Error: ' + response.status + ' Message: ' + json.message : 'HTTP Error: ' + response.status + 'Message: No additional information available';
                return Promise.resolve({'success': false, 'message': message});
            }
        }
        catch (error) {
            return Promise.resolve({'success': false, 'message': error.toString()});
        }
        
    }
}

export default DinghyRacingModel;