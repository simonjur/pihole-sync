export class MissingSidError extends Error {
    public constructor() {
        super(
            'No session ID (sid) found. Please authenticate (call authenticate method) first.',
        );
        this.name = 'MissingSidError';
    }
}
