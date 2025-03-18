import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Extract device names from the first column
    const uploadedDevices = data.slice(1).map((row: any) => row[0]);

    // Fetch devices from the database
    const dbDevices = await prisma.item.findMany();

    // Create a map to track the count of each device in the database
    const dbDeviceCountMap = new Map<string, number>();
    dbDevices.forEach((device) => {
      dbDeviceCountMap.set(device.name, (dbDeviceCountMap.get(device.name) || 0) + 1);
    });

    // Compare uploaded data with database data
    const commonData: string[] = [];
    const unmatchedData: string[] = [];

    // Create a copy of the database count map to track remaining matches
    const remainingDbCountMap = new Map(dbDeviceCountMap);

    uploadedDevices.forEach((device) => {
      if (remainingDbCountMap.has(device) && remainingDbCountMap.get(device)! > 0) {
        commonData.push(device);
        remainingDbCountMap.set(device, remainingDbCountMap.get(device)! - 1);
      } else {
        unmatchedData.push(device);
      }
    });

    // Create a new Excel file with common and unmatched data
    const newWorkbook = xlsx.utils.book_new();

    // Prepare the data for the new sheet
    const newSheetData = [['Common Data', 'Unmatched Data']];

    // Determine the maximum length between commonData and unmatchedData
    const maxLength = Math.max(commonData.length, unmatchedData.length);

    // Populate the new sheet data
    for (let i = 0; i < maxLength; i++) {
      const common = commonData[i] || ''; // Use empty string if no common data
      const unmatched = unmatchedData[i] || ''; // Use empty string if no unmatched data
      newSheetData.push([common, unmatched]);
    }

    // Create a new sheet and add it to the workbook
    const newSheet = xlsx.utils.aoa_to_sheet(newSheetData);
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Comparison Results');

    // Write the workbook to a buffer
    const newFileBuffer = xlsx.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });

    // Convert buffer to base64 for downloading
    const base64Data = Buffer.from(newFileBuffer).toString('base64');

    return NextResponse.json(
      {
        message: 'File processed successfully',
        commonData,
        unmatchedData,
        file: base64Data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Error processing file' },
      { status: 500 }
    );
  }
}