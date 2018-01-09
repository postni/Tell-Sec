var fs = require('fs'); 
var app = require('electron').remote;
var datastore = require('./frontend').datastore;
var dialog = app.dialog;

let content = "Text, der in die Datei gespeichert werden soll";

//Klasse die sich um Speichern/ Löschen/ Öffnen kümmert incl. aller Dialoge
class Filehandler {
    constructor() {
    }

    /*Das Dialogfenster zum Speichern eines Tell!-Dokuments */
    saveDialog() {
        content = JSON.stringify(datastore.getDevices());
        dialog.showSaveDialog({ filters: [
            { name: 'TellSec-Dokument', extensions: ['tell'] }
           ]},(fileName) => {
            if (fileName === undefined) {
                console.log("Du hast die Datei nicht gespeichert");
                return;
            }
            fileName = fileName.split('.tell')[0] 
            fs.writeFile(fileName+".tell", content, (err) => {
                if (err) {
                    alert("Ein Fehler tritt während der Erstellung der Datei auf " + err.message)
                }
                alert("Die Datei wurde erfolgreich gespeichert");
            });
        });
    }
    /*Das Dialogfenster zum Speichern eines PDF-Dokuments */
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
    
    /*Das Dialogfenster zum Öffnen eines Tell!-Dokuments */
    openDialog() {
        dialog.showOpenDialog({ filters: [
               { name: 'TellSec-Dokument', extensions: ['tell'] }
              ]},(fileNames) => {
            if (fileNames === undefined) {
                return;
            }
            fs.readFile(fileNames[0], 'utf-8', (err, data) => {
                if (err) {
                    alert("Ein Fehler ist aufgetreten, während die Datei gelesen wurde :" + err.message);
                    return;
                }
                var i = JSON.parse(data)
                datastore.setDevices(i)
            });
        });

    }

    /*Das Dialogfenster zum Löschen des Netzwerkplans */
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

    /*Das Dialog-Hinweisfenster bei 'Neu'-Funktion, sofern der Plan bereits leer ist.*/
    showAlertDialogFalse(){
        dialog.showMessageBox({ 
            title: 'Neue Map',
            type: 'info', 
            buttons: ['OK'], 
            message: 'Ihr Netzwerkplan ist bereits leer.'
        });
    }

    /*Das Dialog-Hinweisfenster bei Analyse-Funktion, sofern Geräte unbekannt sind. */
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

    /*Das Dialogfenster zum Schließen der Software. */
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
