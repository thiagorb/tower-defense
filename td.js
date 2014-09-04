(function () {
    Array.prototype.map = function (f) { var nArr = new Array(); for (var i in this) { nArr.push(f(this[i])); }; return nArr };

    var canvas = document.getElementById("GameView");
    canvas.width = 500;
    canvas.height = 400;
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

    function distance(x1, y1, x2, y2) {
        var dx = x1 - x2;
        var dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    var BLOCK_SIZE = 40;
    var Field = function (width, height) {
        var cells = createMatrix(width, height, function (i, j) {
            if (j == 0 || j == height - 1) return 1;
            if (i == 2 && j < height - 3) return 2;
            if (i == 4 && j > 2) return 2;
            if (i > 0 && i < width - 1) return 0;
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
                    if (!unvisitedMap[v.x][v.y] || cells[v.x][v.y]) return;
                    var alt = dist[minDist.x][minDist.y] + 1;
                    if (dist[v.x][v.y] === undefined || alt < dist[v.x][v.y]) {
                        dist[v.x][v.y] = alt;
                        previous[v.x][v.y] = minDist;
                    }
                });
            }
            return previous;
        }
        
        this.render = function (gc) {
            // must be cached
            for (var i = 0; i < width; i++) {
                for (var j = 0; j < height; j++) {
                    gc.fillStyle = ["green", "brown", "gray"][cells[i][j]];
                    gc.fillRect(i * BLOCK_SIZE, j * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        };

        this.origin = {
            x: 0,
            y: height / 2 | 0
        };

        this.goal = {
            x: width - 1,
            y: height / 2 | 0
        };
        
        this.previous = aStar(this.goal);
    };

    var field = new Field(10, 9);
    
    var Creep = function (x, y) {
        this.render = function (gc) {
            gc.fillStyle = "#0F0";
            gc.fillRect(x * BLOCK_SIZE - 5, y * BLOCK_SIZE - 5, 10, 10);
        };
        
        this.step = function () {
            var next = field.previous[x | 0][y | 0];
            if (!next) return;
            var dx = next.x + 0.5 - x;
            var dy = next.y + 0.5 - y;
            var d = distance(0, 0, dx, dy);
            x += dx / d * 0.02;
            y += dy / d * 0.02;
        };
    };
    var creep = new Creep(field.origin.x + 0.5, field.origin.y + 0.5);

    frameController.addRenderObject(field);
    frameController.addActionObject(creep);
    frameController.addRenderObject(creep);

    frameController.start(50);
})();
