export type TBitwardenSearchResult = {
    revisionDate: string;
    creationDate: string;
    deletedDate: string | null;
    object: string;
    id: string;
    organizationId: string | null;
    folderId: string | null;
    type: number;
    reprompt: number;
    name: string;
    notes: string | null;
    favorite: boolean;
    fields: {
        name: string;
        value: string;
        type: number;
    }[];
    login: {
        uris: {
            uri: string;
        }[];
        username: string;
        password: string;
        totp: string | null;
        passwordRevisionDate: string | null;
    };
};
