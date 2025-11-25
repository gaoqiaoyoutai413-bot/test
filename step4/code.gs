function doGet(e) {
  var action = e.parameter.action;

  if (action == 'read') {
    return readExpenses();
  }

  // GitHub PagesのURL（ご自身の環境に合わせて変更してください）
  var appUrl = "https://gaoqiaoyoutai413-bot.github.io/test/step4/index.html";

  var html = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f2f5; }
          .container { text-align: center; padding: 2rem; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          h1 { color: #6366f1; margin-bottom: 1rem; }
          p { color: #64748b; margin-bottom: 2rem; }
          .btn { display: inline-block; padding: 1rem 2rem; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; text-decoration: none; border-radius: 12px; font-weight: bold; transition: opacity 0.2s; }
          .btn:hover { opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Expense Tracker API</h1>
          <p>APIは正常に稼働しています。</p>
          <a href="${appUrl}" class="btn" target="_blank">アプリを開く</a>
        </div>
      </body>
    </html>
  `;

  return HtmlService.createHtmlOutput(html)
    .setTitle("Expense Tracker API")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var action = e.parameter.action;

  if (action == 'add') {
    return addExpense(e);
  } else if (action == 'delete') {
    return deleteExpense(e);
  }

  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

function readExpenses() {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  var expenses = data.map(function(row) {
    return {
      id: row[4], // Timestamp as ID for simplicity, or column 5
      date: row[0], // Date format might need adjustment
      category: row[1],
      amount: row[2],
      memo: row[3]
    };
  });

  // Sort by date desc (optional)
  expenses.reverse();

  return ContentService.createTextOutput(JSON.stringify(expenses))
    .setMimeType(ContentService.MimeType.JSON);
}

function addExpense(e) {
  var sheet = getSheet();
  
  // Create header if it doesn't exist
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Date", "Category", "Amount", "Memo", "ID"]);
  }

  var date = e.parameter.date;
  var category = e.parameter.category;
  var amount = e.parameter.amount;
  var memo = e.parameter.memo;
  var id = e.parameter.id || new Date().getTime().toString(); // Use passed ID or generate new

  sheet.appendRow([date, category, amount, memo, id]);

  return ContentService.createTextOutput(JSON.stringify({status: 'success', id: id}))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteExpense(e) {
  var sheet = getSheet();
  var id = e.parameter.id;
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    // Column 5 is ID (index 4)
    if (data[i][4] == id) {
      sheet.deleteRow(i + 1);
      return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'ID not found'}))
    .setMimeType(ContentService.MimeType.JSON);
}
