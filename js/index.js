
document.addEventListener('touchstart',function(e){
	e.preventDefault();
});

(function(){
	var box = document.querySelector('#box');
	var list = document.querySelector('#list');
	var inner = document.querySelector('#inner');
	var footer = inner.querySelector('footer');
	var imgPage = document.querySelector('#imgPage');
	var bigImg = document.querySelector('#bigImg');
	var lis = list.children;
	//模拟图片数据
	var imgData = [];
	var length = 12;
	var start = 0;
	var isEnd = false;
	for (var i = 0;i <26; i++) {
		imgData.push('img/pics/'+ (i%26+1) +'.jpg');
	}
	setBigImg();
	setScroll();
	createLi();
	// 请求数据 加载li
	function createLi(){
		if( start >= imgData.length){
			footer.innerHTML = '对不起，没有更多图片了.';
			setTimeout(function(){
				footer.style.opacity = 0;
				console.log('inner的offsetHeight：' + inner.offsetHeight);
				MTween({
					el:inner,
					target:{translateY: box.clientHeight - inner.offsetHeight},
					time:300,
					type: 'easeBoth'
				})
			},1000);
			return;
		}
		var end = start + length;
		end = end > imgData.length ? imgData : end;
		for (var i = start; i < end; i++) {
			var li = document.createElement('li');
			li.src = imgData[i];
			li.isLoad = true;
			li.addEventListener('touchend', function(e) {
				if(this.isMove) {
					return;
				}
				css(bigImg,"scale",100);
				css(bigImg,"rotate",0);
				bigImg.src = this.children[0].src;
				css(imgPage,"scale",100);	
			});
			list.appendChild(li);
		}
		createImg();
		footer.style.opacity = 0;
	}
	// 判断是否需要加载图片
	function createImg(){
		var boxRect = box.getBoundingClientRect();
		var bottom = boxRect.top + boxRect.height;
		console.log(bottom);
		for(var i = 0; i < lis.length; i++){
			var top = lis[i].getBoundingClientRect().top; // li相对于可视区的top值
			if(top < bottom && lis[i].isLoad){
				lis[i].isLoad = false;
				showImg(lis[i]);
			}
		}
	}
	
	// 创建图片并显示
	function showImg(li){
		var img = new Image();
		img.src = li.src;
		img.onload = function(){
			li.appendChild(img);
			setTimeout(function(){
				img.style.opacity = 1;
			},300)
			
		};
	}
	
	function setScroll(){
		mScroll({
			el:box,
			start(e){
				// console.log('按下了');
				var innerTop = Math.round(css(inner,'translateY'));
				var minTop = box.clientHeight - inner.offsetHeight;
				
				// 上滑加载
				if(minTop >= innerTop ){
					console.log("用户是在底部进行拖拽的");
					footer.style.opacity = 1;	
					isEnd = true;	
				} else {
					footer.style.opacity = 0;	
					isEnd = false;	
				}

				// 下拉刷新
//				if( innerTop > 10){
//					console.log('在下拉')
//					footer.style.opacity = 1;
//					isEnd = true;
//				} else {
//					footer.style.opacity = 0;
//					isEnd = false;
//				}
			},
			move(e){
				createImg()
			},
			end(e){
				var innerTop = Math.round(css(inner,'translateY'));
				var minTop = box.clientHeight - inner.offsetHeight;
				if(isEnd && minTop >= innerTop){
					// 清除定时器阻止滑屏函数的回弹动画。
					clearInterval(inner.timer);
					start += length;
					createLi();
					document.querySelector('#scrollBar').style.opacity = 0;
					isEnd = false;
				}
			},
			over(e){
				console.log('running end');
			}
		});
	}
})();
function setBigImg(){
	var bigImg = document.querySelector('#bigImg');
	var navs = document.querySelectorAll('#imgNav a');
	var imgPage = document.querySelector('#imgPage');
	var backBtn = document.querySelector('#backBtn');
	var startRotate = 0;
	var startScale = 0;
	var maxScale = 1.5;
	var minScale = 0.5;
	backBtn.addEventListener('touchend',function(){
		css(imgPage, 'scale', 0);
	})
	css(imgPage, 'scale', 0);
	setGesture({
		el:bigImg,
		start:function(e){ 
			startRotate = css(this,'rotate');
			startScale = css(this,'scale')/100;
		},
		change:function(e){
			var scale = startScale * e.scale;
			if(scale > maxScale){
				scale = maxScale;
			} else if (scale < minScale){
				scale = minScale;
			}
			css(this,'rotate',startRotate + e.rotation);
			css(this,'scale',scale*100);
		},
		end:function(){
			var deg = css(this,'rotate');
			deg = Math.round(deg/90)*90;
			MTween({
				el:this,
				target:{rotate:deg},
				time:300,
				type: 'easeBoth'
			})
		}
	});
	
	navs[0].addEventListener('touchend',function(){
		var deg = css(bigImg,'rotate');
		deg = Math.round(deg/90) - 1;
		deg = deg * 90;
		MTween({
			el:bigImg,
			target:{rotate:deg},
			time:300,
			type: 'easeBoth'
		});
	});
	
	navs[1].addEventListener('touchend',function(){
		var deg = css(bigImg,'rotate');
		deg = Math.round(deg/90) + 1;
		console.log(deg);
		deg = deg * 90;
		MTween({
			el:bigImg,
			target:{rotate:deg},
			time:300,
			type: 'easeBoth'
		})
	})
	
	navs[2].addEventListener('touchend',function(){
		var scale = css(bigImg,'scale')/100;
		scale += 0.1;
		if( scale >  maxScale){
			scale = maxScale;
		}
		MTween({
				el:bigImg,
				target:{scale:scale*100},
				time:300,
				type: 'easeBoth'
			})
	})
	
	navs[3].addEventListener('touchend',function(){
		var scale = css(bigImg,'scale')/100;
		scale -= 0.1;
		if( scale <  minScale){
			scale = minScale;
		}
		MTween({
				el:bigImg,
				target:{scale:scale*100},
				time:300,
				type: 'easeBoth'
			})
	})
}


