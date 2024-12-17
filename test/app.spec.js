const { assert } = require('chai');
const { getTeams, getPlayers, outputData } = require('../dist/app');

describe('getTeams Tests', () => {
  it('should get teams', async () => {
    const result = await getTeams();
    assert.deepEqual(result.data[0], {
      id: 1,
      conference: 'East',
      division: 'Southeast',
      city: 'Atlanta',
      name: 'Hawks',
      full_name: 'Atlanta Hawks',
      abbreviation: 'ATL',
    });
  });
});

describe('getPlayers Tests', () => {
  it('should get players', async () => {
    const result = await getPlayers(1, undefined);
    assert.deepEqual(result.data[0], {
      id: 2,
      first_name: 'Jaylen',
      last_name: 'Adams',
      position: 'G',
      height: '6-0',
      weight: '225',
      jersey_number: '10',
      college: 'St. Bonaventure',
      country: 'USA',
      draft_year: null,
      draft_round: null,
      draft_number: null,
      team: {
        id: 1,
        conference: 'East',
        division: 'Southeast',
        city: 'Atlanta',
        name: 'Hawks',
        full_name: 'Atlanta Hawks',
        abbreviation: 'ATL',
      },
    });
  });
});

describe('outputData Tests', () => {
  it('should outputData', async () => {
    const myMap = new Map();
    myMap.set('Golden State Warriors', { 1: 13, 2: 7, null: 5 });
    const result = outputData(myMap);
    assert(result[0].team, 'Golden State Warriors');
    assert(result[0].value, { 1: 13, 2: 7, null: 5 });
  });
});
