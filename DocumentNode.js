function setDefaults(options, defaults) {
    return _.defaults({}, _.clone(options), defaults);
}
/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Object} NodeOptions
 * @property {Point} position
 * @property {Point} size
 */
class DocumentNode {
    /**
     * @param {NodeOptions} options
     * */
    constructor(options) {
        this.id = DocumentNode.getNextID(DocumentNode.lastID);
        idToElement.set(this.id, this);
        DocumentNode.lastID = this.id;
        const defaults = {
            position: { x: 0, y: 0 },
            size: { x: window.innerWidth, y: window.innerHeight }
        }
        options = Object.assign(defaults, options);
        this.position = options.position;
        this.size = options.size;
        this.contentContainer = document.createElement("div");
        this.contentContainer.className = "contentContainer";
        this.contentContainer.style.width = this.size.x + "px";
        this.contentContainer.style.height = this.size.y + "px";
        this.touchController = new SwipeElementItem(this.contentContainer);
        this.touchController.onMove = sw => { };
        this.touchController.onMoveEnd = (sw, mp) => {
            if (!this.isMoving)
                return;
            const dx = sw.initialTouchPos.x - sw.lastTouchPos.x;
            const dy = sw.initialTouchPos.y - sw.lastTouchPos.y;
            if (dx == 0 && dy == 0)
                return;
            addOperation(new MoveElement({ x: -dx, y: -dy }, { subjectId: this.id, executed: true }))
        }
        /**@type {HTMLElement} */
        this.rawContent = null;
        this.enableMoving = ev => {
            ev.preventDefault();
            this.isMoving = true;
            content.style.touchAction = "none";
            //document.body.style.touchAction = "none";
            this.transformMenu.style.display = "initial";
            this.touchController.onMove = sw => {
                this.position = { x: sw.currentX, y: sw.currentY };
                this.draw();
            }
            this.contentContainer.oncontextmenu = this.disableMoving;
        }
        this.disableMoving = ev => {
            ev.preventDefault();
            this.isMoving = false;
            content.style.touchAction = "initial";
            this.transformMenu.style.display = "none";
            this.touchController.onMove = sw => { }
            this.contentContainer.oncontextmenu = this.enableMoving;
        }
        this.contentContainer.oncontextmenu = this.enableMoving;
        this.contentContainer.appendChild(this.getTransformMenu());
        this.isMoving = false;

        /*this.rawContent.onresize = ev => {
            this.transformMenu.style.height = this.rawContent.clientHeight + "px";
            this.transformMenu.style.width = this.rawContent.clientWidth + "px";
        }*/
    }
    getHTML() {
        return this.contentContainer;
    }
    setRawContent(newContent) {
        if (this.rawContent && this.rawContent.parentElement) {
            this.contentContainer.replaceChild(this.rawContent, newContent);
            this.rawContent = newContent;
        } else {
            this.contentContainer.appendChild(newContent);
            this.rawContent = newContent;
        }
    }
    draw() {
        this.contentContainer.style.left = this.position.x + "px";
        this.contentContainer.style.top = this.position.y + "px";
    }
    getTransformMenu() {
        if (!this.transformMenu) {
            this.transformMenu = document.createElement("div");
            this.transformMenu.className = "transformMenu";
            this.transformMenu.innerHTML = "<i class=\"material-icons\">drag_handle</i>";
            this.transformMenu.style.display = "none";
        }
        return this.transformMenu;
    }
    hide() {
        this.contentContainer.style.display = "none";
    }
    show() {
        this.contentContainer.style.display = "initial";
    }
}
DocumentNode.lastID = 0;
/**@type {(lastID:number)=>number} */
DocumentNode.getNextID = lastID => lastID + 1;