function getDis(p1,p2){ // point
	var x = p2.x - p1.x;
	var y = p1.y - p2.y;
	return Math.sqrt(x*x + y*y);
}

// 计算斜率 Math.atan2(y,x) 斜率：一条直线距离X轴正方向的角的正切,返回值是一个弧度  
// 角度转弧度 deg*Math.PI/180
// 弧度转角度 rad*180/Math.PI
function getDeg(p1,p2){
	var x = p2.x - p1.x;
	var y = p2.y - p1.y;
	return Math.atan2(x,y)*180/Math.PI;
}


function setGesture(init){
	var el = init.el;
	var isGesture = false;
	var startPoint = [];
	if(!el){
		return;
	}
	
	el.addEventListener('touchstart',function(e){
		// 如果屏幕上有两根或者两根以上手指
		if(e.touches.length >= 2){
			isGesture = true;
			startPoint[0] = {x : e.touches[0].pageX, y : e.touches[0].pageY};
			startPoint[1] = {x : e.touches[1].pageX, y : e.touches[1].pageY};
			// 当start为true的时候执行它，并且修改this指向到元素身上，把事件对象e传过去
			init.start && init.start.call(el,e);
		}
	})
	
	
	el.addEventListener('touchmove',function(e){
		// 如果屏幕上有两根或者两根以上手指并且是触发了start之后
		if(isGesture && e.touches.length >= 2){
			/*
			 需要拿到e.scale: 移动前后手指距离的比值
			 需要拿到e.rotation:旋转前后的夹角
			 * */
			var nowPoint = [];
			nowPoint[0] = {x : e.touches[0].pageX, y : e.touches[0].pageY};
			nowPoint[1] = {x : e.touches[1].pageX, y : e.touches[1].pageY};
			// 缩放比
			var startDis = getDis(startPoint[0],startPoint[1]);
			var nowDis = getDis(nowPoint[0],nowPoint[1]);
			// 角度差
			var startDeg = getDis(startPoint[0],startPoint[1]);
			var nowDeg = getDis(nowPoint[0],nowPoint[1]);
			
			e.scale = nowDis/startDis; // 拿到缩放比
			e.rotation = nowDeg - startDeg; // 角度差
			init.change && init.change.call(el,e);
		}
	})
	
	// 模仿gestureend：gesturestart执行完后屏幕上离开手指或者元素上离开手指就触发
	el.addEventListener('touchend',function(e){
		// 如果触发过了start函数就执行下面的，
		if(isGesture){ 
			// 如果屏幕上的手指少于2个就代表不是多指操作
			// 如果元素上的手指数量等于0个就代表元素上的手指离开了
			if(e.touches.length < 2 || e.targetTouches.length < 1){
				isGesture = false;
				init.end && init.end.call(el,e);
			}
		}
	})
}


