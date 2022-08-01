
const messageList   = document.querySelector("ul");
const nickForm      = document.querySelector("#nickname");
const messageForm   = document.querySelector("#message");

const url       = window.location.host;
const socket    = new WebSocket(`ws://${url}`);

function onSocketClose() {
    console.log("Disconnected from the Browser ❌");
}

function handleOpen(){
    console.log("Connected to Browser ❤️");
}


// message : event
socket.addEventListener("open",handleOpen);

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data; 
    messageList.append(li);
});

socket.addEventListener("close",onSocketClose);

// json to string
function makeMessage(type,payload){
    const msg = {type,payload}
    return JSON.stringify(msg);
}

// 메세지
function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message",input.value));
    input.value = "";
    
}

// 닉네임
function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname",input.value));
}

messageForm.addEventListener("submit",handleSubmit);
nickForm.addEventListener("submit",handleNickSubmit);