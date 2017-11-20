var communicator = require('./js/frontend').communicator
var datastore =require('./js/frontend').datastore
var expertBtn = document.getElementById("expert")
var defaultBtn = document.getElementById("default")
var clicked = ""

expertBtn.onclick = ()=>{
    if(clicked ==""){
        clicked = "expert"
        btnClicked()
    }
}

defaultBtn.onclick = ()=>{
    
    if(clicked==""){
        clicked = "default"
        datastore.getTestdata()
        btnClicked()
    }
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
    }
    
    communicator.maximize();
    window.location.href = 'main_map.html';
}

function startNoNwScan(){
    console.log("Netzwerk wird nicht gescannt");
    
    /*
    if(clicked ==="expert"){
        communicator.scanLocalhost();
    }
    */
    
    communicator.maximize();
    window.location.href = 'main_map.html';
    
}