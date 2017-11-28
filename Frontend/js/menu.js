var filehandler = require('./js/filehandler')

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
