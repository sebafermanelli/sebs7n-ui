export declare const BUDGET_KB: number
export declare const ROUTES: string[]
export declare function chunkRefs(html: string): string[]
export declare function measure(html: string, readChunk: (src: string) => Buffer): { files: number; bytes: number; kb: number }
export declare const LIMITS: Record<string, number>
export declare function limitOf(route: string): number
