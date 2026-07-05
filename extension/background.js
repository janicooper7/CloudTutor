// Service worker: coordinates capture between the popup and the offscreen
// document. The offscreen doc records and uploads; this worker manages its
// lifecycle and stashes the upload result for the popup to read.

async function hasOffscreen() {
  // getContexts is the reliable MV3 way to check for an existing offscreen doc.
  if (chrome.runtime.getContexts) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
    });
    return contexts.length > 0;
  }
  return false;
}

let creating = null;
async function ensureOffscreen() {
  if (await hasOffscreen()) return;
  if (!creating) {
    creating = chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["USER_MEDIA"],
      justification: "Record tab and microphone audio for the lesson.",
    });
  }
  await creating;
  creating = null;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.type === "START") {
      // Stash the streamId so the offscreen doc can pick it up on load,
      // avoiding a race if it isn't listening yet.
      await chrome.storage.local.set({
        pendingStreamId: msg.streamId,
        recording: true,
        startedAt: Date.now(),
        captureStatus: "recording",
        lastResult: null,
      });
      await ensureOffscreen();
      chrome.runtime.sendMessage({
        target: "offscreen",
        type: "START",
        streamId: msg.streamId,
      });
      sendResponse({ ok: true });
    } else if (msg.type === "STOP") {
      chrome.runtime.sendMessage({ target: "offscreen", type: "STOP" });
      // Recording stopped; the offscreen doc is now transcribing/uploading.
      await chrome.storage.local.set({ recording: false, captureStatus: "processing" });
      sendResponse({ ok: true });
    } else if (msg.type === "UPLOAD_RESULT") {
      await chrome.storage.local.set({
        captureStatus: msg.ok ? "done" : "error",
        lastResult: msg.ok
          ? { ok: true, id: msg.id, url: msg.url }
          : { ok: false, error: msg.error },
      });
    } else if (msg.type === "CAPTURE_DONE") {
      // Recording + upload finished; tear the offscreen document down.
      await chrome.storage.local.remove("pendingStreamId");
      if (await hasOffscreen()) await chrome.offscreen.closeDocument();
    } else if (msg.type === "CAPTURE_ERROR") {
      await chrome.storage.local.set({
        recording: false,
        captureStatus: "error",
        lastResult: { ok: false, error: msg.error },
      });
    }
  })();
  return true; // keep the message channel open for async sendResponse
});
