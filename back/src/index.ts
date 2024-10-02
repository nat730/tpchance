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
}
let userTab: User[] = [];

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)

  socket.on('pseudo', pseudoValue => {
    console.log(pseudoValue);
    const user = {
      id: socket.id,
      pseudo: pseudoValue,
      jetons: 100
    };
    if (userTab.length < 3) {
      userTab.push(user);
      socket.emit("createUserSuccess");
    } else {
      socket.emit("errorGameFull");
    }
    console.log(userTab);
  })

  socket.on('sendMessage', message => {
    const sender = userTab.find(user => user.id === socket.id)?.pseudo;
    
    const messageObj = {
      pseudo: sender,
      message: message
    };
    io.emit("chatMessage", messageObj);
  })

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id)
    userTab = userTab.filter(user => user.id !== socket.id)
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})