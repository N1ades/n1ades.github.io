/* created by Malashin Max 2018 */
/* ksimin.ru (is currently in the web archive) */
window.addEventListener("DOMContentLoaded", GravityInit)

Math.TAU = Math.PI * 2
Math.DEG = Math.PI / 180 // 1 градус в радианах

function GravityInit() {

	var radius = 15000 // расстояние от курсора до обьекта при котором начинает действовать притяжение
	var sealingRadius = 2 // расстояние от центра вращения
	var speed = 2; //скорость вращения радиан/сек


	var gravityElems = document.getElementsByClassName('gravity')
	var lastUpdate = Date.now()
	var deltaTime = 0;

	document.addEventListener("mousemove", onMouseMove)
	initGravityElements()
	window.addEventListener("resize", initGravityElements)
	requestAnimationFrame(update)

	function initGravityElements() {
		for (var i = gravityElems.length - 1; i >= 0; i--) {
			var element = gravityElems[i]
			var rect = element.getBoundingClientRect()
			element.startPosition = new Vector(rect.left + (rect.right - rect.left) / 2, rect.top + (rect.bottom - rect.top) / 2)
			element.gravityOffset = new Vector()
			element.angle = Math.random() * Math.TAU
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
		var x = Math.cos(element.angle) * sealingRadius + element.gravityOffset.x
		var y = Math.sin(element.angle) * sealingRadius + element.gravityOffset.y
		element.angle += speed * deltaTime
		if (element.angle >= Math.TAU)
			element.angle = element.angle % Math.TAU
		element.style.transform = "translate(" + x + "px," + y + "px)";
	}

	function onMouseMove(e) {
		var cursorX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft)
		var cursorY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)
		for (var i = gravityElems.length - 1; i >= 0; i--) {
			setGravity(gravityElems[i], new Vector(cursorX, cursorY))
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
