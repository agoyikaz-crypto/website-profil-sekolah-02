# Google Apps Script PPDB & Payment Form Setup Guide

## Overview
This guide shows how to set up the Google Apps Script backend to handle PPDB registration and payment form submissions from your school profile website.

## Prerequisites
- Google Account
- Google Sheets (for data storage)
- Google Apps Script (for backend processing)

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "School Registration Data"
3. Keep it empty - the script will create the sheets automatically

## Step 2: Set up Google Apps Script

### Method A: Using the Provided Code
1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Delete the default `Code.gs` file
4. Copy the entire content from `GoogleAppsScript.gs`
5. Paste it into a new file named `Code.gs`
6. Save the project

### Method B: Direct Import
1. In Google Apps Script, click "File" > "Import"
2. Upload the `GoogleAppsScript.gs` file

## Step 3: Deploy as Web App

1. In Google Apps Script, click "Deploy" > "New deployment"
2. Click the gear icon ⚙️ and select "Web app"
3. Configure deployment settings:
   - **Description**: "School PPDB and Payment Forms"
   - **Execute as**: "Me" (your Google account)
   - **Who has access**: "Anyone" (required for public website access)
4. Click "Deploy"
5. **Authorization**: 
   - Google will ask for permissions
   - Review and click "Allow"
   - This allows the script to write to your Google Sheet
6. Copy the Web app URL - this is your new endpoint

## Step 4: Update Frontend Endpoint

Replace the endpoint in both files with your new URL:

### In `js/ppdb.js` (line 1):
```javascript
const PPDB_ENDPOINT = "YOUR_WEB_APP_URL_HERE";
```

### In `pages/pembayaran.html` (line 250):
```javascript
const PPDB_ENDPOINT = "YOUR_WEB_APP_URL_HERE";
```

## Step 5: Test the Setup

### Frontend Testing
1. Open your website's PPDB form
2. Fill in test data
3. Submit the form
4. Check browser console for debug logs
5. Check Google Sheet for new data

### Backend Testing (Optional)
In Google Apps Script, you can run these test functions:
- `testPPDBSubmission()` - Tests PPDB form handling
- `testPaymentSubmission()` - Tests payment form handling

## Expected Google Sheets Structure

### PPDB Sheet
Headers are created automatically:
```
formType | Nama Lengkap | NISN | Tempat Lahir | Tanggal Lahir | Jenis Kelamin | No HP | Email | Jurusan | Alamat | uploadFoto | Waktu pendaftaran
```

### Pembayaran Sheet
Headers are created automatically:
```
formType | Jenis Pembayaran | Detail | Nama | NISN | Nominal | Metode | Bulan | Waktu
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Browser shows CORS policy errors
**Solution**: 
- Ensure Google Apps Script is deployed with "Anyone" access
- Check that the endpoint URL is correct
- Verify the script is saved and deployed

#### 2. No Data in Google Sheets
**Problem**: Form submits but no data appears
**Solution**:
- Check Google Apps Script logs: `View > Logs`
- Verify form field names match exactly
- Ensure formType is being sent correctly

#### 3. Permission Errors
**Problem**: "Authorization required" errors
**Solution**:
- Re-deploy the web app
- Ensure proper permissions are granted
- Check that "Execute as" is set to "Me"

#### 4. Field Name Mismatches
**Problem**: Data appears in wrong columns
**Solution**:
- Check HTML `name` attributes match Google Sheet headers exactly
- Use spaces in headers as they appear in HTML forms
- Verify FormData is sending correct field names

### Debug Logging

#### Frontend Debug Logs
Browser console will show:
- Form data being sent
- Server response status
- Any errors that occur

#### Backend Debug Logs
In Google Apps Script:
1. Go to `View > Logs`
2. Look for entries starting with `=== NEW REQUEST ===`
3. Check parameter mappings and any errors

## Security Considerations

1. **Data Validation**: The script includes basic logging but add input validation as needed
2. **Access Control**: Currently set to "Anyone" - consider restricting if needed
3. **Rate Limiting**: Google Apps Script has built-in rate limiting
4. **Data Privacy**: Ensure compliance with your school's data privacy policies

## Maintenance

1. **Regular Checks**: Monitor Google Sheet for submissions
2. **Log Review**: Check Google Apps Script logs periodically
3. **Backup**: Export Google Sheets data regularly
4. **Updates**: Update script if form fields change

## Field Name Reference

### PPDB Form Fields (must match exactly)
- `formType` (hidden field)
- `Nama Lengkap`
- `NISN`
- `Tempat Lahir`
- `Tanggal Lahir`
- `Jenis Kelamin`
- `No HP`
- `Email`
- `Jurusan`
- `Alamat`
- `uploadFoto`
- `Waktu pendaftaran`

### Payment Form Fields (must match exactly)
- `formType` (hidden field)
- `Jenis Pembayaran`
- `Detail`
- `Nama`
- `NISN`
- `Nominal`
- `Metode`
- `Bulan` (for SPP only)
- `Waktu`

## Success Indicators

✅ Form submission shows success message  
✅ Data appears in correct Google Sheet within seconds  
✅ No CORS errors in browser console  
✅ Google Apps Script logs show successful processing  
✅ All form fields map to correct columns  

If all these are working, your setup is complete!
