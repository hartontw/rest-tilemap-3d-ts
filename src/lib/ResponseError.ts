export default class ResponseErrror extends Error {
    public readonly code : number;
    constructor(code : number, message : string) {
        super(message);
        this.code = code;
    }
}