// Load script definitions from a JSON manifest and fetch their source code.
// The manifest lives at `chrome/tools.json` and contains an array of objects:
// `{ id, title, path }` where `path` is relative to the extension folder.
// During installation we read the manifest, fetch each script file, and store
// the resulting objects (including the raw JavaScript source) under the key
// `scripts` in chrome.storage.local. This makes the scripts editable via the
// options page.
const TOOLS_MANIFEST = "tools.json";

/** Retrieve the manifest and load the actual script contents. */
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

// Placeholder that will be populated on first install.
let DEFAULT_SCRIPTS = [];

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

// Run when the extension is installed or updated. On a fresh install we load the
// script definitions from `tools.json` (via `loadDefaultScripts`) and store them
// in chrome.storage.local. Subsequent updates keep the user's custom scripts.
chrome.runtime.onInstalled.addListener(async () => {
  const { scripts } = await chrome.storage.local.get("scripts");
  if (!scripts) {
    const defaults = await loadDefaultScripts();
    // Populate the placeholder so the rest of the code can rely on it.
    DEFAULT_SCRIPTS = defaults;
    await chrome.storage.local.set({ scripts: defaults });
  } else {
    // Ensure the in‑memory placeholder reflects whatever is stored.
    DEFAULT_SCRIPTS = scripts;
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
