/* created by Malashin Max 2018 */
/* ksimin.ru (is currently in the web archive) */
window.addEventListener("DOMContentLoaded", GravityInit)

Math.TAU = Math.PI * 2
Math.DEG = Math.PI / 180 // 1 градус в радианах

function GravityInit() {

	var radius = 15000 // расстояние от курсора до обьекта при котором начинает действовать притяжение
	var sealingRadius = 4 // расстояние от центра вращения
	var speed = 2; //скорость вращения радиан/сек


	var gravityElems = document.getElementsByClassName('gravity')
	var lastUpdate = Date.now()
	var deltaTime = 0;

	document.addEventListener("mousemove", onMouseMove)
	initGravityElements()
	window.addEventListener("resize", initGravityElements)
	requestAnimationFrame(update)

	function initGravityElements() {
		const res = randomNonOverlappingPointsInCircle(150, gravityElems.length, 52);
		
		res.forEach((item, index) => {
			item.x += gravityElems[index].parentElement.clientWidth / 2 - gravityElems[index].clientWidth /2
			item.y += gravityElems[index].parentElement.clientHeight / 2 - gravityElems[index].clientHeight /2
		})

		for (var index = gravityElems.length - 1; index >= 0; index--) {
			var element = gravityElems[index]
			var rect = element.getBoundingClientRect()
			element.startPosition = new Vector(res[index].x + gravityElems[index].clientWidth / 2, res[index].y  + gravityElems[index].clientHeight / 2)
			element.gravityOffset = new Vector()
			element.angle = Math.random() * Math.TAU
			
			element.style.top = res[index].y + "px";
			element.style.left = res[index].x + "px";
		}
	}

	function setGravity(element, cursorPosition) {
		var vectorToTarget = Vector.subtract(cursorPosition, element.startPosition)
		var sqrDistanse = vectorToTarget.sqrMagnitude()
		if (sqrDistanse > radius)
			return
		var f = radius / sqrDistanse;
		if (f * f > sqrDistanse)
			var newVector = vectorToTarget
		else
			var newVector = vectorToTarget.normalize().multiply(f)
		element.gravityOffset = newVector
	}

	function sealing(element) {
		var x = Math.cos(element.angle) * sealingRadius + element.gravityOffset.x;
		var y = Math.sin(element.angle) * sealingRadius + element.gravityOffset.y;
		element.angle += speed * deltaTime;
		if (element.angle >= Math.TAU) {
			element.angle = element.angle % Math.TAU;
		}
		element.style.transform = `translate3d(${x}px, ${y}px, ${y}px)`;
		//element.style.backgroundPosition = "" + x + "px," + y + "px";
	}

/**
 * Called when the user moves the mouse.
 *
 * @param {Event} e - The MouseEvent that triggered this function.
 * @private
 */
	function onMouseMove(event) {
		const rect = gravityElems[0].parentElement.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
	  
		// console.log(`X: ${x}, Y: ${y}`);

		for (var i = gravityElems.length - 1; i >= 0; i--) {
			setGravity(gravityElems[i], new Vector(x, y))
		}
	}

	function update() {
		var now = Date.now();
		deltaTime = (now - lastUpdate) / 1000
		lastUpdate = now
		for (var i = gravityElems.length - 1; i >= 0; i--) {
			sealing(gravityElems[i])
		}
		requestAnimationFrame(update)
	}
}


window.addEventListener("DOMContentLoaded", TextInit)

function TextInit() {
	var lang = {
		hello: {
			ru: "Personal site",
			en: "Personal site"
		},
		title: {
			ru: "Personal site",
			en: "Personal site"
		},
		copy: {
			ru: "Нажмите Ctrl+C для копирования",
			en: "Press Ctrl+C, Enter"
		}
	}
	var copyUrls = {
		gitlab: "gitlab.com/max3jk",
		github: "github.com/MaxMls",
		vk: "#",
		telegram: "#",
		email: "#",
		tumblr: "#",
		steam: "#"
	}
	var urls = {
		gitlab: "https://gitlab.com/max3jk",
		github: "https://github.com/MaxMls",
		vk: "#",
		telegram: "#",
		email: "#m",
		tumblr: "#",
		steam: "#"
	}

	var language = GetLanguage()
	document.title = GetStr("title")
	document.getElementsByClassName('hello')[0].innerHTML = GetStr("hello")

	var links = document.getElementsByClassName('svgLogo')

	for (var i = links.length - 1; i >= 0; i--) {
		links[i].addEventListener("mousedown", click)
	}

	function click(event) {
		event = event || window.event;
		url = event.currentTarget.className.split(' ')[1]
		if (event.which == 1) location.href = urls[url]
		else if (event.which == 2) window.open(urls[url], '_blank')
		else if (event.which == 3) window.prompt(GetStr("copy"), copyUrls[url])
	}

	function GetStr(argument) {
		return lang[argument][language]
	}
}

function GetLanguage() {
	return (window.navigator ? (window.navigator.language || window.navigator.systemLanguage || window.navigator.userLanguage) : "en").substr(0, 2).toLowerCase()
}


function randomNonOverlappingPointsInCircle(radius, numPoints, minDistance) {
	const points = [];

	function isFarEnough(newPoint) {
		return points.every(p => {
			const dx = p.x - newPoint.x;
			const dy = p.y - newPoint.y;
			return Math.sqrt(dx * dx + dy * dy) >= minDistance;
		});
	}

	for (let i = 0; i < numPoints; i++) {
		let newPoint;
		let attempts = 0;

		do {
			const angle = Math.random() * 2 * Math.PI;
			const distance = Math.sqrt(Math.random()) * radius;
			const x = distance * Math.cos(angle);
			const y = distance * Math.sin(angle);
			newPoint = { x, y };
			attempts++;
		} while (!isFarEnough(newPoint) && attempts < 500);

		if (attempts < 500) {
			points.push(newPoint);
		} else {
			console.warn("Не удалось найти место для всех точек без пересечений.");
			break;
		}
	}

	return points;
}