const PDFDocument = require("pdfkit-table");
// const { width } = require("pdfkit/js/page");

// --- Global Styles & Configuration ---
const styles = {
  colors: {
    primary: '#1e3a8a',    // Deep Blue
    accent: '#3b82f6',     // Bright Blue
    text: '#1e293b',       // Slate 800
    textLight: '#64748b',  // Slate 500
    border: '#e2e8f0',     // Slate 200
    rowEven: '#ffffff',
    rowOdd: '#f8fafc',     // Very subtle gray
    headerBg: '#f1f5f9',   // Light gray
    green: '#15803d',
    red: '#b91c1c'
  },
  margin: 30,
  bottomThreshold: 720, 
  font: {
    regular: 'Helvetica',
    bold: 'Helvetica-Bold'
  }
};

// --- Helper Functions ---

const drawHeader = (doc, title, subtitle) => {
  doc.rect(0, 0, 595, 120).fill('#f8fafc'); 
  
  doc.fontSize(22).font(styles.font.bold).fillColor(styles.colors.primary)
     .text("RK MILK CHILLING CENTER", 40, 40, { align: 'left' });
  
  doc.fontSize(10).font(styles.font.regular).fillColor(styles.colors.textLight)
     .text(subtitle.toUpperCase(), 40, 68, { align: 'left', characterSpacing: 1 });

  doc.moveTo(40, 85).lineTo(555, 85).strokeColor(styles.colors.accent).lineWidth(2).stroke();
  
  doc.y = 110;
};

const drawFooter = (doc) => {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    const bottom = doc.page.height - 40;
    
    doc.moveTo(40, bottom - 10).lineTo(555, bottom - 10).strokeColor(styles.colors.border).lineWidth(0.5).stroke();
    
    const dateStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    
    doc.fontSize(8).fillColor(styles.colors.textLight)
       .text(`Generated on: ${dateStr}`, 40, bottom, { align: 'left' });
       
    doc.text("System Generated Report", 0, bottom, { align: 'center', width: 595 });
    
    doc.text(`Page ${i + 1} of ${pages.count}`, 0, bottom, { align: 'right', width: 555 });
  }
};

/**
 * GLOBAL FIX: 
 * If a new page is added, we must reset Y to 155.
 * The Header ends at 145 (120 start + 25 height). 
 * 155 gives us 10px safe padding.
 */
const checkAndAddPage = (doc, currentY, requiredSpace, headerCallback) => {
  if (currentY + requiredSpace > styles.bottomThreshold) {
    doc.addPage();
    if (headerCallback) headerCallback(doc); 
    return 155; // Corrected from 130 to 155 to prevent overlap
  }
  return currentY;
};

// --- PDF Generator Functions ---

