import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { DailyLog, CollegeSettings, Department, User } from '@/types';

export interface ReportFilterOptions {
  reportType: string;
  departmentId?: string;
  facultyId?: string;
  startDate: string;
  endDate: string;
  status?: string;
}

/**
 * Generate Professional A4 PDF Report
 */
export async function exportPDFReport(
  title: string,
  logs: DailyLog[],
  settings: CollegeSettings,
  departmentName?: string,
  facultyName?: string,
  isLandscape: boolean = false
): Promise<void> {
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Institution Header
  doc.setFillColor(15, 23, 42); // Navy Blue #0F172A
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(settings.collegeName.toUpperCase(), pageWidth / 2, 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(settings.tagline, pageWidth / 2, 16, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(219, 234, 254);
  doc.text('FACULTY DAILY ACTIVITY REGISTER (FDAR) - ACADEMIC REPORT', pageWidth / 2, 22, { align: 'center' });

  // Subheader Info
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  let currentY = 40;
  doc.text(`Department: ${departmentName || 'All Departments'}`, 14, currentY);
  doc.text(`Academic Year: ${settings.academicYear} (${settings.currentSemester} Semester)`, 14, currentY + 5);
  if (facultyName) {
    doc.text(`Faculty: ${facultyName}`, pageWidth / 2, currentY);
  }
  doc.text(`Generated On: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, pageWidth / 2, currentY + 5);

  currentY += 12;

  // Table Data Preparation
  const tableHead = isLandscape
    ? [['Date', 'Faculty Name', 'Dept', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Status', 'HOD Remarks']]
    : [['Period', 'Time', 'Scheduled Class', 'Actual Activity / Topic Covered', 'Class & Sec', 'Students', 'Status']];

  const tableBody = isLandscape
    ? logs.map((log) => [
        log.date,
        log.facultyName,
        log.departmentName.split(' ')[0] || log.departmentId,
        log.periods[0]?.actualActivity || '-',
        log.periods[1]?.actualActivity || '-',
        log.periods[2]?.actualActivity || '-',
        log.periods[3]?.actualActivity || '-',
        log.periods[4]?.actualActivity || '-',
        log.periods[5]?.actualActivity || '-',
        log.periods[6]?.actualActivity || '-',
        log.submissionStatus.toUpperCase(),
        log.approvalRemarks || log.returnRemarks || '-',
      ])
    : (logs[0]?.periods || []).map((p) => [
        `Period ${p.periodNumber}`,
        `${p.startTime} - ${p.endTime}`,
        p.scheduledActivity || 'Free Period',
        p.topicCovered ? `${p.actualActivity}: ${p.topicCovered}` : p.actualActivity || '-',
        p.section ? `${p.year}-${p.section}` : '-',
        p.studentsPresent !== undefined ? `${p.studentsPresent}/${p.totalStudents || 64}` : '-',
        p.status.toUpperCase(),
      ]);

  autoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235], // Royal Blue
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, bottom: 40 },
  });

  // Signature Block on the last page
  const finalY = pageHeight - 32;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setDrawColor(203, 213, 225);

  // Sign lines
  const sigColWidth = (pageWidth - 28) / 3;

  doc.line(14, finalY, 14 + sigColWidth - 10, finalY);
  doc.text('Signature of Faculty', 14, finalY + 5);

  doc.line(14 + sigColWidth, finalY, 14 + 2 * sigColWidth - 10, finalY);
  doc.text('Head of the Department', 14 + sigColWidth, finalY + 5);

  doc.line(14 + 2 * sigColWidth, finalY, pageWidth - 14, finalY);
  doc.text('Principal / Academic Director', 14 + 2 * sigColWidth, finalY + 5);

  // Footer Disclaimer
  doc.setFontSize(6.5);
  doc.text(
    'Note: This is a certified computer-generated academic record from GIITS Faculty Daily Activity Register. Printed signature spaces are for physical verification countersignatures.',
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Generate Excel Report with Formatted Columns using ExcelJS
 */
export async function exportExcelReport(
  title: string,
  logs: DailyLog[],
  settings: CollegeSettings
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'GIITS FDAR Academic System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Daily Activity Register');

  // Institution Title
  worksheet.mergeCells('A1:L1');
  const titleRow = worksheet.getCell('A1');
  titleRow.value = settings.collegeName.toUpperCase();
  titleRow.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' },
  };
  worksheet.getRow(1).height = 28;

  // Report Title
  worksheet.mergeCells('A2:L2');
  const subTitle = worksheet.getCell('A2');
  subTitle.value = `${title} | Academic Year: ${settings.academicYear}`;
  subTitle.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF2563EB' } };
  subTitle.alignment = { horizontal: 'center' };
  worksheet.getRow(2).height = 20;

  // Table Headers
  const headers = [
    'Date',
    'Faculty ID',
    'Faculty Name',
    'Department',
    'Period 1',
    'Period 2',
    'Period 3',
    'Period 4',
    'Period 5',
    'Period 6',
    'Period 7',
    'Submission Status',
    'HOD Remarks',
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };
  headerRow.height = 22;

  // Data Rows
  logs.forEach((log) => {
    const row = worksheet.addRow([
      log.date,
      log.employeeId,
      log.facultyName,
      log.departmentName,
      log.periods[0]?.actualActivity || '-',
      log.periods[1]?.actualActivity || '-',
      log.periods[2]?.actualActivity || '-',
      log.periods[3]?.actualActivity || '-',
      log.periods[4]?.actualActivity || '-',
      log.periods[5]?.actualActivity || '-',
      log.periods[6]?.actualActivity || '-',
      log.submissionStatus.toUpperCase(),
      log.approvalRemarks || log.returnRemarks || '-',
    ]);
    row.height = 20;
  });

  // Auto-fit column widths
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? cell.value.toString().length : 10;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = Math.min(Math.max(maxLength + 3, 12), 40);
  });

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
