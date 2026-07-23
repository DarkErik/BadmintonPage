const fs = require("fs");
const path = require("path");

const data = require("./data.js");

const dataPath = "./data"
const playerPath = "players.json";
const datePath = "dates.json";



let currentPlayer = [];
let currentDates = [];

function initPlayerHandler() {
    for(let t of data.teams) {
        currentPlayer.push(null);
        currentDates.push(null);
        
        let teamDir = path.join(dataPath, t.teamUrl);
        if (!fs.existsSync(teamDir))
            fs.mkdirSync(teamDir);
    }
    
}

function writePlayersToFile(teamIndx) {
    if (currentPlayer[teamIndx] === null)
        return;

    fs.writeFileSync(path.join(dataPath, data.teams[teamIndx].teamUrl, playerPath), JSON.stringify(currentPlayer[teamIndx]));
}

function addPlayer(name, man, maybe, game, teamIndx) {
    if (teamIndx > data.teams.length)
        return;
    if (game > data.games[teamIndx].length)
        return;
    if (name == "")
        return;
    
    
    let g = getPlayers(teamIndx)[game];

    if (man) {
        if (maybe) {
            let indx = g.registeredMans.indexOf(name); 
            if (indx !== -1)
                g.registeredMans.splice(indx, 1);
            if (g.registeredMaybeMans.indexOf(name) === -1)
                g.registeredMaybeMans.push(name);
        } else {
            let indx = g.registeredMaybeMans.indexOf(name); 
            if (indx !== -1)
                g.registeredMaybeMans.splice(indx, 1);
            if (g.registeredMans.indexOf(name) === -1)
                g.registeredMans.push(name);
        }
    } else {
        if (maybe) {
            let indx = g.registeredWoman.indexOf(name); 
            if (indx !== -1)
                g.registeredWoman.splice(indx, 1);
            if (g.registeredMaybeWoman.indexOf(name) === -1)
                g.registeredMaybeWoman.push(name);
        } else {
            let indx = g.registeredMaybeWoman.indexOf(name); 
            if (indx !== -1)
                g.registeredMaybeWoman.splice(indx, 1);
            if (g.registeredWoman.indexOf(name) === -1)
                g.registeredWoman.push(name);
        }
    }

    writePlayersToFile(teamIndx);
    return getPlayers(teamIndx);
}

function removePlayer(name, man, gameIndx, teamIndx) {
    if (teamIndx > data.teams.length)
        return;
    if (gameIndx > data.games[teamIndx].length)
        return;
    if (name == "")
        return;
    
    let game = getPlayers(teamIndx)[gameIndx];
    name = name.replace("(", "");
    name = name.replace(")", "");

    if (man) {
        let indx = game.registeredMans.indexOf(name);
        if (indx !== -1)
            game.registeredMans.splice(indx, 1);
        indx = game.registeredMaybeMans.indexOf(name);
        if (indx !== -1) {
            game.registeredMaybeMans.splice(indx, 1);
        }
    } else {
        let indx = game.registeredWoman.indexOf(name);
        if (indx !== -1)
            game.registeredWoman.splice(indx, 1);
        indx = game.registeredMaybeWoman.indexOf(name);
        if (indx !== -1) {
            game.registeredMaybeWoman.splice(indx, 1);
        }
    }

    writePlayersToFile(teamIndx);
    return getPlayers(teamIndx);
}

function getPlayers(teamIndx) {
    if (teamIndx > data.teams.length)
        return null;

    if (currentPlayer[teamIndx] === null) {
        let filePath = path.join(dataPath, data.teams[teamIndx].teamUrl, playerPath);
        if (!fs.existsSync(filePath)) {
            currentPlayer[teamIndx] = [];
        } else {
            currentPlayer[teamIndx] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
        }
    }


    while(currentPlayer[teamIndx].length < data.games[teamIndx].length) {
        currentPlayer[teamIndx].push({
            registeredMans: [],
            registeredMaybeMans: [],
            registeredWoman: [],
            registeredMaybeWoman: [],
        });
    }
    while(currentPlayer[teamIndx].length > data.games[teamIndx].length) {
        currentPlayer[teamIndx].pop();
    }
    return currentPlayer[teamIndx];
}

