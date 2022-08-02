const socket = io();

const welcome   = document.getElementById("welcome")
const enterForm = welcome.querySelector("form")
const room      = document.getElementById("room");

room.hidden = true;

// functions
function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("input");
    socket.emit("new_message",input.value , roomName, ()=>{
        addMessage(`You: ${input.value}`);
        input.value = "";
    });
    
}

function showRoom(){
    welcome.hidden  = true;
    room.hidden     = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;

    const form = room.querySelector("form");
    form.addEventListener("submit",handleMessageSubmit);
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

socket.on("bye", () => {
    addMessage("someone left ㅠㅠ")
})

socket.on("new_message",addMessage);