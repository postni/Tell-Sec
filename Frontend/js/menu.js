var filehandler = require('./js/filehandler')
var communicator = require('./js/frontend').communicator
var datastore = require('./js/frontend').datastore


/*Sidemenu wird mithilfe von Style-Attributen geöffnet und geschlossen */
function openNav_user() {
    document.getElementById("user").style.width = "200px";
}
function closeNav_user() {
    document.getElementById("user").style.width = "0";
}
function openNav_network() {
    document.getElementById("network").style.width = "200px";
}
function closeNav_network() {
    document.getElementById("network").style.width = "0";
}


/*Funktionen des TOP MENU*/

/*Button 'Analyse' löst 'startAnalysis' aus. Es wird geprüft, ob sich noch
unbekannte Geräte auf Karte befinden um den User darauf hinzuweisen. */
function startanalysis() {
    let dev = datastore.getDevices()
    let decision = false
    for (let d in dev) {

        if (dev[d].devicetype === "unbekannt" || !dev[d].devicetype) {
            decision = true;
        }
    }

    if (decision) {
        filehandler.showAlertUnknownDevices(dec)
    } else {
        window.location.href = "./evaluation.html"
    }
}

/*'dec' wird aufgerufen, wenn der User das PopUp-Fenster von 
'showAlertUnknownDevices' bestätgt. Weiterleitung auf evaluation.html*/
function dec(dec) {
    if (!dec) {
        datastore.checkForRisks().then(res =>{
            window.location.href = "./evaluation.html"
        })
    }
}

/*Der Öffnen-Button aus dem Menü ruft 'callClearMapForOpen' auf. Es wird geprüft,
ob Geräte bereits vorhanen sind. Wenn ja wird mit 'showAlertDialog' ein Dialog 
angezeigt. Die Antwort des Users wird an 'clearMapForOpen' übergeben. */
function callClearMapforOpen() {
    if (sessionStorage.getItem('devices') !== '{}') {
        filehandler.showAlertDialog(clearMapforOpen)

    } else {
        openopen()
    }
}

/*Wenn User im Dialog aus vorherger Funktion auf OK klickt, wird hier der
sessionStorage gelöscht und anschließend 'updateMyData' und 'openopen' aufgerufen. */
function clearMapforOpen(choice) {


    if (!choice) {
        sessionStorage.setItem('devices', '{}');
        updateMyData()
        openopen()
    }
}

/* Der 'Neu'-Button aus dem Menü ruft 'callClearMap' auf. Es wird geprüft,
ob Geräte bereits vorhanen sind. Wenn ja wird mit 'showAlertDialog' ein Dialog 
angezeigt. Die Antwort des Users wird an 'clearMap' übergeben. */
function callClearMap() {
    if (sessionStorage.getItem('devices') !== '{}') {
        filehandler.showAlertDialog(clearMap)

    } else if (sessionStorage.getItem('devices') === '{}') {
        filehandler.showAlertDialogFalse()
    }
}

/*Wenn User im Dialog aus vorherger Funktion auf OK klickt, wird hier der
sessionStorage gelöscht und anschließend 'updateMyData' aufgerufen. */
function clearMap(choice) {


    if (!choice) {
        sessionStorage.setItem('devices', '{}');
        updateMyData()
    }
}

/*Save Dialog */
function opensave() {
    filehandler.saveDialog()
}

/*Open Dialog*/
function openopen() {
    filehandler.openDialog()
    sessionStorage.setItem("update", false)
    this.getData = window.setInterval(checkForUpdate, 1000)
}

/* Die Schließen-Funktion aus dem Menü ruft 'callCloseWin' auf. Es wird 
entsprechender Warnhinweis angezeigt.*/
function callCloseWin() {
    filehandler.showCloseDialog(cls)

}

/*Wenn User im Dialog aus vorherger Funktion auf OK klickt, wird hier 
das Programmesnter geschlossen*/
function cls(choice) {
    if (!choice) {
        window.close();
    }
}

/* Die DPFPrint-Funktion aus dem Menü ruft 'callCloseWin' auf. */
function printToPDF() {
    filehandler.savePDFDialog()

}