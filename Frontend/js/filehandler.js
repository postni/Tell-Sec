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
        dialog.showSaveDialog({ filters: [
            { name: 'TellSec-Dokument', extensions: ['tell'] }
           ]},(fileName) => {
            if (fileName === undefined) {
                console.log("Du hast die Datei nicht gespeichert");
                return;
            }
            fileName = fileName.split('.tell')[0]
            // fileName is a string that contains the path and filename created in the save file dialog.  
            fs.writeFile(fileName+".tell", content, (err) => {
                if (err) {
                    alert("Ein Fehler tritt während der Erstellung der Datei auf " + err.message)
                }
                

                alert("Die Datei wurde erfolgreich gespeichert");
            });
        });
    }

    savePDFDialog() {
        dialog.showSaveDialog({ filters: [
            { name: 'PDF-Dokument', extensions: ['pdf'] }
           ]},(fileName) => {
            if (fileName === undefined) {
                console.log("Du hast die Datei nicht gespeichert");
                return;
            }

            communicator.pdfPrint(fileName);
        });
    }
    

    openDialog() {

        //Muss rein
        dialog.showOpenDialog({ filters: [
               { name: 'TellSec-Dokument', extensions: ['tell'] }
              ]},(fileNames) => {
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
    showAlertDialog(_callback) {
        var buttons = ['OK', 'Cancel'];
        
        
        dialog.showMessageBox({ 
            title: 'Neue Map',
            type: 'warning', 
            buttons: buttons, 
            message: 'Möchten Sie Ihren bisherigen Netzwerkplan unwiderruflich verwerfen?'
        }, (resp) => {
            if(resp === 0) {
                _callback(false)
            } else {
               _callback(true)
            }
        
        });
        
    }
    showAlertDialogFalse(){
        dialog.showMessageBox({ 
            title: 'Neue Map',
            type: 'info', 
            buttons: ['OK'], 
            message: 'Ihr Netzwerkplan ist bereits leer.'
        });
    }
    showAlertUnknownDevices(_callback) {
        dialog.showMessageBox({ 
            title: 'Auswertung',
            type: 'warning', 
            buttons: ['OK', 'Cancel'], 
            message: 'Sie haben nicht alle Netzwerkgeräte identifiziert. Dies könnte zu einer weniger aussagekräftigen Auswertung führen.'
        }, (resp) => {
            if(resp === 0){
                _callback(false)
            }else {
                _callback(true)
            }
        });
    }
    showCloseDialog(_callback) {
        var buttons = ['OK', 'Cancel'];
        
        
        dialog.showMessageBox({ 
            title: 'Schließen',
            type: 'warning', 
            buttons: buttons, 
            message: 'Programm beenden? Ungespeicherte Inhalte werden verloren gehen.'
        }, (resp) => {
            if(resp === 0) {
                _callback(false)
            } else {
               _callback(true)
            }
        
        });
        
    }
}






module.exports = new Filehandler();
datastore.getDevices();
