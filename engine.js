function FrameController(canvas) {
	var actionObjects = [];
	var renderObjects = [];
	var graphicsContext = canvas.getContext("2d");
	var keyMap = new Array(255);
	var mouseMap = new Array(3);
	var mousePosition = undefined;

	var gameLoop = function () {
		actionObjects.forEach(function (object) {
			object.step();
		});
		graphicsContext.clearRect(0, 0, canvas.width, canvas.height);
		renderObjects.forEach(function (object) {
			object.render(graphicsContext);
		});
	};
	
	var onKeyDown = function (e) {
		keyMap[e.keyCode] = true;
	};
	
	var onKeyUp = function (e) {
		keyMap[e.keyCode] = false;
	};
	
	var mouseMove = function (e) {
		mousePosition = { x: e.x, y: e.y };
	};
	
	var mouseDown = function (e) {
		mouseMap[e.button] = true;
	};
	
	var mouseUp = function (e) {
		mouseMap[e.button] = false;
	};
	
	this.start = function (fps) {
		setInterval(gameLoop, 1000 / fps);
		document.addEventListener("keydown", onKeyDown, false);
		document.addEventListener("keyup", onKeyUp, false);
		document.addEventListener("mousedown", mouseDown, false);
		document.addEventListener("mouseup", mouseUp, false);
		document.addEventListener("mousemove", mouseMove, false);
	};
	
	this.stop = function () {
		clearInterval(gameLoop);
	};
	
	this.addActionObject = function (object) {
		actionObjects.push(object);
	};

	this.addRenderObject = function (object) {
		renderObjects.push(object);
	};
	
	this.isKeyPressed = function (keyCode) {
		return keyMap[keyCode];
	}
	
	this.isMousePressed = function (buttonCode) {
		return mouseMap[buttonCode];
	}
	
	this.getMousePosition = function () {
		return mousePosition;
	}
}