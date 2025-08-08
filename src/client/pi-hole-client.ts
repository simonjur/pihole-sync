import { format } from 'date-fns';
import winston, { Logger } from 'winston';
import type { PiHoleCredentials } from '../config-types.ts';
import type {
    PiHoleAuthResponse,
    PiHoleDnsHostsResponse,
    PiHoleDomainAddResponse,
    PiHoleDomainsResponse,
} from './pi-hole-client-types.ts';
import { MissingSidError } from './missing-sid-error.ts';

export class PiHoleClient {
    private sid: string | null = null;
    private config: PiHoleCredentials;
    private logger: winston.Logger;
    public constructor(config: PiHoleCredentials, logger: Logger) {
        this.config = config;
        this.logger = logger;
    }

    public getName(): string {
        return this.config.name || this.config.url;
    }

    public async authenticate() {
        const response = await fetch(`${this.config.url}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: this.config.password }),
        });

        const parsedAuthResponse =
            (await response.json()) as PiHoleAuthResponse;

        if (!parsedAuthResponse.session.valid) {
            this.logger.error(
                `Authentication failed for ${this.config.url}: ${parsedAuthResponse.session.message}`,
                { label: `[${this.config.name}] ` },
            );
            return;
        }

        this.sid = parsedAuthResponse.session.sid;

        this.logger.info(`Authenticated successfully for ${this.config.url}`, {
            label: `[${this.config.name}] `,
        });
    }

    private info(message: string) {
        this.logger.info(message, { label: `[client ${this.config.name}] ` });
    }

    private error(message: string) {
        this.logger.error(message, { label: `[client ${this.config.name}] ` });
    }

    public async addAllowExactDomain(exactDomain: string): Promise<void> {
        if (!this.sid) {
            throw new MissingSidError();
        }
        const response = await fetch(
            `${this.config.url}/api/domains/allow/exact`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-FTL-SID': this.sid,
                },
                body: JSON.stringify({
                    domain: exactDomain,
                    comment: `Added by pihole-sync script on ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
                    enabled: true,
                }),
            },
        );

        const parsedResponse =
            (await response.json()) as PiHoleDomainAddResponse;

        if (parsedResponse.processed.success.length === 1) {
            this.info(
                `✅ Domain <yellow>${exactDomain}</yellow> added <green>successfully</green> to allowed domains.`,
            );
        } else {
            this.error(
                `❌ Failed to add domain ${exactDomain} to allowed domains: ${parsedResponse.processed.errors.join(', ')}`,
            );
        }
    }

    public async addLocalDnsRecord(ip: string, domain: string): Promise<void> {
        if (!this.sid) {
            throw new MissingSidError();
        }

        const uriPart = encodeURIComponent(`${ip} ${domain}`);

        const response = await fetch(
            `${this.config.url}/api/config/dns/hosts/${uriPart}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-FTL-SID': this.sid,
                },
            },
        );

        if (response.status === 201) {
            this.info(
                `✅ Custom local dns record <yellow>${domain}:${ip}</yellow> added <green>successfully</green> to DNS hosts.`,
            );
        } else {
            const parsedResponse = (await response.text()) as string;
            this.error(`❌ Unable to add local dns record: ${parsedResponse}`);
            throw new Error('Unable to add local dns record');
        }
    }

    public async getExistingLocalDnsRecordsList() {
        if (!this.sid) {
            throw new MissingSidError();
        }

        const response = await fetch(
            `${this.config.url}/api/config/dns/hosts`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-FTL-SID': this.sid,
                },
            },
        );

        const parsedDomainsResponse =
            (await response.json()) as PiHoleDnsHostsResponse;

        if (!Array.isArray(parsedDomainsResponse.config.dns.hosts)) {
            this.error(
                `❌ Failed to fetch allow list for ${this.config.url}: ${JSON.stringify(parsedDomainsResponse, null, 2)}`,
            );
            throw new Error('Wrong response received');
        }

        this.info(
            `Fetched local dns records in ${parsedDomainsResponse.took}sec.`,
        );

        return parsedDomainsResponse.config.dns.hosts.map((host: string) => {
            const splits = host.split(' ');
            return {
                domain: splits[1],
                ip: splits[0],
            };
        });
    }

    public async getExactAllowList() {
        if (!this.sid) {
            throw new MissingSidError();
        }
        const response = await fetch(
            `${this.config.url}/api/domains/allow/exact`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-FTL-SID': this.sid,
                },
            },
        );

        const parsedDomainsResponse =
            (await response.json()) as PiHoleDomainsResponse;

        if (!Array.isArray(parsedDomainsResponse.domains)) {
            this.error(
                `❌ Failed to fetch allow list for ${this.config.url}: ${JSON.stringify(parsedDomainsResponse, null, 2)}`,
            );
            throw new Error('Wrong response received');
        }

        this.info(
            `Fetched existing allow list entries in ${parsedDomainsResponse.took}sec.`,
        );

        return parsedDomainsResponse.domains;
    }
}
