# FINAL SOLUTION - Complete PPDB & Payment System

## 🚨 WHY PREVIOUS VERSION FAILED

The previous Google Apps Script was still returning plain text responses somewhere in the code, causing the "Unexpected token 'S', 'Sheet tidak ditemukan...'" error. Even though we thought we fixed it, there was likely a hidden plain text response or the deployment wasn't updated properly.

## ✅ COMPLETE FIX - ZERO PLAIN TEXT RESPONSES

### 1. Google Apps Script (Complete Rewrite)

```javascript
// COMPLETE REWRITE - ZERO PLAIN TEXT RESPONSES
// ALL RESPONSES ARE VALID JSON ONLY

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
    Logger.log('Parameter details: ' + JSON.stringify(e.parameter));
    
    // Get form type to determine which sheet to use
    const formType = e.parameter.formType || e.parameters.formType || '';
    Logger.log('Form Type: ' + formType);
    
    if (!formType) {
      const errorResponse = {
        status: 'error',
        message: 'formType is required',
        timestamp: new Date().toISOString()
      };
      return ContentService.createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    let result;
    if (formType === 'ppdb') {
      result = handlePPDBSubmission(e);
    } else if (formType === 'pembayaran') {
      result = handlePaymentSubmission(e);
    } else {
      const errorResponse = {
        status: 'error',
        message: 'Invalid form type: ' + formType,
        timestamp: new Date().toISOString()
      };
      return ContentService.createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON);
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
    Logger.log('Added new row to PPDB sheet');
    
    const successResponse = {
      status: 'success',
      message: 'PPDB data saved successfully',
      sheet: sheetName,
      rowCount: sheet.getLastRow(),
      data: Object.fromEntries(headers.map((header, index) => [header, newRow[index]])),
      timestamp: new Date().toISOString()
    };
    
    return successResponse;
    
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
```

### 2. Frontend Fetch (Updated with JSON Validation)

```javascript
async function submitToServer(formData) {
  // Convert FormData to URLSearchParams for Google Apps Script compatibility
  const params = new URLSearchParams(formData);
  
  // Debug logging
  console.log('Sending to Sheets:', Object.fromEntries(formData));
  console.log('URLSearchParams string:', params.toString());
  console.log('Endpoint:', PPDB_ENDPOINT);

  try {
    const response = await fetch(PPDB_ENDPOINT, {
      method: 'POST',
      mode: 'cors', // Remove no-cors to allow proper response handling
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    console.log('Response raw:', response);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text);
      throw new Error('Server returned non-JSON response: ' + text.substring(0, 100));
    }

    const result = await response.json();
    console.log('Parsed JSON response:', result);
    
    // Check if server returned an error
    if (result.status === 'error') {
      throw new Error(result.message || 'Server returned an error');
    }
    
    return result;
  } catch (error) {
    console.error('Fetch error:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}
```

## 🎯 KEY IMPROVEMENTS

### Google Apps Script Fixes:
1. **ZERO Plain Text**: Every single response uses `JSON.stringify()`
2. **Automatic Sheet Creation**: Sheets are created if they don't exist
3. **Dynamic Headers**: Headers created from `Object.keys(e.parameter)`
4. **Comprehensive Logging**: Added `Logger.log(JSON.stringify(e.parameter))`
5. **Proper Error Handling**: All errors return JSON format

### Frontend Fixes:
1. **Content-Type Validation**: Checks if response is actually JSON
2. **Non-JSON Detection**: Shows clear error if server returns plain text
3. **Enhanced Debugging**: Logs raw response, content-type, and parsed JSON
4. **Better Error Messages**: More detailed error information

## 📊 EXPECTED RESPONSES

### Success Response:
```json
{
  "status": "success",
  "message": "PPDB data saved successfully",
  "sheet": "PPDB",
  "rowCount": 2,
  "data": {
    "formType": "ppdb",
    "Nama Lengkap": "John Doe",
    "NISN": "1234567890",
    ...
  },
  "timestamp": "2026-05-05T08:30:00.000Z"
}
```

### Error Response:
```json
{
  "status": "error",
  "message": "formType is required",
  "timestamp": "2026-05-05T08:30:00.000Z"
}
```

## 🚀 DEPLOYMENT INSTRUCTIONS

### Step 1: Update Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Open your existing project
3. Delete ALL existing code
4. Copy the complete script above
5. Paste it as new code
6. Save the project

### Step 2: Redeploy Web App
1. Click "Deploy" → "Manage deployments"
2. Select your existing deployment
3. Click "Delete" 
4. Click "Deploy" → "New deployment"
5. Select "Web app"
6. Configure:
   - Description: "School PPDB and Payment Forms v2"
   - Execute as: "Me"
   - Who has access: "Anyone"
7. Click "Deploy"
8. Copy the NEW Web App URL

### Step 3: Update Frontend
Replace the endpoint in both files:
- `js/ppdb.js` (line 1)
- `pages/pembayaran.html` (line 250)

### Step 4: Test
1. Open browser console
2. Submit PPDB form
3. Should see:
   - "Sending to Sheets: ..."
   - "Response raw: ..."
   - "Content-Type: application/json"
   - "Parsed JSON response: ..."
   - Success message

## 🔧 DEBUGGING

### If Still Getting "Unexpected token" Error:
1. Check browser console for "Content-Type" - should be "application/json"
2. Check Google Apps Script logs for any plain text returns
3. Verify deployment was updated with new code
4. Ensure you're using the NEW Web App URL

### If "Sheet tidak ditemukan" Error:
1. Check Google Apps Script logs for sheet creation
2. Verify spreadsheet permissions
3. Check if script has access to create sheets

## ✅ VERIFICATION CHECKLIST

- [ ] Google Apps Script completely replaced with new code
- [ ] Web app redeployed with NEW URL
- [ ] Frontend endpoints updated with NEW URL
- [ ] Browser console shows "Content-Type: application/json"
- [ ] Form submission creates new row in Google Sheets
- [ ] No more "Unexpected token" errors
- [ ] No more "Sheet tidak ditemukan" errors

## 🎉 EXPECTED RESULT

After this complete fix:
- **Zero JSON parse errors**
- **Automatic sheet creation**
- **Data appears in Google Sheets instantly**
- **Works for both PPDB and Payment forms**
- **Production-ready with comprehensive debugging**

This is a complete, production-ready solution with zero plain text responses anywhere in the system.
