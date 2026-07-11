<template>
    <div class="p-2">
        <p>Kopiere die URL <a :href="webcalURL">{{webcalURL}}</a> als externen Kalender in die Kalender-App deiner Wahl.</p><br>
        <p>Für Google drücke den untenliegenden Knopf und füge die URL in das "URL für Kalender" Feld. Drücke anschließend "Kalender hinzufügen".</p>
        <button @click="copyURL()" class="btn">Subscribe for Google Calender</button>
        <p class="text-xs">Falls der Kalender nicht auf der Handy-App angezeigt wird: Gehe in Kalender Settings (Drei Strich Menu -> Settings). Under den Kalendern sollte nun der https://tg.dondevelops... Kalender auftauchen (evntl. unter "Mehr anzeigen"). Darauf klicken und dann Synchronisierne Einschalte. In den Settings kann nun der Kalender per Checkbox aktiviert werden.</p>
    </div>
</template>

<script setup>
    import { ref } from "vue";
    import {teamUrl} from "../stores/teamInfo";

    const webcalURL = ref("www.still_loading....");
    webcalURL.value = window.location.href + "api/calendar.ics";

    function copyURL() {
        navigator.clipboard.writeText(
            `${window.location.href}api/calendar.ics`
        );

        window.open(
            "https://calendar.google.com/calendar/u/0/r/settings/addbyurl"
        )
    }

        
</script>