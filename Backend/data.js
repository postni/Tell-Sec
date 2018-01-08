var Datastore = require('nedb')

class Data {

    //Konstruktor der "Data" Klasse:
    //Laden der einzelnen Dateien aus der Datenbank
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

    //Eingabe: event (Parameter 1)              || IPC event (zum zurück senden der Daten an Frontend)
    //         devices (Parameter 2)            || Liste aller im Netzwerk befindlicher Geräte
    //         _callback (Parameter 3)          || Rückruffunktion die mit den Daten aufgerufen wird
    analyse(event, devices, _callback) {
        let exists = false;
        var types = []
        //hinzufügen von gerätetypen zu "types" Array
        for (let id in devices) {
            exists = false;
            let devicetype = ""

            //Abändern von Bezeichnungen die sich im Frontend und im Backend unterscheiden
            if (devices[id]["devicetype"] === "stationär") {
                devicetype = "Statisches Gerät"
            } else if (devices[id]["devicetype"] === "mobil") {
                devicetype = "Mobiles Gerät"
            } else if (devices[id]["devicetype"] === "Maschine") {
                devicetype = "Maschinensteuerung"
            } else if (devices[id]["devicetype"] === "NAS") {
                devicetype = "Netzwerkspeicher"
            } else if (devices[id]["devicetype"]) {
                devicetype = devices[id]["devicetype"]
            }


            //sicherstellen das Jeder Gerätetyp nur einmal im "types" Array steht
            if (!devicetype || devicetype === "" || devicetype === "Unbekannt") {
                exists = true;
            }
            types.forEach((typ) => {
                if (typ === devicetype) {
                    exists = true;
                }
            })
            if (!exists) {
                types.push(devicetype);
            }

        }

        //Einholen aller Risikoinformationen für jeden bekannten Gerätetyp
        Promise.all(types.map((bezeichnung) => { 
            return this.findBezeichnunginRisikoquelle(bezeichnung).then(r => { return r }) 
            })).then((res) => {
                //Callback Funktion mit dem IPC Event und den Risikoinformationen der Geräte aufrufen
                _callback(event, res);
            })
    }

    // Eingabe: bezeichnung (Parameter 1)               || entspricht dem Gerätetyp
    // Rückgabewert: Promise mit "risiken"-Objekt für einen Gerätetyp
    findBezeichnunginRisikoquelle(bezeichnung) {
        return new Promise(resolve => {
            //erstellen der Variable "ergebnis" die als Rückgabe wert dient
            var ergebnis = {
                Bezeichnung: "",
                Risiken: []
            }
            //Suchen nach "bezeichnung" in Datenbank
            this.db.risikoquelle.findOne({ Bezeichnung: bezeichnung }, (err, res) => {
                if (err) console.log("err: " + err);
                // übergeben des "Bezeichnung"-Werts an die "ergebnis"-Variable
                ergebnis.Bezeichnung = res.Bezeichnung ? res.Bezeichnung : "unbekannt";
                if (ergebnis.Bezeichnung === "Mobiles Gerät") ergebnis.Bezeichnung = "mobil"
                else if (ergebnis.Bezeichnung === "Statisches Gerät") ergebnis.Bezeichnung = "stationär"
                else if (ergebnis.Bezeichnung === "Netzwerkspeicher") ergebnis.Bezeichnung = "NAS"
                else if (ergebnis.Bezeichnung === "Maschinensteuerung") ergebnis.Bezeichnung = "Maschine"

                //Einholen von Risko informationen (Parameter )
                this.findIDRQinEnthaelt(res.IDRQ).then(res => {
                    //speichern von Risiko Informationen in "ergebnis"-Variable
                    ergebnis.Risiken = res;
                    //auflösen des Promises mit "ergebnis" Variable
                    resolve(ergebnis);
                })
            })

        })
    }

    //Eingabe: idrq (Parameter 1)           || entspricht der Risikoquellen ID in Datenbank
    //Rückgabe: Promise mit Array aller Risiken und den damit verbundenen Folgen/Maßnahmen für einen Gerätetyp
    findIDRQinEnthaelt(idrq) {
        return new Promise(resolve => {
            //Suchen nach allen Risiko IDs (IDR) für die Riskoquelle (IDRQ)
            this.db.enthaelt.find({ IDRQ: idrq }, (err, res) => {
                let risiken = []

                //Anfragen der Risikoinformationen für alle Risiko ID's (IDR) uns schreiben der Promises in "risiken"-Array
                res.forEach((element) => {
                    risiken.push(this.findIDRinRisiko(element.IDR))
                })
                let id = 0
                //Wenn alle Promises in "risiken" aufgelöst wurden, werden die Rückgabedaten aktualisiert und anschließend der übergeordnete Promise aufgelöst
                Promise.all(risiken).then(data => {
                    let existing = []
                    //Duplikate ausflitern und risikoID hinzugefügt
                    let updatedData = data.filter(d => {
                        if (!existing.includes(d.Bezeichnung)) {
                            existing.push(d.Bezeichnung)
                            return true
                        } else {
                            console.log("!")
                            return false
                        }
                    }).map(d => {
                        d.riskID = id
                        id++
                        return d;
                    })
                    resolve(updatedData)
                })
            })
        })
    }

