const socket = io();

const myFace        = document.getElementById("myFace");
const muteBtn       = document.getElementById("mute");
const cameraOffBtn  = document.getElementById("cameraOff");
const camerasSelect = document.getElementById("cameras");

const callDiv      = document.getElementById("call");
const myStreamDiv  = document.getElementById("myStream");
const chatDiv      = document.getElementById("chat");

callDiv.hidden = true;
chatDiv.hidden = true;


let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

let turnServerDomain;
let turnServerId;
let turnServerPwd;

const option = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
}
fetch("/turn-config",option)
.then(res => res.json())
.then(
    (data) => {
        //console.log(data)
        turnServerDomain    = data.server;
        turnServerId        = data.id;
        turnServerPwd       = data.pw;
    }
)

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
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(
            sender => sender.track.kind === "video"
        );
        videoSender.replaceTrack(videoTrack)
    }
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
    chatDiv.hidden = false;
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

// chat form
const chatForm  = document.getElementById("chatfoot");
const chatInp   = chatForm.querySelector("input");
const enterBtn  = chatForm.querySelector("button")

function sendChatMsg(){
    const msg = chatInp.value;
    myDataChannel.send(msg);
}

chatInp.addEventListener("keyup",event => {
    if(event.key == "Enter"){
        sendChatMsg();
    }
})
enterBtn.addEventListener("click",event => {
    sendChatMsg();
})


// Socket Code

socket.on("welcome",async () => {
    // peer A datachannel
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message",msg => {
        addChatMessage(msg.data);
    })
    console.log("made data channel")

    const offer = await myPeerConnection.createOffer();
    // offer : 접속한 peer의 정보 (접속할 수 있도록)

    // dataChannel 사용시 offer를 제공하는 측에서 열어줘야함

    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer!")
    socket.emit("offer",offer,roomName);
})

socket.on("offer",async (offer) => {

    // peer B datachannel
    myPeerConnection.addEventListener("datachannel",event => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message",msg => {
            addChatMessage(msg.data);
        })
    })

    console.log("received the offer")
    myPeerConnection.setRemoteDescription(offer);

    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);

    socket.emit("answer",answer,roomName);
    console.log("sent the answer");
})

socket.on("answer",async (answer,remoteInfo) => {
    console.log("received the answer")
    // The SDP(Session Description Protocol) does not match the previously generated SDP
    // since the latest WebRTC spec forbids SDP munging between createOffer and setLocalDescription.
    // https://webrtcstandards.info/end-of-sdp-in-webrtc/
    try{
        myPeerConnection.setRemoteDescription(answer);
    }catch(e){
        console.error(e);
    }
})

socket.on("ice",async (ice)=>{
    console.log("receive ice")
    try{
        if(myPeerConnection.remoteDescription){
            myPeerConnection.addIceCandidate(ice);
        }else{
            console.warn("required remoteDescription")
        }
    }catch(e){
        console.error(e);
    }
    
})

// chat
function addChatMessage(msg){
    var ulList  = document.getElementById("list");
    var li      = document.createElement("li");
    li.innerText = msg;
    ulList.appendChild(li);
}


// RTC Code

function makeConnection(){
    // peer to peer connect
    const connectConfig = {
        iceServers:[
            {
                urls:[
                    turnServerDomain
                ],
                username    :   turnServerId,
                credential  :   turnServerPwd
            }
        ]
    }
    myPeerConnection = new RTCPeerConnection(connectConfig);
    myPeerConnection.addEventListener("icecandidate",handleIce);
    myPeerConnection.addEventListener("addstream",handleAddStream);
    myStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track,myStream));
}

function handleIce(data){
    console.log("sent candidate")
    socket.emit("ice",data.candidate,roomName);
}

function handleAddStream(data){
    //console.log("got an event from my peer")
    //console.log("Peer's Stream \t"  ,data.stream);
    //console.log("My Stream \t"      ,myStream);
    const peersStream = document.getElementById("peersFace")
    console.log("Peer's Stream Start!")
    peersStream.srcObject = data.stream;
}