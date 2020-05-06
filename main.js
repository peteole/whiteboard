

/**@type {Map<number,DocumentNode>} */
var idToElement = new Map();
/**@type {Operation[]} */
var operationLog = [];
var lastLogSize = 0;

/**@type {Operation[]} */
var undoneOperations = [];
/**@type {HTMLDivElement} */
var content;
var peer;
var connection;
/**@type {HTMLHtmlElement} */
var header;
/**
 * 
 * @param {Operation} operation 
 */
function addOperation(operation) {
    operationLog.push(operation);
    connection.send(operation.toString());
}
function removeOperation(operation) {
    operationLog.length--;
    undoneOperations.push(operation);
    connection.send("undo");
}
function mainLoaded() {
    header = document.querySelector("header");

    document.body.style.height = window.innerHeight + "px";
    content = document.getElementById("content");
    const start = content.getBoundingClientRect().top;
    //content.style.height = (window.innerHeight - start) + "px";
    document.getElementById("addCamera").onclick = ev => {
        const newOperation = new AddElement("ImageNode", {});
        newOperation.do();
        addOperation(newOperation);
    }
    document.getElementById("addSvgDrawing").onclick = ev => {
        const newOperation = new AddElement("SvgDrawing", {});
        newOperation.do();
        addOperation(newOperation);
    }
    document.getElementById("undo").onclick = ev => {
        const last = operationLog[operationLog.length - 1];
        if (last) {
            last.undo();
            operationLog.length--;
            undoneOperations.push(last);
            if (ev)
                connection.send("undo");
            lastLogSize = operationLog.length;
        }
    }
    document.getElementById("redo").onclick = ev => {
        const last = undoneOperations[undoneOperations.length - 1];
        if (last && lastLogSize == operationLog.length) {
            last.do();
            operationLog.push(last);
            lastLogSize++;
            undoneOperations.length--;
            if (ev)
                connection.send("redo");
        }
    }
    peer = new Peer();
    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        const idCopyButton = document.createElement("button");
        idCopyButton.innerHTML = "copy id";
        idCopyButton.onclick = ev => copyToClipboard(id);
        header.appendChild(idCopyButton);
        /**@type {(ev:KeyboardEvent)=>void} */
        document.getElementById("idInput").onchange = ev => {
            addConnection(peer.connect(ev.target.value));
        }
        peer.on("connection", conn => {
            addConnection(conn);
            console.log("connected");
        });
    });
}
function opencvLoaded() {
    console.log("opencv ready!");
}
const copyToClipboard = str => {
    const el = document.createElement('textarea');  // Create a <textarea> element
    el.value = str;                                 // Set its value to the string that you want copied
    el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
    el.style.position = 'absolute';
    el.style.left = '-9999px';                      // Move outside the screen to make it invisible
    document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
    const selected =
        document.getSelection().rangeCount > 0        // Check if there is any content selected previously
            ? document.getSelection().getRangeAt(0)     // Store selection if found
            : false;                                    // Mark as false to know no selection existed before
    el.select();                                    // Select the <textarea> content
    document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
    document.body.removeChild(el);                  // Remove the <textarea> element
    if (selected) {                                 // If a selection existed before copying
        document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
        document.getSelection().addRange(selected);   // Restore the original selection
    }
};
function addConnection(conn) {
    connection = conn;
    connection.on("open", () => {
        connection.on("data", data => {
            console.log(data);
            switch (data) {
                case "undo":
                    document.getElementById("undo").onclick(null);
                    break;
                case "redo":
                    document.getElementById("redo").onclick(null);
                    break;
                default:
                    const newOp = Operation.parseOperation(data);
                    if (newOp) {
                        newOp.do();
                        operationLog.push(newOp);
                    }
                    break;
            }
        })
    })
}