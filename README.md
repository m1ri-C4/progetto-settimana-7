
# 🏆 SportsHub

SportsHub è un'applicazione web responsive che permette di cercare squadre sportive, visualizzare le prossime partite e gli ultimi risultati e salvare le proprie squadre preferite.
Il progetto è stato realizzato utilizzando HTML, CSS, Bootstrap 5 e JavaScript, integrando le API pubbliche di TheSportsDB per recuperare informazioni sportive.

## 🛠️ Tecnologie utilizzate

- **HTML5:** struttura semantica della pagina.
- **CSS3:** personalizzazione grafica, colori, hover e transizioni.
- **Bootstrap 5:** layout responsive, card, pulsanti, badge e alert.
- **JavaScript ES6+:** gestione della logica, eventi, DOM e richieste asincrone.
- **TheSportsDB API:** recupero delle squadre e delle partite.
- **LocalStorage:** salvataggio permanente delle squadre preferite.

## 📁 Struttura del progetto

```text
SportsHub/
│
├── index.html
├── README.md
│
└── assets/
    ├── css/
    │   └── style.css
    │
    └── js/
        └── script.js
```

## ⚽ Funzionalità principali

### 1. Ricerca delle squadre

L'utente può inserire il nome di una squadra nel campo di ricerca e premere il pulsante "Cerca".
JavaScript intercetta l'invio del form attraverso un `addEventListener('submit')` e impedisce il ricaricamento della pagina utilizzando `preventDefault()`.
Il nome inserito viene recuperato tramite `.value.trim()`, eliminando eventuali spazi iniziali e finali.
La funzione `searchTeam()` effettua una richiesta alle API TheSportsDB e restituisce le squadre corrispondenti.
I risultati vengono trasformati in oggetti della classe `FootballTeams` e mostrati dinamicamente nella pagina.

Ogni card contiene:

- Logo della squadra.
- Nome.
- Campionato.
- Paese.
- Sport.
- Pulsante per aggiungere la squadra ai preferiti.

Se la ricerca non produce risultati, viene visualizzato il messaggio "Nessuna squadra trovata".

### 2. Gestione dei preferiti

L'utente può salvare le squadre utilizzando il pulsante "⭐ Aggiungi ai preferiti".
Prima dell'aggiunta, il metodo `some()` controlla che la squadra non sia già presente nell'array `favouriteTeams`, confrontando gli ID.
Se la squadra è già presente, il pulsante viene disabilitato e mostra "✓ Aggiunto ai preferiti".

Quando una squadra viene aggiunta:

1. `push()` inserisce l'oggetto nell'array.
2. `saveTeams()` aggiorna il LocalStorage.
3. `renderFavourites()` aggiorna le card dei preferiti.

I preferiti vengono conservati anche dopo il ricaricamento della pagina.

### 3. Rimozione dei preferiti

Ogni card dei preferiti presenta un pulsante "🗑 Rimuovi".

Al click:

- `findIndex()` individua la posizione della squadra nell'array.
- `splice()` elimina la squadra dall'array.
- `saveTeams()` aggiorna il LocalStorage.
- `renderFavourites()` aggiorna la visualizzazione.

Se è presente una ricerca nel campo, viene effettuata nuovamente la richiesta per aggiornare anche lo stato del pulsante della squadra cercata.

### 4. Visualizzazione delle partite

Cliccando sulla card di una squadra trovata, vengono recuperate due tipologie di informazioni:

- **Prossimi eventi:** partite in programma.
- **Ultimi risultati:** partite già disputate, con relativo punteggio.

Le richieste vengono effettuate contemporaneamente attraverso `Promise.all()`.
I dati vengono successivamente passati alla funzione `renderEvents()`, che genera dinamicamente una card contenente due colonne.

Se non sono disponibili partite, vengono mostrati i messaggi:

- "Nessun evento in programma".
- "Nessun risultato disponibile".

Le date vengono convertite nel formato italiano GG/MM/AAAA tramite la funzione `formatDate()`.

### 5. Caricamento e gestione degli errori

