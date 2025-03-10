// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//      http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

import * as tf from '@tensorflow/tfjs';
import * as depthEstimation from '@tensorflow-models/depth-estimation';

const demosSection = document.getElementById("demos");

let handLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;

const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
      },
      runningMode: runningMode,
      numHands: 2
  });
  demosSection.classList.remove("invisible");
};
createHandLandmarker();


/**
 * DEPTH ESTIMATOR
 */
let estimator;

async function loadDepthEstimator() {
  console.log(depthEstimation)
  
  const model = depthEstimation.SupportedModels.ARPortraitDepth;
  estimator = await depthEstimation.createEstimator(model);
}

loadDepthEstimator()

const estimationConfig = {
  minDepth: 0,
  maxDepth: 10,
}

async function estimateDepth(videoElement) {
  if (!estimator) {
      console.error("Depth model not loaded!")
      return
  }

  // Run depth estimation on video frame
  const depthMap = await estimator.estimateDepth(videoElement, estimationConfig)

  return depthMap // Returns a TensorFlow.js tensor image
}



async function renderDepth(video, canvas) {
  const depthMap = await estimateDepth(video)
  if (!depthMap) return


  const ctx = canvas.getContext("2d")
  const depthTensor = await depthMap.toTensor()
  const depthArray = await depthTensor.data()

  console.log(depthArray)
  

  const videoWidth = video.videoWidth
  const videoHeight = video.videoHeight

  // // Normalize depth for visualization
  // const minDepth = Math.min(...depthArray)
  // const maxDepth = Math.max(...depthArray)
  // const depthRange = maxDepth - minDepth

  const imageData = ctx.createImageData(videoWidth, videoHeight)

  for (let i = 0; i < depthArray.length; i++) {
      // const normalizedDepth = ((depthArray[i] - minDepth) / depthRange) * 255
      const normalizedDepth = depthArray[i]
      imageData.data[i * 4] = normalizedDepth  // Red channel
      imageData.data[i * 4 + 1] = normalizedDepth  // Green channel
      imageData.data[i * 4 + 2] = normalizedDepth  // Blue channel
      imageData.data[i * 4 + 3] = 255  // Alpha (fully visible)
  }

  ctx.putImageData(imageData, 0, 0)
}



async function getHandDepth(video, wristLandmark) {
  if (!estimator || !wristLandmark) return

  console.log(wristLandmark)
  

  const depthMap = await estimateDepth(video)
  if (!depthMap) return

  const depthTensor = await depthMap.toTensor()
  const depthArray = await depthTensor.data()

  const videoWidth = video.videoWidth
  const videoHeight = video.videoHeight

  // Convert wrist landmark (normalized 0-1) to pixel coordinates
  const x = Math.round(wristLandmark.x * videoWidth)
  const y = Math.round(wristLandmark.y * videoHeight)

  // Get depth value at wrist position
  const depthIndex = y * videoWidth + x

  
  const depthValue = depthArray[depthIndex] || 0 // Avoid undefined errors

  console.log("Wrist Depth:", depthValue) // ✅ Log wrist depth continuously

  return depthValue
}



const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

function enableCam(event) {
  if (!handLandmarker) {
      console.log("Wait! objectDetector not loaded yet.");
      return;
  }

  webcamRunning = !webcamRunning;
  // enableWebcamButton.innerText = webcamRunning ? "DISABLE PREDICTIONS" : "ENABLE PREDICTIONS";

  enableWebcamButton.style.display = "none";

  const constraints = {
      video: true
  };

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
  });
}



let lastVideoTime = -1;
let results = undefined;
console.log(video);
async function predictWebcam() {
  canvasElement.style.width = video.videoWidth;
  canvasElement.style.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;

  if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await handLandmarker.setOptions({ runningMode: "VIDEO" });
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      results = handLandmarker.detectForVideo(video, startTimeMs);
  }

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if (results.landmarks) {
      for (const landmarks of results.landmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 5
          });
          drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
  }

  if (results.worldLandmarks) {
    // console.log(results.worldLandmarks)



    if (results.worldLandmarks[0] && results.worldLandmarks[0].length === 21) {
      const landmarks = results.worldLandmarks[0]
      // console.log(landmarks)
      window.createSphereAtHand(landmarks)

      let wristLandmark = landmarks[0]
      // await renderDepth(video, canvasElement)
    }

    
    // const landmarks = results.worldLandmarks[0]
    // console.log(landmarks[0])

    // const palm = landmarks[0] // Wrist position (or use fingertip, etc.)

    // // Scale coordinates to fit Three.js world
    // const x = palm.x * 5
    // const y = palm.y * 5
    // const z = palm.z * 5

    // // Call the function in threeScript.js
    // if (window.createSphereAtHand) {
    //   console.log(window.createSphereAtHand)
      
    //     window.createSphereAtHand(x, y, z)
    // }

    
  }
  canvasCtx.restore();

  if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
  }
}
