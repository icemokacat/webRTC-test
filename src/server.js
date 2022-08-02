import express, { json, response } from "express";
import http from "http";
import {Server} from "socket.io";
//import WebSocket from "ws";
import path from 'path';

const __dirname = path.resolve();   // common 모듈이 아닌 es 모듈사용시 import 시켜줘야함
const app = express();

// view 단을 설정
app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");

// resources 경로 지정
app.use("/public", express.static(__dirname + "/src/public"));

// router
app.get("/" , (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

// server 세팅
const port = 3000;
const handleListen = () => console.log(`Listen on http://localhost:`+port);

const httpServer    = http.createServer(app);
const wsServer      = new Server(httpServer);

wsServer.on("connection", socket => {
    // 여러개의 파라미터 전송 가능
    // 마지막은 callback func 임
    socket.onAny((event)=>{
        console.log(`Socket Event:${event}`);
    })
    socket.on("enter_room", (roomName,done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", () =>{
            console.log("welcome")
        })
    });
    socket.on("disconnecting",() => {
        socket.rooms.forEach(room => socket.to(room).emit("bye"));
    });
    socket.on("new_message",(msg,room,done)=>{
        socket.to(room).emit("new_message",msg);
        done();
    })
})

// function onSocketClose() {
//     console.log("Disconnected from the Browser ❌");
// }

// function onSocketMessage(message) {
//     console.log(message);
// }

// function getPayload(json){y
//    const payload = json['payload'];
//    return payload; 
// }

// function getType(json){
//     const type = json['type'];
//     return type;
// }

//const sockets   = [];

// connection eventListner
// wss.on("connection",(socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anos";
//     console.log("Connected to Browser ✅");
//     // client 연결 끊기면 실행 (여기서는 browser)
//     socket.on("close"   ,onSocketClose );
//     socket.on("message" , (msg) => {
//         const message   = JSON.parse(msg);
//         const type      = getType(message);
//         const payload   = getPayload(message);

//         switch (type) {
//             case 'new_message':
//                 // 메세지일때
//                 sockets.forEach((aSocket) => {
//                     aSocket.send(`[${socket.nickname}] : ${payload}`);
//                 })
//             case 'nickname':
//                 // 닉네임일때
//                 nickNames.push(payload);
//                 socket["nickname"] = message.payload;
//         }
        
//     });
// });

httpServer.listen(port,handleListen);
