const SHEET_ID = "1RfKwfSjePnIQEFTsH1mcTbB16lGKPUKhkt4qtVqjh-c";
const SHEET_NAME = "Worker Intake";

function doGet(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const rows = values.map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index];
    });
    return record;
  });

  const output = JSON.stringify({ ok: true, rows });
  const callback = e && e.parameter && e.parameter.callback;

  if (callback) {
    return ContentService.createTextOutput(`${callback}(${output});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents || "{}");
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  sheet.appendRow([
    new Date(),
    data.firstName || "",
    data.lastName || "",
    data.phone || "",
    data.email || "",
    data.city || "",
    data.state || "",
    data.serviceCategory || "",
    data.availability || "",
    data.hourlyRate || "",
    data.driverLicense || "",
    data.vehicle || "",
    data.backgroundCheck || "",
    data.notes || "",
    "New",
    "Worker Intake Form",
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