const generateBillPdf = (records, totals, filters, res) => {
  const doc = new PDFDocument({ margin: styles.margin, size: "A4", bufferPages: true });
  doc.pipe(res);

  drawHeader(doc, "RK MILK CHILLING CENTER", "Milk Purchase Record");

  const filterY = doc.y;
  doc.rect(40, filterY, 515, 60).strokeColor(styles.colors.border).stroke();
  doc.fontSize(9).font(styles.font.bold).fillColor(styles.colors.primary).text("REPORT CRITERIA", 50, filterY + 10);
  
  const startDateStr = filters.startDate ? new Date(filters.startDate).toLocaleDateString("en-IN") : "Start";
  const endDateStr = filters.endDate ? new Date(filters.endDate).toLocaleDateString("en-IN") : "Present";

  doc.font(styles.font.regular).fillColor(styles.colors.text);
  doc.text("Date Range:", 50, filterY + 28).font(styles.font.bold).text(`${startDateStr}  -  ${endDateStr}`, 110, filterY + 28);
  doc.font(styles.font.regular).text("Shift:", 300, filterY + 28).font(styles.font.bold).text(filters.shift || "All Shifts", 340, filterY + 28);

  if (filters.supplierName) {
    doc.font(styles.font.regular).text("Supplier:", 50, filterY + 42).font(styles.font.bold).text(filters.supplierName, 110, filterY + 42);
  }

  doc.moveDown(4);

  const summaryY = doc.y;
  const colWidth = 515 / 4;
  const drawSummaryCard = (label, value, x) => {
    doc.rect(x, summaryY, colWidth - 10, 50).fillAndStroke('#f1f5f9', styles.colors.border);
    doc.fillColor(styles.colors.textLight).fontSize(8).font(styles.font.regular).text(label, x + 10, summaryY + 10);
    doc.fillColor(styles.colors.primary).fontSize(12).font(styles.font.bold).text(value, x + 10, summaryY + 25);
  };

  drawSummaryCard("Total Quantity", `${totals.quantity.toFixed(2)} Kg`, 40);
  drawSummaryCard("Total Fat", `${totals.fatKg.toFixed(2)} Kg`, 40 + colWidth);
  drawSummaryCard("Total SNF", `${totals.snfKg.toFixed(2)} Kg`, 40 + (colWidth * 2));
  drawSummaryCard("Total Amount", `Rs. ${totals.amount.toFixed(2)}`, 40 + (colWidth * 3));

  doc.moveDown(5);

  const tableTop = doc.y;
  // Adjusted column positions to fit CLR
const col = { 
  date: 40, 
  supp: 95,   // Shifted left slightly
  qty: 185,   // Shifted left
  fat: 225,   // Shifted left
  clr: 260,   // NEW COLUMN
  snf: 295, 
  fkg: 335, 
  skg: 385, 
  amt: 470 
};

  const drawTableHeader = (y) => {
  doc.rect(40, y, 515, 25).fill(styles.colors.primary);
  doc.fillColor('#ffffff').fontSize(8).font(styles.font.bold);
  doc.text("DATE", col.date + 5, y + 8);
  doc.text("SUPPLIER", col.supp, y + 8);
  doc.text("QTY", col.qty, y + 8, { width: 35, align: 'right' });
  doc.text("FAT", col.fat, y + 8, { width: 30, align: 'right' });
  doc.text("CLR", col.clr, y + 8, { width: 30, align: 'right' }); // ADDED CLR
  doc.text("SNF", col.snf, y + 8, { width: 30, align: 'right' });
  doc.text("FAT(Kg)", col.fkg, y + 8, { width: 45, align: 'right' });
  doc.text("SNF(Kg)", col.skg, y + 8, { width: 45, align: 'right' });
  doc.text("AMOUNT", col.amt, y + 8, { width: 80, align: 'right' });
};

  const headerCallback = (d) => {
    drawHeader(d, "RK MILK CHILLING CENTER", "Milk Purchase Record");
    drawTableHeader(120);
  };

  drawTableHeader(tableTop);

  let y = tableTop + 30;
  
  records.forEach((r, i) => {
  y = checkAndAddPage(doc, y, 20, headerCallback);

  if (i % 2 !== 0) doc.rect(40, y - 5, 515, 20).fill(styles.colors.rowOdd);

  doc.fillColor(styles.colors.text).fontSize(9).font(styles.font.regular);
  doc.text(new Date(r.date).toLocaleDateString("en-IN"), col.date + 5, y);
  doc.text(r.supplier.name, col.supp, y, { width: 85, ellipsis: true }); // Width adjusted
  
  doc.font(styles.font.regular).fillColor(styles.colors.textLight);
  doc.text(parseFloat(r.quantity).toFixed(2), col.qty, y, { width: 35, align: 'right' });
  doc.text(parseFloat(r.fat).toFixed(1), col.fat, y, { width: 30, align: 'right' });
  
  // ADDED CLR ROW DATA
  doc.text(parseFloat(r.clr || 0).toFixed(1), col.clr, y, { width: 30, align: 'right' });
  
  doc.text(parseFloat(r.snf).toFixed(2), col.snf, y, { width: 30, align: 'right' });
  doc.text(parseFloat(r.fatKg).toFixed(2), col.fkg, y, { width: 45, align: 'right' });
  doc.text(parseFloat(r.snfKg).toFixed(2), col.skg, y, { width: 45, align: 'right' });
  
  doc.font(styles.font.bold).fillColor(styles.colors.text);
  doc.text(parseFloat(r.amount).toFixed(2), col.amt, y, { width: 80, align: 'right' });

  doc.moveTo(40, y + 14).lineTo(555, y + 14).strokeColor(styles.colors.border).lineWidth(0.25).stroke();
  y += 20;
});

  drawFooter(doc);
  doc.end();
};

