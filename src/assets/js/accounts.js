// TrashCHAT - ACCOUNTS
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




// ****************************************************************************************************
// STEP 01 - Check if TrashCHAT already has Account(s) saved
// If the user hasn't added an account yet, we redirect him to the Login Page
// ****************************************************************************************************

if (AccountsManager.accounts.length === 0) {

    window.location.href = `login.html`

    throw new Error(`[SYSTEM] - Redirecting User to Login Page`)

}

// ****************************************************************************************************
// STEP 02 - Loop through Accounts
// ****************************************************************************************************

AccountsManager.accounts.forEach((Account) => {

    // ****************************************************************************************************
    // STEP 01 - Create new HTMLElement
    // ****************************************************************************************************

    let account = document.createElement('div')
    account.id = `${Account.username}`
    account.className = `account`
    account.innerHTML = `<h2>${Account.username}</h2>`


    // ****************************************************************************************************
    // STEP 02 - Append new HTMLElement
    // ****************************************************************************************************

    document.querySelector(`#list`).appendChild(account)

    // ****************************************************************************************************
    // STEP 03 - Check the Account
    // ****************************************************************************************************

    Account.check().then().catch((e) => {

        account.className = `account error`

    })

    // ****************************************************************************************************
    // STEP 04 - Setting-up Events
    // ****************************************************************************************************

    account.addEventListener(`click`, (e) => {

        // ****************************************************************************************************
        // EVENT - Modal - Warns the user
        // ****************************************************************************************************

        document.querySelector(`#modal-account-delete-content`).innerHTML = `This action will delete the Account ${Account.username}`
        document.querySelector(`#btnDeleteAccount`).innerHTML = `Delete ${Account.username}`
        document.querySelector(`#selectedAccount`).value = Account.username

        $UI.toggleModal(`modal-account-delete`)

    })

})


// ****************************************************************************************************
// STEP 02 - Setting-up Events
// ****************************************************************************************************

document.querySelector(`#btnDeleteAccount`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Modal - Confirm user deletion
    // ****************************************************************************************************

    let username = document.querySelector(`#selectedAccount`).value

    AccountsManager.deleteAccount(username)
    AccountsManager.saveAccounts()

    $UI.toggleModal(`modal-account-delete`)

    document.querySelector(`#${username}`).remove()

})

document.querySelector(`#btnDimissAccountDelete`).addEventListener(`click`, (e) => {

    // ****************************************************************************************************
    // EVENT - Modal - Abort user deletion
    // ****************************************************************************************************

    $UI.toggleModal(`modal-account-delete`)

})
