(function () {
	var STEPS_PER_SECOND = 180;
	
	if (!Array.prototype.map) {
	    Array.prototype.map = function (f) {
	    	var nArr = new Array(this.length); 
	    	for (var i in this) {
				nArr[i] = f(this[i]); 
			} 
			return nArr;
		};
	}
    
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

    var canvas = document.getElementById("GameView");
    canvas.width = 800;
    canvas.height = 600;
	
    var frameController = new FrameController(canvas);
	var FieldSize = {
		width: 12,
		height: 9
	};
    var BLOCK_SIZE = 60;
	var CREEP_RADIUS = 0.09;
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
                var neighbors = [];
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
			var optmized = createMatrix(width, height, function (i, j) {
				var p = previous[i][j];
				if (!p) return;
				var d = Vector.subFrom(p, { x: i, y: j});
				while (previous[p.x][p.y] && Vector.equals(d, Vector.subFrom(previous[p.x][p.y], Vector.copy(p)))) {
					p = previous[p.x][p.y];
				}
				return p;
			});
            return optmized;
        };
		
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
			if (x <= 0 || y <= 0 || x >= width - 1 || y >= height - 1 || cells[x][y]) return false;
			cells[x][y] = 2;
			var previous = aStar(this.goal);
			if (previous[this.origin.x][this.origin.y]) {
				this.previous = previous;
				backgroundImage = renderBackground();
				return true;
			} else {
				cells[x][y] = 0;
				return false;
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
		
		this.getCreepAtDistance = function (point, distance) {
			var found = null;
			creeps.some(function (creep) {
				var d = Vector.subFrom(point, Vector.copy(creep.getPosition()));
				if (Vector.norm2(d) <= distance * distance)
					return found = creep;
			});
			return found;
		};
	
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
					if (pi.x - CREEP_RADIUS * 2 > pj.x) continue;
					if (pi.y - CREEP_RADIUS * 2 > pj.y) continue;
					if (pj.x - CREEP_RADIUS * 2 > pi.x) continue;
					if (pj.y - CREEP_RADIUS * 2 > pi.y) continue;
					var dp = Vector.subFrom(pj, Vector.copy(pi));
					if (Vector.norm2(dp) > CREEP_RADIUS * 2 * CREEP_RADIUS * 2) continue;
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
				if (creeps[i].foundGoal() || creeps[i].isDead()) creeps.splice(i, 1);
			}
		};
		
		this.summon = function () {
			var creep = new Creep(currentId++, origin, { x: 1 / STEPS_PER_SECOND, y: (0.5 - Math.random() * 1) / STEPS_PER_SECOND });
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
	
    var Creep = function (id, p, s) {
		var creepAcceleration = 0.01 / STEPS_PER_SECOND;
		var deceleration = creepAcceleration * 0.2;
		var maxSpeed = 0.8 / STEPS_PER_SECOND;
		var position = Vector.copy(p);
		var speed = s;
		var currentCell = Vector.round(Vector.copy(position));
		var life = 20;
	
        this.render = function (gc) {
            gc.beginPath();
			gc.arc(position.x, position.y, CREEP_RADIUS, 0, Math.PI * 2);
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
				var speedNorm2 = Vector.norm2(speed);
				if (next && speedNorm2 < maxSpeed * maxSpeed) {
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
						(speedNorm + CREEP_RADIUS) / speedNorm
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
		
		this.inflictDamage = function (damage) {
			life -= damage;
		};
		
		this.isDead = function () {
			return life <= 0;
		};
    };
    
    var BulletsManager = function () {
    	var bullets = [];
    	
    	this.createBullet = function (position, speed, duration) {
    		bullets.push({ position: position, speed: speed, duration: duration });
    	};
    	
    	this.step = function () {
    		for (var i = bullets.length - 1; i >= 0; i--) {
				var bullet = bullets[i];
				var creep = creepsManager.getCreepAtDistance(bullet.position, CREEP_RADIUS);
				if (creep)
					creep.inflictDamage(1);
				if (!bullet.duration-- || creep)
					bullets.splice(i, 1);
				else
					Vector.addTo(bullet.speed, bullet.position);
    		}
    	};
    	
    	this.render = function (gc) {
			gc.save();
			gc.scale(BLOCK_SIZE, BLOCK_SIZE);
			gc.translate(0.5, 0.5);
            gc.fillStyle = "white";
            bullets.forEach(function (bullet) {
				gc.fillRect(bullet.position.x, bullet.position.y, 0.025, 0.025);
			});
			gc.restore();
    	};
    };
    
    var Tower = function (position, createBullet) {
    	var BULLET_RANGE = 3;
    	var BULLET_SPEED = 7 / STEPS_PER_SECOND;
    	var BULLET_DURATION = BULLET_RANGE / BULLET_SPEED | 0;
    	var fireDelay = 0.2 * STEPS_PER_SECOND;
    	var fireCounter = 0;
    	
    	this.step = function () {
    		if (!fireCounter) {
    			var target = creepsManager.getCreepAtDistance(position, BULLET_RANGE);
    			if (!target) return;
    			var distance = Vector.subFrom(position, Vector.copy(target.getPosition()));
    			var offset = Vector.scale(Vector.copy(target.getSpeed()), Vector.norm(distance) / BULLET_SPEED);
				Vector.addTo(offset, distance);
    			Vector.scale(distance, BULLET_SPEED / Vector.norm(distance));
    			createBullet(Vector.copy(position), distance, BULLET_DURATION);
    			fireCounter = fireDelay;
    		} else {
    			fireCounter--;
    		}
    	};
    };
	
	var Arrows = {
		left: 37,
		up: 38,
		right: 39,
		down: 40
	};
	var ballGradient = null;
	var ball = new Creep(0, { x: 10, y: 10 }, { x: 0, y: 0 });
	(function (ball) {
		var acceleration = 0.12 / STEPS_PER_SECOND;
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
            gc.scale(CREEP_RADIUS, CREEP_RADIUS, 1);
            gc.beginPath();
			gc.arc(0, 0, 1, 0, Math.PI * 2);
			gc.fill();
            gc.restore();
		};
		
		ball.isDead = function () {
			return false;
		};
	})(ball);

    frameController.addRenderObject(field);
	
	var creepsManager = new CreepsManager(field.origin);
	setInterval(function () {
		creepsManager.summon();
	}, 350);
	creepsManager.addForeigner(ball);
	frameController.addActionObject(creepsManager);
	frameController.addRenderObject(creepsManager);
	
	var bulletsManager = new BulletsManager();
	frameController.addActionObject(bulletsManager);
	frameController.addRenderObject(bulletsManager);
	
	frameController.addActionObject(new function () {
		this.step = function () {
			if (!frameController.isMousePressed(0)) return;
			var mousePosition = frameController.getMousePosition();
			var x = (mousePosition.x / BLOCK_SIZE) | 0;
			var y = (mousePosition.y / BLOCK_SIZE) | 0;
			if (field.putTower(x, y)) {
				frameController.addActionObject(new Tower({ x: x, y: y }, bulletsManager.createBullet));
			}
		};
	});
	
	frameController.addRenderObject(new function () {
		this.render = function (gc) {
			var mousePosition = frameController.getMousePosition();
			if (!mousePosition) return;
			var x = (mousePosition.x / BLOCK_SIZE) | 0;
			var y = (mousePosition.y / BLOCK_SIZE) | 0;
			if (x < 0 || y < 0 || x >= FieldSize.width - 1 || y >= FieldSize.height - 1) return;
			var p = field.previous[x][y];
			if (!p) return;
			gc.fillRect(p.x * BLOCK_SIZE, p.y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
		};
	});
	
	frameController.renderSetup = function (gc) {
		ballGradient = gc.createRadialGradient(-0.2, -0.2, 0.2, 0, 0, 1);
		ballGradient.addColorStop(0,"red");
		ballGradient.addColorStop(1,"#700");
	};

    frameController.start(STEPS_PER_SECOND, 60);
})();