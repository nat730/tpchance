const socket = io('http://localhost:3000')

let timerId;
let userId;

socket.on('connect', () => {
    console.log('connected', socket.id)
    userId = socket.id;
})

const body = document.querySelector("body");

//Form pseudo
const formPseudo = document.createElement("form");

const inputPseudo = document.createElement("input");
inputPseudo.type = "text";
inputPseudo.placeholder = "Pseudo";

const submitButtonPseudo = document.createElement("button");
submitButtonPseudo.type = "submit";
submitButtonPseudo.textContent = "Valider";

formPseudo.appendChild(inputPseudo);
formPseudo.appendChild(submitButtonPseudo);
body.append(formPseudo);

//Form chat
const formChat = document.createElement("form");

const inputChat = document.createElement("input");
inputChat.type = "text";
inputChat.placeholder = "Ecrire un message...";

const submitButtonChat = document.createElement("button");
submitButtonChat.type = "submit";
submitButtonChat.textContent = "Envoyer";

//Chat container
const chatContainer = document.createElement("div");

//Chrono
const chronoValue = document.createElement("p");

//Manche
let pileFaceValue = "pile";
const miseContainer = document.createElement("form");

const pileButton = document.createElement("input");
pileButton.type = "radio";
pileButton.id = "pile";
pileButton.name = "pari";
pileButton.selected = "true";

const pileLabel = document.createElement("label");
pileLabel.setAttribute("for", "pile");
pileLabel.innerHTML = "Pile";

const faceButton = document.createElement("input");
faceButton.type = "radio";
faceButton.id = "face";
faceButton.name = "pari";

const faceLabel = document.createElement("label");
faceLabel.setAttribute("for", "face");
faceLabel.innerHTML = "Face";

const miseInput = document.createElement("input");
miseInput.type = "number";
miseInput.placeholder = "Entrer votre mise";
miseInput.min = 0;

const submitButtonMise = document.createElement("button");
submitButtonMise.type = "submit";
submitButtonMise.textContent = "Valider";

miseContainer.appendChild(pileButton);
miseContainer.appendChild(pileLabel);
miseContainer.appendChild(faceButton);
miseContainer.appendChild(faceLabel);
miseContainer.appendChild(miseInput);
miseContainer.appendChild(submitButtonMise);

const waiting = document.createElement("p");
waiting.innerHTML = "En attente des autres joueurs...";

const mancheEndMessage = document.createElement("p");

submitButtonPseudo.addEventListener('click', function (e) {
    e.preventDefault();
    const value = inputPseudo.value;
    socket.emit("pseudo", value);

    socket.on("errorGameFull", () => {
        alert("Le nombre de personnes pour le jeu est déjà atteint.")
    });
});

socket.on("createUserSuccess", () => {
    formPseudo.remove();

    formChat.appendChild(inputChat);
    formChat.appendChild(submitButtonChat);
    body.append(chatContainer);
    body.append(formChat);
});

submitButtonChat.addEventListener('click', function (e) {
    e.preventDefault();
    const value = inputChat.value;
    socket.emit("sendMessage", value);
    inputChat.value = "";
});

socket.on("chatMessage", messageObj => {
    const messageContainer = document.createElement("div");

    const sender = document.createElement("p");
    sender.innerHTML = messageObj.pseudo;

    const message = document.createElement("p");
    message.innerHTML = messageObj.message;

    messageContainer.appendChild(sender);
    messageContainer.appendChild(message);

    chatContainer.append(messageContainer);
});

socket.on("gameStart", () => {
    chatContainer.remove();
    formChat.remove(); 
    mancheEndMessage.remove();

    body.append(chronoValue);

    const start = Date.now();

    timerId = setInterval(() => {
        const millis = Date.now() - start;
        chronoValue.innerHTML = (millis / 1000).toFixed(3);
    }, 137);
});

socket.on("startManche", jetons => {
    clearInterval(timerId);
    chronoValue.remove();

    miseInput.max = jetons;
    body.append(miseContainer);
});

pileButton.addEventListener('click', function (e) {
    pileFaceValue = "pile";
});

faceButton.addEventListener('click', function (e) {
    pileFaceValue = "face";
});

submitButtonMise.addEventListener('click', function (e) {
    e.preventDefault();

    const miseValue = miseInput.value;
    const mise = {
        pileFaceValue: pileFaceValue,
        miseValue: miseValue
    }
    socket.emit("sendMise", mise);

    miseContainer.remove();

    body.append(waiting);
});

socket.on("win", (id, jetons, mise) => {
    if (id === userId) {
        waiting.remove();

        mancheEndMessage.innerHTML = `Vous avez gagné ${mise + 10} jetons ! Vous avez désormais ${jetons} jetons.`;
        body.append(mancheEndMessage);
    }
})

socket.on("lose", (id, jetons, mise) => {
    if (id === userId) {
        waiting.remove();
        
        mancheEndMessage.innerHTML = `Vous avez perdu ${mise} jetons. Vous avez désormais ${jetons} jetons.`;
        body.append(mancheEndMessage);
    }
})