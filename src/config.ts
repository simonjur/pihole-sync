import * as fs from 'node:fs';
import * as yaml from 'yaml';
import type { ConfigTypes } from './config-types.ts';

export async function getConfig(configPath: string): Promise<ConfigTypes> {
    let config: ConfigTypes = {};
    if (!fs.promises.access(configPath).catch(() => false)) {
        throw new Error(`Config file not found at path: ${configPath}`);
    }
    const file = await fs.promises.readFile(configPath, 'utf8');
    config = yaml.parse(file);
    return config;
}
