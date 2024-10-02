import { Server } from 'socket.io'
import express from 'express'
import http from 'http'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  }
})
interface User {
  id: string;
  pseudo: string;
  jetons: number;
  pileFace?: string;
  mise?: number;
}
let userTab: User[] = [];

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)

  socket.on('pseudo', pseudoValue => {
    const user = {
      id: socket.id,
      pseudo: pseudoValue,
      jetons: 100
    };
    if (userTab.length < 3) {
      userTab.push(user);
      socket.emit("createUserSuccess");
      console.log(userTab);
    } else {
      socket.emit("errorGameFull");
    }
    if (userTab.length === 3) {
      io.emit("gameStart");

      setTimeout(() => {
        const jetons = userTab.find(user => user.id === socket.id)?.jetons;
        io.emit("startManche", jetons);
      }, 5000);
    }
  })

  socket.on('sendMessage', message => {
    const sender = userTab.find(user => user.id === socket.id)?.pseudo;

    const messageObj = {
      pseudo: sender,
      message: message
    };
    io.emit("chatMessage", messageObj);
  })

  socket.on('sendMise', mise => {
    const userIndex = userTab.findIndex(user => user.id === socket.id);
    userTab[userIndex].pileFace = mise.pileFaceValue;
    userTab[userIndex].mise = parseInt(mise.miseValue);
    console.log(userTab);

    const playerHasBet = userTab.filter(user => user.pileFace !== undefined && user.mise !== undefined);
    if (playerHasBet.length === 3) {
      const pileFaceGame = Math.random();
      let pileFaceResult = pileFaceGame < 0.5 ? "pile" : "face";

      userTab.forEach(user => {
        if (user.mise !== undefined) {
          if (pileFaceResult === user.pileFace) {
            user.jetons = user.jetons + user.mise + 10;
            io.emit("win", user.id, user.jetons, user.mise);
          } else {
            user.jetons = user.jetons - user.mise;
            io.emit("lose", user.id, user.jetons, user.mise);
          }
        }
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id)
    userTab = userTab.filter(user => user.id !== socket.id)
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})