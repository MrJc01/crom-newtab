/* ==========================================================================
   CROM NEW TAB SYSTEM - LOGIC & AUTONOMOUS ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- FASE 1: IMEDIATO (Immediate / Priority 1) ---
  // Restaura instantaneamente o layout físico do Bento Grid para evitar flickering
  restoreGridLayout();
  initClock();
  initSearch();

  // --- FASE 2: INTERATIVO (Interactive / Priority 2) ---
  // Inicializa componentes interativos internos rápidos local-first
  setTimeout(() => {
    initShortcuts();
    initKeep();
    initSettings();
    initLayoutEditing();
  }, 10);

  // --- FASE 3: POSTERGADO (Deferred / Priority 3) ---
  // Carrega feeds de APIs externas pesadas em segundo plano quando o browser estiver ocioso
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      initCromSlides();
      initTabNewsFeed();
    });
  } else {
    setTimeout(() => {
      initCromSlides();
      initTabNewsFeed();
    }, 200);
  }
});

/* ==========================================================================
   0. ENGINE DE RESTAURAÇÃO DE LAYOUT DO GRID (FADE & FLICKER FREE)
   ========================================================================== */
function restoreGridLayout() {
  const grid = document.querySelector('.bento-grid');
  if (!grid) return;

  // Restaurar Spans de Linhas/Colunas
  try {
    const spans = JSON.parse(localStorage.getItem('crom_grid_spans')) || {};
    Object.keys(spans).forEach(id => {
      const card = document.getElementById(id);
      if (card) {
        // Remover classes de span anteriores
        for (let i = 1; i <= 4; i++) {
          card.classList.remove(`col-span-${i}`);
          card.classList.remove(`row-span-${i}`);
        }
        card.classList.add(`col-span-${spans[id].col}`);
        card.classList.add(`row-span-${spans[id].row}`);
      }
    });
  } catch (e) {
    console.error('Falha ao restaurar spans do grid:', e);
  }

  // Restaurar Ordem física dos Cards no DOM
  try {
    const order = JSON.parse(localStorage.getItem('crom_grid_order'));
    if (order && Array.isArray(order)) {
      order.forEach(id => {
        const card = document.getElementById(id);
        if (card && card.parentNode === grid) {
          grid.appendChild(card);
        }
      });
    }
  } catch (e) {
    console.error('Falha ao restaurar ordem física do grid:', e);
  }
}

/* ==========================================================================
   1. MÓDULO DO RELÓGIO & DATA CYBORG
   ========================================================================== */
function initClock() {
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date');

  if (!clockEl || !dateEl) return;

  function updateClock() {
    const now = new Date();
    
    // Formatar Relógio (HH:MM:SS) com segundos dinâmicos de alta precisão
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    // Formatar Data Regional
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    let dateString = now.toLocaleDateString('pt-BR', options);
    
    // Capitalizar a primeira letra do dia da semana
    dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    dateEl.textContent = dateString;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   2. MÓDULO DE BUSCA AVANÇADA (YANDEX & BUSCA POR IMAGEM)
   ========================================================================== */
function initSearch() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const engineButtons = document.querySelectorAll('.engine-btn');
  const searchImageBtn = document.getElementById('search-image-btn');
  const imageSearchDrawer = document.getElementById('image-search-drawer');
  const imageUrlInput = document.getElementById('image-url-input');
  const imageSearchSubmit = document.getElementById('image-search-submit');

  if (!searchForm || !searchInput) return;

  let currentEngine = 'google';

  const engines = {
    google: {
      url: 'https://www.google.com/search?q=',
      placeholder: 'Pesquisar no indexador Google...',
      imageSearch: (url) => `https://lens.google.com/upload?url=${encodeURIComponent(url)}`,
      homeImage: 'https://images.google.com/'
    },
    yandex: {
      url: 'https://yandex.com/search/?text=',
      placeholder: 'Pesquisar no Yandex...',
      imageSearch: (url) => `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(url)}`,
      homeImage: 'https://yandex.com/images/'
    },
    ddg: {
      url: 'https://duckduckgo.com/?q=',
      placeholder: 'Buscar com privacidade no DuckDuckGo...',
      imageSearch: (url) => `https://lens.google.com/upload?url=${encodeURIComponent(url)}`, // Fallback
      homeImage: 'https://duckduckgo.com/?q=images'
    },
    github: {
      url: 'https://github.com/search?q=',
      placeholder: 'Pesquisar repositórios de código no GitHub...',
      imageSearch: (url) => `https://lens.google.com/upload?url=${encodeURIComponent(url)}`, // Fallback
      homeImage: 'https://github.com'
    },
    so: {
      url: 'https://stackoverflow.com/search?q=',
      placeholder: 'Pesquisar soluções no StackOverflow...',
      imageSearch: (url) => `https://lens.google.com/upload?url=${encodeURIComponent(url)}`, // Fallback
      homeImage: 'https://stackoverflow.com'
    }
  };

  // Carregar motor de busca do localStorage ou usar Google como padrão
  const savedEngine = localStorage.getItem('crom_preferred_search_engine');
  if (savedEngine && engines[savedEngine]) {
    currentEngine = savedEngine;
    engineButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-engine') === currentEngine);
    });
    searchInput.placeholder = engines[currentEngine].placeholder;
  }

  // Alternar entre motores de busca
  engineButtons.forEach(button => {
    button.addEventListener('click', () => {
      engineButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      currentEngine = button.getAttribute('data-engine');
      searchInput.placeholder = engines[currentEngine].placeholder;
      localStorage.setItem('crom_preferred_search_engine', currentEngine);
      searchInput.focus();

      // Esconder gaveta se motor não for propício ou reajustar visual
      if (currentEngine !== 'google' && currentEngine !== 'yandex') {
        searchImageBtn.style.opacity = '0.5';
      } else {
        searchImageBtn.style.opacity = '1';
      }
    });
  });

  // Alternar a gaveta de busca por imagem
  if (searchImageBtn && imageSearchDrawer) {
    searchImageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      imageSearchDrawer.classList.toggle('hidden');
      searchImageBtn.classList.toggle('active');
      if (!imageSearchDrawer.classList.contains('hidden') && imageUrlInput) {
        imageUrlInput.focus();
      }
    });
  }

  // Enviar busca por texto normal
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `${engines[currentEngine].url}${encodeURIComponent(query)}`;
    }
  });

  // Enviar busca por imagem (URL)
  if (imageSearchSubmit && imageUrlInput) {
    const handleImageSearchSubmit = () => {
      const url = imageUrlInput.value.trim();
      if (url) {
        window.location.href = engines[currentEngine].imageSearch(url);
      } else {
        window.location.href = engines[currentEngine].homeImage;
      }
    };

    imageSearchSubmit.addEventListener('click', handleImageSearchSubmit);
    imageUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleImageSearchSubmit();
      }
    });
  }
}

/* ==========================================================================
   3. MÓDULO DOS ATALHOS DO HISTÓRICO (chrome.topSites)
   ========================================================================== */
