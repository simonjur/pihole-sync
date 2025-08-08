export type PiHoleCredentials = {
    url: string;
    name: string;
    password: string;
    version: 5 | 6;
};

export type ConfigTypes = {
    piHoles?: PiHoleCredentials[];
    'allowed-domains'?: {
        domain: string;
        type: 'exact-allow' | 'regex-allow';
    }[];
    'local-dns-records'?: {
        domain: string;
        ip: string;
    }[];
};
