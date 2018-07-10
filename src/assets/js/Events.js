// TrashCHAT Events
// VERSION: 3.02
// AUTHOR: TiCubius <trashmates@protonmail.com>

module.exports = class Events {

	/**
	 * Retrives the highest Role a Twitch User has, according to the userstate Object
	 * 
	 * @param {object} userstate 
	 * @returns {string} role
	 */
	getHighestRole(userstate) {

		let role = "viewer"

		if (userstate.subscriber) {role = "Subscriber"}
		if (userstate.mod)        {role = "Moderator"}
		if (userstate["username"].toLowerCase() == settings.api.informations.channel.toLowerCase()) {role = "Streamer"}

		return role

	}


	/**
	 * Triggered when a Message has been sent to the Twitch User's Chat
	 *
	 * @param {string} channel
	 * @param {object} userstate
	 * @param {string} content
	 * @param {boolean} self
	 */
	onMessage(channel, userstate, content, self) {

		let role = null
		let username = userstate["display-name"] || userstate["username"]
		let userid = userstate["user-id"]

		API.fetchViewer(userid).then((Viewer) => {
			role = Viewer.role

			UI.newMessage(username, role, content)
		}).catch((error) => {
			console.error(error)
			role = Event.getHighestRole(userstate)

			UI.newMessage(username, role, content)
		})

	}


	/**
	 * Triggered when a Twitch User has subscribed the the Twitch Channel
	 * 
	 * @param {string} channel 
	 * @param {string} username 
	 * @param {string} method 
	 * @param {string} message 
	 * @param {object} userstate 
	 */
	onSubscription(channel, username, method, message, userstate) {

		UI.newAlert(username, "Subscribed")

	}

	/**
	 * Triggered when a Twitch User has Re-Subscribed to the Twitch Channel
	 * 
	 * @param {any} channel 
	 * @param {any} username 
	 * @param {any} months 
	 * @param {any} message 
	 * @param {any} userstate 
	 * @param {any} methods 
	 */
	onResub(channel, username, months, message, userstate, methods) {

		UI.newAlert(username, "Subscribed")

	}

	/**
	 * Triggered when a Twitch User has gifted someone with a Subscription to the Twitch Channel
	 * 
	 * @param {any} channel 
	 * @param {any} username 
	 * @param {any} recipient 
	 * @param {any} method 
	 * @param {any} userstate 
	 */
	onSubgift(channel, username, recipient, method, userstate) {

		UI.newAlert(username, "Subscribed")

	}


	/**
	 * Triggered when a Twitch User is hosting the Twitch Channel we're logged in as
	 * 
	 * @param {string} channel 
	 * @param {string} username 
	 * @param {int} viewers 
	 * @param {boolean} autohost 
	 */
	onHosted(channel, username, viewers, autohost) {

		UI.newAlert(username, "Hosted")

	}


	onFollows(follower) {
		
		UI.newAlert(follower.display_name, "Followed")

	}


    onCheered(channel, userstate, message) {

		let username = userstate["display-name"] || userstate["username"]
		message = userstate['bits'] += " " + message
		
		UI.newAlert(username, "Cheered", message)

    }

	/**
	 * Triggered when the #submit button is pressed 
	 */
	onSendMessage() {

		let input = document.getElementById("input")
		twitch.say("#" + settings.api.informations.channel, input.value)

		input.value = ""
		return false
	}
}
