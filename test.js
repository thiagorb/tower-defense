(function () {
	var canvas = document.getElementById("GameView");
	canvas.width = 500;
	canvas.height = 400;
	var frameController = new FrameController(canvas);
	
	var ball = new function () {
		var radius = 30;
		var x = 50;
		var y = 50;
		var horizontalSpeed = 2;
		var verticalSpeed = 2;
		
		this.step = function () {
			if (x <= radius || x >= canvas.width - radius) horizontalSpeed = -horizontalSpeed;
			if (y <= radius || y >= canvas.height - radius) verticalSpeed = -verticalSpeed;
			x += horizontalSpeed;
			y += verticalSpeed;
		};
		
		this.render = function (gc) {
			gc.beginPath();
			gc.arc(x, y, radius, 0, Math.PI * 2);
			gc.fill();
		};
	};
	
	frameController.addRenderObject(ball);
	frameController.addActionObject(ball);
	frameController.start(60);
})();