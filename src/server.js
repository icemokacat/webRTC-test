import express, { json, response } from "express";
import http from "http";
import {Server} from "socket.io";
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
const port          = 3000;
const serverDomain  = 'localhost';

const httpServer    = http.createServer(app);
const wsServer      = new Server(httpServer);

// server 시작시 실행할 함수
const handleListen = () => console.log(`Listen on http://`+serverDomain+`:`+port);

// server start
httpServer.listen(3000, handleListen);
