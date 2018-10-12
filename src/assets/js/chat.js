// TrashCHAT - chat
// VERSION: V3.10
// AUTHOR: TiCubius


const Axios = require('axios')

// Loading Accounts Manager
const $AccountsManager = new AccountsManager
$AccountsManager.load()



// Checking Accounts
if ($AccountsManager.accounts.length === 0) {
    window.location.href = 'login.html'
}

// ACCOUNTS
// - Logs in every accounts
$AccountsManager.accounts.forEach((account) => {
    account.login()
})



// EVENT: Click on addChannel Button
document.querySelector('#addChannelBtn').addEventListener('click', (e) => {

    e.stopPropagation()

    // Displaying Modal
    document.querySelector('#chat').className += ' blurred'
    document.querySelector('#addChannel').className = "addChannel"

})

// EVENT: Click on connectChannel Button
document.querySelector('#connectToChannelBtn').addEventListener('click', (e) => {
    e.preventDefault()

    let username = document.querySelector('#accounts').value
    let channel = document.querySelector('#channel').value

    if (username !== 'Select an account' && channel !== '') {

        document.querySelector('#accounts').value = 'Select an account'
        document.querySelector('#channel').value = ''

        $AccountsManager.findAccount(username).addChannel(channel)
        $AccountsManager.save()

        // Removing addChannel Modal
        document.querySelector('#chat').className = 'chat'
        document.querySelector('#addChannel').className = 'addChannel hidden'

    }
    
})

// EVENT: Click outside of Modals
document.querySelector('#chat').addEventListener('click', (e) => {

    e.stopPropagation()

    // Removing addChannel Modal
    document.querySelector('#chat').className = 'chat'
    document.querySelector('#addChannel').className = 'addChannel hidden'

})



// TABS: Scroll between chats
document.querySelector('#tabs').addEventListener('mousewheel', function(e) {

    this.scrollLeft += (2* e.deltaY)

}, {passive: true})



// DATA: Refresh Channel's Data
setInterval(() => {

    let Account = ($AccountsManager.findActiveAccount())
    let channel = (Account.currentChannel.startsWith('#')) ? Account.currentChannel.substr(1) : Account.currentChannel

    if (channel !== null) {

        console.debug(`[DEBUG] - Webpage - Fetching ${channel}'s informations`)
        
        Axios.get(`https://api.twitch.tv/helix/streams?user_login=${channel}`, {
            'headers': {
                'Authorization': `Bearer ${Account.password}`
            }
        }).then((data) => {

            console.log(data)

            // data var (axios) -> data content (fetched JSON data) -> data content (twitch API)
            if (data.data.data.length === 0) {
                UI.setViewersCount('OFFLINE')
            } else {
                UI.setViewersCount(data.data.viewer_count)
            }

        }).catch((error) => {
            console.error(error)
        })
        
    }

}, 60000)
