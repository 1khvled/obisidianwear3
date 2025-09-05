import { NextRequest } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to our set
      connections.add(controller);
      
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));
      
      // Keep connection alive with periodic ping
      const pingInterval = setInterval(() => {
        try {
          const ping = `data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`;
          controller.enqueue(new TextEncoder().encode(ping));
        } catch (error) {
          clearInterval(pingInterval);
          connections.delete(controller);
        }
      }, 30000); // Ping every 30 seconds
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        connections.delete(controller);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Function to broadcast updates to all connected clients
function broadcastUpdate(type: string, data: any) {
  const message = `data: ${JSON.stringify({ type, data, timestamp: Date.now() })}\n\n`;
  const encoded = new TextEncoder().encode(message);
  
  // Send to all active connections
  connections.forEach(controller => {
    try {
      controller.enqueue(encoded);
    } catch (error) {
      // Remove dead connections
      connections.delete(controller);
    }
  });
}

// Function to get connection count
function getConnectionCount() {
  return connections.size;
}
