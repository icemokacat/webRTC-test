const socket = io();

const container     = document.getElementById("container");
const myMediaBox    = document.getElementById("myMedia");

let myPeerConnection;
let myDataChannel;


// const option = {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
// }
// fetch("/turn-config",option)
// .then(res => res.json())
// .then(
//     (data) => {
//         //console.log(data)
//         turnServerDomain    = data.server;
//         turnServerId        = data.id;
//         turnServerPwd       = data.pw;
//     }
// )

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


// Welcome Form


// chat form

// Socket Code

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
