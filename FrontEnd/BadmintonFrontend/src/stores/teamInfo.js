
import { ref } from 'vue';

const url = "./api/teaminfo";
export const teamname = ref("Spiel Übersicht");

export const mini = ref(false);
export const teamUrl = ref("ERROR");

fetch(url,
    {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }
).then(response => {
    if (!response.ok) {
        throw new Error(`[FATAL] Could get teamname.`);
    }
    response.json().then( json => {
        teamname.value = json.teamname;
        mini.value = json.mini;
        teamUrl.value = json.teamUrl;

        document.title = "TG Bochum " + teamUrl.value.toUpperCase();
    });
    
});