function initShortcuts() {
  const shortcutsGrid = document.getElementById('shortcuts-grid');
  if (!shortcutsGrid) return;

  // Seletores da modal de atalhos
  const shortcutsConfigBtn = document.getElementById('shortcuts-config-btn');
  const shortcutsConfigModal = document.getElementById('shortcuts-config-modal');
  const closeShortcutsConfigBtn = document.getElementById('close-shortcuts-config-btn');
  
  const toggleTopSites = document.getElementById('toggle-shortcuts-topsites');
  const toggleRecentes = document.getElementById('toggle-shortcuts-recentes');
  
  const addShortcutForm = document.getElementById('add-shortcut-form');
  const shortcutInputTitle = document.getElementById('shortcut-input-title');
  const shortcutInputUrl = document.getElementById('shortcut-input-url');
  const customShortcutsList = document.getElementById('custom-shortcuts-list');

  // Atalhos padrão premium para fallback
  const defaultShortcuts = [
    { title: 'Crom.run', url: 'https://crom.run' },
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'StackOverflow', url: 'https://stackoverflow.com' },
    { title: 'YouTube', url: 'https://youtube.com' },
    { title: 'ChatGPT', url: 'https://chatgpt.com' },
    { title: 'Gmail', url: 'https://mail.google.com' },
    { title: 'Reddit', url: 'https://reddit.com' },
    { title: 'NPM', url: 'https://npmjs.com' }
  ];

  // 1. Carregar Configurações de Atalhos (Toggles)
  let config = { showTopSites: true, showRecentSites: false };
  try {
    const savedConfig = localStorage.getItem('crom_shortcuts_config');
    if (savedConfig) {
      config = { ...config, ...JSON.parse(savedConfig) };
    }
  } catch (e) {
    console.error('Erro ao ler crom_shortcuts_config:', e);
  }

  // Sincronizar checkboxes visuais com o estado do config
  if (toggleTopSites) toggleTopSites.checked = config.showTopSites;
  if (toggleRecentes) toggleRecentes.checked = config.showRecentSites;

  // 2. Carregar Atalhos Personalizados (CRUD local)
  let customShortcuts = [];
  try {
    const savedCustom = localStorage.getItem('crom_custom_shortcuts');
    if (savedCustom) {
      customShortcuts = JSON.parse(savedCustom);
    }
  } catch (e) {
    console.error('Erro ao ler crom_custom_shortcuts:', e);
  }

  // 3. Ouvintes para abrir e fechar a modal de atalhos
  if (shortcutsConfigBtn && shortcutsConfigModal) {
    shortcutsConfigBtn.addEventListener('click', () => {
      shortcutsConfigModal.classList.remove('hidden');
      renderCustomShortcutsList();
    });
  }

  if (closeShortcutsConfigBtn && shortcutsConfigModal) {
    closeShortcutsConfigBtn.addEventListener('click', () => {
      shortcutsConfigModal.classList.add('hidden');
    });
  }

  // Tecla 'Esc' para fechar a modal de atalhos também
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && shortcutsConfigModal) {
      shortcutsConfigModal.classList.add('hidden');
    }
  });

  // Fechar ao clicar fora
  if (shortcutsConfigModal) {
    shortcutsConfigModal.addEventListener('click', (e) => {
      if (e.target === shortcutsConfigModal) {
        shortcutsConfigModal.classList.add('hidden');
      }
    });
  }

  // 4. Lógica de Submissão do CRUD Manual
  if (addShortcutForm && shortcutInputTitle && shortcutInputUrl) {
    addShortcutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = shortcutInputTitle.value.trim();
      let url = shortcutInputUrl.value.trim();

      if (!title || !url) return;

      // Garantir protocolo na URL
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }

      const newShortcut = {
        id: Date.now(),
        title: title,
        url: url
      };

      customShortcuts.push(newShortcut);
      localStorage.setItem('crom_custom_shortcuts', JSON.stringify(customShortcuts));

      shortcutInputTitle.value = '';
      shortcutInputUrl.value = '';

      renderCustomShortcutsList();
      loadAndRenderAllShortcuts();
    });
  }

  // Renderizar a lista de atalhos manuais na modal
  function renderCustomShortcutsList() {
    if (!customShortcutsList) return;
    customShortcutsList.innerHTML = '';

    if (customShortcuts.length === 0) {
      customShortcutsList.innerHTML = `
        <div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); padding: 0.75rem 0;" class="mono">
          Nenhum canal manual adicionado.
        </div>
      `;
      return;
    }

    customShortcuts.forEach(sc => {
      const item = document.createElement('div');
      item.className = 'custom-sc-item';
      
      const domain = getDomainName(sc.url);
      
      item.innerHTML = `
        <div class="custom-sc-info">
          <span class="custom-sc-title">${sc.title}</span>
          <span class="custom-sc-url">${domain}</span>
        </div>
        <button class="custom-sc-delete" title="Excluir atalho">
          <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;

      item.querySelector('.custom-sc-delete').addEventListener('click', () => {
        customShortcuts = customShortcuts.filter(s => s.id !== sc.id);
        localStorage.setItem('crom_custom_shortcuts', JSON.stringify(customShortcuts));
        renderCustomShortcutsList();
        loadAndRenderAllShortcuts();
      });

      customShortcutsList.appendChild(item);
    });
  }

  // 5. Escuta de Mudanças nos Toggles da modal de atalhos
  if (toggleTopSites) {
    toggleTopSites.addEventListener('change', (e) => {
      config.showTopSites = e.target.checked;
      localStorage.setItem('crom_shortcuts_config', JSON.stringify(config));
      loadAndRenderAllShortcuts();
    });
  }

  if (toggleRecentes) {
    toggleRecentes.addEventListener('change', (e) => {
      config.showRecentSites = e.target.checked;
      localStorage.setItem('crom_shortcuts_config', JSON.stringify(config));
      loadAndRenderAllShortcuts();
    });
  }

  // 6. Funções de Apoio de Renderização na Grade
  function getDomainName(urlStr) {
    try {
      const url = new URL(urlStr);
      return url.hostname.replace('www.', '');
    } catch {
      return urlStr;
    }
  }

  function renderShortcuts(sites) {
    shortcutsGrid.innerHTML = '';
    
    // Atualizar crachá dinâmico de cabeçalho
    const badge = document.getElementById('shortcut-badge');
    if (badge) {
      if (customShortcuts.length > 0 && config.showTopSites) {
        badge.textContent = 'MISTO';
      } else if (customShortcuts.length > 0) {
        badge.textContent = 'MANUAL';
      } else if (config.showRecentSites) {
        badge.textContent = 'RECENTES';
      } else {
        badge.textContent = 'FREQUENTES';
      }
    }

    sites.forEach(site => {
      const a = document.createElement('a');
      a.href = site.url;
      a.className = 'shortcut-item group';
      a.title = site.title || site.url;
      
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'shortcut-icon-wrapper';
      
      const img = document.createElement('img');
      img.className = 'shortcut-favicon';
      img.alt = '';
      
      const domain = getDomainName(site.url);
      const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
      img.src = faviconUrl;
      
      img.addEventListener('error', () => {
        img.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2371717a" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>`;
      });
      
      iconWrapper.appendChild(img);
      a.appendChild(iconWrapper);
      
      const span = document.createElement('span');
      span.className = 'shortcut-name';
      span.textContent = site.title || domain;
      a.appendChild(span);
      
      shortcutsGrid.appendChild(a);
    });
  }

  // 7. Lógica Trifásica de Carregamento e Mesclagem de Fontes de Dados
  function loadAndRenderAllShortcuts() {
    let combined = [];

    // Adiciona primeiramente os atalhos manuais do usuário (prioridade máxima)
    customShortcuts.forEach(sc => {
      combined.push({ title: sc.title, url: sc.url });
    });

    const tasks = [];

    // Busca opcional de TopSites (Mais visitados)
    if (config.showTopSites) {
      tasks.push(new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.topSites && chrome.topSites.get) {
          chrome.topSites.get((sites) => {
            resolve(sites || []);
          });
        } else {
          resolve([]);
        }
      }));
    } else {
      tasks.push(Promise.resolve([]));
    }

    // Busca opcional de Recentes (Histórico)
    if (config.showRecentSites) {
      tasks.push(new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.history && chrome.history.search) {
          chrome.history.search({ text: '', maxResults: 15 }, (historyItems) => {
            const mapped = (historyItems || []).map(item => ({
              title: item.title || getDomainName(item.url),
              url: item.url
            }));
            resolve(mapped);
          });
        } else {
          resolve([]);
        }
      }));
    } else {
      tasks.push(Promise.resolve([]));
    }

    Promise.all(tasks).then(([topSitesList, recentSitesList]) => {
      // Mesclar atalhos
      const topMapped = topSitesList.slice(0, 10);
      const recentMapped = recentSitesList.slice(0, 10);

      // Concatenar fontes
      combined = [...combined, ...topMapped, ...recentMapped];

      // Eliminar duplicatas estritas por domínio / URL
      const unique = [];
      const seen = new Set();

      combined.forEach(site => {
        const normalized = site.url.replace(/\/$/, '').toLowerCase();
        if (!seen.has(normalized)) {
          seen.add(normalized);
          unique.push(site);
        }
      });

      // Se não sobrou nenhum atalho ativo pelas configurações, usar fallback padrão
      if (unique.length === 0) {
        renderShortcuts(defaultShortcuts);
      } else {
        renderShortcuts(unique.slice(0, 12)); // Limita a exibição a 12 atalhos para manter layout ultra compacto
      }
    });
  }

  // Executar carregamento inicial reativo
  loadAndRenderAllShortcuts();
}

