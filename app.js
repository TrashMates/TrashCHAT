const {
	app,
	BrowserWindow
} = require('electron');
const path = require('path');
const url = require('url');

app.on("ready", () => {

	let win = new BrowserWindow({
		width: 1280,
		height: 720,

		show: true,
		background: "#161616",
		icon: path.join(__dirname, "dist/assets/images/trashmates.png")
	});

	win.loadURL("file://" + __dirname + "/dist/index.html")

});