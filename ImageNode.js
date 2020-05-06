class ImageNode extends DocumentNode {
    /**
     * 
     * @param {NodeOptions} options 
     */
    constructor(options) {
        super(options);
        this.reset();
    }
    reset() {
        this.video = document.createElement("video");
        this.video.autoplay = true;
        navigator.mediaDevices.enumerateDevices().then(mediaDevices => {
            const select = document.createElement("select");
            const none = document.createElement('option');
            none.value = -1;
            const label = "Please select device";
            const textNode = document.createTextNode(label);
            none.appendChild(textNode);
            select.appendChild(none);
            var count = 1;
            mediaDevices.forEach(mediaDevice => {
                if (mediaDevice.kind === 'videoinput') {
                    const option = document.createElement('option');
                    option.value = mediaDevice.groupId;
                    const label = mediaDevice.label || `Camera ${count++}`;
                    const textNode = document.createTextNode(label);
                    option.appendChild(textNode);
                    select.appendChild(option);
                }
            });
            select.onchange = event => {
                if (select.value == -1)
                    return;
                const videoConstraints = {};
                videoConstraints.groupId = { exact: select.value };

                const constraints = {
                    video: videoConstraints,
                    audio: false
                };
                navigator.mediaDevices.getUserMedia(constraints).then(stream => {
                    this.video.srcObject = stream;
                    this.stream = stream;
                    this.track = stream.getVideoTracks()[0];
                    this.imageCapture = new ImageCapture(this.track);
                });
                select.parentElement.removeChild(select);
            }
            document.querySelector("header").appendChild(select);
            //this.rawContent.appendChild(select);
        })
        /**navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            this.video.srcObject = stream;
            this.stream = stream;
            this.track = stream.getVideoTracks()[0];
            this.imageCapture = new ImageCapture(this.track);
        })*/
        this.canvas = document.createElement("canvas");
        this.content = document.createElement("div");
        this.content.style.width = "100 %";
        this.content.style.height = "100 %";
        this.content.appendChild(this.video);
        this.shotButton = document.createElement("button");
        this.shotButton.className = "shotButton";
        this.shotButton.innerHTML = "take photo";
        this.shotButton.onclick = ev => {

            this.imageCapture.takePhoto()
                .then(blob => createImageBitmap(blob))
                .then(imageBitmap => {
                    drawCanvas(this.canvas, imageBitmap);


                    /*var context = this.canvas.getContext('2d');
                    this.canvas.height = this.video.clientHeight;
                    this.canvas.width = this.video.clientWidth;
                    context.drawImage(this.video, 0, 0, this.video.clientWidth, this.video.clientHeight);
                    this.canvas.style.width = this.video.clientWidth + "px";
                    this.canvas.style.height = this.video.clientHeight + "px";
                    this.content.appendChild(this.canvas);*/
                    this.stream.getTracks().forEach(track => track.stop());
                    //var data = this.canvas.toDataURL('image/png');
                    //var photo=document.createElement("img");
                    //photo.setAttribute('src', data);
                    new Promise((res, rej) => {
                        let photoMat = cv.imread(this.canvas);
                        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
                        cv.cvtColor(photoMat, photoMat, cv.COLOR_RGBA2GRAY, 0);
                        cv.threshold(photoMat, photoMat, 120, 200, cv.THRESH_BINARY);
                        //cv.adaptiveThreshold(photoMat, photoMat, 125, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 11, 12);
                        let contours = new cv.MatVector();
                        let hierarchy = new cv.Mat();
                        // You can try more different parameters
                        cv.findContours(photoMat, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
                        cv.drawContours(photoMat, contours, -1, new cv.Scalar(0, 255, 0), 3)

                        cv.imshow(this.canvas, photoMat);
                        const factor = this.video.clientWidth / photoMat.cols;

                        while (this.content.firstChild)
                            this.content.removeChild(this.content.firstChild);
                        this.canvas.style.transform = "scale(" + factor + ")";
                        this.content.appendChild(this.canvas);
                        const newOp = new DrawImage({ executed: true, subjectId: this.id }, this.canvas);
                        newOp.finished.then(() => {
                            addOperation(newOp);
                        })

                        /*const img = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        const xFactor=this.video.clientWidth/photoMat.cols;
                        const yFactor=this.video.clientHeight/photoMat.rows;
                        img.setAttribute("height", this.video.clientHeight);
                        img.setAttribute("width", this.video.clientWidth);
                        for (var j = 0; j < contours.size(); j++) {
                            const toAdd = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
                            var points = "";
                            let cnt = contours.get(j).data32S;
                            if(cnt.length<10){
                                continue;
                            }
                            for (var i = 0; i + 1 < cnt.length; i += 2) {
                                points += " " + cnt[i]*xFactor + " , " + cnt[i + 1]*yFactor;
                            }
                            toAdd.setAttribute("points", points);
                            toAdd.style.fill = "none";
                            toAdd.style.stroke = "black";
                            img.appendChild(toAdd);
                        }
                        while (this.content.firstChild)
                            this.content.removeChild(this.content.firstChild);
                        this.content.appendChild(img);*/
                        res();
                    }).then(
                        () => console.log("finished processing")
                    )
                });
            //cv.imshow(this.canvas, photoMat);

        }
        this.content.appendChild(this.shotButton);
        this.setRawContent(this.content);
    }
    /**
     * 
     * @param {HTMLCanvasElement} image 
     */
    drawOnMe(image) {
        if (this.video.parentElement) {
            while (this.content.firstChild)
                this.content.removeChild(this.content.firstChild);
            header.removeChild(header.querySelector("select"));
        }
        this.content.appendChild(image);
    }
}
/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {ImageBitmap} img 
 */
function drawCanvas(canvas, img) {
    canvas.width = img.width;
    canvas.height = img.height;
    let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
    let x = (canvas.width - img.width * ratio) / 2;
    let y = (canvas.height - img.height * ratio) / 2;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
        x, y, img.width * ratio, img.height * ratio);
}