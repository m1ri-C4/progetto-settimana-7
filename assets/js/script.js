
const search = document.querySelector('#search');
const form = document.querySelector('form');
const favourite = document.querySelector('#favourite');
const teams = document.querySelector('#teams');
const events = document.querySelector('#events');
const emptyFavourites = document.querySelector('#emptyFavourites');
const emptyTeams = document.querySelector('#emptyTeams');
const loading = document.querySelector('#loading');
const errorMessage = document.querySelector('#errorMessage');



// CLASSE SQUADRE
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

    // mostra il caricamento e nasconde eventuali errori precedenti
    loading.classList.remove('d-none');
    errorMessage.classList.add('d-none');
    errorMessage.textContent = '';

    try {
        //attende sia la risposta dell'API sia il caricamento e vengono avviate  contemporaneamente 
        const [results] = await Promise.all([
            searchTeam(myTeam),

            new Promise((resolve) => {
                setTimeout(resolve, 400);
            })
        ]);

        // Se l'API non restituisce squadre, mostra un messaggio e interrompe la funzione
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
        teams.replaceChildren();
        events.replaceChildren();

        errorMessage.textContent = error.message;
        errorMessage.classList.remove('d-none');
    } finally {
        loading.classList.add('d-none');
    }

});

// RIMUOVI LE CARD SE CANCELLI LA RICERCA
search.addEventListener('input', () => {
    if (search.value.trim() === '') {
        teams.replaceChildren();
        events.replaceChildren();
        emptyTeams.classList.remove('d-none');
    }
});

