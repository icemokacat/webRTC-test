const socket = io();

const welcome   = document.getElementById("welcome")
const enterForm = welcome.querySelector("form")
const room      = document.getElementById("room");

room.hidden = true;

// functions
function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const msg   = input.value;    
    socket.emit("new_message",input.value , roomName, ()=>{
        addMessage(`You: ${msg}`);
    });
    input.value = "";
}

function handleNickNameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname",input.value);
}

function showRoom(){
    welcome.hidden  = true;
    room.hidden     = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;

    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit",handleMessageSubmit);

    const nameForm = room.querySelector("#name");
    nameForm.addEventListener("submit",handleNickNameSubmit);
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

socket.on("welcome",(nickname, newCount)=>{
    addMessage(`${nickname} joined! 😊`)
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
})

socket.on("bye", (nickname, newCount) => {
    addMessage(`${nickname} left ㅠㅠ`)
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
})

socket.on("new_message",addMessage);

socket.on("room_change",(rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";

    if(rooms.length === 0){
        return;
    }
    
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});