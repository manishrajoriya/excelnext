import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';

const prisma = new PrismaClient();

type ExcelRow = [string]; // Represents a row in the Excel sheet (only the first column is used)

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate file
    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    // Validate sheet
    if (workbook.SheetNames.length === 0) {
      return NextResponse.json({ message: 'No sheets found in the file' }, { status: 400 });
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<ExcelRow>(sheet, { header: 1 });

    // Validate data
    if (data.length === 0) {
      return NextResponse.json({ message: 'No data found in the sheet' }, { status: 400 });
    }

    // Extract device names from the first column (skip header row)
    const devices = data.slice(1).map((row) => ({ name: row[0]?.trim() || '' })).filter((device) => device.name);

    // Validate devices
    if (devices.length === 0) {
      return NextResponse.json({ message: 'No valid device names found in the file' }, { status: 400 });
    }

    // Insert devices into the database
    await prisma.item.createMany({
      data: devices,
    });

    return NextResponse.json(
      { message: 'File uploaded and data inserted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: 'Error uploading file. Please check the file format and try again.' },
      { status: 500 }
    );
  }
}