const generateSalePdf = (records, totals, filters, res) => {
  const doc = new PDFDocument({ margin: styles.margin, size: "A4", bufferPages: true });
  doc.pipe(res);

  drawHeader(doc, "RK MILK CHILLING CENTER", "Milk Sales Report");

  const sumY = doc.y;
  doc.rect(40, sumY, 515, 60).fill('#eff6ff');
  doc.strokeColor('#bfdbfe').lineWidth(1).rect(40, sumY, 515, 60).stroke();

  const revenueX = 420;
  const revenueWidth = 115;

  doc.fillColor(styles.colors.primary)
    .fontSize(9)
    .font(styles.font.bold)
    .text("TOTAL REVENUE", revenueX, sumY + 15, {
      width: revenueWidth,
      align: 'right'
    });

  doc.fillColor(styles.colors.primary)
    .fontSize(16)
    .font(styles.font.bold)
    .text(`Rs. ${totals.amount.toFixed(2)}`, revenueX, sumY + 32, {
      width: revenueWidth,
      align: 'right'
    });

  doc.fillColor(styles.colors.textLight).fontSize(8).font(styles.font.regular);
  doc.text("Total Milk Sold", 60, sumY + 15);
  doc.fillColor(styles.colors.text).fontSize(11).font(styles.font.bold).text(`${totals.quantity.toFixed(2)} Kg`, 60, sumY + 30);

  doc.fillColor(styles.colors.textLight).fontSize(8).font(styles.font.regular);
  doc.text("Total Fat", 200, sumY + 15);
  doc.fillColor(styles.colors.text).fontSize(11).font(styles.font.bold).text(`${totals.fatKg.toFixed(2)} Kg`, 200, sumY + 30);

  doc.moveDown(5);

  const tableTop = doc.y;
  // --- UPDATED COLUMN POSITIONS TO FIT CLR ---
  const col = { 
    date: 40, 
    buyer: 105, 
    qty: 210, 
    fat: 260, 
    clr: 300, // NEW COLUMN
    snf: 340, 
    rate: 390, 
    amt: 470 
  };

  const drawTableHeader = (y) => {
    doc.rect(40, y, 515, 25).fill(styles.colors.primary);
    doc.fillColor('#ffffff').fontSize(8).font(styles.font.bold);
    doc.text("DATE", col.date + 5, y + 8);
    doc.text("PURCHASER", col.buyer, y + 8);
    doc.text("QTY", col.qty, y + 8, { width: 45, align: 'right' });
    doc.text("FAT", col.fat, y + 8, { width: 35, align: 'right' });
    doc.text("CLR", col.clr, y + 8, { width: 35, align: 'right' }); // ADDED CLR
    doc.text("SNF", col.snf, y + 8, { width: 45, align: 'right' });
    doc.text("RATE", col.rate, y + 8, { width: 50, align: 'right' });
    doc.text("AMOUNT", col.amt, y + 8, { width: 80, align: 'right' });
  };

  const headerCallback = (d) => {
    drawHeader(d, "RK MILK CHILLING CENTER", "Milk Sales Report");
    drawTableHeader(120);
  };

  drawTableHeader(tableTop);

  let y = tableTop + 30;
  records.forEach((r, i) => {
    y = checkAndAddPage(doc, y, 20, headerCallback);
    
    if (i % 2 !== 0) doc.rect(40, y - 5, 515, 20).fill(styles.colors.rowOdd);

    doc.fillColor(styles.colors.text).fontSize(9).font(styles.font.regular);
    doc.text(new Date(r.date).toLocaleDateString("en-IN"), col.date + 5, y);
    doc.text(r.purchaserName, col.buyer, y, { width: 100, ellipsis: true });
    
    doc.fillColor(styles.colors.textLight);
    doc.text(parseFloat(r.quantity).toFixed(2), col.qty, y, { width: 45, align: 'right' });
    doc.text(parseFloat(r.fat).toFixed(1), col.fat, y, { width: 35, align: 'right' });
    
    // --- ADDED CLR DATA ROW ---
    doc.text(r.clr ? parseFloat(r.clr).toFixed(1) : '-', col.clr, y, { width: 35, align: 'right' });
    
    doc.text(parseFloat(r.snf).toFixed(2), col.snf, y, { width: 45, align: 'right' });
    doc.text(parseFloat(r.rate).toFixed(2), col.rate, y, { width: 50, align: 'right' });
    
    doc.fillColor(styles.colors.green).font(styles.font.bold);
    doc.text(parseFloat(r.amount).toFixed(2), col.amt, y, { width: 80, align: 'right' });
    
    doc.moveTo(40, y + 14).lineTo(555, y + 14).strokeColor(styles.colors.border).lineWidth(0.25).stroke();
    y += 20;
  });

  drawFooter(doc);
  doc.end();
};