/* ==========================================================================
   4. MÓDULO GOOGLE KEEP COM SINCRONIZAÇÃO EM DISCO LOCAL
   ========================================================================== */
function initKeep() {
  const noteForm = document.getElementById('quick-note-form');
  const contentInput = document.getElementById('note-quick-content');
  const notesGrid = document.getElementById('keep-notes-grid');
  const clearAllBtn = document.getElementById('clear-all-notes-btn');
  
  // Controle de Abertura/Fechamento da Modal de Notas
  const notesModal = document.getElementById('notes-modal');
  const openNotesModalBtn = document.getElementById('open-notes-modal-btn');
  const closeNotesModalBtn = document.getElementById('close-notes-modal-btn');
  
  // Banner de Sincronização
  const syncBanner = document.getElementById('folder-sync-banner');
  const syncFolderBtn = document.getElementById('sync-folder-btn');

  // Novos elementos de cabeçalho do Keep e Sidebar
  const keepSearchInput = document.getElementById('keep-search-input');
  const keepSearchClearBtn = document.getElementById('keep-search-clear-btn');
  const keepNavSyncTrigger = document.getElementById('keep-nav-sync-trigger');
  const keepNavItems = document.querySelectorAll('.keep-nav-item');

  if (!notesGrid) return;

  let activeDirectoryHandle = null;

  // Bancos de dados IndexedDB
  const DB_NAME = 'CromKeepDB';
  const STORE_NAME = 'settings';
  const KEY_NAME = 'directoryHandle';

  // Inicializar o banco de dados IndexedDB
  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Resgatar handle de diretório salvo
  async function getSavedDirectoryHandle() {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(KEY_NAME);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('Erro ao acessar IndexedDB:', err);
      return null;
    }
  }

  // Salvar handle de diretório no IndexedDB
  async function saveDirectoryHandle(handle) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(handle, KEY_NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('Erro ao gravar no IndexedDB:', err);
    }
  }

  // Verificar permissões do diretório
  async function verifyPermission(fileHandle, readWrite) {
    const options = {};
    if (readWrite) {
      options.mode = 'readwrite';
    }
    if ((await fileHandle.queryPermission(options)) === 'granted') {
      return true;
    }
    return false;
  }

  // Mapeador de Notas (localStorage)
  function getNotes() {
    return JSON.parse(localStorage.getItem('crom_keep_notes')) || [];
  }

  function saveNotesToLocalStorage(notes) {
    localStorage.setItem('crom_keep_notes', JSON.stringify(notes));
  }

  // Escrita física de arquivo txt de nota
  async function writePhysicalNote(note) {
    if (!activeDirectoryHandle) return;
    try {
      const fileName = `nota_${note.id}.txt`;
      const fileHandle = await activeDirectoryHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      
      const fileContent = `TÍTULO: ${note.title || 'Sem título'}\n` +
                          `COR: ${note.color}\n` +
                          `MODIFICADO EM: ${new Date(note.id).toLocaleString('pt-BR')}\n` +
                          `========================================\n\n` +
                          `${note.content || ''}`;
                          
      await writable.write(fileContent);
      await writable.close();
    } catch (err) {
      console.error(`Erro ao gravar arquivo físico da nota_${note.id}:`, err);
    }
  }

  // Deleção de arquivo físico txt de nota
  async function deletePhysicalNote(id) {
    if (!activeDirectoryHandle) return;
    try {
      const fileName = `nota_${id}.txt`;
      await activeDirectoryHandle.removeEntry(fileName);
    } catch (err) {
      console.warn(`Nota física já removida ou inexistente no disco: nota_${id}.txt`);
    }
  }

  // Sincronizar em lote todas as notas locais para a pasta
  async function syncAllNotesToDisk() {
    if (!activeDirectoryHandle) return;
    const notes = getNotes();
    for (const note of notes) {
      await writePhysicalNote(note);
    }
  }

  // Conectar e gerenciar o estado visual do banner de sincronização
  function updateSyncBannerState(connected, folderName = '') {
    if (!syncBanner || !syncFolderBtn) return;
    if (connected) {
      syncBanner.className = 'sync-banner success';
      syncBanner.querySelector('.banner-icon').textContent = '✅';
      syncBanner.querySelector('.banner-text').innerHTML = `Autonomia Ativa! Notas salvas localmente na pasta: <strong>${folderName}</strong>`;
      syncFolderBtn.textContent = 'Mudar Pasta';
    } else {
      syncBanner.className = 'sync-banner warning';
      syncBanner.querySelector('.banner-icon').textContent = '⚠️';
      
      if (folderName) {
        // Handle existe no IndexedDB mas precisa reautorizar a permissão
        syncBanner.querySelector('.banner-text').innerHTML = `Sincronização inativa. Autorize o acesso à pasta local: <strong>${folderName}</strong>`;
        syncFolderBtn.textContent = 'Autorizar Acesso';
      } else {
        // Configuração inicial
        syncBanner.querySelector('.banner-text').innerHTML = `Suas notas estão no browser. <strong>Compartilhe uma pasta local</strong> para sincronizá-las fisicamente e manter a autonomia dos seus dados.`;
        syncFolderBtn.textContent = 'Conectar Pasta';
      }
    }
  }

  // Elementos do modal de edicao de notas (Estilo Google Keep)
  const editModal = document.getElementById('keep-edit-modal');
  const editContainer = document.getElementById('keep-edit-container');
  const editTitleInput = document.getElementById('keep-edit-title');
  const editContentInput = document.getElementById('keep-edit-content');
  const editCloseBtn = document.getElementById('keep-edit-close-btn');
  let activeEditingNoteId = null;

  function openEditNoteModal(note) {
    activeEditingNoteId = note.id;
    editTitleInput.value = note.title || '';
    editContentInput.value = note.content || '';
    
    // Configura a classe de cor da nota no modal de edicao
    editContainer.className = 'keep-edit-container';
    if (note.color) {
      editContainer.classList.add(`color-${note.color}`);
    } else {
      editContainer.classList.add('color-default');
    }
    
    editModal.classList.remove('hidden');
    editContentInput.focus();
  }

  async function closeAndSaveEditModal() {
    if (!activeEditingNoteId) return;
    
    const titleVal = editTitleInput.value.trim();
    const contentVal = editContentInput.value.trim();
    
    let notes = getNotes();
    const noteIndex = notes.findIndex(n => n.id === activeEditingNoteId);
    
    if (noteIndex !== -1) {
      // Se a nota estiver completamente em branco, a deletamos (comportamento nativo do Google Keep)
      if (!titleVal && !contentVal) {
        notes = notes.filter(n => n.id !== activeEditingNoteId);
        saveNotesToLocalStorage(notes);
        await deletePhysicalNote(activeEditingNoteId);
      } else {
        // Caso contrario, atualizamos
        notes[noteIndex].title = titleVal;
        notes[noteIndex].content = contentVal;
        notes[noteIndex].id = Date.now(); // Atualiza timestamp para colocar no topo
        saveNotesToLocalStorage(notes);
        await writePhysicalNote(notes[noteIndex]);
      }
    }
    
    editModal.classList.add('hidden');
    activeEditingNoteId = null;
    renderNotes(keepSearchInput ? keepSearchInput.value : '');
  }

  // Ouvintes do modal de edicao
  if (editCloseBtn) {
    editCloseBtn.addEventListener('click', closeAndSaveEditModal);
  }
  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        closeAndSaveEditModal();
      }
    });
  }
  // Suporte à tecla Esc para o modal de edicao
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editModal && !editModal.classList.contains('hidden')) {
      closeAndSaveEditModal();
    }
  });

  // Renderizar Notas com suporte à busca reativa
  function renderNotes(searchQuery = '') {
    notesGrid.innerHTML = '';
    let notes = getNotes();

    // Filtragem reativa por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      notes = notes.filter(note => 
        (note.title && note.title.toLowerCase().includes(query)) || 
        (note.content && note.content.toLowerCase().includes(query))
      );
    }

    if (notes.length === 0) {
      if (searchQuery) {
        notesGrid.innerHTML = `
          <div class="col-span-full py-12 text-center text-sm text-muted mono">
            Nenhuma nota encontrada para "${searchQuery}".
          </div>
        `;
      } else {
        notesGrid.innerHTML = `
          <div class="col-span-full py-12 text-center text-sm text-muted mono">
            Nenhuma nota registrada. Escreva algo no painel inicial...
          </div>
        `;
      }
      return;
    }

    notes.forEach(note => {
      const card = document.createElement('div');
      card.className = `keep-note-card color-${note.color || 'default'}`;
      card.setAttribute('data-id', note.id);

      card.innerHTML = `
        <div>
          ${note.title ? `<h4>${note.title}</h4>` : ''}
          <p>${note.content}</p>
        </div>
        <div class="keep-note-footer">
          <button class="delete-note-btn" title="Excluir nota">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      `;

      // Evento de edicao (clique no card todo, exceto rodape de deletar)
      card.addEventListener('click', (e) => {
        if (e.target.closest('.delete-note-btn') || e.target.closest('.keep-note-footer')) {
          return;
        }
        openEditNoteModal(note);
      });

      // Evento de deleção individual
      card.querySelector('.delete-note-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = note.id;
        let notes = getNotes();
        notes = notes.filter(n => n.id !== id);
        saveNotesToLocalStorage(notes);
        await deletePhysicalNote(id);
        renderNotes(keepSearchInput ? keepSearchInput.value : '');
      });

      notesGrid.appendChild(card);
    });
  }

  // Lógica do input de pesquisa reativa
  if (keepSearchInput) {
    keepSearchInput.addEventListener('input', () => {
      const query = keepSearchInput.value;
      renderNotes(query);
      if (query.length > 0) {
        keepSearchClearBtn.classList.remove('hidden');
      } else {
        keepSearchClearBtn.classList.add('hidden');
      }
    });
  }

  // Lógica do botão de limpar busca
  if (keepSearchClearBtn && keepSearchInput) {
    keepSearchClearBtn.addEventListener('click', () => {
      keepSearchInput.value = '';
      keepSearchClearBtn.classList.add('hidden');
      renderNotes();
      keepSearchInput.focus();
    });
  }

  // Lógica de cliques na sidebar
  if (keepNavItems) {
    keepNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        keepNavItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Se for o gatilho de sincronização física
        if (item.id === 'keep-nav-sync-trigger') {
          if (syncBanner) {
            // Piscar o banner para chamar atenção
            syncBanner.classList.remove('pulse-highlight');
            void syncBanner.offsetWidth; // Força re-render
            syncBanner.classList.add('pulse-highlight');
            syncBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Focar no botão do banner
            if (syncFolderBtn) syncFolderBtn.focus();
          }
        } else {
          // Limpar filtros de busca ao voltar para Notas
          if (keepSearchInput) {
            keepSearchInput.value = '';
            keepSearchClearBtn.classList.add('hidden');
          }
          renderNotes();
        }
      });
    });
  }

  // Submeter formulário de nova Nota Rápida (página inicial)
  if (noteForm && contentInput) {
    noteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = contentInput.value.trim();
      if (!content) return;

      const now = new Date();
      const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      const formatStr = now.toLocaleDateString('pt-BR', options);
      const title = `Nota Rápida — ${formatStr}`;

      const newNote = {
        id: Date.now(),
        title: title,
        content: content,
        color: 'default'
      };

      const notes = getNotes();
      notes.unshift(newNote);
      saveNotesToLocalStorage(notes);
      await writePhysicalNote(newNote);

      contentInput.value = '';
      contentInput.style.height = 'auto';
      renderNotes(keepSearchInput ? keepSearchInput.value : '');
    });

    contentInput.addEventListener('input', () => {
      contentInput.style.height = 'auto';
      contentInput.style.height = (contentInput.scrollHeight) + 'px';
    });
  }

  // Eventos de Abertura/Fechamento da Modal de Notas
  if (notesModal && openNotesModalBtn && closeNotesModalBtn) {
    openNotesModalBtn.addEventListener('click', () => {
      notesModal.classList.remove('hidden');
      if (keepSearchInput) {
        keepSearchInput.value = '';
        keepSearchClearBtn.classList.add('hidden');
      }
      // Garantir que a aba ativa na barra lateral volte para "Notas"
      if (keepNavItems) {
        keepNavItems.forEach(nav => {
          if (nav.id === 'keep-nav-sync-trigger') {
            nav.classList.remove('active');
          } else {
            nav.classList.add('active');
          }
        });
      }
      renderNotes();
    });

    closeNotesModalBtn.addEventListener('click', () => {
      notesModal.classList.add('hidden');
    });

    notesModal.addEventListener('click', (e) => {
      if (e.target === notesModal) {
        notesModal.classList.add('hidden');
      }
    });
  }

  // Limpar todas as notas
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', async () => {
      if (confirm('Tem certeza de que deseja excluir permanentemente todas as suas notas?')) {
        const notes = getNotes();
        for (const note of notes) {
          await deletePhysicalNote(note.id);
        }
        saveNotesToLocalStorage([]);
        renderNotes();
      }
    });
  }

  // Tratar conexão da pasta física de sincronização
  if (syncFolderBtn) {
    syncFolderBtn.addEventListener('click', async () => {
      try {
        if (activeDirectoryHandle) {
          const handle = await window.showDirectoryPicker();
          if (handle) {
            activeDirectoryHandle = handle;
            await saveDirectoryHandle(handle);
            updateSyncBannerState(true, handle.name);
            await syncAllNotesToDisk();
          }
        } else {
          const savedHandle = await getSavedDirectoryHandle();
          if (savedHandle) {
            const permission = await savedHandle.requestPermission({ mode: 'readwrite' });
            if (permission === 'granted') {
              activeDirectoryHandle = savedHandle;
              updateSyncBannerState(true, savedHandle.name);
              await syncAllNotesToDisk();
            } else {
              const newHandle = await window.showDirectoryPicker();
              if (newHandle) {
                activeDirectoryHandle = newHandle;
                await saveDirectoryHandle(newHandle);
                updateSyncBannerState(true, newHandle.name);
                await syncAllNotesToDisk();
              }
            }
          } else {
            const handle = await window.showDirectoryPicker();
            if (handle) {
              activeDirectoryHandle = handle;
              await saveDirectoryHandle(handle);
              updateSyncBannerState(true, handle.name);
              await syncAllNotesToDisk();
            }
          }
        }
      } catch (err) {
        console.error('File System Access API negada ou não suportada:', err);
        alert('Não foi possível conectar a pasta. Certifique-se de conceder as permissões necessárias.');
      }
    });
  }

  // Carregamento inicial do sincronizador de pasta e notas
  async function loadInitialSyncState() {
    try {
      const savedHandle = await getSavedDirectoryHandle();
      if (savedHandle) {
        const hasPermission = await verifyPermission(savedHandle, true);
        if (hasPermission) {
          activeDirectoryHandle = savedHandle;
          updateSyncBannerState(true, savedHandle.name);
          await syncAllNotesToDisk();
        } else {
          updateSyncBannerState(false, savedHandle.name);
        }
      } else {
        updateSyncBannerState(false);
      }
    } catch (err) {
      console.error('Falha ao carregar estado inicial do IndexedDB:', err);
      updateSyncBannerState(false);
    }
  }

  // Executar renderização e carregamento
  renderNotes();
  loadInitialSyncState();
}

