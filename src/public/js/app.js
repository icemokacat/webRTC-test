const socket = io();

const myFace        = document.getElementById("myFace");
const muteBtn       = document.getElementById("mute");
const cameraOffBtn  = document.getElementById("cameraOff");
const camerasSelect = document.getElementById("cameras");

const callDiv      = document.getElementById("call");
const myStreamDiv  = document.getElementById("myStream");

callDiv.hidden = true;


let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras(){
    // 기기?가 가지고 있는 카메라 장치들을 가져옴
    try {
        // 기기?가 가지고 있는 장치들을 가져옴
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput")
        const currentCamera = myStream.getVideoTracks()[0];

        cameras.forEach(cam => {
            const option = document.createElement("option")
            option.value = cam.deviceId;
            option.innerText = cam.label;

            //console.log(currentCamera.label)

            if (currentCamera.label === cam.label) {
                option.selected = true;
            }

            camerasSelect.appendChild(option)
        })

    } catch (error) {
        console.log(error)
    }
}

async function getMedia(deviceId){
    const initialConstrains = {
        audio: true,
        video: { facingMode: "user" },
    };
    const cameraConstraints = {
        audio: true,
        video: { 
            deviceId: { exact: deviceId } 
        },
    };
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstrains
        );
        myFace.srcObject = myStream;
        if(!deviceId){
            await getCameras();
        }
    }catch(e){
        console.log(e)
    }
}

// getMedia();

// functions
function handleMuteBtn (){
    myStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
    });
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    }else{
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraOffBtn (){
    myStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
    })
    if(cameraOff){
        cameraOffBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }else{
        cameraOffBtn.innerText = "Turn Camera On";
        cameraOff = true;    
    }
}
async function handleChangeCamera(){
    await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click",handleMuteBtn)
cameraOffBtn.addEventListener("click",handleCameraOffBtn)
camerasSelect.addEventListener("input",handleChangeCamera)

// Welcome Form

const welcomeDiv    = document.getElementById("welcome");
const welcomeForm   = welcomeDiv.querySelector("form");

async function initCall(){
    welcomeDiv.hidden = true;
    callDiv.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room",input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit",handleWelcomeSubmit);

// Socket Code

socket.on("welcome",async () => {
    const offer = await myPeerConnection.createOffer();
    // offer : 접속한 peer의 정보 (접속할 수 있도록)
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer!")
    socket.emit("offer",offer,roomName);
})

socket.on("offer",async (offer) => {
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer",answer,roomName);
})

socket.on("answer",async (answer) => {
    myPeerConnection.setLocalDescription(answer);
})

// RTC Code

function makeConnection(){
    // peer to peer connect
    myPeerConnection = new RTCPeerConnection();
    myStream.getTracks().forEach(track => {
        myPeerConnection.addTrack(track,myStream);
    })
}