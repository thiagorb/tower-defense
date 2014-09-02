function FrameController(canvas) {
	var actionObjects = [];
	var renderObjects = [];
	var graphicsContext = canvas.getContext("2d");
	var keyMap = new Array(255);

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
	
	this.start = function (fps) {
		setInterval(gameLoop, 1000 / fps);
		document.addEventListener("keydown", onKeyDown, false);
		document.addEventListener("keyup", onKeyUp, false);
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
}