/* ==========================================================================
   4.5 MÓDULO DE CONFIGURAÇÕES DE LAYOUT REATIVAS
   ========================================================================== */
function initSettings() {
  const settingsToggleBtn = document.getElementById('settings-toggle-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
  
  const toggleClock = document.getElementById('setting-toggle-clock');
  const toggleNotes = document.getElementById('setting-toggle-notes');
  const togglePhilosophy = document.getElementById('setting-toggle-philosophy');
  const toggleTabNews = document.getElementById('setting-toggle-tabnews');
  const selectTheme = document.getElementById('setting-layout-theme');

  if (!settingsModal) return;

  // Gerenciamento de Abertura/Fechamento da Modal de Configurações
  if (settingsToggleBtn && closeSettingsModalBtn) {
    settingsToggleBtn.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
    });

    closeSettingsModalBtn.addEventListener('click', () => {
      settingsModal.classList.add('hidden');
    });

    // Fechar ao clicar fora (no overlay)
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
      }
    });
  }

  // Tecla 'Esc' para fechar as modais
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const notesModal = document.getElementById('notes-modal');
      const shortcutsModal = document.getElementById('shortcuts-config-modal');
      if (notesModal) notesModal.classList.add('hidden');
      if (shortcutsModal) shortcutsModal.classList.add('hidden');
      settingsModal.classList.add('hidden');
    }
  });

  // Preferências de Layout Padrão
  const DEFAULT_VISIBILITY = {
    clock: true,
    notes: true,
    philosophy: true,
    tabnews: true
  };

  // Carregar configurações salvas
  let settings = DEFAULT_VISIBILITY;
  try {
    const savedSettings = localStorage.getItem('crom_settings_visibility');
    if (savedSettings) {
      settings = { ...DEFAULT_VISIBILITY, ...JSON.parse(savedSettings) };
    }
  } catch (err) {
    console.error('Falha ao parsear configurações de layout:', err);
  }

  // Função para aplicar visualmente no body
  function applyLayoutSettings() {
    document.body.classList.toggle('clock-hidden', !settings.clock);
    document.body.classList.toggle('notes-hidden', !settings.notes);
    document.body.classList.toggle('philosophy-hidden', !settings.philosophy);
    document.body.classList.toggle('tabnews-hidden', !settings.tabnews);

    // Ajustar estado dos checkboxes
    if (toggleClock) toggleClock.checked = settings.clock;
    if (toggleNotes) toggleNotes.checked = settings.notes;
    if (togglePhilosophy) togglePhilosophy.checked = settings.philosophy;
    if (toggleTabNews) toggleTabNews.checked = settings.tabnews;
  }

  // Salvar configurações
  function saveLayoutSettings() {
    localStorage.setItem('crom_settings_visibility', JSON.stringify(settings));
    applyLayoutSettings();
  }

  // Configurar listeners de mudança nos switches
  if (toggleClock) {
    toggleClock.addEventListener('change', (e) => {
      settings.clock = e.target.checked;
      saveLayoutSettings();
    });
  }

  if (toggleNotes) {
    toggleNotes.addEventListener('change', (e) => {
      settings.notes = e.target.checked;
      saveLayoutSettings();
    });
  }

  if (togglePhilosophy) {
    togglePhilosophy.addEventListener('change', (e) => {
      settings.philosophy = e.target.checked;
      saveLayoutSettings();
    });
  }

  if (toggleTabNews) {
    toggleTabNews.addEventListener('change', (e) => {
      settings.tabnews = e.target.checked;
      saveLayoutSettings();
    });
  }

  // Configurar dropdown de predefinição de tema
  if (selectTheme) {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('crom_layout_theme') || 'productivity';
    selectTheme.value = savedTheme;

    selectTheme.addEventListener('change', (e) => {
      const selected = e.target.value;
      localStorage.setItem('crom_layout_theme', selected);
      if (selected !== 'custom') {
        applyLayoutPreset(selected);
      }
    });
  }

  // Inicialização do estado de layout
  applyLayoutSettings();
}

