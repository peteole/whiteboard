class SvgDrawing extends DocumentNode {
    /**
     * 
     * @param {NodeOptions} options 
     */
    constructor(options) {
        super(options);
        this.setRawContent(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
        this.rawContent.setAttribute("width", this.size.x);
        this.rawContent.setAttribute("height", this.size.y);
        /**@type {Point[]} */
        this.startedLine = [];
        this.activateDrawing();
        this.updateSizes();
    }
    /**
     * 
     * @param {Point[]} points 
     */
    addLine(points) {
        const toAdd = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        var pointsString = "";
        for (var i = 0; i < points.length; i++) {
            pointsString += " " + points[i].x + " , " + points[i].y;
        }
        toAdd.setAttribute("points", pointsString);
        toAdd.style.fill = "none";
        toAdd.style.stroke = "black";
        this.rawContent.appendChild(toAdd);
    }
    activateDrawing() {
        if (PointerEvent) {

            this.rawContent.addEventListener("pointerdown", this.onMouseDown.bind(this), false)
            this.rawContent.addEventListener("pointermove", this.onMouseMove.bind(this), false)
            this.rawContent.addEventListener("pointerup", this.onMouseUp.bind(this), false)
            this.rawContent.addEventListener("pointercancel", this.onMouseUp.bind(this), false)
        } else {
            this.rawContent.addEventListener("mousedown", this.onMouseDown.bind(this), false)
            this.rawContent.addEventListener("mousemove", this.onMouseMove.bind(this), false)
            this.rawContent.addEventListener("mouseup", this.onMouseUp.bind(this), false)
            this.rawContent.addEventListener("mouseout", this.onMouseUp.bind(this), false)
        }
    }
    /**
     * 
     * @param {MouseEvent} ev 
     */
    onMouseDown(ev) {
        content.style.touchAction = "none";
        this.startedLine = [{ x: ev.offsetX, y: ev.offsetY }];
    }

    /**
     * 
     * @param {MouseEvent} ev 
     */
    onMouseMove(ev) {
        if (!this.startedLine)
            return;
        this.startedLine.push({ x: ev.offsetX, y: ev.offsetY });
    }

    /**
     * 
     * @param {MouseEvent} ev 
     */
    onMouseUp(ev) {
        if (!this.isMoving)
            content.style.touchAction = "initial";
        if (!this.startedLine)
            return;
        addOperation(new DrawSvgPolyline({ executed: true, subjectId: this.id }, this.startedLine));
        this.addLine(this.startedLine);
        this.startedLine = null;
    }
}