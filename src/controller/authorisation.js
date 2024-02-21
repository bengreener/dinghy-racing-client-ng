// import { getCookieValue } from '../utilities/dom-utilities';

class Authorisation {

    /**
     * Get roles assigned to current user/ principal
     * @returns {Promise<Array<String>>} roles assigned to current user/ principal
     */
    async getRoles() {
        let json;
        let roles;

        const resource = window.location.origin + '/authentication/roles';
        let response;
        try {
            response = await fetch(resource, {method: 'GET', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, cache: 'no-store'});
            json = await response.json();
            roles = json.roles ? json.roles : [];
        }
        catch (error) {
            console.error(`Failed to fetch roles: ${error.message}`);
            // roles = [];
            roles = ['ROLE_RACE_SCHEDULER', 'ROLE_RACE_OFFICER', 'ROLE_COMPETITOR'];
        }
        finally {
            return Promise.resolve(roles);
        }
    }
}

export default Authorisation;