(function () {
	var canvas = document.getElementById("GameView");
	canvas.width = 500;
	canvas.height = 400;
	var frameController = new FrameController(canvas);
	
	frameController.addRenderObject({ render: function (gc) {
		gc.save();
		gc.translate(50, 50);
		gc.scale(30, 30);
		gc.restore();
	}});
	
	frameController.start(50);
})();