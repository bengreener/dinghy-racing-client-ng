/**
 * @typedef Race
 * @property {string} name Name of the race
 * @property {Date} plannedStartTime Time the race is scheduled to start
 * @property {Date} actualStartTime Time the race is scheduled to start
 * @property {DinghyClass} dinghyClass The class of dinghy that may participate in the race
 * @property {Number} duration The duration of the race; in milliseconds
 * @property {Number} plannedLaps The number of laps planned to be completed during the race
 * @property {Number} lapForecast A forecast of the total number of race laps that will be completed given lasp already completed, last lap time, and remaining race time
 * @property {Number} lastLapTime The last lap time of the lead boat in the race; in milliseconds
 * @property {Number} averageLapTime The average lap time of the lead boat in the race; in milliseconds
 * @property {Clock} clock The race clock
 * @property {StartSequence} startSequenceState The stage the race has reached in it's start sequence
 * @property {string} url The URL to the remote resource
 */