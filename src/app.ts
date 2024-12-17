const apiKey = '4451b680-87bd-4874-94b7-1d84b9b34321';

const wait = (t: number | undefined) => new Promise((resolve, reject) => setTimeout(resolve, t))

type teamType = {
    id: number;
    conference: string;
    division: string;
    city: string;
    name: string;
    full_name: string;
    abbreviation: string;
}

export async function getTeams() {
    try {
        const resp = await fetch('https://api.balldontlie.io/v1/teams', {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!resp.ok) {
            throw new Error(`HTTP error occurred. Status: ${resp.status}`);
        }
        return await resp.json();
    } catch (error) {
        console.error('Error fetching data: ', error);
        throw error;
    }
}

export async function getPlayers(teamId: number, cursor: number | undefined = undefined) {
    try {
        let url = `https://api.balldontlie.io/v1/players?per_page=100&team_ids[]=${teamId}`;
        if (cursor) {
            url = `${url}&cursor=${cursor}`;
        }
        const resp = await fetch(url, {
            headers: {
                'Authorization': `${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!resp.ok) {
            throw new Error(`HTTP error occurred. Status: ${resp.status}`);
        }
        return await resp.json();
    } catch (error) {
        console.error('Error fetching data: ', error);
        throw error;
    }
}

export async function collateData() {
    const teams:teamType[] = [];
    const teamData = await getTeams();
    console.log('Retrieving all teams + all player data, process can take some time due to rate limiting by API');
    for (const team of teamData.data) {
        if (team?.conference && team?.division && team?.city) {
            teams.push(team);
        }
    }    

    const players = [];
    for (const team of teams) {
        const teamId = team.id;
        let cursor = 0;
        while (cursor !== undefined) {
            const currentSetOfPlayers = await getPlayers(teamId, cursor);
            for (const player of currentSetOfPlayers.data) {
                players.push(player);
            }
            cursor = currentSetOfPlayers.meta.next_cursor;
            await wait(2001); // free tier has us rate limited
        }
    }

    const playerMapData = new Map();
    for (const player of players) {
    const draftRound = player.draft_round;
    const team = player.team.full_name;

    // we have this team saved already
    if (playerMapData.has(team)) {
        let draftRoundText = 'null';
        const currentData = playerMapData.get(team);
        if (draftRound === 1) {
            currentData[1] = currentData[1] + 1;
        } else if (draftRound === 2) {
            currentData[2] = currentData[2] + 1;
        } else {
            currentData['null'] = currentData['null'] + 1;
        }
        playerMapData.set(team, currentData);
    } else { // first time seeing this team
        let draftRoundText = 'null';
        let data = {};
        if (draftRound === 1) {
            draftRoundText = '1';
            data = { '1': 1, '2': 0, 'null': 0 }
        } else if (draftRound === 2) {
            draftRoundText = '2';
            data = { '1': 0, '2': 1, 'null': 0 }
        } else {
            draftRoundText = 'null';
            data = { '1': 0, '2': 0, 'null': 1 }
        }
        playerMapData.set(team, data);
    }
    }
    return playerMapData;
}

export function outputData(data: Map<any, any>) {
    const testVal: { team: string; value: string; }[] = [];
    function outputMap(value: string, key: string) {
        testVal.push({ 'team': key, value: JSON.stringify(value)});
        console.log(`Team Name: ${key}`);
        console.log(`Draft Rounds: ${JSON.stringify(value)}`);
        console.log("\n");
    }
    data.forEach(outputMap);
    return testVal;
}

async function main() {
    const playerMap = await collateData();
    outputData(playerMap);
}

if (!process.env.BUILD_ENV) {
    main();
}