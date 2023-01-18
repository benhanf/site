import DeviceDetector from "https://cdn.skypack.dev/device-detector-js@2.2.10";

var COM, FaceCOMx, FaceCOMy, FaceCOMz, FaceCoefficient, LeftCalfCoefficient, LeftCalfx, LeftCalfy, LeftCalfz, LeftFootCoefficient, LeftFootx, LeftFooty, LeftFootz, LeftHandCoefficient, LeftHandx, LeftHandy, LeftHandz, LeftLowerArmx, LeftLowerArmy, LeftLowerArmz, LeftLowerArmCoefficient, LeftThighCoefficient, LeftThighx, LeftThighy, LeftThighz, LeftUpperArmx, LeftUpperArmy, LeftUpperArmz, LeftUpperArmCoefficient, RightCalfCoefficient, RightCalfx, RightCalfy, RightCalfz, RightFootCoefficient, RightFootx, RightFooty, RightFootz, RightHandCoefficient, RightHandx, RightHandy, RightHandz, RightLowerArmx, RightLowerArmy, RightLowerArmz, RightLowerArmCoefficient, RightThighCoefficient, RightThighx, RightThighy, RightThighz, RightUpperArmx, RightUpperArmy, RightUpperArmz, RightUpperArmCoefficient, TorsoCOMx, TorsoCOMy, TorsoCOMz, TorsoCoefficient;

var PCOM, pFaceCOMx, pFaceCOMy, pFaceCOMz, pLeftCalfx, pLeftCalfy, pLeftCalfz, pLeftFootx, pLeftFooty, pLeftFootz, pLeftHandx, pLeftHandy, pLeftHandz, pLeftLowerArmx, pLeftLowerArmy, pLeftLowerArmz, pLeftThighx, pLeftThighy, pLeftThighz, pLeftUpperArmx, pLeftUpperArmy, pLeftUpperArmz, pRightCalfx, pRightCalfy, pRightCalfz, pRightFootx, pRightFooty, pRightFootz, pRightHandx, pRightHandy, pRightHandz, pRightLowerArmx, pRightLowerArmy, pRightLowerArmz, pRightThighx, pRightThighy, pRightThighz, pRightUpperArmx, pRightUpperArmy, pRightUpperArmz, pTorsoCOMx, pTorsoCOMy, pTorsoCOMz;

var theta, angleX, angleY, composedAngle;
var d = new Date(), startTime, timestamp, timer, stopTime, differenceTime, i, differenceCalculated;
var t, time1, time2, angle1, angle2, AngularVel;

AngularVel = 0;
time1 = 0;
time2 = 0;
angle1 = 0;
angle2 = 0;
t = 0;
composedAngle = 0;
timestamp = 0;
differenceTime = 0;
i = 0;
differenceCalculated = 0;
FaceCoefficient = 0.0694;
TorsoCoefficient = 0.4346;
LeftUpperArmCoefficient = 0.0271;
RightUpperArmCoefficient = 0.0271;
LeftLowerArmCoefficient = 0.0162;
RightLowerArmCoefficient = 0.0162;
LeftHandCoefficient = 0.0061;
RightHandCoefficient = 0.0061;
LeftThighCoefficient = 0.1416;
RightThighCoefficient = 0.1416;
LeftCalfCoefficient = 0.0433;
RightCalfCoefficient = 0.0433;
LeftFootCoefficient = 0.0137;
RightFootCoefficient = 0.0137;

