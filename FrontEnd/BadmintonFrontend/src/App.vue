<script setup>
import MatchTable from './components/MatchTable.vue'
import SubscribeCalenderButton from './components/SubscribeCalenderButton.vue';
</script>

<template>
  <main class="w-full flex justify-center">
    <div class="w-full max-w-3xl ">
      <MatchTable />
      <SubscribeCalenderButton class="mt-4"/>
    </div>
  </main>
</template>
