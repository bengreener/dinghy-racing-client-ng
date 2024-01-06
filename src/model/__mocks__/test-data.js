const nextEntityIndex = 21;

const httpRootURL = 'http://localhost:8081/dinghyracing/api';
const wsRootURL = 'ws://localhost:8081/dinghyracing';

const emptyCollectionHAL = {'_embedded':{'dinghies':[]},'_links':{'self':null}};

const competitorChrisMarshallHAL = {'name':'Chris Marshall','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors/8'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/competitors/8'}}};
const competitorSarahPascalHAL = {'name':'Sarah Pascal','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors/9'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/competitors/9'}}};
const competitorJillMyerHAL = {'name':'Jill Myer','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors/15'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/competitors/15'}}};
const competitorLouScrewHAL = {'name': 'Lou Screw','_links':{'self':{'href': 'http://localhost:8081/dinghyracing/api/competitors/12'},'competitor': {'href': 'http://localhost:8081/dinghyracing/api/competitors/12'}}};
const competitorOwainDaviesHAL = {'name': 'Owain Davies','_links': {'self': {'href': 'http://localhost:8081/dinghyracing/api/competitors/13'},'competitor': {'href': 'http://localhost:8081/dinghyracing/api/competitors/13'}}};
const competitorLiuBaoHAL = {'name': 'Liu Bao','_links': {'self': {'href': 'http://localhost:8081/dinghyracing/api/competitors/14'},'competitor': {'href': 'http://localhost:8081/dinghyracing/api/competitors/14'}}};

const competitorsCollectionHAL = {'_embedded':{'competitors':[
	competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL, competitorLouScrewHAL, competitorOwainDaviesHAL, competitorLiuBaoHAL
]},'_links':{
	'self':{'href':'http://localhost:8081/dinghyracing/api/competitors'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/competitors'}
},'page':{'size':20,'totalElements':5,'totalPages':1,'number':0}};

const dinghyClassScorpionHAL = { 'name' : 'Scorpion', 'crewSize' : 2, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' } } };
const dinghyClassGraduateHAL = { 'name' : 'Graduate', 'crewSize' : 2, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' } } };
const dinghyClassCometHAL = { 'name' : 'Comet', 'crewSize' : 1, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/16' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/16' } } };
const dinghyClassNotSetHAL = {'name':'','crewSize':0,'_links':{'self':{'href':''},'dinghyClass':{'href':''}}};
const dinghyClassCollectionHAL = {
	'_embedded' : { 'dinghyClasses' : [ dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghyClassCometHAL ] }, '_links' : {
		'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses' } }, 
		 	'page' : { 'size' : 20, 'totalElements' : 2, 'totalPages' : 1, 'number' : 0 
		} 
};
const dinghyClassSchemaJSON = {
	'title' : 'Dinghy class', 
	'properties' : { 
		'name' : { 'title' : 'Name', 'readOnly' : false, 'description' : 'identifier', 'type' : 'string' },
		'crewSize': { 'title': 'Crew size', 'readOnly': false, 'type': 'integer'} 
	}, 'definitions' : { }, 'type' : 'object', '$schema' : 'http://json-schema.org/draft-04/schema#' 
};
const dinghyClassSchemaALPS = { 
	'alps' : { 'version' : '1.0', 'descriptor' : [
		{
			'id' : 'dinghyClass-representation', 
			'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses', 
			'descriptor' : [
				{ 'name' : 'name', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'identifier' } },
				{'name':'crewSize', 'type':'SEMANTIC'}
			]
		}, 
		{'id' : 'create-dinghyClasses', 'name' : 'dinghyClasses', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation' }, 
		{
			'id' : 'get-dinghyClasses', 'name' : 'dinghyClasses', 'type' : 'SAFE', 'descriptor' : [
				{ 'name' : 'page', 'type' : 'SEMANTIC', 'doc' : {'format' : 'TEXT', 'value' : 'The page to return.'} }, 
				{ 'name' : 'size', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The size of the page to return.' } }, 
				{ 'name' : 'sort', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The sorting criteria to use to calculate the content of the page.' } } 
			], 
			'rt' : '#dinghyClass-representation' 
		}, 
		{'id' : 'delete-dinghyClass', 'name' : 'dinghyClass', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation'}, 
		{'id' : 'update-dinghyClass', 'name' : 'dinghyClass', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation'}, 
		{'id' : 'get-dinghyClass', 'name' : 'dinghyClass', 'type' : 'SAFE', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation'}, 
		{'id' : 'patch-dinghyClass', 'name' : 'dinghyClass', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation'}
	]}
};

// const dinghiesCollectionHAL = { '_embedded' : { 'dinghies' : [ 
// 	{ 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } }, 
// 	{ 'sailNumber' : '6745', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } }, 
// 	{ 'sailNumber' : '2726', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' } } } 
// ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 20, 'totalElements' : 3, 'totalPages' : 1, 'number' : 0 } };
const dinghiesScorpionCollectionHAL = { '_embedded' : { 'dinghies' : [ { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } }, { 'sailNumber' : '6745', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } } ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1&page=0&size=20' } }, 'page' : { 'size' : 20, 'totalElements' : 2, 'totalPages' : 1, 'number' : 0 } };
const dinghy1234HAL = { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } };
const dinghy2726HAL = { 'sailNumber' : '2726', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' } } };
const dinghy6745HAL = { 'sailNumber' : '6745', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } };
const dinghy2928HAL = {'sailNumber' : '2928', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/7' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/7' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/7/dinghyClass' } }};
const dinghy826HAL = { 'sailNumber' : '826', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/18' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/18' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/18/dinghyClass' } } };
const dinghySchemaJSON = { 'title' : 'Dinghy', 'properties' : { 'dinghyClass' : { 'title' : 'Dinghy class', 'readOnly' : false, 'description' : 'ToOne', 'type' : 'string', 'format' : 'uri' }, 'sailNumber' : { 'title' : 'Sail number', 'readOnly' : false, 'description' : 'identifier', 'type' : 'string' } }, 'definitions' : { }, 'type' : 'object', '$schema' : 'http://json-schema.org/draft-04/schema#' };
const dinghySchemaALPS = { 'alps' : { 'version' : '1.0', 'descriptor' : [ { 'id' : 'dinghy-representation', 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies', 'descriptor' : [ { 'name' : 'sailNumber', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'identifier' } }, { 'name' : 'dinghyClass', 'type' : 'SAFE', 'doc' : { 'format' : 'TEXT', 'value' : 'ToOne' }, 'rt' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses#dinghyClass-representation' } ] }, { 'id' : 'create-dinghies', 'name' : 'dinghies', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'get-dinghies', 'name' : 'dinghies', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'page', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The page to return.' } }, { 'name' : 'size', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The size of the page to return.' } }, { 'name' : 'sort', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The sorting criteria to use to calculate the content of the page.' } } ], 'rt' : '#dinghy-representation' }, { 'id' : 'delete-dinghy', 'name' : 'dinghy', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'update-dinghy', 'name' : 'dinghy', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'get-dinghy', 'name' : 'dinghy', 'type' : 'SAFE', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'patch-dinghy', 'name' : 'dinghy', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'name' : 'findByDinghyClass', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'dinghyclass', 'type' : 'SEMANTIC' } ] } ] } };
const dinghiesCollectionHAL = { '_embedded' : { 'dinghies' : [ 
	dinghy1234HAL, dinghy2726HAL, dinghy6745HAL, dinghy2928HAL, dinghy826HAL
] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 20, 'totalElements' : 3, 'totalPages' : 1, 'number' : 0 } };

const raceScorpion_AHAL = { 'name' : 'Scorpion A', 'plannedStartTime' : '2021-10-14T14:10:00', 'actualStartTime': '2021-10-14T14:10:00', 'duration': 'PT45M', 'plannedLaps': 5, 'lapForecast': 5.0, 'leadEntry': {'lastLapTime': 'PT0S', 'sumOfLapTimes': 'PT0S', 'averageLapTime': 'PT0S'}, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4' }, 'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4' }, 'signedUp' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4/signedUp' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4/dinghyClass' } } };
const raceScorpion_ADinghyClassHAL = dinghyClassScorpionHAL;
const raceScorpion_ASignedUpHAL = { '_embedded' : { 'dinghies' : [ { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } }, { 'sailNumber' : '6745', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } } ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4/signedUp' } } };

const raceGraduate_AHAL = { 'name' : 'Graduate A', 'plannedStartTime' : '2021-10-14T10:30:00', 'actualStartTime': null, 'duration': 'PT45M', 'plannedLaps': 4, 'lapForecast': 4.0, 'leadEntry': null, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7' }, 'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7' }, 'signedUp' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7/signedUp' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7/dinghyClass' } } };
const raceGraduate_ADinghyClassHAL = { 'name' : 'Graduate', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' } } };
const raceGraduate_ASignedUpHAL = { '_embedded' : { 'dinghies' : [ ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7/signedUp' } } };

const raceCometAHAL = { 'name' : 'Comet A', 'plannedStartTime' : '2021-10-14T10:30:00', 'actualStartTime': null, 'duration': 'PT45M', 'plannedLaps': 4, 'lapForecast': 4.0, 'leadEntry': null, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/17' }, 'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/17' }, 'signedUp' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/17/signedUp' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/17/dinghyClass' } } };
const raceHandicapAHAL = {'name': 'Handicap A', 'plannedStartTime':'2023-02-14T18:26:00', 'actualStartTime': null, 'duration': 'PT45M', 'plannedLaps': 5, 'lapForecast': 5.0, 'leadEntry': { 'lastLapTime': 'PT0S', 'sumOfLapTimes': 'PT0S', 'averageLapTime': 'PT0S'}, '_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races/8'},'race':{'href':'http://localhost:8081/dinghyracing/api/races/8'},'signedUp':{'href':'http://localhost:8081/dinghyracing/api/races/8/signedUp'},'dinghyClass':{'href':'http://localhost:8081/dinghyracing/api/races/8/dinghyClass'}}};

const racesCollectionHAL = {'_embedded':{'races':[raceScorpion_AHAL, raceGraduate_AHAL, raceCometAHAL, raceHandicapAHAL]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':20,'totalElements':3,'totalPages':1,'number':0}};

const raceSchemaJSON = { 'title' : 'Race', 'properties' : { 'duration' : { 'title' : 'Duration', 'readOnly' : false, 'type' : 'string', 'format' : 'date-time' }, 'signedUp' : { 'title' : 'Signed up', 'readOnly' : false, 'description' : 'ToMany', 'type' : 'string', 'format' : 'uri' }, 'dinghyClass' : { 'title' : 'Dinghy class', 'readOnly' : false, 'description' : 'ToOne', 'type' : 'string', 'format' : 'uri' }, 'actualStartTime' : { 'title' : 'Actual start time', 'readOnly' : false, 'type' : 'string', 'format' : 'date-time' }, 'plannedStartTime' : { 'title' : 'Planned start time', 'readOnly' : false, 'type' : 'string', 'format' : 'date-time' }, 'name' : { 'title' : 'Name', 'readOnly' : false, 'description' : 'identifier', 'type' : 'string' }, 'plannedLaps' : { 'title' : 'Planned laps', 'readOnly' : false, 'type' : 'integer' } }, 'definitions' : { }, 'type' : 'object', '$schema' : 'http://json-schema.org/draft-04/schema#' };
const raceSchemaALPS = { 'alps' : { 'version' : '1.0', 'descriptor' : [ { 'id' : 'race-representation', 'href' : 'http://localhost:8081/dinghyracing/api/profile/races', 'descriptor' : [ { 'name' : 'name', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'identifier' } }, { 'name' : 'plannedStartTime', 'type' : 'SEMANTIC' }, { 'name' : 'actualStartTime', 'type' : 'SEMANTIC' }, { 'name' : 'duration', 'type' : 'SEMANTIC' }, { 'name' : 'plannedLaps', 'type' : 'SEMANTIC' }, { 'name' : 'signedUp', 'type' : 'SAFE', 'doc' : { 'format' : 'TEXT', 'value' : 'ToMany' }, 'rt' : 'http://localhost:8081/dinghyracing/api/profile/entries#entry-representation' }, { 'name' : 'dinghyClass', 'type' : 'SAFE', 'doc' : { 'format' : 'TEXT', 'value' : 'ToOne' }, 'rt' : 'http://localhost:8081/dinghyracing/api/profile/dinghyClasses#dinghyClass-representation' } ] }, { 'id' : 'get-races', 'name' : 'races', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'page', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The page to return.' } }, { 'name' : 'size', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The size of the page to return.' } }, { 'name' : 'sort', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The sorting criteria to use to calculate the content of the page.' } } ], 'rt' : '#race-representation' }, { 'id' : 'create-races', 'name' : 'races', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'update-race', 'name' : 'race', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'patch-race', 'name' : 'race', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'delete-race', 'name' : 'race', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'get-race', 'name' : 'race', 'type' : 'SAFE', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'name' : 'findByNameAndPlannedStartTime', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'name', 'type' : 'SEMANTIC' }, { 'name' : 'time', 'type' : 'SEMANTIC' } ] }, { 'name' : 'findByPlannedStartTimeGreaterThanEqual', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'time', 'type' : 'SEMANTIC' } ] } ] } };

const entriesHAL = {'_embedded':{'entries':[
	{'_links':{
		'self':{'href':'http://localhost:8081/dinghyracing/api/entries/10'},
		'entry':{'href':'http://localhost:8081/dinghyracing/api/entries/10'},
		'dinghy':{'href':'http://localhost:8081/dinghyracing/api/entries/10/dinghy'},
		'helm':{'href':'http://localhost:8081/dinghyracing/api/entries/10/helm'},
		'crew':{'href':'http://localhost:8081/dinghyracing/api/entries/10/crew'},
		'laps':{'href':'http://localhost:8081/dinghyracing/api/entries/10/laps'},
		'race':{'href':'http://localhost:8081/dinghyracing/api/entries/10/race'}
	}},
	{'_links':{
		'self':{'href':'http://localhost:8081/dinghyracing/api/entries/11'},
		'entry':{'href':'http://localhost:8081/dinghyracing/api/entries/11'},
		'dinghy':{'href':'http://localhost:8081/dinghyracing/api/entries/11/dinghy'},
		'helm':{'href':'http://localhost:8081/dinghyracing/api/entries/11/helm'},
		'crew':{'href':'http://localhost:8081/dinghyracing/api/entries/11/crew'},
		'laps':{'href':'http://localhost:8081/dinghyracing/api/entries/11/laps'},
		'race':{'href':'http://localhost:8081/dinghyracing/api/entries/11/race'}
	}},
	{'_links':{
		'self':{'href':'http://localhost:8081/dinghyracing/api/entries/19'},
		'entry':{'href':'http://localhost:8081/dinghyracing/api/entries/19'},
		'dinghy':{'href':'http://localhost:8081/dinghyracing/api/entries/19/dinghy'},
		'helm':{'href':'http://localhost:8081/dinghyracing/api/entries/19/helm'},
		'crew':{'href':'http://localhost:8081/dinghyracing/api/entries/19/crew'},
		'laps':{'href':'http://localhost:8081/dinghyracing/api/entries/19/laps'},
		'race':{'href':'http://localhost:8081/dinghyracing/api/entries/19/race'}
	}},
	]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/entries'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/entries'}},'page':{'size':20,'totalElements':2,'totalPages':1,'number':0}};
const entriesScorpionAHAL = { '_embedded' : { 'entries' : [
	{ '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10' }, 
		'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10' }, 
		'helm' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10/helm' }, 
		'crew' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10/crew' }, 
		'laps' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10/laps' }, 
		'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10/race' }, 
		'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10/dinghy' } } 
	}, 
	{ '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11' }, 
		'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11' }, 
		'helm' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11/helm' }, 
		'crew' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11/crew' }, 
		'laps' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11/laps' }, 
		'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11/race' }, 
		'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11/dinghy' } }
	} 
] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4/signedUp' } } };
const entriesCometAHAL = { '_embedded' : { 'entries' : [
	{'_links': { 'self':{'href':'http://localhost:8081/dinghyracing/api/entries/19'},
		'entry':{'href':'http://localhost:8081/dinghyracing/api/entries/19'},
		'dinghy':{'href':'http://localhost:8081/dinghyracing/api/entries/19/dinghy'},
		'helm':{'href':'http://localhost:8081/dinghyracing/api/entries/19/helm'},
		'crew':{'href':'http://localhost:8081/dinghyracing/api/entries/19/crew'},
		'laps':{'href':'http://localhost:8081/dinghyracing/api/entries/19/laps'},
		'race':{'href':'http://localhost:8081/dinghyracing/api/entries/19/race'} }
	}
] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/17/signedUp' } } };
const entriesHandicapAHAL = { '_embedded' : { 'entries' : [
	{ '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
		'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20' }, 
		'helm' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/helm' }, 
		'crew' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/crew' }, 
		'laps' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/laps' }, 
		'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/race' }, 
		'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/20/dinghy' } } 
	}, 
	{ '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
		'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21' }, 
		'helm' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/helm' }, 
		'crew' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/crew' }, 
		'laps' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/laps' }, 
		'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/race' }, 
		'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/21/dinghy' } }
	} 
] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/8/signedUp' } }

};
const entryChrisMarshallDinghy1234HAL = {'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/entries/10'},'entry':{'href':'http://localhost:8081/dinghyracing/api/entries/10'},'dinghy':{'href':'http://localhost:8081/dinghyracing/api/entries/10/dinghy'},'helm':{'href':'http://localhost:8081/dinghyracing/api/entries/10/helm'}, 'crew':{'href':'http://localhost:8081/dinghyracing/api/entries/10/crew'}}}; 

const competitorChrisMarshall = {'name':'Chris Marshall','url':'http://localhost:8081/dinghyracing/api/competitors/8'};
const competitorSarahPascal = {'name':'Sarah Pascal','url':'http://localhost:8081/dinghyracing/api/competitors/9'};
const competitorJillMyer = {'name':'Jill Myer','url':'http://localhost:8081/dinghyracing/api/competitors/15'};
const competitorLouScrew = {'name': 'Lou Screw','url':'http://localhost:8081/dinghyracing/api/competitors/12'};
const competitorOwainDavies = {'name': 'Owain Davies','url': 'http://localhost:8081/dinghyracing/api/competitors/13'};
const competitorLiuBao = {'name': 'Liu Bao','url': 'http://localhost:8081/dinghyracing/api/competitors/14'};
const competitorsCollection = [competitorChrisMarshall, competitorSarahPascal, competitorJillMyer, competitorLouScrew, competitorOwainDavies, competitorLiuBao];

const dinghyClassScorpion = { 'name' : 'Scorpion', 'crewSize' : 2, 'url': 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' };
const dinghyClassGraduate = {'name':'Graduate', 'crewSize' : 2, 'url':'http://localhost:8081/dinghyracing/api/dinghyclasses/5'};
const dinghyClassComet = {'name':'Comet', 'crewSize':1, 'url':'http://localhost:8081/dinghyracing/api/dinghyclasses/16'}
const dinghyClasses = [dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet];
const dinghyClassesByNameAsc = [dinghyClassComet, dinghyClassGraduate, dinghyClassScorpion];

const dinghiesScorpion = [{'sailNumber':'1234','dinghyClass':dinghyClassScorpion,'url':'http://localhost:8081/dinghyracing/api/dinghies/2'},{'sailNumber':'6745','dinghyClass': dinghyClassScorpion,'url':'http://localhost:8081/dinghyracing/api/dinghies/3'}];
const dinghy1234 = {'sailNumber':'1234','dinghyClass': dinghyClassScorpion,'url':'http://localhost:8081/dinghyracing/api/dinghies/2'};
const dinghy2726 = {'sailNumber':'2726','dinghyClass': dinghyClassGraduate,'url':'http://localhost:8081/dinghyracing/api/dinghies/6'};
const dinghy6745 = {'sailNumber':'6745','dinghyClass':dinghyClassScorpion,'url':'http://localhost:8081/dinghyracing/api/dinghies/3'};
const dinghy2928 = {'sailNumber':'2928','dinghyClass': dinghyClassGraduate,'url':'http://localhost:8081/dinghyracing/api/dinghies/7'};
const dinghy826 = {'sailNumber':'826','dinghyClass': dinghyClassComet,'url':'http://localhost:8081/dinghyracing/api/dinghies/18'};
const dinghies = [dinghy1234, dinghy2726, dinghy6745, dinghy2928, dinghy826];

const raceScorpionA = { 'name': 'Scorpion A', 'plannedStartTime': new Date('2021-10-14T14:10:00Z'), 'actualStartTime': new Date('2021-10-14T14:10:00Z'), 'dinghyClass': dinghyClassScorpion, 'duration': 2700000, 'plannedLaps': 5, 'lapForecast': 5.0, 'lastLapTime': 0, 'averageLapTime': 0, 'clock': null, 'url': 'http://localhost:8081/dinghyracing/api/races/4' };
const raceGraduateA = { 'name': 'Graduate A', 'plannedStartTime' : new Date('2021-10-14T10:30:00Z'), 'actualStartTime': null, 'dinghyClass': dinghyClassGraduate, 'duration': 2700000, 'plannedLaps': 4, 'lapForecast': 4.0, 'lastLapTime': null, 'averageLapTime': null, 'clock': null, 'url': 'http://localhost:8081/dinghyracing/api/races/7' };
const raceCometA = { 'name': 'Comet A', 'plannedStartTime' : new Date('2021-10-14T10:30:00Z'), 'actualStartTime': null, 'dinghyClass': dinghyClassComet, 'duration': 2700000, 'plannedLaps': 4, 'lapForecast': 4.0, 'lastLapTime': null, 'averageLapTime': null, 'clock': null, 'url': 'http://localhost:8081/dinghyracing/api/races/17' };
const raceHandicapA = { 'name': 'Handicap A', 'plannedStartTime': new Date('2023-02-14T18:26:00Z'), 'actualStartTime': null, 'dinghyClass': null, 'duration': 2700000, 'plannedLaps': 5, 'lapForecast': 5.0, 'lastLapTime': 0, 'averageLapTime': 0, 'clock': null, 'url': 'http://localhost:8081/dinghyracing/api/races/8' };
const races = [raceScorpionA, raceGraduateA, raceCometA, raceHandicapA];

const entriesScorpionA = [
	{'helm': competitorChrisMarshall, 'crew': competitorLouScrew, 'race': raceScorpionA,'dinghy': dinghy1234, 'laps': [], 'url': 'http://localhost:8081/dinghyracing/api/entries/10'},
	{'helm': competitorSarahPascal, 'crew': competitorOwainDavies, 'race': raceScorpionA,'dinghy': dinghy6745, 'laps': [],'url': 'http://localhost:8081/dinghyracing/api/entries/11'}
];
const entriesGraduateA = [{'helm': competitorJillMyer, 'crew': null, 'race': raceGraduateA,'dinghy': dinghy2928, 'laps': [], 'url': 'http://localhost:8081/dinghyracing/api/entries/12'}];
const entriesCometA = [
	{'helm': competitorJillMyer, 'crew': null, 'race': raceCometA, 'dinghy': dinghy826, 'laps': [], 'url': 'http://localhost:8081/dinghyracing/api/entries/19'}
];
const entriesHandicapA = [
	{'helm': competitorChrisMarshall, 'crew': competitorLouScrew, 'race': raceHandicapA, 'dinghy': dinghy1234, 'laps': [], 'url': 'http://localhost:8081/dinghyracing/api/entries/20'}, 
	{'helm': competitorJillMyer, 'crew': null, 'race': raceHandicapA, 'dinghy': dinghy826, 'laps': [], 'url': 'http://localhost:8081/dinghyracing/api/entries/21'}
];
const entryChrisMarshallScorpionA1234 = {
	'helm': competitorChrisMarshall, 'crew': null, 
	'race': raceScorpionA,
	'dinghy': dinghy1234,
	'crew': competitorLouScrew, 
	'laps': [], 'url': 'http://localhost:8081/dinghyracing/api/entries/10'
};

export {
	httpRootURL, wsRootURL,
	
	emptyCollectionHAL, 

	competitorsCollectionHAL, competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL, competitorLouScrewHAL, 
	competitorOwainDaviesHAL, competitorLiuBaoHAL,
	
	dinghyClassCollectionHAL, dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghyClassCometHAL, dinghyClassNotSetHAL, 
	dinghyClassSchemaJSON, dinghyClassSchemaALPS,
	
	dinghiesCollectionHAL, dinghiesScorpionCollectionHAL, dinghy1234HAL, dinghy2726HAL, dinghy6745HAL, dinghy826HAL,
	dinghySchemaJSON, dinghySchemaALPS, 
		
	racesCollectionHAL, 
	raceScorpion_AHAL, raceScorpion_ADinghyClassHAL, raceScorpion_ASignedUpHAL, 
	raceGraduate_AHAL, raceGraduate_ADinghyClassHAL, raceGraduate_ASignedUpHAL,
	raceHandicapAHAL,
	raceSchemaJSON, raceSchemaALPS,
	
	entriesHAL, entriesScorpionAHAL, entryChrisMarshallDinghy1234HAL, entriesCometAHAL, entriesHandicapAHAL,

	competitorsCollection, competitorChrisMarshall, competitorSarahPascal, competitorJillMyer, competitorLouScrew, 
	competitorOwainDavies, competitorLiuBao, 

	dinghyClasses, dinghyClassesByNameAsc, dinghyClassScorpion, dinghyClassGraduate, dinghyClassComet,

	dinghies, dinghiesScorpion, dinghy1234, dinghy2726, dinghy6745, dinghy2928, dinghy826,

	races, raceScorpionA, raceGraduateA, raceCometA, raceHandicapA,

	entriesScorpionA, entriesGraduateA, entriesCometA, entriesHandicapA, entryChrisMarshallScorpionA1234
}