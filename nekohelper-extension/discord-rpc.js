// Discord RPC Implementation
const CLIENT_ID = '123456789012345678'; // TODO: User should replace this
const ENCODING_JSON = 0;
const VERSION = 1;

class DiscordRPC {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.port = 6463; // Start port
        this.activity = null;
        this.retryTimeout = null;
    }

    async connect() {
        if (this.isConnected) return;

        // Try ports 6463-6472
        for (let port = 6463; port <= 6472; port++) {
            try {
                await this.tryConnect(port);
                console.log(`[DiscordRPC] Connected on port ${port}`);
                return;
            } catch (e) {
                // Continue to next port
            }
        }
        console.warn("[DiscordRPC] Could not connect to Discord Client. Retrying in 10s...");
        this.scheduleRetry();
    }

    tryConnect(port) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://127.0.0.1:${port}/?v=1&client_id=${CLIENT_ID}`);
            
            ws.onopen = () => {
                this.socket = ws;
                this.isConnected = true;
                this.port = port;
                resolve();
            };

            ws.onmessage = (event) => this.handleMessage(event);
            
            ws.onclose = () => {
                console.log(`[DiscordRPC] Closed on port ${port}`);
                this.cleanup();
                if (this.isConnected) { // Was connected, now disconnected unexpectedly
                    this.scheduleRetry();
                }
                reject();
            };

            ws.onerror = (err) => {
                reject(err);
            };
        });
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log("[DiscordRPC] Received:", data);
            
            if (data.cmd === 'DISPATCH' && data.evt === 'READY') {
                console.log("[DiscordRPC] Ready!");
                if (this.activity) {
                    this.setActivity(this.activity);
                }
            }
        } catch (e) {
            console.error("[DiscordRPC] Parse error:", e);
        }
    }

    setActivity(activity) {
        this.activity = activity;
        if (!this.isConnected || !this.socket) {
            this.connect();
            return;
        }

        const payload = {
            cmd: 'SET_ACTIVITY',
            args: {
                pid: process ? process.pid : 9999, // Hack: Browse doesn't have pid, stick a number
                activity: activity
            },
            nonce: crypto.randomUUID()
        };

        this.send(payload);
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    cleanup() {
        this.isConnected = false;
        this.socket = null;
    }

    scheduleRetry() {
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(() => this.connect(), 10000);
    }
}

const discordRPC = new DiscordRPC();
// Initial connect attempt
discordRPC.connect(); 

// Export for use in background.js
// In ES modules context within a service worker, we can just attach to global scope or use it directly if merged.
self.discordRPC = discordRPC;