const controls = window;
const LandmarkGrid = window.LandmarkGrid;
const drawingUtils = window;
const mpPose = window;
const options = {
  locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}/${file}`;
}};

// Our input frames will come from here.
const videoElement =
    document.getElementsByClassName('input_video')[0] as HTMLVideoElement;
const canvasElement =
    document.getElementsByClassName('output_canvas')[0] as HTMLCanvasElement;
const controlsElement =
    document.getElementsByClassName('control-panel')[0] as HTMLDivElement;
const canvasCtx = canvasElement.getContext('2d')!;

// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS();

// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading')! as HTMLDivElement;
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};  

const landmarkContainer =
    document.getElementsByClassName('landmark-grid-container')[0] as HTMLDivElement;
const grid = new LandmarkGrid(landmarkContainer, {
  connectionColor: 0xCCCCCC,
  definedColors:
      [{name: 'LEFT', value: 0xffa500}, {name: 'RIGHT', value: 0x00ffff}],
  range: 2,
  fitToGrid: true,
  labelSuffix: 'm',
  landmarkSize: 2,
  numCellsPerAxis: 4,
  showHidden: false,
  centered: true,
});

let activeEffect = 'mask';
function onResults(results: mpPose.Results): void {
  // Hide the spinner.
  document.body.classList.add('loaded');

  // Update the frame rate.
  fpsControl.tick();

  // Draw the overlays.
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.segmentationMask) {
    canvasCtx.drawImage(
        results.segmentationMask, 0, 0, canvasElement.width,
        canvasElement.height);

    // Only overwrite existing pixels.
    if (activeEffect === 'mask' || activeEffect === 'both') {
      canvasCtx.globalCompositeOperation = 'source-in';
      // This can be a color or a texture or whatever...
      canvasCtx.fillStyle = '#00FF007F';
      canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    } else {
      canvasCtx.globalCompositeOperation = 'source-out';
      canvasCtx.fillStyle = '#0000FF7F';
      canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    }

    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.globalCompositeOperation = 'source-over';
  } else {
     canvasCtx.drawImage(
         results.image, 0, 0, canvasElement.width, canvasElement.height);
  }

  if (results.poseLandmarks) {
    drawingUtils.drawConnectors(
        canvasCtx, results.poseLandmarks, mpPose.POSE_CONNECTIONS,
        {visibilityMin: 0.65, color: 'white'});
    drawingUtils.drawLandmarks(
        canvasCtx,
        Object.values(mpPose.POSE_LANDMARKS_LEFT)
            .map(index => results.poseLandmarks[index]),
        {visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)'});
    drawingUtils.drawLandmarks(
        canvasCtx,
        Object.values(mpPose.POSE_LANDMARKS_RIGHT)
            .map(index => results.poseLandmarks[index]),
        {visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)'});
    drawingUtils.drawLandmarks(
        canvasCtx,
        Object.values(mpPose.POSE_LANDMARKS_NEUTRAL)
            .map(index => results.poseLandmarks[index]),
        {visibilityMin: 0.65, color: 'white', fillColor: 'white'});
    drawingUtils.drawLandmarks(
        canvasCtx,
        Object.values(mpPose.POSE_LANDMARKS_NEUTRAL)
            .map(index => results.poseLandmarks[index]),
        {visibilityMin: 0.65, color: 'white', fillColor: 'white'});
    
  }
  canvasCtx.restore();
  
 
  
  
  if (results.poseWorldLandmarks) {
    grid.updateLandmarks(results.poseWorldLandmarks, mpPose.POSE_CONNECTIONS, [
      {list: Object.values(mpPose.POSE_LANDMARKS_LEFT), color: 'LEFT'},
      {list: Object.values(mpPose.POSE_LANDMARKS_RIGHT), color: 'RIGHT'},
     ]);
     
    //Timer
    document.getElementById('start').addEventListener('click', ()=>{
      timer = "start";
    });
    
    document.getElementById('stop').addEventListener('click', ()=>{
      i = 0;
      stopTime = Date.now();
      timer = "stop";
    });
    
    document.getElementById('reset').addEventListener('click', ()=>{
      timer = "reset";
    });
    
    if (timer == "start") {
      if (timestamp == 0) {
          startTime = Date.now();
          timestamp = timestamp + 0.001;
          } else if (i == 0) {
            differenceCalculated = differenceCalculated + differenceTime;
            i = i + 1;
          } else {
          timestamp = ((Date.now() - startTime)/1000) - (differenceCalculated);
          }
      } else if (timer == "reset") {
        timestamp = 0;
        differenceTime = 0;
        differenceCalculated = 0;
        i = 0;
        t = 0;
        AngularVel = 0;
        
      } else if (timer == "stop") {
        differenceTime = ((Date.now() - stopTime) / 1000);
        } 
      
    document.getElementById("time").innerHTML=("Time: " + Math.round(timestamp * 100)/100 + " sec");    
    
//Math for Arm Angle
    angleX = (results.poseWorldLandmarks[15].x)-(results.poseWorldLandmarks[13].x);
    angleY = (results.poseWorldLandmarks[15].y)-(results.poseWorldLandmarks[13].y);
    theta = math.atan(angleY / angleX);
    
    if (angleX > 0 && angleY > 0) {
      composedAngle = (2 *Math.PI) - theta ;
    } else if (angleX < 0 && angleY > 0 || angleX < 0 && angleY < 0){
      composedAngle = (Math.PI - theta);
    } else if (angleX > 0 && angleY< 0){
      composedAngle = -theta;
    }
    document.getElementById("Angle").innerHTML=("Angle: " + Math.round(composedAngle*1000)/1000 + " rad");

    //Angular Velocity
    if (t == 0) {
      time1 = timestamp;
      angle1 = composedAngle;
      t++;
    } else if (timer == "start" && t < 2) {
      t++;
    } else if (t>=2) {
      time2 = timestamp;
      angle2 = composedAngle;
      AngularVel = (angle2-angle1)/(time2-time1);
      t = 0;
    }
    document.getElementById("T").innerHTML=("Angular Vel: " + Math.round(AngularVel*1000)/1000 + " rad/s");
    
//   var canvas = document.getElementById("outputcanvas");
//   var ctx = canvas.getContext("2d");
//   ctx.beginPath();
//   ctx.arc((canvasElement.width*(PCOM[0])),(canvasElement.height*(PCOM[0])),10,0,2*Math.PI);
//   ctx.fillStyle = "#FF0000";
//   ctx.stroke();
    
    FaceCOMx =(results.poseWorldLandmarks[0].x+results.poseWorldLandmarks[1].x+results.poseWorldLandmarks[2].x+results.poseWorldLandmarks[3].x+results.poseWorldLandmarks[4].x+results.poseWorldLandmarks[5].x+results.poseWorldLandmarks[6].x+results.poseWorldLandmarks[7].x+results.poseWorldLandmarks[8].x+results.poseWorldLandmarks[9].x+results.poseWorldLandmarks[10].x)/11;
    FaceCOMy =(results.poseWorldLandmarks[0].y+results.poseWorldLandmarks[1].y+results.poseWorldLandmarks[2].y+results.poseWorldLandmarks[3].y+results.poseWorldLandmarks[4].y+results.poseWorldLandmarks[5].y+results.poseWorldLandmarks[6].y+results.poseWorldLandmarks[7].y+results.poseWorldLandmarks[8].y+results.poseWorldLandmarks[9].y+results.poseWorldLandmarks[10].y)/11;
    FaceCOMz = (results.poseWorldLandmarks[0].z+results.poseWorldLandmarks[1].z+results.poseWorldLandmarks[2].z+results.poseWorldLandmarks[3].z+results.poseWorldLandmarks[4].z+results.poseWorldLandmarks[5].z+results.poseWorldLandmarks[6].z+results.poseWorldLandmarks[7].z+results.poseWorldLandmarks[8].z+results.poseWorldLandmarks[9].z+results.poseWorldLandmarks[10].z)/11;
    let FaceCOM = [FaceCOMx*FaceCoefficient, FaceCOMy*FaceCoefficient, FaceCOMz*FaceCoefficient];
    
    TorsoCOMx =(results.poseWorldLandmarks[11].x+results.poseWorldLandmarks[12].x+results.poseWorldLandmarks[23].x+results.poseWorldLandmarks[24].x)/4;
    TorsoCOMy =(results.poseWorldLandmarks[11].y+results.poseWorldLandmarks[12].y+results.poseWorldLandmarks[23].y+results.poseWorldLandmarks[24].y)/4;
    TorsoCOMz =(results.poseWorldLandmarks[11].z+results.poseWorldLandmarks[12].z+results.poseWorldLandmarks[23].z+results.poseWorldLandmarks[24].z)/4;
    let TorsoCOM = [TorsoCOMx*TorsoCoefficient, TorsoCOMy*TorsoCoefficient, TorsoCOMz*TorsoCoefficient];
    
    LeftUpperArmx = (results.poseWorldLandmarks[11].x+results.poseWorldLandmarks[13].x)/2;
    LeftUpperArmy = (results.poseWorldLandmarks[11].y+results.poseWorldLandmarks[13].y)/2;
    LeftUpperArmz = (results.poseWorldLandmarks[11].z+results.poseWorldLandmarks[13].z)/2;
    let LeftUpperArmCOM = [LeftUpperArmx*LeftUpperArmCoefficient, LeftUpperArmy*LeftUpperArmCoefficient, LeftUpperArmz*LeftUpperArmCoefficient];
    
    RightUpperArmx =(results.poseWorldLandmarks[12].x+results.poseWorldLandmarks[14].x)/2;
    RightUpperArmy =(results.poseWorldLandmarks[12].y+results.poseWorldLandmarks[14].y)/2;
    RightUpperArmz =(results.poseWorldLandmarks[12].z+results.poseWorldLandmarks[14].z)/2;
    let RightUpperArmCOM = [RightUpperArmx*RightUpperArmCoefficient, RightUpperArmy*RightUpperArmCoefficient, RightUpperArmz*RightUpperArmCoefficient];
    
    LeftLowerArmx = (results.poseWorldLandmarks[13].x+results.poseWorldLandmarks[15].x)/2;
    LeftLowerArmy = (results.poseWorldLandmarks[13].y+results.poseWorldLandmarks[15].y)/2;
    LeftLowerArmz = (results.poseWorldLandmarks[13].z+results.poseWorldLandmarks[15].z)/2;
    let LeftLowerArmCOM = [LeftLowerArmx*LeftLowerArmCoefficient, LeftLowerArmy*LeftLowerArmCoefficient, LeftLowerArmz*LeftLowerArmCoefficient];
    
    RightLowerArmx = (results.poseWorldLandmarks[14].x+results.poseWorldLandmarks[16].x)/2;
    RightLowerArmy = (results.poseWorldLandmarks[14].y+results.poseWorldLandmarks[16].y)/2;
    RightLowerArmz = (results.poseWorldLandmarks[14].z+results.poseWorldLandmarks[16].z)/2;
    let RightLowerArmCOM = [RightLowerArmx*RightLowerArmCoefficient, RightLowerArmy*RightLowerArmCoefficient, RightLowerArmz*RightLowerArmCoefficient];
    
    LeftHandx = (results.poseWorldLandmarks[15].x+results.poseWorldLandmarks[17].x+results.poseWorldLandmarks[19].x+results.poseWorldLandmarks[21].x)/4;
    LeftHandy = (results.poseWorldLandmarks[15].y+results.poseWorldLandmarks[17].y+results.poseWorldLandmarks[19].y+results.poseWorldLandmarks[21].y)/4;
    LeftHandz = (results.poseWorldLandmarks[15].z+results.poseWorldLandmarks[17].z+results.poseWorldLandmarks[19].z+results.poseWorldLandmarks[21].z)/4;
    let LeftHandCOM = [LeftHandx*LeftHandCoefficient, LeftHandy*LeftHandCoefficient, LeftHandz*LeftHandCoefficient];
    
    RightHandx = (results.poseWorldLandmarks[16].x+results.poseWorldLandmarks[18].x+results.poseWorldLandmarks[20].x+results.poseWorldLandmarks[22].x)/4;
    RightHandy = (results.poseWorldLandmarks[16].y+results.poseWorldLandmarks[18].y+results.poseWorldLandmarks[20].y+results.poseWorldLandmarks[22].y)/4;
    RightHandz = (results.poseWorldLandmarks[16].z+results.poseWorldLandmarks[18].z+results.poseWorldLandmarks[20].z+results.poseWorldLandmarks[22].z)/4;
    let RightHandCOM = [RightHandx*RightHandCoefficient, RightHandy*RightHandCoefficient, RightHandz*RightHandCoefficient];
    
    LeftThighx = (results.poseWorldLandmarks[23].x+results.poseWorldLandmarks[25].x)/2;
    LeftThighy = (results.poseWorldLandmarks[23].y+results.poseWorldLandmarks[25].y)/2;
    LeftThighz = (results.poseWorldLandmarks[23].z+results.poseWorldLandmarks[25].z)/2;
    let LeftThighCOM = [LeftThighx*LeftThighCoefficient, LeftThighy*LeftThighCoefficient, LeftThighz*LeftThighCoefficient];

    RightThighx = (results.poseWorldLandmarks[24].x+results.poseWorldLandmarks[26].x)/2;
    RightThighy = (results.poseWorldLandmarks[24].y+results.poseWorldLandmarks[26].y)/2;
    RightThighz = (results.poseWorldLandmarks[24].z+results.poseWorldLandmarks[26].z)/2;
    let RightThighCOM = [RightThighx*RightThighCoefficient, RightThighy*RightThighCoefficient, RightThighz*RightThighCoefficient];

    LeftCalfx = (results.poseWorldLandmarks[25].x+results.poseWorldLandmarks[27].x)/2;
    LeftCalfy = (results.poseWorldLandmarks[25].y+results.poseWorldLandmarks[27].y)/2;
    LeftCalfz = (results.poseWorldLandmarks[25].z+results.poseWorldLandmarks[27].z)/2;
    let LeftCalfCOM = [LeftCalfx*LeftCalfCoefficient, LeftCalfy*LeftCalfCoefficient, LeftCalfz*LeftCalfCoefficient];

    RightCalfx = (results.poseWorldLandmarks[26].x+results.poseWorldLandmarks[28].x)/2;
    RightCalfy = (results.poseWorldLandmarks[26].y+results.poseWorldLandmarks[28].y)/2;
    RightCalfz = (results.poseWorldLandmarks[26].z+results.poseWorldLandmarks[28].z)/2;
    let RightCalfCOM = [RightCalfx*RightCalfCoefficient, RightCalfy*RightCalfCoefficient, RightCalfz*RightCalfCoefficient];

    LeftFootx = (results.poseWorldLandmarks[27].x+results.poseWorldLandmarks[29].x+results.poseWorldLandmarks[31].x)/3;
    LeftFooty = (results.poseWorldLandmarks[27].y+results.poseWorldLandmarks[29].y+results.poseWorldLandmarks[31].y)/3;
    LeftFootz = (results.poseWorldLandmarks[27].z+results.poseWorldLandmarks[29].z+results.poseWorldLandmarks[31].z)/3;
    let LeftFootCOM = [LeftFootx*LeftFootCoefficient, LeftFooty*LeftFootCoefficient, LeftFootz*LeftFootCoefficient];

    RightFootx = (results.poseWorldLandmarks[28].x+results.poseWorldLandmarks[30].x+results.poseWorldLandmarks[32].x)/3;
    RightFooty = (results.poseWorldLandmarks[28].x+results.poseWorldLandmarks[30].x+results.poseWorldLandmarks[32].x)/3;
    RightFootz = (results.poseWorldLandmarks[28].x+results.poseWorldLandmarks[30].x+results.poseWorldLandmarks[32].x)/3;
    let RightFootCOM=[RightFootx*RightFootCoefficient, RightFooty*RightFootCoefficient, RightFootz*RightFootCoefficient];
    
   let COM = [FaceCOM[0] + TorsoCOM[0] + LeftUpperArmCOM[0] + RightUpperArmCOM[0] + LeftLowerArmCOM[0] + RightLowerArmCOM[0] + LeftHandCOM[0] + RightHandCOM[0] + LeftThighCOM[0] + RightThighCOM[0] + LeftCalfCOM[0] + RightCalfCOM[0] + LeftFootCOM[0] + RightFootCOM[0], FaceCOM[1] + TorsoCOM[1] + LeftUpperArmCOM[1] + RightUpperArmCOM[1] + LeftLowerArmCOM[1] + RightLowerArmCOM[1] + LeftHandCOM[1] + RightHandCOM[1] + LeftThighCOM[1] + RightThighCOM[1] + LeftCalfCOM[1] + RightCalfCOM[1] + LeftFootCOM[1] + RightFootCOM[1], FaceCOM[2] + TorsoCOM[2] + LeftUpperArmCOM[2] + RightUpperArmCOM[2] + LeftLowerArmCOM[2] + RightLowerArmCOM[2] + LeftHandCOM[2] + RightHandCOM[2] + LeftThighCOM[2] + RightThighCOM[2] + LeftCalfCOM[2] + RightCalfCOM[2] + LeftFootCOM[2] + RightFootCOM[2]];
    
//pcom
    
    pFaceCOMx =(results.poseLandmarks[0].x+results.poseLandmarks[1].x+results.poseLandmarks[2].x+results.poseLandmarks[3].x+results.poseLandmarks[4].x+results.poseLandmarks[5].x+results.poseLandmarks[6].x+results.poseLandmarks[7].x+results.poseLandmarks[8].x+results.poseLandmarks[9].x+results.poseLandmarks[10].x)/11;
    pFaceCOMy =(results.poseLandmarks[0].y+results.poseLandmarks[1].y+results.poseLandmarks[2].y+results.poseLandmarks[3].y+results.poseLandmarks[4].y+results.poseLandmarks[5].y+results.poseLandmarks[6].y+results.poseLandmarks[7].y+results.poseLandmarks[8].y+results.poseLandmarks[9].y+results.poseLandmarks[10].y)/11;
    pFaceCOMz = (results.poseLandmarks[0].z+results.poseLandmarks[1].z+results.poseLandmarks[2].z+results.poseLandmarks[3].z+results.poseLandmarks[4].z+results.poseLandmarks[5].z+results.poseLandmarks[6].z+results.poseLandmarks[7].z+results.poseLandmarks[8].z+results.poseLandmarks[9].z+results.poseLandmarks[10].z)/11;
    let pFaceCOM = [pFaceCOMx*FaceCoefficient, pFaceCOMy*FaceCoefficient, pFaceCOMz*FaceCoefficient];
    
    pTorsoCOMx =(results.poseLandmarks[11].x+results.poseLandmarks[12].x+results.poseLandmarks[23].x+results.poseLandmarks[24].x)/4;
    pTorsoCOMy =(results.poseLandmarks[11].y+results.poseLandmarks[12].y+results.poseLandmarks[23].y+results.poseLandmarks[24].y)/4;
    pTorsoCOMz =(results.poseLandmarks[11].z+results.poseLandmarks[12].z+results.poseLandmarks[23].z+results.poseLandmarks[24].z)/4;
    let pTorsoCOM = [pTorsoCOMx*TorsoCoefficient, pTorsoCOMy*TorsoCoefficient, pTorsoCOMz*TorsoCoefficient];
    
    pLeftUpperArmx = (results.poseLandmarks[11].x+results.poseLandmarks[13].x)/2;
    pLeftUpperArmy = (results.poseLandmarks[11].y+results.poseLandmarks[13].y)/2;
    pLeftUpperArmz = (results.poseLandmarks[11].z+results.poseLandmarks[13].z)/2;
    let pLeftUpperArmCOM = [pLeftUpperArmx*LeftUpperArmCoefficient, pLeftUpperArmy*LeftUpperArmCoefficient, pLeftUpperArmz*LeftUpperArmCoefficient];
    
    pRightUpperArmx =(results.poseLandmarks[12].x+results.poseLandmarks[14].x)/2;
    pRightUpperArmy =(results.poseLandmarks[12].y+results.poseLandmarks[14].y)/2;
    pRightUpperArmz =(results.poseLandmarks[12].z+results.poseLandmarks[14].z)/2;
    let pRightUpperArmCOM = [pRightUpperArmx*RightUpperArmCoefficient, pRightUpperArmy*RightUpperArmCoefficient, pRightUpperArmz*RightUpperArmCoefficient];
    
    pLeftLowerArmx = (results.poseLandmarks[13].x+results.poseLandmarks[15].x)/2;
    pLeftLowerArmy = (results.poseLandmarks[13].y+results.poseLandmarks[15].y)/2;
    pLeftLowerArmz = (results.poseLandmarks[13].z+results.poseLandmarks[15].z)/2;
    let pLeftLowerArmCOM = [pLeftLowerArmx*LeftLowerArmCoefficient, pLeftLowerArmy*LeftLowerArmCoefficient, pLeftLowerArmz*LeftLowerArmCoefficient];
    
    pRightLowerArmx = (results.poseLandmarks[14].x+results.poseLandmarks[16].x)/2;
    pRightLowerArmy = (results.poseLandmarks[14].y+results.poseLandmarks[16].y)/2;
    pRightLowerArmz = (results.poseLandmarks[14].z+results.poseLandmarks[16].z)/2;
    let pRightLowerArmCOM = [pRightLowerArmx*RightLowerArmCoefficient, pRightLowerArmy*RightLowerArmCoefficient, pRightLowerArmz*RightLowerArmCoefficient];
    
    pLeftHandx = (results.poseLandmarks[15].x+results.poseLandmarks[17].x+results.poseLandmarks[19].x+results.poseLandmarks[21].x)/4;
    pLeftHandy = (results.poseLandmarks[15].y+results.poseLandmarks[17].y+results.poseLandmarks[19].y+results.poseLandmarks[21].y)/4;
    pLeftHandz = (results.poseLandmarks[15].z+results.poseLandmarks[17].z+results.poseLandmarks[19].z+results.poseLandmarks[21].z)/4;
    let pLeftHandCOM = [pLeftHandx*LeftHandCoefficient, pLeftHandy*LeftHandCoefficient, pLeftHandz*LeftHandCoefficient];
    
    pRightHandx = (results.poseLandmarks[16].x+results.poseLandmarks[18].x+results.poseLandmarks[20].x+results.poseLandmarks[22].x)/4;
    pRightHandy = (results.poseLandmarks[16].y+results.poseLandmarks[18].y+results.poseLandmarks[20].y+results.poseLandmarks[22].y)/4;
    pRightHandz = (results.poseLandmarks[16].z+results.poseLandmarks[18].z+results.poseLandmarks[20].z+results.poseLandmarks[22].z)/4;
    let pRightHandCOM = [pRightHandx*RightHandCoefficient, pRightHandy*RightHandCoefficient, pRightHandz*RightHandCoefficient];
    
    pLeftThighx = (results.poseLandmarks[23].x+results.poseLandmarks[25].x)/2;
    pLeftThighy = (results.poseLandmarks[23].y+results.poseLandmarks[25].y)/2;
    pLeftThighz = (results.poseLandmarks[23].z+results.poseLandmarks[25].z)/2;
    let pLeftThighCOM = [pLeftThighx*LeftThighCoefficient, pLeftThighy*LeftThighCoefficient, pLeftThighz*LeftThighCoefficient];

    pRightThighx = (results.poseLandmarks[24].x+results.poseLandmarks[26].x)/2;
    pRightThighy = (results.poseLandmarks[24].y+results.poseLandmarks[26].y)/2;
    pRightThighz = (results.poseLandmarks[24].z+results.poseLandmarks[26].z)/2;
    let pRightThighCOM = [pRightThighx*RightThighCoefficient, pRightThighy*RightThighCoefficient, pRightThighz*RightThighCoefficient];

    pLeftCalfx = (results.poseLandmarks[25].x+results.poseLandmarks[27].x)/2;
    pLeftCalfy = (results.poseLandmarks[25].y+results.poseLandmarks[27].y)/2;
    pLeftCalfz = (results.poseLandmarks[25].z+results.poseLandmarks[27].z)/2;
    let pLeftCalfCOM = [pLeftCalfx*LeftCalfCoefficient, pLeftCalfy*LeftCalfCoefficient, pLeftCalfz*LeftCalfCoefficient];

    pRightCalfx = (results.poseLandmarks[26].x+results.poseLandmarks[28].x)/2;
    pRightCalfy = (results.poseLandmarks[26].y+results.poseLandmarks[28].y)/2;
    pRightCalfz = (results.poseLandmarks[26].z+results.poseLandmarks[28].z)/2;
    let pRightCalfCOM = [pRightCalfx*RightCalfCoefficient, pRightCalfy*RightCalfCoefficient, pRightCalfz*RightCalfCoefficient];

    pLeftFootx = (results.poseLandmarks[27].x+results.poseLandmarks[29].x+results.poseLandmarks[31].x)/3;
    pLeftFooty = (results.poseLandmarks[27].y+results.poseLandmarks[29].y+results.poseLandmarks[31].y)/3;
    pLeftFootz = (results.poseLandmarks[27].z+results.poseLandmarks[29].z+results.poseLandmarks[31].z)/3;
    let pLeftFootCOM = [pLeftFootx*LeftFootCoefficient, pLeftFooty*LeftFootCoefficient, pLeftFootz*LeftFootCoefficient];

    pRightFootx = (results.poseLandmarks[28].x+results.poseLandmarks[30].x+results.poseLandmarks[32].x)/3;
    pRightFooty = (results.poseLandmarks[28].x+results.poseLandmarks[30].x+results.poseLandmarks[32].x)/3;
    pRightFootz = (results.poseLandmarks[28].x+results.poseLandmarks[30].x+results.poseLandmarks[32].x)/3;
    let pRightFootCOM=[pRightFootx*RightFootCoefficient, pRightFooty*RightFootCoefficient, pRightFootz*RightFootCoefficient];
    
    let PCOM = [pFaceCOM[0] + pTorsoCOM[0] + pLeftUpperArmCOM[0] + pRightUpperArmCOM[0] + pLeftLowerArmCOM[0] + pRightLowerArmCOM[0] + pLeftHandCOM[0] + pRightHandCOM[0] + pLeftThighCOM[0] + pRightThighCOM[0] + pLeftCalfCOM[0] + pRightCalfCOM[0] + pLeftFootCOM[0] + pRightFootCOM[0], pFaceCOM[1] + pTorsoCOM[1] + pLeftUpperArmCOM[1] + pRightUpperArmCOM[1] + pLeftLowerArmCOM[1] + pRightLowerArmCOM[1] + pLeftHandCOM[1] + pRightHandCOM[1] + pLeftThighCOM[1] + pRightThighCOM[1] + pLeftCalfCOM[1] + pRightCalfCOM[1] + pLeftFootCOM[1] + pRightFootCOM[1], pFaceCOM[2] + pTorsoCOM[2] + pLeftUpperArmCOM[2] + pRightUpperArmCOM[2] + pLeftLowerArmCOM[2] + pRightLowerArmCOM[2] + pLeftHandCOM[2] + pRightHandCOM[2] + pLeftThighCOM[2] + pRightThighCOM[2] + pLeftCalfCOM[2] + pRightCalfCOM[2] + pLeftFootCOM[2] + pRightFootCOM[2]];
    
    
    //finalizing and declaring comout
    
    let FCOM = [Math.round(COM[0] * 10000)/100 , Math.round(COM[0] * 10000)/100, Math.round(COM[0] * 10000)/100];
    // document.getElementById("comout").innerHTML=("COM (cm): " + "("+ FCOM[0] + ", " + FCOM[1] + ", " + FCOM[2]+ ")");
    
    //plotting (P)COM
  var r = 10;
  var canvas = document.getElementById("outputcanvas");
  var ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc((canvasElement.width*(PCOM[0])),(canvasElement.height*PCOM[1]),(r),0,2*Math.PI);
  ctx.fillStyle = "red";
  ctx.fillStyle = "red";
  ctx.stroke();
  ctx.fill();
    
  } else {
    grid.updateLandmarks([]);
  }
}

const pose = new mpPose.Pose(options);
pose.onResults(onResults);

// Present a control panel through which the user can manipulate the solution
// options.
new controls
    .ControlPanel(controlsElement, {
      selfieMode: true,
      arm: 'left',
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
//      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
//      effect: 'background',
    })
    .add([
      //new controls.StaticText({title: 'Center of Mass Demo'}),
      fpsControl,
      //new controls.Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new controls.SourcePicker({
        onSourceChanged: () => {
          // Resets because this model gives better results when reset between
          // source changes.
          pose.reset();
        },
        onFrame:
            async (input: controls.InputImage, size: controls.Rectangle) => {
              const aspect = size.height / size.width;
              let width: number, height: number;
              if (window.innerWidth > window.innerHeight) {
                height = window.innerHeight;
                width = height / aspect;
              } else {
                width = window.innerWidth;
                height = width * aspect;
              }
              canvasElement.width = width;
              canvasElement.height = height;
              await pose.send({image: input});
            },
      }),
      // new controls.Slider({
      //   title: 'Model Complexity',
      //   field: 'modelComplexity',
      //   discrete: ['Lite', 'Full', 'Heavy'],
      //}),
     // new controls.Toggle(
     //     {title: 'Arm', field: 'arm'}),
//      new controls.Toggle(
//          {title: 'Enable Segmentation', field: 'enableSegmentation'}),
     // new controls.Toggle(
     //     {title: 'Smooth Segmentation', field: 'smoothSegmentation'}),
      // new controls.Slider({
      //   title: 'Min Detection Confidence',
      //   field: 'minDetectionConfidence',
      //   range: [0, 1],
      //   step: 0.01
      // }),
      // new controls.Slider({
      //   title: 'Min Tracking Confidence',
      //   field: 'minTrackingConfidence',
      //   range: [0, 1],
      //   step: 0.01
      // })
  // ,
  
  //Left-Right Arm Control
      // new controls.Slider({
      //   title: 'Pick Arm L/R',
      //   field: 'arm',
      //   discrete: {'left': 'Left', 'right': 'Right'},
      // }),
    ])
    .on(x => {
      const options = x as mpPose.Options;
      videoElement.classList.toggle('selfie', options.selfieMode);
      activeEffect = (x as {[key: string]: string})['effect'];
      pose.setOptions(options);
    });
