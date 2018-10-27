// TrashCHAT - UI
// VERSION: V3.10
// AUTHOR: TiCubius


const axios = require(`axios`)
let autoCompleteList = ["/help", "/w", "/me", "/disconnect", "/mods", "/color", "/commercial", "/mod", "/unmod", "/ban", "/unban", "/timeout", "/untimeout", "/slow", "/slowoff", "/r9kbeta", "/r9kbetaoff", "/emoteonly", "/emoteonlyoff", "/clear", "/subscribers", "/subscribersoff", "/followers", "/followersoff", "/host", "/unhost", "/marker"];

module.exports = class UI
{

    /**
     * Displays the given Modal and blurs the background
     *
     * @static
     * @param {string} id
     */
    static toggleModal(id)
    {
        let container = document.querySelector(`.js-container`)
        let modal = document.querySelector(`#${id}`)


        if (container.className.includes(`blurred`)) {

            // ****************************************************************************************************
            // Modal is already opened
            // ****************************************************************************************************

            container.className = `js-container`
            modal.className = `modal hidden`

        } else {

            // ****************************************************************************************************
            // Modal is not opened
            // ****************************************************************************************************

            container.className = `js-container blurred`
            modal.className = `modal`

        }
    }


    /**
     * Creates a new Tab for an Account and a Channel
     *
     * @static
     * @param {Account} Account
     * @param {Channel} Channel
     */
    static addTab(Account, Channel)
    {

        let container = document.querySelector(`#tabs`)

        // ****************************************************************************************************
        // Generate HTMLElement
        // ****************************************************************************************************

        let tab = document.createElement(`div`)
        tab.id = `tab-${Account.username}-${Channel.name}`
        tab.className = `tab`
        tab.innerHTML = `<h2>${Account.username} - #${Channel.name}</h2>`

        // ****************************************************************************************************
        // Append HTMLElement
        // ****************************************************************************************************

        container.appendChild(tab)

        // ****************************************************************************************************
        // Add Events
        // ****************************************************************************************************

        tab.addEventListener(`mousedown`, (e) => {

            e.preventDefault()

            // Middle Mouse Button
            if (e.which === 2) {

                Account.removeChannel(Channel.name)
                AccountsManager.saveAccounts()

                tab.remove()
                document.querySelector(`#chat-${Account.username}-${Channel.name}`).remove()
                document.querySelector(`#input-${Account.username}-${Channel.name}`).remove()

                return
            }

            this.setActive(Account, Channel)
            this.refreshUIInformations(Account, Channel)
        })

    }

    /**
     * Creates a new Chat for an Account and a Channel
     *
     * @static
     * @param {Account} Account
     * @param {Channel} Channel
     */
    static addChat(Account, Channel)
    {

        let container = document.querySelector(`#chats`)

        // ****************************************************************************************************
        // Generate HTMLElement
        // ****************************************************************************************************

        let chat = document.createElement(`div`)
        chat.id = `chat-${Account.username}-${Channel.name}`
        chat.className = `chat`

        // ****************************************************************************************************
        // Append HTMLElement
        // ****************************************************************************************************

        container.appendChild(chat)

    }

    /**
     * Creates a new Input for an Account and a Channel
     *
     * @static
     * @param {Account} Account
     * @param {Channel} Channel
     */
    static addInput(Account, Channel)
    {

        let container = document.querySelector(`#inputs`)

        // ****************************************************************************************************
        // Generate HTMLElement
        // ****************************************************************************************************

        let input = document.createElement(`input`)
        input.id = `input-${Account.username}-${Channel.name}`
        input.name = `input-${Account.username}-${Channel.name}`
        input.className = `input`
        input.type = `text`
        input.placeholder = `Send a message to #${Channel.name} as ${Account.username}`

        // ****************************************************************************************************
        // Append HTMLElement
        // ****************************************************************************************************

        container.appendChild(input)

        // ****************************************************************************************************
        // Adding Events
        // ****************************************************************************************************

        input.addEventListener('keyup', (e) => {

            if ((e.keyCode === 13) && (input.value !== '')) {
                e.preventDefault()

                Account.sendMessage(Channel, input.value)
                input.value = ''
            }

        })


        // ****************************************************************************************************
        // Setting-up autocomplete
        // ****************************************************************************************************
        
        new autoComplete({
            selector: `input[name="input-${Account.username}-${Channel.name}"]`,
            minChars: 2,
            offsetTop: -250,
            source: function (term, suggest) {
                let choices = autoCompleteList
                let matches = []
                term = term.toLowerCase()

                // Chatters
                if (term[0] === `@`) {
                    for (let i = 0; i < Channel.chatters.length; i++) {
                        if (Channel.chatters[i].toLowerCase().indexOf(term.substr(1)) !== -1) {
                            matches.push(`@${Channel.chatters[i]}`)
                        }

                    }
                }

                // Others
                for (let i = 0; i < choices.length; i++) {
                    if (choices[i].toLowerCase().indexOf(term) !== -1) {
                        matches.push(choices[i])
                    }
                }

                suggest(matches);
            }
        })

    }


    /**
     * Sets the status foreach tabs, chats and inputs
     *
     * @static
     * @param {Account} Account
     * @param {Channel} Channel
     */
    static setActive(Account, Channel)
    {

        // ****************************************************************************************************
        // Reset status
        // ****************************************************************************************************

        document.querySelector(`#tabs`).childNodes.forEach((tab) => {
            tab.className = `tab`
        })

        document.querySelector(`#chats`).childNodes.forEach((chat) => {
            chat.className = `chat`
        })

        document.querySelector(`#inputs`).childNodes.forEach((input) => {
            if (input.type === 'text') {
                input.className = `input`
            }
        })

        // ****************************************************************************************************
        // Sets status
        // ****************************************************************************************************

        let tab = document.querySelector(`#tab-${Account.username}-${Channel.name}`)
        let chat = document.querySelector(`#chat-${Account.username}-${Channel.name}`)
        let input = document.querySelector(`#input-${Account.username}-${Channel.name}`)

        tab.className += ` active`
        chat.className += ` active`
        input.className += ` active`

        // ****************************************************************************************************
        // Scroll
        // ****************************************************************************************************

        if (chat.childNodes.length >= 1) {
            chat.lastChild.scrollIntoView({behavior: 'smooth', block: 'start'})
        }

        // ****************************************************************************************************
        // Refresh UI Informations
        // We want to refresh chatters, followers and viewers if the tab is still active after .5 seconds
        // (When logging in an account, it is possible that multiples tabs are opened at the same time. We
        // only want the latest one. Opening new tab is fast, so a .5 seconds delay should be more than enough)
        // ****************************************************************************************************

        setTimeout(() => {

            if (tab.className.includes(`active`)) {
                this.refreshUIInformations(Account, Channel)
            }
        }, 500)


    }


    /**
     * Formats the text to add emotes
     * https://github.com/twitch-apis/twitch-js/blob/master/docs/UsefulFunctions.md
     *
     * @static
     * @param {string} text
     * @param {Object} emotes
     * @returns {string}
     */
    static formatMessage(text, emotes)
    {
        let splitText = text.split('')

        for (let i in emotes) {
            let e = emotes[i]

            for (let j in e) {
                let mote = e[j]

                if (typeof mote == 'string') {
                    mote = mote.split('-')
                    mote = [parseInt(mote[0]), parseInt(mote[1])]

                    let length = mote[1] - mote[0]
                    let empty = Array.apply(null, new Array(length + 1)).map(function() {
                        return ''
                    })

                    splitText = splitText
                        .slice(0, mote[0])
                        .concat(empty)
                        .concat(splitText.slice(mote[1] + 1, splitText.length))

                    splitText.splice(mote[0], 1, '<img class="emoticon" width="28px" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">')
                }
            }
        }

        return splitText.join('')
    }

      /**
     * Visually adds a Message for this Account and Channel
     *
     * @static
     * @param {Account} Account
     * @param {Channel} Channel
     * @param {Object} user
     * @param {string} message
     */
    static addMessage(Account, Channel, user, content)
    {

        let container = document.querySelector(`#chat-${Account.username}-${Channel.name}`)

        // ****************************************************************************************************
        // Generate Icon
        // ****************************************************************************************************

        let icon = ``
        if (user.mod)             {icon = `<div class="icon"><i class="fas fa-check"></i></div>`}
        else if (user.subscriber) {icon = `<div class="icon"><i class="fas fa-star"></i></div>`}

        let firstMessage = ""
        if (!Channel.isInChatterList(user['display-name'])) {
            
            firstMessage = "first"
            Channel.addChatter(user["display-name"])

        }
        
        // ****************************************************************************************************
        // Generate HTMLElement
        // ****************************************************************************************************

        let message = document.createElement(`div`)
        message.className = `message`
        message.innerHTML =
        `
            <div class="header ${firstMessage}">
                ${icon}
                <span class="username">${user['display-name']}</span>
                <span class="date">${Date().toString().split(" ")[4]}</span>
            </div>
            <div class="content">
                <p>${this.formatMessage(content, user.emotes)}</p>
            </div>
        `

        // ****************************************************************************************************
        // Append HTMLElement
        // ****************************************************************************************************

        container.appendChild(message)

        // ****************************************************************************************************
        // Manage old messages
        // ****************************************************************************************************

        if (container.childNodes.length >= 500) {
            container.childNodes[0].remove()
        }

        // ****************************************************************************************************
        // Check auto scroll
        // ****************************************************************************************************

        if (container.className.includes('active')) {

            if ((container.scrollTop + container.clientHeight + 250) >= (container.scrollHeight)) {
                message.scrollIntoView({behavior: 'smooth', block: 'start'})
            }

        }
    }


    /**
     * Sets the numbers of the followers for this Channel
     *
     * @static
     * @param {String} count
     */
    static setFollowersCount(count)
    {
        document.querySelector(`#followersCount`).innerHTML = count
    }

    /**
     * Sets the numbers of the viewers for this Channel
     *
     * @static
     * @param {String} count
     */
    static setViewersCount(count)
    {
        document.querySelector(`#viewersCount`).innerHTML = count
    }

    /**
     * Sets the chatters list in the sidebar
     * 
     * @param {Object} chatters 
     * @param {Channel} channel
     */
    static setChatters(chatters, Channel)
    {

        let tempHTML = ``
        let counter = 0

        let staff = document.querySelector(`#staff`)
        let moderators = document.querySelector(`#moderators`)
        let vips = document.querySelector(`#vips`)
        let viewers = document.querySelector(`#viewers`)
        let loader = document.querySelector(`#loader`)

        Channel.setChatters(chatters)

        // ****************************************************************************************************
        // STEP 01 - Display loader
        // ****************************************************************************************************

        loader.className = `loader`

        // ****************************************************************************************************
        // STEP 02 - Updating Twitch Staff
        // ****************************************************************************************************

        tempHTML = ``

        staff.innerHTML = ``
        chatters.staff.forEach((chatter) => {
            tempHTML += `<li>${chatter}</li>`
        })

        chatters.admins.forEach((chatter) => {
            tempHTML += `<li>${chatter}</li>`
        })

        chatters.global_mods.forEach((chatter) => {
            tempHTML += `<li>${chatter}</li>`
        })

        staff.innerHTML = tempHTML

        // ****************************************************************************************************
        // STEP 03 - Updating Moderators
        // ****************************************************************************************************

        tempHTML = ``

        moderators.innerHTML = ``
        chatters.moderators.forEach((chatter) => {            
            tempHTML += `<li>${chatter}</li>`
        })

        moderators.innerHTML = tempHTML

        // ****************************************************************************************************
        // STEP 04 - Updating Viewers
        // ****************************************************************************************************

        tempHTML = ``

        viewers.innerHTML = ``
        chatters.viewers.forEach((chatter) => {

            if (counter < 1000) {
                tempHTML += `<li>${chatter}</li>`
                counter++
            }
        })

        viewers.innerHTML = tempHTML

        tempHTML = ``

        vips.innerHTML = ``
        chatters.vips.forEach((chatter) => {
            tempHTML += `<li>${chatter}</li>`
        })

        vips.innerHTML = tempHTML

        // ****************************************************************************************************
        // STEP 05 - Hiding / Showing lists
        // ****************************************************************************************************

        document.querySelector(`.staff`).className = `staff`
        if (staff.innerHTML === ``) {
            document.querySelector(`.staff`).className += ` hidden`
        }

        document.querySelector(`.moderators`).className = `moderators`
        if (moderators.innerHTML === ``) {
            document.querySelector(`.moderators`).className += ` hidden`
        }

        document.querySelector(`.vips`).className = `vips`
        if (vips.innerHTML === ``) {
            document.querySelector(`.vips`).className += ` hidden`
        }

        document.querySelector(`.viewers`).className = `viewers`
        if (viewers.innerHTML === ``) {
            document.querySelector(`.viewers`).className += ` hidden`
        }

        // ****************************************************************************************************
        // STEP 06 - Hiding loader
        // ****************************************************************************************************

        loader.className = `loader hidden`
    }


    /**
     * Refreshes all the informations displayed on the chat UI for an Account and a Channel
     *
     * @static
     * @param {Account} Account
     * @param {Channel} Channel
     */
    static refreshUIInformations(Account, Channel)
    {
        // ****************************************************************************************************
        // STEP 01 - Update followers count
        // ****************************************************************************************************

        Channel.fetchFollowers().then((data) => {

            let count = String(data.total).split(/(?=(?:...)*$)/).join(' ')
            this.setFollowersCount(count)

        }).catch(console.error)


        // ****************************************************************************************************
        // STEP 02 - Update viewers count
        // ****************************************************************************************************

        Channel.fetchStream().then((data) => {

            let count = (data.viewer_count === 'OFFLINE') ? 'OFFLINE' : String(data.viewer_count).split(/(?=(?:...)*$)/).join(' ')
            this.setViewersCount(count)

        }).catch(console.error)


        // ****************************************************************************************************
        // STEP 02 - Update chatters list
        // ****************************************************************************************************

        Channel.fetchChatters().then((data) => {

            this.setChatters(data, Channel)

        }).catch(console.error)
    }


    /**
     * Fetches all thee Emotes from Twitch
     *
     * @static
     */
    static fetchEmotes()
    {
        axios.get(`https://twitchemotes.com/api_cache/v3/global.json`).then((data) => {

            let container = document.querySelector(`#emotesList`)

            for (let emote in data.data) {
                let e = document.createElement(`img`)
                e.src = `https://static-cdn.jtvnw.net/emoticons/v1/${data.data[emote].id}/3.0`

                container.appendChild(e)

                // Add to autocomplete
                autoCompleteList.push(data.data[emote].code)

                // Click on an emote to add it
                e.addEventListener(`click`, (e) => {
                    document.querySelector(`#inputs`).childNodes.forEach((input) => {
                        if (input.className.includes(`active`)) {
                            input.value += ` ${data.data[emote].code}`
                        }
                    })

                    this.toggleModal(`modal-emote-add`)
                })
            }

        }).catch((e) => {
            console.error(e)
        })
    }
}
