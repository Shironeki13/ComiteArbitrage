function doGet() {
  return HtmlService.createHtmlOutputFromFile("index").addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getDatags() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Data");
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  const tz = Session.getScriptTimeZone();
  const now = new Date();


  function formatDateTime(value, type) {
    if (!value) return null;
    if (Object.prototype.toString.call(value) === '[object Date]') {
      if (type === "date") return Utilities.formatDate(value, tz, "yyyy-MM-dd");
      if (type === "time") return Utilities.formatDate(value, tz, "HH:mm:ss");
      return Utilities.formatDate(value, tz, "yyyy-MM-dd HH:mm:ss");
    }
    return String(value);
  }

 
  function makeDateTime(dateVal, timeVal) {
    if (!(dateVal instanceof Date)) return null;
    const date = new Date(dateVal);
    if (timeVal instanceof Date) {
      date.setHours(timeVal.getHours(), timeVal.getMinutes(), timeVal.getSeconds());
    }
    return date;
  }

 
  const sampleData = [
    {
      id: 1,
      task: "Thank you for using this product",
      category: "Work",
      startDate: "2025-11-22",
      startTime: "17:00:00",
      dueDate: "2025-11-24",
      dueTime: "19:00:00",
      color: "#5470c6",
      status: "completed"
    },
    {
      id: 2,
      task: "Create new tasks then delete Sample tasks",
      category: "Health",
      startDate: "2025-11-25",
      startTime: "10:00:00",
      dueDate: "2025-11-29",
      dueTime: "13:00:00",
      color: "#73c0de",
      status: "completed"
    },
    {
      id: 3,
      task: "Match Sheet TimeZone with your Computer",
      category: "Learning",
      startDate: "2025-10-30",
      startTime: "09:00:00",
      dueDate: "2025-11-02",
      dueTime: "12:00:00",
      color: "#91cc75",
      status: "pending"
    }
  ];


  if (values.length <= 1 || values.slice(1).every(row => row.join('') === '')) {
    return sampleData;
  }

  
  return values.slice(1).map(row => {
    const dueDateTime = makeDateTime(row[5], row[6]);

    let newStatus = row[8];
    if (newStatus !== "completed" && dueDateTime) {
      if (dueDateTime < now) {
        newStatus = "overdue";
      } else {
        newStatus = "pending";
      }
    }

    return {
      id: row[0],
      task: row[1],
      category: row[2],
      startDate: formatDateTime(row[3], "date"),
      startTime: formatDateTime(row[4], "time"),
      dueDate: formatDateTime(row[5], "date"),
      dueTime: formatDateTime(row[6], "time"),
      color: row[7],
      status: newStatus
    };
  });
}

function addDatags(taskbase) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  if (!sheet) return [];

  // Clear all existing rows except header
  if (sheet.getLastRow() > 1) {
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .clearContent();
  }

  // Write new rows
  if (taskbase.length > 0) {
    const rows = taskbase.map((item) => [
      item.id,
      item.task,
      item.category,
      item.startDate,
      item.startTime,
      item.dueDate,
      item.dueTime,
      item.color,
      item.status,
    ]);

    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);

    // Sort by ID descending
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .sort({ column: 1, ascending: false });
  }
}