const generateItemSalePdf = (records, totals, filters, res) => {
  const doc = new PDFDocument({ margin: styles.margin, size: "A4", bufferPages: true });
  doc.pipe(res);

  drawHeader(doc, "RK MILK CHILLING CENTER", "Item Sales Report");

  const topY = doc.y;
  doc.fontSize(10).fillColor(styles.colors.textLight)
     .text(`Period: ${filters.startDate ? new Date(filters.startDate).toLocaleDateString('en-IN') : 'All'} - ${filters.endDate ? new Date(filters.endDate).toLocaleDateString('en-IN') : 'All'}`, 40, topY);

  doc.rect(40, topY + 20, 515, 45).fill('#fffbeb'); 
  doc.strokeColor('#fcd34d').lineWidth(1).rect(40, topY + 20, 515, 45).stroke();
  
  doc.fillColor(styles.colors.text).fontSize(9).text("Total Quantity Sold:", 60, topY + 38);
  doc.font(styles.font.bold).text(totals.quantity.toFixed(2), 160, topY + 38);
  
  doc.font(styles.font.regular).text("Total Revenue:", 350, topY + 38);
  doc.font(styles.font.bold).fillColor(styles.colors.green).text(`Rs. ${totals.amount.toFixed(2)}`, 430, topY + 38);

  doc.moveDown(5);

  const tableTop = doc.y;
  const col = { date: 40, prod: 120, buyer: 230, qty: 350, rate: 420, amt: 490 };

  const drawTableHeader = (y) => {
    doc.rect(40, y, 515, 25).fill(styles.colors.primary);
    doc.fillColor('#ffffff').fontSize(8).font(styles.font.bold);
    doc.text("DATE", col.date + 5, y + 8);
    doc.text("PRODUCT", col.prod, y + 8);
    doc.text("BUYER", col.buyer, y + 8);
    doc.text("QTY", col.qty, y + 8, { width: 60, align: 'right' });
    doc.text("RATE", col.rate, y + 8, { width: 50, align: 'right' });
    doc.text("AMOUNT", col.amt, y + 8, { width: 60, align: 'right' });
  };

  const headerCallback = (d) => {
    drawHeader(d, "RK MILK CHILLING CENTER", "Item Sales Report");
    drawTableHeader(120);
  };

  drawTableHeader(tableTop);

  let y = tableTop + 30;
  records.forEach((r, i) => {
    y = checkAndAddPage(doc, y, 20, headerCallback);

    if (i % 2 !== 0) doc.rect(40, y - 5, 515, 20).fill(styles.colors.rowOdd);

    doc.fillColor(styles.colors.text).fontSize(9).font(styles.font.regular);
    doc.text(new Date(r.date).toLocaleDateString("en-IN"), col.date + 5, y);
    doc.text(r.product?.name || "-", col.prod, y, { width: 100 });
    doc.text(r.purchaserName || "-", col.buyer, y, { width: 110 });
    
    doc.fillColor(styles.colors.textLight);
    doc.text(`${r.quantity} ${r.product?.unit || ''}`, col.qty, y, { width: 60, align: 'right' });
    doc.text(r.rate, col.rate, y, { width: 50, align: 'right' });
    
    doc.fillColor(styles.colors.green).font(styles.font.bold);
    doc.text(parseFloat(r.amount).toFixed(2), col.amt, y, { width: 60, align: 'right' });
    
    doc.moveTo(40, y + 14).lineTo(555, y + 14).strokeColor(styles.colors.border).lineWidth(0.25).stroke();
    y += 20;
  });

  drawFooter(doc);
  doc.end();
};

