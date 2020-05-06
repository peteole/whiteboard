class DrawSvgPolyline extends Operation {
    /**
     * 
     * @param {OperationOptions} options - id of the subject
     * @param {Point[]} points 
     */
    constructor(options, points) {
        super(options);
        /**@type {SvgDrawing} */
        this.subject;
        this.points = points;
        /**@type {SVGPolygonElement} */
        this.polyline = null;
    }
    do() {
        this.subject.addLine(this.points);
        this.polyline=this.subject.rawContent.lastChild;
        this.options.executed = true;
    }
    undo() {
        this.subject.rawContent.removeChild(this.polyline||this.subject.rawContent.lastChild);
        this.options.executed = false;
    }
    toString() {
        let pointsString = ""
        for (let p of this.points) {
            pointsString += p.x + "," + p.y + ";";
        }
        return JSON.stringify({
            type: "DrawSvg",
            value: pointsString,
            options:this.options
        });
    }
    /**
     * 
     * @param {string} toParse 
     * @param {OperationOptions} options
     */
    static fromString(toParse, options) {
        let points = [];
        let pointsString = toParse;
        const pointsSplit = pointsString.split(";");
        for (let p of pointsSplit) {
            if (p == "")
                continue;
            const pSplit = p.split(",");
            points.push({ x: parseFloat(pSplit[0]), y: parseFloat(pSplit[1]) });
        }
        return new DrawSvgPolyline(options, points);
    }
}