const socket = io();

const myFace        = document.getElementById("myFace");
const muteBtn       = document.getElementById("mute");
const cameraOffBtn  = document.getElementById("cameraOff");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

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

getMedia();

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