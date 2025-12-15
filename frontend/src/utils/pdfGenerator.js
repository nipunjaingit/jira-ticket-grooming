/**
 * PDF Generator Utility
 * Generates professional PDF reports from AI ticket analysis
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Color palette for PDF sections
 */
const COLORS = {
  primary: '#1f2937',      // Gray-900
  secondary: '#6366f1',    // Indigo-600
  success: '#16a34a',      // Green-600
  warning: '#f59e0b',      // Amber-500
  danger: '#dc2626',       // Red-600
  info: '#0891b2',         // Cyan-600
  purple: '#a855f7',       // Purple-600
  lightGray: '#f3f4f6',    // Gray-100
  text: '#111827',         // Gray-900
  textLight: '#6b7280',    // Gray-500
};

/**
 * Safely convert hex color to RGB
 */
function hexToRgb(hex) {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      };
    }
    return { r: 31, g: 41, b: 55 }; // Default to primary color
  } catch (error) {
    console.warn('Color conversion failed, using default:', error);
    return { r: 31, g: 41, b: 55 };
  }
}

/**
 * Generate PDF from ticket and analysis data
 */
export async function generateAnalysisPDF(ticket, analysisResult) {
  try {
    // Create PDF document (A4, portrait)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const footerMargin = 15; // Reserve space for footer

    // Set default text color
    pdf.setTextColor(COLORS.text);

    // 1. COVER SECTION
    yPosition = addCoverSection(pdf, ticket, analysisResult, yPosition);
    yPosition += 5;

    // Add page break if needed
    if (yPosition > pageHeight - footerMargin - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    // 2. TICKET INFORMATION SECTION
    yPosition = addTicketInfoSection(pdf, ticket, yPosition, contentWidth, margin);
    yPosition += 8;

    // 3. QUALITY SCORE SECTION
    yPosition = addQualityScoreSection(pdf, analysisResult, yPosition, contentWidth, margin);
    yPosition += 8;

    // Add page break if needed
    if (yPosition > pageHeight - footerMargin - 80) {
      pdf.addPage();
      yPosition = 20;
    }

    // 4. ANALYSIS SECTIONS
    const sections = [
      { title: 'Good Points', key: 'goodPoints', color: COLORS.success, icon: '✓' },
      { title: 'Missing Points', key: 'missingPoints', color: COLORS.warning, icon: '⚠' },
      { title: 'Contradictions & Mismatches', key: 'mismatches', color: COLORS.danger, icon: '⚡' },
      { title: 'UI/UX Suggestions', key: 'uiSuggestions', color: COLORS.purple, icon: '✨' },
      { title: 'Technical Suggestions', key: 'technicalSuggestions', color: COLORS.info, icon: '🔧' },
      { title: 'Refined Acceptance Criteria', key: 'acceptanceCriteria', color: COLORS.success, icon: '✅' },
      { title: 'Clarifying Questions', key: 'questions', color: COLORS.info, icon: '❓' },
    ];

    for (const section of sections) {
      if (analysisResult[section.key] && analysisResult[section.key].length > 0) {
        // Estimate section height (rough calculation)
        const sectionHeight = estimateSectionHeight(analysisResult[section.key].length);
        
        // Check if we need a page break
        if (yPosition + sectionHeight > pageHeight - footerMargin - 10) {
          pdf.addPage();
          yPosition = 20;
        }

        yPosition = addListSection(
          pdf,
          section.title,
          analysisResult[section.key],
          section.color,
          yPosition,
          contentWidth,
          margin
        );
        yPosition += 5;
      }
    }

    // 5. STORY POINTS SECTION
    if (analysisResult.storyPoints) {
      // Check if we need a page break (story points needs ~25mm)
      if (yPosition + 30 > pageHeight - footerMargin - 5) {
        pdf.addPage();
        yPosition = 20;
      }
      yPosition = addStoryPointsSection(pdf, analysisResult.storyPoints, yPosition, contentWidth, margin);
      yPosition += 8;
    }

    // 6. FOOTER (add to every page)
    addFooterToAllPages(pdf);

    // Download the PDF
    const filename = `Ticket-Analysis-${ticket.key}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

/**
 * Estimate section height based on number of items
 */
function estimateSectionHeight(itemCount) {
  // Rough estimate: 8mm for header + 5mm per item
  return 8 + (itemCount * 5);
}

/**
 * Add cover section with title and ticket key
 */
function addCoverSection(pdf, ticket, analysisResult, yPosition) {
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Background rectangle
  pdf.setFillColor(COLORS.primary);
  pdf.rect(0, yPosition - 10, pageWidth, 50, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  pdf.text('Ticket Analysis Report', margin, yPosition + 10);

  // Ticket key
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Ticket: ${ticket.key}`, margin, yPosition + 25);

  // Summary
  pdf.setFontSize(12);
  pdf.setTextColor(200, 200, 200);
  const summaryLines = pdf.splitTextToSize(ticket.fields.summary, contentWidth - 5);
  pdf.text(summaryLines, margin, yPosition + 35);

  // Timestamp
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition + 48);

  return yPosition + 55;
}

/**
 * Add ticket information section
 */
