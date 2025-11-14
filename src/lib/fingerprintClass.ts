import FingerprintJSLib from '@fingerprintjs/fingerprintjs';

export class FingerprintService {
    private static instance: FingerprintService;
    private fpPromise: Promise<any> | null = null;

    private constructor() { }

    public static getInstance(): FingerprintService {
        if (!FingerprintService.instance) {
            FingerprintService.instance = new FingerprintService();
        }
        return FingerprintService.instance;
    }

    private async initializeFingerprint() {
        if (!this.fpPromise) {
            this.fpPromise = FingerprintJSLib.load();
        }
        return this.fpPromise;
    }

    public async getFingerprint(): Promise<string> {
        try {
            const fp = await this.initializeFingerprint();
            const result = await fp.get();
            return result.visitorId;
        } catch (error) {
            console.error('Failed to generate fingerprint:', error);
            // 폴백: 간단한 브라우저 정보 기반 해시
            return this.generateFallbackFingerprint();
        }
    }

    private generateFallbackFingerprint(): string {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Fallback fingerprint', 2, 2);
        }

        const data = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');

        // 간단한 해시 생성
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return Math.abs(hash).toString(36);
    }
}

// 싱글톤 인스턴스 export
export const fingerprintService = FingerprintService.getInstance();