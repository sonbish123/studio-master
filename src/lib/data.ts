
import fs from 'fs';
import path from 'path';

// Use a JSON file as a simple database for demonstration purposes.
const reportsFilePath = path.join(process.cwd(), 'reports.json');

function readReportsFromFile(): any[] {
  try {
    if (fs.existsSync(reportsFilePath)) {
      const jsonData = fs.readFileSync(reportsFilePath, 'utf-8');
      if (jsonData) {
        return JSON.parse(jsonData);
      }
    }
  } catch (error) {
    console.error('Error reading reports file:', error);
  }
  return [];
}

function writeReportsToFile(data: any[]) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(reportsFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing reports file:', error);
  }
}

function getNextReportId(reports: any[]): string {
    if (!reports || reports.length === 0) {
        return 'RPT-001';
    }
    const maxId = reports.reduce((max, report) => {
        const idNum = parseInt(report.id.replace('RPT-', ''), 10);
        return idNum > max ? idNum : max;
    }, 0);
    return `RPT-${String(maxId + 1).padStart(3, '0')}`;
}

export function addReport(data: any) {
    const reports = readReportsFromFile();
    const newReport = {
        ...data,
        id: getNextReportId(reports),
        applicationDate: new Date(data.applicationDate).toISOString(), // Store as ISO string
        inspectionDate: new Date(data.inspectionDate).toISOString(), // Store as ISO string
    };
    reports.unshift(newReport); // Add to the beginning of the array
    writeReportsToFile(reports);
    console.log("Report added. Total reports:", reports.length);
}

export function getReports() {
    return readReportsFromFile();
}

export function deleteReport(reportId: string) {
    let reports = readReportsFromFile();
    const initialCount = reports.length;
    reports = reports.filter((r) => r.id !== reportId);
    if (reports.length < initialCount) {
        writeReportsToFile(reports);
        console.log(`Report ${reportId} deleted.`);
    } else {
        console.log(`Report ${reportId} not found.`);
        throw new Error(`Report with id ${reportId} not found.`);
    }
}
