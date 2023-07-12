const rootURL = 'http://localhost:8081/dinghyracing/api';

const emptyCollectionHAL = {'_embedded':{'dinghies':[]},'_links':{'self':null}};

const competitorsCollectionHAL = {'_embedded':{'competitors':[{'name':'Chris Marshall','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors/8'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/competitors/8'}}},{'name':'Sarah Pascal','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors/9'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/competitors/9'}}}]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/competitors'}},'page':{'size':20,'totalElements':2,'totalPages':1,'number':0}};
const competitorChrisMarsahll = {'name':'Chris Marshall','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors/8'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/competitors/8'}}};
const competitorSarahPascal = {'name':'Sarah Pascal','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors/9'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/competitors/9'}}};

const dinghyClassCollectionHAL = { '_embedded' : { 'dinghyClasses' : [ { 'name' : 'Scorpion', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' } } }, { 'name' : 'Graduate', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' } } } ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses' } }, 'page' : { 'size' : 20, 'totalElements' : 2, 'totalPages' : 1, 'number' : 0 } };
const dinghyClassScorpionHAL = { 'name' : 'Scorpion', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' } } };
const dinghyClassGraduateHAL = { 'name' : 'Graduate', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' } } };
const dinghyClassNotSetHAL = {'name':'','_links':{'self':{'href':''},'dinghyClass':{'href':''}}};
const dinghyClassSchemaJSON = { 'title' : 'Dinghy class', 'properties' : { 'name' : { 'title' : 'Name', 'readOnly' : false, 'description' : 'identifier', 'type' : 'string' } }, 'definitions' : { }, 'type' : 'object', '$schema' : 'http://json-schema.org/draft-04/schema#' };
const dinghyClassSchemaALPS = { 'alps' : { 'version' : '1.0', 'descriptor' : [ { 'id' : 'dinghyClass-representation', 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses', 'descriptor' : [ { 'name' : 'name', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'identifier' } } ] }, { 'id' : 'create-dinghyClasses', 'name' : 'dinghyClasses', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation' }, { 'id' : 'get-dinghyClasses', 'name' : 'dinghyClasses', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'page', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The page to return.' } }, { 'name' : 'size', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The size of the page to return.' } }, { 'name' : 'sort', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The sorting criteria to use to calculate the content of the page.' } } ], 'rt' : '#dinghyClass-representation' }, { 'id' : 'delete-dinghyClass', 'name' : 'dinghyClass', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation' }, { 'id' : 'update-dinghyClass', 'name' : 'dinghyClass', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation' }, { 'id' : 'get-dinghyClass', 'name' : 'dinghyClass', 'type' : 'SAFE', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation' }, { 'id' : 'patch-dinghyClass', 'name' : 'dinghyClass', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation' } ] } };

const dinghiesCollectionHAL = { '_embedded' : { 'dinghies' : [ { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } }, { 'sailNumber' : '6745', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } }, { 'sailNumber' : '2726', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' } } } ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 20, 'totalElements' : 3, 'totalPages' : 1, 'number' : 0 } };
const dinghy1234HAL = { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } };
const dinghy2726HAL = { 'sailNumber' : '2726', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' } } };
const dinghy6745HAL = { 'sailNumber' : '6745', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } };
const dinghySchemaJSON = { 'title' : 'Dinghy', 'properties' : { 'dinghyClass' : { 'title' : 'Dinghy class', 'readOnly' : false, 'description' : 'ToOne', 'type' : 'string', 'format' : 'uri' }, 'sailNumber' : { 'title' : 'Sail number', 'readOnly' : false, 'description' : 'identifier', 'type' : 'string' } }, 'definitions' : { }, 'type' : 'object', '$schema' : 'http://json-schema.org/draft-04/schema#' };
const dinghySchemaALPS = { 'alps' : { 'version' : '1.0', 'descriptor' : [ { 'id' : 'dinghy-representation', 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies', 'descriptor' : [ { 'name' : 'sailNumber', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'identifier' } }, { 'name' : 'dinghyClass', 'type' : 'SAFE', 'doc' : { 'format' : 'TEXT', 'value' : 'ToOne' }, 'rt' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses#dinghyClass-representation' } ] }, { 'id' : 'create-dinghies', 'name' : 'dinghies', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'get-dinghies', 'name' : 'dinghies', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'page', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The page to return.' } }, { 'name' : 'size', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The size of the page to return.' } }, { 'name' : 'sort', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The sorting criteria to use to calculate the content of the page.' } } ], 'rt' : '#dinghy-representation' }, { 'id' : 'delete-dinghy', 'name' : 'dinghy', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'update-dinghy', 'name' : 'dinghy', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'get-dinghy', 'name' : 'dinghy', 'type' : 'SAFE', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'patch-dinghy', 'name' : 'dinghy', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'name' : 'findByDinghyClass', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'dinghyclass', 'type' : 'SEMANTIC' } ] } ] } };

const racesCollectionHAL = {'_embedded':{'races':[
	{'name':'Scorpion A','plannedStartTime':'2021-10-14T14:10:00','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races/4'},'race':{'href':'http://localhost:8081/dinghyracing/api/races/4'},'signedUp':{'href':'http://localhost:8081/dinghyracing/api/races/4/signedUp'},'dinghyClass':{'href':'http://localhost:8081/dinghyracing/api/races/4/dinghyClass'}}},
	{'name':'Graduate A','plannedStartTime':'2021-10-14T10:30:00','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races/7'},'race':{'href':'http://localhost:8081/dinghyracing/api/races/7'},'signedUp':{'href':'http://localhost:8081/dinghyracing/api/races/7/signedUp'},'dinghyClass':{'href':'http://localhost:8081/dinghyracing/api/races/7/dinghyClass'}}},
	{'name': 'No Class', 'plannedStartTime':'2023-02-14T18:26:00','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races/8'},'race':{'href':'http://localhost:8081/dinghyracing/api/races/8'},'signedUp':{'href':'http://localhost:8081/dinghyracing/api/races/8/signedUp'},'dinghyClass':{'href':'http://localhost:8081/dinghyracing/api/races/8/dinghyClass'}}}
]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':20,'totalElements':3,'totalPages':1,'number':0}};
const raceScorpion_AHAL = { 'name' : 'Scorpion A', 'plannedStartTime' : '2021-10-14T14:10:00', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4' }, 'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4' }, 'signedUp' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4/signedUp' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4/dinghyClass' } } };
const raceScorpion_ADinghyClassHAL = dinghyClassScorpionHAL;
const raceScorpion_ASignedUpHAL = { '_embedded' : { 'dinghies' : [ { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } }, { 'sailNumber' : '6745', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } } ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4/signedUp' } } };

const raceGraduate_AHAL = { 'name' : 'Graduate A', 'plannedStartTime' : '2021-10-14T10:30:00', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7' }, 'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7' }, 'signedUp' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7/signedUp' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7/dinghyClass' } } };
const raceGraduate_ADinghyClassHAL = { 'name' : 'Graduate', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' } } };
const raceGraduate_ASignedUpHAL = { '_embedded' : { 'dinghies' : [ ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7/signedUp' } } };

const raceSchemaJSON = { 'title' : 'Race', 'properties' : { 'signedUp' : { 'title' : 'Signed up', 'readOnly' : false, 'description' : 'ToMany', 'type' : 'string', 'format' : 'uri' }, 'dinghyClass' : { 'title' : 'Dinghy class', 'readOnly' : false, 'description' : 'ToOne', 'type' : 'string', 'format' : 'uri' }, 'plannedStartTime' : { 'title' : 'Planned start time', 'readOnly' : false, 'type' : 'string', 'format' : 'date-time' }, 'name' : { 'title' : 'Name', 'readOnly' : false, 'description' : 'identifier', 'type' : 'string' } }, 'definitions' : { }, 'type' : 'object', '$schema' : 'http://json-schema.org/draft-04/schema#' };
const raceSchemaALPS = { 'alps' : { 'version' : '1.0', 'descriptor' : [ { 'id' : 'race-representation', 'href' : 'http://localhost:8081/dinghyracing/api/profile/races', 'descriptor' : [ { 'name' : 'name', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'identifier' } }, { 'name' : 'plannedStartTime', 'type' : 'SEMANTIC' }, { 'name' : 'signedUp', 'type' : 'SAFE', 'doc' : { 'format' : 'TEXT', 'value' : 'ToMany' }, 'rt' : 'http://localhost:8081/dinghyracing/api/profile/dinghies#dinghy-representation' }, { 'name' : 'dinghyClass', 'type' : 'SAFE', 'doc' : { 'format' : 'TEXT', 'value' : 'ToOne' }, 'rt' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses#dinghyClass-representation' } ] }, { 'id' : 'create-races', 'name' : 'races', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'get-races', 'name' : 'races', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'page', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The page to return.' } }, { 'name' : 'size', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The size of the page to return.' } }, { 'name' : 'sort', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The sorting criteria to use to calculate the content of the page.' } } ], 'rt' : '#race-representation' }, { 'id' : 'delete-race', 'name' : 'race', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'update-race', 'name' : 'race', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'get-race', 'name' : 'race', 'type' : 'SAFE', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'patch-race', 'name' : 'race', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#race-representation' } ] } };

const dinghy1234 = {'sailNumber':'1234','dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'};

const dinghyClasses = [{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},{'name':'Graduate','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/5'}];
const dinghyClassesByNameAsc = [{'name':'Graduate','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/5'}, {'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'}];
const dinghyClassScorpion = { 'name' : 'Scorpion', 'url': 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' };
const dinghyClassGraduate = {'name':'Graduate','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/5'};

// const races = [{'name':'Scorpion A','time': new Date('2021-10-14T14:10:00'),'dinghyClass':dinghyClassScorpion,'url':'http://localhost:8081/dinghyracing/api/races/4'},{'name':'Graduate A','time': new Date('2021-10-14T10:30:00'),'dinghyClass':dinghyClassGraduate,'url':'http://localhost:8081/dinghyracing/api/races/7'},{'name':'No Class','time': new Date('2023-02-14T18:26:00'),'dinghyClass':null,'url':'http://localhost:8081/dinghyracing/api/races/8'}];
const raceScorpionA = { 'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00'), 'dinghyClass': dinghyClassScorpion, 'url': 'http://localhost:8081/dinghyracing/api/races/4' };
const raceGraduateA = { 'name': 'Graduate A', 'time' : new Date('2021-10-14T10:30:00'), 'dinghyClass': dinghyClassGraduate, 'url': 'http://localhost:8081/dinghyracing/api/races/7' };
const raceNoClass = { 'name': 'No Class', 'time': new Date('2023-02-14T18:26:00'), 'dinghyClass': null, 'url': 'http://localhost:8081/dinghyracing/api/races/8' };
const races = [raceScorpionA, raceGraduateA, raceNoClass];

export {
	rootURL,
	
	emptyCollectionHAL, 

	competitorsCollectionHAL, competitorChrisMarsahll, competitorSarahPascal,
	
	dinghyClassCollectionHAL, dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghyClassNotSetHAL, 
	dinghyClassSchemaJSON, dinghyClassSchemaALPS,
	
	dinghiesCollectionHAL, dinghy1234HAL, dinghy2726HAL, dinghy6745HAL, 
	dinghySchemaJSON, dinghySchemaALPS, 
		
	racesCollectionHAL, 
	raceScorpion_AHAL, raceScorpion_ADinghyClassHAL, raceScorpion_ASignedUpHAL, 
	raceGraduate_AHAL, raceGraduate_ADinghyClassHAL, raceGraduate_ASignedUpHAL,
	raceSchemaJSON, raceSchemaALPS,

	dinghyClasses, dinghyClassesByNameAsc, dinghyClassScorpion, dinghyClassGraduate,

	dinghy1234,

	races, raceScorpionA, raceGraduateA, raceNoClass
}