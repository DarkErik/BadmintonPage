<template>
    <tr :class="[gameColorClass, 'h-12 border-x-2 border-gray-100']" @click="toggleRow()">
        <td class="text-right"> {{ game.host }}</td>
        <td class="text-center w-12">{{ game.score }}</td>
        <td class="text-left"> {{ game.guest }}</td>
        <td class="text-center" @mouseenter="dateHovered = true" @mouseleave="dateHovered = false"><!--@click="toggleComments = !toggleComments"-->
                {{ changedDate===null ? formatDate(game.time) : (formatDate(changedDate[0]) + (changedDate[1] ? "" : "⚠️")) }}
        </td>
        <td> <a :href="game.locationLink"> {{ game.location != null ? game.location.split(",")[1] : "" }}</a></td>
    </tr>
    <tr v-show="isVisible" class="border-gray-400  border-b-2 border-r-2 border-l-2"  @mouseenter="commentsSegmentHovered = true" @mouseleave="commentsSegmentHovered = false"> <!-- SHOW COMMENTS MENUE--><!--dateHovered || commentsSegmentHovered || toggleComments-->
        <td colspan="5">
            <div class="text-l">Spiel Link: <a :href="game.matchLink">DBV-Website</a></div>
            <div v-if="changedDate !== null" class="text-l">Verbandsangesetzter Spieltermin: {{ formatDate(game.original_time) }}</div>
            <div v-if="changedDate !==null && !changedDate[1]" class="flex text-l italic gap-5">Automatisch ermittelter Spieltermin, bitte prüfen. <button @click="dateStore.approve(props.gameIndx)" class="px-5 overflow-hidden rounded-lg border-2 border-gray-300 bg-red-500 text-gray-700 font-semibold hover:outline-none hover:ring-0 hover:ring-blue-500 hover:border-blue-500 ">Spieltermin bestätigen</button></div>
            <table class="w-full"><tbody><tr>
                <td>
                    <div class="text-xl font-bold">
                        Kommentare: <p class="text-sm">{{ game.comments.length == 0 ? "Keine": "" }}</p>
                    </div>
                </td>
                <td class="text-right">
                    Spieltermin ändern:
                    <input v-model="newDate" class="input" placeholder="Datum eingeben">
                    <button @click="dateStore.changeDate(newDate, props.gameIndx)" class="btn">Speichern</button>
                </td>
                
            </tr></tbody></table>
            <table class="w-full">
                <tbody>
                    <tr v-for="(comment, commentIndx) in game.comments" :key="commentIndx" class="odd:bg-white even:bg-blue-50 hover:bg-blue-100 border-2 border-black rounded-xs">
                        <td>{{ comment[0] }}</td>
                        <td>{{ comment[1] }}</td>
                    </tr>
                </tbody>
            </table>
        </td>
    </tr>
    <tr v-show="isVisible && containsDetailedScores" class="border-gray-400 border-b-2 border-r-2 border-l-2">
        <td colspan="5">
            <Transition name="expand">
                <div v-show="isVisible && containsDetailedScores">
                    <table class="w-full">
                        <tr v-for="(gameResult, index) in game.detailScores" :key="index" class="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                            <td> <p>{{ gameResult.type }}</p> </td>
                            <td>
                                <table class="w-full">
                                    <tbody>
                                        <tr v-for="(player, playerIndx) in gameResult.host_player" :key="playerIndx"><td class="text-right">{{ player }}</td></tr>
                                    </tbody>
                                </table>
                            </td>
                            <td class="px-1 text-center">vs.</td>
                            <td>
                                <table class="w-full">
                                    <tbody>
                                        <tr v-for="(player, playerIndx) in gameResult.guest_player" :key="playerIndx"><td class="text-left">{{ player }}</td></tr>
                                    </tbody>
                                </table>
                            </td>
                            <td> {{ gameResult.sets[0] ?? "" }}</td>
                            <td> {{ gameResult.sets[1] ?? "" }}</td>
                            <td> {{ gameResult.sets[2] ?? "" }}</td>
                            <!---<td v-for="(set, setIndx) in gameResult.sets" :key="setIndx"> {{ set }}</td>-->
                        </tr>
                    </table>
                </div>
            </Transition>
        </td>
    </tr>

    <tr v-show="isVisible && !containsDetailedScores" class="border-gray-400 border-b-2 border-r-2 border-l-2 ">
        <td colspan="5">
            <Transition name="expand">
                <div v-show="isVisible && !containsDetailedScores">
                    <table class="w-full">
                        <thead class="bg-gray-200">
                            <tr>
                                <th colspan="2" class="py-1 text-center font-semibold text-gray-800">{{mini ? "Minis" : "Männer"}} {{ computedRegisteredMans }}/4</th>
                                <th v-if="!mini" colspan="2" class="py-1 text-center font-semibold text-gray-800">Frauen {{ computedRegisteredWoman }}/2</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            
                            <tr v-for="(player, playerIndx) in (playerStore.getPlayersTableformats[props.gameIndx])" :key="playerIndx" class="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                                <td class="py-1"> <div v-if="player.man !== '|LAST|' && player.man  !== ''">{{ playerIndx + 1 }}.</div> </td>
                                <td v-if="player.man !== '|LAST|' && player.man  !== ''" @mouseover="hoveredLine = playerIndx; hoverMan = true;" @mouseleave="hoveredLine = -1">
                                    {{ player.man }}
                                    <button v-if="hoveredLine == playerIndx && hoverMan" @click="playerStore.removePlayer(player.man, props.gameIndx, true)" class="btn hover:text-red-800">X</button>
                                </td>
                                <td v-if="player.man === '|LAST|'" class="space-x-1">
                                    <input v-model="newManName" class="input" placeholder="Namen eingeben">
                                    <button @click="playerStore.addPlayer(newManName, props.gameIndx, true, newManMaybe)" class="btn">Absenden</button>
                                    <div>
                                        <label class="cursor-pointer">
                                            <input v-model="newManMaybe" type="checkbox" class="w-4 h-4">
                                            <p class="inline-flex p-1 text-center">Ersatz</p>
                                        </label>
                                    </div>
                                </td>
                                <td v-if="player.man === '' "></td>

                                <td v-if="!mini"> <div v-if="player.woman !== '|LAST|' && player.woman  !== ''">{{ playerIndx + 1 }}.</div> </td>
                                <td v-if="!mini && player.woman !== '|LAST|' && player.woman  !== ''" @mouseover="hoveredLine = playerIndx; hoverMan = false;" @mouseleave="hoveredLine = -1">
                                    {{ player.woman }}
                                    <button v-if="hoveredLine == playerIndx && !hoverMan" @click="playerStore.removePlayer(player.woman, props.gameIndx, false)" class="btn hover:text-red-800">X</button>
                                </td>
                                <td v-if="!mini && player.woman === '|LAST|'" class="space-x-1">
                                    <input v-model="newWomanName" placeholder="Namen eingeben" class="input">
                                    <button @click="playerStore.addPlayer(newWomanName, props.gameIndx, false, newWomanMaybe)" class="btn">Absenden</button>
                                    <div>
                                        
                                        <label class="cursor-pointer">
                                            <input v-model="newWomanMaybe" type="checkbox" class="w-4 h-4">
                                            <p class="inline-flex p-1 text-center">Ersatz</p>
                                        </label>
                                    </div>
                                </td>
                                <td v-if="!mini && player.woman === '' "></td>

                            </tr>
                        </tbody>
                    </table>
                </div>
            </Transition>
        </td>
    </tr>
