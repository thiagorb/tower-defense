(function () {
	var STEPS_PER_SECOND = 180;
	
    Array.prototype.map = function (f) { var nArr = new Array(this.length); for (var i in this) { nArr[i] = f(this[i]); }; return nArr };

    var canvas = document.getElementById("GameView");
    canvas.width = 800;
    canvas.height = 600;
    var frameController = new FrameController(canvas);
    
    function createMatrix(cols, rows, init) {
        var matrix = new Array(cols);
        for (var i = 0; i < cols; i++) {
            matrix[i] = new Array(rows);
            for (var j = 0; j < rows; j++) {
                matrix[i][j] = init(i, j);
            }
        }
        return matrix;
    }
	
	var Vector = {
		norm: function (v) {
			return Math.sqrt(Vector.norm2(v));
		},
		norm2: function (v) {
			return v.x * v.x + v.y * v.y;
		},
		scale: function (v, factor) {
			v.x *= factor;
			v.y *= factor;
			return v;
		},
		addTo: function (a, b) {
			b.x += a.x;
			b.y += a.y;
			return b;
		},
		subFrom: function (a, b) {
			b.x -= a.x;
			b.y -= a.y;
			return b;
		},
		copy: function (v) {
			return { x: v.x, y: v.y };
		},
		equals: function (a, b) {
			return a.x == b.x && a.y == b.y;
		},
		round: function (v) {
			v.x = Math.round(v.x);
			v.y = Math.round(v.y);
			return v;
		},
		scalarProduct: function (a, b) {
			return a.x * b.x + a.y * b.y;
		},
		project: function (a, b) {
			var factor = Vector.scalarProduct(a, b) / Vector.scalarProduct(b, b);
			return Vector.scale(b, factor);
		}
	};

    function distance(x1, y1, x2, y2) {
        var dx = x1 - x2;
        var dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
	
	var FieldSize = {
		width: 20,
		height: 15
	};

    var BLOCK_SIZE = 40;
    var Field = function (width, height) {
        var cells = createMatrix(width, height, function (i, j) {
            if (j == 0 || j == height - 1) return 1;
            if (i > 1 && i < width - 3) return 0;
            if (j == (height / 2 | 0)) return 0;
            return 1; 
        });
     
        var aStar = function (source) {
            var unvisited = [];
            var unvisitedMap = createMatrix(width, height, function (i, j) {
                unvisited.push({ x: i, y: j });
                return true;
            });
            var dist = createMatrix(width, height, function () { return undefined; });
            var previous = createMatrix(width, height, function () { return undefined; });
            dist[source.x][source.y] = 0;
            while (unvisited.length) {
                var minDist = undefined;
                var minIndex = undefined;
                for (var i in unvisited) {
                    var v = unvisited[i];
                    if (dist[v.x][v.y] !== undefined && (minDist === undefined || dist[v.x][v.y] < dist[minDist.x][minDist.y])) {
                        minDist = v;
                        minIndex = i;
                    }
                }
                if (!minDist) break;
                unvisited.splice(minIndex, 1);
                unvisitedMap[minDist.x][minDist.y] = undefined;
                var neighbors = []
                if (minDist.x > 0)
                    neighbors.push({ x: minDist.x - 1, y: minDist.y });
                    
                if (minDist.x < width - 1)
                    neighbors.push({ x: minDist.x + 1, y: minDist.y });
                    
                if (minDist.y > 0)
                    neighbors.push({ x: minDist.x, y: minDist.y - 1 });
                    
                if (minDist.y < height - 1)
                    neighbors.push({ x: minDist.x, y: minDist.y + 1 });
                
                neighbors.forEach(function (v) {
                    if (!unvisitedMap[v.x][v.y]) return;
                    var alt = dist[minDist.x][minDist.y] + 1;
                    if (dist[v.x][v.y] === undefined || alt < dist[v.x][v.y]) {
						if (!cells[v.x][v.y])
							dist[v.x][v.y] = alt;
                        previous[v.x][v.y] = minDist;
                    }
                });
            }
            return previous;
        }
		
		var renderBackground = function () {
			var image = document.createElement("canvas");
			image.width = BLOCK_SIZE * width;
			image.height = BLOCK_SIZE * height;
			var gc = image.getContext("2d");
            for (var i = 0; i < width; i++) {
                for (var j = 0; j < height; j++) {
                    gc.fillStyle = ["green", "brown", "gray"][cells[i][j]];
                    gc.fillRect(i * BLOCK_SIZE, j * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
			return gc.getImageData(0, 0, image.width, image.height);
		};
		
		var backgroundImage = renderBackground();
        
        this.render = function (gc) {
			gc.putImageData(backgroundImage, 0, 0);
        };

        this.origin = {
            x: 0,
            y: height / 2 | 0
        };

        this.goal = {
            x: width - 1,
            y: height / 2 | 0
        };
		
		this.putTower = function (x, y) {
			if (x <= 0 || y <= 0 || x >= width - 1 || y >= height - 1 || cells[x][y]) return;
			cells[x][y] = 2;
			var previous = aStar(this.goal);
			if (previous[this.origin.x][this.origin.y]) {
				this.previous = previous;
				backgroundImage = renderBackground();
			} else {
				cells[x][y] = 0;
			}
		};
		
		this.creepCanWalk = function (x, y) {
			if (x < 0 || y < 0 || x >= width || y >= height) return 0;
			return !cells[x][y];
		};
        
        this.previous = aStar(this.goal);
    };

    var field = new Field(FieldSize.width, FieldSize.height);
    
	var CreepsManager = function (origin) {
		var currentId = 1;
		var creeps = [];
		var positionMap = createMatrix(FieldSize.width, FieldSize.height, function () { return []; });
	
		this.step = function () {
			creeps.forEach(function (creep) {
				creep.decelerate();
			});
			creeps.forEach(function (creep) {
				creep.step();
			});
			for (var i = 0; i < creeps.length; i++) {
				var pi = creeps[i].getPosition();
			
				for (var j = i + 1; j < creeps.length; j++) {
					var pj = creeps[j].getPosition();
					if (pi.x - 0.25 > pj.x) continue;
					if (pi.y - 0.25 > pj.y) continue;
					if (pj.x - 0.25 > pi.x) continue;
					if (pj.y - 0.25 > pi.y) continue;
					var dp = Vector.subFrom(pj, Vector.copy(pi));
					if (Vector.norm2(dp) > 0.250 * 0.250) continue;
					var si = creeps[i].getSpeed();
					var sj = creeps[j].getSpeed();
					var ds = Vector.subFrom(sj, Vector.copy(si));
					if (Vector.scalarProduct(ds, dp) > 0) continue;
					var projj = Vector.project(sj, Vector.copy(dp));
					var proji = Vector.project(si, dp);
					Vector.subFrom(proji, si);
					Vector.subFrom(projj, sj);
					Vector.addTo(projj, si);
					Vector.addTo(proji, sj);
				}
			}
			for (var i = creeps.length - 1; i >= 0; i--) {
				creeps[i].move();
				if (creeps[i].foundGoal()) creeps.splice(i, 1);
			}
		};
		
		this.summon = function () {
			var creep = new Creep(currentId++, origin);
			creeps.push(creep);
		};
		
		this.addForeigner = function (foreigner) {
			creeps.push(foreigner);
		};
		
		this.render = function (gc) {
			gc.save();
			gc.scale(BLOCK_SIZE, BLOCK_SIZE);
			gc.translate(0.5, 0.5);
            gc.fillStyle = "#0F0";
            creeps.forEach(function (creep) {
				creep.render(gc);
			});
			gc.restore();
		};
	};
	
    var Creep = function (id, p) {
		var creepAcceleration = 0.06 / STEPS_PER_SECOND;
		var deceleration = creepAcceleration * 0.95;
		var position = Vector.copy(p);
		var speed = { x: 0, y: 0 };
		var currentCell = Vector.round(Vector.copy(position));
	
        this.render = function (gc) {
            gc.beginPath();
			gc.arc(position.x, position.y, 0.125, 0, Math.PI * 2);
            gc.fill();
        };
        
        this.decelerate = function () {
			var speedNorm = Vector.norm(speed);
			if (speedNorm < deceleration) {
				speed = { x: 0, y: 0 };
			} else {
				Vector.scale(speed, (speedNorm - deceleration) / speedNorm);
			}
        };
		
		this.step = function () {
			if (currentCell.x >= 0 && currentCell.x < FieldSize.width && currentCell.y >= 0 && currentCell.y < FieldSize.height) {
				var next = field.previous[currentCell.x][currentCell.y];
				if (next) {
					var d = Vector.copy(next);
					Vector.subFrom(position, d);
					Vector.scale(d, creepAcceleration / Vector.norm(d));
					Vector.addTo(d, speed);
				}
			}
		};
		
		this.move = function () {
			var speedNorm = Vector.norm(speed);
			if (!speedNorm) return;
			var nextCell = Vector.round(
				Vector.addTo(
					position,
					Vector.scale(
						Vector.copy(speed), 
						(speedNorm + 0.125) / speedNorm
					)
				)
			);
			var nextCellCopy = Vector.copy(nextCell);
			if (!Vector.equals(nextCell, currentCell) && !field.creepCanWalk(nextCell.x, nextCell.y)) {
				Vector.subFrom(currentCell, nextCell);
				if (nextCell.x) speed.x = -speed.x;
				if (nextCell.y) speed.y = -speed.y;
			}
			currentCell = nextCellCopy;
			Vector.addTo(speed, position);
		};
		
		this.foundGoal = function () {
			return Vector.equals(currentCell, field.goal);
		};
		
		this.getPosition = function () {
			return position;
		};
		
		this.getSpeed = function () {
			return speed;
		};
		
		this.getId = function () {
			return this.id;
		};
    };
	
	var Arrows = {
		left: 37,
		up: 38,
		right: 39,
		down: 40
	};
	var ballGradient;
	var ball = new Creep(0, { x: 10, y: 10 });
	(function (ball) {
		var acceleration = 0.12 / STEPS_PER_SECOND;
		var radius = 0.125;
		ball.step = function () {
			if (frameController.isKeyPressed(Arrows.left))
				ball.getSpeed().x -= acceleration;
				
			if (frameController.isKeyPressed(Arrows.right))
				ball.getSpeed().x += acceleration;
				
			if (frameController.isKeyPressed(Arrows.up))
				ball.getSpeed().y -= acceleration;
				
			if (frameController.isKeyPressed(Arrows.down))
				ball.getSpeed().y += acceleration;
		};
		
		ball.render = function (gc) {
            gc.save();
            gc.fillStyle = ballGradient;
            gc.translate(ball.getPosition().x, ball.getPosition().y);
            gc.scale(radius, radius, 1);
            gc.beginPath();
			gc.arc(0, 0, 1, 0, Math.PI * 2);
			gc.fill();
			
            gc.restore();
		};
	})(ball);
	
	var creepsManager = new CreepsManager(field.origin);
	var creeps = [];
	setInterval(function () {
		creepsManager.summon();
	}, 1000);
	
    frameController.addRenderObject(field);
	
	
	creepsManager.addForeigner(ball);
	frameController.addActionObject(creepsManager);
	frameController.addRenderObject(creepsManager);
	
	frameController.addActionObject(new function () {
		this.step = function () {
			if (!frameController.isMousePressed(0)) return;
			var mousePosition = frameController.getMousePosition();
			field.putTower((mousePosition.x / BLOCK_SIZE) | 0, (mousePosition.y / BLOCK_SIZE) | 0);
		};
	});
	
	frameController.renderSetup = function (gc) {
		ballGradient = gc.createRadialGradient(-0.2, -0.2, 0.2, 0, 0, 1);
		ballGradient.addColorStop(0,"red");
		ballGradient.addColorStop(1,"#700");
	};

    frameController.start(STEPS_PER_SECOND, 60);
})();