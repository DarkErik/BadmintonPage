import {defineStore} from "pinia"

// const BACKEND_URL = "https://tg.dondevelops.de"; // "http://localhost:3122"
const BACKEND_URL = "http://localhost:3122/A";

export const useDateStore = defineStore("dates", {
    state: () => {
        return {
            games: [
                null,
                                null,                null,                null,                null,                null,                null,                null,                null,                null,                null,                null,                null,                null,
                null
            ]
        };
    },
    actions: {
         async update() {
            const url = "./api/currentDates";
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`[FATAL] Could not fetch players.`);
                }
                const gameJson = await response.json();
                //console.log(JSON.stringify(gameJson));
                console.log("Updated date info:" );
                this.games = gameJson;
                // usePlayerStore().setGameAmount(gameJson.length);
                console.log(this.games);
            } catch (error) {
                console.error(error.message);
            }

        },

        async changeDate(date, gameIndx) {
           
            const url = "./api/changeDate";
            try {
                const response = await fetch(url,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            date: date,
                            gameIndx: gameIndx,
                        })
                    }
                );
                if (!response.ok) {
                    throw new Error(`[FATAL] Could not add player.`);
                }

                const gameJson = await response.json();
                console.log("Updated date info");
                this.games = gameJson;
            } catch (error) {
                console.error(error.message);
            }
        },
        async approve(gameIndx) {
            const url = "./api/approveDate";
            try {
                const response = await fetch(url,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            gameIndx: gameIndx,
                        })
                    }
                );
                if (!response.ok) {
                    throw new Error(`[FATAL] Could not add player.`);
                }

                const gameJson = await response.json();
                console.log("Updated date info");
                this.games = gameJson;
            } catch (error) {
                console.error(error.message);
            }
        },
        
        setGameAmount(amount) {
            while(this.games.length < amount) {
                this.games.push(
                    null

                )
            }
        }
    },
    getters: {

    }


})
