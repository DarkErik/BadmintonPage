<template>
    <p class="text-6xl text-center font-bold w-full text-gray-800">Spielübersicht</p>
    <p class="text-3xl text-center font-bold w-full text-gray-600 pb-10">{{teamname}}</p>

    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <table class="w-full table-fixed">
            <MatchTableRow v-for="(game, index) in store.games" :key="index" :gameIndx="index"/>
        </table>
    </div>
</template>

<script setup>
    import MatchTableRow from './MatchTableRow.vue'
    import { useGameInfoStore } from '../stores/gameInfoStore';
    import { usePlayerStore } from '../stores/gamePlayerStore';
    import { useDateStore } from '../stores/gameDateStore.js';
    import {teamname} from "../stores/teamInfo.js"
    import { ref } from 'vue';

    const store = useGameInfoStore();
    store.update();
    const playerStore = usePlayerStore();
    playerStore.update();

    const gameDateStore = useDateStore();
    gameDateStore.update();
    

        
</script>