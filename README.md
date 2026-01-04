# 🐾 Animal Classifier AI (TensorFlow.js)

A mobile-friendly **Animal Image Classification Web App** built with **TensorFlow.js** and **MobileNetV2**.  
The app can classify animals from **uploaded images or live webcam snapshots**, works on **desktop and mobile**, and is deployable on **GitHub Pages**.

---

## 🚀 Features

### 🧠 AI \& Prediction

* Image classification using **MobileNetV2**
* Supports multiple animal classes (e.g. cats, dogs, snakes)
* Confidence-based prediction
* **“Unknown”** result for low-confidence predictions
* Optimized preprocessing for **mobile accuracy**

### 📸 Input Methods

* Image upload
* Live webcam
* Snapshot capture (appears only after webcam starts)

### 🎯 User Experience

* Confidence color coding

  * 🟢 High confidence
  * 🟡 Medium confidence
  * 🔴 Low confidence

* Voice feedback for confident predictions
* Auto-switch between webcam and upload mode
* Reset prediction history button

### 📱 Mobile-Ready

* Responsive UI
* Optimized for browser speed
* Works on Android and iOS browsers
* GitHub Pages compatible
* PWA-ready (can be extended)

---

## 📁 Project Structure



project/

│── index.html

│── style.css

│── app.js

│── README.md

│── tfjs\_model/

│ ├── model.json

│ ├── group1-shard1of3.bin

│ ├── group1-shard2of3.bin

│ └── group1-shard3of3.bin







---



\## 🧠 Model Information



\- \*\*Base model:\*\* MobileNetV2 (pretrained on ImageNet)

\- \*\*Input size:\*\* 224 × 224 × 3

\- \*\*Framework:\*\* TensorFlow / TensorFlow.js

\- \*\*Export format:\*\* TensorFlow.js Layers Model



---



\## 🛠️ How to Run Locally



\### Option 1: Simple Local Server (Recommended)



Browsers block local file access for models, so use a local server:



```bash

python -m http.server







