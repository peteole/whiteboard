class AddElement extends Operation {
    /**
     * 
     * @param {string} type -type of element to add
     * @param {OperationOptions} options 
     */
    constructor(type, options) {
        super(options);
        this.type = type;
    }
    do() {
        if (this.subject) {
            this.subject.show();
            return;
        }
        switch (this.type) {
            case "SvgDrawing":
                this.subject = new SvgDrawing({ size: { x: 500, y: 600 } });
                break;
            case "ImageNode":
                this.subject = new ImageNode({});
                break;
            default:
                break;
        }
        idToElement.set(this.subject.id,this.subject);
        this.options.subjectId=this.subject.id;
        window.content.appendChild(this.subject.getHTML());
        this.subject.updateSizes();
        this.options.executed = true;
    }
    undo(){
        this.subject.hide();
    }
    toString(){
        return JSON.stringify({
            type:"AddElement",
            options:this.options,
            value:this.type
        })
    }
    static fromString(type,options){
        return new AddElement(type,options);
    }
}