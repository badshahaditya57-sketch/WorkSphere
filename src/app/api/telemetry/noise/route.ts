import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const workerSecret = process.env.WORKER_SECRET;
    
    if (!workerSecret || authHeader !== `Bearer ${workerSecret}`) {
      return NextResponse.json({ error: 'Unauthorized hardware client' }, { status: 401 });
    }

    const body = await request.json();
    const { venueId, decibelLevel, timestamp } = body;

    if (!venueId || typeof decibelLevel !== 'number') {
      return NextResponse.json({ error: 'Invalid telemetry payload structure' }, { status: 400 });
    }

    await prisma.venue.update({
      where: { id: venueId },
      data: {
        liveNoiseLevel: decibelLevel,
        lastTelemetryUpdate: timestamp ? new Date(timestamp) : new Date(),
      }
    });

    return NextResponse.json({ success: true, message: 'Noise telemetry successfully ingested' });
  } catch (error) {
    console.error('Telemetry ingestion error:', error);
    return NextResponse.json({ error: 'Failed to ingest hardware telemetry' }, { status: 500 });
  }
}
