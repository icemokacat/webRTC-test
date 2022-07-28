import express from "express";
import path from 'path';
const __dirname = path.resolve();   // common 모듈이 아닌 es 모듈사용시 import 시켜줘야함

const app = express();

console.log(__dirname)

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");

app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (req, res) => res.render("home"));

const handleListen = () => console.log(`Listen on http://localhost:3000`);

app.listen(3000,handleListen);