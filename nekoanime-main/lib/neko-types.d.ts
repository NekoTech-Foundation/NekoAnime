export {};

declare global {
    interface NekoHelperResponse {
        success: boolean;
        status: number;
        data?: string; // Base64 string
        error?: string;
        url?: string;
        headers?: Record<string, string>;
    }

    interface Window {
       NekoHelper?: {
           fetch: (url: string, options?: RequestInit) => Promise<NekoHelperResponse>;
       }
    }
}
