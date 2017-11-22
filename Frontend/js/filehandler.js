var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
var app = require('electron').remote; 
var datastore = require('./frontend').datastore;
var dialog = app.dialog;

let content = "Text, der in die Datei gespeichert werden soll";

class Filehandler{
    constructor(){

    }

    saveDialog(){
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
dialog.showSaveDialog((fileName) => { 
    if (fileName === undefined){
        console.log("Du hast die Datei nicht gespeichert");
        return;
    }

    // fileName is a string that contains the path and filename created in the save file dialog.  
    fs.writeFile(fileName, content, (err) => {
        if(err){
            alert("Ein Fehler tritt während der Erstellung der Datei auf "+ err.message)
        }
                    
        alert("Die Datei wurde erfolgreich gespeichert");
    });
}); 


//Muss rein
dialog.showOpenDialog((fileNames) => {
    // fileNames is an array that contains all the selected
    if(fileNames === undefined){
        console.log("Keine Datei ausgewält");
        return;
    }

    fs.readFile(filepath, 'utf-8', (err, data) => {
        if(err){
            alert("Ein Fehler ist aufgetreten, während die Datei gelesen wurde :" + err.message);
            return;
        }

        // Change how to handle the file content
        console.log("Der Inhalt der Datei ist : " + data);
    });
});


 
/*
// Note that the previous example will handle only 1 file, if you want that the dialog accepts multiple files, then change the settings:
// And obviously , loop through the fileNames and read every file manually
dialog.showOpenDialog({ 
    properties: [ 
        'openFile', 'multiSelections', (fileNames) => {
            console.log(fileNames);
        }
    ]
});

var filepath = "C:/Previous-filepath/existinfile.txt";// you need to save the filepath when you open the file to update without use the filechooser dialog againg
var content = "This is the new content of the file";

fs.writeFile(filepath, content, (err) => {
    if (err) {
        alert("An error ocurred updating the file" + err.message);
        console.log(err);
        return;
    }

    alert("The file has been succesfully saved");
});

var filepath = "C:/Path-toFile/file.txt";// Previously saved path somewhere

if (fs.existsSync(filepath)) {
    fs.unlink(filepath, (err) => {
        if (err) {
            alert("An error ocurred updating the file" + err.message);
            console.log(err);
            return;
        }
        console.log("File succesfully deleted");
    });
} else {
    alert("This file doesn't exist, cannot delete");
}
*/


/*
dialog.showOpenDialog({
    title:"Select a folder",
    properties: ["openDirectory"]
}, (folderPaths) => {
    // folderPaths is an array that contains all the selected paths
    if(fileNames === undefined){
        console.log("Kein Ziel-Ordner ausgewählt");
        return;
    }else{
        console.log(folderPaths);
    }
});
*/
    }
}


module.exports = new Filehandler();
datastore.getDevices();
