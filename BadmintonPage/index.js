//forever start -l forever.log -o out.log -e err.log index.js


const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require("fs");

let data = require("./data.js");
const { getGameInfo, stringToDate } = require("./scrape.js");
const { initPlayerHandler, getPlayers, addPlayer, removePlayer, addDate, approveDate, getAllChangedDate } = require("./playerHandler.js")
const { generateCalender } = require("./calender.js");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const MINUTE_MS = 1000 * 60;

function readTeams() {
  data.teams = JSON.parse(fs.readFileSync("config/teams.json", { encoding: 'utf8', flag: 'r' }));

  data.games = [];
  for(let team of data.teams) {
    data.games.push([]);
  }

  for(let i = 0; i < data.teams.length; i++) {
    getGameInfo(data.teams[i].matchUrl, i)
  }

  function randomDelay(standardTime, deviation) {
      return standardTime + (Math.random() * 2 - 1) * deviation;
  }
  
  async function repeatGameFetching() {
    for(let i2 = 0; i2 < data.teams.length; i2++) {
      await getGameInfo(data.teams[i2].matchUrl, i2);
      await sleep(randomDelay(20 * MINUTE_MS, 5 * MINUTE_MS))
    }

    setTimeout(repeatGameFetching, randomDelay(4 * 60 * MINUTE_MS, 1 * 60 * MINUTE_MS));
  }

  setTimeout(repeatGameFetching , randomDelay(4 * 60 * MINUTE_MS, 1 * 60 * MINUTE_MS));
      
}

readTeams();
initPlayerHandler();


//Aktuell: https://dbv.turnier.de/sport/teammatches.aspx?id=D6F7A756-39F3-4CB4-8F27-0E30E0421F4A&tid=361
//Alt    : https://dbv.turnier.de/sport/teammatches.aspx?id=925D6245-1FA1-496D-9810-1439487E5801&tid=1040

  

  
const app = express();
const teamRouter = express.Router();


app.use(cors());
app.use(express.json());

function teamMiddleware(req, res, next) {

    const team = req.params.team;

    let teamIndx = -1;
    for(let i = 0; i < data.teams.length; i++) {
      if (data.teams[i].teamUrl == team) {
        teamIndx = i;
        break;
      }
    }

    if (teamIndx == -1) {
        return res.sendStatus(404);
    }


    req.team = team;
    req.teamIndx = teamIndx;

    next();
}




teamRouter.get("/api/gameinfo", (req, res) => {
  res.json(data.games[req.teamIndx]);
});


teamRouter.get("/api/players", (req, res) => {
  res.json(getPlayers(req.teamIndx));
});

teamRouter.get("/api/teaminfo", (req, res) => {
  res.json(
    {
      "teamname": data.teams[req.teamIndx].teamName,
      "mini": data.teams[req.teamIndx].mini,
      "teamUrl": data.teams[req.teamIndx].teamUrl
    }
  );
})


teamRouter.get("/api/calendar.ics", (req, res) => {
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'inline; filename="events.ics"');
  res.send(generateCalender(req.teamIndx));
});


teamRouter.post("/api/addplayer", (req, res) => {
  if (! ("name" in req.body) || ! ("man" in req.body) || ! ("maybe" in req.body) || ! ("gameIndx" in req.body)) {
    res.sendStatus(400);
    return;
  }

  res.json(addPlayer(req.body.name, req.body.man, req.body.maybe, req.body.gameIndx, req.teamIndx));
});

teamRouter.post("/api/removeplayer", (req, res) => {
  if (! ("name" in req.body) || ! ("man" in req.body) || ! ("gameIndx" in req.body)) {
    res.sendStatus(400);
    return;
  }

  res.json(removePlayer(req.body.name, req.body.man, req.body.gameIndx, req.teamIndx));
});

teamRouter.post("/api/changeDate", (req, res) => {
  if (! ("date" in req.body) || ! ("gameIndx" in req.body)) {
    res.sendStatus(400);
    return;
  }

  addDate(stringToDate(req.body.date), true, null, req.body.gameIndx, req.teamIndx);
  res.json(getAllChangedDate(req.teamIndx));

});

teamRouter.post("/api/approveDate", (req, res) => {
  if (! ("gameIndx" in req.body)) {
    res.sendStatus(400);
    return;
  }

  approveDate(req.body.gameIndx, req.teamIndx);
  res.json(getAllChangedDate(req.teamIndx));

});



teamRouter.get("/api/currentDates", (req, res) => {
  res.json(getAllChangedDate(req.teamIndx));
  //console.log(getAllChangedDate(req.teamIndx));

});


//Webserver
teamRouter.use(express.static(
    path.join(__dirname, '../FrontEnd/BadmintonFrontend/dist')
));

app.get("/", (req, res) => { //Default page
    const links = data.teams.map(team => `<li><a href="/${team.teamUrl}">${team.teamName}</a></li>`)
        .join("");

    res.send(`
        <h1>TG Bochum Teams:</h1>
        <ul>${links}</ul>
    `);
});

app.use("/:team", teamMiddleware, teamRouter);

const port = 3122;
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
});

