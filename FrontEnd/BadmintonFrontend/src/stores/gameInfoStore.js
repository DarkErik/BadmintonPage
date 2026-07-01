import {defineStore} from "pinia"

import { usePlayerStore } from "./gamePlayerStore";

const BACKEND_URL = "https://tg.dondevelops.de"; // "http://localhost:3122"

export const useGameInfoStore = defineStore("gameInfoStore", {
    state: () => {
        return {
            games: [
            {
                host: "TG",
                guest: "Altena",
                score: "10-20",
                detailScores: [
                    {
                        name1: "Erik",
                        name2: "Joachim",
                        sets: [
                            "21-10",
                            "10-21",
                            "29-27"
                        ]
                    },
                    {
                        name1: "Fredde",
                        name2: "Q",
                        sets: [
                            "21-10",
                            "10-21",
                            "22-24"
                        ]
                    },

                ],
                comments: []
            },
            {
                host: "Brenschede",
                guest: "TG",
                score: "? - ?",
                detailScores: [],
                comments: []
            }
        ]
        };
    },
    actions: {
        async update() {
            const url = BACKEND_URL + "/api/gameinfo";
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`[FATAL] Could not fetch games.`);
                }

                const gameJson = await response.json();
                //console.log(JSON.stringify(gameJson));
                console.log("Updated static game info");
                console.log(gameJson);
                usePlayerStore().setGameAmount(gameJson.length);
                this.games = gameJson;
            } catch (error) {
                console.error(error.message);
            }

        }
        
    },
    getters: {
        
    }


})