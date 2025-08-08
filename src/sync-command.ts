import * as path from 'node:path';
import * as process from 'node:process';
import { Command } from 'commander';
import * as winston from 'winston';
import type { ConfigTypes } from './config-types.ts';
import { getConfig } from './config.ts';
import { createLogger } from './logger.ts';
import { SyncService } from './service/sync-service.ts';
import { PiHoleClient } from './client/pi-hole-client.ts';

async function syncCommand(config: ConfigTypes, logger: winston.Logger) {
    // console.log(config);
    logger.info('Loading pi-holes from config...');
    const piHoles = config['pi-holes'];
    if (!piHoles || piHoles.length === 0) {
        logger.error('No Pi-hole instances found in the configuration.');
        return;
    }

    logger.info(
        `Found ${piHoles.length} pihole(s): ${piHoles.map((p) => p.url).join(', ')}`,
        { label: '[pihole-sync] ' },
    );
    const syncPromises: Promise<void>[] = [];
    for (const piHole of piHoles) {
        const piHoleClient = new PiHoleClient(piHole, logger);
        syncPromises.push(
            new SyncService(piHoleClient, logger)
                .sync(config)
                .catch((error) => {
                    logger.error(
                        `Error synchronizing Pi-hole at ${piHole.url}: ${error.message}`,
                        { label: `[pihole ${piHole.url}] ` },
                    );
                }),
        );
    }
    try {
        await Promise.all(syncPromises).catch((error) => {
            logger.error(`Error during synchronization: ${error.message}`);
        });
        logger.info('✅ Synchronization completed successfully.');
    } catch (error) {
        logger.error(`❌ Synchronization failed ${(error as Error).message}`);
        process.exit(1);
    }
}

export async function run() {
    const program = new Command();

    const logger = createLogger();

    program
        .name('pihole-sync')
        .version('1.0')
        .description('pihole-sync CLI tool')
        .requiredOption('--config <path>', 'YAML config file path')
        .action(async (options) => {
            await syncCommand(
                await getConfig(path.resolve(process.cwd(), options.config)),
                logger,
            );
        });

    await program.parseAsync(process.argv);
}
