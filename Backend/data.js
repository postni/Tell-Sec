var fs = require('fs');
var Datastore = require('nedb')

class Data {
    constructor() {
        this.db = {}
        this.db.enthaelt = new Datastore({ filename: "db/enthaelt.db", autoload: true })
        this.db.folge = new Datastore({ filename: "db/folge.db", autoload: true })
        this.db.fuehrt_zu = new Datastore({ filename: "db/fuehrt_zu.db", autoload: true })
        this.db.massnahme = new Datastore({ filename: "db/massnahme.db", autoload: true })
        this.db.risiko = new Datastore({ filename: "db/risiko.db", autoload: true })
        this.db.risikoquelle = new Datastore({ filename: "db/risikoquelle.db", autoload: true })
        this.db.gehoert_zu = new Datastore({ filename: "db/gehoert_zu.db", autoload: true })
    }

    getRisks(event, device, id) {
        var laengeEnthaelt = 999;
        var laengeRisiko = 999
        var laengeGehoert_zu = 999
        var laengeMassnahmen = 999
        var laengeFuehrt_zu = 999
        var laengeFolge = 999

        var ergebnis = {
            Bezeichnung: "",
            Kategorien: [],
            Risiken: []
        }

        this.db.risikoquelle.findOne({ Bezeichnung: device }, (err, res) => {

            ergebnis.Bezeichnung = res.Bezeichnung
            ergebnis.Kategorien.push(res.Kategorie)


            //console.log("2.1")
            if (err) //console.log("err: " + err);

                this.db.enthaelt.find({ IDRQ: res.IDRQ }, (err, res) => {
                    laengeEnthaelt = res.length
                    //console.log("#############################################")      
                    //console.log(res)      
                    //console.log("#############################################")      
                    res.forEach((element) => {
                        //console.log("2.5 - " +element.IDR)
                        this.db.risiko.find({ IDR: element.IDR }, (err, res) => {
                            laengeRisiko = res.length
                            //console.log("2.6 - " +JSON.stringify(res))          
                            res.forEach((element) => {
                                //console.log("2.7 - " +element.Bezeichnung)           
                                var risiko = {
                                    Bezeichnung: element.Bezeichnung,
                                    Massnahmen: [],
                                    Folgen: []
                                }
                                this.db.gehoert_zu.find({ IDR: element.IDR }, (err, res) => {
                                    //console.log("2.8 - " +JSON.stringify(res))              
                                    laengeGehoert_zu = res.length
                                    //console.log("laengeGehoert_zu - 1: "+res.length)              
                                    res.forEach((element) => {

                                        //console.log("laengeGehoert_zu: "+laengeGehoert_zu) 
                                        //console.log("2.9 - " +element.IDM)                
                                        this.db.massnahme.find({ IDM: element.IDM }, (err, res) => {
                                            //console.log("3.0 - " +JSON.stringify(res))                  
                                            laengeMassnahmen = res.length
                                            //console.log("Massnahmen: "+res.length)
                                            res.forEach((element) => {
                                                //console.log("2.4")
                                                risiko.Massnahmen.push(element.Bezeichnung)
                                                laengeMassnahmen--
                                                if (laengeFolge === 0 && laengeEnthaelt === 0 && laengeFuehrt_zu === 0 && laengeRisiko === 0 && laengeGehoert_zu === 0 && laengeMassnahmen === 0) {
                                                    //console.log("Massnahmen: "+laengeFolge+" "+laengeEnthaelt+" "+laengeFuehrt_zu+" "+laengeGehoert_zu+" "+laengeMassnahmen+" "+laengeRisiko)
                                                    //TODO
                                                }
                                            })

                                        })
                                        //console.log("2.2")
                                        laengeGehoert_zu--
                                    })

                                    ergebnis.Risiken.push()
                                })

                                this.db.fuehrt_zu.find({ IDR: element.IDR }, (err, res) => {
                                    laengeFuehrt_zu = res.length
                                    res.forEach((element) => {
                                        this.db.folge.find({ IDF: element.IDF }, (err, res) => {
                                            laengeFolge = res.length
                                            //console.log("2.3")
                                            res.forEach((element) => {
                                                //console.log("5")
                                                risiko.Folgen.push(element.Bezeichnung)
                                                laengeFolge--

                                                //console.log(laengeFolge)
                                                //console.log(laengeEnthaelt)
                                                //console.log(laengeFuehrt_zu)
                                                //console.log(laengeRisiko)
                                                //console.log(laengeGehoert_zu)


                                                if (laengeFolge === 0 && laengeEnthaelt === 0 && laengeFuehrt_zu === 0 && laengeRisiko === 0 && laengeGehoert_zu === 0 && laengeMassnahmen === 0) {
                                                    //console.log("Folgen: "+laengeFolge+" "+laengeEnthaelt+" "+laengeFuehrt_zu+" "+laengeGehoert_zu+" "+laengeMassnahmen+" "+laengeRisiko)
                                                    //TODO                                                
                                                }
                                            })
                                        })
                                        laengeFuehrt_zu--
                                    })
                                })
                                ergebnis.Risiken.push(risiko)
                                laengeRisiko--
                            })

                        })
                        laengeEnthaelt--
                    })


                })
        })
    }

    analyse(event){
        if(this.devicesLength > 0){
            return;
        }else{
            this.db.devices.find({},(devices)=>{
                this.devicesLength = devices.length;
                devices.forEach((device)=>{
                    getRisks(event,device.devicetype, device.id)
                });
            })
        } 
    }

    completeRiskAnalysis(event, device, id){
        this.devicesLength--
        //TODO
    }

    refreshDatastore(devices) {
        if (fs.existsSync("db/devices.db")) {
            fs.unlinkSync("db/devices.db")
        }
        this.db.devices = new Datastore({ filename: "db/devices.db", autoload: true })
        for(let device in devices){
            this.db.devices.insert({ devicename: device });
        }
    }

}

var dataManager = new Data()
module.exports.datastore = dataManager;