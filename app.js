let model = null;
let modelReady = false;

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
  speechSynthesis.cancel();
  speechSynthesis.speak(msg);
};

// ✅ LOAD MODEL (LAYERS MODEL — CORRECT)
async function loadModel() {
  try {
    model = await tf.loadLayersModel("./tfjs_model/model.json", {
      cache: "reload",
    });
    modelReady = true;
    document.getElementById("status").innerText = "Model loaded ✅";
    console.log("✅ Model ready");
  } catch (err) {
    console.error("❌ Model loading failed:", err);
    document.getElementById("status").innerText = "Model failed to load ❌";
  }
}

// Preprocess
function preprocess(img) {
  return tf.browser
    .fromPixels(img)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(255)
    .expandDims();
}

// ✅ SAFE PREDICT
async function predict(img) {
  if (!modelReady || !model) {
    console.warn("⏳ Model not ready");
    return;
  }

  const tensor = preprocess(img);
  const preds = model.predict(tensor);
  const probs = preds.dataSync();

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

  tf.dispose([tensor, preds]);
}

// 📁 Image upload
document.getElementById("imageUpload").addEventListener("change", (e) => {
  stopWebcam();

  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => predict(img);
  img.src = URL.createObjectURL(file);

  const preview = document.getElementById("preview");
  preview.src = img.src;
  preview.hidden = false;
});

// 🎥 Webcam toggle
document.getElementById("webcamBtn").onclick = async () => {
  if (!modelReady) {
    alert("Model still loading. Please wait.");
    return;
  }

  if (!webcamStream) {
    webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById("webcam");

    video.srcObject = webcamStream;
    video.hidden = false;
    await video.play();

    document.getElementById("snapshotBtn").hidden = false;
    document.getElementById("webcamBtn").innerText = "Stop Webcam";

    webcamInterval = setInterval(() => predict(video), 900);
  } else {
    stopWebcam();
  }
};

// 📸 Snapshot
document.getElementById("snapshotBtn").onclick = () => {
  if (!modelReady) return;

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

// 🛑 Stop webcam
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

// 🕘 History
function addHistory(text) {
  const li = document.createElement("li");
  li.innerText = text;
  document.getElementById("historyList").prepend(li);
}

// 🧹 Reset history
document.getElementById("clearHistory").onclick = () => {
  document.getElementById("historyList").innerHTML = "";
};

// 🚀 Init
loadModel();

// 🔧 Service Worker
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker.register("./service-worker.js");
// }
