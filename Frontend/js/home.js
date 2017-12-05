var communicator = require('./js/frontend').communicator
var datastore =require('./js/frontend').datastore
var filehandler = require('./js/filehandler')
var expertBtn = document.getElementById("expert")
var defaultBtn = document.getElementById("default")
var clicked = ""


//filehandler.saveDialog()



defaultBtn.onclick = ()=>{
    
    if(clicked==""){
        clicked = "default"
        btnClicked()
    }
}

function loader() {
    let checked = JSON.parse(localStorage.getItem('showVideo'))
    console.log(checked)
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


function btnClicked(){
    let nwScan = document.getElementById("nwScan").checked
    console.log(JSON.stringify(nwScan))
    if(nwScan){
        startWithNwScan()
    }else{
        startNoNwScan()
    }
}

function startWithNwScan(){
    console.log("Netzwerk wird gescannt");
    console.log(clicked)
    if(clicked ==="expert"){
        communicator.scanNetwork();
    } else{
        datastore.getTestdata()
    }
    
    communicator.maximize();
    window.location.href = 'main_map.html';
}

function startNoNwScan(){
    console.log("Netzwerk wird nicht gescannt");
    
    communicator.maximize();
    window.location.href = 'main_map.html';
    
}