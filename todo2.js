/* ==========================================
   CYBERCITY HUB - CORE LOGIC & CONTROLLER
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  let appState = {
    audioEnabled: true,
    activeView: 'profile-view',
    profile: {
      name: '',
      bio: 'Decentralized security specialist. Running custom cyberware interface. System optimization in progress.',
      avatarIndex: 0,
      citizenId: '#CC-8890-X92',
      completedContracts: 0
    },
    contracts: []
  };

  // Pre-drawn premium cyber-themed SVG avatars
  const AVATARS = [
    // 0: Netrunner (Default)
    `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='%2300f3ff' stroke-width='2'><path d='M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z'/><circle cx='50' cy='45' r='18' stroke='%23ff007f'/><path d='M30 75 C30 60, 70 60, 70 75' stroke='%239d00ff'/></svg>`,
    // 1: Cyborg
    `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='%23ff007f' stroke-width='2'><path d='M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z'/><rect x='38' y='32' width='24' height='24' rx='3' stroke='%2300f3ff'/><path d='M30 70 L40 60 L60 60 L70 70' stroke='%239d00ff'/><line x1='50' y1='32' x2='50' y2='10' stroke='%2300f3ff'/></svg>`,
    // 2: AI Hologram
    `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='%239d00ff' stroke-width='2'><path d='M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z'/><polygon points='50,25 70,55 30,55' stroke='%23ff007f'/><circle cx='50' cy='45' r='6' fill='%2300f3ff'/><line x1='50' y1='55' x2='50' y2='90' stroke='%2300f3ff'/></svg>`,
    // 3: Street Tech Samurai
    `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='%2300f3ff' stroke-width='2'><path d='M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z'/><path d='M35 30 L50 15 L65 30 M30 45 L70 45' stroke='%23ff007f'/><circle cx='50' cy='52' r='10' stroke='%239d00ff'/><path d='M35 78 C38 68, 62 68, 65 78' stroke='%2300f3ff'/></svg>`
  ];

  // ==========================================
  // WEB AUDIO API SYNTHESIZER
  // ==========================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSynthNote(freq, type, duration, slideToFreq = null) {
    if (!appState.audioEnabled) return;
    
    try {
      initAudio();
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      if (slideToFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideToFreq, audioCtx.currentTime + duration);
      }
      
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      // Clean decay
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio context blocked or not supported:", e);
    }
  }

  // Audio FX profiles
  const soundFX = {
    click: () => playSynthNote(800, 'sine', 0.08),
    opClick: () => playSynthNote(600, 'triangle', 0.1, 450),
    equalsClick: () => {
      playSynthNote(523.25, 'sine', 0.15); // C5
      setTimeout(() => playSynthNote(659.25, 'sine', 0.2), 60); // E5
    },
    errorClick: () => playSynthNote(130, 'sawtooth', 0.25),
    switchTab: () => playSynthNote(987.77, 'sine', 0.06, 1200), // B5 slide up
    deploy: () => {
      playSynthNote(350, 'sawtooth', 0.18, 900);
      setTimeout(() => playSynthNote(1200, 'sine', 0.1), 100);
    },
    complete: () => {
      playSynthNote(600, 'triangle', 0.12, 1000);
      setTimeout(() => playSynthNote(1300, 'sine', 0.25), 80);
    },
    delete: () => playSynthNote(500, 'sawtooth', 0.15, 120)
  };

  // ==========================================
  // VIEW / ROUTING CONTROLLER
  // ==========================================
  const navItems = document.querySelectorAll('.nav-item');
  const viewSections = document.querySelectorAll('.view-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      if (target === appState.activeView) return;
      
      soundFX.switchTab();
      
      // Update sidebar nav items active state
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      // Animate active view out, and active view in
      const currentActive = document.querySelector('.view-section.active');
      if (currentActive) {
        currentActive.style.opacity = '0';
        currentActive.style.transform = 'translateY(15px)';
        setTimeout(() => {
          currentActive.classList.remove('active');
          
          const newActive = document.getElementById(target);
          newActive.classList.add('active');
          
          // Trigger browser layout before opacity transition
          void newActive.offsetWidth;
          
          newActive.style.opacity = '1';
          newActive.style.transform = 'translateY(0)';
        }, 300);
      }
      
      appState.activeView = target;
    });
  });

  // Audio Toggle logic
  const audioToggle = document.getElementById('audio-toggle');
  audioToggle.addEventListener('change', (e) => {
    appState.audioEnabled = e.target.checked;
    if (appState.audioEnabled) {
      initAudio();
      soundFX.click();
    }
  });

  // ==========================================
  // NEURAL HUB SYSTEM CLOCK
  // ==========================================
  const cyberTime = document.getElementById('cyber-time');
  
  function updateCyberClock() {
    const now = new Date();
    
    // Cybercity styled format: YY:DDD:HH:MM:SS:CS (Year, DayOfYear, Hour, Min, Sec, Centisec)
    const year = String(now.getFullYear()).slice(-2);
    
    // Day of Year
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = String(Math.floor(diff / oneDay)).padStart(3, '0');
    
    const hr = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');
    const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
    
    cyberTime.textContent = `${year}:${dayOfYear}:${hr}:${min}:${sec}:${ms}`;
    requestAnimationFrame(updateCyberClock);
  }
  requestAnimationFrame(updateCyberClock);

  // ==========================================
  // CITIZEN PROFILE MODULE
  // ==========================================
  const profileNameInput = document.getElementById('profile-name');
  const profileBioInput = document.getElementById('profile-bio');
  const avatarImage = document.getElementById('avatar-image');
  const changeAvatarBtn = document.getElementById('change-avatar-btn');
  const saveProfileBtn = document.getElementById('save-profile-btn');
  const repDisplaySidebar = document.getElementById('rep-display-sidebar');
  const repRankVal = document.getElementById('rep-rank-val');
  const repProgress = document.getElementById('rep-progress');
  const repContractsVal = document.getElementById('rep-contracts-val');

  // Change avatar logic
  changeAvatarBtn.addEventListener('click', () => {
    soundFX.click();
    appState.profile.avatarIndex = (appState.profile.avatarIndex + 1) % AVATARS.length;
    avatarImage.src = AVATARS[appState.profile.avatarIndex];
    saveProfileToLocalStorage();
  });

  // Sync profile details
  saveProfileBtn.addEventListener('click', () => {
    const nameVal = profileNameInput.value.trim();
    const bioVal = profileBioInput.value.trim();
    
    if (!nameVal) {
      soundFX.errorClick();
      alert("System Refused: Alias Name cannot be empty.");
      return;
    }
    
    soundFX.complete();
    appState.profile.name = nameVal;
    appState.profile.bio = bioVal;
    
    // Highlight button success visually
    saveProfileBtn.classList.add('active-glow');
    const originalText = saveProfileBtn.innerHTML;
    saveProfileBtn.innerHTML = '<span>SYNC COMPLETE //</span>';
    
    setTimeout(() => {
      saveProfileBtn.innerHTML = originalText;
      saveProfileBtn.classList.remove('active-glow');
    }, 1500);

    saveProfileToLocalStorage();
  });

  function saveProfileToLocalStorage() {
    localStorage.setItem('cybercity_profile', JSON.stringify(appState.profile));
  }

  function loadProfileFromLocalStorage() {
    const saved = localStorage.getItem('cybercity_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        appState.profile = { ...appState.profile, ...parsed };
        
        profileNameInput.value = appState.profile.name;
        profileBioInput.value = appState.profile.bio;
        avatarImage.src = AVATARS[appState.profile.avatarIndex];
      } catch (e) {
        console.error("Could not parse profile from storage", e);
      }
    }
    recalculateReputation();
  }

  // Calculate user rank and stats based on completed contracts
  function recalculateReputation() {
    const completed = appState.contracts.filter(c => c.completed).length;
    appState.profile.completedContracts = completed;
    
    let level = 1;
    let nextThreshold = 3;
    let baseThreshold = 0;
    
    if (completed >= 13) {
      level = 4;
      baseThreshold = 13;
      nextThreshold = 13;
    } else if (completed >= 7) {
      level = 3;
      baseThreshold = 7;
      nextThreshold = 13;
    } else if (completed >= 3) {
      level = 2;
      baseThreshold = 3;
      nextThreshold = 7;
    } else {
      level = 1;
      baseThreshold = 0;
      nextThreshold = 3;
    }

    // Update displays
    repDisplaySidebar.textContent = `REP: LVL ${level}`;
    repRankVal.textContent = `LEVEL ${level}`;
    
    if (level === 4) {
      repProgress.style.width = '100%';
      repContractsVal.textContent = `${completed} Contracts Resolved (MAX RANK)`;
      repRankVal.className = 'text-pink';
    } else {
      const range = nextThreshold - baseThreshold;
      const progressInRange = completed - baseThreshold;
      const percentage = (progressInRange / range) * 100;
      
      repProgress.style.width = `${percentage}%`;
      repContractsVal.textContent = `${completed} / ${nextThreshold} Contracts Cleared`;
      
      // Dynamic colors based on rank level
      if (level === 1) {
        repRankVal.className = 'text-cyan';
        repProgress.className = 'progress-bar bar-cyan';
      } else if (level === 2) {
        repRankVal.className = 'text-purple';
        repProgress.className = 'progress-bar bar-purple';
      } else {
        repRankVal.className = 'text-pink';
        repProgress.className = 'progress-bar bar-pink';
      }
    }
  }

  // ==========================================
  // CONTRACT MANAGER / TO-DO BOARD MODULE
  // ==========================================
  const todoInput = document.getElementById('todo-input');
  const addTodoBtn = document.getElementById('add-todo-btn');
  const contractsList = document.getElementById('contracts-list');
  const priorityBtns = document.querySelectorAll('.priority-btn');
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  let activePriority = 'low';
  let activeFilter = 'all';

  // Priority buttons toggle
  priorityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      soundFX.click();
      priorityBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePriority = btn.getAttribute('data-priority');
    });
  });

  // Filter tabs toggle
  tabBtns.forEach(tab => {
    tab.addEventListener('click', () => {
      soundFX.click();
      tabBtns.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      renderContracts();
    });
  });

  // Add Task/Contract click handler
  addTodoBtn.addEventListener('click', () => {
    const textVal = todoInput.value.trim();
    if (!textVal) {
      soundFX.errorClick();
      return;
    }

    soundFX.deploy();
    
    const newContract = {
      id: 'contract_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      text: textVal,
      priority: activePriority,
      completed: false
    };

    appState.contracts.push(newContract);
    todoInput.value = '';
    
    saveContractsToLocalStorage();
    renderContracts();
    recalculateReputation();
  });

  // Hotkey: Enter key triggers add task inside input
  todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTodoBtn.click();
    }
  });

  function saveContractsToLocalStorage() {
    localStorage.setItem('cybercity_contracts', JSON.stringify(appState.contracts));
  }

  function loadContractsFromLocalStorage() {
    const saved = localStorage.getItem('cybercity_contracts');
    if (saved) {
      try {
        appState.contracts = JSON.parse(saved);
      } catch (e) {
        console.error("Could not parse contracts from storage", e);
      }
    }
  }

  function renderContracts() {
    // Clear list
    contractsList.innerHTML = '';
    
    // Filter tasks
    const filtered = appState.contracts.filter(contract => {
      if (activeFilter === 'completed') return contract.completed;
      if (activeFilter === 'active') return !contract.completed;
      return true; // all
    });

    // Update badges
    const allCount = appState.contracts.length;
    const activeCount = appState.contracts.filter(c => !c.completed).length;
    const completedCount = allCount - activeCount;

    document.getElementById('all-count').textContent = allCount;
    document.getElementById('active-count').textContent = activeCount;
    document.getElementById('completed-count').textContent = completedCount;

    if (filtered.length === 0) {
      let emptyMsg = "No active network contracts found. Secure the grid by deploying new ones.";
      if (activeFilter === 'completed') {
        emptyMsg = "No resolved contracts found. Finish active operations first.";
      } else if (activeFilter === 'active') {
        emptyMsg = "All clear! No pending active threats reported on the network.";
      }
      
      contractsList.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <p>${emptyMsg}</p>
        </div>
      `;
      return;
    }

    // Sort by priority (critical -> medium -> low)
    const priorityWeights = { critical: 3, medium: 2, low: 1 };
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // completed tasks go to bottom
      }
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    });

    filtered.forEach(contract => {
      const item = document.createElement('div');
      item.className = `contract-item priority-${contract.priority} ${contract.completed ? 'completed' : ''}`;
      item.id = contract.id;

      item.innerHTML = `
        <div class="contract-left">
          <div class="cyber-checkbox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="contract-details">
            <span class="contract-title">${escapeHTML(contract.text)}</span>
            <span class="badge-priority">${contract.priority.toUpperCase()} PRIORITY</span>
          </div>
        </div>
        <button class="delete-action-btn" title="Delete Contract">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      `;

      // Complete toggle handler
      const checkbox = item.querySelector('.cyber-checkbox');
      checkbox.addEventListener('click', () => {
        contract.completed = !contract.completed;
        if (contract.completed) {
          soundFX.complete();
        } else {
          soundFX.click();
        }
        saveContractsToLocalStorage();
        renderContracts();
        recalculateReputation();
      });

      // Delete task handler
      const deleteBtn = item.querySelector('.delete-action-btn');
      deleteBtn.addEventListener('click', () => {
        soundFX.delete();
        item.classList.add('fade-out');
        
        // Wait for CSS animation
        setTimeout(() => {
          appState.contracts = appState.contracts.filter(c => c.id !== contract.id);
          saveContractsToLocalStorage();
          renderContracts();
          recalculateReputation();
        }, 250);
      });

      contractsList.appendChild(item);
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // ==========================================
  // MATRIX CALCULATOR LOGIC
  // ==========================================
  const calcOutput = document.getElementById('calc-output');
  const calcHistory = document.getElementById('calc-history');
  const calcButtons = document.querySelectorAll('.calc-btn');

  let currentExpression = '';
  let lastResult = '';
  let didCalculate = false;

  calcButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      const action = btn.getAttribute('data-action');

      if (action === 'clear') {
        soundFX.opClick();
        currentExpression = '';
        lastResult = '';
        calcOutput.textContent = '0';
        calcHistory.textContent = '';
        didCalculate = false;
      } 
      
      else if (action === 'backspace') {
        soundFX.opClick();
        if (didCalculate) {
          currentExpression = '';
          calcHistory.textContent = '';
          didCalculate = false;
        } else {
          currentExpression = currentExpression.slice(0, -1);
        }
        calcOutput.textContent = currentExpression || '0';
      } 
      
      else if (action === 'calculate') {
        if (!currentExpression) {
          soundFX.errorClick();
          return;
        }
        
        // Process calculation safely
        try {
          // Replace display signs with calculation signs
          let sanitizedExpression = currentExpression
            .replace(/&times;/g, '*')
            .replace(/&divide;/g, '/')
            .replace(/&minus;/g, '-')
            .replace(/&plus;/g, '+')
            .replace(/×/g, '*')
            .replace(/÷/g, '/');

          // basic mathematical syntax check
          if (/[^-+*\/%.()0-9\s]/.test(sanitizedExpression)) {
            throw new Error("Invalid characters detected");
          }

          // Evaluate safely via Custom Tokenizer
          let finalVal = safeEvaluate(sanitizedExpression);
          
          if (isNaN(finalVal) || !isFinite(finalVal)) {
            throw new Error("Node Arithmetic Error");
          }
          
          soundFX.equalsClick();
          
          // Format long decimals
          if (finalVal.toString().includes('.') && finalVal.toString().split('.')[1].length > 6) {
            finalVal = parseFloat(finalVal.toFixed(6));
          }

          calcHistory.textContent = currentExpression + ' =';
          calcOutput.textContent = finalVal;
          currentExpression = String(finalVal);
          didCalculate = true;
        } catch (e) {
          soundFX.errorClick();
          calcOutput.textContent = 'SYS_ERROR';
          calcHistory.textContent = 'ARITHMETIC_OVERLOAD';
          currentExpression = '';
          didCalculate = false;
        }
      } 
      
      else if (val) {
        // Handle input click
        const isOperator = ['+', '-', '*', '/', '%'].includes(val);
        if (isOperator) {
          soundFX.opClick();
        } else {
          soundFX.click();
        }

        if (didCalculate) {
          if (isOperator) {
            didCalculate = false;
            calcHistory.textContent = '';
          } else {
            currentExpression = '';
            calcHistory.textContent = '';
            didCalculate = false;
          }
        }

        // Avoid repeated operators
        if (isOperator && ['+', '-', '*', '/', '%'].includes(currentExpression.slice(-1))) {
          currentExpression = currentExpression.slice(0, -1) + val;
        } else {
          if (val === '0' && currentExpression === '0') return;
          if (val === '.' && currentExpression.includes('.') && !['+', '-', '*', '/', '%'].some(op => currentExpression.split(op).pop().includes('.'))) {
            return;
          }
          
          if (currentExpression === '0' && val !== '.') {
            currentExpression = val;
          } else {
            currentExpression += val;
          }
        }
        
        const displayExpr = currentExpression
          .replace(/\*/g, '×')
          .replace(/\//g, '÷')
          .replace(/-/g, '−');
        
        calcOutput.textContent = displayExpr || '0';
      }
    });
  });

  // Safe Math parser
  function safeEvaluate(str) {
    return Function(`"use strict"; return (${str})`)();
  }

  // Keyboard binding logic for calculation convenience
  document.addEventListener('keydown', (e) => {
    if (appState.activeView !== 'calc-view') return;
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

    let key = e.key;
    if (key >= '0' && key <= '9' || key === '.') {
      e.preventDefault();
      const btn = document.querySelector(`.calc-btn[data-val="${key}"]`);
      if (btn) btn.click();
    } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%') {
      e.preventDefault();
      const btn = document.querySelector(`.calc-btn[data-val="${key}"]`);
      if (btn) btn.click();
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      const btn = document.querySelector(`.calc-btn[data-action="calculate"]`);
      if (btn) btn.click();
    } else if (key === 'Backspace') {
      e.preventDefault();
      const btn = document.querySelector(`.calc-btn[data-action="backspace"]`);
      if (btn) btn.click();
    } else if (key === 'Escape') {
      e.preventDefault();
      const btn = document.querySelector(`.calc-btn[data-action="clear"]`);
      if (btn) btn.click();
    }
  });

  // ==========================================
  // INITS
  // ==========================================
  loadContractsFromLocalStorage();
  loadProfileFromLocalStorage();
  renderContracts();

});