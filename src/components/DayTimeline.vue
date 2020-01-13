<template>
  <div>
    <b-progress :max="max" height="2rem">
      <b-progress-bar :value="value">Progress:
        <strong>{{ value.toFixed(2) }} / {{ max }}</strong>
      </b-progress-bar>
    </b-progress>
  </div>
</template>

<script>
import { BProgress, BProgressBar } from "bootstrap-vue";
export default {
  components: {
    BProgress,
    BProgressBar
  },
  data() {
    return {
      value: 33.333333333,
      max: 50
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
