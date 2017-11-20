const electron = require('electron')
const NetworkScanner = require('./backend/scanner');
const datastore = require('./backend/data').datastore


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
    width:900,
    height:567,
    resizable: false,
    icon: 'Frontend/img/LogoS.png'
  }

  )
  
  //mainWindow.webContents.openDevTools()
  //mainWindow.setMenu(null);
  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/Frontend/index.html`)

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
 // 

  //startScan();

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

  const spawn = function(command, args) {
      let spawnedProcess, error;

      try {
          spawnedProcess = ChildProcess.spawn(command, args, {
              detached: true
          });
      } catch (error) {}

      return spawnedProcess;
  };

  const spawnUpdate = function(args) {
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



  /////////////////
 //  Datenbank  //
/////////////////


electron.ipcMain.on('analyse-devices', ( event, devices )=>{
  console.log("analyse devices");
  datastore.analyse(event ,devices, analysisComplete);
})

function analysisComplete( event, risks ){
  console.log("#################################################")
  console.log("/////////////////////DONE////////////////////////")
  console.log("#################################################")
  event.returnValue = risks  

}


  /////////////////////
 //  Netzwerk-Scan  //
/////////////////////

electron.ipcMain.on('scan-network', (event) => {
  console.log("scan network")  
  let scanner = new NetworkScanner();
  scanner.getActiveIPs(scanner.getMyNetworks(),scanComplete, event);
})

electron.ipcMain.on('scan-localhost', (event) => {
  let scanner = new NetworkScanner();
  scanner.getMyIPs(scanComplete, event);
  console.log("scan localhost");
})

function scanComplete(event, data){
  console.log("#################################################")
  console.log("/////////////////////DONE////////////////////////")
  console.log("#################################################")
  event.sender.send('scan-complete', data);  
}

  /////////////////
 //  Sonstiges  //
/////////////////

electron.ipcMain.on('maximize',()=>{mainWindow.maximize();}) 
