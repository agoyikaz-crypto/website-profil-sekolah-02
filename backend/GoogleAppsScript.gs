// COMPLETE REWRITE - ZERO PLAIN TEXT RESPONSES
// ALL RESPONSES ARE VALID JSON ONLY

function doGet(e) {
  try {
    Logger.log('=== doGet START ===');
    Logger.log('Event parameters: ' + JSON.stringify(e.parameter));
    Logger.log('Event parameters (alt): ' + JSON.stringify(e.parameters));
    
    // For PPDB GET requests, directly call handlePPDBRetrieval
    const formType = e.parameter.formType || e.parameters.formType || 'ppdb';
    const action = e.parameter.action || e.parameters.action || '';
    
    Logger.log('doGet - FormType: ' + formType + ', Action: ' + action);
    
    let result;
    if (formType === 'ppdb' && !action) {
      // Direct PPDB data retrieval
      Logger.log('doGet - Direct PPDB retrieval');
      result = handlePPDBRetrieval(e);
    } else {
      // Use handleRequest for other cases
      Logger.log('doGet - Using handleRequest');
      result = handleRequest(e, 'GET');
    }
    
    Logger.log('doGet - Result: ' + JSON.stringify(result));
    Logger.log('=== doGet END ===');
    
    // Set content type to JSON
    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('ERROR in doGet: ' + error.toString());
    Logger.log('ERROR stack: ' + error.stack);
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.toString(),
        timestamp: new Date().toISOString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // Set content type to JSON
    return ContentService.createTextOutput(
      JSON.stringify(handleRequest(e, 'POST'))
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('ERROR in doPost: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.toString(),
        timestamp: new Date().toISOString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleRequest(e, method) {
  try {
    Logger.log('=== NEW REQUEST ===');
    Logger.log('Method: ' + method);
    Logger.log('Parameters: ' + JSON.stringify(e.parameters));
    Logger.log('PostData: ' + JSON.stringify(e.postData));
    Logger.log('Contents: ' + JSON.stringify(e.contents));
    Logger.log('Parameter details: ' + JSON.stringify(e.parameter));
    
    // Get form type to determine which sheet function handleRequest(e, method)
  const formType = e.parameter.formType || e.parameters.formType || 'ppdb'; // Default to 'ppdb'
  const action = e.parameter.action || e.parameters.action || '';
  Logger.log('Form Type: ' + formType);
  Logger.log('Action: ' + action);
  Logger.log('Method: ' + method);
  
  let result;
  if (formType === 'ppdb') {
    if (method === 'GET') {
      if (action === 'updateStatus') {
        result = handleStatusUpdate(e);
      } else if (action === 'get') {
        result = handleGetStudent(e);
      } else if (action === 'update') {
        result = handleStudentUpdate(e);
      } else if (action === 'delete') {
        result = handleStudentDelete(e);
      } else {
        result = handlePPDBRetrieval(e);
      }
    } else if (method === 'POST') {
      if (action === 'create') {
        result = handlePPDBSubmission(e);
      } else {
        result = handlePPDBSubmission(e);
      }
    }
  } else if (formType === 'pembayaran') {
    if (method === 'GET') {
      result = handlePaymentRetrieval(e);
    } else {
      result = handlePaymentSubmission(e);
    }
  } else {
    const errorResponse = {
      status: 'error',
      message: 'Invalid form type: ' + formType,
      timestamp: new Date().toISOString()
    };
    return errorResponse;
  }
  
  Logger.log('Result: ' + JSON.stringify(result));
  
  return result;
      
} catch (error) {
  Logger.log('ERROR: ' + error.toString());
  Logger.log('Stack: ' + error.stack);
  
  const errorResponse = {
    status: 'error',
    message: error.toString(),
    timestamp: new Date().toISOString()
  };
  
  return errorResponse;
}  }
}

function handlePPDBRetrieval(e) {
  const sheetName = 'PPDB';
  Logger.log('=== PPDB RETRIEVAL START ===');
  Logger.log('Sheet Name: ' + sheetName);
  Logger.log('Parameters: ' + JSON.stringify(e.parameter));
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('Spreadsheet found: ' + spreadsheet.getName());
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    Logger.log('Sheet found: ' + (sheet ? sheet.getName() : 'NOT FOUND'));
    
    if (!sheet) {
      Logger.log('Sheet does not exist - creating new sheet');
      const newSheet = spreadsheet.insertSheet(sheetName);
      Logger.log('New sheet created: ' + newSheet.getName());
      return {
        status: 'success',
        message: 'Sheet created, no data yet',
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      };
    }
    
    Logger.log('Sheet last row: ' + sheet.getLastRow());
    Logger.log('Sheet last column: ' + sheet.getLastColumn());
    
    // Use getDataRange() to get ALL data automatically
    const dataRange = sheet.getDataRange();
    Logger.log('Data range: ' + dataRange.getA1Notation());
    
    const values = dataRange.getValues();
    Logger.log('Raw values retrieved: ' + values.length + ' rows using getDataRange()');
    
    if (values.length <= 1) {
      Logger.log('No data found - only headers present or empty sheet');
      return {
        status: 'success',
        message: 'No PPDB data found',
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      };
    }
    
    // Convert to array of objects
    const headers = values[0];
    Logger.log('Headers: ' + JSON.stringify(headers));
    Logger.log('Headers count: ' + headers.length);
    
    const rows = values.slice(1).map((row, index) => {
      const obj = {};
      headers.forEach((header, headerIndex) => {
        obj[header] = row[headerIndex] || '';
      });
      obj.rowNumber = index + 2; // Add row number for reference
      
      // Generate ID for existing rows without ID
      if (!obj.ID || obj.ID === '') {
        const generatedId = 'PPDB-' + (index + 1).toString().padStart(4, '0');
        obj.ID = generatedId;
        Logger.log('Generated ID for existing row: ' + generatedId + ' at row ' + (index + 2));
      }
      
      return obj;
    });
    
    Logger.log('Converted to objects: ' + rows.length + ' rows');
    
    // Keep natural Google Sheets order (oldest at top, newest at bottom)
    Logger.log('FIRST ROW (oldest): ' + JSON.stringify(rows[0]));
    Logger.log('LAST ROW (newest): ' + JSON.stringify(rows[rows.length - 1]));
    
    // Log newest row details
    if (rows.length > 0) {
      Logger.log('Oldest row (index 0): ' + JSON.stringify(rows[0]));
      Logger.log('Newest row (last index): ' + JSON.stringify(rows[rows.length - 1]));
      Logger.log('Oldest registration time: ' + (rows[0]['Waktu pendaftaran'] || 'NOT FOUND'));
      Logger.log('Newest registration time: ' + (rows[rows.length - 1]['Waktu pendaftaran'] || 'NOT FOUND'));
      Logger.log('Oldest ID: ' + (rows[0].ID || 'NOT FOUND'));
      Logger.log('Newest ID: ' + (rows[rows.length - 1].ID || 'NOT FOUND'));
    }
    
    // Optional filtering and pagination
    const status = e.parameter.status;
    const limit = parseInt(e.parameter.limit) || 100;
    const offset = parseInt(e.parameter.offset) || 0;
    
    Logger.log('Filters - Status: ' + status + ', Limit: ' + limit + ', Offset: ' + offset);
    
    let filteredRows = rows;
    
    if (status) {
      filteredRows = rows.filter(row => {
        const rowStatus = row.Status || row['Status'] || '';
        return rowStatus.toLowerCase() === status.toLowerCase();
      });
      Logger.log('After status filter: ' + filteredRows.length + ' rows');
    }
    
    // Apply pagination
    const paginatedRows = filteredRows.slice(offset, offset + limit);
    Logger.log('After pagination: ' + paginatedRows.length + ' rows (showing rows ' + (offset + 1) + ' to ' + (offset + limit) + ')');
    
    const response = {
      status: 'success',
      message: 'PPDB data retrieved successfully',
      data: paginatedRows,
      total: filteredRows.length,
      count: paginatedRows.length,
      offset: offset,
      limit: limit,
      timestamp: new Date().toISOString()
    };
    
    Logger.log('PPDB retrieval response: ' + JSON.stringify(response));
    Logger.log('=== PPDB RETRIEVAL END ===');
    return response;
    
  } catch (error) {
    Logger.log('ERROR in handlePPDBRetrieval: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    const errorResponse = {
      status: 'error',
      message: 'Failed to retrieve PPDB data: ' + error.toString(),
      timestamp: new Date().toISOString()
    };
    
    return errorResponse;
  }
}

function handlePPDBSubmission(e) {
  const sheetName = 'PPDB';
  Logger.log('Handling PPDB submission');
  
  try {
    const sheet = getOrCreateSheet(sheetName);
    Logger.log('Sheet retrieved/created: ' + sheetName);
    
    // Force header creation from parameter keys if sheet is empty
    if (sheet.getLastRow() === 0) {
      const headers = ['ID', 'Nama Lengkap', 'NISN', 'Tempat Lahir', 'Tanggal Lahir', 'Jenis Kelamin', 'Alamat', 'No HP', 'Email', 'Waktu pendaftaran', 'Status'];
      Logger.log('Creating headers with ID column: ' + JSON.stringify(headers));
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Get current headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Sheet headers: ' + JSON.stringify(headers));
    
    // Ensure ID column exists
    const idColumnIndex = headers.indexOf('ID');
    if (idColumnIndex === -1) {
      // Add ID column as first column
      headers.unshift('ID');
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      Logger.log('Added ID column to headers');
    }
    
    // Generate unique ID for new submission
    const lastRow = sheet.getLastRow();
    let newId;
    
    if (lastRow <= 1) {
      // First submission
      newId = 'PPDB-0001';
    } else {
      // Get last ID and increment
      const lastIdCell = sheet.getRange(lastRow, 1).getValue(); // ID is first column
      Logger.log('Last ID found: ' + lastIdCell);
      
      if (lastIdCell && lastIdCell.startsWith('PPDB-')) {
        const lastNumber = parseInt(lastIdCell.replace('PPDB-', '')) || 0;
        const newNumber = lastNumber + 1;
        newId = 'PPDB-' + newNumber.toString().padStart(4, '0');
      } else {
        // Fallback: count all rows and generate new ID
        const totalRows = lastRow - 1; // Subtract header row
        newId = 'PPDB-' + (totalRows + 1).toString().padStart(4, '0');
      }
    }
    
    Logger.log('Generated new ID: ' + newId);
    
    // Prepare submission data with ID
    const submissionData = [
      newId, // ID
      e.parameter['Nama Lengkap'] || e.parameter.namaLengkap || '',
      e.parameter.NISN || e.parameter.nisn || '',
      e.parameter['Tempat Lahir'] || e.parameter.tempatLahir || '',
      e.parameter['Tanggal Lahir'] || e.parameter.tanggalLahir || '',
      e.parameter['Jenis Kelamin'] || e.parameter.jenisKelamin || '',
      e.parameter.Alamat || e.parameter.alamat || '',
      e.parameter['No HP'] || e.parameter.noHp || '',
      e.parameter.Email || e.parameter.email || '',
      new Date().toISOString(), // Waktu pendaftaran
      'Pending' // Status
    ];
    
    // Add the new row
    sheet.appendRow(submissionData);
    Logger.log('Added new row to PPDB sheet with ID: ' + newId);
    
    const successResponse = {
      status: 'success',
      message: 'PPDB data saved successfully',
      sheet: sheetName,
      rowCount: sheet.getLastRow(),
      data: {
        ID: newId,
        'Nama Lengkap': e.parameter['Nama Lengkap'] || e.parameter.namaLengkap || '',
        NISN: e.parameter.NISN || e.parameter.nisn || '',
        'Waktu pendaftaran': new Date().toISOString(),
        Status: 'Pending'
      },
      timestamp: new Date().toISOString()
    };
    
    return successResponse;
    
  } catch (error) {
    Logger.log('Error in handlePPDBSubmission: ' + error.toString());
    throw error;
  }
}

function handlePaymentRetrieval(e) {
  const sheetName = 'Pembayaran';
  Logger.log('Handling Payment retrieval');
  
  try {
    const sheet = getOrCreateSheet(sheetName);
    Logger.log('Sheet retrieved: ' + sheetName);
    
    // Get all data from sheet
    const dataRange = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
    const values = dataRange.getValues();
    
    if (values.length <= 1) {
      return {
        status: 'success',
        message: 'No payment data found',
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      };
    }
    
    // Convert to array of objects
    const headers = values[0];
    const rows = values.slice(1).map((row, index) => {
      const obj = {};
      headers.forEach((header, headerIndex) => {
        obj[header] = row[headerIndex] || '';
      });
      obj.rowNumber = index + 2; // Add row number for reference
      return obj;
    });
    
    // Optional filtering and pagination
    const status = e.parameter.status;
    const limit = parseInt(e.parameter.limit) || 100;
    const offset = parseInt(e.parameter.offset) || 0;
    
    let filteredRows = rows;
    
    if (status) {
      filteredRows = rows.filter(row => {
        const rowStatus = row.Status || row['Status'] || '';
        return rowStatus.toLowerCase() === status.toLowerCase();
      });
    }
    
    // Apply pagination
    const paginatedRows = filteredRows.slice(offset, offset + limit);
    
    const response = {
      status: 'success',
      message: 'Payment data retrieved successfully',
      data: paginatedRows,
      total: filteredRows.length,
      count: paginatedRows.length,
      offset: offset,
      limit: limit,
      timestamp: new Date().toISOString()
    };
    
    Logger.log('Payment retrieval response: ' + JSON.stringify(response));
    return response;
    
  } catch (error) {
    Logger.log('Error in handlePaymentRetrieval: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    const errorResponse = {
      status: 'error',
      message: 'Failed to retrieve payment data: ' + error.toString(),
      timestamp: new Date().toISOString()
    };
    
    return errorResponse;
  }
}

function handlePaymentSubmission(e) {
  const sheetName = 'Pembayaran';
  Logger.log('Handling Payment submission');
  
  try {
    const sheet = getOrCreateSheet(sheetName);
    Logger.log('Sheet retrieved/created: ' + sheetName);
    
    // Force header creation from parameter keys if sheet is empty
    if (sheet.getLastRow() === 0) {
      const headers = Object.keys(e.parameter);
      Logger.log('Creating headers from parameter keys: ' + JSON.stringify(headers));
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
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
    
    const successResponse = {
      status: 'success',
      message: 'Payment data saved successfully',
      sheet: sheetName,
      rowCount: sheet.getLastRow(),
      data: Object.fromEntries(headers.map((header, index) => [header, newRow[index]])),
      timestamp: new Date().toISOString()
    };
    
    return successResponse;
    
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

function handleStatusUpdate(e) {
  const sheetName = 'PPDB';
  Logger.log('=== STATUS UPDATE START ===');
  Logger.log('Student ID: ' + e.parameter.id);
  Logger.log('New Status: ' + e.parameter.status);
  
  try {
    const sheet = getOrCreateSheet(sheetName);
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    const rows = dataRange.slice(1);
    
    // Find row by ID
    const rowIndex = rows.findIndex(row => {
      const rowId = row[headers.indexOf('ID')] || '';
      return rowId === e.parameter.id;
    });
    
    if (rowIndex === -1) {
      const errorResponse = {
        status: 'error',
        message: 'Student not found with ID: ' + e.parameter.id,
        timestamp: new Date().toISOString()
      };
      return errorResponse;
    }
    
    // Update status
    const statusColumnIndex = headers.indexOf('Status');
    const actualRow = rowIndex + 2; // +2 for header row and 0-based index
    sheet.getRange(actualRow, statusColumnIndex + 1).setValue(e.parameter.status);
    
    Logger.log('Status updated successfully for row ' + actualRow);
    
    const response = {
      status: 'success',
      message: 'Status updated successfully',
      data: {
        id: e.parameter.id,
        status: e.parameter.status
      },
      timestamp: new Date().toISOString()
    };
    
    Logger.log('=== STATUS UPDATE END ===');
    return response;
    
  } catch (error) {
    Logger.log('ERROR in handleStatusUpdate: ' + error.toString());
    const errorResponse = {
      status: 'error',
      message: 'Failed to update status: ' + error.toString(),
      timestamp: new Date().toISOString()
    };
    return errorResponse;
  }
}

function handleGetStudent(e) {
  const sheetName = 'PPDB';
  Logger.log('=== GET STUDENT START ===');
  Logger.log('Student ID: ' + e.parameter.id);
  
  try {
    const sheet = getOrCreateSheet(sheetName);
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    const rows = dataRange.slice(1);
    
    // Find row by ID
    const rowIndex = rows.findIndex(row => {
      const rowId = row[headers.indexOf('ID')] || '';
      return rowId === e.parameter.id;
    });
    
    if (rowIndex === -1) {
      const errorResponse = {
        status: 'error',
        message: 'Student not found with ID: ' + e.parameter.id,
        timestamp: new Date().toISOString()
      };
      return errorResponse;
    }
    
    // Get student data
    const actualRow = rowIndex + 2; // +2 for header row and 0-based index
    const studentData = {};
    headers.forEach((header, index) => {
      studentData[header] = rows[rowIndex][index];
    });
    
    Logger.log('Student retrieved successfully: ' + JSON.stringify(studentData));
    
    const response = {
      status: 'success',
      message: 'Student retrieved successfully',
      data: studentData,
      timestamp: new Date().toISOString()
    };
    
    Logger.log('=== GET STUDENT END ===');
    return response;
    
  } catch (error) {
    Logger.log('ERROR in handleGetStudent: ' + error.toString());
    const errorResponse = {
      status: 'error',
      message: 'Failed to retrieve student: ' + error.toString(),
      timestamp: new Date().toISOString()
    };
    return errorResponse;
  }
}

function handleStudentUpdate(e) {
  const sheetName = 'PPDB';
  Logger.log('=== STUDENT UPDATE START ===');
  Logger.log('Student ID: ' + e.parameter.id);
  Logger.log('Update Data: ' + JSON.stringify(e.parameter));
  
  try {
    const sheet = getOrCreateSheet(sheetName);
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    const rows = dataRange.slice(1);
    
    // Find row by ID
    const rowIndex = rows.findIndex(row => {
      const rowId = row[headers.indexOf('ID')] || '';
      return rowId === e.parameter.id;
    });
    
    if (rowIndex === -1) {
      const errorResponse = {
        status: 'error',
        message: 'Student not found with ID: ' + e.parameter.id,
        timestamp: new Date().toISOString()
      };
      return errorResponse;
    }
    
    // Update student data
    const actualRow = rowIndex + 2; // +2 for header row and 0-based index
    headers.forEach((header, index) => {
      if (e.parameter[header]) {
        sheet.getRange(actualRow, index + 1).setValue(e.parameter[header]);
      }
    });
    
    Logger.log('Student updated successfully at row ' + actualRow);
    
    const response = {
      status: 'success',
      message: 'Student updated successfully',
      data: {
        id: e.parameter.id
      },
      timestamp: new Date().toISOString()
    };
    
    Logger.log('=== STUDENT UPDATE END ===');
    return response;
    
  } catch (error) {
    Logger.log('ERROR in handleStudentUpdate: ' + error.toString());
    const errorResponse = {
      status: 'error',
      message: 'Failed to update student: ' + error.toString(),
      timestamp: new Date().toISOString()
    };
    return errorResponse;
  }
}

function handleStudentDelete(e) {
  const sheetName = 'PPDB';
  Logger.log('=== STUDENT DELETE START ===');
  Logger.log('Student ID: ' + e.parameter.id);
  
  try {
    const sheet = getOrCreateSheet(sheetName);
    const dataRange = sheet.getDataRange().getValues();
    const headers = dataRange[0];
    const rows = dataRange.slice(1);
    
    // Find row by ID
    const rowIndex = rows.findIndex(row => {
      const rowId = row[headers.indexOf('ID')] || '';
      return rowId === e.parameter.id;
    });
    
    if (rowIndex === -1) {
      const errorResponse = {
        status: 'error',
        message: 'Student not found with ID: ' + e.parameter.id,
        timestamp: new Date().toISOString()
      };
      return errorResponse;
    }
    
    // Delete row
    const actualRow = rowIndex + 2; // +2 for header row and 0-based index
    sheet.deleteRow(actualRow);
    
    Logger.log('Student deleted successfully at row ' + actualRow);
    
    const response = {
      status: 'success',
      message: 'Student deleted successfully',
      data: {
        id: e.parameter.id
      },
      timestamp: new Date().toISOString()
    };
    
    Logger.log('=== STUDENT DELETE END ===');
    return response;
    
  } catch (error) {
    Logger.log('ERROR in handleStudentDelete: ' + error.toString());
    const errorResponse = {
      status: 'error',
      message: 'Failed to delete student: ' + error.toString(),
      timestamp: new Date().toISOString()
    };
    return errorResponse;
  }
}