function getDates(teamIndx) {
    if (teamIndx > data.teams.length)
        return null;

    if (currentDates[teamIndx] === null) {
        let filePath = path.join(dataPath, data.teams[teamIndx].teamUrl, datePath);
        if (!fs.existsSync(filePath)) {
            currentDates[teamIndx] = [];
        } else {
            currentDates[teamIndx] = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' }));
        }
    }

    while(currentDates[teamIndx].length < data.games[teamIndx].length) {
        currentDates[teamIndx].push({
            dates: [],
            registeredTime: [],
            approved: false
        });
    }

    while(currentDates[teamIndx].length > data.games[teamIndx].length) {
        currentDates[teamIndx].pop();
    }
    return currentDates[teamIndx];
}

function writeDatesToFile(teamIndx) {
    if (currentDates[teamIndx] === null)
        return;

    fs.writeFileSync(path.join(dataPath, data.teams[teamIndx].teamUrl, datePath), JSON.stringify(currentDates[teamIndx]));
}


function addDate(date, approved, registeredTime, gameIndx, teamIndx) {
    if (teamIndx > data.teams.length)
        return null;
    if (gameIndx >= data.games[teamIndx].length)
        return;
    if (date == null)
        return;
    let dates = getDates(teamIndx);
    if (registeredTime !== null && dates[gameIndx].registeredTime.length > 0) {
        // console.log("Step 2.5 L: " + dates[gameIndx].registeredTime.length > 0);
        if (registeredTime.getTime() < new Date(dates[gameIndx].registeredTime[dates[gameIndx].registeredTime.length - 1]).getTime()) { // exit if old 
            console.log("Date not acceped: too old");
            return;
        }

        
        let lastDate = new Date(dates[gameIndx].dates[dates[gameIndx].dates.length - 1]);
        console.log("LastDate: " + lastDate);
        if (dates[gameIndx].approved && !approved && lastDate == date) {
            console.log("Date not accepted: loss of approval");
            return;
        }

        if (!approved && lastDate.getTime() === date.getTime() ) {
            console.log("Date not accepted: Duplicate date");
            return;
        }
        
        // console.log("New date.time: " + date.getTime());
        // console.log("Old date.time: " + new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime());

        if (!approved && date.getHours() === 0 && date.getMinutes() === 0 && new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime() === date.getTime()) { // return on precision downgrade.
            console.log("Date not accepted: loss of hours and minutes");
            return;
        }
    }

    dates[gameIndx].dates.push(date);
    dates[gameIndx].registeredTime.push(registeredTime ?? new Date(Date.now()));
    dates[gameIndx].approved = approved;
    console.log("Date accepted");
    writeDatesToFile(teamIndx);
}

function getChangedDate(gameIndx, teamIndx) {
    if (teamIndx > data.teams.length)
        return null;

    if(gameIndx < 0 || data.games[teamIndx].length) {
        return null;
    }
    let dates = getDates(teamIndx);
    if (dates.dates.length > 0)
        return [dates[i].dates[dates[i].dates.length - 1], dates[i].approved];
    else 
        return null;
}

function approveDate(gameIndx, teamIndx) {
    if (teamIndx > data.teams.length)
        return null;

    if(gameIndx < 0 || gameIndx > data.games[teamIndx].length) 
        return;
    let dates = getDates(teamIndx);
    dates[gameIndx].approved = true;
    console.log("Approved Date: gameIndx: " + gameIndx + " team: " + teamIndx);
    writeDatesToFile(teamIndx);
}

function getAllChangedDate(teamIndx) {
    let cDates = getDates(teamIndx);
    let games = [];
    for(let i = 0; i < cDates.length; i++) {
        if (cDates[i].dates.length > 0) {
            games.push([cDates[i].dates[cDates[i].dates.length - 1], cDates[i].approved]);
        } else 
            games.push(null);
    }
    return games;
}

exports.approveDate = approveDate;
exports.getAllChangedDate = getAllChangedDate;
exports.addDate = addDate;
exports.getPlayers = getPlayers;
exports.addPlayer = addPlayer;
exports.removePlayer = removePlayer;
exports.initPlayerHandler = initPlayerHandler;