/* ==========================================================================
   5. MÓDULO DE SLIDES E CARROSSEL DINÂMICO (API CROM)
   ========================================================================== */
function initCromSlides() {
  const slideTitle = document.getElementById('slide-title');
  const slideSubtitle = document.getElementById('slide-subtitle');
  const slideDesc = document.getElementById('slide-desc');
  const slideCta = document.getElementById('slide-cta-btn');
  const slideTagsContainer = document.getElementById('slide-tags-container');
  const slidesIndicators = document.getElementById('slides-indicators');
  const slidesWrapper = document.getElementById('slides-container-wrapper');

  if (!slideTitle || !slideSubtitle || !slideDesc) return;

  const API_URL = 'https://crom.run/api/json/newtab';
  const CACHE_KEY = 'crom_newtab_cached_slides';

  const defaultSlides = [
    {
      id: "slide_autonomia_digital",
      title: "Autonomia Digital",
      subtitle: "Tecnologia Independente",
      description: "Desenvolvendo soluções open-source descentralizadas para garantir a privacidade, o controle e a autonomia total dos seus dados.",
      cta: { text: "Conhecer o Manifesto", link: "https://crom.run/manifesto", target: "_blank" },
      tags: ["Filosofia", "Open-Source", "Privacy"]
    },
    {
      id: "slide_crompressor",
      title: "Crompressor",
      subtitle: "Alta Performance em Sincronização",
      description: "Engine de deduplicação baseado em Computação Termodinâmica e sincronização de entropia. Redução drástica de tráfego de rede com acesso O(1) via FUSE.",
      cta: { text: "Ver Documentação", link: "https://crom.run/docs/crompressor", target: "_blank" },
      tags: ["Core", "Go", "Performance"]
    },
    {
      id: "slide_p2p_secure_share",
      title: "P2P Secure Share",
      subtitle: "Transferência Direta e Criptografada",
      description: "Compartilhamento de arquivos ponta a ponta direto pelo navegador via WebRTC. Sem intermediários, sem armazenamento em servidores, 100% local-first.",
      cta: { text: "Transferir Arquivo", link: "https://p2p.crom.run", target: "_blank" },
      tags: ["WebRTC", "Local-First", "Security"]
    }
  ];

  let currentSlides = defaultSlides;
  let activeSlideIndex = 0;
  let rotationInterval = null;
  let autoplayIntervalMs = 5000;

  function sanitizeText(text) {
    if (!text) return '';
    return text
      .replace(/soberania/gi, (match) => {
        if (match === 'Soberania') return 'Autonomia';
        if (match === 'SOBERANIA') return 'AUTONOMIA';
        return 'autonomia';
      });
  }

  function renderSlide(index) {
    if (!currentSlides || currentSlides.length === 0) return;
    
    // Garantir índice circular
    activeSlideIndex = (index + currentSlides.length) % currentSlides.length;
    const slide = currentSlides[activeSlideIndex];

    // Transição suave de opacidade e transformação usando CSS
    if (slidesWrapper) {
      slidesWrapper.style.opacity = '0';
      slidesWrapper.style.transform = 'translateY(5px)';
      slidesWrapper.style.transition = 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    setTimeout(() => {
      slideTitle.textContent = sanitizeText(slide.title);
      slideSubtitle.textContent = sanitizeText(slide.subtitle);
      slideDesc.textContent = sanitizeText(slide.description);

      // Tratar CTA
      if (slide.cta && slide.cta.text && slide.cta.link) {
        slideCta.textContent = sanitizeText(slide.cta.text);
        slideCta.href = slide.cta.link;
        slideCta.target = slide.cta.target || '_blank';
        slideCta.style.display = 'inline-flex';
      } else {
        slideCta.style.display = 'none';
      }

      // Tratar Tags
      if (slideTagsContainer) {
        slideTagsContainer.innerHTML = '';
        if (slide.tags && Array.isArray(slide.tags)) {
          slide.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'slide-tag';
            span.textContent = sanitizeText(tag);
            slideTagsContainer.appendChild(span);
          });
        }
      }

      // Atualizar indicadores ativos
      if (slidesIndicators) {
        const dots = slidesIndicators.querySelectorAll('.indicator-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === activeSlideIndex);
        });
      }

      // Efeito fade-in
      if (slidesWrapper) {
        slidesWrapper.style.opacity = '1';
        slidesWrapper.style.transform = 'translateY(0)';
      }
    }, 250);
  }

  function setupIndicators() {
    if (!slidesIndicators) return;
    slidesIndicators.innerHTML = '';

    currentSlides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `indicator-dot ${idx === activeSlideIndex ? 'active' : ''}`;
      dot.title = `Ir para o slide ${idx + 1}`;
      dot.addEventListener('click', () => {
        renderSlide(idx);
        restartAutoplay();
      });
      slidesIndicators.appendChild(dot);
    });
  }

  function startAutoplay() {
    stopAutoplay();
    rotationInterval = setInterval(() => {
      renderSlide(activeSlideIndex + 1);
    }, autoplayIntervalMs);
  }

  function stopAutoplay() {
    if (rotationInterval) {
      clearInterval(rotationInterval);
      rotationInterval = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Tentar carregar slides do Cache Local (Offline-first)
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        currentSlides = parsed;
      }
    }
  } catch (err) {
    console.error('Falha ao ler cache de slides:', err);
  }

  // Renderização inicial rápida com cache ou fallback
  setupIndicators();
  renderSlide(0);
  startAutoplay();

  // Buscar dados novos da API externa
  fetch(API_URL)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(payload => {
      if (payload && payload.status === 'success' && payload.data && Array.isArray(payload.data.slides)) {
        const slides = payload.data.slides;
        
        // Atualizar intervalo de autoplay se definido pela API
        if (payload.data.settings && payload.data.settings.interval_ms) {
          autoplayIntervalMs = payload.data.settings.interval_ms;
        }

        currentSlides = slides;
        activeSlideIndex = 0;

        // Armazenar no Cache Local
        localStorage.setItem(CACHE_KEY, JSON.stringify(slides));

        // Re-renderizar com dados atualizados e transição
        setupIndicators();
        renderSlide(0);
        restartAutoplay();
      }
    })
    .catch(error => {
      console.warn('Falha na conexao com a API de slides CROM, operando em modo offline-first:', error);
    });
}

