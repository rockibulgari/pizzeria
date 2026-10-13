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
