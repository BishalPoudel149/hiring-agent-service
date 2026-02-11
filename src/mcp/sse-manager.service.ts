import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface SseConnection {
    clientId: string;
    subject: Subject<any>;
    connectedAt: Date;
}

@Injectable()
export class SseManagerService {
    private connections: Map<string, SseConnection> = new Map();

    /**
     * Add a new SSE connection
     */
    addConnection(clientId: string, subject: Subject<any>): void {
        this.connections.set(clientId, {
            clientId,
            subject,
            connectedAt: new Date()
        });
        console.log(`[SSE] Client connected: ${clientId}`);
        console.log(`[SSE] Total connections: ${this.connections.size}`);
    }

    /**
     * Send message to a specific client
     */
    sendMessage(clientId: string, message: any): boolean {
        const connection = this.connections.get(clientId);
        if (!connection) {
            console.warn(`[SSE] Client not found: ${clientId}`);
            return false;
        }

        try {
            connection.subject.next(message);
            return true;
        } catch (error) {
            console.error(`[SSE] Error sending message to ${clientId}:`, error);
            return false;
        }
    }

    /**
     * Remove a connection
     */
    removeConnection(clientId: string): void {
        const connection = this.connections.get(clientId);
        if (connection) {
            connection.subject.complete();
            this.connections.delete(clientId);
            console.log(`[SSE] Client disconnected: ${clientId}`);
            console.log(`[SSE] Total connections: ${this.connections.size}`);
        }
    }

    /**
     * Get connection by client ID
     */
    getConnection(clientId: string): SseConnection | undefined {
        return this.connections.get(clientId);
    }

    /**
     * Check if client is connected
     */
    isConnected(clientId: string): boolean {
        return this.connections.has(clientId);
    }

    /**
     * Get all active connections
     */
    getActiveConnections(): SseConnection[] {
        return Array.from(this.connections.values());
    }

    /**
     * Broadcast message to all connected clients
     */
    broadcast(message: any): void {
        this.connections.forEach((connection) => {
            try {
                connection.subject.next(message);
            } catch (error) {
                console.error(
                    `[SSE] Error broadcasting to ${connection.clientId}:`,
                    error
                );
            }
        });
    }
}
