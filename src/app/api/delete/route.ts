import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { devices } = await request.json();

    // Create a map to track the count of each device to delete
    const deviceCountMap = new Map<string, number>();
    devices.forEach((device: string) => {
      deviceCountMap.set(device, (deviceCountMap.get(device) || 0) + 1);
    });

    // Delete devices from the database based on their counts
    for (const [device, count] of deviceCountMap.entries()) {
      // Find the first `count` records for the device
      const recordsToDelete = await prisma.item.findMany({
        where: {
          name: device,
        },
        take: count, // Limit the number of records to delete
        orderBy: {
          id: 'asc', // Ensure consistent ordering
        },
      });

      // Extract IDs of the records to delete
      const idsToDelete = recordsToDelete.map((record) => record.id);

      // Delete the records by their IDs
      await prisma.item.deleteMany({
        where: {
          id: {
            in: idsToDelete,
          },
        },
      });
    }

    return NextResponse.json(
      { message: 'Devices deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error deleting devices' },
      { status: 500 }
    );
  }
}