function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Create header if it doesn't exist
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Date", "Category", "Amount", "Memo", "Timestamp"]);
  }

  var date = e.parameter.date;
  var category = e.parameter.category;
  var amount = e.parameter.amount;
  var memo = e.parameter.memo;
  var timestamp = new Date();

  sheet.appendRow([date, category, amount, memo, timestamp]);

  return ContentService.createTextOutput("Success")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  return ContentService.createTextOutput("Expense Tracker API is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}
