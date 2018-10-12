// TrashCHAT
// VERSION: V3.10
// AUTHOR: TiCubius

const { app, BrowserWindow } = require("electron")
const path = require("path")
const url = require("url")

let window = null

// Wait until the app is ready
app.once("ready", () => {
	// Create a new window
	window = new BrowserWindow({
		// Set the initial width to 500px
		width: 1280,
		// Set the initial height to 400px
		height: 720,
		// set the title bar style
		titleBarStyle: "hidden-inset",
		// set the background color to black
		backgroundColor: "#2c3e50",
		// Don't show the window until it's ready, this prevents any white flickering
		show: false
	})

	window.loadURL(
		url.format({
			pathname: path.join(__dirname, "dist/index.html"),
			protocol: "file:",
			slashes: true
		})
	)

	window.once("ready-to-show", () => {
		window.show()
	})

	window.on('closed', function () {
        window = null
        process.exit(0)
	})

})