// RENDER DELLE CARD CERCATE
function renderTeams(footballTeams) {

    // Elimina le card precedenti per evitare duplicati 
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
            return favourite.id === team.id; //some() verifica gli id 
        });

        if (alreadyAdded) {
            favouriteButton.textContent = '✓ Aggiunto ai preferiti';
            favouriteButton.classList.replace(
                'btn-outline-warning',
                'btn-secondary'
            );
            favouriteButton.disabled = true;
        }

        // CLICK SUL BOTTONE PREFERITI
        favouriteButton.addEventListener('click', (e) => {
            e.stopPropagation();

            //controlla di nuovo che non sia stata aggiunta con some()
            const alreadyAdded = favouriteTeams.some((favourite) => {
                return favourite.id === team.id;
            });

            if (alreadyAdded) return;

            favouriteTeams.push(team);

            favouriteButton.textContent = '✓ Aggiunto ai preferiti';

            favouriteButton.classList.replace(
                'btn-outline-warning',
                'btn-secondary'
            );

            favouriteButton.disabled = true;

            saveTeams();
            renderFavourites();
        });

        // CLICK SULLA CARD
        card.addEventListener('click', async () => {
            try {
                // recupera contemporaneamente prossimi eventi e ultimi risultati tramite id
                const [nextEvents, lastEvents] = await Promise.all([
                    getNextEvents(team.id),
                    getLastEvents(team.id)
                ]);

                renderEvents(nextEvents, lastEvents, team.name);

            } catch (error) {
                console.error(error.message);
            }
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

    // svuota il contenitore prima di ricreare le card aggiornate
    favourite.replaceChildren();

    //se non ci sono preferiti ritorna il messaggio iniziale
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

            // findIndex() cerca la posizione della squadra nell'array
            const index = favouriteTeams.findIndex((favourite) => {
                return favourite.id === team.id;
            });

            // splice() elimina un elemento dalla posizione individuata.
            if (index !== -1) {
                favouriteTeams.splice(index, 1);
            }

            saveTeams();
            renderFavourites();

            // aggiorna anche il pulsante nella ricerca
            const myTeam = search.value.trim();

            if (myTeam) {
                // esegue nuovamente la ricerca per aggiornare lo stato del pulsante
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


//RENDER EVENTI 
function renderEvents(nextEvents, lastEvents, teamName) {

    events.replaceChildren();

    // CARD PRINCIPALE
    const card = document.createElement('div');
    card.classList.add(
        'card',
        'shadow-sm',
        'border-0',
        'p-4',
        'w-100'
    );

    // NOME DELLA SQUADRA
    const title = document.createElement('h3');
    title.classList.add('fw-bold', 'mb-4', 'team-title');
    title.textContent = teamName;

    // RIGA BOOTSTRAP
    const row = document.createElement('div');
    row.classList.add('row', 'g-4');

    // COLONNA PROSSIMI EVENTI
    const nextCol = document.createElement('div');
    nextCol.classList.add('col-12', 'col-md-6');

    const nextTitle = document.createElement('h4');
    nextTitle.classList.add('fw-bold', 'event-heading');
    nextTitle.textContent = 'Prossimi eventi';

    nextCol.append(nextTitle);
    
    // se l'array è vuoto, mostra un messaggio al posto delle partite.
    if (nextEvents.length === 0) {
        const message = document.createElement('p');
        message.classList.add('fst-italic', 'text-secondary', 'mt-4');
        message.textContent = 'Nessun evento in programma';

        nextCol.append(message);
    } else {
        // crea un elemento HTML per ogni partita 
        nextEvents.forEach((event) => {

            const item = document.createElement('div');
            item.classList.add('event-item', 'py-3');

            const date = document.createElement('p');
            date.classList.add('text-secondary', 'mb-1');
            date.textContent = formatDate(event.dateEvent);

            const match = document.createElement('p');
            match.classList.add('fw-semibold', 'mb-0');
            match.textContent =
                `${event.strHomeTeam} vs ${event.strAwayTeam}`;

            item.append(date, match);
            nextCol.append(item);
        });
    }

    // COLONNA ULTIMI RISULTATI
    const lastCol = document.createElement('div');
    lastCol.classList.add('col-12', 'col-md-6');

    const lastTitle = document.createElement('h4');
    lastTitle.classList.add('fw-bold', 'event-heading');
    lastTitle.textContent = 'Ultimi risultati';

    lastCol.append(lastTitle);

    // gestisce il caso in cui l'API non restituisca risultati
    if (lastEvents.length === 0) {
        const message = document.createElement('p');
        message.classList.add('fst-italic', 'text-secondary', 'mt-4');
        message.textContent = 'Nessun risultato disponibile';

        lastCol.append(message);
    } else {
        // crea un elemento per ogni partita 
        lastEvents.forEach((event) => {

            const item = document.createElement('div');
            item.classList.add('event-item', 'py-3');

            const date = document.createElement('p');
            date.classList.add('text-secondary', 'mb-1');
            date.textContent = formatDate(event.dateEvent);

            const match = document.createElement('div');
            match.classList.add(
                'd-flex',
                'align-items-center',
                'gap-3',
                'flex-wrap'
            );

            const teamsName = document.createElement('span');
            teamsName.classList.add('fw-semibold');
            teamsName.textContent =
                `${event.strHomeTeam} vs ${event.strAwayTeam}`;

            const score = document.createElement('span');
            score.classList.add('badge', 'bg-success', 'fs-6');

            score.textContent =
                `${event.intHomeScore ?? '-'} – ${event.intAwayScore ?? '-'}`;  //?? '-' evita di visualizzare null o undefined

            match.append(teamsName, score);
            item.append(date, match);
            lastCol.append(item);
        });
    }

    // COMPOSIZIONE FINALE
    row.append(nextCol, lastCol);
    card.append(title, row);
    events.append(card);
}

// FORMATTAZIONE DATA
function formatDate(dateString) {
    if (!dateString) return 'Data non disponibile';

    // Destructuring
    const [year, month, day] = dateString.split('-');
    //formato italiano 
    return `${day}/${month}/${year}`;
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

// PROSSIMI EVENTI
async function getNextEvents(teamId) {
    // utilizza l'id della squadra per recuperare le prossime partite
    const url = `https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=${teamId}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Errore nel recupero dei prossimi eventi');
    }

    // json() converte il corpo della risposta in dati JS
    const data = await response.json();
    return data.events ?? [];
}

// ULTIMI RISULTATI
async function getLastEvents(teamId) {
    // recupera le ultime partite disputate dalla squadra selezionata
    const url = `https://www.thesportsdb.com/api/v1/json/123/eventslast.php?id=${teamId}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Errore nel recupero degli ultimi risultati');
    }

    const data = await response.json();
    return data.results ?? [];
}

// MOSTRA I PREFERITI SALVATI ALL'AVVIO
renderFavourites();
