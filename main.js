const electron = require('electron')
const networkScanner = require('./backend/scanner');
const datastore = require('./backend/data').datastore
const os = require("os")
const fs = require('fs');
const ipc = electron.ipcMain;
const shell = electron.shell;

// Module to control application life.
const app = electron.app

//Desktop-Anwendung
// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
      width: 900,
      height: 600,
      resizable: false,
      icon: 'Frontend/img/LogoS.png',
      autoHideMenuBar: true
    }
  )

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/Frontend/index.html`)


  
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


/////////////////////////
//      Win-Install   ///
/////////////////////////

//Benötigt für das Deployen der Applikation zur Ausführung als Windows Applikation
function handleSquirrelEvent(application) {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true
      });
    } catch (error) { }

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      application.quit();
      return true;
  }
};

/////////////////////
//  Netzwerk-Scan  //
/////////////////////

//Warten auf "scan-network" Anfrage aus dem Frontend
ipc.on('scan-network', (event) => {
  //Weiterleiten des Aufrufs an die Netzwerkscanner Komponente
  networkScanner.scanNetwork(event, scanComplete)
})

//Zurückmelden der durch den Netzwerkscan erhaltenen Daten
function scanComplete(event, data) {
  //Asynchrone Antwort an ipcRenderer senden
  event.sender.send('scan-complete', data);
}


/////////////////
//  Datenbank  //
/////////////////

//Warten auf "analyse-devices" Anfrage Aus dem Frontend
ipc.on('analyse-devices', (event, devices) => {
  //Weiterleiten der Anfrage an Datenbank Komponente
  datastore.analyse(event, devices, analysisComplete);
})

//Zurückmelden der durch die Sicherheitsanalyse erhaltenen Daten
function analysisComplete(event, risks) {
  let riskObject = {}
  //Umwandeln von Array zu key-Value Liste
  risks.forEach(element => {
    riskObject[element.Bezeichnung] = element.Risiken
  });
  //Synchrone Antwort an ipcRenderer senden
  event.returnValue = riskObject

}

/////////////////
//  Sonstiges  //
/////////////////

//Warten auf "maximize" Anfrage Aus dem Frontend
ipc.on('maximize', () => {
  let operatingSystem = os.type()
  //Betriebssystem Prüfen
  if (operatingSystem.toLowerCase().includes("mac") || operatingSystem.toLowerCase().includes("darwin")) {
    //Bei Mac Systemen zuerst die Bildschirmmaße auslesen und anschließen auf Fullscreen umschalten
    mainWindow.setBounds(electron.screen.getPrimaryDisplay().bounds)
    mainWindow.setFullScreen(true)
  } else {
    //Bei anderen Systemen (Windows/Linux) das Fenster maximieren
    mainWindow.maximize();
  }
})

//Warten auf "go-to-evaluation" Anfrage Aus dem Frontend
ipc.on('go-to-evaluation', () => {
  //Auf "Evaluation" Seite weiterleiten
  mainWindow.loadURL(`file://${__dirname}/frontend/evaluation.html`)
})



//Warten auf "print-to-pdf" Anfrage Aus dem Frontend
ipc.on('print-to-pdf', function (event, path) {

  const win = BrowserWindow.fromWebContents(event.sender);
  //Inhalt des Fensters zu PDF umwandeln
  win.webContents.printToPDF({}, function (error, data) {
    if (error) return console.log(error.message);
    //Speichern des PDFs als Datei
    fs.writeFile(path, data, function (err) {
      if (err) return console.log(err.message);
      shell.openExternal('file://' + path);
    })
  })
});
