// TrashCHAT - AccountsManager
// VERSION: V3.10
// AUTHOR: TiCubius


const fs = require(`fs`)
const fsPath = require(`fs-path`)
const async = require(`async`)
const electron = require('electron')
const Account = require(`./Account`)

module.exports = class AccountsManager
{

    /**
     * This class handles every interactions with the Accounts file and Accounts
     * such as creating, reading, updating and deleting
     */
    constructor()
    {

        this.accounts = []
        this.path = (electron.app || electron.remote.app).getPath('appData') + '/TrashCHAT/'

    }


    /**
     * Loads and reads the Accounts File into Memory
     */
    loadAccounts()
    {

        console.debug(`[MANAGER] - loadAccounts - Loading Account File`)

        try {

            // `/../../../` because there is 3 parents: assets, js and class
            let file = fs.readFileSync(this.path + `configs/accounts.json`)
            let accounts = JSON.parse(file).accounts

            accounts.forEach((account) => {
                this.createAccount(account.username, account.password, account.autoJoin)
            })

            console.debug(`[MANAGER] - loadAccounts - Successfully loaded ${this.accounts.length} Account(s)`)

        } catch (e) {

            console.error(`[MANAGER] - loadAccounts - Failed to load Account File`)
            console.error(e)

            fsPath.writeFileSync(this.path + `configs/accounts.json`, `{"accounts": []}`)
            setTimeout(() => {this.loadAccounts}, 200)

        }

    }

    /**
     * Saves every Account from Memory to the Account File
     */
    saveAccounts()
    {
        console.debug(`[MANAGER] - saveAccounts - Saving ${this.accounts.length} account(s)`)

        try {

            // Reading Settings File
            let file = fs.readFileSync(this.path + `configs/accounts.json`)
            let settings = JSON.parse(file)

            // Resetting all Accounts
            settings.accounts = []

            // Recreating all Accounts
            this.accounts.forEach((account) => {
                settings.accounts.push({
                    "username": account.username,
                    "password": account.password,
                    "autoJoin": account.autoJoin
                })
            })

            // Saving new Settings File
            fsPath.writeFileSync(this.path + `configs/accounts.json`, JSON.stringify(settings, null, 4))

            console.debug(`[MANAGER] - saveAccounts - Successfully saved ${this.accounts.length} account(s)`)

        } catch(e) {

            console.error(`[ERROR] - AccountManager@save - Exception while saving the Settings File`)
            console.error(e)

        }

    }



    /**
     * Checks every Account loaded in Memory
     * @returns {Promise} Promise
     */
    checkAccounts()
    {
        console.debug(`[MANAGER] - checkAccounts - Checking Accounts`)

        return new Promise((resolve, reject) => {

            async.eachSeries(this.accounts, (Account, callback) => {

                Account.check().then((response) => {

                    console.debug(`[MANAGER] - checkAccounts - Successfully checked the Account: ${Account.username}`)
                    callback()

                }).catch((e) => {

                    console.error(`[MANAGER] - checkAccounts - Failed to check the Account: ${Account.username}`)
                    console.error(e)

                    callback(`[MANAGER] - checkAccounts - Failed to check the Account: ${Account.username}`)

                })

            }, (e) => {

                if (e) {reject(e)}
                else {resolve()}

            })

        })

    }



    /**
     * Searches an Account by its username from the loaded Accounts
     * @param {string} username
     * @returns {Account} Account
     */
    findAccount(username)
    {

        return this.accounts.find(function(account) {
            return (account.username === username)
        })

    }

    /**
     * Searches an Account by its username from the loaded Accounts
     * @param {string} username
     * @returns {Account} Account
     */
    findAccountIndex(username)
    {

        return this.accounts.findIndex(function(account) {
            return (account.username === username)
        })

    }


    /**
     * Creates an new Account and saves it in our loaded Accounts
     * @param {string} username
     * @param {string} password
     * @param {Array<string>} channels
     */
    createAccount(username, password, channels)
    {

        if (this.findAccount(username) === undefined) {

            console.debug(`[MANAGER] - createAccount - new Account: ${username}`)
            this.accounts.push(new Account(username, password, channels))

        }

    }

    /**
     * Deletes an Account from our loaded Accounts
     *
     * @param {string} username
     */
    deleteAccount(username)
    {
        let accountIndex = this.findAccountIndex(username)

        if (accountIndex !== -1) {

            console.log(`[MANAGER] - deleteAccount - deleted Account: ${username}`)
            this.accounts.splice(accountIndex, 1)

        }
    }

}
