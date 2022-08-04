import express, { json, response } from "express";
import http from "http";
import {Server} from "socket.io";
import path from 'path';

// 환경설정
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.resolve();   // common 모듈이 아닌 es 모듈사용시 import 시켜줘야함
const app = express();

// view 단을 설정
app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");

// resources 경로 지정
app.use("/public", express.static(__dirname + "/src/public"));

// router
app.get("/" , (_, res) => res.render("home"));
//app.get("/*", (_, res) => res.redirect("/"));
app.get("/turn-config",(_, res) => {
    const turnServerDomain  = process.env.TURN_SERVER_DOMAIN;
    const turnServerId      = process.env.TURN_SERVER_ID;
    const turnServerPwd     = process.env.TURN_SERVER_PASSWD;
    const config = {
        server  : turnServerDomain,
        id      : turnServerId,
        pw      : turnServerPwd
    };
    res.send(config)
});


// server 세팅
const port          = process.env.SERVER_PORT;
const serverDomain  = 'localhost';

const httpServer    = http.createServer(app);
const wsServer      = new Server(httpServer);

wsServer.on("connection",socket => {
    socket.on("join_room",(roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    })
    socket.on("offer",(offer,roomName) => {
        socket.to(roomName).emit("offer",offer);
    })
    socket.on("answer",(answer,roomName) => {
        socket.to(roomName).emit("answer",answer);
    });
    socket.on("ice",(ice,roomName) => {
        socket.to(roomName).emit("ice",ice);
    });
})

// server 시작시 실행할 함수
const handleListen = () => console.log(`Listen on http://`+serverDomain+`:`+port);

// server start
httpServer.listen(3000, handleListen);
