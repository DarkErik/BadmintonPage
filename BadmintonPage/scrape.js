const cheerio = require('cheerio'); // npm install cheerio@1.0.0-rc.12
const fs = require("fs");
const { addDate } = require('./playerHandler');
const data = require("./data.js");


console.log("Starting...");


async function getSessionCookie() {
  const cookieUrl = "https://dbv.turnier.de/cookiewall/?returnurl=%2Fsport%2Fteammatch.aspx%3Fid%3D925D6245-1FA1-496D-9810-1439487E5801%26match%3D4925";
  //const matchesUrl = "https://dbv.turnier.de/sport/teammatches.aspx?id=925D6245-1FA1-496D-9810-1439487E5801&tid=1040";
  //const saveCookieUrl = "https://dbv.turnier.de/cookiewall/Save";
  try {
    const response = await fetch(cookieUrl, {
        method: "GET",
        headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "accept": "*/*",
        "Host": "dbv.turnier.de"
        }
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    
    const result = await response.text();
    //console.log(result);
    const cookies = response.headers.get("set-cookie");// ✅ works in Node
    console.log(cookies);

    const cookiesRaw = cookies.split(/,(?=\s*\w+=)/); 

    let cookieHeader = cookiesRaw.map(c => c.split(';')[0]).join('; ');
    cookieHeader = cookieHeader.replaceAll("  ", " ");
    
    console.log("new Header: " + cookieHeader + "|END|");

    return  cookieHeader + "&c=1&cp=23";
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

function waitForEnter(message = "Press Enter to continue...") {
  return new Promise(resolve => {
    process.stdout.write(message);
    process.stdin.once('data', () => resolve());
  });
}


async function getWebsideDOM(dbvUrl, cookie) {
      const matchRes = await fetch(dbvUrl, {
        method: "GET",
        headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "accept": "*/*",
        "Host": "dbv.turnier.de",
        "Cookie": cookie,
        "Referer": "https://dbv.turnier.de/cookiewall/?returnurl=%2Fsport%2Fteammatches.aspx%3Fid%3D925D6245-1FA1-496D-9810-1439487E5801%26tid%3D1040"
        }
    });
    // console.log(await matchRes.text());
    // return;

    dom = cheerio.load(await matchRes.text());
    return dom;
}

async function retrieveGames(matchUrl, cookie, teamIndx) {
  let dom = await getWebsideDOM(matchUrl, cookie);
  let games = [];

  const gameRows = dom("table.ruler.matches > tbody > tr").toArray();
  for(const gameRow of gameRows) {
    const cells = dom(gameRow).find("td")

    const matchLink = "https://dbv.turnier.de/sport/" + dom(cells[6]).find("a").attr("href");
    let matchDom = await getWebsideDOM(matchLink, cookie);
    
    let detailScore = [];


    const matchRows = matchDom("table.ruler.matches > tbody > tr").toArray();
    for(const matchRow of matchRows) {
      const matchCells = matchDom(matchRow).find("> td")
      //console.log(matchDom(matchCells[0]).text() + " " + matchDom(matchCells[1]).text);
      if (matchDom(matchCells[1]).text() === "" && matchDom(matchCells[3]).text() === "") {
        break;
      }

      let match = {
        type: matchDom(matchCells[0]).text(),
        host_player:  matchDom(matchCells[1]).find("> table > tbody > tr").map( (indx, el) => dom(el).text().trim()).get(),
        guest_player: matchDom(matchCells[3]).find("> table > tbody > tr").map( (indx, el) => dom(el).text().trim()).get(),
        sets: matchDom(matchCells[4]).text().split(" "),
      };

      // console.log("Matchrow: " + matchRow);
      // console.log(matchDom(matchRow).html());
      // console.log("json: ");
      // console.log(JSON.stringify(match, null, 4))
      // await waitForEnter();

      detailScore.push(match);
    }

    // Extract comments
    let comments = [];  
    const commentsArr = matchDom('table.ruler').filter((_, table) => {
      return matchDom(table)
        .find('caption')
        .text()
        .trim()
        .toLowerCase() === 'kommentar';
    }).find("tbody > tr").toArray();

    for(let commentLine of commentsArr) {
      // console.log(matchDom(commentLine).html());
      let commentLineTDs = matchDom(commentLine).find("> td").toArray();
      // console.log("Arr: " + commentsArr.length + " sub: " + commentLineTDs.length);
      let comment = [ matchDom(commentLineTDs[2]).text(), matchDom(commentLineTDs[1]).text(), stringToDate(matchDom(commentLineTDs[3]).text())]
      comments.push(comment);
    }
    // console.log(comments);

    let time_text = dom(cells[1]).text();
    let original_time = time_text;
    if (time_text.split("Verbandsansetzung").length > 1) {
      original_time = time_text.split("Verbandsansetzung")[1];
      time_text = time_text.split("Verbandsansetzung")[0];
    }

    let game = {
      time:  stringToDate(time_text) ?? stringToDate("1.1.1970"), // 
      original_time: stringToDate(original_time), 
      host: dom(cells[6]).text(),
      guest: dom(cells[8]).text(),
      matchLink: matchLink,
      score: detailScore.length === 0 ? "?-?" : dom(cells[9]).text(),
      location: dom(cells[11]).text(),
      locationLink: "https://dbv.turnier.de/sport/" + dom(cells[11]).find("a").attr("href"),
      detailScores: detailScore,
      comments: comments
    }
    games.push(game);
  }

  data.games[teamIndx] = games;

  let indx = 0;
  for(const g of games) {
    for(const c of g.comments.reverse()) {
      let dateFound = stringToDate(c[1]);
      // console.log("Comment: " + c[1] + "\nfound: " + dateFound);
      if (dateFound !== null) {
        addDate(dateFound, false, c[2], indx, teamIndx);
      }
    }
    indx++;
  }
}

function stringToDate(input) {
  let latestDate = null;
  let latestTime = null;


  let findDateRegex = /\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])(?:\.(\d{2}|\d{4}))?\b/g;

  const dateMatches = input.match(findDateRegex);
  if (dateMatches != null && dateMatches.length > 0) {
    latestDate = dateMatches[dateMatches.length - 1].split(".").map(Number);
    if (latestDate.length < 3) {
      latestDate.push(new Date(Date.now()).getFullYear());
    }
    //console.log("L3)
    if (latestDate[2] < 100)
      latestDate[2] += 2000;


    let findTimeRegex = /\b(?:([01]?\d|2[0-3]):([0-5]\d)|([01]?\d|2[0-3])\.([0-5]\d)\s*[Uu][Hh][Rr])|(?:([01]?\d|2[0-3])\s*[Uu][Hh][Rr])\b/g
    const timesMatched = input.match(findTimeRegex);
    if (timesMatched != null && timesMatched.length > 0) {
      latestTime = timesMatched[timesMatched.length - 1].toLowerCase().replaceAll("uhr", "").trim();

      if (latestTime.includes("."))
        latestTime = latestTime.split(".");
      else if (latestTime.includes(":"))
        latestTime = latestTime.split(":");
      else
        latestTime = [latestTime, "0"];
      latestTime = latestTime.map(Number);

    } else {
      latestTime = ["0", "0"];
    }
    //TODO ADD LATEST TIME TO DATE IF AVAILABLE
    const date = new Date(latestDate[2], latestDate[1] - 1, latestDate[0], latestTime[0], latestTime[1]);

    // const formatted = date.toLocaleDateString("de-DE", {
    //   weekday: "long",
    //   day: "2-digit",
    //   month: "2-digit",
    //   year: "numeric"
    // });

    // console.log(formatted)

    return date;

  }

  return null;
}


async function getGameInfo(matchUrl, teamIndx) {
  let sessionCookie = await getSessionCookie();
  let games = await retrieveGames(matchUrl, sessionCookie, teamIndx);
  console.log("Finished game retrieval.");
  return games;
}

exports.stringToDate = stringToDate;
exports.getGameInfo = getGameInfo;

// const promiseCookie = getSessionCookie();

// promiseCookie.then(
//   async (cookie) => {
//     console.log("Cookie aquired!");
//     const matchUrl = "https://dbv.turnier.de/sport/teammatches.aspx?id=925D6245-1FA1-496D-9810-1439487E5801&tid=1040";
//     let games = await retrieveGames(matchUrl, cookie);
//     console.log("Retrieved Games: ");
//     console.log(JSON.stringify(games, null, 4));
//     // getWebsideDOM("https://dbv.turnier.de/sport/teammatch.aspx?id=925D6245-1FA1-496D-9810-1439487E5801&match=4901", cookie);
//   }
// );




