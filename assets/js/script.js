const search = document.querySelector('#search');
const form = document.querySelector('form');
const favourite = document.querySelector('#favourite');
const teams = document.querySelector('#teams');
const events = document.querySelector('#events');

class FootballTeams {
    constructor(data) {
        this.id = data.idTeam;
        this.name = data.strTeam;
        this.logo = data.strBadge;
        this.league = data.strLeague ?? "–";
        this.country = data.strCountry ?? "–";
        this.sport = data.strSport;
    }
}

const team = loadTeams();

function saveTeams() {
    localStorage.setItem('team', JSON.stringify(team));
}

function loadTeams() {
    const team = JSON.parse(localStorage.getItem('team') ?? '[]');

    return team.map((team) => {
    });
}


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const myTeam = search.value.trim();
    if (!myTeam) return;

    try {
        const results = await searchTeam(myTeam);

        if (!results || results.length === 0) {
            console.log("Nessuna squadra trovata");
            return;
        }

        const footballTeams = results.map((data) => {
            return new FootballTeams(data);
        }); console.log(footballTeams);
    } catch (error) {
        console.error(error.message);
    }
});


async function searchTeam(teamName) {
    const url = `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${teamName}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Errore nella richiesta");
    }

    const data = await response.json();
    return data.teams;
}