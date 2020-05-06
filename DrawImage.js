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
        this.finished = new Promise((res, rej) => {
            image.toBlob(blob => {
                blob.text().then((text) => {
                    this.imageBlob = text;
                    res();
                });
            });
        });
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
            value: this.imageBlob
        });
    }
    /**
     * 
     * @param {string} value 
     * @param {OperationOptions} options 
     */
    static fromString(value, options) {
        const imageBlob = new Blob([value]);
        const image = new Image();
        const canvas = document.createElement("canvas");
        image.onload = ev => {
            canvas.getContext("2d").drawImage(image);
            document.body.removeChild(image);
        }
        image.src = URL.createObjectURL(imageBlob);
        document.body.appendChild(image);
        return new DrawImage(options, canvas);
    }
}