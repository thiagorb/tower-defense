/*
 * This class controls the events concerning the user. 
 * That is the input events (mouse and keyboard) and the frame rendering.
 * The FPS and SPS parameters are respectively:
 * - FPS: the number of frames that should be shown each second.
 * - SPS: the number of times each action object should have the step method invoked each second.
 */
function FrameController(canvas, sps, fps) {
    var actionObjects = [];
    var renderObjects = [];
    var graphicsContext = canvas.getContext("2d");
    var keyMap = new Array(255);
    var mouseMap = new Array(3);
    var mousePosition = undefined;
    var stepsPerFrame = sps / fps | 0;
    var stepsCounter = 0;

    // Invokes the step method of every action object, and then, renders if it is time.
    var gameLoop = function () {
        actionObjects.forEach(function (object) {
            object.step();
        });
        if (!stepsCounter) {
            stepsCounter = stepsPerFrame;
            graphicsContext.clearRect(0, 0, canvas.width, canvas.height);
            renderObjects.forEach(function (object) {
                object.render(graphicsContext);
            });
        } else {
            stepsCounter--;
        } 
    };
    
    // Handles the key down event.
    var onKeyDown = function (e) {
        keyMap[e.keyCode] = true;
    };

    // Handles the key up event.
    var onKeyUp = function (e) {
        keyMap[e.keyCode] = false;
    };

    // Handles the mouve move event.
    var mouseMove = function (e) {
        mousePosition = { x: e.clientX, y: e.clientY };
    };

    // Handles the mouse button press event.
    var mouseDown = function (e) {
        mouseMap[e.button] = true;
    };

    // Handles the mouse button release event.
    var mouseUp = function (e) {
        mouseMap[e.button] = false;
    };

    // Adds an object to the action objects collection.
    this.addActionObject = function (object) {
        actionObjects.push(object);
    };

    // Adds an object to the render objects collection.
    this.addRenderObject = function (object) {
        renderObjects.push(object);
    };

    // Returns true if the key with the given key code is pressed.
    this.isKeyPressed = function (keyCode) {
        return keyMap[keyCode];
    };

    // Returns true if the mouse button with the given button code is pressed.
    this.isMousePressed = function (buttonCode) {
        return mouseMap[buttonCode];
    };

    // Returns the mouse position.
    this.getMousePosition = function () {
        return mousePosition;
    };

    // This method is invoked before rendering the first frame, 
    // and should be overwritten to instantiate objects created by the graphics context,
    // like gradient styles.
    this.renderSetup = function (gc) {
        
    };
    
    // Starts the game loop.
    this.start = function () {
        this.renderSetup(graphicsContext);
        document.addEventListener("keydown", onKeyDown, false);
        document.addEventListener("keyup", onKeyUp, false);
        document.addEventListener("mousedown", mouseDown, false);
        document.addEventListener("mouseup", mouseUp, false);
        document.addEventListener("mousemove", mouseMove, false);
        setInterval(gameLoop, 1000 / sps);
    };
    
    // Interrupts the game loop.
    this.stop = function () {
        clearInterval(gameLoop);
    };
}