    //Eingabe: idr (Parameter 1)           || entspricht der Risiko ID in Datenbank
    //Rückgabe: Promise mit Risiko Objekt
    findIDRinRisiko(idr) {
        return new Promise(resolve => {
            this.db.risiko.findOne({ IDR: idr }, (err, res) => {
                //Anlegen des Risiko Objekts
                var risiko = {
                    Bezeichnung: res.Bezeichnung,
                    Folgen: [],
                    Massnahmen: [],
                    Eintrittswahrscheinlichkeit: res.Eintrittswahrscheinlich ? res.Eintrittswahrscheinlich : 0.5
                }
                //Suchen nach Folgen anhand der Risiko ID (idr)
                this.findIDRinFuehrtZu(idr).then((res) => {
                    // hinzufügen von Folgen zu Risiko Objekt
                    risiko.Folgen = res;
                    //Suchen nach Massnahmen anhand der Risiko ID (idr)
                    return this.findIDRinGehoertZu(idr)
                }).then(res => {
                    // hinzufügen von Massnahmen zu Risiko Objekt
                    risiko.Massnahmen = res;
                    resolve(risiko)
                })
            })
        })
    }

    //Eingabe: idr (Parameter 1)           || entspricht der Risiko ID in Datenbank
    //Rückgabe: Promise mit Folgen Objekt
    findIDRinFuehrtZu(idr) {
        return new Promise(resolve => {
            //Suchen nach Folgen anhand der Risiko ID (idr)
            this.db.fuehrt_zu.find({ IDR: idr }, (err, res) => {
                let folgen = []
                let existing = []

                //Anfragen der Informationen zu Folgen für alle Folgen ID's (IDF) und schreiben der Promises in "folgen"-Array
                res.forEach((element) => {
                    folgen.push(this.findIDFinFolge(element.IDF))
                })
                let id = 0
                //Wenn alle Promises in "folgen" aufgelöst wurden, werden die Rückgabedaten aktualisiert und anschließend der übergeordnete Promise aufgelöst
                Promise.all(folgen).then(data => {
                    let existing = []
                    //Herausfiltern von Duplikaten und hinzufügen von id
                    let updatedData = data.filter(d => {
                        if (!existing.includes(d.Name)) {
                            existing.push(d.Name)
                            return true
                        } else {
                            return false
                        }
                    }).map(dOld => {
                        let d = {}
                        d.consequenceID = id
                        d.name = dOld.Name
                        d.damage = dOld.Schadensklasse
                        d.defaultDamage = dOld.Schadensklasse
                        d.description = dOld.Beschreibung
                        id++
                        return d;
                    })
                    resolve(updatedData)
                })
            })
        })
    }

    //Eingabe: idf (Parameter 1)           || entspricht der Folgen ID in Datenbank
    //Rückgabe: Promise mit Folge
    findIDFinFolge(idf) {
        return new Promise(resolve => {
            //Suche nach Folge anhand der Folge ID (idf) und auflösen des übergeordneten Promises
            this.db.folge.findOne({ IDF: idf }, (err, res) => {
                let folge = {
                    Name: res.Bezeichnung,
                    Beschreibung: res.Beschreibung,
                    Schadensklasse: res.Schadensklasse
                }
                resolve(folge)
            })
        })
    }

    //Eingabe: idr (Parameter 1)           || entspricht der Risiko ID in Datenbank
    //Rückgabe: Promise mit Massnahmen Objekt
    findIDRinGehoertZu(idr) {
        return new Promise(resolve => {
            //Suchen nach Massnahmen anhand der Risiko ID (idr)
            this.db.gehoert_zu.find({ IDR: idr }, (err, res) => {
                let massnahmen = []

                //Anfragen der Informationen zu Massnahmen für alle Massnahmen ID's (IDM) und schreiben der Promises in "massnahmen"-Array
                res.forEach((element) => {
                    massnahmen.push(this.findIDMinMassnahme(element.IDM))
                })
                let id = 0
                    //Wenn alle Promises in "massnahmen" aufgelöst wurden, werden die Rückgabedaten aktualisiert und anschließend der übergeordnete Promise aufgelöst
                    Promise.all(massnahmen).then(data => {
                    //hinzufügen einer Massnahmen ID und auflösen des übergeordneten Promises 
                    let updatedData = data.map(dOld => {
                        let d = {}
                        d.countermeasuresID = id
                        d.name = dOld
                        id++
                        return d;
                    })
                    resolve(updatedData)
                })
            })
        })
    }

    //Eingabe: idm (Parameter 1)           || entspricht der Massnahmen ID in Datenbank
    //Rückgabe: Promise mit Massnahme
    findIDMinMassnahme(idm) {
        return new Promise(resolve => {
            //holen aller Informationen über die Massnahme mit der ID "idm" aus der Datenbank
            this.db.massnahme.findOne({ IDM: idm }, (err, res) => {
                resolve(res.Bezeichnung)
            })
        })
    }
}

var dataManager = new Data()
module.exports.datastore = dataManager;