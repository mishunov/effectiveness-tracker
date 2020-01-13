<template>
  <div id="app">
    <div class="mb-4 actionBtn">
      <div v-if="currentTimer" class="d-flex justify-content-between">
        <b-button variant="danger" class="flex-fill mr-2" v-b-modal.stop>Stop timer</b-button>
      </div>
      <b-button v-else variant="success" class="w-100" @click="toggleTimer">Start timer</b-button>
    </div>

    <!-- <button @click="migrateCareer">Migrate</button> -->
    <div id="filter">
      <h4>Filter</h4>
      <b-form-group id="by-keyword" label="By keyword">
        <b-badge
          v-for="category in keywords"
          :key="category"
          href="#"
          pill
          :variant="selectedFilterKeywords.indexOf(category) !== -1? computeBadgeVariant(category): 'light'"
          class="mr-1"
          @click="filterBy('keywords', category)"
        >{{category}}</b-badge>
      </b-form-group>
      <b-form-group id="by-career-mapping" label="Career mapping">
        <b-form-checkbox
          v-model="careerFilter"
          name="check-button"
          switch
          @input="filterBy('career', careerFilter)"
        >Suitable for career mapping</b-form-checkbox>
      </b-form-group>
      <b-button @click="resetFilter">Reset filter</b-button>
      <!-- <b-form-group id="by-start-date" label="By date">
        <date-range-picker
          ref="picker"
          v-model="dateRange"
          opens="right"
          auto-apply
          show-week-numbers
          :date-format="dateFormat"
          :locale-data="{ firstDay: 1, format: 'DD-MM-YYYY HH:mm' }"
          @update="filterBy()"
        >
          <template
            v-slot:input="picker"
            style="min-width: 350px;"
          >{{ picker.startDate.toLocaleDateString() }} - {{ picker.endDate.toLocaleDateString() }}</template>
        </date-range-picker>
      </b-form-group>-->
    </div>

    <!-- <div>
      <b-dropdown text="Career Mapping options" id="options-form">
        <b-dropdown-form>
          <b-form-group
            v-for="careerOpt in careerMappingOptions"
            :key="careerOpt.name"
            :label="careerOpt.name"
          >
            <label v-for="prop in careerOpt.props" :key="prop.name">
              <input
                type="checkbox"
                :checked="selectedCareerOptions.indexOf(`${careerOpt.name}/${prop.name}`) !== -1? 'primary': undefined"
                @change="toggleKeyword(`${careerOpt.name}/${prop.name}`, true)"
              >
              {{prop.name}}
              <small class="d-block">{{prop.description}}</small>
            </label>
          </b-form-group>
        </b-dropdown-form>
      </b-dropdown>
    </div>-->
    <!-- <day-timeline/>

    <div>{{visibleActivities}}</div>-->
    <table v-if="entries.length" class="table table-striped table-hover">
      <thead class="thead-dark">
        <tr>
          <th>Description</th>
          <!-- <th>Start</th>
          <th>End</th>-->
          <th>Keywords</th>
          <th>Duration</th>
          <th>Career mapping</th>
        </tr>
      </thead>
      <tbody>
        <template>
          <tr v-for="(record, index) in entries" :key="index">
            <td>
              {{record.name}}
              <small v-if="record.relevantUrl" class="d-block">
                <a :href="record.relevantUrl" title target="_blank">{{record.relevantUrl}}</a>
              </small>
            </td>
            <!-- <td>{{ computeDateFormat(record.start.toDate()) }}</td>
            <td>{{ computeDateFormat(record.end.toDate()) }}</td>-->
            <td>
              <b-badge
                v-for="keyword in record.keywords"
                :key="keyword"
                :variant="computeBadgeVariant(keyword)"
                class="d-block mb-1"
              >{{keyword}}</b-badge>
            </td>
            <td
              class="text-right"
            >{{ Math.round((record.end.seconds - record.start.seconds)/60 * 100) / 100 }}min</td>
            <td class="h3 text-center">
              <b-icon v-if="record.career" icon="check-circle" variant="success"/>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <b-modal id="stop" @ok="toggleTimer">
      <template v-slot:modal-title>What were you working on?</template>
      <div>
        <b-badge
          v-for="category in keywords"
          :key="category"
          href="#"
          pill
          :variant="selectedKeywords.indexOf(category) !== -1? computeBadgeVariant(category): 'light'"
          @click="toggleKeyword(category)"
        >{{ category }}</b-badge>
        <b-badge v-for="kw in newKeywords" :key="kw" variant="primary">{{kw}}</b-badge>
      </div>
      <div class="d-block text-center my-3">
        <b-input-group size="sm" prepend="Description">
          <b-form-input v-model="rawBlockName" class="w-100" autofocus/>
        </b-input-group>
      </div>

      <div>
        <b-input-group size="sm" prepend="URL">
          <b-form-input v-model="relevantUrl" class="w-100"/>
        </b-input-group>
      </div>

      <div>
        <b-form-checkbox v-model="isCareerApplicable">Is applicable for career mapping?</b-form-checkbox>
      </div>
    </b-modal>
  </div>
</template>

<script>
import {
  BButton,
  BModal,
  BBadge,
  BDropdown,
  BDropdownItem,
  BDropdownForm,
  BFormGroup,
  BFormInput,
  BFormCheckbox,
  VBModal,
  BInputGroup,
  BIconCheckCircle,
  BIcon
} from "bootstrap-vue";
import { db } from "./db";
import firebase from "firebase/app";
// import DayTimeline from "./components/DayTimeline.vue";
import DateRangePicker from "vue2-daterange-picker";
//you need to import the CSS manually (in case you want to override it)
import "vue2-daterange-picker/dist/vue2-daterange-picker.css";

