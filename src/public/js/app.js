const socket = io();

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")

// functions
function backendDone(msg){
    console.log("The backend says:"+msg);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    // websocket의 send
    socket.emit("enter_room",input.value,
        // callback func to back end
        // 마지막은 callback func 임
        backendDone
    );
    input.value = "";
}

form.addEventListener("submit",handleRoomSubmit)