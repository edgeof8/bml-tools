document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('script-list');
  const editorArea = document.getElementById('editor-area');
  const emptyState = document.getElementById('empty-state');
  
  const inputId = document.getElementById('script-id');
  const inputTitle = document.getElementById('script-title');
  const inputCode = document.getElementById('script-code');

  let currentScripts =[];

  // Load and render scripts
  async function loadScripts() {
    const data = await chrome.storage.local.get({ scripts:[] });
    currentScripts = data.scripts;
    renderList();
  }

  function renderList() {
    listEl.innerHTML = '';
    currentScripts.forEach(script => {
      const btn = document.createElement('button');
      btn.className = "w-full text-left px-3 py-2 rounded text-sm hover:bg-zinc-700 transition truncate";
      btn.textContent = script.title;
      btn.onclick = () => openEditor(script);
      listEl.appendChild(btn);
    });
  }

  function openEditor(script) {
    emptyState.classList.add('hidden');
    editorArea.classList.remove('hidden');
    
    inputId.value = script.id;
    inputTitle.value = script.title;
    inputCode.value = script.code;
  }

  // Create New
  document.getElementById('btn-new').onclick = () => {
    openEditor({ id: 'custom-' + Date.now(), title: '', code: '' });
  };

  // Save Script
  document.getElementById('btn-save').onclick = async () => {
    const id = inputId.value;
    const title = inputTitle.value.trim() || 'Untitled Script';
    const code = inputCode.value.trim();

    const existingIndex = currentScripts.findIndex(s => s.id === id);
    if (existingIndex >= 0) {
      currentScripts[existingIndex] = { id, title, code };
    } else {
      currentScripts.push({ id, title, code });
    }

    await chrome.storage.local.set({ scripts: currentScripts });
    
    // Visual feedback
    const saveBtn = document.getElementById('btn-save');
    saveBtn.textContent = "Saved!";
    setTimeout(() => saveBtn.textContent = "Save Script", 1500);
    
    loadScripts();
  };

  // Delete Script
  document.getElementById('btn-delete').onclick = async () => {
    if (!confirm("Are you sure you want to delete this script?")) return;
    
    currentScripts = currentScripts.filter(s => s.id !== inputId.value);
    await chrome.storage.local.set({ scripts: currentScripts });
    
    editorArea.classList.add('hidden');
    emptyState.classList.remove('hidden');
    loadScripts();
  };

  loadScripts();
});