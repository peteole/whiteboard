class LiveVideoNode extends DocumentNode {
    constructor(options) {
        super(options);
        this.video = document.createElement("video");
        this.video.autoplay = true;
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            this.video.srcObject = stream;
            this.stream = stream;
        })
        this.content = document.createElement("div");
        this.content.style.width = "100 %";
        this.content.style.height = "100 %";
        this.content.appendChild(this.video);
        this.setRawContent(this.content);
    }
}