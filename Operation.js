/**
 * @typedef {Object} OperationOptions
 * @property {number} subjectId
 * @property {boolean} executed
 */
class Operation {
    /**
     * 
     * @param {OperationOptions} options 
     */
    constructor(options) {
        const defaultOptions = {
            executed: false,
            time: new Date().getTime()
        };
        this.options = Object.assign(defaultOptions, options);
        this.subject = idToElement.get(options.subjectId);
        //this.executed = executed;
    }
    do() { }
    undo() { }
    toString() { return ""; }
    /**
     * restore operation from string
     * @param {string} toParse -String describing Operation to be parsed
     * @returns {Operation}
     */
    static parseOperation(toParse) {
        const parse = JSON.parse(toParse);
        switch (parse.type) {
            case "DrawSvg":
                return DrawSvgPolyline.fromString(parse.value, parse.options);
            case "AddElement":
                return AddElement.fromString(parse.value, parse.options);
            case "MoveElement":
                return MoveElement.fromString(parse.value, parse.options);
            case "DrawImage":
                return DrawImage.fromString(parse.value, parse.options);
            default:
                return null;
        }
    }
}