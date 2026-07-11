<template>
    <button @click="copyURL()" class="btn">Subscribe Google Calender</button>
</template>

<script setup>

    import {teamUrl} from "../stores/teamInfo";

    function copyURL() {
        navigator.clipboard.writeText(
            `${window.location.href}/api/calender.ics`
        );

        window.open(
            "https://calendar.google.com/calendar/u/0/r/settings/addbyurl"
        )
    }

        
</script>