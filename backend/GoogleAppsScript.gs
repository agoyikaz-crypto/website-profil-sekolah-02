// Google Apps Script Backend for PPDB and Payment Forms
// Deployment: Web App, Execute as: Me, Who has access: Anyone
// ALL RESPONSES RETURN VALID JSON ONLY

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    Logger.log('=== NEW REQUEST ===');
    Logger.log('Method: ' + method);
    Logger.log('Parameters: ' + JSON.stringify(e.parameters));
    Logger.log('PostData: ' + JSON.stringify(e.postData));
    Logger.log('Contents: ' + JSON.stringify(e.contents));
    
    // Get form type to determine which sheet to use
    const formType = e.parameter.formType || e.parameters.formType || '';
    Logger.log('Form Type: ' + formType);
    
    if (!formType) {
      throw new Error('formType is required');
    }
    
    let result;
    if (formType === 'ppdb') {
      result = handlePPDBSubmission(e);
    } else if (formType === 'pembayaran') {
      result = handlePaymentSubmission(e);
    } else {
      throw new Error('Invalid form type: ' + formType);
    }
    
    Logger.log('Result: ' + JSON.stringify(result));
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    const errorResponse = {
      status: 'error',
      message: error.toString(),
      timestamp: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handlePPDBSubmission(e) {
  const sheetName = 'PPDB';
  Logger.log('Handling PPDB submission');
  
  try {
    const sheet = getOrCreateSheet(sheetName);
    Logger.log('Sheet retrieved/created: ' + sheetName);
    
    // Set headers if sheet is new
    if (sheet.getLastRow() === 0) {
      const headers = [
        'formType',
        'Nama Lengkap',
        'NISN', 
        'Tempat Lahir',
        'Tanggal Lahir',
        'Jenis Kelamin',
        'No HP',
        'Email',
        'Jurusan',
        'Alamat',
        'uploadFoto',
        'Waktu pendaftaran'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      Logger.log('Created headers for PPDB sheet: ' + JSON.stringify(headers));
    }
    
    // Get headers from first row
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Sheet headers: ' + JSON.stringify(headers));
    
    // Map form data to columns - handle both parameter and parameters
    const newRow = headers.map(header => {
      let value = '';
      if (e.parameter[header]) {
        value = e.parameter[header];
      } else if (e.parameters[header]) {
        value = e.parameters[header] instanceof Array ? e.parameters[header][0] : e.parameters[header];
      }
      Logger.log('Mapping header "' + header + '" to value: "' + value + '"');
      return value;
    });
    
    // Add the new row
    sheet.appendRow(newRow);
    Logger.log('Added new row to PPDB sheet');
    
    return {
      status: 'success',
      message: 'PPDB data saved successfully',
      sheet: sheetName,
      rowCount: sheet.getLastRow(),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('Error in handlePPDBSubmission: ' + error.toString());
    throw error;
  }
}

function handlePaymentSubmission(e) {
  const sheetName = 'Pembayaran';
  Logger.log('Handling Payment submission');
  
  try {
    const sheet = getOrCreateSheet(sheetName);
    Logger.log('Sheet retrieved/created: ' + sheetName);
    
    // Set headers if sheet is new
    if (sheet.getLastRow() === 0) {
      const headers = [
        'formType',
        'Jenis Pembayaran',
        'Detail',
        'Nama',
        'NISN',
        'Nominal',
        'Metode',
        'Bulan',
        'Waktu'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      Logger.log('Created headers for Pembayaran sheet: ' + JSON.stringify(headers));
    }
    
    // Get headers from first row
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Sheet headers: ' + JSON.stringify(headers));
    
    // Map form data to columns - handle both parameter and parameters
    const newRow = headers.map(header => {
      let value = '';
      if (e.parameter[header]) {
        value = e.parameter[header];
      } else if (e.parameters[header]) {
        value = e.parameters[header] instanceof Array ? e.parameters[header][0] : e.parameters[header];
      }
      Logger.log('Mapping header "' + header + '" to value: "' + value + '"');
      return value;
    });
    
    // Add the new row
    sheet.appendRow(newRow);
    Logger.log('Added new row to Pembayaran sheet');
    
    return {
      status: 'success',
      message: 'Payment data saved successfully',
      sheet: sheetName,
      rowCount: sheet.getLastRow(),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('Error in handlePaymentSubmission: ' + error.toString());
    throw error;
  }
}

function getOrCreateSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Getting or creating sheet: ' + sheetName);
  
  try {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      Logger.log('Found existing sheet: ' + sheetName);
      return sheet;
    }
  } catch (error) {
    Logger.log('Error checking for existing sheet: ' + error.toString());
  }
  
  // Create new sheet if it doesn't exist
  try {
    const newSheet = spreadsheet.insertSheet(sheetName);
    Logger.log('Created new sheet: ' + sheetName);
    return newSheet;
  } catch (error) {
    Logger.log('Error creating sheet: ' + error.toString());
    throw new Error('Failed to create sheet ' + sheetName + ': ' + error.toString());
  }
}

// Test function for debugging
function testPPDBSubmission() {
  const testData = {
    parameter: {
      formType: 'ppdb',
      'Nama Lengkap': 'Test Student',
      'NISN': '1234567890',
      'Tempat Lahir': 'Test City',
      'Tanggal Lahir': '2020-01-01',
      'Jenis Kelamin': 'Laki-laki',
      'No HP': '081234567890',
      'Email': 'test@example.com',
      'Jurusan': 'IPA',
      'Alamat': 'Test Address',
      'uploadFoto': 'test.jpg',
      'Waktu pendaftaran': new Date().toLocaleString()
    }
  };
  
  return handlePPDBSubmission(testData);
}

// Test function for payment debugging
function testPaymentSubmission() {
  const testData = {
    parameter: {
      formType: 'pembayaran',
      'Jenis Pembayaran': 'PPDB',
      'Detail': 'Pendaftaran',
      'Nama': 'Test Student',
      'NISN': '1234567890',
      'Nominal': '200000',
      'Metode': 'Transfer',
      'Waktu': new Date().toLocaleString()
    }
  };
  
  return handlePaymentSubmission(testData);
}
