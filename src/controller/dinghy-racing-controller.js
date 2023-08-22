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
     * Add a new competitor
     * @param {Competitor} competitor
     * @returns {Promise<Result>}
     */
    createCompetitor(competitor) {
        if (!competitor || !competitor.name) {
            return Promise.resolve({'success': false, 'message': 'A name is required for a new competitor'});
        }
        return this.model.createCompetitor(competitor);
    }

    /**
     * Add a new dinghy
     * @param {Dinghy} dinghy
     * @returns {Promise<Result>} 
     */
    createDinghy(dinghy) {
        if (!dinghy || !dinghy.sailNumber) {
            return Promise.resolve({'success': false, 'message': 'A sail number is required for a new dinghy.'});
        }
        if (!dinghy.dinghyClass || !dinghy.dinghyClass.name) {
            return Promise.resolve({'success': false, 'message': 'A dinghy class is required for a new dinghy.'});
        }
        return this.model.createDinghy(dinghy);
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
        if (!(race.plannedStartTime instanceof Date)) {
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
        if (!race.name || race.name === '' || !race.plannedStartTime) {
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

    /**
     * Start a race
     * @param {Race} Race to start
     * @return {Promise<Result>}
     */
    startRace(race) {
        // check valid race (a URL is sufficient, otherwise a name and start time is required)
        if (!race.url && (!race.name || race.name === '' || !race.plannedStartTime)) {
            return Promise.resolve({'success': false, 'message': 'Please provide details of the race.'});
        }
        return this.model.startRace(race, new Date());
    }
}

export default DinghyRacingController