/* ==========================================================================
   6. MÓDULO TABNEWS FEED (SLIDES DE DISCUSSÕES RELEVANTES)
   ========================================================================== */
function initTabNewsFeed() {
  const slideTitle = document.getElementById('tabnews-title');
  const slideSubtitle = document.getElementById('tabnews-subtitle');
  const slideDesc = document.getElementById('tabnews-desc');
  const slideCta = document.getElementById('tabnews-cta-btn');
  const slideMetaContainer = document.getElementById('tabnews-meta-container');
  const slidesIndicators = document.getElementById('tabnews-indicators');
  const slidesWrapper = document.getElementById('tabnews-container-wrapper');

  if (!slideTitle || !slideSubtitle || !slideDesc) return;

  const API_URL = 'https://www.tabnews.com.br/api/v1/contents?strategy=relevant';
  const CACHE_KEY = 'crom_tabnews_cached_feed';

  const defaultArticles = [
    {
      title: "Autonomia na Web Descentralizada",
      owner_username: "crom",
      slug: "autonomia-web-descentralizada",
      tabcoins: 45,
      children_deep_count: 8
    },
    {
      title: "Construindo Aplicações Local-First Robustas",
      owner_username: "dev_autonomo",
      slug: "construindo-aplicacoes-local-first",
      tabcoins: 38,
      children_deep_count: 12
    }
  ];

  let currentArticles = defaultArticles;
  let activeIndex = 0;
  let rotationInterval = null;
  const autoplayIntervalMs = 6000;

  // Sanitização profunda de textos vindos de API para mitigar XSS de forma robusta
  function sanitize(text) {
    if (!text) return '';
    const temp = document.createElement('div');
    temp.textContent = text;
    return temp.innerHTML;
  }

  function renderArticle(index) {
    if (!currentArticles || currentArticles.length === 0) return;
    activeIndex = (index + currentArticles.length) % currentArticles.length;
    const article = currentArticles[activeIndex];

    if (slidesWrapper) {
      slidesWrapper.style.opacity = '0';
      slidesWrapper.style.transform = 'translateY(5px)';
      slidesWrapper.style.transition = 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    setTimeout(() => {
      // O TabNews não retorna corpo descritivo no payload de listagem de posts.
      // Então geramos uma descrição técnica elegante com base nas Tabcoins e respostas da comunidade.
      slideTitle.textContent = article.title;
      slideSubtitle.textContent = `Publicado por @${article.owner_username}`;
      slideDesc.textContent = `Discussão técnica relevante na comunidade do TabNews. Recebeu ${article.tabcoins} tabcoins e possui ${article.children_deep_count} comentários ativos. Participe e compartilhe conhecimento prático!`;

      slideCta.href = `https://www.tabnews.com.br/${article.owner_username}/${article.slug}`;
      slideCta.textContent = "Ler no TabNews";
      slideCta.style.display = 'inline-flex';

      if (slideMetaContainer) {
        slideMetaContainer.innerHTML = `
          <span class="tabnews-meta-item">🪙 ${article.tabcoins} Tabcoins</span>
          <span class="tabnews-meta-item">💬 ${article.children_deep_count} Respostas</span>
        `;
      }

      if (slidesIndicators) {
        const dots = slidesIndicators.querySelectorAll('.indicator-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === activeIndex);
        });
      }

      if (slidesWrapper) {
        slidesWrapper.style.opacity = '1';
        slidesWrapper.style.transform = 'translateY(0)';
      }
    }, 250);
  }

  function setupIndicators() {
    if (!slidesIndicators) return;
    slidesIndicators.innerHTML = '';

    currentArticles.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `indicator-dot ${idx === activeIndex ? 'active' : ''}`;
      dot.title = `Ir para artigo ${idx + 1}`;
      dot.addEventListener('click', () => {
        renderArticle(idx);
        restartAutoplay();
      });
      slidesIndicators.appendChild(dot);
    });
  }

  function startAutoplay() {
    stopAutoplay();
    rotationInterval = setInterval(() => {
      renderArticle(activeIndex + 1);
    }, autoplayIntervalMs);
  }

  function stopAutoplay() {
    if (rotationInterval) {
      clearInterval(rotationInterval);
      rotationInterval = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Tentar carregar do Cache Local (Offline-first de alta velocidade)
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        currentArticles = parsed;
      }
    }
  } catch (err) {
    console.error('Falha ao ler cache do TabNews:', err);
  }

  setupIndicators();
  renderArticle(0);
  startAutoplay();

  // Buscar feed novo da API de forma assíncrona
  fetch(API_URL)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        // Obter até os 8 artigos mais votados/relevantes do feed
        currentArticles = data.slice(0, 8).map(art => ({
          title: sanitize(art.title),
          owner_username: sanitize(art.owner_username),
          slug: sanitize(art.slug),
          tabcoins: art.tabcoins || 0,
          children_deep_count: art.children_deep_count || 0
        }));

        localStorage.setItem(CACHE_KEY, JSON.stringify(currentArticles));

        setupIndicators();
        renderArticle(0);
        restartAutoplay();
      }
    })
    .catch(err => {
      console.warn('Falha ao conectar com a API do TabNews, rodando em modo offline-first:', err);
    });
}

