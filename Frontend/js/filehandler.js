var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
var app = require('electron').remote;
var datastore = require('./frontend').datastore;
var dialog = app.dialog;

let content = "Text, der in die Datei gespeichert werden soll";


class Filehandler {
    constructor() {

    }

    saveDialog() {
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        content = JSON.stringify(datastore.getDevices());
        dialog.showSaveDialog((fileName) => {
            if (fileName === undefined) {
                console.log("Du hast die Datei nicht gespeichert");
                return;
            }

            // fileName is a string that contains the path and filename created in the save file dialog.  
            fs.writeFile(fileName +'.tell', content, (err) => {
                if (err) {
                    alert("Ein Fehler tritt während der Erstellung der Datei auf " + err.message)
                }
                

                alert("Die Datei wurde erfolgreich gespeichert");
            });
        });
    }
    openDialog() {

        //Muss rein
        dialog.showOpenDialog((fileNames) => {
            // fileNames is an array that contains all the selected
            if (fileNames === undefined) {
                console.log("Keine Datei ausgewält");
                return;
            }
            console.log(fileNames)
            fs.readFile(fileNames[0], 'utf-8', (err, data) => {
                if (err) {
                    alert("Ein Fehler ist aufgetreten, während die Datei gelesen wurde :" + err.message);
                    return;
                }

                var i = JSON.parse(data)
                
                console.log(i)
                datastore.setDevices(i)
            });
        });

    }
}


module.exports = new Filehandler();
datastore.getDevices();
