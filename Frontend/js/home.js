var communicator = require('./js/frontend').communicator
var datastore =require('./js/frontend').datastore
var filehandler = require('./js/filehandler')
var expertBtn = document.getElementById("expert")
var defaultBtn = document.getElementById("default")
var clicked = ""

/*Bei Klick auf Start-Button */
defaultBtn.onclick = ()=>{
    if(clicked==""){
        clicked = "default"
        btnClicked()
    }
}
/*loader-Funktion: wird beim öffnen der Willkommens-Seite ausgeführt
Wird die Software zum ersten Mal gestartet, so wird 'checked' gesetzt und 
die Auswahl 'Video anzeigen' ist künftig standardmäßig deaktiviert */
function loader() {
    let checked = JSON.parse(localStorage.getItem('showVideo'))
    
    checked = checked === undefined || checked === null? true : checked
    let checkbox = document.getElementById('startvid')
    if(checked) {
        checkbox.setAttribute('checked',"")
    }else {
        checkbox.removeAttribute('checked')
    }
    localStorage.setItem('showVideo', checked)
    checkbox.onchange = (event => {
        localStorage.setItem('showVideo', event.target.checked)   
    })
}

/*'btnClicked' wird mit dem Start der Software ausgeführt. Abhängig davon ob
die Funktion Netzwerkscan ausgewählt wurde, wird entsprechend weitergeleitet. */
function btnClicked(){
    let nwScan = document.getElementById("nwScan").checked
    if(nwScan){
        startWithNwScan()
    }else{
        startNoNwScan()
    }
}

/*Ist ein Netzwerkscan gewünscht, so wird an dieser Stelle ein Funktionsaufruf
für entsprechendes getätigt. Weiterhin wird das Fenster maximiert und die
Seite "main_map.html" aufgerufen. */
function startWithNwScan(){
    if(clicked ==="expert"){
        communicator.scanNetwork();
    } else{
        datastore.getTestdata()
    }
    
    communicator.maximize();
    window.location.href = 'main_map.html';
}

/*Ist kein Netzwerkscan gewünscht, so wird an dieser Stelle lediglich das Fenster 
maximiert und die Seite "main_map.html" aufgerufen. */
function startNoNwScan(){
    communicator.maximize();
    window.location.href = 'main_map.html';
    
}
function startRealScan(){
    if(clicked==""){
        clicked = "expert"
        btnClicked()
    }
}