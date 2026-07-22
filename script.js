// je definie mes emojis qui seront utilisés pour les cartes du jeu
const emojis = ["😀", "🐶", "🍕", "🚀", "🎵", "⚽", "🌈", "🔥"];

// je définie une fonction pour mélanger les cartes
/** fonction shuffle(tableau) :
m = longueur du tableau
tant que m > 0 :
    m = m - 1
    i = un nombre aléatoire entre 0 et m (inclus)
    échanger tableau[m] et tableau[i]
    retourner tableau */
function shuffle(array) {
    let m = array.length;
    while (m > 0) {
        m -= 1;
        let i = Math.floor(Math.random() * (m + 1));
        [array[m], array[i]] = [array[i], array[m]];
    }
    return array;
}

// je définie une fonction pour créer les cartes du jeu avec id=index, value=emoji, flipped=false, matched=false
function createCards(values) {
    const duplicated = [...values, ...values];
    const shuffled = shuffle([...duplicated]);

    return shuffled.map((value, index) => ({
        id: index,
        value,
        flipped: false,
        matched: false,
    }));
}
function checkWin(cards) {
    return cards.every((card) => card.matched === true);
}
/** je définie une fonction pour afficher les cartes du jeu
je vide le jeux avant d'ajouter les cartes
et je crée un bouton pour chaque carte et je l'ajoute au jeu
je définie l'id de la carte dans le dataset du bouton pour la récupérer après
le bouton n'affiche la valeur que si la carte est retournée ou déjà trouvée */
function renderCards(cards) {
    const board = document.getElementById("game-board");
    if (!board) return;

    board.innerHTML = "";

    cards.forEach((card) => {
        const button = document.createElement("button");
        button.className = card.flipped || card.matched ? "card flipped" : "card";
        button.type = "button";
        button.dataset.id = String(card.id);
        button.innerHTML = `
    <div class="card-face card-back"></div>
    <div class="card-face card-front">${card.value}</div>
`;
        board.appendChild(button);
    });
}

// je crée mes cartes et je les affiche une première fois
let gameCards = createCards(emojis);
renderCards(gameCards);

const board = document.getElementById("game-board");
const moveCountElement = document.getElementById("move-count");
const restartButton = document.getElementById("restart-button");
const timerElement = document.getElementById("timer");
let seconds = 0;
let timerId = null;

function updateTimerDisplay() {
    if (!timerElement) return;
    timerElement.textContent = String(seconds);
}

function startTimer() {
    if (timerId !== null) return; // timer déjà en cours
    timerId = setInterval(() => {
        seconds += 1;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}
    

let flippedCards = []; // contiendra au maximum 2 cartes en attente de comparaison
let isBusy = false;    // true pendant qu'on affiche/compare 2 cartes, pour bloquer les clics
let moveCount = 0;     // nombre de coups (1 coup = 2 cartes retournées)

function updateMoveCount() {
    if (!moveCountElement) return;
    moveCountElement.textContent = String(moveCount);
}

updateMoveCount();

// UN SEUL écouteur de clic, avec toute la logique de jeu
board.addEventListener("click", (event) => {
    const button = event.target.closest(".card");
    if (!button) return;

    if (isBusy) return; // on ignore les clics pendant qu'on compare 2 cartes

    startTimer();

    const id = Number(button.dataset.id);
    const card = gameCards.find((c) => c.id === id);

    if (!card || card.flipped || card.matched) return;

    card.flipped = true;
    flippedCards.push(card);
    renderCards(gameCards);

    if (flippedCards.length < 2) return; // on attend que le joueur retourne une 2e carte

    moveCount += 1;
    updateMoveCount();

    isBusy = true;

    const [firstCard, secondCard] = flippedCards;

    if (firstCard.value === secondCard.value) {
        firstCard.matched = true;
        secondCard.matched = true;
    
        flippedCards = [];
        isBusy = false;
        renderCards(gameCards);
    
        if (checkWin(gameCards)) {
            const message = document.getElementById("message");
            message.textContent = "Félicitations ! Vous avez gagné !";
            stopTimer();
        }
    } else {
        setTimeout(() => {
            firstCard.flipped = false;
            secondCard.flipped = false;
            flippedCards = [];
            isBusy = false;
            renderCards(gameCards);
        }, 800);
    }
});

// j'ajoute un ecouteur sur le bouton rejouer
restartButton.addEventListener("click", () => {
    gameCards = createCards(emojis);
    flippedCards = [];
    isBusy = false;
    moveCount = 0;
    updateMoveCount();
    stopTimer();
    seconds = 0;
    updateTimerDisplay();
    const message = document.getElementById("message");
    if (message) message.textContent = "";

    renderCards(gameCards);
});