/* ==========================================================================
   7. MÓDULO DE EDIÇÃO DO LAYOUT BENTO GRID (DRAG & DROP & RESIZE)
   ========================================================================== */
function initLayoutEditing() {
  const editToggleBtn = document.getElementById('layout-edit-toggle-btn');
  const grid = document.querySelector('.bento-grid');
  if (!editToggleBtn || !grid) return;

  const cards = grid.querySelectorAll('.bento-card');

  // Garantir IDs únicos nos cards para persistência correta
  cards.forEach((card, idx) => {
    if (!card.id) {
      card.id = `bento-card-${idx}`;
    }
  });

  // Injetar overlays de controles visuais nos cards se ainda não existirem
  cards.forEach(card => {
    if (!card.querySelector('.card-edit-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'card-edit-overlay';
      overlay.innerHTML = `
        <div class="drag-handle" title="Arraste para mover o widget">✥ Mover Widget</div>
        <div class="resize-controls">
          <button type="button" class="resize-btn col-dec" title="Diminuir Colunas">- Col</button>
          <button type="button" class="resize-btn col-inc" title="Aumentar Colunas">+ Col</button>
          <button type="button" class="resize-btn row-dec" title="Diminuir Linhas">- Lin</button>
          <button type="button" class="resize-btn row-inc" title="Aumentar Linhas">+ Lin</button>
        </div>
      `;
      card.appendChild(overlay);

      // Ouvintes dos botões de dimensionamento
      overlay.querySelector('.col-dec').addEventListener('click', (e) => { e.stopPropagation(); changeCardSpan(card, 'col', -1); });
      overlay.querySelector('.col-inc').addEventListener('click', (e) => { e.stopPropagation(); changeCardSpan(card, 'col', 1); });
      overlay.querySelector('.row-dec').addEventListener('click', (e) => { e.stopPropagation(); changeCardSpan(card, 'row', -1); });
      overlay.querySelector('.row-inc').addEventListener('click', (e) => { e.stopPropagation(); changeCardSpan(card, 'row', 1); });
    }
  });

  function getCardSpan(card, type) {
    for (let i = 1; i <= 4; i++) {
      if (card.classList.contains(`${type}-span-${i}`)) {
        return i;
      }
    }
    return 1;
  }

  function changeCardSpan(card, type, amount) {
    const currentSpan = getCardSpan(card, type);
    let newSpan = currentSpan + amount;

    // Limites de spans cibernéticos do Bento Grid
    if (type === 'col') {
      if (newSpan < 1) newSpan = 1;
      if (newSpan > 4) newSpan = 4;
    } else {
      if (newSpan < 1) newSpan = 1;
      if (newSpan > 3) newSpan = 3; // Limite de linhas estendido para 3
    }

    card.classList.remove(`${type}-span-${currentSpan}`);
    card.classList.add(`${type}-span-${newSpan}`);

    saveGridLayoutSpans();
  }

  function saveGridLayoutSpans() {
    const spans = {};
    grid.querySelectorAll('.bento-card').forEach(card => {
      spans[card.id] = {
        col: getCardSpan(card, 'col'),
        row: getCardSpan(card, 'row')
      };
    });
    localStorage.setItem('crom_grid_spans', JSON.stringify(spans));
  }

  function saveGridLayoutOrder() {
    const order = [];
    grid.querySelectorAll('.bento-card').forEach(card => {
      order.push(card.id);
    });
    localStorage.setItem('crom_grid_order', JSON.stringify(order));
  }

  // Alternar o Modo Edição no Grid
  let isEditing = false;
  editToggleBtn.addEventListener('click', () => {
    isEditing = !isEditing;
    grid.classList.toggle('edit-mode-active', isEditing);
    editToggleBtn.classList.toggle('active', isEditing);

    // Atualiza tema para personalizado nas configurações se editou livremente
    if (isEditing) {
      const selectTheme = document.getElementById('setting-layout-theme');
      if (selectTheme) {
        selectTheme.value = 'custom';
        localStorage.setItem('crom_layout_theme', 'custom');
      }
    }

    // Configura propriedade draggable nativa
    cards.forEach(card => {
      card.setAttribute('draggable', isEditing ? 'true' : 'false');
    });
  });

  // --- CONTROLES DE ARRASTAR E SOLTAR (DRAG & DROP) NATIVOS HTML5 ---
  let draggedCard = null;

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      if (!isEditing) return;
      draggedCard = card;
      card.style.opacity = '0.4';
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      if (!isEditing) return;
      card.style.opacity = '1';
      draggedCard = null;
      saveGridLayoutOrder();
    });

    card.addEventListener('dragover', (e) => {
      if (!isEditing || !draggedCard || draggedCard === card) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    card.addEventListener('drop', (e) => {
      if (!isEditing || !draggedCard || draggedCard === card) return;
      e.preventDefault();

      // Inserir antes ou depois dependendo do centro geométrico do card
      const rect = card.getBoundingClientRect();
      const insertNext = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;

      if (insertNext) {
        card.parentNode.insertBefore(draggedCard, card.nextSibling);
      } else {
        card.parentNode.insertBefore(draggedCard, card);
      }
      saveGridLayoutOrder();
    });
  });
}

