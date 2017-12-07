var filehandler = require('./js/filehandler')
var communicator = require('./js/frontend').communicator
var datastore = require('./js/frontend').datastore


/*Sidemenu Map */
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


/*TOP MENU*/
/*Clear Map */
function startanalysis() {
    /*fehlerhaft!*/
    datastore.checkForRisks()
    let dev = datastore.getDevices()
    let decision = false
    for(let d in dev){
        
        if (dev[d].devicetype === "unbekannt" || !dev[d].devicetype){
            decision = true;       
        }
    }
    
    if(decision){
        filehandler.showAlertUnknownDevices(dec)
     } else {
        window.location.href = "./evaluation.html"
    }
    }

    function dec(dec){
        if(!dec){
            window.location.href = "./evaluation.html"
        }
    }

    function callClearMapforOpen() {
        if(sessionStorage.getItem('devices')!=='{}'){
        filehandler.showAlertDialog(clearMapforOpen)
    
    } else {
        openopen()
    }
    }
    function clearMapforOpen(choice) {
        
     
        if(!choice) {
        sessionStorage.setItem('devices', '{}'); 
        updateMyData()
        openopen()
        } 
    }
function callClearMap() {
    if(sessionStorage.getItem('devices')!=='{}'){
    filehandler.showAlertDialog(clearMap)

} else if(sessionStorage.getItem('devices')==='{}') {
    filehandler.showAlertDialogFalse()
}
}

function clearMap(choice) {
    
 
    if(!choice) {
    sessionStorage.setItem('devices', '{}'); 
    updateMyData()
    } 
}
/*Save Dialog */
function opensave () {
    filehandler.saveDialog()
}
/*Open Dialog*/
function openopen () {
    filehandler.openDialog()
    sessionStorage.setItem("update", false)
    this.getData = window.setInterval(checkForUpdate, 1000)    
}

function callCloseWin() {
    filehandler.showCloseDialog(cls)

}
function cls(choice){
    if(!choice){
        window.close();
    }
}

 
function printToPDF() {
    filehandler.savePDFDialog()
    
}