// TrashCHAT - Account
// VERSION: V3.10
// AUTHOR: TiCubius


const axios = require(`axios`)
const Twitch = require(`twitch-js`)
const Channel = require('./Channel')

module.exports = class Account
{

    /**
     * This class handles everything regarding a Twitch Account
     * such as logging in/off, connecting to channels and sending messages
     *
     * @param {string} username
     * @param {string} password
     * @param {Array<String>} autoJoin
     */
    constructor(username, password, autoJoin)
    {
        this.username = username
        this.password = password
        this.autoJoin = autoJoin
        this.channels = []

        this.twitch = null
    }


    /**
     * When an Account is created, or when we try to login in the Account, we first need to make sure
     * that the provided username and password are still valid - especially as we're not using Twitch
     * Account password, but OAuth Token.
     * An OAuth Token may be revoked by the User or by Twitch, in which case we wouldn't be able to
     * login into the Twitch IRC Servers nor make Twitch API calls.
     *
     * @returns Promise
     */
    check()
    {

        console.debug(`[ACCOUNT] - check - Chekcing ${this.username}'s credentials`)

        return new Promise((resolve, reject) => {

            axios.get(`https://id.twitch.tv/oauth2/validate`,
                {"headers": {"Authorization": `OAuth ${this.password}`}
            }).then((response) => {

                if (response.data.login.toLowerCase() === this.username.toLowerCase()) {
                    resolve(response)
                } else {
                    reject(response)
                }

            }).catch(reject)

        })

    }

    /**
     * When logging in an Account, we will check the credentials before trying to login.
     * We will only login the Account if it's not already logged in (as in, the twitch variable of this
     * specific instance of Account is null).
     * Upon login, we need to set-up events that needs actions inside the class, allowing the automatic joining
     * of previously joined channels.
     *
     * @returns Promise
     */
    login()
    {

        console.debug(`[ACCOUNT] - login - Logging in ${this.username}'s Account`)

        return new Promise((resolve, reject) => {

            if (this.twitch === null) {

                // ****************************************************************************************************
                // STEP 01 - Setting-up Twitch-JS Client
                // ****************************************************************************************************

                this.twitch = Twitch.client({
                    'options': {
                        'debug': false
                    },
                    'connection': {
                        'secure': true
                    },
                    'identity': {
                        'username': this.username,
                        'password': this.password
                    }
                })

                // ****************************************************************************************************
                // STEP 02 - Setting-up Twitch-JS Events
                // ****************************************************************************************************

                this.twitch.on(`connected`, (e) => {

                    console.debug(`[ACCOUNT] - EVENT - ${this.username} is now connected`)

                    this.autoJoin.forEach((channel) => {
                        this.joinChannel(channel)
                    })

                    resolve(this.username)

                })

                this.twitch.on('disconnected', (e) => {

                    console.debug(`[ACCOUNT] - EVENT - ${this.username} is now disconnected`)

                })


                // ****************************************************************************************************
                // STEP 03 - Verifying the Account's credentials
                // STEP 04 - Connecting the Twitch-JS Client to the IRC Servers
                // ****************************************************************************************************

                this.check().then(() => {
                    this.twitch.connect()
                }).catch((e) => {

                    console.error(`[ACCOUNT] - login - Failed to login the Account ${this.username}`)
                    reject(this.username)

                })

            } else {
                reject(this.username)
            }

        })

    }

    /**
     * When logging off the Twitch IRC Servers, we will reset the twitch variable as to allow
     * logging in in the future.
     *
     * @returns {boolean} Boolean
     */
    logoff()
    {

        console.debug(`[ACCOUNT] - logoff - Logging off ${this.username}'s Account`)

        if (this.twitch !== null && this.twitch.readyState() === "OPEN") {

            this.twitch.disconnect()
            return true

        }

        return false

    }


    /**
     * This adds a Channel's name into our Auto Join list.
     * It won't make this Account join the channel
     * When logging in the Account, this channel will automatically be joined.
     *
     * @param {string} name
     * @returns {boolean} Boolean
     */
    addChannel(name)
    {

        console.debug(`[ACCOUNT] - addChannel - Adding Channel #${name} to ${this.username}'s auto-join list`)

        // ****************************************************************************************************
        // STEP 01 - Checking if the Channel is already in the auto join list
        // STEP 02 - Adding the channel into the auto join list
        // ****************************************************************************************************

        let channelIndex = this.autoJoin.findIndex(function(channel) {
            return (channel.toLowerCase() === name.toLowerCase())
        })

        if (channelIndex === -1) {

            this.autoJoin.push(name)
            return true

        }

        return false

    }

    /**
     * This removes a Channel's name from our Auto Join list.
     * It won't make this Account leave the Channel
     *
     * @param {string} name
     * @returns {boolean} Boolean
     */
    removeChannel(name)
    {

        console.debug(`[ACCOUNT] - removeChannel - Removing Channel #${name} from ${this.username}'s auto-join list`)

        // ****************************************************************************************************
        // STEP 01 - Checking if the channel is in the auto join list
        // STEP 02 - Removing the channel from the auto join list
        // ****************************************************************************************************

        let channelIndex = this.autoJoin.findIndex(function(channel) {
            return (channel.toLowerCase() === name.toLowerCase())
        })

        if (channelIndex !== -1) {

            this.autoJoin.splice(channelIndex, 1)
            return true

        }

        return false

    }

    /**
     * This will join the specified Channel
     *
     * @param {string} name
     * @returns {boolean} Boolean
     */
    joinChannel(name)
    {

        console.debug(`[ACCOUNT] - joinChannel - Joining #${name} from ${this.username}'s Account`)

        // ****************************************************************************************************
        // STEP 01 - Checking if the Account already joined this Channel
        // STEP 02 - Joining the Channel
        // ****************************************************************************************************

        let inChannel = this.channels.find(function(channel) {
            return (channel.name.toLowerCase() === name.toLowerCase())
        })

        if (inChannel === undefined) {

            let channel = new Channel(name, this.password)
            this.channels.push(channel)

            this.twitch.join(name)
            return true
        }

        return false

    }

    /**
     * This will leave the specified Channel
     * 
     * @param {Channel} Channel
     */
    leaveChannel(Channel)
    {

        console.debug(`[ACCOUNT] - leaveChannel - leaving #${Channel.name} from ${this.username}'s Account`)

        // ****************************************************************************************************
        // STEP 01 - Checking if the Account has joined this Channel
        // STEP 02 - Leaving the Channel
        // ****************************************************************************************************

        let inChannel = this.channels.find(function(channel) {
            return (channel.name.toLowerCase() === Channel.name.toLowerCase())
        })

        if (inChannel !== undefined) {

            this.twitch.leave(Channel.name)
            return true

        }

        return false

    }

    /**
     * This will search a Channel by its name among all the currently joined Channels
     *
     * @param {string} name
     * @returns {Channel|-1} Channel|-1
     */
    findChannel(name)
    {

        // ****************************************************************************************************
        // STEP 01 - Cleaning-up Channel's name
        // STEP 02 - Searching Channel among all joined Channels
        // ****************************************************************************************************

        name = name.startsWith('#') ? name.substr(1) : name

        return this.channels.find(function(channel) {
            return (channel.name.toLowerCase() === name.toLowerCase())
        })

    }


    /**
     * This will send a message to the specified Channel
     *
     * @param {Channel} channel
     * @param {string} message
     */
    sendMessage(Channel, message)
    {

        // ****************************************************************************************************
        // STEP 01 - Checking if we're connected
        // STEP 02 - Sending the message
        // ****************************************************************************************************

        if (this.twitch !== null && this.twitch.readyState() === "OPEN") {
            this.twitch.say(Channel.name, message)
        }

    }

}
