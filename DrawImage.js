class DrawImage extends Operation {
    /**
     * 
     * @param {OperationOptions} options 
     * @param {HTMLCanvasElement} image 
     */
    constructor(options, image) {
        super(options);
        /**@type {ImageNode} */
        this.subject;
        this.image = image;
        this.imageUrl = image.toDataURL("image/png");
    }
    do() {

        this.subject.drawOnMe(this.image);
    }
    undo() {
        this.subject.reset();
    }
    toString() {
        return JSON.stringify({
            type: "DrawImage",
            options: this.options,
            value: this.imageUrl
        });
    }
    /**
     * 
     * @param {string} value 
     * @param {OperationOptions} options 
     */
    static fromString(value, options) {
        //const imageBlob = value;//new Blob([value], { type: "image/png" });
        const image = new Image();
        const canvas = document.createElement("canvas");
        image.onload = ev => {
            canvas.width = image.width;
            canvas.height = image.height;
            canvas.getContext("2d").drawImage(image, 0, 0);
        }
        image.src = value;//URL.createObjectURL(imageBlob);
        return new DrawImage(options, canvas);
    }
}