import * as fs from 'node:fs';
import * as yaml from 'yaml';
import type { Logger } from 'winston';
import type { ConfigTypes } from './config-types.ts';
import { BitwardenClient } from './client/bitwarden-client.ts';

export async function getConfig(
    logger: Logger,
    configPath: string,
): Promise<ConfigTypes> {
    let config: ConfigTypes = {};
    if (!fs.promises.access(configPath).catch(() => false)) {
        throw new Error(`Config file not found at path: ${configPath}`);
    }
    const file = await fs.promises.readFile(configPath, 'utf8');
    config = yaml.parse(file);

    if (config['pi-holes-from-bitwarden']) {
        logger.info('Trying to fetch pi-holes from Bitwarden...');
        const bwClient = new BitwardenClient();
        const items = await bwClient.search(
            config['pi-holes-from-bitwarden']['search-string'],
        );
        logger.info(`Found ${items.length} item(s) in Bitwarden`);
        if (items.length > 0) {
            config['pi-holes'] = [];
            for (const item of items) {
                const parsedUrl = new URL(item.login.uris[0].uri);
                const piUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
                logger.info(`Found ${item.name} (${piUrl}) in Bitwarden`);
                let active = false;
                for (const fields of item.fields) {
                    if (fields.name === 'active' && fields.value === 'true') {
                        active = true;
                        break;
                    }
                }
                if (!active) {
                    logger.info(
                        `Skipping ${item.name} (${piUrl}) because it is not active`,
                    );
                    continue;
                }
                logger.info(`✅ Adding active item ${item.name} (${piUrl})`);
                config['pi-holes'].push({
                    url: `${parsedUrl.protocol}//${parsedUrl.host}`,
                    name: item.name,
                    password: item.login.password,
                });
            }
        }
    }

    return config;
}
