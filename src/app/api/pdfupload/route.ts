import { NextResponse } from 'next/server';
import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import pdf from 'pdf-parse';
import ExcelJS from 'exceljs';

export async function POST(request: Request) {
  try {
    // Create a temporary directory
    const tmpDir = path.join(os.tmpdir(), 'pdf-upload-' + uuidv4());
    await fs.mkdir(tmpDir, { recursive: true });
    
    // Get the uploaded file from the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Check if the file is a PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Uploaded file must be a PDF' }, { status: 400 });
    }
    
    // Convert the file to a buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Save to a temporary file (useful for debugging)
    const tempFilePath = path.join(tmpDir, 'upload.pdf');
    await fs.writeFile(tempFilePath, fileBuffer);
    
    // Parse the PDF directly from the buffer
    const pdfData = await pdf(fileBuffer);
    
    // Split the PDF text into lines
    const lines = pdfData.text.split(/\r?\n/);
    
    // Array to store the extracted product details
    const productDetails: string[] = [];
    
    // Process the PDF text line by line
    let inProductDetailsSection = false;
    let currentProductDetail = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      // Check if we've found the SKU line
      if (lowerLine.includes('sku')) {
        // Get the text after "SKU" if it exists on the same line
        const skuLineParts = line.split(/sku/i);
        if (skuLineParts.length > 1 && skuLineParts[1].trim()) {
          productDetails.push(skuLineParts[1].trim());
        }
        
        // The product details section starts after the SKU line
        inProductDetailsSection = true;
        currentProductDetail = '';
        continue;
      }
      
      // If we're in the product details section, collect the text
      if (inProductDetailsSection) {
        // Check for section endings - if we hit another heading or a blank line
        if (
          (line === '') || 
          lowerLine.includes('product description') ||
          lowerLine.includes('features') ||
          lowerLine.includes('specifications')
        ) {
          // If we've been collecting product details, save them
          if (currentProductDetail.trim()) {
            productDetails.push(currentProductDetail.trim());
          }
          inProductDetailsSection = false;
          continue;
        }
        
        // Add this line to the current product detail
        if (currentProductDetail) {
          currentProductDetail += ' ' + line;
        } else {
          currentProductDetail = line;
        }
      }
    }
    
    // Make sure to save the last product detail if we're still in that section
    if (inProductDetailsSection && currentProductDetail.trim()) {
      productDetails.push(currentProductDetail.trim());
    }
    
    // Clean up the product details
    const cleanedProductDetails = productDetails.map(detail => {
      let cleanedDetail = detail;
      
      // 1. Remove "SizeQtyColorOrder No." and everything after it
      const sizeQtyPattern = /SizeQtyColorOrder No\./i;
      const sizeQtyMatch = cleanedDetail.match(sizeQtyPattern);
      if (sizeQtyMatch) {
        cleanedDetail = cleanedDetail.substring(0, sizeQtyMatch.index).trim();
      }
      
      // 2. Find the index of "Free Size" (case insensitive)
      const freeSizeIndex = cleanedDetail.toLowerCase().indexOf('free size');
      if (freeSizeIndex !== -1) {
        // Return only the part before "Free Size"
        cleanedDetail = cleanedDetail.substring(0, freeSizeIndex).trim();
      }
      
      // 3. If "Free" exists but not as part of "Free Size"
      const freeIndex = cleanedDetail.toLowerCase().indexOf('free');
      if (freeIndex !== -1 && cleanedDetail.toLowerCase().indexOf('size', freeIndex) !== freeIndex + 5) {
        // Check if "Free" is a standalone word
        const beforeFree = freeIndex === 0 ? ' ' : cleanedDetail.charAt(freeIndex - 1);
        const afterFree = freeIndex + 4 >= cleanedDetail.length ? ' ' : cleanedDetail.charAt(freeIndex + 4);
        
        if (/\s/.test(beforeFree) && /\s/.test(afterFree)) {
          // It's a standalone "Free" word, remove it and everything after
          cleanedDetail = cleanedDetail.substring(0, freeIndex).trim();
        }
      }
      
      return cleanedDetail;
    });
    
    // Create an Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Product Details');
    
    // Add headers
    worksheet.columns = [
      { header: 'Product Details', key: 'details', width: 100 },
    ];
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }, // Light gray
    };
    
    // Add data
    for (const detail of cleanedProductDetails) {
      if (detail) { // Only add non-empty details
        worksheet.addRow({
          details: detail,
        });
      }
    }
    
    // Add a debug worksheet with the original and cleaned details
    const debugWorksheet = workbook.addWorksheet('Debug - Details');
    debugWorksheet.columns = [
      { header: 'Original', key: 'original', width: 100 },
      { header: 'Cleaned', key: 'cleaned', width: 100 },
    ];
    debugWorksheet.getRow(1).font = { bold: true };
    
    // Add each original and cleaned detail for comparison
    for (let i = 0; i < productDetails.length; i++) {
      debugWorksheet.addRow({
        original: productDetails[i],
        cleaned: cleanedProductDetails[i],
      });
    }
    
    // Add a debug worksheet with the full PDF text
    const fullTextWorksheet = workbook.addWorksheet('Debug - Full Text');
    fullTextWorksheet.columns = [
      { header: 'Line Number', key: 'lineNum', width: 15 },
      { header: 'Text', key: 'text', width: 150 },
    ];
    fullTextWorksheet.getRow(1).font = { bold: true };
    
    // Add each line with its line number for debugging
    lines.forEach((line, index) => {
      fullTextWorksheet.addRow({
        lineNum: index + 1,
        text: line,
      });
    });
    
    // Generate Excel file
    const excelFilePath = path.join(tmpDir, 'product_details.xlsx');
    await workbook.xlsx.writeFile(excelFilePath);
    
    // Read the Excel file as a buffer
    const excelBuffer = await fs.readFile(excelFilePath);
    
    // Clean up temporary files
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
      // Continue anyway, as we've already processed the files
    }
    
    // Return the Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=product_details.xlsx',
      },
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF file: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}