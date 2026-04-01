/*
 * Copyright 2022-2024 BG Information Systems Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

// Application configuration
const httpRootURL = 'http://localhost:8081/dinghyracing/api';
const wsRootURL = 'ws://localhost:8081/dinghyracing';

// HAL Data
const competitorBobHoskinsHAL = {name:'Bob Hoskins',_links:{self:{href:'http://localhost:8081/dinghyracing/api/competitors/16'},competitor:{href:'http://localhost:8081/dinghyracing/api/competitors/16'}}};
const competitorChrisMarshallHAL = {name:'Chris Marshall',_links:{self:{href:'http://localhost:8081/dinghyracing/api/competitors/8'},competitor:{href:'http://localhost:8081/dinghyracing/api/competitors/8'}}};
const competitorSarahPascalHAL = {name:'Sarah Pascal',_links:{self:{href:'http://localhost:8081/dinghyracing/api/competitors/9'},competitor:{href:'http://localhost:8081/dinghyracing/api/competitors/9'}}};
const competitorJillMyerHAL = {name:'Jill Myer',_links:{self:{href:'http://localhost:8081/dinghyracing/api/competitors/15'},competitor:{href:'http://localhost:8081/dinghyracing/api/competitors/15'}}};
const competitorLouScrewHAL = {name: 'Lou Screw',_links:{self:{href: 'http://localhost:8081/dinghyracing/api/competitors/12'},competitor: {href: 'http://localhost:8081/dinghyracing/api/competitors/12'}}};
const competitorOwainDaviesHAL = {name: 'Owain Davies',_links: {self: {href: 'http://localhost:8081/dinghyracing/api/competitors/13'},competitor: {href: 'http://localhost:8081/dinghyracing/api/competitors/13'}}};
const competitorLiuBaoHAL = {name: 'Liu Bao',_links: {self: {href: 'http://localhost:8081/dinghyracing/api/competitors/14'},competitor: {href: 'http://localhost:8081/dinghyracing/api/competitors/14'}}};

const competitorsCollectionHAL = {_embedded:{competitors:[
	competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL, competitorLouScrewHAL, competitorOwainDaviesHAL, competitorLiuBaoHAL
]},_links:{
	self:{href:'http://localhost:8081/dinghyracing/api/competitors'},profile:{href:'http://localhost:8081/dinghyracing/api/profile/competitors'}
},page:{size:20,totalElements:6,totalPages:1,number:0}};

const dinghyClassCometHAL = {name: 'Comet', crewSize: 1, portsmouthNumber: 1210, externalName: null, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/16' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/16' } } };
const dinghyClassGraduateHAL = {name: 'Graduate', crewSize: 2, portsmouthNumber: 1110, externalName: null, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/5' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/5' } } };
const dinghyClassScorpionHAL = {name: 'Scorpion', crewSize: 2, portsmouthNumber: 1043, externalName: 'SCORPION', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/1' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/1' } } };

const dinghyClassCollectionHAL = {
	_embedded: {dinghyClasses: [ dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghyClassCometHAL ] }, _links: {
		self: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses' }, profile: {href: 'http://localhost:8081/dinghyracing/api/profile/dinghyClasses' } }, 
		 	page: {size: 20, totalElements: 3, totalPages: 1, number: 0} 
};

const fleetCometHAL = { 'name' : 'Comet', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/4' }, 'fleet' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/4' }, 'dinghyClasses' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses' } } };
const fleetGraduateHAL = { 'name' : 'Graduate', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/3' }, 'fleet' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/3' }, 'dinghyClasses' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses' } } };
const fleetHandicapHAL = { 'name' : 'Handicap', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/2' }, 'fleet' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/2' }, 'dinghyClasses' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses' } } };
const fleetScorpionHAL = { 'name' : 'Scorpion', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/1' }, 'fleet' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/1' }, 'dinghyClasses' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses' } } };

const fleetsCollectionHAL = { '_embedded': { 'fleets': [ fleetCometHAL, fleetGraduateHAL, fleetHandicapHAL, fleetScorpionHAL ] }, '_links': { 'self': { 'href': 'http://localhost:8081/dinghyracing/api/fleets?page=0&size=20' }, 'profile': {
	'href': 'http://localhost:8081/dinghyracing/api/profile/fleets'
}}, 'page': { 'size': 20, 'totalElements': 1, 'totalPages': 1, 'number': 0 } };

const raceCometAHAL = {
	name: 'Comet A', plannedStartTime: '2021-10-14T10:40:00', duration: 'PT45M', type: 'FLEET', plannedLaps: 4, startType: 'CSCCLUBSTART', 
    lapForecast: 4.0, leadEntry: {scoringAbbreviation: null, leadEntryLastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', leadEntryAverageLapTime: 'PT0S', finishedRace: false, 
    onLastLap: false, lapsSailed: 0 }, _links: {
		self: {href: 'http://localhost:8081/dinghyracing/api/directRaces/17' }, 
		directRace: {href: 'http://localhost:8081/dinghyracing/api/directRaces/17' }, 
		signedUp: {href: 'http://localhost:8081/dinghyracing/api/races/17/signedUp' }, 
		fleet: {href: 'http://localhost:8081/dinghyracing/api/races/17/fleet' } 
	} 
};
const raceGraduateAHAL = {
	name: 'Graduate A', plannedStartTime: '2021-10-14T10:35:00', duration: 'PT45M', type: 'FLEET', plannedLaps: 4, startType: 'CSCCLUBSTART', 
    lapForecast: 4.0, leadEntry: {scoringAbbreviation: null, lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', averageLapTime: 'PT0S', finishedRace: false, 
    onLastLap: false, lapsSailed: 0 }, _links: {
		self: {href: 'http://localhost:8081/dinghyracing/api/directRaces/7' }, 
		directRace: {href: 'http://localhost:8081/dinghyracing/api/directRaces/7' }, 
		signedUp: {href: 'http://localhost:8081/dinghyracing/api/races/7/signedUp' }, 
		fleet: {href: 'http://localhost:8081/dinghyracing/api/races/7/fleet' } 
	} 
};
const raceHandicapAHAL = {
	name: 'Handicap A', plannedStartTime:'2021-10-14T10:45:00', duration: 'PT45M', type: 'FLEET', plannedLaps: 5, startType: 'CSCCLUBSTART', 
    lapForecast: 5.0, leadEntry: {scoringAbbreviation: null, lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', averageLapTime: 'PT0S', finishedRace: false, 
	onLastLap: false, lapsSailed: null }, _links:{
		self:{href:'http://localhost:8081/dinghyracing/api/directRaces/8'},
		directRace:{href:'http://localhost:8081/dinghyracing/api/directRaces/8'},
		signedUp:{href:'http://localhost:8081/dinghyracing/api/races/8/signedUp'},
		fleet:{href:'http://localhost:8081/dinghyracing/api/races/8/fleet'}
	}
};
const raceScorpionAHAL = { 
	name : 'Scorpion A', plannedStartTime : '2021-10-14T10:30:00', duration: 'PT45M', type: 'FLEET', plannedLaps: 5, startType: 'CSCCLUBSTART', 
	lapForecast: 5.0, leadEntry: {scoringAbbreviation: null, lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', averageLapTime: 'PT0S', finishedRace: false, 
    onLastLap: false, lapsSailed: 0 }, _links : { 
        self : { href : 'http://localhost:8081/dinghyracing/api/directRaces/4' }, 
        directRace: { href : 'http://localhost:8081/dinghyracing/api/directRaces/4' }, 
        signedUp : { href : 'http://localhost:8081/dinghyracing/api/races/4/signedUp' }, 
        fleet : { href :  'http://localhost:8081/dinghyracing/api/races/4/fleet' }
    } 
};
const racePursuitAHAL = {name: 'Pursuit A', plannedStartTime:'2021-10-14T10:45:00', duration: 'PT45M', type: 'PURSUIT', plannedLaps: 5, startType: 'RRS26',
    lapForecast: 5.0, leadEntry: {scoringAbbreviation: null, lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', averageLapTime: 'PT0S', finishedRace: false, 
    onLastLap: false, lapsSailed: null }, _links:{
        self:{href:'http://localhost:8081/dinghyracing/api/directRaces/9'},
        directRace:{href:'http://localhost:8081/dinghyracing/api/directRaces/9'},
        signedUp:{href:'http://localhost:8081/dinghyracing/api/races/9/signedUp'},
        fleet:{href:'http://localhost:8081/dinghyracing/api/races/9/fleet'}
    }
};

const racesCollectionHAL = {_embedded:{directRaces:[raceScorpionAHAL, raceGraduateAHAL, raceCometAHAL, raceHandicapAHAL]},
    _links:{self:{href:'http://localhost:8081/dinghyracing/api/directRaces'},profile:{href:'http://localhost:8081/dinghyracing/api/profile/directRaces'}},page:{size:20,totalElements:4,totalPages:1,number:0}};

const dinghy1234HAL = {sailNumber: '1234', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } };
const dinghy2726HAL = {sailNumber: '2726', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' } } };
const dinghy6745HAL = {sailNumber: '6745', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/3' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/3' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } };
const dinghy2928HAL = {sailNumber: '2928', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/7' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/7' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass' } }};
const dinghy826HAL = {sailNumber: '826', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/18' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/18' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass' } } };

const dinghiesCollectionHAL = {_embedded: {dinghies: [
	dinghy1234HAL, dinghy2726HAL, dinghy6745HAL, dinghy2928HAL, dinghy826HAL
] }, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies' }, profile: {href: 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, search: {href: 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, page: {size: 20, totalElements: 5, totalPages: 1, number: 0 } };

const entryChrisMarshall1234ScorpionAHAL = {
	scoringAbbreviation: null,
	leadEntryAverageLapTime: 'PT16M40S',
	sumOfLapTimes: 'PT33M20S',
	correctedTime: 'PT2562047788015215H30M7S',
    onLastLap: false,
    leadEntryLastLapTime: 'PT16M40S',
	finishedRace: false, 
	position: null,
	_links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/10'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/10'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/10/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/10/helm'}, 
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/10/crew'}, 
		signedUpTo:{href:'http://localhost:8081/dinghyracing/api/entries/10/signedUpTo'}, 
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/10/laps'}
	}
};
const entryChrisMarshall1234HandicapAHAL = {
	scoringAbbreviation: null,
	leadEntryAverageLapTime: 'PT0M0S',
	sumOfLapTimes: 'PT0M0S',
	correctedTime: 'PT2562047788015215H30M7S',
    onLastLap: false,
    leadEntryLastLapTime: 'PT0M0S',
	finishedRace: false, 
	position: null,
	_links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/23'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/23'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/23/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/23/helm'}, 
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/23/crew'}, 
		signedUpTo:{href:'http://localhost:8081/dinghyracing/api/entries/23/signedUpTo'}, 
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/23/laps'}
	}
};
const entryChrisMarshall1234PursuitAHAL = {
	scoringAbbreviation: null,
	leadEntryAverageLapTime: 'PT16M40S',
	sumOfLapTimes: 'PT33M20S',
	correctedTime: 'PT2562047788015215H30M7S',
    onLastLap: false,
    leadEntryLastLapTime: 'PT16M40S',
	finishedRace: false, 
	position: null,
	_links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/21'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/21'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/21/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/21/helm'}, 
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/21/crew'}, 
		signedUpTo:{href:'http://localhost:8081/dinghyracing/api/entries/21/signedUpTo'}, 
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/21/laps'}
	}
};
const entryJillMyer826PursuitAHAL = {
    scoringAbbreviation: null,
    leadEntryAverageLapTime: 'PT0S',
    finishedRace: false,
    onLastLap: false,
    sumOfLapTimes: 'PT0S',
    correctedTime: 'PT2562047788015215H30M7S',
    leadEntryLastLapTime: 'PT0S', 
    position: null, 
	_links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/19'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/19'},
		signedUpTo:{href:'http://localhost:8081/dinghyracing/api/entries/19/signedUpTo'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/19/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/19/helm'},
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/19/crew'},
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/19/laps'}
	}
};
const entryJillMyer826CometAHAL = {
    scoringAbbreviation: null,
    leadEntryAverageLapTime: 'PT0S',
    finishedRace: false,
    onLastLap: false,
    sumOfLapTimes: 'PT0S',
    correctedTime: 'PT2562047788015215H30M7S',
    leadEntryLastLapTime: 'PT0S', 
    position: null, 
	_links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/22'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/22'},
		signedUpTo:{href:'http://localhost:8081/dinghyracing/api/entries/22/signedUpTo'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/22/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/22/helm'},
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/22/crew'},
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/22/laps'}
	}
};
const entryJillMyer826HandicapAHAL = {
    scoringAbbreviation: null,
    leadEntryAverageLapTime: 'PT0S',
    finishedRace: false,
    onLastLap: false,
    sumOfLapTimes: 'PT0S',
    correctedTime: 'PT2562047788015215H30M7S',
    leadEntryLastLapTime: 'PT0S', 
    position: null, 
	_links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/24'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/24'},
		signedUpTo:{href:'http://localhost:8081/dinghyracing/api/entries/24/signedUpTo'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/24/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/24/helm'},
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/24/crew'},
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/24/laps'}
	}
};
const entryLiuBao2726GraduateAHAL = {
    scoringAbbreviation: null,
    leadEntryAverageLapTime: 'PT15M43S',
    finishedRace: false,
    onLastLap: false,
    sumOfLapTimes: 'PT31M26S',
    correctedTime: 'PT2562047788015215H30M7S',
    leadEntryLastLapTime: 'PT15M59S', 
    position: null, 
	_links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/20'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/20'},
		signedUpTo:{href:'http://localhost:8081/dinghyracing/api/entries/20/signedUpTo'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/20/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/20/helm'},
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/20/crew'},
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/20/laps'}
	}
};
const entrySarahPascal6745ScorpionAHAL = {
	scoringAbbreviation: null,
	leadEntryAverageLapTime: 'PT0S',
	sumOfLapTimes: 'PT17M26S',
	correctedTime: 'PT0S',
    onLastLap: false,
    leadEntryLastLapTime: 'PT17M26S',
	finishedRace: false, 
	position: null,
	_links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/11'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/11'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/11/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/11/helm'}, 
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/11/crew'}, 
		signedUpTo:{href:'http://localhost:8081/dinghyracing/api/entries/11/signedUpTo'}, 
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/11/laps'}
	}
};
const entrySarahPascal6745HandicapAHAL = {
	scoringAbbreviation: null,
	leadEntryAverageLapTime: 'PT0S',
	sumOfLapTimes: 'PT0M0S',
	correctedTime: 'PT0S',
    onLastLap: false,
    leadEntryLastLapTime: 'PT0M0S',
	finishedRace: false, 
	position: null,
	_links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/25'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/25'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/25/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/25/helm'}, 
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/25/crew'}, 
		signedUpTo:{href:'http://localhost:8081/dinghyracing/api/entries/25/signedUpTo'}, 
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/25/laps'}
	}
};
const entriesCollectionHAL = {_embedded:{entries:[entryChrisMarshall1234ScorpionAHAL, entrySarahPascal6745ScorpionAHAL, entryJillMyer826CometAHAL]},
    _links:{self:{href:'http://localhost:8081/dinghyracing/api/entries'},profile:{href:'http://localhost:8081/dinghyracing/api/profile/entries'}},page:{size:20,totalElements:3,totalPages:1,number:0}};
const entriesScorpionAHAL = {_embedded: {entries: [entryChrisMarshall1234ScorpionAHAL, entrySarahPascal6745ScorpionAHAL] },
	_links: {self: {href: 'http://localhost:8081/dinghyracing/api/races/4/signedUp'}},page:{size:20,totalElements:2,totalPages:1,number:0}};

const dinghyScorpion1234CrewAHAL = {helm: competitorChrisMarshallHAL, mate: competitorJillMyerHAL};
const dinghyScorpion1234CrewBHAL = {helm: competitorLiuBaoHAL, mate: competitorLouScrewHAL};
const dinghyScorpion1234CrewsHAL = {_embedded: {crews: [dinghyScorpion1234CrewAHAL, dinghyScorpion1234CrewBHAL]}, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http%3A%2F%2Flocalhost%3A8081%2Fdinghyracing%2Fapi%2Fdinghies%2F2'}}};

const signedUpChrisMarshallDinghy1234ScorpionAHAL = {
	position: 1,
	_links:{
		self:{'href':'http://localhost:8081/dinghyracing/api/signedUps/1'},
		race:{'href':'http://localhost:8081/dinghyracing/api/signedUps/1/race'},
		entry:{'href':'http://localhost:8081/dinghyracing/api/signedUps/1/entry'}
	}
};
const signedUpChrisMarshallDinghy1234PursuitAHAL = {
	position: 1,
	_links:{
		self:{'href':'http://localhost:8081/dinghyracing/api/signedUps/5'},
		race:{'href':'http://localhost:8081/dinghyracing/api/signedUps/5/race'},
		entry:{'href':'http://localhost:8081/dinghyracing/api/signedUps/5/entry'}
	}
};
const signedUpChrisMarshallDinghy1234HandicapAHAL = {
	position: 1,
	_links:{
		self:{'href':'http://localhost:8081/dinghyracing/api/signedUps/7'},
		race:{'href':'http://localhost:8081/dinghyracing/api/signedUps/7/race'},
		entry:{'href':'http://localhost:8081/dinghyracing/api/signedUps/7/entry'}
	}
};
const signedUpJillMyerDinghy826CometAHAL = {
	position: null,
	_links:{
		self:{'href':'http://localhost:8081/dinghyracing/api/signedUps/3'},
		race:{'href':'http://localhost:8081/dinghyracing/api/signedUps/3/race'},
		entry:{'href':'http://localhost:8081/dinghyracing/api/signedUps/3/entry'}
	}
};
const signedUpJillMyerDinghy826PursuitAHAL = {
	position: null,
	_links:{
		self:{'href':'http://localhost:8081/dinghyracing/api/signedUps/6'},
		race:{'href':'http://localhost:8081/dinghyracing/api/signedUps/6/race'},
		entry:{'href':'http://localhost:8081/dinghyracing/api/signedUps/6/entry'}
	}
};
const signedUpJillMyerDinghy826HandicapAHAL = {
	position: null,
	_links:{
		self:{'href':'http://localhost:8081/dinghyracing/api/signedUps/7'},
		race:{'href':'http://localhost:8081/dinghyracing/api/signedUps/7/race'},
		entry:{'href':'http://localhost:8081/dinghyracing/api/signedUps/7/entry'}
	}
};
const signedUpLiuBaoDinghy2726GraduateAHAL = {
	position: 1,
	_links:{
		self:{'href':'http://localhost:8081/dinghyracing/api/signedUps/4'},
		race:{'href':'http://localhost:8081/dinghyracing/api/signedUps/4/race'},
		entry:{'href':'http://localhost:8081/dinghyracing/api/signedUps/4/entry'}
	}
};
const signedUpSarahPascalDinghy6745ScorpionAHAL = {
	position: 2,
	_links:{
		self:{'href':'http://localhost:8081/dinghyracing/api/signedUps/2'},
		race:{'href':'http://localhost:8081/dinghyracing/api/signedUps/2/race'},
		entry:{'href':'http://localhost:8081/dinghyracing/api/signedUps/2/entry'}
	}
};
const signedUpSarahPascalDinghy6745HandicapAHAL = {
	position: 2,
	_links:{
		self:{'href':'http://localhost:8081/dinghyracing/api/signedUps/8'},
		race:{'href':'http://localhost:8081/dinghyracing/api/signedUps/8/race'},
		entry:{'href':'http://localhost:8081/dinghyracing/api/signedUps/8/entry'}
	}
};
const signedUpScorpionACollectionHAL = {
	_embedded: {
		signedUps: [
			signedUpChrisMarshallDinghy1234ScorpionAHAL, signedUpSarahPascalDinghy6745ScorpionAHAL
		]
	}, _links: {
		self: {href: 'http://localhost:8081/dinghyracing/api/directRaces/1/signedUp'}
	}
}

const crews1234ScorpionHAL = {
	_embedded: {
		crews: [
			{
				helm: competitorChrisMarshallHAL,
				mate: competitorLouScrewHAL
			}
		]
	},
	_links: {
		self: {href: ''}
	}
}
const lap1HAL = {
	number: 1,
	time: 'PT15M27S',
	_links: {
		self: {
			href: 'http://localhost:8081/dinghyracing/api/laps/1'
		},
		lap: {
			href: 'http://localhost:8081/dinghyracing/api/laps/1'
		}
	}
}
const lap2HAL = {
	number: 2,
	time: 'PT16M40S',
	_links: {
		self: {
			href: 'http://localhost:8081/dinghyracing/api/laps/2'
		},
		lap: {
			href: 'http://localhost:8081/dinghyracing/api/laps/2'
		}
	}
}
const lap3HAL = {
	number: 3,
	time: 'PT17M26S',
	_links: {
		self: {
			href: 'http://localhost:8081/dinghyracing/api/laps/3'
		},
		lap: {
			href: 'http://localhost:8081/dinghyracing/api/laps/3'
		}
	}
}
const lap4HAL = {number: 2, time: 'PT15M59S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/4' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/4' } }};
const lap5HAL = {number: 2, time: 'PT16M40S', _links: { self: { href: 'http://localhost:8081/dinghyracing/api/laps/5' }, lap: { href: 'http://localhost:8081/dinghyracing/api/laps/5' } }};

export {
	httpRootURL, wsRootURL,

	competitorsCollectionHAL, competitorBobHoskinsHAL, competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL, competitorLouScrewHAL, 
	competitorOwainDaviesHAL, competitorLiuBaoHAL,

	crews1234ScorpionHAL, 

    dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghyClassCometHAL,
    dinghyClassCollectionHAL,

    fleetScorpionHAL, fleetGraduateHAL, fleetCometHAL, fleetHandicapHAL,
    fleetsCollectionHAL, 

    raceScorpionAHAL, raceGraduateAHAL, raceHandicapAHAL, raceCometAHAL, racePursuitAHAL,
    racesCollectionHAL,

    dinghy1234HAL, dinghy2726HAL, dinghy6745HAL, dinghy2928HAL, dinghy826HAL,
    dinghiesCollectionHAL,

    entryChrisMarshall1234ScorpionAHAL, entryChrisMarshall1234HandicapAHAL, entryChrisMarshall1234PursuitAHAL, entryJillMyer826CometAHAL, entryJillMyer826HandicapAHAL,
	entryJillMyer826PursuitAHAL, entryLiuBao2726GraduateAHAL, entrySarahPascal6745HandicapAHAL, entrySarahPascal6745ScorpionAHAL,
    entriesCollectionHAL, entriesScorpionAHAL,

	dinghyScorpion1234CrewAHAL, dinghyScorpion1234CrewBHAL, dinghyScorpion1234CrewsHAL,

	lap1HAL, lap2HAL, lap3HAL, lap4HAL, lap5HAL,

	signedUpChrisMarshallDinghy1234HandicapAHAL, signedUpChrisMarshallDinghy1234ScorpionAHAL, signedUpChrisMarshallDinghy1234PursuitAHAL, signedUpJillMyerDinghy826CometAHAL, signedUpJillMyerDinghy826HandicapAHAL,
	signedUpJillMyerDinghy826PursuitAHAL, signedUpLiuBaoDinghy2726GraduateAHAL, signedUpSarahPascalDinghy6745HandicapAHAL, signedUpSarahPascalDinghy6745ScorpionAHAL,
	signedUpScorpionACollectionHAL,
}