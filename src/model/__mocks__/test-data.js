const httpRootURL = 'http://localhost:8081/dinghyracing/api';
const wsRootURL = 'ws://localhost:8081/dinghyracing';

const emptyCollectionHAL = {_embedded:{dinghies:[]},_links:{self:null}};

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

const dinghyClassScorpionHAL = {name: 'Scorpion', crewSize: 2, portsmouthNumber: 1043, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/1' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/1' } } };
const dinghyClassGraduateHAL = {name: 'Graduate', crewSize: 2, portsmouthNumber: 1110, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/5' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/5' } } };
const dinghyClassCometHAL = {name: 'Comet', crewSize: 1, portsmouthNumber: 1210, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/16' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/16' } } };
const dinghyClassNotSetHAL = {name:'',crewSize:0,_links:{self:{href:''},dinghyClass:{href:''}}};
const dinghyClassCollectionHAL = {
	_embedded: {dinghyClasses: [ dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghyClassCometHAL ] }, _links: {
		self: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses' }, profile: {href: 'http://localhost:8081/dinghyracing/api/profile/dinghyClasses' } }, 
		 	page: {size: 20, totalElements: 3, totalPages: 1, number: 0 
		} 
};
const dinghyClassSchemaJSON = {
	title: 'Dinghy class', 
	properties: { 
		name: {title: 'Name', readOnly: false, description: 'identifier', type: 'string' },
		crewSize: {title: 'Crew size', readOnly: false, type: 'integer'} 
	}, definitions: { }, type: 'object', $schema: 'http://json-schema.org/draft-04/schema#' 
};
const dinghyClassSchemaALPS = { 
	alps: {version: '1.0', descriptor: [
		{
			id: 'dinghyClass-representation', 
			href: 'http://localhost:8081/dinghyracing/api/profile/dinghyClasses', 
			descriptor: [
				{name: 'name', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'identifier' } },
				{name:'crewSize', type:'SEMANTIC'}
			]
		}, 
		{id: 'create-dinghyClasses', name: 'dinghyClasses', type: 'UNSAFE', descriptor: [ ], rt: '#dinghyClass-representation' }, 
		{
			id: 'get-dinghyClasses', name: 'dinghyClasses', type: 'SAFE', descriptor: [
				{name: 'page', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'The page to return.'} }, 
				{name: 'size', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'The size of the page to return.' } }, 
				{name: 'sort', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'The sorting criteria to use to calculate the content of the page.' } } 
			], 
			rt: '#dinghyClass-representation' 
		}, 
		{id: 'delete-dinghyClass', name: 'dinghyClass', type: 'IDEMPOTENT', descriptor: [ ], rt: '#dinghyClass-representation'}, 
		{id: 'update-dinghyClass', name: 'dinghyClass', type: 'IDEMPOTENT', descriptor: [ ], rt: '#dinghyClass-representation'}, 
		{id: 'get-dinghyClass', name: 'dinghyClass', type: 'SAFE', descriptor: [ ], rt: '#dinghyClass-representation'}, 
		{id: 'patch-dinghyClass', name: 'dinghyClass', type: 'UNSAFE', descriptor: [ ], rt: '#dinghyClass-representation'}
	]}
};

