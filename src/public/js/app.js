const socket = io();

const welcome   = document.getElementById("welcome")
const enterForm = welcome.querySelector("form")
const room      = document.getElementById("room");

room.hidden = true;

// functions
function showRoom(){
    welcome.hidden  = true;
    room.hidden     = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
}

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

// room enter
function handleRoomSubmit(event){
    event.preventDefault();
    const input = enterForm.querySelector("input");
    // websocket의 send
    socket.emit("enter_room",input.value,showRoom);
    roomName = input.value;
    input.value = "";
}

// room enter event listner
enterForm.addEventListener("submit",handleRoomSubmit)

socket.on("welcome",()=>{
    addMessage('Someone joined! :smile:')
})