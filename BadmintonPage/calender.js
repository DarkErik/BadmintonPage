const data = require("./data.js");
const crypto = require("crypto");

const { getAllChangedDate } = require("./playerHandler.js");

function formatICSDate(date) {
    // YYYYMMDDTHHMMSSZ
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function generateCalender(teamIndx) {
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:TG Bochum",
        "CALSCALE:GREGORIAN"
    ];

    const changedDates = getAllChangedDate(teamIndx);

    for (let i = 0; i < data.games[teamIndx].length; i++) {
        let game = data.games[teamIndx][i];
        let startTime = game.time;
        
        let dateChanged = false;
        if (changedDates[i] != null && changedDates[i][1] === true) {
            startTime = new Date(Date.parse(changedDates[i][0]));
            dateChanged = true;
        }
        
        //console.log("Changed: " + dateChanged + " " + startTime);

        lines.push(
            "BEGIN:VEVENT",
            `UID:${crypto.createHash("md5").update(game.matchLink).digest("hex")}@tg.dondevelops.de`,
            `DTSTAMP:${formatICSDate(game.original_time)}`,
            `DTSTART:${formatICSDate(startTime)}`,
            `DTEND:${formatICSDate(new Date(startTime.getTime() + 2 * 60 * 60 * 1000))}`,
            `SUMMARY:${game.host + " vs. " + game.guest}`,
            `DESCRIPTION:${game.host} (HEIM) gegen ${game.guest} (GAST). Spielort: ${game.location}.`,
            "END:VEVENT"
        );

    }
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
}


exports.generateCalender = generateCalender;