</template>

<script setup>
    import { defineProps, ref, computed} from 'vue';
    import { usePlayerStore } from '../stores/gamePlayerStore';
    import { useGameInfoStore } from '../stores/gameInfoStore';
    import {useDateStore}from "../stores/gameDateStore";
    import { mini } from "../stores/teamInfo.js";

    const isVisible = ref(false);

    const props = defineProps({
        gameIndx: Number,  // consists of .host, .guest, .score, .detailScores?, .players??
    });

    console.log("Gameindx: " + props.gameIndx);

    const gameInfoStore = useGameInfoStore();
    const playerStore = usePlayerStore();
    const dateStore = useDateStore();
    
    const game = computed(
        () => {
        return gameInfoStore.games[props.gameIndx];}
    );

    const players = computed(
        () => {return playerStore.games[props.gameIndx];}
    );

    const changedDate = computed(
        () => {return dateStore.games[props.gameIndx];}  
    );

    const containsDetailedScores = computed(
        () => {
            return game.value.detailScores.length > 0; 
        }
    );

    const computedRegisteredMans = computed(
        () => { return players.value.registeredMans.length + players.value.registeredMaybeMans.length; }
    );

    const computedRegisteredWoman = computed(
        () => { return players.value.registeredWoman.length + players.value.registeredMaybeWoman.length; }
    );


    const gameColorClass = computed(
        () => {
            const lower_color_value = "100";
            const upper_color_value = "200";
            const selected_color_value = "400";

            let value = selected_color_value;
            if (!isVisible.value)
                value = (props.gameIndx % 2 == 0 ? lower_color_value : upper_color_value)

            if (containsDetailedScores.value)
                return "bg-blue-" + value;
            if ((!mini && computedRegisteredMans.value >= 4 && computedRegisteredWoman.value >= 2) || (mini && computedRegisteredMans.value >= 4))
                return "bg-green-" + value;
            return "bg-red-" + value;
        }
    );

    function toggleRow() {
        isVisible.value = !isVisible.value;
    };

    function formatDate(isoString) {
        const date = new Date(isoString);

        const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

        const weekday = weekdays[date.getUTCDay()];

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${weekday}. ${day}.${month}.${year}, ${hours}:${minutes}`;
    }

    const dateHovered = ref(false);
    const commentsSegmentHovered = ref(false);
    



    const newManName = ref("");
    const newManMaybe = ref(false);
    const newWomanName = ref("");
    const newWomanMaybe = ref(false);
    const hoveredLine = ref(-1);
    const hoverMan = ref(true);
    
    const newDate = ref("");
    const toggleComments = ref(false);
    
</script>

<style>
.popup {
  position: absolute;
  bottom: calc(100% + 10px); /* above element */
  left: 50%;
  transform: translateX(-50%);

  min-width: 250px;
  padding: 16px;

  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  z-index: 1000;
}
</style>