import { getCookieValue } from '../utilities/dom-utilities';

class Authorisation {
    sessionId = '';
    roles = [];

    constructor() {
        this.getRoles = this.getRoles.bind(this);
    }

    /**
     * Get roles assigned to current user/ principal
     * @returns {Promise<Array<String>>} roles assigned to current user/ principal
     */
    async getRoles() {
        // check session id
        const cookieSessionId = getCookieValue('JSESSIONID');;
        let json;
        // new session get roles for logged in principal
        if (cookieSessionId && (this.sessionId !== cookieSessionId)) {
            this.sessionId = cookieSessionId;
            // get roles for current principal
            const resource = window.location.origin + '/authentication/roles';
            let response;
            try {
                response = await fetch(resource, {method: 'GET', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, cache: 'no-store'});
                json = await response.json();
                this.roles = json.roles ? json.roles : [];
            }
            catch (error) {
                console.error(`Failed to fetch roles: ${error.message}`);
                this.roles = [];
            }
            finally {
                return this.roles;
            }
        }
        // exisiting session
        else if (cookieSessionId && this.sessionId === cookieSessionId) {
            return this.roles;
        }
        // no session so no principal assigned roles
        else {
            this.roles = [];
            return this.roles;
        }
    }
}

// const authorisation = new Authorisation();

export default Authorisation;