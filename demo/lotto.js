
var Lotto = (function($){

	var MAGNITUDE = 360, SEGMENT=240;
	function WaterCube(node, func){
		this.node = node;
		this.callback = func;

		this.cache = {};
		this._init();     //初始化，在层范围内随机生成点
		this._drawLine(); //连接点
		this._drwaCentroid();
		this._drawHexagon(); //连接点成六边形
		this._finish();
	}

	$.extend(WaterCube.prototype, {
		/**
		 *初始化点
		 */
		_init: function(){
			var self = this, g = self.cache;
			var node = $('#'+self.node);
			var w = node.width(), h = node.height();
			g.width = w; 
			g.height = h;

			self.paper = Raphael(self.node, w, h);
			paper = self.paper;
			$('#'+self.node).hide();

			g.points = []; //点
			g.intersection = [];
			g.vertex = [];
			g.data = {};
			g.shapes = [];

			var n1 = Math.floor(w/MAGNITUDE), n2 = Math.floor(h/SEGMENT);

			for(var i=0; i<=n2; i++){
				var sh = i*SEGMENT, h_line = 'M0 '+sh+' L'+w+' '+sh;
				// paper.path(h_line).attr({'stroke': "#cccccc"});
			}

			for(var i=0; i<=n1+1; i++){
				var sw = (i-1)*MAGNITUDE, v_line = 'M'+sw+' 0L'+sw+' '+h;
				// paper.path(v_line).attr({'stroke': "#cccccc"});
			}

			var dots = self._randomDot(w, h);
			g.points = dots;

			for(var i=0, ii=dots.length; i<ii; i++){
				var item = dots[i];
				for(var j=0, jj=item.length; j<jj; j++){
					var dot = item[j];
					paper.circle(dot.x, dot.y, 6).attr({'fill': "#996633", 'stroke': "#cccccc"});
				}
			}
		},


		/**
		 *绘制各种连线
		 */
		_drawLine: function(){

			var self = this, paper = self.paper, g = self.cache, points = g.points;
			var level_path, adjacent_path, diagonal_path;
			var section = [];

			for(var i=0, ii=points.length; i<ii; i++){
				var item = points[i];
				var sec=[];
				for(var j=0, jj=item.length; j<jj; j++){

					if(i<ii-1 && j<jj-1){

						var itemn = points[i+1];
						var p = item[j], pn = item[j+1], pp = itemn[j], ppn = itemn[j+1];

						//连接相同层上的点
						level_path = 'M'+p.x +' '+p.y+'L'+pn.x +' '+pn.y;
						paper.path(level_path).attr({'stroke': "#e0e0e0"});
						
						//连接相邻层的对角点
						diagonal_normal1_m = 'M'+p.x +' '+p.y+'L'+ppn.x +' '+ppn.y;
						paper.path(diagonal_normal1_m).attr({'stroke': "#e0e0e0"});

						//连接相邻层的对角点
						diagonal_path_p = 'M'+pn.x +' '+pn.y+'L'+pp.x +' '+pp.y;
						paper.path(diagonal_path_p).attr({'stroke': "#e0e0e0"});

						var isdots1 = Raphael.pathIntersection(diagonal_normal1_m, diagonal_path_p);
						if(isdots1.length == 1){
							paper.circle(isdots1[0].x, isdots1[0].y, 6).attr({'fill': "#996633", 'stroke': "#cccccc"});
							sec.push({x: isdots1[0].x, y: isdots1[0].y});
						}
					}
				}
				section.push(sec);
				g.intersection = section;
			}

			for(var i=0, ii=section.length; i<ii; i++){
				var item = section[i];
				for(var j=0, jj=item.length-1; j<jj; j++){
					var p = item[j], pn = item[j+1];
					var level_path = 'M'+p.x +' '+p.y+'L'+pn.x +' '+pn.y;
					paper.path(level_path).attr({'stroke': "#e0e0e0"});
				}
			}
		},

		_drwaCentroid: function(){

			var self = this, paper = self.paper, g = self.cache, points = g.points, section = g.intersection, vertex = g.vertex;

			var l1_normal, l2_normal, t1_normal, t2_normal, r1_normal, r2_normal;
			var l1_l2, l1_t1, t1_r1, r1_r2, r2_t2, t2_l2;
			
			var vert3 = [];
			for(var j=0, jj=points[0].length; j<jj; j++){
				vert3.push(self._randomEdgeDot(j, 6));
			}
			vertex.push(vert3);

			for(var i=0, ii=points.length; i<ii-1; i++){
				var item = points[i];
				var vert1 = [], vert2 = [];

				for(var j=0, jj=item.length; j<jj; j++){
					var itemn = points[i+1], itemnn= section[i];
					if(j<jj-1){
						var l1=item[j], l2=item[j+1], l3=itemn[j], l4=itemn[j+1], t1=itemnn[j];
						if(j==0){
							vert1.push(self._randomEdgeDot(i, 0));
							vert2.push(self._randomEdgeDot(i, 1));
						}
						if(i==0){
							vert1.push(doProcess(l1, l2, t1));
							//vert1.push(self._randomEdgeDot(j, 4));
						}else{
							vert1.push(doProcess(l1, l2, t1));
						}
						vert2.push(doProcess(t1, l3, l4));
						if(j<jj-2){
							var t2=itemnn[j+1];
							vert1.push(doProcess(t1, t2, l2));
							vert2.push(doProcess(t1, t2, l4));
						}
					}else if(j==jj-1){
						var l1=item[j], l3=itemn[j], t1=itemnn[j-1];
						//vert1.push(doProcess(l1, l3, t1));
						vert1.push(self._randomEdgeDot(i, 2));
						vert2.push(self._randomEdgeDot(i, 3));
					}
				}
				vertex.push(vert1);
				vertex.push(vert2);
			}
			var vert4 = [];
			for(var j=0, jj=points[0].length; j<jj; j++){
				vert4.push(self._randomEdgeDot(j, 5));
			}
			vertex.push(vert4);

			points = null;
			section = null;

			function doProcess(d1, d2, d3){
				var x = (d1.x +d2.x + d3.x)/3, y = (d1.y +d2.y + d3.y)/3;
				paper.circle(x, y, 2).attr({'fill': "#000000", 'stroke': "#cccccc"});
				return {x:x, y:y};
			}
		},

		/**
		 *求两点连成的线的中垂线路径
		 *@param dot1, dot3 直线一的两点
		 *@param dot2, dot3 直线二的两点
		 */
		_getNormalIntersection: function(dot1, dot2, dot3){

			var self = this, g = self.cache, paper = self.paper;
			var temp = [];
			for(var i=0, ii=arguments.length; i<ii; i++){
				temp.push(Math.round(arguments[i].x));
			}
			temp.sort(function(a, b){
				return a-b;
			});
			var key = temp.join('_');
			if(g.data[key]){
				return g.data[key];
			}

			var angle = Raphael.angle(dot1.x, dot1.y, dot3.x, dot3.y);
			var	rad = Math.PI/2 - Raphael.rad(angle);
			var center = {x:(dot3.x+dot1.x)/2, y:(dot3.y+dot1.y)/2};
			var ps = self._lineFormula(rad, center, MAGNITUDE*5);
			var path1 = 'M'+ps[0].x +' '+ps[0].y+'L'+ps[1].x +' '+ps[1].y;

			angle = Raphael.angle(dot2.x, dot2.y, dot3.x, dot3.y);
			rad = Math.PI/2 - Raphael.rad(angle);
			center = {x:(dot3.x+dot2.x)/2, y:(dot3.y+dot2.y)/2};
			ps = self._lineFormula(rad, center, MAGNITUDE*5);
			var path2 = 'M'+ps[0].x +' '+ps[0].y+'L'+ps[1].x +' '+ps[1].y;

			g.data[key] = self._getIntersection(path1, path2);
			return g.data[key];
		},

		/**
		 *连接点成六边形
		 */
		_drawHexagon: function(){
			var self = this, paper = self.paper, g = self.cache, vertex = g.vertex;
			
			for(var i=0, ii=vertex.length-1; i<ii; i++){
				var item = vertex[i], itemn = vertex[i+1];
				
				if(i==0){
					var k=1;
					for(var j=0, jj=item.length-2; j<jj; j++){
						if((j+1)%2 == 1){
							var l1 = item[j], l2 = item[j+1], t1 = itemn[k], r1 = itemn[k+1], t2 = itemn[k+2];
							self._lineHexagon(i, j, l2, l1, t1, r1, t2);
							k=k+2;
						}else{
							var l1 = item[j], l2 = item[j+1], t1 = itemn[k], r1 = itemn[k+1], t2 = itemn[k+2];
							self._lineHexagon(i, j, l2, l1, t1, r1, t2);
							k=k+2;
						}
					}
				}else if(i == vertex.length-2){
					var k=0;
					for(var j=0, jj=item.length-2; j<jj; j++){
						if((j+1)%2 == 0){
							var l1 = item[j+1], l2 = item[j], t1 = itemn[k], r1 = itemn[k+1], t2 = item[j+2];
							self._lineHexagon(i, j, l1, l2, t1, r1, t2);
							j=j+1;
							k++;
						}
					}
				}else{
					for(var j=0, jj=item.length-1; j<jj; j++){
						if(i%2 == 1){
							var l1 = item[j+1], l2 = item[j], t1 = itemn[j], r1 = itemn[j+1], r2=itemn[j+2], t2 = item[j+2];
							self._lineHexagon(i, j, l1, l2, t1, r1, r2, t2);
							j=j+1;
						}else{
							if(j==0){
								var l1 = item[j+1], l2 = item[j], t1 = itemn[j], r1 = itemn[j+1];
								self._lineHexagon(i, j, l1, l2, t1, r1);
							}else if(j==jj-1){
								var l1 = item[j+1], l2 = item[j], t1 = itemn[j], r1 = itemn[j+1];
								self._lineHexagon(i, j, l1, l2, t1, r1);
							}else if(j<jj-1){
								var l1 = item[j+1], l2 = item[j], t1 = itemn[j], r1 = itemn[j+1], r2=itemn[j+2], t2 = item[j+2];
								self._lineHexagon(i, j, l1, l2, t1, r1, r2, t2);
								j=j+1;
							}
						}
					}
				}
			}
			
		},

		_finish: function(){
			var self = this;
			$('#'+self.node).show();
			self.callback();
		},
		
		/**
		 *将任意六点尽可能连成一个凸六边形
		 *@param p1, p2, p3, p4, p5, p6 六个点
		 */
		_lineHexagon: function(){
			var self = this, paper = self.paper, g = self.cache;
			
			var args1 = Array.prototype.slice.call(arguments, 0, 2);
			var args = Array.prototype.slice.call(arguments, 2);
			
			var path = "", totalX=0, totalY=0;
			for(var i=0, ii=args.length; i<ii; i++){
				var item = args[i];
				if(i == 0){
					path += 'M'+ item.x +' '+ item.y;
				}else{
					path += 'L'+ item.x +' '+ item.y;
				}
				totalX += item.x;
				totalY += item.y;
			}
			path += 'Z';
			
			var idx = g.shapes.length;
			var shape = paper.path(path).attr({fill: '#fff', 'stroke': "#000000", 'fill-opacity': 1});
			var averX = totalX/i, averY = totalY/i;
			shape.data('center', {x: averX, y: averY});
			shape.data('index', idx);
			
			g.shapes.push(shape);
		},
		/**
		 *获取两条直线的中垂线的焦点
		 *@param line1 直线一
		 *@param line2 直线二
		 */
		_getIntersection: function(line1, line2){
			var isdots = Raphael.pathIntersection(line1, line2);
			if(isdots.length == 1){
				paper.circle(isdots[0].x, isdots[0].y, 2).attr({'fill': "#000000", 'stroke': "#cccccc"});
				return {x: isdots[0].x, y: isdots[0].y};
			}
		},
		
		/**
		 *线段方程, 返回指定长度线段的两个点
		 *@param theta 斜角
		 *@param point {x:200, y:300} 线段的中心点
		 *@param l 半径
		 */
		_lineFormula: function(theta, point, l){
			var difx = l/2*Math.cos(theta),
				dify = l/2*Math.sin(theta);
			var p1 = {x: point.x-difx, y:point.y+dify},
				p2 = {x: point.x+difx, y:point.y-dify};
			return [p1, p2];
		},
		/**
		 *将圆转化成路径
		 *@param x 圆心坐标x
		 *@param y 圆心坐标x
		 *@param r 半径
		 */
		_getCircletoPath: function(x, y, r){
	       var s = "M";
	       s = s + "" + (x) + "," + (y-r) + "A"+r+","+r+",0,1,1,"+(x-0.1)+","+(y-r);
	       return s;
	    },
		
		/**
		 *随机生成坐标点
		 *@param level 层
		 *@param h 画布高
		 */
		_randomDot: function(w, h){
			var self = this, g = self.cache;
			var result = [];
			var n1 = Math.ceil(w/MAGNITUDE), n2 = Math.ceil(h/SEGMENT), n3 = SEGMENT;

			function random(scope){
				return Math.random()*scope;
			}

			for(var i=0, ii=n1; i<=ii; i++){
				var col = [];
				for(var j=0, jj=n2; j<=jj; j++){
					if(i==0){
						var	y = (j-0.5)*n3 + random(n3/2);
						col.push({x: 0, y: y});
					}else if(i == n1){
						var	y = (j-0.5)*n3 + random(n3/2);
						col.push({x: w, y: y});
					}else{
						if(j==0){
							var x = (i-0.5)*MAGNITUDE + random(MAGNITUDE/2);
							col.push({x: x, y: 0});
						}else if(j==n2){
							var x = (i-0.5)*MAGNITUDE + random(MAGNITUDE/2);
							col.push({x: x, y: h});
						} else {
							var x = (i-0.5)*MAGNITUDE + random(MAGNITUDE/2),
								y = (j-0.5)*n3 + random(n3/2);
							col.push({x: x, y: y});
						}
					}
				}
				result.push(col);
			}
			return result;
		},
		
		_preLoadImage: function(id, url, callback){
			var img = new Image();
			img.src = url;
			if (img.complete) {
					callback(id, url, img.width, img.height);
			} else {
				img.onload = function () {
					callback(id, url, img.width, img.height);
					img.onload = null;
				};
			}
		},
		
		/**
		 *随机生成边缘上的坐标点
		 *@param level 层
		 *@param h 画布高
		 */
		_randomEdgeDot: function(index, part){
			var self = this, g = self.cache;
			var result = [];
			var n1 = MAGNITUDE, n3 = SEGMENT, n2 = Math.ceil(g.height/SEGMENT);

			function random(scope){
				return Math.random()*scope;
			}

			var point;
			if(part == 0){
				index == 0 ? point = {x: index*n1 + n1/5 + random(n1/5), y: 0} : point = {x: index*n1 + random(n1/5), y: 0}
			}else if(part == 1){
				point = {x: index*n1 + n1/5 + random(n1/5), y: 0};
			}else if(part == 2){
				point = {x: index*n1 + random(2*n1/5), y: g.height};
			}else if(part == 3){
				point = {x: index*n1 + 2*n1/5 + random(n1/5), y: g.height};
			}else if(part == 4){
				point = {y: index*n3 + random(n3/2), x: 0};
			}else if(part == 5){
				point = {y: index*n3 + n3/5 + random(n3/6), x: g.width};
			}else if(part == 6){
				point = {y: index*n3 + n3/5 + random(n3/6), x: 0};
			}

			return point;
		},
		
		getCount: function(){
			var self = this, g = self.cache;
			return g.shapes.length;
		},
		
		render: function(data){
			var self = this, paper = self.paper, g = self.cache;
			var sha = g.shapes.slice();
			
			function showOneImage(){
				var len = sha.length;
				
				var idx =  Math.floor(Math.random()*len);
				console.log(idx, len);
				var shape = sha.splice(idx, 1)[0], center = shape.data('center'), index = shape.data('index');
			
				var img, name;
				self._preLoadImage(10, data[index].image, function(id, url, w, h){
					img = paper.image(url, center.x-w/2, center.y-h/2, w, h).toBack();
					name = paper.text(center.x, center.y, data[index].name).attr({stroke:'#000', 'stroke-width':'2', fill:'#fff', 'font-family':'微软雅黑', 'font-weight': 'bold', 'font-size': '30'});
					shape.stop().animate({'fill-opacity': 0}, 200, "elastic");
				});
			
				setTimeout(function(){
					if(len > 1){
						shape.stop().animate({'fill': '#ffffff', 'fill-opacity': 1}, 200, "elastic", function(){
							if(img){
								img.remove();
								name.remove();
							}
							showOneImage();
						});
					}
				}, 200);
			}
			
			showOneImage();
		}

	});
	return WaterCube;
})(jQuery);