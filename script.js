// ===== Цены — ЕДИНСТВЕННОЕ место, где они хранятся =====
// Поменяли цену здесь — она сама поменяется и в меню, и в корзине.
// id — короткое имя пиццы латиницей, по нему находим цены в меню (data-price="id").

const PIZZAS = [
  { id: 'margarita',   name: 'Маргарита',           prices: { 30: 450, 40: 690 } },
  { id: 'mushroom',    name: 'Грибная',             prices: { 30: 490, 40: 740 } },
  { id: 'pepperoni',   name: 'Пепперони',           prices: { 30: 550, 40: 820 } },
  { id: 'four-cheese', name: 'Четыре сыра',         prices: { 30: 590, 40: 860 } },
  { id: 'meat',        name: 'Мясная',              prices: { 30: 650, 40: 920 } },
  { id: 'nazran',      name: 'Фирменная «Назрань»', prices: { 30: 690, 40: 950 } },
];

const SIZES = [30, 40];

// Правила заказа
const MAX_QUANTITY = 25;        // больше 25 штук одной позиции взять нельзя
const DISCOUNT_FROM = 3;        // скидка — если пицц 40 см в заказе 3 и больше
const DISCOUNT_PERCENT = 15;    // скидка 15% на все пиццы 40 см
const FREE_DELIVERY_FROM = 600; // меньше 600 ₽ — доставка по тарифу такси

// Ссылка на наш WhatsApp: к ней приклеиваем текст заказа
const WHATSAPP_URL = 'https://wa.me/79280000000';

// Красиво пишем сумму: 1690 → «1 690 ₽»
function formatPrice(rubles) {
  return rubles.toLocaleString('ru-RU') + ' ₽';
}

// Копируем текст. Если современный способ недоступен (например, файл открыт с диска) — запасной старый
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  return copied ? Promise.resolve() : Promise.reject();
}

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

// ===== Блок 2. Меню: цены из списка PIZZAS =====

document.querySelectorAll('[data-price]').forEach((priceEl) => {
  const pizza = PIZZAS.find((item) => item.id === priceEl.dataset.price);
  priceEl.textContent = formatPrice(pizza.prices[priceEl.dataset.size]);
});

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

// Надпись на кнопке: «✕ Закрыть», «🛒 Корзина · 3» (если в корзине есть пиццы) или «🍕 Заказать»
function setFabOpen(isOpen) {
  fab.classList.toggle('fab--open', isOpen);
  fabToggle.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    fabToggleText.textContent = '✕ Закрыть';
  } else if (cartCount() > 0) {
    fabToggleText.textContent = `🛒 Корзина · ${cartCount()}`;
  } else {
    fabToggleText.textContent = '🍕 Заказать';
  }
}

