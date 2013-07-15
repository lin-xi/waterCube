
var Polygon = (function(){

	var MAGNITUDE = 200, SEGMENT=6;
	function Polygon(node, func){
		this.node = node;
		this.callback = func;

		this.cache = {};
		this._init();     //初始化，在层范围内随机生成点
		this._drawLine(); //连接点
		this._drawHexagon(); //计算出原始六边形的每相邻两条连心线的中垂线的交点，并将这些焦点连接成凸六边形
		//this._joinInterSection(); //连接已经计算出的交点
		this._finish();
	}

	$.extend(Polygon.prototype, {
		/**
		 *初始化点
		 */
		_init: function(){
			var self = this, g = self.cache;
			var node = $('#'+self.node);
			var w = node.width(), h = node.height();

			self.paper = Raphael(self.node, w, h);
			paper = self.paper;
			$('#'+self.node).hide();

			g.points = []; //点
			g.intersection = [];
			g.data = {};

			var n1 = Math.floor(w/MAGNITUDE), n2 = Math.floor(h/SEGMENT);

			for(var i=0; i<=SEGMENT; i++){
				var sh = i*n2, h_line = 'M0 '+sh+' L'+w+' '+sh;
				//paper.path(h_line).attr({'stroke': "#cccccc"});
			}

			for(var i=0; i<=n1+1; i++){
				var sw = (i-1)*MAGNITUDE, v_line = 'M'+sw+' 0L'+sw+' '+h;
				//paper.path(v_line).attr({'stroke': "#cccccc"});
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

		/**
		 *计算出六边形的每相邻两条连心线的中垂线的交点，并将这些焦点连接成凸六边形
		 */
		_drawHexagon: function(){
			var self = this, paper = self.paper, g = self.cache, points = g.points, section = g.intersection;

			var l1_normal, l2_normal, t1_normal, t2_normal, r1_normal, r2_normal;
			var l1_l2, l1_t1, t1_r1, r1_r2, r2_t2, t2_l2;
			
			for(var i=0, ii=section.length; i<ii; i++){
				var item = section[i];
				for(var j=0, jj=item.length; j<jj; j++){
					if(i<ii-2 && j<jj-1){
						var itemn = points[i+1], itemnn = section[i+1];
						var l1 = item[j], l2 = item[j+1], t1 = itemn[j], c=itemn[j+1], t2 = itemn[j+2], r1 = itemnn[j], r2=itemnn[j+1];
						doProcess(l1, l2, t1, t2, c, r1, r2);
					}
				}
			}

			for(var i=0, ii=points.length; i<ii; i++){
				var item = points[i]
				for(var j=1, jj=item.length; j<jj; j++){
					if(i<ii-1 && j<jj-2){
					//if(i==1 && j==1){
						var itemn = section[i], itemnn = points[i+1];
						var l1 = item[j], l2 = item[j+1], t1 = itemn[j-1], c=itemn[j], t2 = itemn[j+1], r1 = itemnn[j], r2=itemnn[j+1];
						doProcess(l1, l2, t1, t2, c, r1, r2);
					}
					
				}
			}

			function doProcess(l1, l2, t1, t2, c, r1, r2){
				l1_l2 = self._getNormalIntersection(l2, l1, c);
				if(l1_l2){
					paper.circle(l1_l2.x, l1_l2.y, 2).attr({'fill': "#000000", 'stroke': "#cccccc"});
				}
				l1_t1 = self._getNormalIntersection(l1, t1, c);
				if(l1_t1){
					paper.circle(l1_t1.x, l1_t1.y, 2).attr({'fill': "#000000", 'stroke': "#cccccc"});
				}
				t1_r1 = self._getNormalIntersection(t1, r1, c);
				if(t1_r1){
					paper.circle(t1_r1.x, t1_r1.y, 2).attr({'fill': "#000000", 'stroke': "#cccccc"});
				}
				r1_r2 = self._getNormalIntersection(r1, r2, c);
				if(r1_r2){
					paper.circle(r1_r2.x, r1_r2.y, 2).attr({'fill': "#000000", 'stroke': "#cccccc"});
				}
				r2_t2 = self._getNormalIntersection(r2, t2, c);
				if(r2_t2){
					paper.circle(r2_t2.x, r2_t2.y, 2).attr({'fill': "#000000", 'stroke': "#cccccc"});
				}
				t2_l2 = self._getNormalIntersection(l2, t2, c);
				if(t2_l2){
					paper.circle(t2_l2.x, t2_l2.y, 2).attr({'fill': "#000000", 'stroke': "#cccccc"});
				}
				self._drawHexagonFromPoints(l1_l2, l1_t1, t1_r1, r1_r2, r2_t2, t2_l2);
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
		_drawHexagonFromPoints: function(p1, p2, p3, p4, p5, p6){
			var self = this, paper = self.paper;

			var args = Array.prototype.slice.call(arguments);
			var origin = args.slice();

			var intersection = false; 
			function check(){
				if(p2.x<p1.x){ intersection = true; return 1;}
				if(p3.x<p2.x){ intersection = true; return 2;}
				if(p3.y>p4.y){ intersection = true; return 3;}
				if(p4.x<p5.x){ intersection = true; return 4;}
				if(p5.x<p6.x){ intersection = true; return 5;}
				if(p6.y<p1.y){ intersection = true; return 5;}
			}
			var idx = check();
			if(idx){
				console.log('删除', idx)
				origin.splice(idx, 1);
			}

			/*
			args.sort(function(p, n){
				return p.y - n.y;
			});

			var a1 = args.slice(0, args.length/2);
			a1.sort(function(p, n){
				return p.x-n.x;
			});
			var a2 = args.slice(args.length/2, args.length);
			a2.sort(function(p, n){
				return n.x-p.x;
			});
			var a3 = a1.concat(a2);
			*/

			var path = "";
			for(var i=0, ii=origin.length; i<ii; i++){
				var item = origin[i];
				if(i == 0){
					path += 'M'+ item.x +' '+ item.y;
				}else{
					path += 'L'+ item.x +' '+ item.y;
				}
			}
			path += 'Z';

			/*
			var args = [];
			for(var i=0, ii=arguments.length; i<ii; i++){
				var obj = {};
				obj.label = i;
				obj.x = arguments[i].x;
				obj.y = arguments[i].y;
				args.push(obj);
			}
			var origin = args.slice();
			args.sort(function(p, n){
				return p.y - n.y;
			});

			var a1 = args.slice(0, args.length/2);
			a1.sort(function(p, n){
				return p.x-n.x;
			});
			var a2 = args.slice(args.length/2, args.length);
			a2.sort(function(p, n){
				return n.x-p.x;
			});
			var a3 = a1.concat(a2);

			var path = "";
			for(var i=0, ii=origin.length; i<ii; i++){
				var item = origin[i];
				if(i == 0){
					path += 'M'+ item.x +' '+ item.y;
				}else{
					path += 'L'+ item.x +' '+ item.y;
				}
			}
			path += 'Z';
			*/

			/*
			var path = "";
			for(var i=0, ii=a3.length; i<ii; i++){
				if(i == 0){
					path += 'M'+ a3[i].x +' '+ a3[i].y;
				}else{
					path += 'L'+ a3[i].x +' '+ a3[i].y;
				}
			}
			path += 'Z';

			var path = "", first = 0;
			for(var i=0; i<a3.length; i++){
				if(a3[i].label<= i){
					if(first == 0){
						path += 'M'+ a3[i].x +' '+ a3[i].y;
					}else{
						path += 'L'+ a3[i].x +' '+ a3[i].y;
					}
					first++;
				}else{
					console.log('放弃 p'+a3[i].label);
				}
			}
			path += 'Z';
			*/

			var shape = paper.path(path).attr({fill: '#fff', 'stroke': "#000000", 'fill-opacity': 0.3});

			shape.mouseover(function () {
				shape.stop().animate({'fill': '#996633', 'fill-opacity': 1}, 500, "elastic");
			}).mouseout(function () {
				shape.stop().animate({'fill': '#ffffff', 'fill-opacity': 0.3}, 500, "elastic");
			});
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
		 *求两点连成的线的中垂线路径
		 *@param dot1, dot3 直线一的两点
		 *@param dot2, dot3 直线二的两点
		 */
		_getNormalIntersection: function(dot1, dot2, dot3){

			var self = this, g = self.cache, paper = self.paper;
			var temp = [];
			for(var i=0, ii=arguments.length; i<ii; i++){
				temp.push(Math.round(arguments[i].x));
				//temp.push(Math.round(arguments[i].y));
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
			var n1 = Math.ceil(w/MAGNITUDE), n2 = SEGMENT, n3 = Math.ceil(h/SEGMENT);

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
		}
	});
	return Polygon;
})();