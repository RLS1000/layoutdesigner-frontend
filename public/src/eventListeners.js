// 📁 src/eventListeners.js
import {
  handleTextInputChange,
  handleColorChange,
  handleLayoutSelection
} from './eventHandlers.js';

import { layouts } from './layout.js';
import { canvas } from './canvas.js';
import { appState } from './state.js';
import { renderLayout } from './helpers.js'; // ✅ NEU: zentrales Rendering

export function setupDropdownChange() {
  const layoutSelect = document.getElementById("layout-select");

  // Dropdown befüllen
  layouts.forEach(layout => {
    const option = document.createElement("option");
    option.value = layout.id;
    option.textContent = layout.name;
    layoutSelect.appendChild(option);
  });

  // Layout-Wechsel bei Auswahl (zentral)
  layoutSelect.addEventListener("change", async (e) => {
    const selectedId = parseInt(e.target.value, 10);
    const layout = layouts.find(l => l.id === selectedId);

    if (layout) {
      appState.selectedLayoutId = layout.id;
      await renderLayout(layout); // ✅ zentrale Renderingfunktion
      localStorage.setItem("lastLayoutId", layout.id);
      console.log(`🔄 Layout gewechselt via Dropdown: ${layout.name}`);
    }
  });
}

// 👇 Swipe-Konfiguration
let touchStartX = 0;

export function attachEventListeners() {
  if (window.innerWidth < 768) {
    setupSwipeGestures();
  } else {
    setupDropdownChange();
  }

  // Texteingaben
  document.querySelectorAll('.text-input').forEach(input => {
    input.addEventListener('input', handleTextInputChange);
  });

  // Farbauswahl
  document.querySelectorAll('.color-input').forEach(input => {
    input.addEventListener('input', handleColorChange);
  });

  // Layout-Auswahl (Thumbnails)
  document.querySelectorAll('.layout-thumb').forEach(thumb => {
    thumb.addEventListener('click', handleLayoutSelection);
  });
}

function setupSwipeGestures() {
  const canvasEl = document.getElementById("canvas");
  if (!canvasEl) return;

  canvasEl.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  });

  canvasEl.addEventListener("touchend", async (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) > 50) {
      const direction = deltaX > 0 ? "left" : "right";
      await switchLayout(direction);
    }
  });
}

async function switchLayout(direction) {
  const currentIndex = layouts.findIndex(l => l.id === appState.selectedLayoutId);
  let newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

  if (newIndex < 0) newIndex = layouts.length - 1;
  if (newIndex >= layouts.length) newIndex = 0;

  const layout = layouts[newIndex];
  appState.selectedLayoutId = layout.id;

  await renderLayout(layout); // ✅ zentrale Renderingfunktion
  localStorage.setItem("lastLayoutId", layout.id);

  console.log(`🔁 Neues Layout via Swipe: ${layout.name}`);
}