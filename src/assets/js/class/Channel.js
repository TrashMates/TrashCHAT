// TrashCHAT - Channel
// VERSION: V3.14
// AUTHOR: TiCubius


const axios = require(`axios`)

module.exports = class Channel
{

    /**
     * This class handles everything regarding a Twitch Channel
     * such as fetching chatters list or sending messages
     *
     * @param {string} name
     * @param {string} oauth
     */
    constructor(name, oauth)
    {
        this.id = null

        this.name = name
        this.oauth = oauth
        this.currentChatters = []
        this.chatters = []

        this.followers = []

        this.fetchInformations()
    }


    /**
     * Fetches informations on this channel, such as its id
     */
    fetchInformations()
    {

        axios.get(`https://api.twitch.tv/helix/users/?login=${this.name}`, {
            'headers': {
                'Authorization': `Bearer ${this.oauth}`
            }
        }).then((response) => {

            console.debug(`[CHANNEL] - fetchInformations - Successfully fetched ${this.name}'s informations`)
            this.id = response.data.data[0].id

        }).catch((e, a) => {

            console.error(`[CHANNEL] - Failed to fetch ${this.name}'s informations.`)
            console.error(e)

        })

    }


    /**
     * Fetches the 25 latest followers and the followers count from the Twitch API
     *
     * @returns {Promise} Promise
     */
    fetchFollowers()
    {

        return new Promise((resolve, reject) => {

            axios.get(`https://api.twitch.tv/helix/users/follows?to_id=${this.id}&first=100`, {
                'headers': {
                    'Authorization': `Bearer ${this.oauth}`
                }
            }).then((response) => {

                console.debug(`[CHANNEL] - fetchFollowers - ${this.name} has ${String(response.data.total).split(/(?=(?:...)*$)/).join(' ')} follower(s)`)
                resolve(response.data)

            }).catch((e, a) => {


                console.error(`[CHANNEL] - Failed to fetch ${this.name}'s followers.`)
                console.error(e)

                reject(e)

            })

        })

    }

    /**
     * Fetches the 25 latest followers and the followers count from the Twitch API
     *
     * @returns {Promise} Promise
     */
    fetchStream()
    {

        return new Promise((resolve, reject) => {

            axios.get(`https://api.twitch.tv/helix/streams?user_id=${this.id}`, {
                'headers': {
                    'Authorization': `Bearer ${this.oauth}`
                }
            }).then((response) => {

                if (response.data.data.length === 1) {
                    let stream = response.data.data[0]

                    console.debug(`[CHANNEL] - fetchStream - ${this.name}'s stream has ${String(stream.viewer_count).split(/(?=(?:...)*$)/).join(' ')} viewers(s)`)
                    resolve(stream)

                } else {

                    console.debug(`[CHANNEL] - fetchStream - ${this.name}'s stream is offline`)
                    resolve({'viewer_count': 'OFFLINE'})

                }

            }).catch((e, a) => {


                console.error(`[CHANNEL] - Failed to fetch ${this.name}'s stream.`)
                console.error(e)

                reject(e)

            })

        })

    }



    /**
     * Fetches all chatters on this Channel
     *
     * @returns {Promise} Promise
     */
    fetchChatters()
    {

        return new Promise((resolve, reject) => {

            axios.get(`http://tmi.twitch.tv/group/user/${this.name.toLowerCase()}/chatters`).then((response) => {

                console.debug(`[CHANNEL] - fetchChatters - ${this.name}'s stream has ${String(response.data.chatter_count).split(/(?=(?:...)*$)/).join(' ')} chatters(s)`)

                let chatters = response.data.chatters
                resolve(chatters)

            }).catch((e, a) => {

                console.error(`[CHANNEL] - Failed to fetch ${this.name}'s chatters.`)
                console.error(e)

                reject(e)

            })

        })

    }

    /**
     * Adds the user into the chatterList
     * 
     * @param {string} username
     */
    addChatter(username)
    {

        if(!this.isInChatterList(username)) {
            this.currentChatters.push(username)
        }

    }

    /**
     * Checks weather or not that user has already chatted in this channel
     * 
     * @param {string} username 
     * @return {boolean}
     */
    isInChatterList(username)
    {
        return (this.currentChatters.indexOf(username) !== -1)
    }

    /**
     * Sets all users present in this Channel's chat
     * 
     * @param {object} chatters 
     */
    setChatters(chatters)
    {
        this.chatters = []
        
        chatters.admins.forEach((chatter) => {
            this.chatters.push(chatter)
        })
        chatters.global_mods.forEach((chatter) => {
            this.chatters.push(chatter)
        })
        chatters.moderators.forEach((chatter) => {
            this.chatters.push(chatter)
        })
        chatters.staff.forEach((chatter) => {
            this.chatters.push(chatter)
        })
        chatters.viewers.forEach((chatter) => {
            this.chatters.push(chatter)
        })
        chatters.vips.forEach((chatter) => {
            this.chatters.push(chatter)
        })
    }
}