const generateCustomerReportPdf = (customer, history, dateRange, res) => {
  const doc = new PDFDocument({ margin: styles.margin, size: "A4", bufferPages: true });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=Statement-${customer.name}.pdf`);
  doc.pipe(res);

  drawHeader(doc, "RK MILK CHILLING CENTER", "Account Statement");

  const topY = doc.y;
  
  doc.rect(40, topY, 250, 70).fillAndStroke('#f8fafc', styles.colors.border);
  doc.fillColor(styles.colors.text).fontSize(8).font(styles.font.bold).text("CUSTOMER DETAILS", 50, topY + 10);
  doc.fontSize(12).text(customer.name, 50, topY + 25);
  doc.fontSize(10).font(styles.font.regular).fillColor(styles.colors.textLight)
     .text(`Mobile: ${customer.mobile || 'N/A'}`, 50, topY + 45);

  doc.rect(305, topY, 250, 70).fillAndStroke('#f8fafc', styles.colors.border);
  doc.fillColor(styles.colors.text).fontSize(8).font(styles.font.bold).text("STATEMENT SUMMARY", 315, topY + 10);
  doc.font(styles.font.regular).fontSize(9)
     .text(`From: ${dateRange.startDate || 'Start'}`, 315, topY + 25)
     .text(`To: ${dateRange.endDate || 'Now'}`, 315, topY + 40);

  doc.moveDown(5);

  let totalDebit = 0, totalCredit = 0;
  history.forEach(item => {
    const amt = parseFloat(item.amount);
    if (item.isCredit) { totalDebit += amt; if (item.paymentStatus === 'PAID') totalCredit += amt; }
    else { totalCredit += amt; }
  });
  const netDue = parseFloat(customer.totalDue || (totalDebit - totalCredit));

  const barY = doc.y;
  doc.rect(40, barY, 515, 30).fill(styles.colors.primary);
  doc.fillColor('#ffffff').fontSize(10).font(styles.font.bold);
  doc.text(`Total Sales: Rs. ${totalDebit.toFixed(2)}`, 50, barY + 10);
  doc.text(`Total Paid: Rs. ${totalCredit.toFixed(2)}`, 220, barY + 10);
  doc.text(`Net Due: Rs. ${netDue.toFixed(2)}`, 400, barY + 10, { align: 'right', width: 145 });

  doc.moveDown(3);

  const tableTop = doc.y;
  const col = { date: 40, type: 120, desc: 200, debit: 380, credit: 470 };

  const drawTableHeader = (y) => {
    doc.rect(40, y, 515, 25).fill(styles.colors.textLight);
    doc.fillColor('#ffffff').fontSize(8).font(styles.font.bold);
    doc.text("DATE", col.date + 5, y + 8);
    doc.text("TYPE", col.type, y + 8);
    doc.text("DESCRIPTION", col.desc, y + 8);
    doc.text("DEBIT (Due)", col.debit, y + 8, { width: 70, align: 'right' });
    doc.text("CREDIT (Paid)", col.credit, y + 8, { width: 70, align: 'right' });
  };

  const headerCallback = (d) => {
    drawHeader(d, "RK MILK CHILLING CENTER", "Account Statement");
    drawTableHeader(120);
  };

  drawTableHeader(tableTop);

  let y = tableTop + 30;
  history.forEach((item, i) => {
    y = checkAndAddPage(doc, y, 20, headerCallback);

    if (i % 2 !== 0) doc.rect(40, y - 5, 515, 20).fill(styles.colors.rowOdd);

    const date = new Date(item.date).toLocaleDateString("en-IN");
    const amt = parseFloat(item.amount);

    doc.fillColor(styles.colors.text).fontSize(9).font(styles.font.regular);
    doc.text(date, col.date + 5, y);
    
    const typeLabel = item.type.replace('_', ' ');
    doc.fontSize(7).font(styles.font.bold).fillColor(item.isCredit ? '#1e40af' : '#166534')
       .text(typeLabel, col.type, y + 1);
    
    doc.fontSize(9).font(styles.font.regular).fillColor(styles.colors.textLight);
    doc.text(item.description, col.desc, y, { width: 170, ellipsis: true });

    if (item.isCredit) {
      doc.fillColor(styles.colors.red).text(amt.toFixed(2), col.debit, y, { align: 'right', width: 70 });
      if (item.paymentStatus === 'PAID') doc.fillColor(styles.colors.green).text(amt.toFixed(2), col.credit, y, { align: 'right', width: 70 });
    } else {
      doc.fillColor(styles.colors.green).text(amt.toFixed(2), col.credit, y, { align: 'right', width: 70 });
    }
    
    doc.moveTo(40, y + 14).lineTo(555, y + 14).strokeColor(styles.colors.border).lineWidth(0.25).stroke();
    y += 20;
  });

  y = checkAndAddPage(doc, y, 20); // Check space for footer line
  doc.moveTo(40, y + 10).lineTo(555, y + 10).dash(5, { space: 5 }).strokeColor(styles.colors.textLight).stroke();
  doc.fontSize(8).fillColor(styles.colors.textLight).text("** End of Statement **", 40, y + 20, { align: 'center', width: 515 });

  drawFooter(doc);
  doc.end();
};

const generateSupplierReportPdf = (supplier, history, dateRange, res) => {
  const doc = new PDFDocument({ margin: styles.margin, size: 'A4', bufferPages: true });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Statement-${supplier.name}.pdf`);
  doc.pipe(res);

  drawHeader(doc, "RK MILK CHILLING CENTER", "Supplier Payment Statement");

  const topY = doc.y;
  const cardH = 65;
  const cardW = 165;
  
  doc.roundedRect(40, topY, cardW, cardH, 5).strokeColor(styles.colors.border).stroke();
  doc.fontSize(8).font(styles.font.bold).fillColor(styles.colors.textLight).text("SUPPLIER", 50, topY + 10);
  doc.fontSize(11).font(styles.font.bold).fillColor(styles.colors.text).text(supplier.name, 50, topY + 25);
  doc.fontSize(9).font(styles.font.regular).text(`Rate: Rs. ${supplier.rate}/Fat`, 50, topY + 45);

  doc.roundedRect(40 + cardW + 10, topY, cardW, cardH, 5).stroke();
  doc.fontSize(8).font(styles.font.bold).fillColor(styles.colors.textLight).text("PERIOD", 50 + cardW + 10, topY + 10);
  doc.fontSize(10).font(styles.font.regular).fillColor(styles.colors.text)
      .text(`${dateRange.startDate || 'Start'} to`, 50 + cardW + 10, topY + 25)
      .text(`${dateRange.endDate || 'Present'}`, 50 + cardW + 10, topY + 40);

  const sortedHistory = [...history].reverse();
  let totalCredit = 0, totalDebit = 0;
  sortedHistory.forEach(item => { item.isCredit ? totalCredit += parseFloat(item.amount) : totalDebit += parseFloat(item.amount); });
  const closingBalance = parseFloat(supplier.balance || (totalCredit - totalDebit));

  doc.roundedRect(40 + (cardW * 2) + 20, topY, cardW, cardH, 5).fillAndStroke('#eff6ff', styles.colors.primary);
  doc.fillColor(styles.colors.primary).fontSize(8).font(styles.font.bold).text("NET PAYABLE", 50 + (cardW * 2) + 20, topY + 10);
  doc.fontSize(14).text(`Rs. ${closingBalance.toFixed(2)}`, 50 + (cardW * 2) + 20, topY + 30);

  doc.moveDown(6);

  const tableTop = doc.y;
  // --- OPTIMIZED COLUMN POSITIONS TO FIT ALL DATA ---
  const col = { 
    date: 40, 
    shift: 92,   
    qty: 125, 
    fat: 165, 
    clr: 195,   
    snf: 225,   // NEW COLUMN (Percentage)
    fkg: 255, 
    skg: 300, 
    credit: 365, 
    debit: 470 
  };

  const drawTableHeader = (y) => {
    doc.rect(40, y, 515, 25).fill(styles.colors.primary);
    doc.fillColor('#ffffff').fontSize(7).font(styles.font.bold); // Font size 7 for header
    doc.text("DATE", col.date + 2, y + 8);
    doc.text("SFT", col.shift, y + 8);
    doc.text("MILK(Kg)", col.qty, y + 8, { width: 38, align: 'right' });
    doc.text("FAT", col.fat, y + 8, { width: 28, align: 'right' });
    doc.text("CLR", col.clr, y + 8, { width: 28, align: 'right' });
    doc.text("SNF", col.snf, y + 8, { width: 28, align: 'right' }); // Header for SNF %
    doc.text("FAT(Kg)", col.fkg, y + 8, { width: 42, align: 'right' });
    doc.text("SNF(Kg)", col.skg, y + 8, { width: 42, align: 'right' });
    doc.text("VALUE(Cr)", col.credit, y + 8, { width: 75, align: 'right' });
    doc.text("PAID(Dr)", col.debit, y + 8, { width: 75, align: 'right' });
  };

  const headerCallback = (d) => {
    drawHeader(d, "RK MILK CHILLING CENTER", "Supplier Statement");
    drawTableHeader(120);
  };

  drawTableHeader(tableTop);

  let y = tableTop + 30;
  sortedHistory.forEach((item, index) => {
    y = checkAndAddPage(doc, y, 20, headerCallback);

    if (index % 2 !== 0) doc.rect(40, y - 5, 515, 20).fill(styles.colors.rowOdd);

    const date = new Date(item.date).toLocaleDateString('en-IN');
    const amount = parseFloat(item.amount);

    doc.fillColor(styles.colors.text).fontSize(8).font(styles.font.regular); // Font size 8 for body
    doc.text(date, col.date + 2, y);

    if (item.isCredit && item.details && item.type === 'MILK_SUPPLY') {
      // SHIFT
      doc.text(item.details.shift ? item.details.shift.charAt(0) : '-', col.shift, y); 

      doc.fillColor(styles.colors.textLight);
      doc.text(parseFloat(item.details.quantity).toFixed(2), col.qty, y, { width: 38, align: 'right' });
      doc.text(parseFloat(item.details.fat).toFixed(1), col.fat, y, { width: 28, align: 'right' });
      doc.text(item.details.clr ? parseFloat(item.details.clr).toFixed(1) : '-', col.clr, y, { width: 28, align: 'right' });
      
      // SNF % COLUMN
      doc.text(item.details.snf ? parseFloat(item.details.snf).toFixed(2) : '-', col.snf, y, { width: 28, align: 'right' });
      
      doc.text(parseFloat(item.details.fatKg).toFixed(2), col.fkg, y, { width: 42, align: 'right' });
      doc.text(item.details.snfKg ? parseFloat(item.details.snfKg).toFixed(2) : '-', col.skg, y, { width: 42, align: 'right' });
      
      doc.fillColor(styles.colors.text).font(styles.font.bold);
      doc.text(amount.toFixed(2), col.credit, y, { width: 75, align: 'right' });
    } else {
      doc.fillColor(styles.colors.textLight).fontSize(7.5);
      doc.text(item.description, col.shift, y + 1, { width: 240, ellipsis: true }); 
      doc.fontSize(8);
      if (item.isCredit) {
        doc.fillColor(styles.colors.text).text(amount.toFixed(2), col.credit, y, { width: 75, align: 'right' });
      } else {
        doc.fillColor(styles.colors.green).font(styles.font.bold).text(amount.toFixed(2), col.debit, y, { width: 75, align: 'right' });
      }
    }
    
    doc.moveTo(40, y + 14).lineTo(555, y + 14).strokeColor(styles.colors.border).lineWidth(0.25).stroke();
    y += 20;
  });

  drawFooter(doc);
  doc.end();
};

