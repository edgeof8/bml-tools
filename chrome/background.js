// Load script definitions from a JSON manifest and fetch their source code.
// The JSON file lives inside the extension (chrome/tools.json) and lists each
// script with an id, a human‑readable title and a relative path to the actual
// JavaScript implementation that lives in the main repository (e.g. "../md-memo/md-memo.js").
// On installation we read this manifest, fetch every script file, and store the
// resulting array in chrome.storage.local under the key "scripts". The stored
// objects contain the raw code string so that the options page can edit it.
const TOOLS_MANIFEST = "tools.json";

/** Fetch the tools manifest and then load each script's source code. */
async function loadDefaultScripts() {
  const manifestUrl = chrome.runtime.getURL(TOOLS_MANIFEST);
  const resp = await fetch(manifestUrl);
  const entries = await resp.json(); // [{id, title, path}]
  const scripts = [];
  for (const entry of entries) {
    try {
      const codeUrl = chrome.runtime.getURL(entry.path);
      const codeResp = await fetch(codeUrl);
      const code = await codeResp.text();
      scripts.push({ id: entry.id, title: entry.title, code });
    } catch (e) {
      console.error('Failed to load script', entry.id, e);
    }
  }
  return scripts;
}

// Initialize and build the Context Menu
async function buildContextMenu() {
  chrome.contextMenus.removeAll();
  
  // Create parent menu
  chrome.contextMenus.create({
    id: "bml-parent",
    title: "BML Tools",
    contexts:["all"]
  });

  const data = await chrome.storage.local.get({ scripts: DEFAULT_SCRIPTS });
  
  data.scripts.forEach((script) => {
    chrome.contextMenus.create({
      id: script.id,
      parentId: "bml-parent",
      title: script.title,
      contexts: ["all"]
    });
  });
}

// Run when the extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get("scripts");
  if (!data.scripts) {
    await chrome.storage.local.set({ scripts: DEFAULT_SCRIPTS });
  }
  buildContextMenu();
});

// Listen for options page updates to rebuild the menu live
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.scripts) buildContextMenu();
});

// Listen for a menu click and execute the script
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const data = await chrome.storage.local.get({ scripts:[] });
  const scriptToRun = data.scripts.find(s => s.id === info.menuItemId);

  if (scriptToRun && tab.id) {
    // We inject a script tag to perfectly mimic bookmarklet behavior 
    // and run in the context of the page's MAIN world.
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (code) => {
        const scriptEl = document.createElement('script');
        scriptEl.textContent = code;
        (document.head || document.documentElement).appendChild(scriptEl);
        scriptEl.remove();
      },
      args: [scriptToRun.code]
    });
  }
});

// Clicking the extension icon opens the Options/Editor page
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
