import { it, describe } from 'mocha';
import { assert } from 'chai';
import filter from '../../../server/lib/filters';
import technos from '../../../rest/AIP/technologies';
describe('filter module for technologies', () => {
  it('should return a new array with merged values', () => {
    const filteredResults = filter( technos );

    assert.deepEqual(filteredResults, [
      {id:-15,
        name:'SAP',
        href:'AIP/technologies/-15+AIP/technologies/-20',
        glob:[
          {id:-15,
            name:'ABAP',
            href:'AIP/technologies/-15'
          },
          {id:-20,
            name:'SAP SQL',
            href:'AIP/technologies/-20'}
        ]},
      {id:0,
        name:'ALL TECHNOLOGIES',
        href:'AIP/technologies/0'
      },{id:-19,
        name:'ASP',
        href:'AIP/technologies/-19'
      },{id:138636,
        name:'ASP.NET',
        href:'AIP/technologies/138636'},
      {id:-23,name:'Business Object',href:'AIP/technologies/-23'},{id:1050571,name:'C/C++',href:'AIP/technologies/-2+AIP/technologies/-3+AIP/technologies/1050571',glob:[{id:-2,name:'C',href:'AIP/technologies/-2'},{id:-3,name:'C++',href:'AIP/technologies/-3'},{id:1050571,name:'C/C++',href:'AIP/technologies/1050571'}]},{id:138383,name:'C#',href:'AIP/technologies/138383'},{id:1008000,name:'RPG',href:'AIP/technologies/1012000+AIP/technologies/1011000+AIP/technologies/1009000+AIP/technologies/1008000',glob:[{id:1012000,name:'CL400',href:'AIP/technologies/1012000'},{id:1011000,name:'DDS400',href:'AIP/technologies/1011000'},{id:1009000,name:'RPG300',href:'AIP/technologies/1009000'},{id:1008000,name:'RPG400',href:'AIP/technologies/1008000'}]},{id:-4,name:'Cobol',href:'AIP/technologies/-4'},{id:-14,name:'DB2 Server',href:'AIP/technologies/-14'},{id:1015000,name:'EGL',href:'AIP/technologies/1015000'},{id:1007000,name:'Flex',href:'AIP/technologies/1007000'},{id:-10,name:'Forms',href:'AIP/technologies/-10'},{id:1006000,name:'Fortran',href:'AIP/technologies/1006000'},{id:1020000,name:'HTML5 JavaScript',href:'AIP/technologies/1020000+AIP/technologies/138663',glob:[{id:1020000,name:'HTML5',href:'AIP/technologies/1020000'},{id:138663,name:'JavaScript',href:'AIP/technologies/138663'}]},{id:140029,name:'JEE',href:'AIP/technologies/140029'},{id:-13,name:'SQL Server',href:'AIP/technologies/140998+AIP/technologies/-13',glob:[{id:140998,name:'Microsoft T-SQL',href:'AIP/technologies/140998'},{id:-13,name:'SQL Server',href:'AIP/technologies/-13'}]},{id:1050001,name:'Objective-C',href:'AIP/technologies/1050001'},{id:1017000,name:'PHP',href:'AIP/technologies/1017000'},{id:139287,name:'PL/SQL',href:'AIP/technologies/139287'},{id:1004000,name:'PLI',href:'AIP/technologies/1005000+AIP/technologies/1004000',glob:[{id:1005000,name:'PLC',href:'AIP/technologies/1005000'},{id:1004000,name:'PLI',href:'AIP/technologies/1004000'}]},{id:1600000,name:'PeopleSoft',href:'AIP/technologies/1600000'},{id:-8,name:'PowerBuilder',href:'AIP/technologies/-8'},{id:1021000,name:'Python',href:'AIP/technologies/1021000'},{id:1101000,name:'SQLAnalyzer',href:'AIP/technologies/1101000'},{id:1016000,name:'Shell',href:'AIP/technologies/1016000'},{id:1520000,name:'Siebel',href:'AIP/technologies/1520000'},{id:141001,name:'Sybase T-SQL',href:'AIP/technologies/141001'},{id:1018000,name:'TIBCO',href:'AIP/technologies/1018000'},{id:138385,name:'VB.NET',href:'AIP/technologies/138385'},{id:-9,name:'Visual Basic',href:'AIP/technologies/-9'}]);
  });
});