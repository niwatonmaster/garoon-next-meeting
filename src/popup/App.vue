<template>
  <main>
    <div v-for="event in events">
      <div class="card card-skin" v-bind:class="{ recent: event.recent }">
        <div>
          <div class="card-titletext">{{ event.subject }}</div>
          <div class="card-overviewtext">時間: {{ event.startStr }}-{{ event.endStr }}</div>
          <div class="link">
            <a class="link-content" :href="event.eventLink" target="_blank" rel="noopener noreferrer">Garoon </a>
            <a v-if="event.facilityNumber > 0" class="link-content" :href="event.facilityLink" target="_blank"
               rel="noopener noreferrer">{{ event.facilityName }}</a> <div v-if="event.facilityNumber >= 2">他{{event.facilityNumber - 1}}件</div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import {getSchedule} from "./getSchedule";
import {convertEventForVue} from "./convertEventForVue";

export default {
  data() {
    return {
      message: name,
      events: []
    };
  },
  async created() {
    // Garoonからスケジュールを取得する
    const eventsFromGaroon = await getSchedule();
    await console.log("events", eventsFromGaroon);
    // スケジュールをvueで表示する形に変換する
    const eventsForVue = await convertEventForVue(eventsFromGaroon);
    await console.log("eventsForVue", eventsForVue);

    // vueで描画する
    this.events = eventsForVue;
  }
};

</script>
<style>
main {
  min-width: 320px;
  max-height: 560px;
}

.card{
  width: auto;
  height: auto;
  padding: 10px;
}
.card-skin{
  box-shadow: 2px 2px 6px rgba(0,0,0,.4);
  mergin: 100px;
  padding: 10px;
}

.recent{
  background: #ffff00;
}

.card-titletext{
  font-size: 13px;
  line-height: 125%;
}
.card-overviewtext{
  font-size: 13px;
  line-height: 150%;
}

.link {
  display: flex;
  align-items: center;
  font-size: 12px;
  padding: 0px 5px;
}

.link-content {
  padding: 0px 3px;
}
</style>