/* ==========================================================================
   8. MÓDULO DE PREDEFINIÇÕES DE LAYOUT (TEMAS DE ORGANIZAÇÃO)
   ========================================================================== */
function applyLayoutPreset(presetName) {
  const grid = document.querySelector('.bento-grid');
  if (!grid) return;

  const presets = {
    productivity: {
      spans: {
        'card-clock': { col: 2, row: 1 }, // Relógio
        'card-search': { col: 2, row: 1 }, // Busca
        'card-notes': { col: 2, row: 1 }, // Notas
        'card-philosophy': { col: 2, row: 1 }, // Novidades CROM
        'card-tabnews': { col: 2, row: 1 }, // TabNews
        'card-shortcuts': { col: 4, row: 1 } // Atalhos
      },
      visibility: { clock: true, notes: true, philosophy: true, tabnews: true }
    },
    minimalist: {
      spans: {
        'card-clock': { col: 4, row: 1 }, // Relógio expandido
        'card-search': { col: 4, row: 1 }, // Busca
        'card-notes': { col: 2, row: 1 }, // Notas
        'card-philosophy': { col: 2, row: 1 }, // Novidades CROM
        'card-tabnews': { col: 2, row: 1 }, // TabNews
        'card-shortcuts': { col: 4, row: 1 } // Atalhos
      },
      visibility: { clock: true, notes: false, philosophy: false, tabnews: false }
    },
    technical: {
      spans: {
        'card-clock': { col: 2, row: 1 }, // Relógio
        'card-search': { col: 2, row: 1 }, // Busca
        'card-notes': { col: 2, row: 1 }, // Notas
        'card-philosophy': { col: 2, row: 1 }, // Novidades CROM
        'card-tabnews': { col: 4, row: 2 }, // TabNews em destaque gigante!
        'card-shortcuts': { col: 4, row: 1 } // Atalhos
      },
      visibility: { clock: true, notes: true, philosophy: true, tabnews: true }
    }
  };

  const preset = presets[presetName];
  if (!preset) return;

  // 1. Aplicar Spans
  Object.keys(preset.spans).forEach(id => {
    const card = document.getElementById(id);
    if (card) {
      for (let i = 1; i <= 4; i++) {
        card.classList.remove(`col-span-${i}`);
        card.classList.remove(`row-span-${i}`);
      }
      card.classList.add(`col-span-${preset.spans[id].col}`);
      card.classList.add(`row-span-${preset.spans[id].row}`);
    }
  });

  // Salvar spans salvos no localStorage
  localStorage.setItem('crom_grid_spans', JSON.stringify(preset.spans));

  // 2. Aplicar Visibilidades no Body
  document.body.classList.toggle('clock-hidden', !preset.visibility.clock);
  document.body.classList.toggle('notes-hidden', !preset.visibility.notes);
  document.body.classList.toggle('philosophy-hidden', !preset.visibility.philosophy);
  document.body.classList.toggle('tabnews-hidden', !preset.visibility.tabnews);

  // 3. Sincronizar switches na modal de configurações gerais
  const toggleClock = document.getElementById('setting-toggle-clock');
  const toggleNotes = document.getElementById('setting-toggle-notes');
  const togglePhilosophy = document.getElementById('setting-toggle-philosophy');
  const toggleTabNews = document.getElementById('setting-toggle-tabnews');

  if (toggleClock) toggleClock.checked = preset.visibility.clock;
  if (toggleNotes) toggleNotes.checked = preset.visibility.notes;
  if (togglePhilosophy) togglePhilosophy.checked = preset.visibility.philosophy;
  if (toggleTabNews) toggleTabNews.checked = preset.visibility.tabnews;

  // Persistir as configurações de visibilidade
  const visibilitySettings = {
    clock: preset.visibility.clock,
    notes: preset.visibility.notes,
    philosophy: preset.visibility.philosophy,
    tabnews: preset.visibility.tabnews
  };
  localStorage.setItem('crom_settings_visibility', JSON.stringify(visibilitySettings));
}