Durante la ricerca viene mostrato un alert Bootstrap azzurro con il testo "Caricamento...".
Attraverso `Promise.all()` vengono avviate contemporaneamente:

- La richiesta API.
- Una Promise con un `setTimeout()` di 400 millisecondi.

In questo modo il caricamento rimane visibile per almeno 400 ms, anche quando l'API risponde rapidamente.

La gestione degli errori avviene tramite:

- `try`: esegue le operazioni asincrone.
- `catch`: intercetta gli errori e mostra un alert rosso.
- `finally`: nasconde il caricamento indipendentemente dall'esito della richiesta.

Quando l'utente svuota il campo di ricerca, le card delle squadre e degli eventi vengono eliminate dal DOM.

---

## 🧠 Come funziona JavaScript

### Classe FootballTeams

La classe `FootballTeams` viene utilizzata per trasformare i dati ricevuti dall'API in oggetti con proprietà più semplici.

```javascript
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
```

Il metodo `map()` crea una nuova istanza per ogni squadra:

```javascript
const footballTeams = results.map((data) => {
    return new FootballTeams(data);
});
```

In questo modo, invece di utilizzare `strTeam`, `strBadge` e `strLeague`, è possibile accedere alle proprietà `name`, `logo` e `league`.

### Gestione del LocalStorage

Il LocalStorage permette di conservare i preferiti nel browser.

```javascript
function saveTeams() {
    localStorage.setItem('team', JSON.stringify(favouriteTeams));
}

function loadTeams() {
    return JSON.parse(localStorage.getItem('team') ?? '[]');
}
```

- `JSON.stringify()` converte l'array in una stringa.
- `localStorage.setItem()` salva i dati.
- `localStorage.getItem()` recupera i dati salvati.
- `JSON.parse()` riconverte la stringa in un array.
- `?? '[]'` restituisce un array vuoto quando non sono presenti dati salvati.

All'avvio della pagina viene eseguita `renderFavourites()` per mostrare le squadre precedentemente salvate.

### Richieste asincrone con Fetch API

Le funzioni `searchTeam()`, `getNextEvents()` e `getLastEvents()` utilizzano `async/await` per recuperare i dati.

Esempio:

```javascript
async function searchTeam(teamName) {
    const url = `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${teamName}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Errore nella richiesta");
    }

    const data = await response.json();
    return data.teams;
}
```

- `async` definisce una funzione asincrona.
- `fetch()` effettua la richiesta HTTP.
- `await` attende il completamento della Promise.
- `response.ok` verifica che la risposta HTTP sia andata a buon fine.
- `throw new Error()` genera un errore.
- `response.json()` legge e converte la risposta JSON in dati JavaScript.

### Utilizzo di Promise.all()

Quando l'utente seleziona una squadra, vengono eseguite contemporaneamente due richieste:

```javascript
const [nextEvents, lastEvents] = await Promise.all([
    getNextEvents(team.id),
    getLastEvents(team.id)
]);

