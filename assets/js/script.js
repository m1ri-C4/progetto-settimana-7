
const search = document.querySelector('#search');
const form = document.querySelector('form');
const favourite = document.querySelector('#favourite');
const teams = document.querySelector('#teams');
const events = document.querySelector('#events');
const emptyFavourites = document.querySelector('#emptyFavourites');
const emptyTeams = document.querySelector('#emptyTeams');

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

// LOCAL STORAGE
const favouriteTeams = loadTeams();

function saveTeams() {
    localStorage.setItem('team', JSON.stringify(favouriteTeams));
}

function loadTeams() {
    return JSON.parse(localStorage.getItem('team') ?? '[]');
}

// RICERCA SQUADRE
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const myTeam = search.value.trim();
    if (!myTeam) return;

    try {
        const results = await searchTeam(myTeam);

        if (!results || results.length === 0) {
            teams.replaceChildren();
            emptyTeams.classList.remove('d-none');
            emptyTeams.textContent = 'Nessuna squadra trovata';
            return;
        }

        const footballTeams = results.map((data) => {
            return new FootballTeams(data);
        });

        renderTeams(footballTeams);

    } catch (error) {
        console.error(error.message);
    }
});

// RIMUOVI LE CARD SE CANCELLI LA RICERCA
search.addEventListener('input', () => {
    if (search.value.trim() === '') {
        teams.replaceChildren();
        emptyTeams.classList.remove('d-none');
    }
});

// RENDER DELLE CARD CERCATE
function renderTeams(footballTeams) {

    teams.replaceChildren();
    emptyTeams.classList.add('d-none');

    footballTeams.forEach((team) => {

        // COLONNA BOOTSTRAP
        const col = document.createElement('div');
        col.classList.add('col-12');

        // CARD
        const card = document.createElement('div');
        card.classList.add(
            'card',
            'shadow-sm',
            'border-0',
            'p-3',
            'h-100',
            'text-center'
        );

        card.style.cursor = 'pointer';

        // LOGO
        const img = document.createElement('img');
        img.src = team.logo;
        img.alt = team.name;
        img.classList.add('team-logo', 'mx-auto', 'mb-3');

        // NOME
        const title = document.createElement('h5');
        title.classList.add('fw-bold');
        title.textContent = team.name;

        // CAMPIONATO
        const league = document.createElement('p');
        league.classList.add('text-secondary', 'mb-1');
        league.textContent = team.league;

        // PAESE
        const country = document.createElement('p');
        country.classList.add('text-secondary', 'mb-1');
        country.textContent = team.country;

        // SPORT
        const sport = document.createElement('p');
        sport.classList.add('text-secondary', 'mb-3');
        sport.textContent = team.sport;

        // BOTTONE PREFERITI
        const favouriteButton = document.createElement('button');
        favouriteButton.classList.add(
            'btn',
            'btn-outline-warning',
            'mt-auto'
        );

        favouriteButton.textContent = '⭐ Aggiungi ai preferiti';

        // CONTROLLO SE LA SQUADRA È GIÀ NEI PREFERITI
        const alreadyAdded = favouriteTeams.some((favourite) => {
            return favourite.id === team.id;
        });

        if (alreadyAdded) {
            favouriteButton.textContent = 'Aggiunto ai preferiti';
            favouriteButton.classList.replace(
                'btn-outline-warning',
                'btn-secondary'
            );
            favouriteButton.disabled = true;
        }

        // CLICK SUL BOTTONE PREFERITI
        favouriteButton.addEventListener('click', (e) => {
            e.stopPropagation();

            const alreadyAdded = favouriteTeams.some((favourite) => {
                return favourite.id === team.id;
            });

            if (alreadyAdded) return;

            favouriteTeams.push(team);

            favouriteButton.textContent = 'Aggiunto ai preferiti';

            favouriteButton.classList.replace(
                'btn-outline-warning',
                'btn-secondary'
            );

            favouriteButton.disabled = true;

            saveTeams();
            renderFavourites();
        });

        // CLICK SULLA CARD
        card.addEventListener('click', () => {
            console.log('Squadra selezionata:', team.name);
            console.log('ID squadra:', team.id);

            // Qui aggiungeremo la funzione per gli eventi
        });

        // COMPOSIZIONE
        card.append(
            img,
            title,
            league,
            country,
            sport,
            favouriteButton
        );

        col.append(card);
        teams.append(col);
    });
}

// RENDER DEI PREFERITI
function renderFavourites() {

    favourite.replaceChildren();

    if (favouriteTeams.length === 0) {
        emptyFavourites.classList.remove('d-none');
        return;
    }

    emptyFavourites.classList.add('d-none');

    favouriteTeams.forEach((team) => {

        // COLONNA BOOTSTRAP
        const col = document.createElement('div');
        col.classList.add('col-12', 'col-md-6', 'col-lg-4');

        // CARD
        const card = document.createElement('div');
        card.classList.add(
            'card',
            'shadow-sm',
            'border-0',
            'p-3',
            'h-100',
            'text-center'
        );

        // LOGO
        const img = document.createElement('img');
        img.src = team.logo;
        img.alt = team.name;
        img.classList.add('team-logo', 'mx-auto', 'mb-3');

        // NOME
        const title = document.createElement('h5');
        title.classList.add('fw-bold');
        title.textContent = team.name;

        // CAMPIONATO
        const league = document.createElement('p');
        league.classList.add('text-secondary', 'mb-1');
        league.textContent = team.league;

        // PAESE
        const country = document.createElement('p');
        country.classList.add('text-secondary', 'mb-3');
        country.textContent = team.country;

        // PULSANTE RIMUOVI
        const removeButton = document.createElement('button');
        removeButton.classList.add(
            'btn',
            'btn-outline-danger',
            'mt-auto'
        );
        removeButton.textContent = '🗑 Rimuovi';

        removeButton.addEventListener('click', () => {

            const index = favouriteTeams.findIndex((favourite) => {
                return favourite.id === team.id;
            });

            if (index !== -1) {
                favouriteTeams.splice(index, 1);
            }

            saveTeams();
            renderFavourites();

            // Aggiorna anche il pulsante nella ricerca
            const myTeam = search.value.trim();

            if (myTeam) {
                searchTeam(myTeam)
                    .then((results) => {
                        if (results && results.length > 0) {
                            const footballTeams = results.map((data) => {
                                return new FootballTeams(data);
                            });

                            renderTeams(footballTeams);
                        }
                    })
                    .catch((error) => {
                        console.error(error.message);
                    });
            }
        });

        // COMPOSIZIONE
        card.append(img, title, league, country, removeButton);
        col.append(card);
        favourite.append(col);
    });
}

// FETCH API
async function searchTeam(teamName) {
    const url = `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${teamName}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Errore nella richiesta");
    }

    const data = await response.json();
    return data.teams;
}

// MOSTRA I PREFERITI SALVATI ALL'AVVIO
renderFavourites();
