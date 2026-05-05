function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    Logger.log(JSON.stringify(e.parameter));
    
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var formType = e.parameter.formType;
    
    if (!formType) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "formType is required",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheetName = (formType === "ppdb") ? "PPDB" : "Pembayaran";
    
    var sheet = doc.getSheetByName(sheetName);
    if (!sheet) {
      sheet = doc.insertSheet(sheetName);
    }
    
    if (sheet.getLastRow() === 0) {
      var headers = Object.keys(e.parameter);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;

    var newRow = headers.map(function(header) {
      return e.parameter[header] || ""; 
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data saved successfully",
      sheet: sheetName,
      rowCount: sheet.getLastRow(),
      data: Object.fromEntries(headers.map(function(header, index) {
        return [header, newRow[index]];
      })),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (f) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: f.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
