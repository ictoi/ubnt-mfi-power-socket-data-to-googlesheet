/*
* 
* NAME:
* 
* Ubiquiti Networks mFi Power Socket Data Push to Google Spreadsheet
* 
* LICENSE:
* 
* Copyright (C) 2015 Václav VESELÝ ⊂ ICTOI, s.r.o.; www.ictoi.com
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* PREREQUISITES
* 
* target spreadsheet locale has to be set to United States (decimal place and date format compatibility)
* works only with socket mFi mPower mini (tested only on EU version but should be similar to US)
*
* INSTALLATION
*
* create new google spreadsheet
* go to Google Apps Script editor "Tools > Script Editor"
* copy and paste whole this script to the code editor
* adjust variables bellow in GVAR object
* publish the script as a web app (see https://developers.google.com/apps-script/guides/web#deploying_a_script_as_a_web_app)
* publish the web app with options "Execute the app as: me (your@email.address)" and "Who has access to the app: Anyone, even anonymous" (yes this is not secure :)
* run this function and authorize the script in the first run "Run > doPost"
* copy the webapp URL and update it in the line bellow starting with "cron.1.job.1.cmd" (line is long look for https://script.google.com...)
* adjust schedule in the line bellow starting with "cron.1.job.1.schedule" (see crontab http://unixhelp.ed.ac.uk/CGI/man-cgi?crontab+5)
* ssh to mfi ip address

ssh ubnt@YOUR.MFI.IP.ADDRESS

* default login ubnt:ubnt
* edit /tmp/system.cfg (see vi editor commands http://www.cs.rit.edu/~cslab/vi.html)

vi /tmp/system.cfg

* add following 4 lines at the end of the file:

cron.1.job.1.schedule=* * * * *
cron.1.job.1.status=enabled
cron.1.job.1.cmd=M=`ifconfig ath0 | grep -o -E '([[:xdigit:]]{1,2}:){5}[[:xdigit:]]{1,2}'`;P=`cat /proc/power/pf1`;R=`cat /proc/power/relay1`;V=`cat /proc/power/v_rms1`;I=`cat /proc/power/i_rms1`;(/usr/bin/wget -b --no-cookies -4 --tries=1 -o /dev/null -O /dev/null --no-check-certificate --secure-protocol=auto --post-data="mac=$M&pf1=$P&relay1=$R&v_rms1=$V&i_rms1=$I" https://script.google.com/macros/s/YOUR_WEBSERVICE_ID/exec) >/dev/null 2>&1
cron.1.status=enabled
cron.status=enabled

* run command to update flash:

cfgmtd -f /tmp/system.cfg -w

* reboot the mfi device with:

reboot

*/

/**
* global variable object contains all global variables
* @type {Object}
* @const
*/
var GVAR = {
  // spreadsheet id for data
  //"SPREADSHEET_ID" : SpreadsheetApp.getActiveSpreadsheet().getId(),
  "SPREADSHEET_ID" : "1rzh5T5iy2C12qM1nHnTT4SKFbDQRZJPVrUQQnaPwC44",
  // sheet name
  "SHEET_ID" : "0", // gid param in spreadsheet url
  // datestamp date format
  "DATE_FORMAT" : "dd.MM.yyyy",
  // timestamp time format
  "TIME_FORMAT" : "HH:mm:ss"
}

/**
* write passed parameters to spreadsheet with date and time stamp
*
* @param {String} 
* @param {String} 
* @returns {String} content service html output
*/
function doPost(request) {
  /*request = (request || new Object());
  request.parameters = (request.parameters || new Object());
  request.parameters.test = (request.parameters.test || "test");*/ // debug only
  var reqParams = request.parameters;
  var itmArray = [], outArray = [], aItem = null;
  var aTz = Session.getScriptTimeZone();
  var aDate = new Date();
  itmArray.push(Utilities.formatDate(aDate, aTz, GVAR.DATE_FORMAT));
  itmArray.push(Utilities.formatDate(aDate, aTz, GVAR.TIME_FORMAT));
  for (aItem in reqParams) {itmArray.push(reqParams[aItem][0])};
  outArray.push(itmArray);
  var aSht = getSheetById(SpreadsheetApp.openById(GVAR.SPREADSHEET_ID), GVAR.SHEET_ID)
  var dataLen = aSht.getDataRange().getValues().length;
  var aRng = aSht.getRange(dataLen + 1, 1, 1, itmArray.length);
  aRng.setValues(outArray);
  SpreadsheetApp.flush();
  var resultMsg = "Success";
  var txtOut = ContentService.createTextOutput(resultMsg);
  txtOut.setMimeType(ContentService.MimeType.TEXT);
  return txtOut;
}

/**
* get sheet by id (no native implementation as future request https://code.google.com/p/google-apps-script-issues/issues/detail?id=3066)
*
* @param {Object} spreadsheet object
* @param {String} sheet id
* @returns {Object | False} sheet object | false
*/
function getSheetById(spreadsheetObject, sheetId) {
  var sheets = spreadsheetObject.getSheets();
  for (var i = 0, lenI = sheets.length; i < lenI; i++) {
    if (sheets[i].getSheetId() == sheetId) {
      return sheets[i];
    }
  }
  return false;
}
