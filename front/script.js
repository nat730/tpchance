const socket = io('http://localhost:3000')
socket.on('connect', () => {
    console.log('connected', socket.id)
})

const body = document.querySelector("body");
const formPseudo = document.createElement("form");

const inputPseudo = document.createElement("input");
inputPseudo.type = "text";
inputPseudo.placeholder = "Pseudo";

const submitButtonPseudo = document.createElement("button");
submitButtonPseudo.type = "submit";
submitButtonPseudo.textContent = "Valider";

const formChat = document.createElement("form");

const inputChat = document.createElement("input");
inputChat.type = "text";
inputChat.placeholder = "Ecrire un message...";

const submitButtonChat = document.createElement("button");
submitButtonChat.type = "submit";
submitButtonChat.textContent = "Envoyer";

const chatContainer = document.createElement("div");

formPseudo.appendChild(inputPseudo);
formPseudo.appendChild(submitButtonPseudo);
body.append(formPseudo);

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