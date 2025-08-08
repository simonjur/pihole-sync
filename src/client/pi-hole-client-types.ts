export type PiHoleSession = {
    valid: boolean;
    totp: boolean;
    sid: string;
    csrf: string;
    validity: number;
    message: string;
};

export type PiHoleAuthResponse = {
    session: PiHoleSession;
    took: number;
};

export type PiHoleDomain = {
    domain: string;
    unicode: string;
    type: 'allow' | 'deny';
    kind: 'exact' | 'regex';
    comment: string | null;
    groups: number[];
    enabled: boolean;
    id: number;
    date_added: number;
    date_modified: number;
};

export type PiHoleRestResponse = {
    took: number;
};

export type PiHoleDomainsResponse = PiHoleRestResponse & {
    domains?: PiHoleDomain[];
};

export type PiHoleDomainAddResponse = {
    domains: PiHoleDomain[];
    processed: {
        errors: string[];
        success: {
            item: string;
        }[];
    };
    took: number;
};

export interface PiHoleDnsHostsResponse {
    config: {
        dns: {
            hosts: string[];
        };
    };
    took: number;
}
