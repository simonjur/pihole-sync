import winston, { Logger } from 'winston';
import { PiHoleClient } from '../client/pi-hole-client.ts';
import type { PiHoleDomain } from '../client/pi-hole-client-types.ts';
import type { ConfigTypes } from '../config-types.ts';

export class SyncService {
    // private sid: string | null = null;
    private client: PiHoleClient;
    private logger: winston.Logger;
    public constructor(client: PiHoleClient, logger: Logger) {
        this.client = client;
        this.logger = logger;
    }

    public async sync(config: ConfigTypes) {
        await this.client.authenticate();
        await this.synchronizeAllowList(config['allowed-domains']);
        await this.synchronizeLocalDnsRecords(config['local-dns-records']);
    }

    private info(message: string) {
        this.logger.info(message, { label: `[svc ${this.client.getName()}] ` });
    }

    private warn(message: string) {
        this.logger.warn(message, { label: `[svc ${this.client.getName()}] ` });
    }

    private async synchronizeAllowList(
        allowList: ConfigTypes['allowed-domains'],
    ) {
        this.info('Syncing Allow List...');
        const existingAllowList = await this.client.getExactAllowList();

        this.info(`Fetched ${existingAllowList.length} allow list entries.`);

        for (const domain of allowList) {
            const existingDomain = existingAllowList.find(
                (d: PiHoleDomain) => d.domain === domain.domain,
            );

            if (existingDomain) {
                this.info(
                    `✅ Domain <yellow>${domain.domain}</yellow> is <green>already in the allow list</green>`,
                );
            } else {
                this.warn(
                    `⚠️ <yellow>Domain ${domain.domain} is not in allow list.</yellow> Adding it now...`,
                );

                await this.client.addAllowExactDomain(domain.domain);
            }
        }

        this.info('✅ Allow list sync complete.');
    }

    private async synchronizeLocalDnsRecords(
        localRecords: ConfigTypes['local-dns-records'],
    ) {
        this.info('Syncing Local Dns Records List...');
        const existingLocalDnsRecordsList =
            await this.client.getExistingLocalDnsRecordsList();

        this.info(
            `Fetched ${existingLocalDnsRecordsList.length} local dns entries entries.`,
        );

        for (const customLocalDnsREcord of localRecords) {
            if (
                existingLocalDnsRecordsList.find((d) => {
                    return (
                        d.domain === customLocalDnsREcord.domain &&
                        d.ip === customLocalDnsREcord.ip
                    );
                })
            ) {
                this.info(
                    `✅ Custom domain <yellow>${customLocalDnsREcord.domain}</yellow> <green>already exists in DNS hosts</green>`,
                );
            } else {
                this.warn(
                    `⚠️ <yellow>Custom domain ${customLocalDnsREcord.domain} does not exist in DNS hosts.</yellow> Adding it now...`,
                );

                await this.client.addLocalDnsRecord(
                    customLocalDnsREcord.ip,
                    customLocalDnsREcord.domain,
                );
            }
        }

        this.info('✅ Local Dns Records list sync complete.');
    }
}
