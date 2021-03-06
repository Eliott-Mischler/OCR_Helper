let button = document.getElementById("draw");
let scrap = document.getElementById("scrap");
let undo = document.getElementById("undo");
let redo = document.getElementById("redo");
let text = document.getElementById("text");
let c = document.createElement('canvas');
let canvas = document.getElementById('drawings');
let container = document.getElementById('canvas-holder')
let context;
let base64 = ""
let coords = [];
let rectangles = [];
let redo_stack = [];
let max = 16;
let inner = 0;
let shapes = []
var topMap = new Image()

let image_width_fract = 0.7


window.onload = () => {
    
    topMap.src = "/static/img2.png"
    topMap.onload = () => {
        canvas.width = Math.min(image_width_fract * window.innerWidth, 1000, topMap.naturalWidth) ;
        canvas.height = (topMap.naturalHeight / topMap.naturalWidth) * canvas.width 
        context = canvas.getContext('2d')
        context.drawImage(topMap, 0, 0, canvas.width, canvas.height)
        UndoCanvas.enableUndo(context)

        c.height = topMap.naturalHeight;
        c.width = topMap.naturalWidth;
        let ctx = c.getContext('2d');
        ctx.drawImage(topMap, 0, 0, c.width, c.height)
        base64 = c.toDataURL();
        base64 = base64.substring(base64.indexOf(',')+1)
    }
    
    

}





drawings.addEventListener("click", function(e) {
    let bounds = drawings.getBoundingClientRect();
    let left = bounds.left;
    let top = bounds.top;

    let xClick = e.pageX - left - window.scrollX;
    let yClick = e.pageY - top - window.scrollY;
   

    let clientWidth = drawings.clientWidth;
    let clientHeight = drawings.clientHeight;

    let imageWidth = topMap.naturalWidth;
    let imageHeight = topMap.naturalHeight;
    
    let pixelX = Math.round((xClick / clientWidth) * imageWidth);
    let pixelY = Math.round((yClick / clientHeight) * imageHeight); 

    if(rectangles.length < max) {

        if(coords.length < 1) {
            shapes.push(xClick, yClick)
            coords.push(pixelX, pixelY)
        } else {
            shapes.push(xClick, yClick)
            context.rect(Math.min(shapes[0], shapes[2]), Math.min(shapes[1], shapes[3]), Math.abs(shapes[0] - shapes[2]), Math.abs(shapes[1] - shapes[3]));
            context.stroke()
            coords.push(pixelX, pixelY)
            rectangles.push(coords)
            coords = []
            shapes = []
        }
        
    }
    
})

button.addEventListener("click", function() {
    receivedData = ""

    let dataToSend = {
        image : base64,
        rectangles : rectangles
    }

    console.log(dataToSend)
    dataToSend = JSON.stringify(dataToSend)

    let url = "http://127.0.0.1:5000/api/invoice"
    fetch(url, {
        mode: "cors",
        method: "post",
        headers: { "Content-Type": "application/json"},
        body: dataToSend
    })
        .then(resp => {
            if (resp.status === 200) return resp.json()

            console.log(`Status : ${resp.status}`)
            return Promise.reject("bad status")
        })
        .then(jsonData => {
            console.log(jsonData)
            receivedData = jsonData;
            let str = "OCR Result: ";
            receivedData['data'].forEach(element => {
                str += '\n' +  element;
            });
            text.innerText = str;
            
        })
        .catch(err => {
            if(err === "bad stats") return
            console.log(err)
        })
    
})

scrap.addEventListener("click", function() {
    rectangles = [];
    coords = [];
    for(let i = 0; i < max; i++){
        context.undo();
        }
})

undo.addEventListener("click", function() {
    coords = [];
    redo_stack.push(rectangles.pop())
    context.undo()
    
})

redo.addEventListener("click", function() {
    rectangles.push(redo_stack.pop())
    context.redo()
    
})