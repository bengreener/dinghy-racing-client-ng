/**
 * An entry in a race.
 * @typedef Entry
 * @property {Race} race The race entered
 * @property {Competitor} helm The competitor entering the race as helm
 * @property {Competitor} crew The copetitor entering the race as crew
 * @property {Dinghy} dinghy The dinghy that will be sailed in the race
 * @property {Array<Lap>} laps The laps for this entry in the race
 * @property {integer} sumOfLapTimes
 * @property {boolean} onLastLap
 * @property {boolean} finishedRace
 * @property {String} scoringAbbreviation records the scoring abbreviation that identifies an adjustment required to an entries scoring for the race 
 * @property {string} url The URL to the remote resource
 */