// TrashCHAT
// VERSION: V3.02
// TiCubius <trashmates@protonmail.com>

// MODULES
const fs = require("fs")
const request = require("request")

// SETTINGS
const settings = JSON.parse(fs.readFileSync(__dirname + "/assets/config.json"))
let warnNewFollowers = false

const APIJS = require("./assets/js/API.js")
const EventsJS = require("./assets/js/Events.js")
const UIjs = require("./assets/js/UI.js")

const API = new APIJS()
const Event = new EventsJS()
const UI = new UIjs()


// LOGIN TO TWITCH SERVERS
let twitch = TwitchJS.client(settings.twitch)
twitch.connect()


// TWITCH EVENTS
twitch.on("message", Event.onMessage)
twitch.on("hosted", Event.onHosted)
twitch.on('cheer', Event.onCheered)

twitch.on("resub", Event.onResub)
twitch.on("subgift", Event.onSubgift)
twitch.on("subscription", Event.onSubscription)


// COUNTERS
twitch.on("connected", () => {
	API.fetchViewersCount(settings.api.informations.channelid).then((count) => {UI.setViewersCount(count)})
	API.fetchFollowersCount(settings.api.informations.channelid).then((count) => {UI.setFollowersCount(count)})

	API.fetchChatters(settings.api.informations.channel).then((chatters) => {UI.setChattersList(chatters)})
})

setInterval(() => {
	API.fetchViewersCount(settings.api.informations.channelid).then((count) => {UI.setViewersCount(count)})
	API.fetchFollowersCount(settings.api.informations.channelid).then((count) => {UI.setFollowersCount(count)})

	API.fetchChatters(settings.api.informations.channel).then((chatters) => {UI.setChattersList(chatters)})

	API.fetchLatestFollowers().then((followers) => {
		console.log(followers)
		// ON START
		// Probably is duplicate
		if (warnNewFollowers) {
			followers.forEach((follower) => {
				Event.onFollows(follower)
			})    
		} else {
			warnNewFollowers = true
		}
	}).catch((errors) => {
		console.log(" - " + "ERROR WHILE FETCHING LATEST FOLLOWERS".red)
	})
	
}, 15000)
