import {defineStore} from "pinia"

const BACKEND_URL = "https://tg.dondevelops.de"; // "http://localhost:3122"

export const usePlayerStore = defineStore("player", {
    state: () => {
        return {
            games: [
                {
                    registeredMans: ["Erik"],
                    registeredMaybeMans: ["Pascal"],
                    registeredWoman: ["Julia", "Vivi"],
                    registeredMaybeWoman: ["Johanna"],
                },
                {
                    registeredMans: ["Erik"],
                    registeredMaybeMans: ["Pascal"],
                    registeredWoman: ["Julia", "Vivi"],
                    registeredMaybeWoman: ["Johanna"]
                }
            ]
        };
    },
    actions: {
         async update() {
            const url = BACKEND_URL + "/api/players";
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`[FATAL] Could not fetch players.`);
                }

                const gameJson = await response.json();
                //console.log(JSON.stringify(gameJson));
                console.log("Updated player info");
                this.games = gameJson;
            } catch (error) {
                console.error(error.message);
            }

        },

        async addPlayer(name, gameIndx, man = true, maybe = false) {
            let g = this.games[gameIndx];
            if (name == "")
                return;
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
            
            const url = BACKEND_URL + "/api/addplayer";
            try {
                const response = await fetch(url,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: name,
                            man: man,
                            maybe: maybe,
                            gameIndx: gameIndx
                        })
                    }
                );
                if (!response.ok) {
                    throw new Error(`[FATAL] Could not add player.`);
                }

                const gameJson = await response.json();
                console.log("Updated player info");
                this.games = gameJson;
            } catch (error) {
                console.error(error.message);
            }
        },
        async removePlayer(name, gameIndx, man = true) {
            let game = this.games[gameIndx];
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

            const url = BACKEND_URL + "/api/removeplayer";
            try {
                const response = await fetch(url,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: name,
                            man: man,
                            gameIndx: gameIndx
                        })
                    }
                );
                if (!response.ok) {
                    throw new Error(`[FATAL] Could not remove player.`);
                }

                const gameJson = await response.json();
                console.log("Updated player info");
                this.games = gameJson;
            } catch (error) {
                console.error(error.message);
            }
        },
        setGameAmount(amount) {
            while(this.games.length < amount) {
                this.games.push(
                    {
                        registeredMans: [],
                        registeredMaybeMans: [],
                        registeredWoman: [],
                        registeredMaybeWoman: []
                    }

                )
            }
        }
    },
    getters: {
        getPlayersTableformats() {
            let result = [];
            for(let i = 0; i < this.games.length; i++) {
                if (!("registeredMans" in this.games[i])) {
                    result.push([]);
                    continue;
                }
                let list = [];
                let mans = this.games[i].registeredMans.concat(this.games[i].registeredMaybeMans.map( x => "(" + x + ")"));
                let woman = this.games[i].registeredWoman.concat(this.games[i].registeredMaybeWoman.map( x => "(" + x + ")"));

                mans.push("|LAST|");  
                woman.push("|LAST|");
                
                let indx = 0;
                while(indx < mans.length || indx < woman.length) {
                    let element = {};
                    element["man"] = indx < mans.length ? mans[indx] : "";
                    element["woman"] = indx < woman.length ? woman[indx] : "";
                    list.push(element);
                    indx++;
                }

                result.push(list);
            }
            return result;
        }
    }


})