const generateBillListPdf = (bills, dateRange, filters, res) => {
  const doc = new PDFDocument({ margin: styles.margin, size: 'A4', bufferPages: true });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Bill-Summary-${dateRange.startDate}.pdf`);
  doc.pipe(res);

  // --- 1. Helper to format date to Indian Style (DD-MM-YYYY) ---
  const formatDateIndian = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
  };

  // --- Logic to determine Shift Text ---
  let shiftText = "ALL SHIFTS";
  if (filters && filters.shift === 'MORNING') shiftText = "MORNING SHIFT";
  else if (filters && filters.shift === 'EVENING') shiftText = "EVENING SHIFT";

  const headerCallback = (d) => {
    drawHeader(d, "RK MILK CHILLING CENTER", "Payment Disbursement Sheet");
    d.rect(40, 120, 515, 25).fill(styles.colors.primary);
    d.fillColor('#ffffff').fontSize(8).font(styles.font.bold);
    d.text("SUPPLIER NAME", 45, 128);
    d.text("MILK(Kg)", 160, 128, { width: 50, align: 'right' });
    d.text("FAT(Kg)", 220, 128, { width: 50, align: 'right' });
    d.text("SNF(Kg)", 280, 128, { width: 50, align: 'right' });
    d.text("TOTAL(Rs)", 340, 128, { width: 60, align: 'right' });
    d.text("ADVANCE", 410, 128, { width: 60, align: 'right' });
    d.text("NET PAYABLE", 480, 128, { width: 70, align: 'right' });
  };
  
  drawHeader(doc, "RK MILK CHILLING CENTER", "Payment Disbursement Sheet");

  const topY = doc.y;
  doc.rect(40, topY, 515, 30).fill('#fefce8'); 
  doc.strokeColor('#fde047').rect(40, topY, 515, 30).stroke();
  
  // --- 2. Use the formatted dates in the header text ---
  doc.fillColor(styles.colors.text).fontSize(10).font(styles.font.bold)
      .text(
        `Billing Cycle: ${formatDateIndian(dateRange.startDate)}  TO  ${formatDateIndian(dateRange.endDate)}  •  ${shiftText}`, 
        40, 
        topY + 10, 
        { align: 'center', width: 515 }
      );

  doc.moveDown(3);

  const tableTop = doc.y;
  const col = { name: 40, milk: 160, fat: 220, snf: 280, total: 340, adv: 410, net: 480 };

  const drawTableHeader = (y) => {
    doc.rect(40, y, 515, 25).fill(styles.colors.primary);
    doc.fillColor('#ffffff').fontSize(8).font(styles.font.bold);
    doc.text("SUPPLIER NAME", col.name + 5, y + 8);
    doc.text("MILK(Kg)", col.milk, y + 8, { width: 50, align: 'right' });
    doc.text("FAT(Kg)", col.fat, y + 8, { width: 50, align: 'right' });
    doc.text("SNF(Kg)", col.snf, y + 8, { width: 50, align: 'right' });
    doc.text("TOTAL(Rs)", col.total, y + 8, { width: 60, align: 'right' });
    doc.text("ADVANCE", col.adv, y + 8, { width: 60, align: 'right' });
    doc.text("NET PAYABLE", col.net, y + 8, { width: 70, align: 'right' });
  };

  drawTableHeader(tableTop);

  let y = tableTop + 30;
  let totalPayable = 0;

  bills.forEach((bill, i) => {
    y = checkAndAddPage(doc, y, 20, headerCallback);
    
    if (i % 2 !== 0) doc.rect(40, y - 5, 515, 20).fill(styles.colors.rowOdd);

    doc.fillColor(styles.colors.text).fontSize(9).font(styles.font.regular);
    doc.text(bill.name, col.name + 5, y, { width: 115, ellipsis: true });
    
    doc.fillColor(styles.colors.textLight);
    doc.text(parseFloat(bill.totalQuantity).toFixed(2), col.milk, y, { width: 50, align: 'right' });
    doc.text(parseFloat(bill.totalFatKg).toFixed(2), col.fat, y, { width: 50, align: 'right' });
    doc.text(parseFloat(bill.totalSnfKg).toFixed(2), col.snf, y, { width: 50, align: 'right' });
    
    doc.fillColor(styles.colors.text).font(styles.font.bold);
    doc.text(bill.totalMilkAmount, col.total, y, { width: 60, align: 'right' });
    
    doc.fillColor(styles.colors.red).font(styles.font.regular);
    doc.text(bill.totalAdvance > 0 ? bill.totalAdvance : '-', col.adv, y, { width: 60, align: 'right' });
    
    doc.fillColor(styles.colors.green).font(styles.font.bold);
    doc.text(bill.netPayable, col.net, y, { width: 70, align: 'right' });

    totalPayable += parseFloat(bill.netPayable);
    
    doc.moveTo(40, y + 14).lineTo(555, y + 14).strokeColor(styles.colors.border).lineWidth(0.25).stroke();
    y += 20;
  });

  y = checkAndAddPage(doc, y, 30, headerCallback);

  y += 5;
  doc.rect(40, y, 515, 30).fill(styles.colors.primary);
  doc.fillColor('#ffffff').fontSize(12).font(styles.font.bold);
  doc.text("GRAND TOTAL PAYABLE", 40, y + 10, { width: 430, align: 'right' });
  doc.text(`Rs. ${totalPayable.toFixed(2)}`, 460, y + 10, { width: 90, align: 'right' });

  drawFooter(doc);
  doc.end();
};

module.exports = {
  generateBillPdf,
  generateSalePdf,
  generateItemSalePdf,
  generateCustomerReportPdf,
  generateSupplierReportPdf,
  generateBillListPdf
};