const keywordsMapping = {
  tests: "secondary",
  implementation: "success",
  meeting: "danger",
  review: "primary",
  planning: "info",
  commenting: "warning",
  app: "dark"
};

const date = new Date();
const day = date.getDate();
const month = date.getMonth();
const year = date.getFullYear();

const startDateTimestamp = firebase.firestore.Timestamp.fromDate(
  new Date(year, month, day - 1)
);
const endDateTimestamp = firebase.firestore.Timestamp.fromDate(
  new Date(year, month, day)
);

export default {
  name: "App",
  components: {
    BButton,
    BModal,
    BBadge,
    BDropdown,
    BDropdownItem,
    BDropdownForm,
    BFormGroup,
    BFormInput,
    BFormCheckbox,
    BInputGroup,
    BIconCheckCircle,
    BIcon,
    DateRangePicker
    // DayTimeline
  },
  directives: {
    "b-modal": VBModal
  },
  data() {
    return {
      rawBlockName: "",
      relevantUrl: "",
      origEntries: [],
      entries: [],
      misc: [],
      selectedKeywords: [],
      selectedFilterKeywords: [],
      selectedCareerOptions: [],
      visibleActivities: [],
      isCareerApplicable: false,
      careerFilter: false
    };
  },
  firestore: {
    origEntries: db.collection("entries").orderBy("start", "desc"),
    misc: db.collection("misc"),
    visibleActivities: db
      .collection("entries")
      .where("start", ">=", startDateTimestamp)
      .where("start", "<=", endDateTimestamp)
      .orderBy("start", "desc")
  },
  watch: {
    origEntries(val) {
      this.entries = val;
    }
  },
  computed: {
    keywords() {
      return this.misc && this.misc[0] && this.misc[0].keywords;
    },
    careerMappingOptions() {
      return this.misc && this.misc[0] && this.misc[0].career;
    },
    currentTimer() {
      return this.misc && this.misc[0] && this.misc[0].currentTimer;
    },
    newKeywords() {
      if (this.rawBlockName.indexOf("kws:") !== -1) {
        return this.rawBlockName.split("kws:")[1].split(/,\s*/);
      }
      return [];
    },
    timeBlockName() {
      return this.rawBlockName.split(" kws:")[0] || this.rawBlockName;
    }
  },
  methods: {
    migrateCareer() {
      this.entries.forEach(entry => {
        if (!entry.hasOwnProperty("career")) {
          // console.log(entry.id);
          console.log(JSON.stringify(entry));
          // db.collection("entries")
          // .doc(entry.id)
          // .set(
          //   {
          //     career: false
          //   },
          //   { merge: true }
          // );
        }
      });
    },
    dateFormat(classes, date) {
      if (!classes.disabled) {
        classes.disabled = date.getTime() > new Date();
      }
      return classes;
    },
    resetFilter() {
      this.entries = this.origEntries;
      this.careerFilter = false;
      this.selectedFilterKeywords = [];
    },
    filterBy(field, value) {
      if(field === 'keywords' && value) {
        this.selectedFilterKeywords.push(value);
      } else if (field === 'keywords' && !value) {
        this.selectedFilterKeywords = this.selectedFilterKeywords.filter(kw => kw !== value);
      }
      const filteredList = this.entries.filter(entry => {
        switch (field) {
          case "keywords":
            return entry[field].indexOf(value) !== -1;
          case "career":
            return entry[field] === value;
          default:
          return false
        }
      });
      this.entries = filteredList;
    },
    dateTimestamp({ year, month, day }) {
      return firebase.firestore.Timestamp.fromDate(new Date(year, month, day));
    },
    computeBadgeVariant(keyword) {
      return keywordsMapping[keyword] || "light";
    },
    toggleKeyword(category, prefixed = false) {
      const target = prefixed ? "selectedCareerOptions" : "selectedKeywords";
      const resArray = this[target];
      let res;
      if (resArray.indexOf(category) !== -1) {
        res = resArray.filter(keyword => keyword !== category);
      } else {
        res = [...resArray, category];
      }
      this.$set(this, target, res);
    },
    computeDateFormat(date) {
      const formatted = new Date(date);
      return (
        ("0" + formatted.getUTCDate()).slice(-2) +
        "/" +
        ("0" + (formatted.getUTCMonth() + 1)).slice(-2) +
        " " +
        ("0" + formatted.getUTCHours()).slice(-2) +
        ":" +
        ("0" + formatted.getUTCMinutes()).slice(-2)
      );
    },
    toggleTimer() {
      if (this.currentTimer) {
        db.collection("entries").add({
          name: this.timeBlockName,
          start: this.currentTimer,
          end: firebase.firestore.FieldValue.serverTimestamp(),
          keywords: [...this.selectedKeywords, ...this.newKeywords],
          relevantUrl: this.relevantUrl,
          career: this.isCareerApplicable
        });
        db.collection("misc")
          .doc(this.misc[0].id)
          .set({
            keywords: [...this.keywords, ...this.newKeywords],
            career: this.careerMappingOptions
          });
        this.selectedKeywords = [];
        this.timeBlockName = "";
      } else {
        db.collection("misc")
          .doc(this.misc[0].id)
          .set(
            {
              currentTimer: firebase.firestore.FieldValue.serverTimestamp()
            },
            { merge: true }
          );
      }
    }
  }
};
</script>

<style>
#app {
  padding: 2rem;
}
.actionBtn button {
  padding: 2rem;
  text-transform: uppercase;
}
#options-form [role="menu"] {
  width: 50vw;
}
</style>
