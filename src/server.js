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

function publicRooms(){
    // destructuring assignment (구조 분해 할당)
    // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    const {rooms,sids} = wsServer.sockets.adapter;


    //const sids = wsServer.sockets.adapter.sids;
    //const rooms = wsServer.sockets.adapter.rooms;
    const publicRooms = [];
    rooms.forEach((_,key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    })
    return publicRooms;
}

wsServer.on("connection", socket => {
    // 여러개의 파라미터 전송 가능
    // 마지막은 callback func 임
    socket["nickname"] = "Anon";
    socket.onAny((event)=>{
        //console.log(wsServer.sockets.adapter);
        console.log(`Socket Event:${event}`);
    })
    socket.on("enter_room", (roomName,done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome",socket.nickname)
    });
    socket.on("disconnecting",() => {
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname)
        );
    });
    socket.on("new_message",(msg,room,done)=>{
        socket.to(room).emit("new_message",`[${socket.nickname}]:${msg}`);
        done();
    });
    socket.on("nickname",(nickname)=>{
       socket["nickname"] = nickname;    
    })
})

httpServer.listen(port,handleListen);
