// let model;
// let webcamStream = null;
// let webcamInterval = null;

// const labels = [
//   "cats",
//   "dogs",
//   "snakes",
//   // 🧠 ADD MORE CLASSES HERE
// ];

// const CONFIDENCE_THRESHOLD = 0.7;

// // 🔊 Voice feedback
// const speak = (text) => {
//   const msg = new SpeechSynthesisUtterance(text);
//   speechSynthesis.speak(msg);
// };

// // Load model
// async function loadModel() {
//   model = await tf.loadGraphModel("./tfjs_model/model.json");
//   document.getElementById("status").innerText = "Model loaded ✅";
// }

// // Preprocess
// function preprocess(img) {
//   return tf.browser
//     .fromPixels(img)
//     .resizeNearestNeighbor([224, 224])
//     .toFloat()
//     .div(255)
//     .expandDims();
// }

// // Predict
// async function predict(img) {
//   const tensor = preprocess(img);
//   const preds = model.predict(tensor);
//   const probs = preds.dataSync();

//   const index = probs.indexOf(Math.max(...probs));
//   const confidence = probs[index];
//   let label = labels[index] || "Unknown";

//   if (confidence < CONFIDENCE_THRESHOLD) label = "Unknown";

//   const text = `${label} (${(confidence * 100).toFixed(1)}%)`;
//   const result = document.getElementById("result");

//   result.innerText = text;
//   result.className =
//     confidence >= 0.85 ? "high" : confidence >= 0.7 ? "medium" : "low";

//   addHistory(text);
//   speak(label);

//   tf.dispose([tensor, preds]);
// }

// // Image upload
// document.getElementById("imageUpload").addEventListener("change", (e) => {
//   stopWebcam();

//   const img = new Image();
//   img.onload = () => predict(img);
//   img.src = URL.createObjectURL(e.target.files[0]);

//   const preview = document.getElementById("preview");
//   preview.src = img.src;
//   preview.hidden = false;
// });

// // Webcam toggle
// document.getElementById("webcamBtn").onclick = async () => {
//   if (!webcamStream) {
//     webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
//     const video = document.getElementById("webcam");

//     video.srcObject = webcamStream;
//     video.hidden = false;

//     document.getElementById("snapshotBtn").hidden = false;
//     document.getElementById("webcamBtn").innerText = "Stop Webcam";

//     webcamInterval = setInterval(() => predict(video), 900);
//   } else {
//     stopWebcam();
//   }
// };

// // Snapshot
// document.getElementById("snapshotBtn").onclick = () => {
//   const video = document.getElementById("webcam");
//   const canvas = document.createElement("canvas");

//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;
//   canvas.getContext("2d").drawImage(video, 0, 0);

//   const img = new Image();
//   img.onload = () => predict(img);
//   img.src = canvas.toDataURL();

//   const preview = document.getElementById("preview");
//   preview.src = img.src;
//   preview.hidden = false;
// };

// // Stop webcam
// function stopWebcam() {
//   if (webcamStream) {
//     webcamStream.getTracks().forEach((t) => t.stop());
//     webcamStream = null;
//     clearInterval(webcamInterval);

//     document.getElementById("webcam").hidden = true;
//     document.getElementById("snapshotBtn").hidden = true;
//     document.getElementById("webcamBtn").innerText = "Start Webcam";
//   }
// }

// // History
// function addHistory(text) {
//   const li = document.createElement("li");
//   li.innerText = text;
//   document.getElementById("historyList").prepend(li);
// }

// // Reset history
// document.getElementById("clearHistory").onclick = () => {
//   document.getElementById("historyList").innerHTML = "";
// };

// loadModel();

// // Register service worker
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker.register("service-worker.js");
// }
let model = null;
let modelLoaded = false;
let webcamStream = null;
let webcamInterval = null;

const labels = [
  "cats",
  "dogs",
  "snakes",
  // 🧠 ADD MORE CLASSES HERE
];

const CONFIDENCE_THRESHOLD = 0.7;

// 🔊 Voice feedback
const speak = (text) => {
  if (!("speechSynthesis" in window)) return;
  const msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(msg);
};

// ✅ Load model (SAFE)
async function loadModel() {
  try {
    await tf.ready();
    model = await tf.loadGraphModel("./tfjs_model/model.json");
    modelLoaded = true;
    document.getElementById("status").innerText = "Model loaded ✅";
    console.log("✅ Model loaded successfully");
  } catch (err) {
    console.error("❌ Model failed to load:", err);
    document.getElementById("status").innerText = "Model load failed ❌";
  }
}

// Preprocess image
function preprocess(img) {
  return tf.browser
    .fromPixels(img)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(255)
    .expandDims();
}

// ✅ Predict (SAFE for GraphModel)
async function predict(img) {
  if (!modelLoaded || !model) {
    console.warn("⚠️ Model not ready yet");
    return;
  }

  const tensor = preprocess(img);

  let output;
  if (model.execute) {
    output = model.execute(tensor);
  } else {
    output = model.predict(tensor);
  }

  const probs = output.dataSync();
  const index = probs.indexOf(Math.max(...probs));
  const confidence = probs[index];
  let label = labels[index] || "Unknown";

  if (confidence < CONFIDENCE_THRESHOLD) label = "Unknown";

  const text = `${label} (${(confidence * 100).toFixed(1)}%)`;

  const result = document.getElementById("result");
  result.innerText = text;
  result.className =
    confidence >= 0.85 ? "high" : confidence >= 0.7 ? "medium" : "low";

  addHistory(text);
  speak(label);

  tf.dispose([tensor, output]);
}

// Image upload
document.getElementById("imageUpload").addEventListener("change", (e) => {
  stopWebcam();

  const img = new Image();
  img.onload = () => predict(img);
  img.src = URL.createObjectURL(e.target.files[0]);

  const preview = document.getElementById("preview");
  preview.src = img.src;
  preview.hidden = false;
});

// Webcam toggle
document.getElementById("webcamBtn").onclick = async () => {
  if (!modelLoaded) {
    alert("Model is still loading. Please wait.");
    return;
  }

  if (!webcamStream) {
    webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById("webcam");

    video.srcObject = webcamStream;
    video.hidden = false;

    document.getElementById("snapshotBtn").hidden = false;
    document.getElementById("webcamBtn").innerText = "Stop Webcam";

    webcamInterval = setInterval(() => predict(video), 900);
  } else {
    stopWebcam();
  }
};

// Snapshot
document.getElementById("snapshotBtn").onclick = () => {
  const video = document.getElementById("webcam");
  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  const img = new Image();
  img.onload = () => predict(img);
  img.src = canvas.toDataURL();

  const preview = document.getElementById("preview");
  preview.src = img.src;
  preview.hidden = false;
};

// Stop webcam
function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach((t) => t.stop());
    webcamStream = null;
    clearInterval(webcamInterval);

    document.getElementById("webcam").hidden = true;
    document.getElementById("snapshotBtn").hidden = true;
    document.getElementById("webcamBtn").innerText = "Start Webcam";
  }
}

// History
function addHistory(text) {
  const li = document.createElement("li");
  li.innerText = text;
  document.getElementById("historyList").prepend(li);
}

// Reset history
document.getElementById("clearHistory").onclick = () => {
  document.getElementById("historyList").innerHTML = "";
};

// ✅ Load model only after page is ready
window.onload = async () => {
  await loadModel();
};

// Service worker (optional)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
