import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';

async function generateSpreadsheet() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MMD Product-Market Fit Researcher';
  workbook.lastModifiedBy = 'MMD Product-Market Fit Researcher';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Define colors
  const tealHeaderColor = '008080';
  const tealLightColor = 'E0F2F1';
  const grayLightColor = 'F3F4F6';
  const borderLightColor = 'D1D5DB';

  // ----------------------------------------------------
  // SHEET 1: ReadMe & Instructions
  // ----------------------------------------------------
  const readmeSheet = workbook.addWorksheet('ReadMe & Playbook', {
    views: [{ showGridLines: true }]
  });

  readmeSheet.getColumn(1).width = 4;
  readmeSheet.getColumn(2).width = 28;
  readmeSheet.getColumn(3).width = 65;

  readmeSheet.mergeCells('B2:C2');
  const titleCell = readmeSheet.getCell('B2');
  titleCell.value = 'MMD Recruit CRM — Customer Discovery Discovery Playbook';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: '004D40' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: tealLightColor }
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  readmeSheet.getRow(2).height = 40;

  const addHeader = (rowNum: number, text: string) => {
    readmeSheet.mergeCells(`B${rowNum}:C${rowNum}`);
    const cell = readmeSheet.getCell(`B${rowNum}`);
    cell.value = text.toUpperCase();
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: tealHeaderColor }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    readmeSheet.getRow(rowNum).height = 25;
  };

  const addRow = (rowNum: number, label: string, desc: string, boldLabel = false) => {
    const labelCell = readmeSheet.getCell(`B${rowNum}`);
    labelCell.value = label;
    labelCell.font = { name: 'Segoe UI', size: 10, bold: boldLabel };
    labelCell.alignment = { vertical: 'top', wrapText: true };
    labelCell.border = {
      bottom: { style: 'thin', color: { argb: borderLightColor } },
      right: { style: 'thin', color: { argb: borderLightColor } }
    };

    const descCell = readmeSheet.getCell(`C${rowNum}`);
    descCell.value = desc;
    descCell.font = { name: 'Segoe UI', size: 10 };
    descCell.alignment = { vertical: 'top', wrapText: true };
    descCell.border = {
      bottom: { style: 'thin', color: { argb: borderLightColor } }
    };
    readmeSheet.getRow(rowNum).height = 45;
  };

  addHeader(4, '1. Overview of the Customer Discovery Tracker');
  addRow(5, 'Purpose', 'This tracker is designed for founder-led customer discovery. It helps aggregate qualitative feedback from 30 target customer interviews and convert them into quantitative metrics for product-market fit validation.');
  addRow(6, 'Target Customers', '1. Recruitment Agencies (Fastest-moving, credit card buyers)\n2. MSMEs (Looking for simple, affordable HR systems)\n3. Startup HR Teams (High growth, need integration capabilities)', true);
  addRow(7, 'How to Use', 'For every interview conducted, capture the raw notes using the Interview Notes Template, then fill in one row in the "Interview Tracker" tab. The tracker automatically calculates the Market Validation Score (MVS) for each lead.');

  addHeader(9, '2. Market Validation Score (MVS) Formula');
  addRow(10, 'Formula', 'MVS = (Pain Intensity * 8) + (Urgency * 6) + (Budget/WTP Score * 4) + (Switching Probability Score * 2)\nMaximum score is 100. Column M in the tracker calculates this automatically using formulas.', true);
  addRow(11, 'Pain Intensity (1-5)', '1 = Nice-to-have problem. No real friction.\n5 = Critical daily operational bottleneck (e.g., manual resume formatting taking 2 hours/day).');
  addRow(12, 'Urgency (1-5)', '1 = Happy to review in 6-12 months. No timeline.\n5 = Need a solution immediately / ready to test next week.');
  addRow(13, 'Budget/WTP Score (1-5)', '1 = Free only / No budget.\n5 = Has budget, currently spending money on software (e.g., Zoho/Bullhorn), willing to pay ₹2,500 - ₹8,000/mo.');
  addRow(14, 'Switching Prob (1-5)', '1 = Tied to an annual enterprise contract, will not switch.\n5 = Extremely unhappy with current stack or on Excel, ready to switch today.');

  addHeader(16, '3. Score Threshold Interpretations');
  addRow(17, 'MVS >= 75 (High Validation)', 'Red-hot lead. Strong pain, high urgency, budget available, high switching probability. These should be prioritised for the 14-day Monday Beta Pilot cohort.', true);
  addRow(18, 'MVS 50 - 74 (Moderate)', 'Has the pain, but lacks urgency or authority to buy. Keep in the nurturing loop, but do not focus MVP roadmap on them.');
  addRow(19, 'MVS < 50 (Low Validation)', 'Usually enterprise HR teams or established agencies happy with their current stack. Do not build for them at this stage.', true);

  // ----------------------------------------------------
  // SHEET 2: Interview Tracker
  // ----------------------------------------------------
  const trackerSheet = workbook.addWorksheet('Interview Tracker', {
    views: [{ showGridLines: true, freezePane: { xSplit: 0, ySplit: 3 } }]
  });

  // Title Row
  trackerSheet.mergeCells('A1:T1');
  const trackerTitle = trackerSheet.getCell('A1');
  trackerTitle.value = 'MMD Recruit CRM — Customer Discovery Interview Tracker';
  trackerTitle.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  trackerTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: tealHeaderColor }
  };
  trackerTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  trackerSheet.getRow(1).height = 35;

  // Header Subtitle/Legend
  trackerSheet.mergeCells('A2:T2');
  const trackerSub = trackerSheet.getCell('A2');
  trackerSub.value = 'Fill out the details for each interview. Scores (I, J, K, L) are 1 to 5. MVS is calculated automatically (0-100). Scores >= 75 indicate high PMF validation.';
  trackerSub.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: '555555' } };
  trackerSub.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: grayLightColor }
  };
  trackerSub.alignment = { vertical: 'middle', horizontal: 'center' };
  trackerSheet.getRow(2).height = 20;

  // Define Columns
  const cols = [
    { header: 'Lead ID', key: 'id', width: 9 },
    { header: 'Contact Name', key: 'name', width: 18 },
    { header: 'Company / Agency', key: 'company', width: 20 },
    { header: 'Segment', key: 'segment', width: 18 },
    { header: 'Team Size', key: 'teamSize', width: 10 },
    { header: 'Current ATS', key: 'currentAts', width: 15 },
    { header: 'Monthly Spend (INR)', key: 'currentSpend', width: 18 },
    { header: 'Primary Pain Point', key: 'painPoint', width: 22 },
    { header: 'Pain Intensity (1-5)', key: 'painScore', width: 18 },
    { header: 'Urgency (1-5)', key: 'urgencyScore', width: 14 },
    { header: 'Budget / WTP (1-5)', key: 'budgetScore', width: 18 },
    { header: 'Switching Prob (1-5)', key: 'switchScore', width: 18 },
    { header: 'Market Validation Score (MVS)', key: 'mvs', width: 28 },
    { header: 'Decision Maker?', key: 'decisionMaker', width: 16 },
    { header: 'Must-Have Feature', key: 'mustHave', width: 18 },
    { header: 'Willingness to Pay / Mo', key: 'wtp', width: 22 },
    { header: 'Pilot Status', key: 'pilotStatus', width: 16 },
    { header: 'Interview Date', key: 'date', width: 15 },
    { header: 'Key Quotes / Feedback notes', key: 'notes', width: 45 }
  ];

  trackerSheet.columns = cols;

  // Format Header Row (Row 3)
  const headerRow = trackerSheet.getRow(3);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '00695C' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: '004D40' } },
      bottom: { style: 'medium', color: { argb: '004D40' } },
      left: { style: 'thin', color: { argb: borderLightColor } },
      right: { style: 'thin', color: { argb: borderLightColor } }
    };
  });

  // Pre-fill the 10 interviews (L-01 to L-10)
  const mockInterviews = [
    {
      id: 'L-01', name: 'Rajesh Kumar', company: 'Apex Staffing', segment: 'Recruitment Agency', teamSize: 3,
      currentAts: 'Excel/Folders', currentSpend: 0, painPoint: 'Resume Formatting', painScore: 5, urgencyScore: 5,
      budgetScore: 5, switchScore: 5, decisionMaker: 'Yes', mustHave: 'Resume Formatter', wtp: 2500,
      pilotStatus: 'Committed', date: '2026-06-08', notes: 'Manual formatting takes 2 hrs/day. Very high interest in automated formatter.'
    },
    {
      id: 'L-02', name: 'Priya Sharma', company: 'TechRecruit', segment: 'Recruitment Agency', teamSize: 5,
      currentAts: 'Zoho Recruit', currentSpend: 6000, painPoint: 'Slow Search', painScore: 4, urgencyScore: 4,
      budgetScore: 4, switchScore: 4, decisionMaker: 'Yes', mustHave: 'Semantic Search', wtp: 6000,
      pilotStatus: 'Committed', date: '2026-06-08', notes: 'Zoho search misses candidates inside older PDFs. Wants deep semantic keyword search.'
    },
    {
      id: 'L-03', name: 'Amit Patel', company: 'Global HR', segment: 'Recruitment Agency', teamSize: 15,
      currentAts: 'Bullhorn', currentSpend: 25000, painPoint: 'UI Complexity', painScore: 3, urgencyScore: 2,
      budgetScore: 2, switchScore: 1, decisionMaker: 'No', mustHave: 'None', wtp: 0,
      pilotStatus: 'Not Interested', date: '2026-06-09', notes: 'Bullhorn is bloated, recruiters bypass it for Excel. Bound by annual contract, decision maker is external board.'
    },
    {
      id: 'L-04', name: 'Vikram Malhotra', company: 'Nexus Talent', segment: 'Recruitment Agency', teamSize: 4,
      currentAts: 'Excel/Folders', currentSpend: 0, painPoint: 'Data Security', painScore: 4, urgencyScore: 4,
      budgetScore: 4, switchScore: 5, decisionMaker: 'Yes', mustHave: 'Duplicate Alert', wtp: 2000,
      pilotStatus: 'Committed', date: '2026-06-09', notes: 'Fear of recruiters leaving and stealing spreadsheet database. Eager to secure data.'
    },
    {
      id: 'L-05', name: 'Shreya Sen', company: 'Elite Executive', segment: 'Recruitment Agency', teamSize: 6,
      currentAts: 'Freshteam', currentSpend: 18000, painPoint: 'Resume Formatting', painScore: 4, urgencyScore: 4,
      budgetScore: 4, switchScore: 4, decisionMaker: 'Yes', mustHave: 'Resume Formatter', wtp: 8000,
      pilotStatus: 'Interested', date: '2026-06-10', notes: 'Freshteam formatting takes too long, lacks automated templates. Willing to try a solution.'
    },
    {
      id: 'L-06', name: 'Manish Sharma', company: 'Pinnacle Staffing', segment: 'Recruitment Agency', teamSize: 3,
      currentAts: 'Zoho Recruit', currentSpend: 8000, painPoint: 'Slow Search', painScore: 5, urgencyScore: 5,
      budgetScore: 5, switchScore: 4, decisionMaker: 'Yes', mustHave: 'Auto-Match', wtp: 8000,
      pilotStatus: 'Committed', date: '2026-06-10', notes: 'Wants candidate-to-job matching automation. Manually mapping takes hours. Ready to switch if matched.'
    },
    {
      id: 'L-07', name: 'Kavita Rao', company: 'Aspire Consulting', segment: 'Recruitment Agency', teamSize: 2,
      currentAts: 'Excel/Folders', currentSpend: 0, painPoint: 'Resume Formatting', painScore: 3, urgencyScore: 3,
      budgetScore: 4, switchScore: 5, decisionMaker: 'Yes', mustHave: 'Resume Formatter', wtp: 1500,
      pilotStatus: 'Interested', date: '2026-06-11', notes: 'Copy-pasting details into Excel is tedious. WTP is lower, but high willingness to try beta.'
    },
    {
      id: 'L-08', name: 'Rohan Das', company: 'Vertex HR', segment: 'Recruitment Agency', teamSize: 8,
      currentAts: 'Loxo', currentSpend: 35000, painPoint: 'Other', painScore: 3, urgencyScore: 3,
      budgetScore: 4, switchScore: 3, decisionMaker: 'Yes', mustHave: 'Invoice Sync', wtp: 7999,
      pilotStatus: 'Interested', date: '2026-06-11', notes: 'USD billing is fluctuating heavily in INR. Wants stable local invoicing. Worried about data migration downtime.'
    },
    {
      id: 'L-09', name: 'Ananya Joshi', company: 'Vantage Tech', segment: 'Recruitment Agency', teamSize: 5,
      currentAts: 'Excel/Folders', currentSpend: 0, painPoint: 'Invoicing', painScore: 4, urgencyScore: 4,
      budgetScore: 4, switchScore: 4, decisionMaker: 'Yes', mustHave: 'Invoice Sync', wtp: 2500,
      pilotStatus: 'Committed', date: '2026-06-12', notes: 'Wants ATS linked to billing/invoicing directly when a placement is made.'
    },
    {
      id: 'L-10', name: 'Deepak Nair', company: 'Stellar Hire', segment: 'Recruitment Agency', teamSize: 12,
      currentAts: 'Bullhorn', currentSpend: 45000, painPoint: 'UI Complexity', painScore: 2, urgencyScore: 2,
      budgetScore: 4, switchScore: 1, decisionMaker: 'No', mustHave: 'None', wtp: 0,
      pilotStatus: 'Not Interested', date: '2026-06-12', notes: 'Lacks easy syncing with WhatsApp/email, but switching is too high-friction for their team.'
    }
  ];

  // Write pre-filled interviews (rows 4 to 13)
  for (let i = 0; i < 30; i++) {
    const rowNum = i + 4;
    const isMock = i < mockInterviews.length;
    const item = isMock ? mockInterviews[i] : null;

    const rowValues = [
      item ? item.id : `L-${(i + 1).toString().padStart(2, '0')}`,
      item ? item.name : '',
      item ? item.company : '',
      item ? item.segment : '',
      item ? item.teamSize : '',
      item ? item.currentAts : '',
      item ? item.currentSpend : '',
      item ? item.painPoint : '',
      item ? item.painScore : '',
      item ? item.urgencyScore : '',
      item ? item.budgetScore : '',
      item ? item.switchScore : '',
      { formula: `=(I${rowNum}*8)+(J${rowNum}*6)+(K${rowNum}*4)+(L${rowNum}*2)` }, // MVS
      item ? item.decisionMaker : '',
      item ? item.mustHave : '',
      item ? item.wtp : '',
      item ? item.pilotStatus : '',
      item ? item.date : '',
      item ? item.notes : ''
    ];

    trackerSheet.addRow(rowValues);
    const row = trackerSheet.getRow(rowNum);

    // Styling rules
    row.height = 22;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.border = {
        bottom: { style: 'thin', color: { argb: borderLightColor } },
        right: { style: 'thin', color: { argb: borderLightColor } },
        left: { style: 'thin', color: { argb: borderLightColor } }
      };

      // Alignments & Number formats
      if (colNum === 1 || colNum === 5 || colNum === 9 || colNum === 10 || colNum === 11 || colNum === 12 || colNum === 13 || colNum === 14 || colNum === 17 || colNum === 18) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: colNum === 19 };
      }

      if (colNum === 7 || colNum === 16) {
        cell.numFmt = '"₹"#,##0';
      }

      // Format score cells to have a soft gray border
      if (isMock) {
        // Light highlighting for high validation scores
        if (colNum === 13) {
          cell.font = { name: 'Segoe UI', size: 10, bold: true };
        }
      }
    });

    // Color code the MVS score cell dynamically in Excel
    const mvsCell = row.getCell(13);
    mvsCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F9FAFB' } // default light gray
    };

    // Add validations for the empty columns (for rows 4 to 33)
    trackerSheet.getCell(`D${rowNum}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Recruitment Agency,MSME,Startup HR"']
    };

    trackerSheet.getCell(`F${rowNum}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Excel/Folders,Zoho Recruit,Bullhorn,Loxo,Freshteam,Other"']
    };

    trackerSheet.getCell(`H${rowNum}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Resume Formatting,Slow Search,Duplicate Candidates,UI Complexity,Invoicing,Sourcing,Other"']
    };

    trackerSheet.getCell(`N${rowNum}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Yes,No"']
    };

    trackerSheet.getCell(`O${rowNum}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Resume Formatter,Semantic Search,Duplicate Alert,Invoice Sync,Auto-Match,None"']
    };

    trackerSheet.getCell(`Q${rowNum}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Committed,Interested,Not Interested"']
    };

    // Score validations (1 to 5)
    const validate1to5 = {
      type: 'whole',
      operator: 'between',
      allowBlank: true,
      formulae: [1, 5],
      showErrorMessage: true,
      errorTitle: 'Invalid Score',
      error: 'The value must be an integer between 1 and 5.'
    };
    trackerSheet.getCell(`I${rowNum}`).dataValidation = validate1to5;
    trackerSheet.getCell(`J${rowNum}`).dataValidation = validate1to5;
    trackerSheet.getCell(`K${rowNum}`).dataValidation = validate1to5;
    trackerSheet.getCell(`L${rowNum}`).dataValidation = validate1to5;
  }

  // Add a conditional format or highlight row values
  // We can't do complex conditional formatting easily in exceljs without XML hacks, but we can set cell colors.
  // Let's color-code based on whether they are validated in our pre-filled rows
  for (let i = 0; i < 10; i++) {
    const rowNum = i + 4;
    const mvsVal = mockInterviews[i].painScore * 8 + mockInterviews[i].urgencyScore * 6 + mockInterviews[i].budgetScore * 4 + mockInterviews[i].switchScore * 2;
    const mvsCell = trackerSheet.getCell(`M${rowNum}`);
    if (mvsVal >= 75) {
      mvsCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D1FAE5' } // soft emerald green for >= 75
      };
      mvsCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '065F46' } };
    } else if (mvsVal >= 50) {
      mvsCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FEF3C7' } // soft yellow for 50-74
      };
      mvsCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '92400E' } };
    } else {
      mvsCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FEE2E2' } // soft red for < 50
      };
      mvsCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '991B1B' } };
    }
  }

  // ----------------------------------------------------
  // SHEET 3: Dashboard / Summary
  // ----------------------------------------------------
  const dashboardSheet = workbook.addWorksheet('Discovery Dashboard', {
    views: [{ showGridLines: true }]
  });

  dashboardSheet.getColumn(1).width = 4;
  dashboardSheet.getColumn(2).width = 30;
  dashboardSheet.getColumn(3).width = 18;
  dashboardSheet.getColumn(4).width = 4;
  dashboardSheet.getColumn(5).width = 30;
  dashboardSheet.getColumn(6).width = 18;

  // Title
  dashboardSheet.mergeCells('B2:F2');
  const dashTitle = dashboardSheet.getCell('B2');
  dashTitle.value = 'MMD Recruit CRM — PMF Validation Dashboard';
  dashTitle.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  dashTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: tealHeaderColor }
  };
  dashTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  dashboardSheet.getRow(2).height = 35;

  const createKPICard = (rowNum: number, startCol: string, endCol: string, label: string, formula: string, isCurrency = false) => {
    // Label
    const labelCell = dashboardSheet.getCell(`${startCol}${rowNum}`);
    labelCell.value = label;
    labelCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '4B5563' } };
    labelCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    labelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F9FAFB' }
    };
    labelCell.border = {
      top: { style: 'thin', color: { argb: borderLightColor } },
      bottom: { style: 'thin', color: { argb: borderLightColor } },
      left: { style: 'thin', color: { argb: borderLightColor } }
    };

    // Value
    const valCell = dashboardSheet.getCell(`${endCol}${rowNum}`);
    valCell.value = { formula };
    valCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '111827' } };
    valCell.alignment = { vertical: 'middle', horizontal: 'center' };
    valCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F3F4F6' }
    };
    valCell.border = {
      top: { style: 'thin', color: { argb: borderLightColor } },
      bottom: { style: 'thin', color: { argb: borderLightColor } },
      right: { style: 'thin', color: { argb: borderLightColor } }
    };

    if (isCurrency) {
      valCell.numFmt = '"₹"#,##0';
    }
    dashboardSheet.getRow(rowNum).height = 25;
  };

  // KPI Section Left Block (Aggregates)
  dashboardSheet.mergeCells('B4:C4');
  const sect1Header = dashboardSheet.getCell('B4');
  sect1Header.value = 'METRIC DESCRIPTION';
  sect1Header.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '004D40' } };
  sect1Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tealLightColor } };
  sect1Header.alignment = { vertical: 'middle', horizontal: 'center' };

  createKPICard(5, 'B', 'C', 'Total Interviews Tracked', '=COUNTIF(\'Interview Tracker\'!B4:B33, "<>")');
  createKPICard(6, 'B', 'C', 'High Validation Leads (MVS >= 75)', '=COUNTIF(\'Interview Tracker\'!M4:M33, ">=75")');
  createKPICard(7, 'B', 'C', 'Average Pain Intensity (1-5)', '=AVERAGE(\'Interview Tracker\'!I4:I33)');
  createKPICard(8, 'B', 'C', 'Average Urgency Score (1-5)', '=AVERAGE(\'Interview Tracker\'!J4:J33)');
  createKPICard(9, 'B', 'C', 'Average Switching Probability (1-5)', '=AVERAGE(\'Interview Tracker\'!L4:L33)');
  createKPICard(10, 'B', 'C', 'Total Committed Pilots', '=COUNTIF(\'Interview Tracker\'!Q4:Q33, "Committed")');
  createKPICard(11, 'B', 'C', 'Average Willingness to Pay', '=AVERAGEIF(\'Interview Tracker\'!P4:P33, ">0")', true);

  // Segment Analysis Right Block
  dashboardSheet.mergeCells('E4:F4');
  const sect2Header = dashboardSheet.getCell('E4');
  sect2Header.value = 'SEGMENT SHARE & PAIN TRACKER';
  sect2Header.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '004D40' } };
  sect2Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tealLightColor } };
  sect2Header.alignment = { vertical: 'middle', horizontal: 'center' };

  createKPICard(5, 'E', 'F', 'Segment: Recruitment Agency', '=COUNTIF(\'Interview Tracker\'!D4:D33, "Recruitment Agency")');
  createKPICard(6, 'E', 'F', 'Segment: MSME', '=COUNTIF(\'Interview Tracker\'!D4:D33, "MSME")');
  createKPICard(7, 'E', 'F', 'Segment: Startup HR', '=COUNTIF(\'Interview Tracker\'!D4:D33, "Startup HR")');
  createKPICard(8, 'E', 'F', 'Pain: Resume Formatting Count', '=COUNTIF(\'Interview Tracker\'!H4:H33, "Resume Formatting")');
  createKPICard(9, 'E', 'F', 'Pain: Slow Search Count', '=COUNTIF(\'Interview Tracker\'!H4:H33, "Slow Search")');
  createKPICard(10, 'E', 'F', 'Pain: Invoicing / ATS Split Count', '=COUNTIF(\'Interview Tracker\'!H4:H33, "Invoicing")');
  createKPICard(11, 'E', 'F', 'Pain: Data Security Count', '=COUNTIF(\'Interview Tracker\'!H4:H33, "Data Security")');

  // Highlight KPI card values with backgrounds
  dashboardSheet.getCell('C6').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'D1FAE5' } // emerald green for high validation
  };
  dashboardSheet.getCell('C10').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'D1FAE5' } // emerald green for pilots
  };

  // Add notes below
  dashboardSheet.mergeCells('B13:F13');
  const noteTitle = dashboardSheet.getCell('B13');
  noteTitle.value = 'HOW TO INTERPRET THIS DASHBOARD:';
  noteTitle.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '004D40' } };

  dashboardSheet.mergeCells('B14:F14');
  const noteDesc1 = dashboardSheet.getCell('B14');
  noteDesc1.value = '• Total Interviews Tracked: Shows how many of your 30 target interviews you have completed.';
  noteDesc1.font = { name: 'Segoe UI', size: 9, italic: true };

  dashboardSheet.mergeCells('B15:F15');
  const noteDesc2 = dashboardSheet.getCell('B15');
  noteDesc2.value = '• High Validation Leads: Indicates the number of leads that scored >= 75. A high percentage (e.g. >50%) represents strong PMF signals.';
  noteDesc2.font = { name: 'Segoe UI', size: 9, italic: true };

  dashboardSheet.mergeCells('B16:F16');
  const noteDesc3 = dashboardSheet.getCell('B16');
  noteDesc3.value = '• Segment Analysis: Focus your early sales outreach and product releases on the customer segment and pain point that have the highest frequency count.';
  noteDesc3.font = { name: 'Segoe UI', size: 9, italic: true };

  dashboardSheet.getRow(13).height = 20;
  dashboardSheet.getRow(14).height = 18;
  dashboardSheet.getRow(15).height = 18;
  dashboardSheet.getRow(16).height = 18;

  // Save the spreadsheet
  const targetDir = 'C:\\Users\\ravip\\.gemini\\antigravity\\brain\\b0d98e3d-627e-4107-9472-47f8797c5328';
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const outPath1 = path.join(targetDir, 'MMD_Customer_Discovery_Analysis_Spreadsheet.xlsx');
  await workbook.xlsx.writeFile(outPath1);
  console.log(`Successfully generated spreadsheet in brain folder at: ${outPath1}`);

  const outPath2 = 'c:\\Ravi\\MY WORKS\\MMD V2\\docs\\MMD_Customer_Discovery_Analysis_Spreadsheet.xlsx';
  await workbook.xlsx.writeFile(outPath2);
  console.log(`Successfully generated spreadsheet in workspace docs at: ${outPath2}`);
}

generateSpreadsheet().catch((err) => {
  console.error('Failed to generate spreadsheet:', err);
  process.exit(1);
});
