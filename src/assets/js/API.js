// TrashCHAT - API
// VERSION: 3.02
// AUTHOR: TiCubius <trashmates@protonmail.com>

module.exports = class API {

    /**
     * Creates an instance of API.
     */
    constructor()
    {
        this.apiUrl = settings.api.trashmates.url
        this.apiKey = settings.api.trashmates.key

        this.twitchUrl = settings.api.twitch.url
        this.twitchKey =  settings.api.twitch.key
        this.twitchUserid = settings.api.informations.channelid

        this.followers = []
    }


    /**
     * Retrives the user's data from our API
     *
     * @param {any} userid
     * @returns {Promise} Promise
     */
    fetchViewer(userid) {

        return new Promise((resolve, reject) => {

            request(this.apiUrl + "viewers/" + userid, {headers: {"token": this.apiKey}}, (errors, response, body) => {
                if (errors || response.statusCode != 200 || JSON.parse(body).hasOwnProperty("errors")) {
                    reject({"errors": "API: fetchViewer failed"})
                } else {
                    resolve(JSON.parse(body))
                }
            })

        })

    }


    /**
     * Retrives the list of chatters in a Twitch Stream
     *
     * @param {any} username
     * @returns {Promise} Promise
     */
    fetchChatters(username) {

        return new Promise((resolve, reject) => {

            request("https://tmi.twitch.tv/group/user/" + username.toLowerCase() + "/chatters", (errors, response, body) => {
                if (errors || response.statusCode != 200) {
                    reject({"errors": "API: fetchChatters failed"})
                } else {
                    resolve(JSON.parse(body))
                }
            })

        })

    }


    /**
     * Retrives the numbers of followers of a Twitch User, using the userid
     *
     * @param {any} userid
     * @returns {Promise} Promise
     */
    fetchFollowersCount(userid) {

        return new Promise((resolve, reject) => {

            request({uri: this.twitchUrl + "users/follows?first=1&to_id=" + userid, headers: {"Client-ID": this.twitchKey}}, (errors, response, body) => {
                if (errors || response.statusCode != 200) {
                    reject({"errors": "API: fetchFollowersCount failed"})
                } else {
                    resolve(JSON.parse(body).total)
                }
            })

        })

    }


    /**
     * Retrives the number of viewers currently watching a Twitch User, using the userid
     * 
     * @param {any} userid 
     * @returns {Promise.<Integer>} Promise
     */
    fetchViewersCount(userid) {

        return new Promise((resolve, reject) => {

            request({uri: this.twitchUrl + "streams/?user_id=" + userid, headers: {"Client-ID": this.twitchKey}}, (errors, response, body) => {
                if (errors || response.statusCode != 200) {
                    reject({"errors": "API: fetchViewersCount failed"})
                } else {
                    resolve(JSON.parse(body).data[0].viewer_count)
                }
            })

        })

    }


	/**
	 * GET - Fetch the 100 latest followers ID, from the Twitch API
	 */
	fetchLatestFollowersID() {

		return new Promise((resolve, reject) => {

			request(this.twitchUrl + "users/follows?first=100&to_id=" + this.twitchUserid, {method: "GET", headers: {"Client-ID": this.twitchKey}}, (errors, response, body) => {

				if (errors || response.statusCode != 200) {
					reject({"errors": "Twitch API: Fetch Latest Followers ID failed"})
				} else {
					resolve(JSON.parse(body).data)
				}

			})

		})

    }
    

    /**
	 * GET - Fetch the 100 latest followers informations, from the Twitch API
	 */
	fetchLatestFollowers() {

		return new Promise((resolve, reject) => {

			this.fetchLatestFollowersID().then((followers) => {

				let url = this.twitchUrl + "users/?id="
				followers.forEach((follower) => {
					if (this.followers.indexOf(follower.from_id) < 0) {
						this.followers.push(follower.from_id)

						url += follower.from_id + "&id="
					}
				})

				// We make a GET request to the Twitch API if the generated url
				// looks like https://twitch.tv/helix/users/?id=XXX,&id=
				// (and we remove the last 4 chars)
				let generated_url = url.slice(0, -4)

				if (generated_url != this.twitchUrl + "users/") {
					request(generated_url, {method: "GET", headers: {"Client-ID": this.twitchKey}}, (errors, response, body) => {

						if (errors || response.statusCode != 200) {
							reject({"errros": "Twitch API: Fetch Latest Followers failed"})
						} else {
							resolve(JSON.parse(body).data)
						}

					})
				}

			}).catch((errors) => {
                console.log(" - " + "ERROR WHILE FETCHING LATEST FOLLOWERS ID")
                console.error(errors)
			})

		})

	}

}
