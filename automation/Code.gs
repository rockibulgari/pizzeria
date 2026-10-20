function testRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.appendRow([new Date(), 'Тест', '+70000000000', 'Маргарита 40 см × 1', 690, 'новый']);
}
function sendTelegram(text) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('BOT_TOKEN');
  const chatId = props.getProperty('ADMIN_ID');
  const url = 'https://api.telegram.org/bot' + token + '/sendMessage';

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, text: text }),
    muteHttpExceptions: true
  });
  Logger.log(response.getContentText());
}

function testTelegram() {
  sendTelegram('Привет из Google Таблицы 👋');
}function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply(false, 'не JSON');
  }

  const name = String(data.name || '').trim().slice(0, 50);
  const phone = String(data.phone || '').replace(/[\s()-]/g, '');
  const order = String(data.order || '').trim().slice(0, 500);
  const total = Number(data.total);

  if (!name || !/^\+?\d{10,12}$/.test(phone) || !order || !(total > 0 && total < 100000)) {
    return reply(false, 'неверные данные');
  }

  let sheetOk = true;
  try {
    SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
      .appendRow([new Date(), name, phone, order, total, 'новый']);
  } catch (err) {
    sheetOk = false;
  }

  sendTelegram('🌐 Заявка с сайта\n' + name + ', ' + phone + '\n' + order + '\nСумма: ' + total + ' ₽' +
    (sheetOk ? '' : '\n⚠️ В таблицу НЕ записалось — внесите вручную!'));

  return reply(true, 'принято');
}

function reply(ok, message) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

function testDoPost() {
  doPost({ postData: { contents: JSON.stringify({
    name: 'Тест с сайта', phone: '+79000000000', order: 'Пепперони 30 см × 2', total: 1100
  }) } });
}
function reportFor(daysAgo) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const rows = sheet.getDataRange().getValues().slice(1);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysAgo);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  let count = 0, sum = 0;
  rows.forEach(function (r) {
    const d = new Date(r[0]);
    if (d >= start && d < end) {
      count++;
      sum += Number(r[4]) || 0;
    }
  });

  const label = Utilities.formatDate(start, 'Europe/Moscow', 'dd.MM.yyyy');
  sendTelegram('📊 Отчёт за ' + label +
    '\nЗаявок с сайта: ' + count +
    '\nСумма: ' + sum + ' ₽' +
    (count ? '\nСредний чек: ' + Math.round(sum / count) + ' ₽' : ''));
}

function dailyReport() { reportFor(1); }
function testReportToday() { reportFor(0); }

