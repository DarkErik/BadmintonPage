//forever start -l forever.log -o out.log -e err.log index.js


const express = require('express');
const cors = require('cors');
const path = require('path');

const { getGameInfo, stringToDate } = require("./scrape.js");
const { getPlayers, addPlayer, removePlayer, addDate, approveDate, getAllChangedDate } = require("./playerHandler.js")

let games = [];

//Aktuell: https://dbv.turnier.de/sport/teammatches.aspx?id=D6F7A756-39F3-4CB4-8F27-0E30E0421F4A&tid=361
//Alt    : https://dbv.turnier.de/sport/teammatches.aspx?id=925D6245-1FA1-496D-9810-1439487E5801&tid=1040
const gamesURL = "https://dbv.turnier.de/sport/teammatches.aspx?id=D6F7A756-39F3-4CB4-8F27-0E30E0421F4A&tid=361"

getGameInfo(gamesURL).then(
    (value) => {
      games = value;
      // games.push({
      //   time: "0",
      //   host: "TG",
      //   guest: "Brenschede",
      //   matchLink: "...",
      //   score: "?-?",
      //   location: "Any",
      //   detailScores:[]
      // })
    }
);

setInterval(() => {
    getGameInfo(gamesURL).then(
      (value) => {
        games = value;
      }
    );
  }, 30 * 60 * 1000);

const app = express();

app.use(cors());
app.use(express.json());

//Webserver
app.use(express.static(
    path.join(__dirname, '../FrontEnd/BadmintonFrontend/dist')
));


app.get("/api/gameinfo", (req, res) => {
  // console.log(JSON.stringify(games));
  res.json(games);
});

app.get("/api/players", (req, res) => {
  
  res.json(getPlayers(games.length));
});


app.post("/api/addplayer", (req, res) => {
  if (! ("name" in req.body) || ! ("man" in req.body) || ! ("maybe" in req.body) || ! ("gameIndx" in req.body)) {
    res.sendStatus(400);
    return;
  }

  res.json(addPlayer(req.body.name, req.body.man, req.body.maybe, req.body.gameIndx, games.length));
});

app.post("/api/removeplayer", (req, res) => {
  if (! ("name" in req.body) || ! ("man" in req.body) || ! ("gameIndx" in req.body)) {
    res.sendStatus(400);
    return;
  }

  res.json(removePlayer(req.body.name, req.body.man, req.body.gameIndx, games.length));
});

app.post("/api/changeDate", (req, res) => {
  if (! ("date" in req.body) || ! ("gameIndx" in req.body)) {
    res.sendStatus(400);
    return;
  }

  addDate(stringToDate(req.body.date), true, null, req.body.gameIndx, games.length);
  res.json(getAllChangedDate());

});

app.post("/api/approveDate", (req, res) => {
  if (! ("gameIndx" in req.body)) {
    res.sendStatus(400);
    return;
  }

  approveDate(req.body.gameIndx, games.length);
  res.json(getAllChangedDate());

});



app.get("/api/currentDates", (req, res) => {
  res.json(getAllChangedDate());
  console.log(getAllChangedDate());

});


const port = 3122;
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
});

