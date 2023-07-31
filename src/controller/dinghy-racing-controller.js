class DinghyRacingController {
    
    model;

    constructor(model) {
        if (!model) {
            throw new Error('A dinghy racing model is required when creating an instance of DinghyRacingController');
        }
        this.model = model;
        this.createDinghyClass = this.createDinghyClass.bind(this);
        this.createRace = this.createRace.bind(this);
    }

    /**
     * Create a new dinghy class
     * @param {DinghyClass} dinghyClass
     * @returns {Promise<Result>}
     */
    createDinghyClass(dinghyClass) {
        if (dinghyClass.name === null || dinghyClass.name === '') {
            return Promise.resolve({'success': false, 'message': 'A name is required for a new dinghy class.'});
        }
        return this.model.createDinghyClass(dinghyClass);
    }

    /**
     * Create a new race
     * @param {Race} race
     * @returns {Promise<Result}
     */
    createRace(race) {
        if (race.name === undefined || race.name === null || race.name === '') {
            return Promise.resolve({'success': false, 'message': 'A name is required for a new race.'});
        }
        if (!(race.time instanceof Date)) {
            return Promise.resolve({'success': false, 'message': 'A time is required for a new race.'});
        }
        return this.model.createRace(race);
    }

    /**
     * Sign up to a race
     * @param {Race} race Race to sign up to
     * @param {competitor} competitor Competitor signing up
     * @param {Dinghy} dinghy Dinghy to be sailed in race
     * @returns {Promise<Result>}
     */
    signupToRace(race, competitor, dinghy) {
        // check valid race, competitor, and dinghy provided
        if (!race.name || race.name === '' || !race.time) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        if (!competitor.name || competitor.name === '') {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the competitor.'});
        }
        if (!dinghy.sailNumber || dinghy.sailNumber === '' || !dinghy.dinghyClass || !dinghy.dinghyClass.name || dinghy.dinghyClass.name === '') {
            return Promise.resolve({'success': false, 'message': 'Please provide details for the dinghy.'});
        }
        return this.model.createEntry(race, competitor, dinghy);
    }
}

export default DinghyRacingController