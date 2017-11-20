var fs = require('fs');
var Datastore = require('nedb')

class Data {
    constructor() {
        this.counter = 0;
        this.riskdata = {};

        this.db = {}
        this.db.enthaelt = new Datastore({ filename: "db/enthaelt.db", autoload: true })
        this.db.folge = new Datastore({ filename: "db/folge.db", autoload: true })
        this.db.fuehrt_zu = new Datastore({ filename: "db/fuehrt_zu.db", autoload: true })
        this.db.massnahme = new Datastore({ filename: "db/massnahme.db", autoload: true })
        this.db.risiko = new Datastore({ filename: "db/risiko.db", autoload: true })
        this.db.risikoquelle = new Datastore({ filename: "db/risikoquelle.db", autoload: true })
        this.db.gehoert_zu = new Datastore({ filename: "db/gehoert_zu.db", autoload: true })
    }

    getRisks(event, device, _callback) {      
        
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

            if (err) console.log("err: " + err);

                this.db.enthaelt.find({ IDRQ: res.IDRQ }, (err, res) => {
                    laengeEnthaelt = res.length    
                    res.forEach((element) => {
                        this.db.risiko.find({ IDR: element.IDR }, (err, res) => {
                            laengeRisiko = res.length         
                            res.forEach((element) => {         
                                var risiko = {
                                    Bezeichnung: element.Bezeichnung,
                                    Massnahmen: [],
                                    Folgen: []
                                }
                                this.db.gehoert_zu.find({ IDR: element.IDR }, (err, res) => {           
                                    laengeGehoert_zu = res.length            
                                    res.forEach((element) => {
     
                                        this.db.massnahme.find({ IDM: element.IDM }, (err, res) => {                 
                                            laengeMassnahmen = res.length
                                            res.forEach((element) => {
                                                risiko.Massnahmen.push(element.Bezeichnung)
                                                laengeMassnahmen--
                                                if (laengeFolge === 0 && laengeEnthaelt === 0 && laengeFuehrt_zu === 0 && laengeRisiko === 0 && laengeGehoert_zu === 0 && laengeMassnahmen === 0) {
                                                    //TODO

                                                    this.riskdata[device] = ergebnis
                                                    this.counter--
                                                    if(this.counter ===0){
                                                        //ANTWORT
                                                        _callback(event,this.riskdata)
                                                        this.riskdata= {}
                                                    }

                                                }
                                            })

                                        })
                                        laengeGehoert_zu--
                                    })

                                    ergebnis.Risiken.push()
                                })

                                this.db.fuehrt_zu.find({ IDR: element.IDR }, (err, res) => {
                                    laengeFuehrt_zu = res.length
                                    res.forEach((element) => {
                                        this.db.folge.find({ IDF: element.IDF }, (err, res) => {
                                            laengeFolge = res.length
                                            res.forEach((element) => {
                                                risiko.Folgen.push(element.Bezeichnung)
                                                laengeFolge--

                                                if (laengeFolge === 0 && laengeEnthaelt === 0 && laengeFuehrt_zu === 0 && laengeRisiko === 0 && laengeGehoert_zu === 0 && laengeMassnahmen === 0) {
                                                    //TODO      
                                                    
                                                    this.riskdata[device] = ergebnis
                                                    this.counter--
                                                    if(this.counter ===0){
                                                        //ANTWORT
                                                        _callback(event,this.riskdata)
                                                        this.riskdata= {}
                                                    }

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

    analyse(event, devices, _callback){   
        var types = []
        for(let id in devices){
            let devicetype = devices[id]["devicetype"];
            let exists = false
            types.forEach((typ)=>{
                if(typ === devicetype){
                    exists=true
                }
            })

            if(!exists){
                types.push(devicetype)
            }

        }
        this.counter = types.length        
        types.forEach((typ)=>{
            this.getRisks(event, typ,_callback)
        })


    }

    completeRiskAnalysis(event, device){
        this.devicesLength--
        //TODO
    }

}

var dataManager = new Data()
module.exports.datastore = dataManager;