function addTicketInfoSection(pdf, ticket, yPosition, contentWidth, margin) {
  pdf.setTextColor(COLORS.text);
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');

  // Section title
  pdf.text('TICKET INFORMATION', margin, yPosition);
  yPosition += 6;

  // Information grid
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);

  const infoItems = [
    { label: 'Key:', value: ticket.key },
    { label: 'Type:', value: ticket.fields.issuetype?.name || 'Unknown' },
    { label: 'Priority:', value: ticket.fields.priority?.name || 'Unknown' },
    { label: 'Status:', value: ticket.fields.status?.name || 'Unknown' },
    { label: 'Assignee:', value: ticket.fields.assignee?.displayName || 'Unassigned' },
    { label: 'Created:', value: new Date(ticket.fields.created).toLocaleDateString() },
  ];

  let currentX = margin;
  let currentY = yPosition;
  const colWidth = contentWidth / 2;

  infoItems.forEach((item, index) => {
    if (index > 0 && index % 2 === 0) {
      currentY += 7;
      currentX = margin;
    }

    pdf.setTextColor(COLORS.textLight);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${item.label}`, currentX, currentY);

    pdf.setTextColor(COLORS.text);
    pdf.setFont(undefined, 'normal');
    const valueX = currentX + 35;
    const valueLines = pdf.splitTextToSize(item.value, colWidth - 35);
    pdf.text(valueLines, valueX, currentY);

    currentX += colWidth;
  });

  return currentY + 15;
}

/**
 * Add quality score section with visual indicator
 */
function addQualityScoreSection(pdf, analysisResult, yPosition, contentWidth, margin) {
  try {
    const score = analysisResult.score || 0;

    // Section title
    pdf.setTextColor(COLORS.text);
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text('QUALITY SCORE', margin, yPosition);
    yPosition += 8;

    // Score value
    pdf.setFontSize(28);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(COLORS.secondary);
    pdf.text(`${score}/100`, margin, yPosition + 8);

    // Score bar background
    const barWidth = contentWidth - 60;
    const barHeight = 8;
    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin + 50, yPosition + 2, barWidth, barHeight, 'F');

    // Score bar fill
    const scorePercentage = score / 100;
    let barColor = COLORS.danger;
    if (scorePercentage > 0.7) barColor = COLORS.success;
    else if (scorePercentage > 0.5) barColor = COLORS.warning;

    const rgb = hexToRgb(barColor);
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.rect(margin + 50, yPosition + 2, Math.max(1, barWidth * scorePercentage), barHeight, 'F');

    // Description
    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.textLight);
    let description = 'Poor quality - needs significant improvement';
    if (scorePercentage > 0.7) description = 'Good quality - well-defined requirements';
    else if (scorePercentage > 0.5) description = 'Fair quality - some improvements needed';
    pdf.text(description, margin + 50, yPosition + 15);

    return yPosition + 25;
  } catch (error) {
    console.warn('Failed to render quality score section:', error);
    return yPosition + 30;
  }
}

/**
 * Add a list section with title and items
 */
function addListSection(pdf, title, items, color, yPosition, contentWidth, margin) {
  const pageHeight = pdf.internal.pageSize.height;
  const footerMargin = 15;

  pdf.setTextColor(COLORS.text);
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');

  // Section header with color bar
  const headerHeight = 6;
  const rgb = hexToRgb(color);
  pdf.setFillColor(rgb.r, rgb.g, rgb.b);
  pdf.rect(margin, yPosition - 3, 3, headerHeight, 'F');

  pdf.setTextColor(color);
  pdf.text(title, margin + 6, yPosition + 1);
  yPosition += 8;

  // List items
  pdf.setFontSize(10);
  pdf.setTextColor(COLORS.text);
  pdf.setFont(undefined, 'normal');

  items.forEach((item, index) => {
    try {
      // Check if we need a page break
      if (yPosition > pageHeight - footerMargin - 15) {
        pdf.addPage();
        yPosition = 20;
      }

      // Bullet point
      pdf.setTextColor(color);
      pdf.text('•', margin + 2, yPosition);

      // Item text
      pdf.setTextColor(COLORS.text);
      const textX = margin + 8;
      const textWidth = contentWidth - 8;
      const lines = pdf.splitTextToSize(String(item), textWidth);

      lines.forEach((line, lineIndex) => {
        if (lineIndex === 0) {
          pdf.text(line, textX, yPosition);
        } else {
          yPosition += 4;
          // Check for page break again within multi-line items
          if (yPosition > pageHeight - footerMargin - 10) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, textX, yPosition);
        }
      });

      yPosition += 5;
    } catch (error) {
      console.warn(`Failed to render list item ${index}:`, error);
      // Continue with next item instead of crashing
    }
  });

  return yPosition;
}

/**
 * Add story points section
 */
function addStoryPointsSection(pdf, storyPoints, yPosition, contentWidth, margin) {
  try {
    // Background
    const primaryRgb = hexToRgb(COLORS.primary);
    pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.rect(margin, yPosition - 3, contentWidth, 20, 'F');

    // Label
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text('ESTIMATED EFFORT', margin + 5, yPosition + 3);

    // Points
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${storyPoints} Points`, margin + 5, yPosition + 12);

    return yPosition + 25;
  } catch (error) {
    console.warn('Failed to render story points section:', error);
    return yPosition + 30;
  }
}

/**
 * Add footer with timestamp to all pages
 */
function addFooterToAllPages(pdf) {
  const totalPages = pdf.internal.pages.length;
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const footerY = pageHeight - 10;

  for (let i = 1; i < totalPages; i++) {
    pdf.setPage(i);
    
    // Line separator
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);

    // Footer text
    pdf.setFontSize(8);
    pdf.setTextColor(COLORS.textLight);
    const footerText = `Generated by Ticket Grooming AI | ${new Date().toLocaleString()}`;
    const textWidth = pdf.getStringUnitWidth(footerText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    const textX = (pageWidth - textWidth) / 2;
    pdf.text(footerText, textX, footerY);
  }
}

/**
 * Trigger PDF download
 */
export function downloadPDF(filename, pdfData) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(pdfData);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