// 滑屏工具函数
function mScroll(init){
	if(!init.el){
		return;
	}
	var wrap = init.el;
	var inner = init.el.children[0];
	var scrollBar = document.createElement("div");	
	var startPoint = 0;
	var startEl = 0;
	var lastY = 0;
	var lastDis = 0;
	var lastTime = 0;
	var lastTimeDis = 0;
	var back = document.documentElement.clientWidth/8;
	var maxTranslate = wrap.clientHeight - inner.offsetHeight;
	scrollBar.id = 'scrollBar';
	if(!init.offBar){
		var scale = wrap.clientHeight/inner.offsetHeight;
		inner.style.minHeight = "100%";
		scrollBar.style.cssText = "width:4px;background:rgba(0,0,0,.5);position:absolute;right:0;top:0;border-radius:2px;opacity:0;transition:.3s opacity;";
		wrap.appendChild(scrollBar);
	}
	css(inner,"translateZ",0.01);
	inner.addEventListener('touchstart', function(e) {
		maxTranslate = wrap.clientHeight - inner.offsetHeight;
		if(!init.offBar){
			if(maxTranslate >= 0) {
				scrollBar.style.display = "none";
			} else {
				scrollBar.style.display = "block";
			}
			scale = wrap.clientHeight/inner.offsetHeight;
			scrollBar.style.height = wrap.clientHeight * scale + "px";
		}
		clearInterval(inner.timer);
		startPoint = e.changedTouches[0].pageY;
		startEl = css(inner,"translateY");
		lastY = startEl;
		lastTime = new Date().getTime();
		lastTimeDis = lastDis = 0;
		(init.offBar)||(scrollBar.style.opacity = 1);
		init.start && init.start.call(box,e);
	});
	
	
	inner.addEventListener('touchmove', function(e) {
		var nowTime = new Date().getTime();
		var nowPoint = e.changedTouches[0].pageY;
		var dis = nowPoint - startPoint;
		var translateY = startEl + dis;
		if(translateY > back){
			translateY = back
		} else if(translateY < maxTranslate -back){
			translateY = maxTranslate - back;
		}
		css(inner,"translateY",translateY);
		(init.offBar)||css(scrollBar,"translateY",-translateY*scale);
		lastDis = translateY - lastY;
		lastY = translateY;
		lastTimeDis = nowTime - lastTime;
		lastTime = nowTime;
		init.move && init.move.call(box,e);
	});
	
	
	inner.addEventListener('touchend', function(e) {
		var type = "easeOut";
		var speed = Math.round(lastDis / lastTimeDis*10);
		speed = lastTimeDis <= 0?0 :speed;
		var target = Math.round(speed*30 + css(inner,"translateY"));
		if(target > 0){
			target = 0;
			type = "backOut";
		} else if(target < maxTranslate){
			target = maxTranslate;
			type = "backOut";
		}
		MTween({
			el:inner,
			target: {translateY:target},
			time: Math.round(Math.abs(target - css(inner,"translateY"))*1.8),
			type: type,
			callBack: function(e){
				(init.offBar) || (scrollBar.style.opacity = 0);
				init.over && init.over.call(box,e);
			},
			callIn: function(e){
				var translateY = css(inner,"translateY");
				init.offBar||css(scrollBar,"translateY",-translateY*scale);
				
				init.move && init.move.call(box,e);
			}
		});
		init.end && init.end.call(box,e);
	});
}

