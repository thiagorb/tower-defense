(function () {
	var Arrows = {
		left: 37,
		up: 38,
		right: 39,
		down: 40
	};
	
	var canvas = document.getElementById("GameView");
	canvas.width = 500;
	canvas.height = 400;
	var frameController = new FrameController(canvas);
	
	function distance(x1, y1, x2, y2) {
		var dx = x1 - x2;
		var dy = y1 - y2;
		return Math.sqrt(dx * dx + dy * dy);
	}
	
	var ball = new function () {
		var radius = 30;
		var x = 50;
		var y = 50;
		var horizontalSpeed = 0;
		var verticalSpeed = 0;
		var deceleration = 0.05;
        var acceleration = 0.1;
		
		this.step = function () {
			var speed = distance(0, 0, horizontalSpeed, verticalSpeed);
			if (speed < deceleration) {
				horizontalSpeed = 0;
				verticalSpeed = 0;
			} else {
				var factor = (speed - deceleration) / speed;
				horizontalSpeed *= factor;
				verticalSpeed *= factor;
			}

			if (frameController.isKeyPressed(Arrows.left))
				horizontalSpeed -= acceleration;
				
			if (frameController.isKeyPressed(Arrows.right))
				horizontalSpeed += acceleration;
				
			if (frameController.isKeyPressed(Arrows.up))
				verticalSpeed -= acceleration;
				
			if (frameController.isKeyPressed(Arrows.down))
				verticalSpeed += acceleration;
				
			if ((x <= radius && horizontalSpeed < 0) || (x >= canvas.width - radius && horizontalSpeed > 0)) 
                horizontalSpeed = -horizontalSpeed;

			if ((y <= radius && verticalSpeed < 0) || (y >= canvas.height - radius && verticalSpeed > 0))
                verticalSpeed = -verticalSpeed;
				
			x += horizontalSpeed;
			y += verticalSpeed;
		};
		
		this.render = function (gc) {
            gc.save();
            var grd = gc.createRadialGradient(-0.2, -0.2, 0.2, 0, 0, 1);
            grd.addColorStop(0,"red");
            grd.addColorStop(1,"#700");
            gc.translate(x, y);
            gc.scale(radius, radius, 1);
            gc.fillStyle = grd;
            gc.beginPath();
			gc.arc(0, 0, 1, 0, Math.PI * 2);
			gc.fill();

            gc.restore();
		};
	};
	
	frameController.addRenderObject(ball);
	frameController.addActionObject(ball);
	frameController.start(120, 30);
})();
