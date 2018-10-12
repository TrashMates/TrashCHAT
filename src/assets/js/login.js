// TrashCHAT - LOGIN
// VERSION: V3.10
// AUTHOR: TiCubius


// ****************************************************************************************************
// STEP 00 - Load modules and data
// ****************************************************************************************************

const $AccountsManager = require(`./assets/js/class/AccountsManager.js`)
const $Account = require(`./assets/js/class/Account.js`)
const $UI = require(`./assets/js/class/UI.js`)

let AccountsManager = new $AccountsManager()
AccountsManager.loadAccounts()

let isLoggingIn = false




// ****************************************************************************************************
// STEP 01 - Setting-up Events
// ****************************************************************************************************

document.querySelector(`#btnDismissAccountExists`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Modal - Dismissing Existing Account warning
    // ****************************************************************************************************

    e.preventDefault()

    $UI.toggleModal(`modal-account-exists`)

})


document.querySelector(`#btnDismissAccountInvalid`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Modal - Dismissing Invalid Account warning
    // ****************************************************************************************************

    e.preventDefault()

    $UI.toggleModal(`modal-account-invalid`)

})


document.querySelector(`#btnAddNewAccount`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Modal - Adding a new Account
    // ****************************************************************************************************

    console.debug(`[WEBPAGE] - Resetting Login Form and reloading Accounts File`)

    e.preventDefault()

    // ****************************************************************************************************
    // STEP 01 - Hiding the Modal
    // ****************************************************************************************************

    $UI.toggleModal(`modal-account-connected`)

    // ****************************************************************************************************
    // STEP 02 - Resetting the Input values
    // ****************************************************************************************************

    document.querySelector(`#username`).value = ``
    document.querySelector(`#password`).value = ``

    // ****************************************************************************************************
    // STEP 03 - Reloading the Accounts File
    // ****************************************************************************************************

    AccountsManager.loadAccounts()

})


document.querySelector(`#btnLogin`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Login - Trying to login into a Twitch Account
    // ****************************************************************************************************

    console.debug(`[WEBPAGE] - Trying to logging in an Account...`)

    e.preventDefault()

    // ****************************************************************************************************
    // STEP 01 - Check if we're already trying to login
    // ****************************************************************************************************

    if (isLoggingIn) {

        console.error(`[WEBPAGE] - Already trying to logging in an Account`)

        return

    }

    // ****************************************************************************************************
    // STEP 02 - Fetch data and quick check
    // ****************************************************************************************************

    let username = document.querySelector(`#username`).value
    let password = document.querySelector(`#password`).value

    if (username === "" || password === "") {

        console.debug(`[WEBPAGE] - Invalid username or password`)

        $UI.toggleModal(`modal-account-invalid`)

        return

    }

    // Removing `oauth:` from the password as it is not mandatory for logging in the Twitch IRC Servers
    // and prevents us from checking the validity of the Token beforehand

    password = password.startsWith('oauth:') ? password.substr(6) : password

    // ****************************************************************************************************
    // STEP 03 - Check if the user is already registered
    // ****************************************************************************************************

    if (AccountsManager.findAccount(username) !== undefined) {

        console.debug(`[WEBPAGE] - Account is already registered`)

        $UI.toggleModal(`modal-account-exists`)

        return

    }

    // ****************************************************************************************************
    // STEP 04 - Check the new Account
    // ****************************************************************************************************

    isLoggingIn = true
    let Account = new $Account(username, password, [])

    Account.check().then(() => {

        // ****************************************************************************************************
        // STEP 05a - Save the new Account and redirect the user
        // ****************************************************************************************************

        console.debug(`[WEBPAGE] - Successfully logged in as ${username}`)

        isLoggingIn = false
        AccountsManager.createAccount(username, password, [])
        AccountsManager.saveAccounts()

        $UI.toggleModal(`modal-account-connected`)

    }, (e) => {

        // ****************************************************************************************************
        // STEP 05b - Warn the user about the error
        // ****************************************************************************************************

        console.error(`[WEBPAGE] - Could not login to the Account: ${username}`)
        console.error(e)

        isLoggingIn = false
        $UI.toggleModal(`modal-account-invalid`)

    })

})
