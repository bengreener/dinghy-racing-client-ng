const rootURL = 'http://localhost:8081/dinghyracing/api';

const emptyCollectionHAL = {'_embedded':{'dinghies':[]},'_links':{'self':null}};

const competitorsCollectionHAL = {'_embedded':{'competitors':[{'name':'Chris Marshall','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors/8'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/competitors/8'}}},{'name':'Sarah Pascal','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors/9'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/competitors/9'}}}]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/competitors'}},'page':{'size':20,'totalElements':2,'totalPages':1,'number':0}};
const competitorChrisMarshallHAL = {'name':'Chris Marshall','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors/8'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/competitors/8'}}};
const competitorSarahPascalHAL = {'name':'Sarah Pascal','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/competitors/9'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/competitors/9'}}};

const dinghyClassCollectionHAL = { '_embedded' : { 'dinghyClasses' : [ { 'name' : 'Scorpion', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' } } }, { 'name' : 'Graduate', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' } } } ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses' } }, 'page' : { 'size' : 20, 'totalElements' : 2, 'totalPages' : 1, 'number' : 0 } };
const dinghyClassScorpionHAL = { 'name' : 'Scorpion', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' } } };
const dinghyClassGraduateHAL = { 'name' : 'Graduate', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' } } };
const dinghyClassNotSetHAL = {'name':'','_links':{'self':{'href':''},'dinghyClass':{'href':''}}};
const dinghyClassSchemaJSON = { 'title' : 'Dinghy class', 'properties' : { 'name' : { 'title' : 'Name', 'readOnly' : false, 'description' : 'identifier', 'type' : 'string' } }, 'definitions' : { }, 'type' : 'object', '$schema' : 'http://json-schema.org/draft-04/schema#' };
const dinghyClassSchemaALPS = { 'alps' : { 'version' : '1.0', 'descriptor' : [ { 'id' : 'dinghyClass-representation', 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses', 'descriptor' : [ { 'name' : 'name', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'identifier' } } ] }, { 'id' : 'create-dinghyClasses', 'name' : 'dinghyClasses', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation' }, { 'id' : 'get-dinghyClasses', 'name' : 'dinghyClasses', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'page', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The page to return.' } }, { 'name' : 'size', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The size of the page to return.' } }, { 'name' : 'sort', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The sorting criteria to use to calculate the content of the page.' } } ], 'rt' : '#dinghyClass-representation' }, { 'id' : 'delete-dinghyClass', 'name' : 'dinghyClass', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation' }, { 'id' : 'update-dinghyClass', 'name' : 'dinghyClass', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation' }, { 'id' : 'get-dinghyClass', 'name' : 'dinghyClass', 'type' : 'SAFE', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation' }, { 'id' : 'patch-dinghyClass', 'name' : 'dinghyClass', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghyClass-representation' } ] } };

const dinghiesCollectionHAL = { '_embedded' : { 'dinghies' : [ { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } }, { 'sailNumber' : '6745', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } }, { 'sailNumber' : '2726', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' } } } ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search' } }, 'page' : { 'size' : 20, 'totalElements' : 3, 'totalPages' : 1, 'number' : 0 } };
const dinghiesScorpionCollectionHAL = { '_embedded' : { 'dinghies' : [ { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } }, { 'sailNumber' : '6745', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } } ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/search/findByDinghyClass?dinghyClass=http://localhost:8081/dinghyracing/api/dinghyclasses/1&page=0&size=20' } }, 'page' : { 'size' : 20, 'totalElements' : 2, 'totalPages' : 1, 'number' : 0 } };
const dinghy1234HAL = { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } };
const dinghy2726HAL = { 'sailNumber' : '2726', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/6/dinghyClass' } } };
const dinghy6745HAL = { 'sailNumber' : '6745', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } };
const dinghySchemaJSON = { 'title' : 'Dinghy', 'properties' : { 'dinghyClass' : { 'title' : 'Dinghy class', 'readOnly' : false, 'description' : 'ToOne', 'type' : 'string', 'format' : 'uri' }, 'sailNumber' : { 'title' : 'Sail number', 'readOnly' : false, 'description' : 'identifier', 'type' : 'string' } }, 'definitions' : { }, 'type' : 'object', '$schema' : 'http://json-schema.org/draft-04/schema#' };
const dinghySchemaALPS = { 'alps' : { 'version' : '1.0', 'descriptor' : [ { 'id' : 'dinghy-representation', 'href' : 'http://localhost:8081/dinghyracing/api/profile/dinghies', 'descriptor' : [ { 'name' : 'sailNumber', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'identifier' } }, { 'name' : 'dinghyClass', 'type' : 'SAFE', 'doc' : { 'format' : 'TEXT', 'value' : 'ToOne' }, 'rt' : 'http://localhost:8081/dinghyracing/api/profile/dinghyclasses#dinghyClass-representation' } ] }, { 'id' : 'create-dinghies', 'name' : 'dinghies', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'get-dinghies', 'name' : 'dinghies', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'page', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The page to return.' } }, { 'name' : 'size', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The size of the page to return.' } }, { 'name' : 'sort', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The sorting criteria to use to calculate the content of the page.' } } ], 'rt' : '#dinghy-representation' }, { 'id' : 'delete-dinghy', 'name' : 'dinghy', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'update-dinghy', 'name' : 'dinghy', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'get-dinghy', 'name' : 'dinghy', 'type' : 'SAFE', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'id' : 'patch-dinghy', 'name' : 'dinghy', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#dinghy-representation' }, { 'name' : 'findByDinghyClass', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'dinghyclass', 'type' : 'SEMANTIC' } ] } ] } };

const racesCollectionHAL = {'_embedded':{'races':[
	{'name':'Scorpion A','plannedStartTime':'2021-10-14T14:10:00', 'actualStartTime': null, 'duration': 'PT45M', '_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races/4'},'race':{'href':'http://localhost:8081/dinghyracing/api/races/4'},'signedUp':{'href':'http://localhost:8081/dinghyracing/api/races/4/signedUp'},'dinghyClass':{'href':'http://localhost:8081/dinghyracing/api/races/4/dinghyClass'}}},
	{'name':'Graduate A','plannedStartTime':'2021-10-14T10:30:00', 'actualStartTime': null, 'duration': 'PT45M','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races/7'},'race':{'href':'http://localhost:8081/dinghyracing/api/races/7'},'signedUp':{'href':'http://localhost:8081/dinghyracing/api/races/7/signedUp'},'dinghyClass':{'href':'http://localhost:8081/dinghyracing/api/races/7/dinghyClass'}}},
	{'name': 'No Class', 'plannedStartTime':'2023-02-14T18:26:00', 'actualStartTime': null, 'duration': 'PT45M','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races/8'},'race':{'href':'http://localhost:8081/dinghyracing/api/races/8'},'signedUp':{'href':'http://localhost:8081/dinghyracing/api/races/8/signedUp'},'dinghyClass':{'href':'http://localhost:8081/dinghyracing/api/races/8/dinghyClass'}}}
]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/races'}},'page':{'size':20,'totalElements':3,'totalPages':1,'number':0}};
const raceScorpion_AHAL = { 'name' : 'Scorpion A', 'plannedStartTime' : '2021-10-14T14:10:00', 'actualStartTime': null, 'duration': 'PT45M', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4' }, 'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4' }, 'signedUp' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4/signedUp' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4/dinghyClass' } } };
const raceScorpion_ADinghyClassHAL = dinghyClassScorpionHAL;
const raceScorpion_ASignedUpHAL = { '_embedded' : { 'dinghies' : [ { 'sailNumber' : '1234', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/2/dinghyClass' } } }, { 'sailNumber' : '6745', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghies/3/dinghyClass' } } } ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/4/signedUp' } } };

const raceGraduate_AHAL = { 'name' : 'Graduate A', 'plannedStartTime' : '2021-10-14T10:30:00', 'actualStartTime': null, 'duration': 'PT45M', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7' }, 'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7' }, 'signedUp' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7/signedUp' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7/dinghyClass' } } };
const raceGraduate_ADinghyClassHAL = { 'name' : 'Graduate', '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' }, 'dinghyClass' : { 'href' : 'http://localhost:8081/dinghyracing/api/dinghyclasses/5' } } };
const raceGraduate_ASignedUpHAL = { '_embedded' : { 'dinghies' : [ ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/races/7/signedUp' } } };
const raceNoClassHAL = {'name': 'No Class', 'plannedStartTime':'2023-02-14T18:26:00', 'actualStartTime': null, 'duration': 'PT45M','_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/races/8'},'race':{'href':'http://localhost:8081/dinghyracing/api/races/8'},'signedUp':{'href':'http://localhost:8081/dinghyracing/api/races/8/signedUp'},'dinghyClass':{'href':'http://localhost:8081/dinghyracing/api/races/8/dinghyClass'}}};

const raceSchemaJSON = { 'title' : 'Race', 'properties' : { 'duration' : { 'title' : 'Duration', 'readOnly' : false, 'type' : 'string', 'format' : 'date-time' }, 'signedUp' : { 'title' : 'Signed up', 'readOnly' : false, 'description' : 'ToMany', 'type' : 'string', 'format' : 'uri' }, 'dinghyClass' : { 'title' : 'Dinghy class', 'readOnly' : false, 'description' : 'ToOne', 'type' : 'string', 'format' : 'uri' }, 'actualStartTime' : { 'title' : 'Actual start time', 'readOnly' : false, 'type' : 'string', 'format' : 'date-time' }, 'plannedStartTime' : { 'title' : 'Planned start time', 'readOnly' : false, 'type' : 'string', 'format' : 'date-time' }, 'name' : { 'title' : 'Name', 'readOnly' : false, 'description' : 'identifier', 'type' : 'string' } }, 'definitions' : { }, 'type' : 'object', '$schema' : 'http://json-schema.org/draft-04/schema#' };
const raceSchemaALPS = { 'alps' : { 'version' : '1.0', 'descriptor' : [ { 'id' : 'race-representation', 'href' : 'http://localhost:8081/dinghyracing/api/profile/races', 'descriptor' : [ { 'name' : 'name', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'identifier' } }, { 'name' : 'plannedStartTime', 'type' : 'SEMANTIC' }, { 'name' : 'actualStartTime', 'type' : 'SEMANTIC' }, { 'name' : 'duration', 'type' : 'SEMANTIC' }, { 'name' : 'dinghyClass', 'type' : 'SAFE', 'doc' : { 'format' : 'TEXT', 'value' : 'ToOne' }, 'rt' : 'http://localhost:8081/dinghyracing/api/profile/dinghyClasses#dinghyClass-representation' }, { 'name' : 'signedUp', 'type' : 'SAFE', 'doc' : { 'format' : 'TEXT', 'value' : 'ToMany' }, 'rt' : 'http://localhost:8081/dinghyracing/api/profile/entries#entry-representation' } ] }, { 'id' : 'create-races', 'name' : 'races', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'get-races', 'name' : 'races', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'page', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The page to return.' } }, { 'name' : 'size', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The size of the page to return.' } }, { 'name' : 'sort', 'type' : 'SEMANTIC', 'doc' : { 'format' : 'TEXT', 'value' : 'The sorting criteria to use to calculate the content of the page.' } } ], 'rt' : '#race-representation' }, { 'id' : 'get-race', 'name' : 'race', 'type' : 'SAFE', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'patch-race', 'name' : 'race', 'type' : 'UNSAFE', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'delete-race', 'name' : 'race', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'id' : 'update-race', 'name' : 'race', 'type' : 'IDEMPOTENT', 'descriptor' : [ ], 'rt' : '#race-representation' }, { 'name' : 'findByNameAndPlannedStartTime', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'name', 'type' : 'SEMANTIC' }, { 'name' : 'time', 'type' : 'SEMANTIC' } ] }, { 'name' : 'findByPlannedStartTimeGreaterThanEqual', 'type' : 'SAFE', 'descriptor' : [ { 'name' : 'time', 'type' : 'SEMANTIC' } ] } ] } };

const entriesHAL = {'_embedded':{'entries':[{'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/entries/10'},'entry':{'href':'http://localhost:8081/dinghyracing/api/entries/10'},'dinghy':{'href':'http://localhost:8081/dinghyracing/api/entries/10/dinghy'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/entries/10/competitor'}}},{'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/entries/11'},'entry':{'href':'http://localhost:8081/dinghyracing/api/entries/11'},'dinghy':{'href':'http://localhost:8081/dinghyracing/api/entries/11/dinghy'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/entries/11/competitor'}}}]},'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/entries'},'profile':{'href':'http://localhost:8081/dinghyracing/api/profile/entries'}},'page':{'size':20,'totalElements':2,'totalPages':1,'number':0}};
const entriesScorpionAHAL = { '_embedded' : { 'entries' : [ { '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10' }, 'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10' }, 'competitor' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10/competitor' }, 'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10/race' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/10/dinghy' } } }, { '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11' }, 'entry' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11' }, 'competitor' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11/competitor' }, 'race' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11/race' }, 'dinghy' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/11/dinghy' } } } ] }, '_links' : { 'self' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries' }, 'profile' : { 'href' : 'http://localhost:8081/dinghyracing/api/profile/entries' }, 'search' : { 'href' : 'http://localhost:8081/dinghyracing/api/entries/search' } }, 'page' : { 'size' : 20, 'totalElements' : 2, 'totalPages' : 1, 'number' : 0 } };
const entryChrisMarshallDinghy1234HAL = {'_links':{'self':{'href':'http://localhost:8081/dinghyracing/api/entries/10'},'entry':{'href':'http://localhost:8081/dinghyracing/api/entries/10'},'dinghy':{'href':'http://localhost:8081/dinghyracing/api/entries/10/dinghy'},'competitor':{'href':'http://localhost:8081/dinghyracing/api/entries/10/competitor'}}}; 

const competitorsCollection = [{'name':'Chris Marshall','url':'http://localhost:8081/dinghyracing/api/competitors/8'},{'name':'Sarah Pascal','url':'http://localhost:8081/dinghyracing/api/competitors/9'}];
const competitorChrisMarshall = {'name':'Chris Marshall','url':'http://localhost:8081/dinghyracing/api/competitors/8'};
const competitorSarahPascal = {'name':'Sarah Pascal','url':'http://localhost:8081/dinghyracing/api/competitors/9'};

const dinghyClasses = [{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},{'name':'Graduate','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/5'}];
const dinghyClassesByNameAsc = [{'name':'Graduate','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/5'}, {'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'}];
const dinghyClassScorpion = { 'name' : 'Scorpion', 'url': 'http://localhost:8081/dinghyracing/api/dinghyclasses/1' };
const dinghyClassGraduate = {'name':'Graduate','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/5'};

const dinghies = [{'sailNumber':'1234','dinghyClass':dinghyClassScorpion,'url':'http://localhost:8081/dinghyracing/api/dinghies/2'},{'sailNumber':'6745','dinghyClass': dinghyClassScorpion,'url':'http://localhost:8081/dinghyracing/api/dinghies/3'},{'sailNumber':'2726','dinghyClass': dinghyClassGraduate,'url':'http://localhost:8081/dinghyracing/api/dinghies/6'}];
const dinghiesScorpion = [{'sailNumber':'1234','dinghyClass':dinghyClassScorpion,'url':'http://localhost:8081/dinghyracing/api/dinghies/2'},{'sailNumber':'6745','dinghyClass': dinghyClassScorpion,'url':'http://localhost:8081/dinghyracing/api/dinghies/3'}];
const dinghy1234 = {'sailNumber':'1234','dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},'url':'http://localhost:8081/dinghyracing/api/dinghies/2'};
const dinghy2726 = {'sailNumber':'2726','dinghyClass': dinghyClassGraduate,'url':'http://localhost:8081/dinghyracing/api/dinghies/6'};
const dinghy6745 = {'sailNumber':'6745','dinghyClass':{'name':'Scorpion','url':'http://localhost:8081/dinghyracing/api/dinghyclasses/1'},'url':'http://localhost:8081/dinghyracing/api/dinghies/3'};

// const races = [{'name':'Scorpion A','time': new Date('2021-10-14T14:10:00'),'dinghyClass':dinghyClassScorpion,'url':'http://localhost:8081/dinghyracing/api/races/4'},{'name':'Graduate A','time': new Date('2021-10-14T10:30:00'),'dinghyClass':dinghyClassGraduate,'url':'http://localhost:8081/dinghyracing/api/races/7'},{'name':'No Class','time': new Date('2023-02-14T18:26:00'),'dinghyClass':null,'url':'http://localhost:8081/dinghyracing/api/races/8'}];
const raceScorpionA = { 'name': 'Scorpion A', 'time': new Date('2021-10-14T14:10:00Z'), 'dinghyClass': dinghyClassScorpion, 'duration': 2700000, 'url': 'http://localhost:8081/dinghyracing/api/races/4' };
const raceGraduateA = { 'name': 'Graduate A', 'time' : new Date('2021-10-14T10:30:00Z'), 'dinghyClass': dinghyClassGraduate, 'duration': 2700000, 'url': 'http://localhost:8081/dinghyracing/api/races/7' };
const raceNoClass = { 'name': 'No Class', 'time': new Date('2023-02-14T18:26:00Z'), 'dinghyClass': null, 'duration': 2700000, 'url': 'http://localhost:8081/dinghyracing/api/races/8' };
const races = [raceScorpionA, raceGraduateA, raceNoClass];

const entriesScorpionA = [{'competitor': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234,'url': 'http://localhost:8081/dinghyracing/api/entries/10'},{'competitor': competitorSarahPascal,'race': raceScorpionA,'dinghy': dinghy6745,'url': 'http://localhost:8081/dinghyracing/api/entries/11'}];
const entryChrisMarshallScorpionA1234 = {'competitor': competitorChrisMarshall,'race': raceScorpionA,'dinghy': dinghy1234,'url': 'http://localhost:8081/dinghyracing/api/entries/10'};
export {
	rootURL,
	
	emptyCollectionHAL, 

	competitorsCollectionHAL, competitorChrisMarshallHAL, competitorSarahPascalHAL,
	
	dinghyClassCollectionHAL, dinghyClassScorpionHAL, dinghyClassGraduateHAL, dinghyClassNotSetHAL, 
	dinghyClassSchemaJSON, dinghyClassSchemaALPS,
	
	dinghiesCollectionHAL, dinghiesScorpionCollectionHAL, dinghy1234HAL, dinghy2726HAL, dinghy6745HAL, 
	dinghySchemaJSON, dinghySchemaALPS, 
		
	racesCollectionHAL, 
	raceScorpion_AHAL, raceScorpion_ADinghyClassHAL, raceScorpion_ASignedUpHAL, 
	raceGraduate_AHAL, raceGraduate_ADinghyClassHAL, raceGraduate_ASignedUpHAL,
	raceNoClassHAL,
	raceSchemaJSON, raceSchemaALPS,
	
	entriesHAL, entriesScorpionAHAL, entryChrisMarshallDinghy1234HAL,

	competitorsCollection, competitorChrisMarshall, competitorSarahPascal,

	dinghyClasses, dinghyClassesByNameAsc, dinghyClassScorpion, dinghyClassGraduate,

	dinghies, dinghiesScorpion, dinghy1234, dinghy2726, dinghy6745,

	races, raceScorpionA, raceGraduateA, raceNoClass,

	entriesScorpionA, entryChrisMarshallScorpionA1234
}