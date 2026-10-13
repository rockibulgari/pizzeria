// ===== Блок 0. Шапка =====

const header = document.getElementById('header');
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');

// Открыть / закрыть меню на телефоне
function setMenuOpen(isOpen) {
  nav.classList.toggle('nav--open', isOpen);
  burger.classList.toggle('burger--open', isOpen);
  burger.setAttribute('aria-expanded', String(isOpen));
  burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
}

burger.addEventListener('click', () => {
  setMenuOpen(!nav.classList.contains('nav--open'));
});

// После нажатия на пункт меню — закрываем его
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    setMenuOpen(false);
  }
});

// Тень у шапки, когда страницу прокрутили вниз
function updateHeaderShadow() {
  header.classList.toggle('header--scrolled', window.scrollY > 10);
}

window.addEventListener('scroll', updateHeaderShadow);
updateHeaderShadow();

// ===== Блок 6. Контакты: карта =====
// На сенсорных экранах поверх карты лежит накладка, чтобы карта не мешала листать страницу.
// Нажали на накладку — карту можно двигать. Нажали мимо карты или ушли от неё — накладка возвращается.

const map = document.getElementById('map');
const mapCover = document.getElementById('mapCover');

function setMapActive(isActive) {
  map.classList.toggle('map--active', isActive);
}

mapCover.addEventListener('click', () => setMapActive(true));

document.addEventListener('pointerdown', (event) => {
  if (!map.contains(event.target)) {
    setMapActive(false);
  }
});

new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) {
    setMapActive(false);
  }
}).observe(map);

// ===== Плавающая кнопка «Заказать» =====

const fab = document.getElementById('fab');
const fabToggle = document.getElementById('fabToggle');
const fabToggleText = fabToggle.querySelector('.fab__toggle-text');
const footer = document.getElementById('footer');

function setFabOpen(isOpen) {
  fab.classList.toggle('fab--open', isOpen);
  fabToggle.setAttribute('aria-expanded', String(isOpen));
  fabToggleText.textContent = isOpen ? '✕ Закрыть' : '🍕 Заказать';
}

fabToggle.addEventListener('click', () => {
  setFabOpen(!fab.classList.contains('fab--open'));
});

// Закрываем после выбора способа связи, по нажатию мимо и по Esc
fab.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    setFabOpen(false);
  }
});

document.addEventListener('pointerdown', (event) => {
  if (!fab.contains(event.target)) {
    setFabOpen(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setFabOpen(false);
  }
});

// Когда виден подвал — прячем кнопку, чтобы она не закрывала его кнопки связи
new IntersectionObserver(([entry]) => {
  fab.classList.toggle('fab--hidden', entry.isIntersecting);
  if (entry.isIntersecting) {
    setFabOpen(false);
  }
}).observe(footer);
