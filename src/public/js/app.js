
const url       = window.location.host;
const socket    = new WebSocket(`ws://${url}`);

// message : event
socket.addEventListener("open",() =>{
    console.log("Connected to Browser ❤️");
});

socket.addEventListener("message",(message)=>{
    console.info("New message  :",message.data);
});

socket.addEventListener("close",()=>{
    console.log("Disconnected Server 💔");
});

setTimeout(() => {
    socket.send("hello from the browser!");
},10000);