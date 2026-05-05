// Default tools that come pre-installed
const DEFAULT_SCRIPTS =[
  {
    id: "md-memo",
    title: "📝 Extract Page to Markdown (md-memo)",
    // Example: Replace this string with your actual minified bookmarklet code
    code: "alert('md-memo: Page converted to Markdown!');" 
  },
  {
    id: "yt-memo",
    title: "📺 YouTube to Memo (yt-memo)",
    code: "alert('yt-memo: Video data extracted!');"
  }
];

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