renderEvents(nextEvents, lastEvents, team.name);
```

`Promise.all()` attende che entrambe le Promise vengano completate.
Il destructuring permette di assegnare i risultati direttamente alle variabili `nextEvents` e `lastEvents`.
La stessa tecnica viene utilizzata nella ricerca per attendere sia la risposta dell'API sia il timer di 400 ms.

### Render dinamico del DOM

Le funzioni principali di render sono:

- `renderTeams()`: crea le card delle squadre cercate.
- `renderFavourites()`: mostra le squadre salvate.
- `renderEvents()`: visualizza prossimi eventi e ultimi risultati.

Gli elementi HTML vengono creati attraverso `document.createElement()`.
Le classi CSS vengono assegnate con `classList.add()` e gli elementi vengono inseriti nel DOM tramite `append()`.
Il metodo `replaceChildren()` svuota i contenitori prima di aggiornarli, evitando duplicati.

### Gestione degli eventi

Il progetto utilizza diversi `addEventListener()`:

- `submit`: avvia la ricerca delle squadre.
- `input`: rileva quando il campo di ricerca viene svuotato.
- `click`: aggiunge o rimuove una squadra dai preferiti.
- `click` sulla card: recupera e mostra le partite.

Nel pulsante dei preferiti viene utilizzato:

```javascript
e.stopPropagation();
```

Questo metodo impedisce che il click sul pulsante attivi anche l'evento click della card che lo contiene.

### Metodi degli array utilizzati

| Metodo | Utilizzo |
|--------|----------|
| `map()` | Trasforma i risultati dell'API in istanze della classe. |
| `forEach()` | Crea le card per ogni squadra o partita. |
| `some()` | Controlla se una squadra è già nei preferiti. |
| `push()` | Aggiunge una squadra all'array. |
| `findIndex()` | Individua la posizione della squadra da rimuovere. |
| `splice()` | Elimina la squadra dall'array. |

---

## 🌐 API utilizzate

Il progetto utilizza le API di TheSportsDB.

**Ricerca squadre**

```text
https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=NOME_SQUADRA
```

Restituisce informazioni sulle squadre corrispondenti al nome inserito.

**Prossimi eventi**

```text
https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=ID_SQUADRA
```

Restituisce le prossime partite disponibili per una squadra.

**Ultimi risultati**

```text
https://www.thesportsdb.com/api/v1/json/123/eventslast.php?id=ID_SQUADRA
```

Restituisce le ultime partite disputate e gli eventuali punteggi.
La disponibilità delle informazioni dipende dai dati presenti nelle API.

---

## 🎨 Stile CSS e Bootstrap

L'interfaccia è realizzata con Bootstrap 5 e alcune regole CSS personalizzate.

### Colori e componenti

L'header utilizza un blu scuro personalizzato (`#193366`), mentre i titoli degli eventi utilizzano `#183153`.
I loghi delle squadre hanno dimensioni di 80 × 80 pixel e utilizzano `object-fit: contain` per mantenere le proporzioni.
Le sezioni degli eventi sono separate da bordi e spaziature.

### Effetto hover

Le card presentano un effetto di sollevamento al passaggio del mouse:

```css
.card {
    transition: transform 150ms ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12) !important;
    }
}
```

La transizione rende il movimento più fluido.

### Responsive design

Il layout si adatta alle diverse dimensioni dello schermo grazie alla griglia Bootstrap.

**Preferiti**

- `col-12`: una card per riga su mobile.
- `col-md-6`: due card per riga da 768px.
- `col-lg-4`: tre card per riga da 992px.

**Eventi**

- `col-12`: prossimi eventi e ultimi risultati uno sotto l'altro.
- `col-md-6`: due colonne affiancate da 768px.

Anche il form di ricerca si adatta alla larghezza dello schermo grazie alle classi `col-12`, `col-md-9` e `col-lg-6`.

---

## 🚀 Come avviare il progetto

1. Scaricare o clonare il repository.
2. Aprire la cartella del progetto con Visual Studio Code.
3. Avviare `index.html` nel browser, preferibilmente utilizzando Live Server.
4. Inserire il nome di una squadra nel campo di ricerca.
5. Visualizzare le informazioni, aggiungere preferiti e consultare le partite.

Non è necessaria l'installazione di librerie tramite npm: Bootstrap viene caricato tramite CDN.

È necessaria una connessione Internet per effettuare le richieste API.

---

## 📌 Obiettivi didattici

Il progetto è stato sviluppato per mettere in pratica le conoscenze acquisite durante lo studio di JavaScript e dello sviluppo web.

In particolare:

- Manipolazione dinamica del DOM.
- Programmazione a oggetti con classi e costruttori.
- Gestione degli eventi.
- Utilizzo dei metodi degli array.
- Salvataggio e recupero dei dati tramite LocalStorage.
- Richieste HTTP con Fetch API.
- Programmazione asincrona con Promise e async/await.
- Gestione degli errori.
- Creazione di interfacce responsive con Bootstrap.

SportsHub permette di collegare queste funzionalità in un'unica applicazione web interattiva.
