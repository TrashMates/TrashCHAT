// TrashCHAT UI
// VERSION: 3.00
// AUTHOR: TiCubius <trashmates@protonmail.com>

module.exports = class UI {

	/**
	 * Displays a Message
	 * 
	 * @param {string} username 
	 * @param {string} role 
	 * @param {string} content 
	 */
	newMessage(username, role, content) {

		let date = Date().toString().split(" ")[4]

		// MESSAGE PROPERTY
		let message = null
		message = document.createElement("div")
		message.className = "message " + role

		// MESSAGE CONTENT FORMATING
		let HTMLcontent = '<div class="header">'

		// 1. HEADER
		if (role == "Streamer")   {HTMLcontent += 	'	<div class="icon"><i class="fas fa-check"></i></div>'}
		if (role == "Moderator")  {HTMLcontent += 	'	<div class="icon"><i class="fas fa-check"></i></div>'}
		if (role == "Subscriber") {HTMLcontent += 	'	<div class="icon"><i class="fas fa-star"></i></div>'}
		if (role == "Follower")   {HTMLcontent += 	'	<div class="icon"><i class="fas fa-heart"></i></div>'}

		// 2. CONTENT
		HTMLcontent += '	<span class="username">' + username + '</span>'
		HTMLcontent += '	<span class="date">' + date + '</span>'
		HTMLcontent += '</div>'
		HTMLcontent += '<div class="content">'
		HTMLcontent += '	<p>' + content + '</p>'
		HTMLcontent += '</div>'

		// MESSAGE DISPLAY
		message.innerHTML = HTMLcontent
		document.getElementById("messages").appendChild(message)

		// AUTOSCROLLER
		if ((document.getElementById("messages").scrollTop + document.getElementById("messages").clientHeight + 500) >= (document.getElementById("messages").scrollHeight)) {
			message.scrollIntoView()
		}

		// AUTODELETE
		let messages = document.getElementsByClassName("message")
		if (messages.length > 1000) {messages[0].remove()}
	}


	/**
	 * Displays an Alert
	 * 
	 * @param {string} username 
	 * @param {string} type 
	 * @param {string} message
	 */
	newAlert(username, type, message) {

		let date = Date().toString().split(" ")[4]

		// ALERT PROPERTY
		let alert = null
		alert = document.createElement("div")
		alert.className = "alert " + type

		// ALERT CONTENT FORMATING
		let HTMLcontent = ""
		
		// 1. ICON
		if (type == "Subscribed")   {HTMLcontent += '<div class="icon"><i class="fas fa-star"></i></div>'}
		if (type == "Followed")	   	{HTMLcontent += '<div class="icon"><i class="fas fa-heart"></i></div>'}
		if (type == "Hosted")  		{HTMLcontent += '<div class="icon"><i class="fas fa-play"></i></div>'}
		if (type == "Cheered")		{HTMLcontent += '<div class="icon"><i class="fas fa-dollar-signy"></i></div>'}

		// 2. CONTENT
		if (type == "Subscribed")   {HTMLcontent += '<p><span class="username">' + username + '</span> is now <span class="type">subscribed</span> to the channel!</p>'}
		if (type == "Followed")   	{HTMLcontent += '<p><span class="username">' + username + '</span> is now <span class="type">following</span> the channel!</p>'}
		if (type == "Hosted")  		{HTMLcontent += '<p><span class="username">' + username + '</span> is now <span class="type">hosting</span> the channel!</p>'}
		if (type == "Cheered")		{HTMLcontent += '<p><span class="username">' + username + '</span> <span class="type">cheered</span> [' + message + ']</p>'}
		
		// ALERT DISPLAY
		alert.innerHTML = HTMLcontent
		document.getElementById("messages").appendChild(alert)

		// AUTOSCROLLER
		if ((document.getElementById("messages").scrollTop + document.getElementById("messages").clientHeight + 500) >= (document.getElementById("messages").scrollHeight)) {
			alert.scrollIntoView()
		}

		// AUTODELETE
		let messages = document.getElementsByClassName("message")
		if (messages.length > 1000) {messages[0].remove()}

	}


	/**
	 * Updates the Chatters List
	 * 
	 * @param {any} chatters 
	 */
	setChattersList(chatters) {

		let count = 0
		let moderatorsList = document.getElementById("moderatorsList")
		let viewersList = document.getElementById("viewersList")

		moderatorsList.innerHTML = ""
		viewersList.innerHTML = ""

		chatters.chatters.moderators.forEach((moderator) => {
			let li = document.createElement("li")
			li.innerHTML = moderator

			moderatorsList.append(li)
		})

		chatters.chatters.viewers.forEach((viewer) => {
			if (count++ < 1000)
			{
				let li = document.createElement("li")
				li.innerHTML = viewer
				viewersList.append(li)
			}
		})

	}

	/**
	 * Updates the #viewersCount element
	 * 
	 * @param {any} viewers 
	 */
	setViewersCount(count) {
		document.getElementById("viewersCount").innerHTML = count
	}


	/**
	 * Updates the #followersCount element
	 * 
	 * @param {any} count 
	 */
	setFollowersCount(count) {
		document.getElementById("followersCount").innerHTML = count
	}
}