const fleetScorpionHAL = { 'name' : 'Scorpion', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/1' }, 'fleet' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/1' }, 'dinghyClasses' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses' } } };
const fleetHandicapHAL = { 'name' : 'Handicap', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/2' }, 'fleet' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/2' }, 'dinghyClasses' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses' } } };
const fleetGraduateHAL = { 'name' : 'Graduate', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/3' }, 'fleet' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/3' }, 'dinghyClasses' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses' } } };
const fleetCometHAL = { 'name' : 'Comet', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/4' }, 'fleet' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/4' }, 'dinghyClasses' : { 'href' : 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses' } } };

const fleetsHAL = { '_embedded': { 'fleets': [ fleetScorpionHAL, fleetHandicapHAL ] }, '_links': { 'self': { 'href': 'http://localhost:8081/dinghyracing/api/fleets?page=0&size=20' }, 'profile': {
	'href': 'http://localhost:8081/dinghyracing/api/profile/fleets'
}}, 'page': { 'size': 20, 'totalElements': 1, 'totalPages': 1, 'number': 0 } };

const fleetScorpionDinghyClassHAL = {
    '_embedded': {
        'dinghyClasses': [dinghyClassScorpionHAL]
    },
    '_links': {
        'self': {
            'href': 'http://localhost:8081/dinghyracing/api/fleets/1/dinghyClasses'
        }
    }
};
const fleetHandicapDinghyClassHAL = {	
    '_embedded': {
        'dinghyClasses': []
    },
    '_links': {
        'self': {
            'href': 'http://localhost:8081/dinghyracing/api/fleets/2/dinghyClasses'
        }
    }
};
const fleetGraduateDinghyClassHAL = {	
    '_embedded': {
        'dinghyClasses': [dinghyClassGraduateHAL]
    },
    '_links': {
        'self': {
            'href': 'http://localhost:8081/dinghyracing/api/fleets/3/dinghyClasses'
        }
    }
};
const fleetCometDinghyClassHAL = {	
    '_embedded': {
        'dinghyClasses': [dinghyClassCometHAL]
    },
    '_links': {
        'self': {
            'href': 'http://localhost:8081/dinghyracing/api/fleets/4/dinghyClasses'
        }
    }
};

const dinghy1234HAL = {sailNumber: '1234', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } };
const dinghy2726HAL = {sailNumber: '2726', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' } } };
const dinghy6745HAL = {sailNumber: '6745', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/3' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/3' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } };
const dinghy2928HAL = {sailNumber: '2928', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/7' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/7' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass' } }};
const dinghy826HAL = {sailNumber: '826', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/18' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/18' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass' } } };
const dinghySchemaJSON = {title: 'Dinghy', properties: {dinghyClass: {title: 'Dinghy class', readOnly: false, description: 'ToOne', type: 'string', format: 'uri' }, sailNumber: {title: 'Sail number', readOnly: false, description: 'identifier', type: 'string' } }, definitions: { }, type: 'object', $schema: 'http://json-schema.org/draft-04/schema#' };
const dinghySchemaALPS = {alps: {version: '1.0', descriptor: [ {id: 'dinghy-representation', href: 'http://localhost:8081/dinghyracing/api/profile/dinghies', descriptor: [ {name: 'sailNumber', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'identifier' } }, {name: 'dinghyClass', type: 'SAFE', doc: {format: 'TEXT', value: 'ToOne' }, rt: 'http://localhost:8081/dinghyracing/api/profile/dinghyClasses#dinghyClass-representation' } ] }, {id: 'create-dinghies', name: 'dinghies', type: 'UNSAFE', descriptor: [ ], rt: '#dinghy-representation' }, {id: 'get-dinghies', name: 'dinghies', type: 'SAFE', descriptor: [ {name: 'page', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'The page to return.' } }, {name: 'size', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'The size of the page to return.' } }, {name: 'sort', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'The sorting criteria to use to calculate the content of the page.' } } ], rt: '#dinghy-representation' }, {id: 'delete-dinghy', name: 'dinghy', type: 'IDEMPOTENT', descriptor: [ ], rt: '#dinghy-representation' }, {id: 'update-dinghy', name: 'dinghy', type: 'IDEMPOTENT', descriptor: [ ], rt: '#dinghy-representation' }, {id: 'get-dinghy', name: 'dinghy', type: 'SAFE', descriptor: [ ], rt: '#dinghy-representation' }, {id: 'patch-dinghy', name: 'dinghy', type: 'UNSAFE', descriptor: [ ], rt: '#dinghy-representation' }, {name: 'findByDinghyClass', type: 'SAFE', descriptor: [ {name: 'dinghyclass', type: 'SEMANTIC' } ] } ] } };
const dinghiesCollectionHAL = {_embedded: {dinghies: [
	dinghy1234HAL, dinghy2726HAL, dinghy6745HAL, dinghy2928HAL, dinghy826HAL
] }, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies' }, profile: {href: 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, search: {href: 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, page: {size: 20, totalElements: 5, totalPages: 1, number: 0 } };

const dinghiesScorpionCollectionHAL = {_embedded: {dinghies: [
	dinghy1234HAL, dinghy6745HAL
] }, _links: {
	self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyClasses/1&page=0&size=20' } 
}, page: {size: 20, totalElements: 2, totalPages: 1, number: 0 } };

const raceScorpion_AHAL = { 
	name : 'Scorpion A', plannedStartTime : '2021-10-14T10:30:00', duration: 'PT45M', type: 'FLEET', plannedLaps: 5, startSequenceState: null, startType: 'CSCCLUBSTART', 
		dinghyClasses: [], lapForecast: 5.0, leadEntry: {scoringAbbreviation: null, lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', averageLapTime: 'PT0S', finishedRace: false, 
		onLastLap: false, lapsSailed: 0 }, _links : { 
			self : { href : 'http://localhost:8081/dinghyracing/api/races/4' }, 
			race: { href : 'http://localhost:8081/dinghyracing/api/races/4' }, 
			signedUp : { href : 'http://localhost:8081/dinghyracing/api/races/4/signedUp' }, 
			fleet : { href :  'http://localhost:8081/dinghyracing/api/races/4/fleet' }
		} 
};
// const raceScorpion_ADinghyClassHAL = dinghyClassScorpionHAL;
const raceScorpion_ASignedUpHAL = {_embedded: {dinghies: [ {sailNumber: '1234', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } }, {sailNumber: '6745', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghies/3' }, dinghy: {href: 'http://localhost:8081/dinghyracing/api/dinghies/3' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } } ] }, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/races/4/signedUp' } } };

const raceGraduate_AHAL = {
	name: 'Graduate A', plannedStartTime: '2021-10-14T10:35:00', duration: 'PT45M', type: 'FLEET', plannedLaps: 4, startSequenceState: null, startType: 'CSCCLUBSTART', 
	dinghyClasses: [], lapForecast: 4.0, leadEntry: null, _links: {
		self: {href: 'http://localhost:8081/dinghyracing/api/races/7' }, 
		race: {href: 'http://localhost:8081/dinghyracing/api/races/7' }, 
		signedUp: {href: 'http://localhost:8081/dinghyracing/api/races/7/signedUp' }, 
		fleet: {href: 'http://localhost:8081/dinghyracing/api/races/7/fleet' } 
	} 
};
// const raceGraduate_ADinghyClassHAL = {name: 'Graduate', _links: {self: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/5' }, dinghyClass: {href: 'http://localhost:8081/dinghyracing/api/dinghyClasses/5' } } };
const raceGraduate_ASignedUpHAL = {_embedded: {dinghies: [ ] }, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/races/7/signedUp' } } };

const raceComet_AHAL = {
	name: 'Comet A', plannedStartTime: '2021-10-14T10:40:00', duration: 'PT45M', type: 'FLEET', plannedLaps: 4, startSequenceState: null, startType: 'CSCCLUBSTART', 
	dinghyClasses: [], lapForecast: 4.0, leadEntry: null, _links: {
		self: {href: 'http://localhost:8081/dinghyracing/api/races/17' }, 
		race: {href: 'http://localhost:8081/dinghyracing/api/races/17' }, 
		signedUp: {href: 'http://localhost:8081/dinghyracing/api/races/17/signedUp' }, 
		fleet: {href: 'http://localhost:8081/dinghyracing/api/races/17/fleet' } 
	} 
};
const raceHandicap_AHAL = {
	name: 'Handicap A', plannedStartTime:'2021-10-14T10:45:00', duration: 'PT45M', type: 'FLEET', plannedLaps: 5, startSequenceState: null, startType: 'CSCCLUBSTART', 
	dinghyClasses: [], lapForecast: 5.0, leadEntry: {scoringAbbreviation: null, lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', averageLapTime: 'PT0S', finishedRace: false, 
	onLastLap: false, lapsSailed: null }, _links:{
		self:{href:'http://localhost:8081/dinghyracing/api/races/8'},
		race:{href:'http://localhost:8081/dinghyracing/api/races/8'},
		signedUp:{href:'http://localhost:8081/dinghyracing/api/races/8/signedUp'},
		fleet:{href:'http://localhost:8081/dinghyracing/api/races/8/fleet'}
	}
};

const racePursuit_AHAL = {name: 'Pursuit A', plannedStartTime:'2021-10-14T10:45:00', duration: 'PT45M', type: 'PURSUIT', plannedLaps: 5, startSequenceState: null, startType: 'RRS26', dinghyClasses: [], lapForecast: 5.0, leadEntry: {scoringAbbreviation: null, lastLapTime: 'PT0S', sumOfLapTimes: 'PT0S', averageLapTime: 'PT0S', finishedRace: false, onLastLap: false, lapsSailed: null }, _links:{self:{href:'http://localhost:8081/dinghyracing/api/races/9'},race:{href:'http://localhost:8081/dinghyracing/api/races/9'},signedUp:{href:'http://localhost:8081/dinghyracing/api/races/9/signedUp'},fleet:{href:'http://localhost:8081/dinghyracing/api/fleets/2'}}};

const racesCollectionHAL = {_embedded:{races:[raceScorpion_AHAL, raceGraduate_AHAL, raceComet_AHAL, raceHandicap_AHAL]},_links:{self:{href:'http://localhost:8081/dinghyracing/api/races'},profile:{href:'http://localhost:8081/dinghyracing/api/profile/races'}},page:{size:20,totalElements:4,totalPages:1,number:0}};

// const raceSchemaJSON = {title: 'Race', properties: {duration: {title: 'Duration', readOnly: false, type: 'string', format: 'date-time' }, signedUp: {title: 'Signed up', readOnly: false, description: 'ToMany', type: 'string', format: 'uri' }, dinghyClass: {title: 'Dinghy class', readOnly: false, description: 'ToOne', type: 'string', format: 'uri' }, plannedStartTime: {title: 'Planned start time', readOnly: false, type: 'string', format: 'date-time' }, name: {title: 'Name', readOnly: false, description: 'identifier', type: 'string' }, plannedLaps: {title: 'Planned laps', readOnly: false, type: 'integer' } }, definitions: { }, type: 'object', $schema: 'http://json-schema.org/draft-04/schema#' };
// const raceSchemaALPS = {alps: {version: '1.0', descriptor: [ {id: 'race-representation', href: 'http://localhost:8081/dinghyracing/api/profile/races', descriptor: [ {name: 'name', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'identifier' } }, {name: 'plannedStartTime', type: 'SEMANTIC' }, {name: 'duration', type: 'SEMANTIC' }, {name: 'plannedLaps', type: 'SEMANTIC' }, {name: 'signedUp', type: 'SAFE', doc: {format: 'TEXT', value: 'ToMany' }, rt: 'http://localhost:8081/dinghyracing/api/profile/entries#entry-representation' }, {name: 'dinghyClass', type: 'SAFE', doc: {format: 'TEXT', value: 'ToOne' }, rt: 'http://localhost:8081/dinghyracing/api/profile/dinghyClasses#dinghyClass-representation' } ] }, {id: 'get-races', name: 'races', type: 'SAFE', descriptor: [ {name: 'page', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'The page to return.' } }, {name: 'size', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'The size of the page to return.' } }, {name: 'sort', type: 'SEMANTIC', doc: {format: 'TEXT', value: 'The sorting criteria to use to calculate the content of the page.' } } ], rt: '#race-representation' }, {id: 'create-races', name: 'races', type: 'UNSAFE', descriptor: [ ], rt: '#race-representation' }, {id: 'update-race', name: 'race', type: 'IDEMPOTENT', descriptor: [ ], rt: '#race-representation' }, {id: 'patch-race', name: 'race', type: 'UNSAFE', descriptor: [ ], rt: '#race-representation' }, {id: 'delete-race', name: 'race', type: 'IDEMPOTENT', descriptor: [ ], rt: '#race-representation' }, {id: 'get-race', name: 'race', type: 'SAFE', descriptor: [ ], rt: '#race-representation' }, {name: 'findByNameAndPlannedStartTime', type: 'SAFE', descriptor: [ {name: 'name', type: 'SEMANTIC' }, {name: 'time', type: 'SEMANTIC' } ] }, {name: 'findByPlannedStartTimeGreaterThanEqual', type: 'SAFE', descriptor: [ {name: 'time', type: 'SEMANTIC' } ] } ] } };

const entriesHAL = {_embedded:{entries:[
	{
		scoringAbbreviation: null,
		averageLapTime: 'PT0S',
		finishedRace: false,
		onLastLap: false,
		sumOfLapTimes: 'PT0S',
		correctedTime: 'PT2562047788015215H30M7S',
		lastLapTime: 'PT0S', position: null, _links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/10'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/10'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/10/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/10/helm'},
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/10/crew'},
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/10/laps'},
		race:{href:'http://localhost:8081/dinghyracing/api/entries/10/race'}
	}},
	{
		scoringAbbreviation: null,
		averageLapTime: 'PT0S',
		finishedRace: false,
		onLastLap: false,
		sumOfLapTimes: 'PT0S',
		correctedTime: 'PT2562047788015215H30M7S',
		lastLapTime: 'PT0S', position: null, _links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/11'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/11'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/11/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/11/helm'},
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/11/crew'},
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/11/laps'},
		race:{href:'http://localhost:8081/dinghyracing/api/entries/11/race'}
	}},
	{
		scoringAbbreviation: null,
		averageLapTime: 'PT0S',
		finishedRace: false,
		onLastLap: false,
		sumOfLapTimes: 'PT0S',
		correctedTime: 'PT2562047788015215H30M7S',
		lastLapTime: 'PT0S', 
		position: null, _links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/19'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/19'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/19/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/19/helm'},
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/19/crew'},
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/19/laps'},
		race:{href:'http://localhost:8081/dinghyracing/api/entries/19/race'}
	}},
	]},_links:{self:{href:'http://localhost:8081/dinghyracing/api/entries'},profile:{href:'http://localhost:8081/dinghyracing/api/profile/entries'}},page:{size:20,totalElements:2,totalPages:1,number:0}};
const entriesScorpionAHAL = {_embedded: {entries: [
	{
		scoringAbbreviation: null,
		averageLapTime: 'PT0S',
		lastLapTime: 'PT0S', 
		sumOfLapTimes: 'PT0S',
		correctedTime: 'PT2562047788015215H30M7S',
		onLastLap: false,
		finishedRace: false, 
		position: null,
		_links: {self: {href: 'http://localhost:8081/dinghyracing/api/entries/10' }, 
		entry: {href: 'http://localhost:8081/dinghyracing/api/entries/10' }, 
		helm: {href: 'http://localhost:8081/dinghyracing/api/entries/10/helm' }, 
		crew: {href: 'http://localhost:8081/dinghyracing/api/entries/10/crew' }, 
		laps: {href: 'http://localhost:8081/dinghyracing/api/entries/10/laps' }, 
		race: {href: 'http://localhost:8081/dinghyracing/api/entries/10/race' }, 
		dinghy: {href: 'http://localhost:8081/dinghyracing/api/entries/10/dinghy' } } 
	}, 
	{ 
		scoringAbbreviation: null,
		averageLapTime: 'PT0S', 
		lastLapTime: 'PT0S', 
		sumOfLapTimes: 'PT0S',
		correctedTime: 'PT2562047788015215H30M7S',
		onLastLap: false,
		finishedRace: false, 
		position: null,
		_links: {self: {href: 'http://localhost:8081/dinghyracing/api/entries/11' }, 
		entry: {href: 'http://localhost:8081/dinghyracing/api/entries/11' }, 
		helm: {href: 'http://localhost:8081/dinghyracing/api/entries/11/helm' }, 
		crew: {href: 'http://localhost:8081/dinghyracing/api/entries/11/crew' }, 
		laps: {href: 'http://localhost:8081/dinghyracing/api/entries/11/laps' }, 
		race: {href: 'http://localhost:8081/dinghyracing/api/entries/11/race' }, 
		dinghy: {href: 'http://localhost:8081/dinghyracing/api/entries/11/dinghy' } }
	} 
] }, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/races/4/signedUp' } } };
const entriesCometAHAL = {_embedded: {entries: [
	{ 
		scoringAbbreviation: null,
		averageLapTime: 'PT0S', 
		lastLapTime: 'PT0S', 
		sumOfLapTimes: 'PT0S', 
		onLastLap: false,
		finishedRace: false, 
		position: null,
		_links: {self:{href:'http://localhost:8081/dinghyracing/api/entries/19'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/19'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/19/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/19/helm'},
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/19/crew'},
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/19/laps'},
		race:{href:'http://localhost:8081/dinghyracing/api/entries/19/race'} }
	}
] }, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/races/17/signedUp' } } };
const entriesHandicapAHAL = {_embedded: {entries: [
	{ 
		scoringAbbreviation: null,
		averageLapTime: 'PT0S', 
		lastLapTime: 'PT0S', 
		sumOfLapTimes: 'PT0S' , 
		onLastLap: false,
		finishedRace: false, 
		position: null,
		_links: {self: {href: 'http://localhost:8081/dinghyracing/api/entries/20' }, 
		entry: {href: 'http://localhost:8081/dinghyracing/api/entries/20' }, 
		helm: {href: 'http://localhost:8081/dinghyracing/api/entries/20/helm' }, 
		crew: {href: 'http://localhost:8081/dinghyracing/api/entries/20/crew' }, 
		laps: {href: 'http://localhost:8081/dinghyracing/api/entries/20/laps' }, 
		race: {href: 'http://localhost:8081/dinghyracing/api/entries/20/race' }, 
		dinghy: {href: 'http://localhost:8081/dinghyracing/api/entries/20/dinghy' } } 
	}, 
	{ 
		scoringAbbreviation: null,
		averageLapTime: 'PT0S', 
		lastLapTime: 'PT0S', 
		sumOfLapTimes: 'PT0S', 
		onLastLap: false,
		finishedRace: false, 
		position: null,
		_links: {self: {href: 'http://localhost:8081/dinghyracing/api/entries/21' }, 
		entry: {href: 'http://localhost:8081/dinghyracing/api/entries/21' }, 
		helm: {href: 'http://localhost:8081/dinghyracing/api/entries/21/helm' }, 
		crew: {href: 'http://localhost:8081/dinghyracing/api/entries/21/crew' }, 
		laps: {href: 'http://localhost:8081/dinghyracing/api/entries/21/laps' }, 
		race: {href: 'http://localhost:8081/dinghyracing/api/entries/21/race' }, 
		dinghy: {href: 'http://localhost:8081/dinghyracing/api/entries/21/dinghy' } }
	} 
] }, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/races/8/signedUp' } }};
const entryChrisMarshallDinghy1234HAL = {
	scoringAbbreviation: null,
	averageLapTime: 'PT0S',
	sumOfLapTimes: 'PT0S',
	correctedTime: 'PT2562047788015215H30M7S',
    onLastLap: false,
    lastLapTime: 'PT0S',
	finishedRace: false, 
	position: null,
	_links:{
		self:{href:'http://localhost:8081/dinghyracing/api/entries/10'},
		entry:{href:'http://localhost:8081/dinghyracing/api/entries/10'},
		dinghy:{href:'http://localhost:8081/dinghyracing/api/entries/10/dinghy'},
		helm:{href:'http://localhost:8081/dinghyracing/api/entries/10/helm'}, 
		crew:{href:'http://localhost:8081/dinghyracing/api/entries/10/crew'}, 
		race:{href:'http://localhost:8081/dinghyracing/api/entries/10/race'}, 
		laps:{href:'http://localhost:8081/dinghyracing/api/entries/10/laps'}
	}
};

const dinghyScorpion1234CrewAHAL = {helm: competitorChrisMarshallHAL, mate: competitorJillMyerHAL};
const dinghyScorpion1234CrewBHAL = {helm: competitorLiuBaoHAL, mate: competitorLouScrewHAL};
const dinghyScorpion1234CrewsHAL = {_embedded: {crews: [dinghyScorpion1234CrewAHAL, dinghyScorpion1234CrewBHAL]}, _links: {self: {href: 'http://localhost:8081/dinghyracing/api/crews/search/findCrewsByDinghy?dinghy=http%3A%2F%2Flocalhost%3A8081%2Fdinghyracing%2Fapi%2Fdinghies%2F2'}}};

const competitorChrisMarshall = {name:'Chris Marshall',url:'http://localhost:8081/dinghyracing/api/competitors/8'};
const competitorSarahPascal = {name:'Sarah Pascal',url:'http://localhost:8081/dinghyracing/api/competitors/9'};
const competitorJillMyer = {name:'Jill Myer',url:'http://localhost:8081/dinghyracing/api/competitors/15'};
const competitorLouScrew = {name: 'Lou Screw',url:'http://localhost:8081/dinghyracing/api/competitors/12'};
const competitorOwainDavies = {name: 'Owain Davies',url: 'http://localhost:8081/dinghyracing/api/competitors/13'};
const competitorLiuBao = {name: 'Liu Bao',url: 'http://localhost:8081/dinghyracing/api/competitors/14'};
const competitorBobHoskins = {name: 'Bob Hoskins',url: 'http://localhost:8081/dinghyracing/api/competitors/15'};
const competitorsCollection = [competitorChrisMarshall, competitorSarahPascal, competitorJillMyer, competitorLouScrew, competitorOwainDavies, competitorLiuBao];

const dinghyClassScorpion = {name: 'Scorpion', crewSize: 2, portsmouthNumber: 1043, url: 'http://localhost:8081/dinghyracing/api/dinghyClasses/1' };
const dinghyClassGraduate = {name:'Graduate', crewSize: 2, portsmouthNumber: 1110, url:'http://localhost:8081/dinghyracing/api/dinghyClasses/5'};
const dinghyClassComet = {name:'Comet', crewSize:1, portsmouthNumber: 1210, url:'http://localhost:8081/dinghyracing/api/dinghyClasses/16'}
const dinghyClasses = [dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet];
const dinghyClassesByNameAsc = [dinghyClassComet, dinghyClassGraduate, dinghyClassScorpion];

const fleetScorpion = {name: 'Scorpion', dinghyClasses: [dinghyClassScorpion], url: 'http://localhost:8081/dinghyracing/api/fleets/1'};
const fleetHandicap = {name: 'Handicap', dinghyClasses: [], url: 'http://localhost:8081/dinghyracing/api/fleets/2'};
const fleetGraduate = {name: 'Graduate', dinghyClasses: [dinghyClassGraduate], url: 'http://localhost:8081/dinghyracing/api/fleets/3'}
const fleetComet = {name: 'Comet', dinghyClasses: [dinghyClassComet], url: 'http://localhost:8081/dinghyracing/api/fleets/4'}

const fleets = [ fleetScorpion, fleetHandicap ];

const dinghiesScorpion = [{sailNumber:'1234',dinghyClass:dinghyClassScorpion,url:'http://localhost:8081/dinghyracing/api/dinghies/2'},{sailNumber:'6745',dinghyClass: dinghyClassScorpion,url:'http://localhost:8081/dinghyracing/api/dinghies/3'}];
const dinghy1234 = {sailNumber:'1234',dinghyClass: dinghyClassScorpion,url:'http://localhost:8081/dinghyracing/api/dinghies/2'};
const dinghy2726 = {sailNumber:'2726',dinghyClass: dinghyClassGraduate,url:'http://localhost:8081/dinghyracing/api/dinghies/6'};
const dinghy6745 = {sailNumber:'6745',dinghyClass:dinghyClassScorpion,url:'http://localhost:8081/dinghyracing/api/dinghies/3'};
const dinghy2928 = {sailNumber:'2928',dinghyClass: dinghyClassGraduate,url:'http://localhost:8081/dinghyracing/api/dinghies/7'};
const dinghy826 = {sailNumber:'826',dinghyClass: dinghyClassComet,url:'http://localhost:8081/dinghyracing/api/dinghies/18'};
const dinghies = [dinghy1234, dinghy2726, dinghy6745, dinghy2928, dinghy826];

const dinghy1234Graduate = {sailNumber:'1234',dinghyClass: dinghyClassGraduate,url:'http://localhost:8081/dinghyracing/api/dinghies/6'};
const dinghy1234Comet = {sailNumber:'1234',dinghyClass: dinghyClassComet,url:'http://localhost:8081/dinghyracing/api/dinghies/18'};

const raceScorpionA = { name: 'Scorpion A', plannedStartTime: new Date('2021-10-14T10:30:00Z'), fleet: fleetScorpion, duration: 2700000, type: 'FLEET', plannedLaps: 5, startType: 'CSCCLUBSTART', lapsSailed: 0, lapForecast: 5.0, lastLapTime: 0, averageLapTime: 0, clock: null, startSequenceState: 'NONE', dinghyClasses: [], url: 'http://localhost:8081/dinghyracing/api/races/4' };
const raceGraduateA = {name: 'Graduate A', plannedStartTime: new Date('2021-10-14T10:35:00Z'), fleet: fleetGraduate, duration: 2700000, type: 'FLEET', plannedLaps: 4,  startType: 'CSCCLUBSTART', lapsSailed: null, lapForecast: 4.0, lastLapTime: null, averageLapTime: null, startSequenceState: 'NONE', clock: null, dinghyClasses: [], url: 'http://localhost:8081/dinghyracing/api/races/7' };
const raceCometA = {name: 'Comet A', plannedStartTime: new Date('2021-10-14T10:40:00Z'), fleet: fleetComet, duration: 2700000, type: 'FLEET', plannedLaps: 4, startType: 'CSCCLUBSTART', lapsSailed: null, lapForecast: 4.0, lastLapTime: null, averageLapTime: null, clock: null, startSequenceState: 'NONE', dinghyClasses: [], url: 'http://localhost:8081/dinghyracing/api/races/17' };
const raceHandicapA = {name: 'Handicap A', plannedStartTime: new Date('2021-10-14T10:45:00Z'), fleet: fleetHandicap, duration: 2700000, type: 'FLEET', plannedLaps: 5, startType: 'CSCCLUBSTART', lapsSailed: null, lapForecast: 5.0, lastLapTime: 0, averageLapTime: 0, clock: null, startSequenceState: 'NONE', dinghyClasses: [], url: 'http://localhost:8081/dinghyracing/api/races/8' };
const racePursuitA = {name: 'Pursuit A', plannedStartTime: new Date('2021-10-14T10:45:00Z'), fleet: fleetHandicap, duration: 2700000, type: 'PURSUIT', plannedLaps: 5, startType: 'RRS26', lapsSailed: null, lapForecast: 5.0, lastLapTime: 0, averageLapTime: 0, clock: null, startSequenceState: 'NONE', dinghyClasses: [], url: 'http://localhost:8081/dinghyracing/api/races/9' };

const races = [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA];

const entryChrisMarshallScorpionA1234 = {
	helm: competitorChrisMarshall,
	race: raceScorpionA,
	dinghy: dinghy1234,
	crew: competitorLouScrew,
	laps: [],
	sumOfLapTimes: 0,
	correctedTime: 0,
	onLastLap: false,
	finishedRace: false,
	scoringAbbreviation: null, 
	position: null,
	url: 'http://localhost:8081/dinghyracing/api/entries/10'
};
const entrySarahPascalScorpionA6745 = {helm: competitorSarahPascal, crew: competitorOwainDavies, race: raceScorpionA, dinghy: dinghy6745, laps: [], sumOfLapTimes: 0, correctedTime: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, 
	position: null, url: 'http://localhost:8081/dinghyracing/api/entries/11'};

const entriesScorpionA = [
	entryChrisMarshallScorpionA1234,
	entrySarahPascalScorpionA6745
];
const entriesGraduateA = [
	{helm: competitorJillMyer, crew: null, race: raceGraduateA,dinghy: dinghy2928, laps: [], sumOfLapTimes: 0, correctedTime: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, 
		position: null, url: 'http://localhost:8081/dinghyracing/api/entries/12'}
];
const entryJillMyerCometA826 = {helm: competitorJillMyer, crew: null, race: raceCometA, dinghy: dinghy826, laps: [], sumOfLapTimes: 0, correctedTime: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, 
	position: null, url: 'http://localhost:8081/dinghyracing/api/entries/19'};
const entriesCometA = [
	entryJillMyerCometA826
];
const entryChrisMarshallHandicapA1234 = {helm: competitorChrisMarshall, crew: competitorLouScrew, race: raceHandicapA, dinghy: dinghy1234, laps: [], sumOfLapTimes: 0, correctedTime: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, 
	position: null, url: 'http://localhost:8081/dinghyracing/api/entries/20'};
const entriesHandicapA = [
	entryChrisMarshallHandicapA1234, 
	{helm: competitorJillMyer, crew: null, race: raceHandicapA, dinghy: dinghy826, laps: [], sumOfLapTimes: 0, correctedTime: 0, onLastLap: false, finishedRace: false, scoringAbbreviation: null, 
		position: null, url: 'http://localhost:8081/dinghyracing/api/entries/21'}
];

const entryChrisMarshallPursuitA1234 = {
	helm: competitorChrisMarshall,
	race: racePursuitA, dinghy: dinghy1234,
	crew: competitorLouScrew,
	laps: [], sumOfLapTimes: 0,
	correctedTime: 0,
	onLastLap: false,
	finishedRace: false,
	scoringAbbreviation: null, 
	position: null,
	url: 'http://localhost:8081/dinghyracing/api/entries/22'
};

const entriesPursuitA = [ entryChrisMarshallPursuitA1234 ];

const dinghyScorpion1234CrewA = { helm: competitorChrisMarshall, mate: competitorJillMyer };
const dinghyScorpion1234CrewB = { helm: competitorLiuBao, mate: competitorLouScrew };
const dinghyScorpion1234Crews = [ dinghyScorpion1234CrewA, dinghyScorpion1234CrewB ];
const dinghyGraduate1234CrewA = { helm: competitorSarahPascal, mate: competitorOwainDavies };
const dinghyGraduate1234Crews = [ dinghyGraduate1234CrewA ];
const dinghyComet1234CrewA = { helm: competitorBobHoskins, mate: null };
const dinghyComet1234Crews = [ dinghyComet1234CrewA ]

export {
	httpRootURL, wsRootURL,
	
	emptyCollectionHAL, 

	competitorsCollectionHAL, competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL, competitorLouScrewHAL, 
	competitorOwainDaviesHAL, competitorLiuBaoHAL,
	
	dinghyClassCollectionHAL, dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghyClassCometHAL, dinghyClassNotSetHAL, 
	dinghyClassSchemaJSON, dinghyClassSchemaALPS,
	
	fleetsHAL, fleetScorpionHAL, fleetGraduateHAL, fleetCometHAL, fleetHandicapHAL,

	fleetScorpionDinghyClassHAL, fleetHandicapDinghyClassHAL, fleetGraduateDinghyClassHAL, fleetCometDinghyClassHAL,

	dinghiesCollectionHAL, dinghiesScorpionCollectionHAL, dinghy1234HAL, dinghy2726HAL, dinghy6745HAL, dinghy826HAL,
	dinghySchemaJSON, dinghySchemaALPS, 
		
	racesCollectionHAL, 
	raceScorpion_AHAL, // raceScorpion_ADinghyClassHAL,
	raceScorpion_ASignedUpHAL, 
	raceGraduate_AHAL, // raceGraduate_ADinghyClassHAL, 
	raceGraduate_ASignedUpHAL,
	raceHandicap_AHAL, raceComet_AHAL, racePursuit_AHAL,
	// raceSchemaJSON, raceSchemaALPS,
	
	entriesHAL, entriesScorpionAHAL, entryChrisMarshallDinghy1234HAL, entriesCometAHAL, entriesHandicapAHAL,

	dinghyScorpion1234CrewAHAL, dinghyScorpion1234CrewBHAL, dinghyScorpion1234CrewsHAL,

	competitorsCollection, competitorChrisMarshall, competitorSarahPascal, competitorJillMyer, competitorLouScrew, 
	competitorOwainDavies, competitorLiuBao, 

	dinghyClasses, dinghyClassesByNameAsc, dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet,

	fleets, fleetScorpion, fleetHandicap,


	dinghies, dinghiesScorpion, dinghy1234, dinghy2726, dinghy6745, dinghy2928, dinghy826, dinghy1234Graduate, dinghy1234Comet,

	races, raceScorpionA, raceGraduateA, raceCometA, raceHandicapA, racePursuitA,

	entryChrisMarshallHandicapA1234, entryChrisMarshallScorpionA1234, entrySarahPascalScorpionA6745, entryJillMyerCometA826, entryChrisMarshallPursuitA1234,
	entriesScorpionA, entriesGraduateA, entriesCometA, entriesHandicapA, entriesPursuitA,

	dinghyScorpion1234Crews, dinghyGraduate1234Crews, dinghyComet1234Crews
}