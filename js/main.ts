/* created by Malashin Max 2018 */
/* ksimin.ru (is currently in the web archive) */
window.addEventListener("DOMContentLoaded", GravityInit)

Math.TAU = Math.PI * 2
Math.DEG = Math.PI / 180 // 1 градус в радианах

const circleRadius = 32;
const mainCircleRadius = 160;
const speed = 2; //скорость вращения радиан/сек
const radius = 15000 // расстояние от курсора до обьекта при котором начинает действовать притяжение
const friction = 0.95;

function getDistance(x1, y1, x2, y2) {
	return Math.hypot(x2 - x1, y2 - y1);
}
function isIntersecting(c1, c2) {
	return getDistance(c1.x, c1.y, c2.x, c2.y) < circleRadius * 2;
}

function GravityInit() {

	var gravityElems = Array.from(document.getElementsByClassName('gravity')).map((elem) => {
		return new Circle(150, elem);
	})

	var lastUpdate = Date.now()

	document.addEventListener("mousemove", onMouseMove)
	// window.addEventListener("resize", initGravityElements)
	requestAnimationFrame(update)

	function onMouseMove(event) {
		const rect = gravityElems[0].element.parentElement.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// console.log(`X: ${x}, Y: ${y}`);

		for (var i = gravityElems.length - 1; i >= 0; i--) {
			gravityElems[i].setGravity(new Vector(x, y))
		}
	}

	var deltaTime = 0;
	function update() {
		var now = Date.now();
		deltaTime = (now - lastUpdate) / 1000
		lastUpdate = now
		for (var i = gravityElems.length - 1; i >= 0; i--) {
			gravityElems[i].sealing(deltaTime)
		}

		let moving = false;
		const circles = gravityElems;
		for (let i = 0; i < circles.length; i++) {
			const circle = circles[i];
			circle.move();

			// Check for collision with other circles
			for (let j = i + 1; j < circles.length; j++) {
				const other = circles[j];
				if (isIntersecting(circle, other)) {
					// Move circles apart
					const angle = Math.atan2(other.y - circle.y, other.x - circle.x);
					const overlap = circleRadius * 2 - getDistance(circle.x, circle.y, other.x, other.y);
					circle.dx -= overlap * Math.cos(angle) * 0.05;
					circle.dy -= overlap * Math.sin(angle) * 0.05;
					other.dx += overlap * Math.cos(angle) * 0.05;
					other.dy += overlap * Math.sin(angle) * 0.05;
				}
			}

			// Check if still moving
			if (Math.abs(circle.dx) > 0.01 || Math.abs(circle.dy) > 0.01) {
				moving = true;
			}
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

	var language = GetLanguage();
	document.title = GetStr("title");
	const hello = document.getElementsByClassName('hello')[0];
	if (!hello) {
		return;
	}
	hello.innerHTML = GetStr("hello");

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




class Circle {
	constructor(radius, element) {
		this.element = element;

		const angle = Math.random() * 2 * Math.PI;
		const distance = Math.sqrt(Math.random()) * radius;
		let x = distance * Math.cos(angle);
		let y = distance * Math.sin(angle);


		x += element.parentElement.clientWidth / 2 - element.clientWidth / 2
		y += element.parentElement.clientHeight / 2 - element.clientHeight / 2

		this.x = x;
		this.y = y;

		this.positionInit()

		this.dx = 0;
		this.dy = 0;
	}

	positionInit() {
		const element = this.element;

		const x = this.x;
		const y = this.y;

		element.startPosition = new Vector(x, y)

		if (!element.gravityOffset) {
			element.gravityOffset = new Vector()
		}
		if (!element.angle) {
			element.angle = Math.random() * Math.TAU
		}

		element.style.left = x - element.clientWidth / 2 + "px";
		element.style.top = y - element.clientWidth / 2 + "px";
	}

	move() {
		const element = this.element;

		const width = element.parentElement.clientWidth;
		const height = element.parentElement.clientHeight;


		this.x += this.dx;
		this.y += this.dy;

		// Apply friction to slow down over time
		this.dx *= friction;
		this.dy *= friction;

		// Keep circles inside the main circle
		const distanceToCenter = getDistance(this.x, this.y, width / 2, height / 2);
		if (distanceToCenter + circleRadius > mainCircleRadius) {
			const angle = Math.atan2(this.y - height / 2, this.x - width / 2);
			this.x = width / 2 + (mainCircleRadius - circleRadius) * Math.cos(angle);
			this.y = height / 2 + (mainCircleRadius - circleRadius) * Math.sin(angle);
			this.dx *= -1;
			this.dy *= -1;
		}

		this.positionInit();
	}



	setGravity(cursorPosition) {
		const element = this.element;

		var vectorToTarget = Vector.subtract(cursorPosition, element.startPosition)
		var sqrDistanse = vectorToTarget.sqrMagnitude()
		if (sqrDistanse > radius) {
			return
		}
		var f = radius / sqrDistanse;
		if (f * f > sqrDistanse) {
			var newVector = vectorToTarget
		}
		else {
			var newVector = vectorToTarget.normalize().multiply(f)
		}
		element.gravityOffset = newVector
		element.distanceToTarget = sqrDistanse;
	}

	sealing(deltaTime) {
		const element = this.element;

		const sealingRadius = 4;
		let _sealingRadius = sealingRadius;

		if (element.distanceToTarget) {
			_sealingRadius = Math.min(element.distanceToTarget / 1000, sealingRadius)
		}
		if (_sealingRadius < 0.5) {
			_sealingRadius = 0
		}

		var x = Math.cos(element.angle) * _sealingRadius + element.gravityOffset.x;
		var y = Math.sin(element.angle) * _sealingRadius + element.gravityOffset.y;
		element.angle += speed * deltaTime;
		if (element.angle >= Math.TAU) {
			element.angle = element.angle % Math.TAU;
		}
		element.style.transform = `translate3d(${x}px, ${y}px, ${y}px)`;
		//element.style.backgroundPosition = "" + x + "px," + y + "px";
	}

}
