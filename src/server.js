import express, { response } from "express";
import http from "http";
import WebSocket from "ws";
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
// app.listen(3000,handleListen); 

const server    = http.createServer(app);
const wss       = new WebSocket.Server({server});

// connection eventListner
wss.on("connection",(socket) => {
    console.log("Connected to Browser ✅");
    // client 연결 끊기면 실행 (여기서는 browser)
    socket.on("close",() => console.log("Disconnected from the Browser ❎") );
    socket.on("message", message => {
        console.log("from browser msg : "+message);
    });
    socket.send("Hello socket!");
});

server.listen(port,handleListen);