// В корзине есть пиццы — открываем корзину. Пусто — раскрываем «Позвонить / Telegram / WhatsApp»
fabToggle.addEventListener('click', () => {
  if (cartCount() > 0) {
    setFabOpen(false);
    openCart();
    return;
  }
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

// ===== Корзина и оформление заказа =====
// Учебный каркас: настоящей оплаты нет. Корзина хранится в браузере (localStorage),
// поэтому не пропадает при обновлении страницы. Данные из формы НИКУДА не сохраняются —
// они только подставляются в текст сообщения.

// Что лежит в корзине: order['pepperoni'][40] = 2 значит «2 Пепперони по 40 см»
// (тот же вид, что был в блоке «Собери заказ», — поэтому расчёт ниже взят оттуда без изменений)
const order = {};
PIZZAS.forEach((pizza) => {
  order[pizza.id] = { 30: 0, 40: 0 };
});

// --- Расчёт заказа (перенесён из блока «Собери заказ» без изменений) ---

// Главный расчёт: из выбранных пицц получаем список, сумму, скидку и итог
function calculateOrder() {
  const items = [];   // выбранные позиции для списка
  let subtotal = 0;   // сумма без скидки
  let sum40 = 0;      // сколько стоят все пиццы 40 см (скидка только на них)
  let count40 = 0;    // сколько всего пицц 40 см в заказе

  PIZZAS.forEach((pizza) => {
    SIZES.forEach((size) => {
      const quantity = order[pizza.id][size];
      if (quantity === 0) return;

      // Сумма позиции = цена нужного размера × количество
      const cost = pizza.prices[size] * quantity;
      items.push({ name: pizza.name, size, quantity, cost });
      subtotal += cost;

      if (size === 40) {
        sum40 += cost;
        count40 += quantity;
      }
    });
  });

  // СКИДКА: если пицц 40 см 3 и больше — минус 15% только от стоимости пицц 40 см.
  // Пиццы 30 см идут по полной цене, их скидка не касается.
  let total = subtotal;
  if (count40 >= DISCOUNT_FROM) {
    // Пиццы 40 см со скидкой: оставляем 85% их стоимости и округляем до рубля вниз
    const sum40WithDiscount = Math.floor(sum40 * (100 - DISCOUNT_PERCENT) / 100);
    total = subtotal - sum40 + sum40WithDiscount;
  }
  const discount = subtotal - total; // на сколько рублей скидка уменьшила сумму

  return { items, subtotal, discount, total };
}

// Готовый текст заказа для WhatsApp и Telegram
function makeOrderText({ items, subtotal, discount, total }) {
  const lines = ['Здравствуйте! Хочу заказать:'];
  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name}, ${item.size} см × ${item.quantity} — ${formatPrice(item.cost)}`);
  });
  lines.push('');
  if (discount > 0) {
    lines.push(`Сумма без скидки: ${formatPrice(subtotal)}`);
    lines.push(`Скидка ${DISCOUNT_PERCENT}% на пиццы 40 см: −${formatPrice(discount)}`);
  }
  lines.push(`Итого: ${formatPrice(total)}`);
  if (total < FREE_DELIVERY_FROM) {
    lines.push('Заказ меньше 600 ₽ — доставка по тарифу такси.');
  }
  return lines.join('\n');
}

// --- Хранение корзины в браузере ---

const CART_STORAGE_KEY = 'pizza-nazran-cart';

// Достаём корзину из браузера. Берём только правильные числа: целое от 1 до 25.
// Если что-то сломано — корзина просто остаётся пустой.
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || {};
    PIZZAS.forEach((pizza) => {
      SIZES.forEach((size) => {
        const quantity = saved[pizza.id] && saved[pizza.id][size];
        if (Number.isInteger(quantity) && quantity > 0) {
          order[pizza.id][size] = Math.min(MAX_QUANTITY, quantity);
        }
      });
    });
  } catch (error) {
    // Сохранённая корзина испорчена — начинаем с пустой
  }
}

// Запоминаем корзину в браузере
function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(order));
  } catch (error) {
    // Браузер не даёт сохранять (например, приватный режим) — корзина живёт до закрытия страницы
  }
}

loadCart();

// Сколько всего пицц в корзине
function cartCount() {
  let count = 0;
  PIZZAS.forEach((pizza) => {
    SIZES.forEach((size) => {
      count += order[pizza.id][size];
    });
  });
  return count;
}

// «1 пицца», «2 пиццы», «5 пицц»
function pizzaWord(count) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'пицц';
  if (last === 1) return 'пицца';
  if (last >= 2 && last <= 4) return 'пиццы';
  return 'пицц';
}

// Положить одну пиццу в корзину. Вернёт false, если этой позиции уже 25 штук
function addToCart(id, size) {
  if (order[id][size] >= MAX_QUANTITY) return false;
  order[id][size] += 1;
  saveCart();
  renderCart();
  return true;
}

// Кнопки «−» и «+» в корзине: количество от 1 до 25 (убрать совсем — кнопкой «Удалить»)
function changeQuantity(id, size, step) {
  order[id][size] = Math.min(MAX_QUANTITY, Math.max(1, order[id][size] + step));
  saveCart();
  renderCart();
}

function removeFromCart(id, size) {
  order[id][size] = 0;
  saveCart();
  renderCart();
}

// --- Уведомление «Добавлено в корзину» ---

const toast = document.getElementById('toast');
let toastTimer;

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('toast--visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('toast--visible'), 2000);
}

// --- Меню: кнопка «В корзину» берёт размер, выбранный в карточке ---

document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.pizza-card');
    const size = Number(card.querySelector('.size__input:checked').value);
    const added = addToCart(button.dataset.addToCart, size);
    showToast(added ? '✅ Добавлено в корзину' : `Больше ${MAX_QUANTITY} штук одной позиции нельзя`);
  });
});

// --- Окно корзины ---

const cartDialog = document.getElementById('cart');
const cartButton = document.getElementById('cartButton');
const cartCountBadge = document.getElementById('cartCount');
const cartTitle = document.getElementById('cartTitle');
const cartBack = document.getElementById('cartBack');
const cartClose = document.getElementById('cartClose');
const cartViews = cartDialog.querySelectorAll('.cart__view');
const cartEmpty = document.getElementById('cartEmpty');
const cartItems = document.getElementById('cartItems');
const cartFoot = document.getElementById('cartFoot');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartDiscountRow = document.getElementById('cartDiscountRow');
const cartDiscount = document.getElementById('cartDiscount');
const cartTotal = document.getElementById('cartTotal');
const cartTaxi = document.getElementById('cartTaxi');
const checkoutButton = document.getElementById('checkoutButton');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutDiscount = document.getElementById('checkoutDiscount');

// Заголовок окна на каждом шаге
const STEP_TITLES = {
  cart: 'Корзина',
  checkout: 'Оформление',
  send: 'Отправка',
};

let currentStep = 'cart';

// Показываем один шаг из трёх: корзина → форма → выбор мессенджера
function showStep(step) {
  currentStep = step;
  cartViews.forEach((view) => {
    view.hidden = view.dataset.view !== step;
  });
  cartTitle.textContent = STEP_TITLES[step];
  cartBack.hidden = step === 'cart';
}

function openCart() {
  renderCart();
  showStep('cart');
  cartDialog.showModal();
}

cartButton.addEventListener('click', openCart);
cartClose.addEventListener('click', () => cartDialog.close());

cartDialog.addEventListener('click', (event) => {
  // Нажали на тёмный фон вокруг окна — закрываем
  if (event.target === cartDialog) {
    cartDialog.close();
  }
  // Ссылка «Выбрать пиццу» ведёт в меню — сначала закрываем окно
  if (event.target.closest('a[href^="#"]')) {
    cartDialog.close();
  }
});

// «← Назад»: из формы — в корзину, из выбора мессенджера — в форму
cartBack.addEventListener('click', () => {
  showStep(currentStep === 'send' ? 'checkout' : 'cart');
});

// Рисуем корзину заново после каждого изменения
function renderCart() {
  const result = calculateOrder();
  const count = cartCount();
  const isEmpty = count === 0;

  // Значок в шапке
  cartCountBadge.textContent = count;
  cartCountBadge.hidden = isEmpty;
  cartButton.setAttribute('aria-label', isEmpty ? 'Корзина: пусто' : `Корзина: ${count} ${pizzaWord(count)}`);

  // Надпись на плавающей кнопке
  setFabOpen(false);

  // Позиции: название, размер, «− количество +», стоимость, «Удалить»
  // (по названию находим пиццу в списке PIZZAS, чтобы знать её id и цену за штуку)
  cartItems.innerHTML = result.items.map((item) => {
    const pizza = PIZZAS.find((p) => p.name === item.name);
    return `
    <li class="cart-item" data-id="${pizza.id}" data-size="${item.size}">
      <div class="cart-item__info">
        <span class="cart-item__name">${item.name}</span>
        <span class="cart-item__meta">${item.size} см · ${formatPrice(pizza.prices[item.size])} за шт.</span>
      </div>
      <div class="cart-item__qty">
        <button class="qty__btn qty__btn--minus" type="button" data-step="-1"
          aria-label="Убрать одну: ${item.name}, ${item.size} см" ${item.quantity === 1 ? 'disabled' : ''}>−</button>
        <span class="qty__value">${item.quantity}</span>
        <button class="qty__btn qty__btn--plus" type="button" data-step="1"
          aria-label="Добавить ещё: ${item.name}, ${item.size} см" ${item.quantity === MAX_QUANTITY ? 'disabled' : ''}>+</button>
      </div>
      <span class="cart-item__cost">${formatPrice(item.cost)}</span>
      <button class="cart-item__remove" type="button" data-remove
        aria-label="Удалить: ${item.name}, ${item.size} см">Удалить</button>
    </li>
  `;
  }).join('');

  cartEmpty.hidden = !isEmpty;
  cartItems.hidden = isEmpty;
  cartFoot.hidden = isEmpty;

  // Сумма без скидки, скидка (если есть) и итог
  cartSubtotal.textContent = formatPrice(result.subtotal);
  cartDiscountRow.hidden = result.discount === 0;
  cartDiscount.textContent = '−' + formatPrice(result.discount);
  cartTotal.textContent = formatPrice(result.total);

  // Меньше 600 ₽ — предупреждаем про такси, но заказать всё равно можно
  cartTaxi.hidden = isEmpty || result.total >= FREE_DELIVERY_FROM;

  // Итог внизу формы
  checkoutTotal.textContent = formatPrice(result.total);
  checkoutDiscount.hidden = result.discount === 0;
  checkoutDiscount.textContent = `С учётом скидки ${DISCOUNT_PERCENT}% на пиццы 40 см: −${formatPrice(result.discount)}`;
}

// Кнопки внутри списка: «−», «+» и «Удалить»
cartItems.addEventListener('click', (event) => {
  const item = event.target.closest('.cart-item');
  if (!item) return;
  const id = item.dataset.id;
  const size = Number(item.dataset.size);

  if (event.target.closest('[data-remove]')) {
    removeFromCart(id, size);
    // Строка пропала — чтобы фокус не потерялся, ставим его на кнопку «Закрыть»
    cartClose.focus();
    return;
  }

  const button = event.target.closest('.qty__btn');
  if (button) {
    changeQuantity(id, size, Number(button.dataset.step));
    // Список нарисован заново — возвращаем фокус на ту же кнопку, удобно жать подряд
    const sameButton = cartItems.querySelector(
      `.cart-item[data-id="${id}"][data-size="${size}"] .qty__btn[data-step="${button.dataset.step}"]`);
    if (sameButton && !sameButton.disabled) sameButton.focus();
  }
});

// «Оформить заказ» — переходим к форме
checkoutButton.addEventListener('click', () => {
  if (cartCount() === 0) return;
  showStep('checkout');
  orderName.focus();
});

// --- Форма заказа ---

const checkoutForm = document.getElementById('checkoutForm');
const orderName = document.getElementById('orderName');
const orderPhone = document.getElementById('orderPhone');
const orderAddress = document.getElementById('orderAddress');
const orderComment = document.getElementById('orderComment');
const paymentDemo = document.getElementById('paymentDemo');
const requiredFields = [orderName, orderPhone, orderAddress];

// Связываем каждое поле с его подсказкой об ошибке — так её прочитает и экранный диктор
requiredFields.forEach((input) => {
  const error = input.closest('.field').querySelector('.field__error');
  error.id = input.id + 'Error';
  input.setAttribute('aria-describedby', error.id);
});

// Проверяем одно поле: пустое — подсвечиваем красным. В телефоне — хотя бы 10 цифр
function validateField(input) {
  const value = input.value.trim();
  let isValid = value !== '';

  if (input === orderPhone) {
    const error = document.getElementById('orderPhoneError');
    if (isValid && value.replace(/\D/g, '').length < 10) {
      isValid = false;
      error.textContent = 'Проверьте номер: в нём должно быть не меньше 10 цифр';
    } else {
      error.textContent = 'Укажите телефон — оператор перезвонит для подтверждения';
    }
  }

  input.closest('.field').classList.toggle('field--error', !isValid);
  input.setAttribute('aria-invalid', String(!isValid));
  return isValid;
}

// Поле подсвечено — как только его исправили, подсветка уходит
requiredFields.forEach((input) => {
  input.addEventListener('input', () => {
    if (input.closest('.field').classList.contains('field--error')) {
      validateField(input);
    }
  });
});

// Способ оплаты. «Онлайн» пока нельзя: показываем пометку «Демо»
// и возвращаем выбор на оплату курьеру (ту, что была выбрана до этого)
let lastCourierPayment = 'Наличными курьеру';

checkoutForm.addEventListener('change', (event) => {
  if (event.target.name !== 'payment') return;

  if (event.target.value === 'Онлайн') {
    paymentDemo.hidden = false;
    checkoutForm.querySelector(`input[name="payment"][value="${lastCourierPayment}"]`).checked = true;
  } else {
    lastCourierPayment = event.target.value;
    paymentDemo.hidden = true;
  }
});

// --- Отправка: WhatsApp или Telegram ---

const orderWhatsApp = document.getElementById('orderWhatsApp');
const orderTelegram = document.getElementById('orderTelegram');
const orderStatus = document.getElementById('orderStatus');
let cartOrderText = '';

// Полный текст заказа: пиццы, скидка, итог (из makeOrderText) и данные из формы
function makeCartOrderText(result) {
  const payment = checkoutForm.querySelector('input[name="payment"]:checked').value;
  const lines = [makeOrderText(result), ''];
  lines.push(`Имя: ${orderName.value.trim()}`);
  lines.push(`Телефон: ${orderPhone.value.trim()}`);
  lines.push(`Адрес: ${orderAddress.value.trim()}`);
  if (orderComment.value.trim() !== '') {
    lines.push(`Комментарий: ${orderComment.value.trim()}`);
  }
  lines.push(`Оплата: ${payment}`);
  return lines.join('\n');
}

// «Заказать»: проверяем имя, телефон и адрес. Всё заполнено — показываем выбор мессенджера
checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const checks = requiredFields.map(validateField);
  const firstInvalid = requiredFields.find((input, index) => !checks[index]);
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  cartOrderText = makeCartOrderText(calculateOrder());
  orderWhatsApp.href = WHATSAPP_URL + '?text=' + encodeURIComponent(cartOrderText);
  orderStatus.textContent = '';
  showStep('send');
});

// Telegram: копируем текст заказа, а сама ссылка открывает наш Telegram
orderTelegram.addEventListener('click', () => {
  copyText(cartOrderText)
    .then(() => {
      orderStatus.textContent = 'Текст заказа скопирован — вставьте его в чат';
    })
    .catch(() => {
      orderStatus.textContent = 'Не получилось скопировать. Отправьте заказ через WhatsApp или позвоните нам.';
    });
});

// Первый показ: число на значке корзины и надпись на плавающей кнопке
renderCart();
