// Reconnaissance vocale sur l'appareil, pour les navigateurs qui n'en proposent pas (Arc, Firefox…).
// Le modèle est téléchargé une fois, puis gardé par le navigateur. La voix reste ici : elle n'est envoyée à personne.
import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js";

env.allowLocalModels = false;
var model = null;

function load() {
  if (model) return model;
  var files = {};
  model = pipeline("automatic-speech-recognition", "onnx-community/whisper-base", {
    device: "wasm",
    dtype: { encoder_model: "q8", decoder_model_merged: "q8" },
    progress_callback: function (p) {
      if (p.status !== "progress" || !p.total) return;
      files[p.file] = { loaded: p.loaded, total: p.total };
      var done = 0, all = 0;
      Object.keys(files).forEach(function (f) { done += files[f].loaded; all += files[f].total; });
      self.postMessage({ type: "progress", percent: Math.round(done / all * 100), total: all });
    }
  });
  return model;
}

self.onmessage = function (e) {
  if (e.data.type === "load") {
    load().then(function () { self.postMessage({ type: "ready" }); }).catch(function (err) { model = null; self.postMessage({ type: "error", message: String(err && err.message || err) }); });
  } else if (e.data.type === "transcribe") {
    load().then(function (run) {
      return run(e.data.audio, { language: "french", task: "transcribe", chunk_length_s: 20 });
    }).then(function (out) { self.postMessage({ type: "text", text: out.text || "" }); }).catch(function (err) { self.postMessage({ type: "error", message: String(err && err.message || err) }); });
  }
};
