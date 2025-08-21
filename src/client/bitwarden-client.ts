import { $ } from 'zx';
import type { TBitwardenSearchResult } from './bitwarden-types.ts';

export class BitwardenClient {
    public async search(query: string): Promise<TBitwardenSearchResult[]> {
        await $`bw sync`;
        const result = await $`bw list items --search ${query}`;

        if (result.exitCode !== 0) {
            throw new Error(`Bitwarden search failed: ${result.stderr}`);
        }
        try {
            return JSON.parse(result.stdout) as TBitwardenSearchResult[];
        } catch (error) {
            throw new Error(
                `Failed to parse Bitwarden search result: ${(error as Error).message}`,
            );
        }
    }
}
