function FrameController(canvas) {
	var actionObjects = [];
	var renderObjects = [];
	var graphicsContext = canvas.getContext("2d");

	var gameLoop = function () {
		actionObjects.forEach(function (object) {
			object.step();
		});
		graphicsContext.clearRect(0, 0, canvas.width, canvas.height);
		renderObjects.forEach(function (object) {
			object.render(graphicsContext);
		});
	}
	
	this.start = function (fps) {
		setInterval(gameLoop, 1000 / fps);
	}
	
	this.stop = function () {
		clearInterval(gameLoop);
	}
	
	this.addActionObject = function (object) {
		actionObjects.push(object);
	}

	this.addRenderObject = function (object) {
		renderObjects.push(object);
	}
}