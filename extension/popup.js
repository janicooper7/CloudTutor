// Popup: connect to CloudTutor, pick a student, record, and upload.

const $ = (id) => document.getElementById(id);
const configView = $("configView");
const recordView = $("recordView");
const appUrlIn = $("appUrl");
const tokenIn = $("token");
const saveBtn = $("saveBtn");
const configErr = $("configErr");
const gearBtn = $("gearBtn");

const studentSel = $("student");
const dot = $("dot");
const label = $("label");
const time = $("time");
const startBtn = $("startBtn");
const stopBtn = $("stopBtn");
const result = $("result");
const err = $("err");

let timer = null;

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function showErr(el, msg) {
  el.textContent = msg || "";
  el.classList.toggle("show", !!msg);
}

function trimUrl(u) {
  return (u || "").trim().replace(/\/+$/, "");
}

async function getConfig() {
  const { appUrl, captureToken } = await chrome.storage.local.get(["appUrl", "captureToken"]);
  return { appUrl, captureToken };
}

// ---- Connection settings ----------------------------------------------------

function showConfig() {
  recordView.classList.add("hidden");
  configView.classList.remove("hidden");
}
function showRecord() {
  configView.classList.add("hidden");
  recordView.classList.remove("hidden");
}

saveBtn.addEventListener("click", async () => {
  showErr(configErr, "");
  const appUrl = trimUrl(appUrlIn.value);
  const captureToken = tokenIn.value.trim();
  if (!appUrl || !captureToken) {
    showErr(configErr, "Enter both the App URL and the token.");
    return;
  }
  saveBtn.disabled = true;
  saveBtn.textContent = "Connecting…";
  try {
    await chrome.storage.local.set({ appUrl, captureToken });
    await loadStudents(); // validates the token
    showRecord();
    await applyState();
  } catch (e) {
    showErr(configErr, e.message || "Couldn't connect. Check the URL and token.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save & connect";
  }
});

gearBtn.addEventListener("click", async () => {
  const { appUrl, captureToken } = await getConfig();
  appUrlIn.value = appUrl || "";
  tokenIn.value = captureToken || "";
  showConfig();
});

// ---- Students ---------------------------------------------------------------

async function loadStudents() {
  const { appUrl, captureToken } = await getConfig();
  const res = await fetch(`${trimUrl(appUrl)}/api/capture/students`, {
    headers: { Authorization: `Bearer ${captureToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error("That token was rejected — copy it again from Settings.");
  if (!res.ok) throw new Error(data.error || `Couldn't load students (${res.status}).`);

  const list = data.students || [];
  studentSel.innerHTML = "";
  if (list.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No active students yet";
    opt.value = "";
    studentSel.appendChild(opt);
  } else {
    for (const s of list) {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name;
      studentSel.appendChild(opt);
    }
  }

  const { studentId } = await chrome.storage.local.get("studentId");
  if (studentId && list.some((s) => s.id === studentId)) studentSel.value = studentId;
  else if (list.length) await chrome.storage.local.set({ studentId: list[0].id });
}

studentSel.addEventListener("change", () => {
  chrome.storage.local.set({ studentId: studentSel.value });
});

// ---- Status rendering -------------------------------------------------------

function setDot(kind) {
  dot.className = "dot" + (kind ? ` ${kind}` : "");
}

async function applyState() {
  const { recording, startedAt, captureStatus, lastResult } = await chrome.storage.local.get([
    "recording",
    "startedAt",
    "captureStatus",
    "lastResult",
  ]);

  clearInterval(timer);
  time.textContent = "";
  showErr(err, "");
  result.classList.remove("show");

  const recordingNow = !!recording && captureStatus === "recording";

  startBtn.classList.toggle("hidden", recordingNow);
  stopBtn.classList.toggle("hidden", !recordingNow);
  startBtn.disabled = false;
  stopBtn.disabled = false;

  if (recordingNow) {
    setDot("rec");
    label.textContent = "Recording…";
    const tick = () => (time.textContent = fmt(Date.now() - (startedAt || Date.now())));
    tick();
    timer = setInterval(tick, 1000);
  } else if (captureStatus === "processing") {
    setDot("work");
    label.textContent = "Transcribing & drafting…";
    startBtn.disabled = true;
  } else if (captureStatus === "done" && lastResult?.ok) {
    setDot("ok");
    label.textContent = "Lesson ready";
    result.innerHTML = `✅ Draft created. <a href="${lastResult.url}" target="_blank" rel="noreferrer">Open in CloudTutor →</a>`;
    result.classList.add("show");
  } else {
    setDot("");
    label.textContent = "Ready to record";
    if (captureStatus === "error" && lastResult?.error) showErr(err, lastResult.error);
  }
}

// React to offscreen/background updates while the popup is open.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.captureStatus || changes.recording || changes.lastResult) applyState();
});

// ---- Recording control ------------------------------------------------------

startBtn.addEventListener("click", async () => {
  showErr(err, "");
  if (!studentSel.value) {
    showErr(err, "Add a student in CloudTutor first.");
    return;
  }
  startBtn.disabled = true;
  try {
    // Ensure mic permission for the extension origin (used by the offscreen doc).
    const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
    mic.getTracks().forEach((t) => t.stop());

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) throw new Error("No active tab found.");
    if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://"))) {
      throw new Error("Open your lesson tab (Meet, Zoom, Preply…) first.");
    }

    await chrome.storage.local.set({ studentId: studentSel.value });
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
    await chrome.runtime.sendMessage({ type: "START", streamId });
    await applyState();
  } catch (e) {
    showErr(err, e && e.message ? e.message : String(e));
    startBtn.disabled = false;
  }
});

stopBtn.addEventListener("click", async () => {
  stopBtn.disabled = true;
  try {
    await chrome.runtime.sendMessage({ type: "STOP" });
    await applyState();
  } catch (e) {
    showErr(err, e && e.message ? e.message : String(e));
    stopBtn.disabled = false;
  }
});

// ---- Init -------------------------------------------------------------------

(async function init() {
  const { appUrl, captureToken } = await getConfig();
  if (!appUrl || !captureToken) {
    appUrlIn.value = appUrl || "";
    tokenIn.value = captureToken || "";
    showConfig();
    return;
  }
  showRecord();
  await applyState();
  try {
    await loadStudents();
  } catch (e) {
    showErr(err, e.message || "Couldn't load students.");
  }
})();
