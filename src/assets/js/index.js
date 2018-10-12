"use strict";

// TrashCHAT - INDEX
// VERSION: V3.10
// AUTHOR: TiCubius


// ****************************************************************************************************
// STEP 00 - Load modules and data
// ****************************************************************************************************

var $AccountsManager = require("./assets/js/class/AccountsManager.js");
var $UI = require("./assets/js/class/UI.js");

var AccountsManager = new $AccountsManager();
AccountsManager.loadAccounts();

// ****************************************************************************************************
// STEP 01 - Setting-up Events
// ****************************************************************************************************

document.querySelector("#btnDismissConnectionError").addEventListener("click", function (e) {

    // ****************************************************************************************************
    // EVENT - Modal - Dismissing Existing Account warning
    // ****************************************************************************************************

    $UI.toggleModal("modal-connection-error");

});

// ****************************************************************************************************
// STEP 02 - Check if the user is connected to the Internet
// If the user is not currently connected, we stop the script here and show an error message
// ****************************************************************************************************

if (!navigator.onLine) {

    $UI.toggleModal("modal-connection-error");

    throw new Error("[WEBPAGE] - User is currently offline");

}

// ****************************************************************************************************
// STEP 03 - Check if TrashCHAT already has Account(s) saved
// If the user hasn't added an account yet, we redirect him to the Login Page
// ****************************************************************************************************

if (AccountsManager.accounts.length === 0) {

    window.location.href = "login.html";

    throw new Error("[WEBPAGE] - Redirecting User to Login Page");

}

// ****************************************************************************************************
// STEP 04 - Check if each Account can be logged into Twitch
// ****************************************************************************************************

AccountsManager.checkAccounts().then(function () {

    // ****************************************************************************************************
    // STEP 05a - Redirect the user
    // Everything seems to be working, redirect to chat
    // ****************************************************************************************************

    window.location.href = "irc.html";

}).catch(function (e) {

    // ****************************************************************************************************
    // STEP 05b - Warn the user
    // One or more account seems to be invalid, we need to inform the user
    // ****************************************************************************************************

    $UI.toggleModal("modal-account-invalid");

    throw new Error("[WEBPAGE] - One or more Account is invalid");

});