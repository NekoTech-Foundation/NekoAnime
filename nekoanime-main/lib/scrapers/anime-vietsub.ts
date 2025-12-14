import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

const inflateRaw = promisify(zlib.inflateRaw);

const BASE_URL = "https://animevietsub.page";
const MAGIC_URL = "https://animevietsub.show"; // From legacy extension
const DECRIPTION_KEY_BASE64 = "ZG1fdGhhbmdfc3VjX3ZhdF9nZXRfbGlua19hbl9kYnQ=";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

interface StreamSource {
    server: string;
    type: 'hls' | 'embed';
    url: string;
    headers?: Record<string, string>;
}

export class AnimeVietSubScraper {
    
    private getKey(): Buffer {
        const keyBytes = Buffer.from(DECRIPTION_KEY_BASE64, 'base64');
        return crypto.createHash('sha256').update(keyBytes).digest();
    }

    private async decryptData(encryptedData: string): Promise<string> {
        try {
            const key = this.getKey();
            const encryptedBytes = Buffer.from(encryptedData, 'base64');
            const iv = encryptedBytes.subarray(0, 16);
            const content = encryptedBytes.subarray(16);

            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(content);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            const decompressed = await inflateRaw(decrypted);
            let result = decompressed.toString('utf-8');
             result = result.replace(/"/g, "").replace(/\\n/g, "\n");
             return result;

        } catch (error) {
            console.error("Decryption error:", error);
            throw new Error("Failed to decrypt stream data");
        }
    }

    // Helper to run operations inside Puppeteer with Request Interception
    private async runInBrowser<T>(operation: (page: any) => Promise<T>): Promise<T> {
        console.log("[Scraper] Launching Puppeteer...");
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.setUserAgent(USER_AGENT);
            
            // Enable Request Interception
            await page.setRequestInterception(true);
            
            page.on('request', (request) => {
                // Apply magic headers to ajax requests
                if (request.url().includes('/ajax/player')) {
                    const headers = {
                        ...request.headers(),
                        'referer': MAGIC_URL + '/',
                        'origin': MAGIC_URL
                    };
                    request.continue({ headers });
                } else {
                    request.continue();
                }
            });

            // Go to base URL first to pass Cloudflare and initialize session
            await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
            
            return await operation(page);
        } catch (e) {
            console.error("[Scraper] Browser operation failed:", e);
            throw e;
        } finally {
            await browser.close();
        }
    }
    
    async getStreamSource(episodeId: string, mediaId: string): Promise<StreamSource> {
        return this.runInBrowser(async (page) => {
            console.log(`[Scraper] Fetching player for episodeId: ${episodeId}`);
            
            // 1. Get Player HTML
            const playerHtmlJson: any = await page.evaluate(async (eid: string) => {
                const params = new URLSearchParams();
                params.append('episodeId', eid);
                params.append('backup', '1');
                
                // Note: We DO NOT set Referer/Origin here to avoid "Refused to set unsafe header" error
                // The Puppeteer interceptor handles it.
                const res = await fetch("https://animevietsub.page/ajax/player", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-requested-with': 'XMLHttpRequest'
                    },
                    body: params
                });
                return res.json();
            }, episodeId);

            if (!playerHtmlJson || !playerHtmlJson.html) {
                 throw new Error("No HTML in player response (possible CF block)");
            }

            const htmlContent = playerHtmlJson.html.replace(/\\\//g, '/');
            const $ = cheerio.load(htmlContent);
            
            let sourceId: string | undefined;
            let sourceType: 'hls' | 'embed' | undefined;

            $('a[data-href]').each((_, el) => {
                 const href = $(el).attr('data-href');
                 const playType = $(el).attr('data-play');
                 
                 if (playType === 'api') {
                     sourceId = href;
                     sourceType = 'hls';
                     return false; 
                 }
            });

            if (!sourceId || sourceType !== 'hls') {
                 throw new Error("No HLS source (DU) found");
            }
            console.log(`[Scraper] Found sourceId: ${sourceId}, Type: ${sourceType}`);

            // 2. Resolve HLS
            const streamJson: any = await page.evaluate(async (sid: string, mid: string) => {
                const params = new URLSearchParams();
                params.append('link', sid);
                params.append('id', mid);
                
                 const res = await fetch("https://animevietsub.page/ajax/player", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'x-requested-with': 'XMLHttpRequest'
                    },
                    body: params
                });
                return res.json();
            }, sourceId, mediaId);

            const encryptedUrl = streamJson.link?.[0]?.file;
            
            if (!encryptedUrl) throw new Error("No encrypted file url found");
            
            // Decrypt outside browser
            const decryptedUrl = await this.decryptData(encryptedUrl);

            return {
                server: 'DU',
                type: 'hls',
                url: decryptedUrl
            };
        });
    }
    
    // Legacy stub
    async resolveHls(episodeId: string, mediaId: string, sourceId: string): Promise<string> {
        throw new Error("Use getStreamSource directly");
    }
}
