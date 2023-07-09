import { loadGLTF, loadVideo } from "./libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

var RunningProgramId;


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("closelive-cam").addEventListener("click", closeLiveCam);
    document.getElementById("modelAR-Run").addEventListener("click", modelARRun);
    document.getElementById("videoAR-Run").addEventListener("click", videoARRun);
});


function closeLiveCam() {
    if(RunningProgramId)
        clearInterval(RunningProgramId);
    document.getElementById("live-cam").style.display = "none";
}

function modelARRun() {

    const mindFile = URL.createObjectURL(document.getElementById("modelMindFile").files[0]);
    const renderFile = URL.createObjectURL(document.getElementById("modelRenderFile").files[0]);

    const posX = document.getElementById("modelPosX").value;
    const posY = document.getElementById("modelPosY").value;
    const posZ = document.getElementById("modelPosZ").value;

    const scaleX = document.getElementById("modelScaleX").value;
    const scaleY = document.getElementById("modelScaleY").value;
    const scaleZ = document.getElementById("modelScaleZ").value;


    console.log(mindFile);
    console.log(renderFile);
    console.log("(" + posX + ", " + posY + ", " + posZ + ")");
    console.log("(" + scaleX + ", " + scaleY + ", " + scaleZ + ")");

    document.getElementById("live-cam").style.display = "block";
    createModelAR(mindFile, renderFile, posX, posY, posZ, scaleX, scaleY, scaleZ);
}


function videoARRun() {

    const mindFile = URL.createObjectURL(document.getElementById("videoMindFile").files[0]);
    const renderFile = URL.createObjectURL(document.getElementById("videoRenderFile").files[0]);

    const scaleX = document.getElementById("videoScaleX").value;
    const scaleY = document.getElementById("videoScaleY").value;


    console.log(mindFile);
    console.log(renderFile);
    console.log("(" + scaleX + ", " + scaleY + ")");

    document.getElementById("live-cam").style.display = "block";
    createVideoAR(mindFile, renderFile, scaleX, scaleY);

}


function createModelAR(detectObject, renderObject, positionX, positionY, positionZ, scaleX, scaleY, scaleZ) {
    const start = async () => {

        isProgramRunning = true;
        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.getElementById("live-cam"),
            imageTargetSrc: detectObject,
        });

        const { renderer, scene, camera } = mindarThree;

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        const earth = await loadGLTF(renderObject);

        earth.scene.position.set(positionX, positionY, positionZ);
        earth.scene.scale.set(scaleX, scaleY, scaleZ);

        const anchor = mindarThree.addAnchor(0);
        anchor.group.add(earth.scene);

        await mindarThree.start();

        RunningProgramId = setInterval(() => {
            renderer.render(scene, camera);
        }, 25);

    }
    start();
}

function createVideoAR(detectObject, renderObject, scaleX, scaleY) {
    const start = async () => {
        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.getElementById("live-cam"),
            imageTargetSrc: detectObject,
        });
        const { renderer, scene, camera } = mindarThree;

        const video = await loadVideo(renderObject);
        const texture = new THREE.VideoTexture(video);

        const geometry = new THREE.PlaneGeometry(scaleX, scaleY);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const plane = new THREE.Mesh(geometry, material);

        const anchor = mindarThree.addAnchor(0);
        anchor.group.add(plane);

        anchor.onTargetFound = () => {
            video.play();
        }
        anchor.onTargetLost = () => {
            video.pause();
        }

        await mindarThree.start();

        RunningProgramId = setInterval(() => {
            renderer.render(scene, camera);
        }, 25);

    }
    start();
}