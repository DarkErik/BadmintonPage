const fs = require("fs");

const playerPath = "./data/players.json";
const datePath = "./data/dates.json";


let currentPlayer = null;
let currentDates = null;

function writePlayersToFile() {
    if (currentPlayer === null)
        return;

    fs.writeFileSync(playerPath, JSON.stringify(currentPlayer));
}

function addPlayer(name, man, maybe, game, amountOfGames) {
    
    if (game > amountOfGames)
        return;
    if (name == "")
        return;
    
    
    let g = getPlayers(amountOfGames)[game];

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
            console.log(name);
            console.log(g.registeredMaybeWoman);
            let indx = g.registeredMaybeWoman.indexOf(name); 
            if (indx !== -1)
                g.registeredMaybeWoman.splice(indx, 1);
            if (g.registeredWoman.indexOf(name) === -1)
                g.registeredWoman.push(name);
        }
    }

    writePlayersToFile();
    return currentPlayer;
}

function removePlayer(name, man, gameIndx, amountOfGames) {
    if (gameIndx > amountOfGames)
        return;
    if (name == "")
        return;
    
    let game = getPlayers(amountOfGames)[gameIndx];
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

    writePlayersToFile();
    return currentPlayer;
}

function getPlayers(amountOfGames) {
    if (currentPlayer === null) {
        if (!fs.existsSync(playerPath)) {
            currentPlayer = [];
        } else {
            currentPlayer = JSON.parse(fs.readFileSync(playerPath, { encoding: 'utf8', flag: 'r' }));
        }
    }

    while(currentPlayer.length < amountOfGames) {
        currentPlayer.push({
            registeredMans: [],
            registeredMaybeMans: [],
            registeredWoman: [],
            registeredMaybeWoman: [],
        });
    }
    while(currentPlayer.length > amountOfGames) {
        currentPlayer.pop();
    }
    return currentPlayer;
}

function getDates(amountOfGames) {
    if (currentDates === null) {
        if (!fs.existsSync(datePath)) {
            currentDates = [];
        } else {
            currentDates = JSON.parse(fs.readFileSync(datePath, { encoding: 'utf8', flag: 'r' }));
        }
    }

    while(currentDates.length < amountOfGames) {
        currentDates.push({
            dates: [],
            registeredTime: [],
            approved: false
        });
    }

    while(currentDates.length > amountOfGames) {
        currentDates.pop();
    }
    return currentDates;
}

function writeDatesToFile() {
    if (currentDates === null)
        return;

    fs.writeFileSync(datePath, JSON.stringify(currentDates));
}


function addDate(date, approved, registeredTime, gameIndx, amountOfGames) {
    if (gameIndx >= amountOfGames)
        return;
    if (date == null)
        return;
    let dates = getDates(amountOfGames);
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
    writeDatesToFile();
}

function getChangedDate(gameIndx, amountOfGames) {
    if(gameIndx < 0 || gameIndx >= amountOfGames) {
        return null;
    }
    if (currentDates[gameIndx].dates.length > 0)
        return [currentDates[gameIndx].dates[currentDates[gameIndx].dates.length - 1], currentDates[gameIndx].approved];
    else 
        return null;
}

function approveDate(gameIndx, amountOfGames) {
    if (gameIndx < 0 || gameIndx >= amountOfGames)
        return;
    let dates = getDates(amountOfGames);
    dates[gameIndx].approved = true;
    console.log("Approved Date: gameIndx: " + gameIndx);
    writeDatesToFile();
}

function getAllChangedDate() {
    let games = [];
    for(let i = 0; i < currentDates.length; i++) {
        if (currentDates[i].dates.length > 0) {
            games.push([currentDates[i].dates[currentDates[i].dates.length - 1], currentDates[i].approved]);
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
