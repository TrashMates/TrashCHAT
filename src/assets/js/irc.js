// TrashCHAT - CHAT
// VERSION: V3.10
// AUTHOR: TiCubius


// ****************************************************************************************************
// STEP 00 - Load modules and data
// ****************************************************************************************************

const autoComplete = require("./assets/js/librairies/auto-complete.min.js")
const $AccountsManager = require(`./assets/js/class/AccountsManager.js`)
const $UI = require(`./assets/js/class/UI.js`)

let AccountsManager = new $AccountsManager()
AccountsManager.loadAccounts()




// ****************************************************************************************************
// STEP 01 - Managing Accounts
// ****************************************************************************************************

AccountsManager.accounts.forEach((Account) => {

    // ****************************************************************************************************
    // STEP 01 - Logging In Accounts
    // ****************************************************************************************************

    Account.login().then((account) => {

        // ****************************************************************************************************
        // STEP 01a - Adding Accounts
        // ****************************************************************************************************

        let option = document.createElement(`option`)
        option.value = `${account}`
        option.innerHTML = `${account}`

        document.querySelector(`#username`).appendChild(option)


        // ****************************************************************************************************
        // STEP 01b - Adding Events
        // ****************************************************************************************************

        Account.twitch.on(`join`, (channel, username, self) => {

            let Channel = Account.findChannel(channel)

            if (self && Channel !== -1) {
                $UI.addTab(Account, Channel)
                $UI.addChat(Account, Channel)
                $UI.addInput(Account, Channel)

                $UI.setActive(Account, Channel)
            }

        })

        Account.twitch.on(`message`, (channel, user, message, self) => {

            let Channel = Account.findChannel(channel)
            $UI.addMessage(Account, Channel, user, message)

        })

    }).catch((account) => {

        document.querySelector(`#account_username`).innerHTML = ` ${account}`
        $UI.toggleModal(`modal-account-error`)

    })

})

// ****************************************************************************************************
// STEP 02 - Setting-up Events
// ****************************************************************************************************

document.querySelector(`#tabs`).addEventListener(`mousewheel`, function (e) {

    // ****************************************************************************************************
    // EVENT - Webpage - Scrolling between tabs
    // ****************************************************************************************************

    this.scrollLeft += (2 * e.deltaY)

}, { passive: true })


document.querySelector(`#btnAddChannel`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Webpage - Connecting to a new Channel
    // ****************************************************************************************************

    $UI.toggleModal(`modal-channel-add`)

})


document.querySelector(`#btnDismissAddChannel`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Modal - Aborting connection to a new Channel
    // ****************************************************************************************************

    $UI.toggleModal(`modal-channel-add`)

    // ****************************************************************************************************
    // STEP 01 - Resetting Input values
    // ****************************************************************************************************

    document.querySelector(`#username`).value = `SELECT AN ACCOUNT`
    document.querySelector(`#channel`).value = ``

})


document.querySelector(`#btnDismissDataInvalid`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Modal - Submitted data is invalid
    // ****************************************************************************************************

    $UI.toggleModal(`modal-data-invalid`)

})


document.querySelector(`#btnDismissAccountInvalid`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Modal - Selected Account is invalid
    // ****************************************************************************************************

    $UI.toggleModal(`modal-account-invalid`)

})


document.querySelector(`#btnDismissChannelExists`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Modal - Submitted channel is already opened for this channel
    // ****************************************************************************************************

    $UI.toggleModal(`modal-channel-exists`)

})


document.querySelector(`#btnDismissAccountError`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Modal - Dismiss warning about an Account Error
    // ****************************************************************************************************

    $UI.toggleModal(`modal-account-error`)

})


document.querySelector(`#addEmote`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Webpage - Clicking on the Emote Add
    // ****************************************************************************************************

    $UI.toggleModal(`modal-emote-add`)

})


document.querySelector(`#btnDismissEmoteAdd`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - MODAL - Dismiss add Emote Modal
    // ****************************************************************************************************

    $UI.toggleModal(`modal-emote-add`)

})



document.querySelector(`#btnConnectToChannel`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Modal - Confirming connection to a new Channel
    // ****************************************************************************************************

    // ****************************************************************************************************
    // STEP 01 - Fetch data and format it
    // STEP 02 - Reset Input values
    // ****************************************************************************************************

    let username = document.querySelector(`#username`).value
    let channel = document.querySelector(`#channel`).value

    document.querySelector(`#username`).value = `SELECT AN ACCOUNT`
    document.querySelector(`#channel`).value = ``

    if (username === "" || channel === "") {

        console.debug(`[WEBPAGE] - Invalid Account or channel`)

        $UI.toggleModal(`modal-channel-add`)
        $UI.toggleModal(`modal-data-invalid`)

        return

    }

    if (channel.includes('twitch.tv')) {

        let url = new URL(channel)

        // Checking if the URL has sub-folders:
        // Either https://www.twitch.tv/trashmates/videos/clips/ | pathname: /trashmates/videos/clips/
        // Or     https://www.twitch.tv/trashmates               | pathname: /trashmates

        let nextSlash = url.pathname.indexOf('/', 1)
        if (nextSlash > 0) {
            channel = url.pathname.substring(1, nextSlash)
        } else {
            channel = url.pathname.substring(1)
        }

    }

    if (channel.startsWith('#')) {
        channel = channel.substr(1)
    }

    // ****************************************************************************************************
    // STEP 03 - Check if the Account is known
    // ****************************************************************************************************

    let Account = AccountsManager.findAccount(username)

    if (Account === undefined) {

        console.debug(`[WEBPAGE] - Account ${username} is invalid`)

        $UI.toggleModal(`modal-channel-add`)
        $UI.toggleModal(`modal-account-invalid`)

        return

    }

    // ****************************************************************************************************
    // STEP 04 - Check if the Channel is already in the AutoJoin list for this Account
    // STEP 05a - Add the channel in that Account's AutoJoin list
    // STEP 05b - Warn the user that this channel is already in that Account's AutoJoin list
    // ****************************************************************************************************

    if (!Account.addChannel(channel)) {

        console.debug(`[WEBPAGE] - #${channel} is already in ${username}'s AutoJoin list`)

        $UI.toggleModal(`modal-channel-add`)
        $UI.toggleModal(`modal-channel-exists`)

        return

    }

    // ****************************************************************************************************
    // STEP 06 - Joins Channel
    // ****************************************************************************************************

    Account.joinChannel(channel)

    // ****************************************************************************************************
    // STEP 07 - Save new Accounts File
    // ****************************************************************************************************

    AccountsManager.saveAccounts()

    // ****************************************************************************************************
    // STEP 08 - Close Modal
    // ****************************************************************************************************

    $UI.toggleModal(`modal-channel-add`)

})


document.addEventListener(`keydown`, (e) => {

    // ****************************************************************************************************
    // EVENT - DEV - Open dev tools
    // ****************************************************************************************************

    if (e.keyCode === 123) {
        require('electron').remote.getCurrentWindow().toggleDevTools();
    }

})

// ****************************************************************************************************
// STEP 03 - Setting-up Timers
// ****************************************************************************************************

setInterval(() => {

    let chat = document.querySelector(`.chat.active`)

    if (chat !== null) {

        let Account = AccountsManager.findAccount(chat.id.split(`-`)[1])
        let Channel = Account.findChannel(chat.id.split(`-`)[2])

        $UI.refreshUIInformations(Account, Channel)

    }

}, 60000)

// ****************************************************************************************************
// STEP 04 - Setting-up Emotes
// ****************************************************************************************************

$UI.fetchEmotes()
