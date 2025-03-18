import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('query') || '';

  try {
    const devices = await prisma.item.findMany({
      where: {
        name: {
          contains: searchQuery,
          mode: 'insensitive', // Case-insensitive search
        },
      },
    });
    return NextResponse.json(devices, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Error fetching devices' },
      { status: 500 }
    );
  }
}