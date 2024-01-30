class Authorisation {

    getRoles() {
        // return Promise.resolve([]);
        return Promise.resolve(['ROLE_RACE_OFFICER', 'ROLE_COMPETITOR']);
    }
}

export default Authorisation;