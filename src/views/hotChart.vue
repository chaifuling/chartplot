<template>
  <div class="days-hours-heatmap">
    <div v-if="false">
      <!-- calibration and render type controller -->
      <div class="calibration" role="calibration">
        <div class="group" role="example">
          <svg width="120" height="17"></svg>
          <div role="description" class="description">
            <label>Less</label>
            <label>More</label>
          </div>
        </div>
        <div role="toggleDisplay" class="display-control">
          <div>
            <input type="radio" name="displayType" checked />
            <label>count</label>
          </div>
          <div>
            <input type="radio" name="displayType" />
            <label>daily</label>
          </div>
        </div>
      </div>
      <!-- heatmap -->
      <svg id="hotChart" role="heatmap" class="heatmap"></svg>
    </div>

    <svg id="hotCharts" role="hotCharts" class="hotCharts"></svg>
    <div id="colorBar" role="colorBar" class="colorBar">
      <div
        style="width: 100px; font-weight: bold; position: absolute; top: -30px"
      >
        Log10(TPM)
      </div>
    </div>
    <div id="showRectInfo" class="showRectInfo"></div>
    <div id="hotInfo" ></div>
    <div class="heatmap_tooltip"></div>
    <div id="heatmap"></div>
  </div>
</template>

<script>
import { createHotChart } from "./hotChart";
import { createHotDate,chart} from "./hotDate";
import {createHeatMapChart} from "@/utils/HeatMapChart/HeatMapChart"
export default {
  data() {
    return {};
  },
  methods: {},
  mounted() {
    //  createHotChart();
   // createHotDate();
  // createHotPlot()
 createHeatMapChart()
  },
};
</script>

<style>
body {
  font-family: arial, "Hiragino Sans GB", Tahoma, Arial, Helvetica, STHeiti;
  font-size: 14px;
  font-weight: bold;
}
.days-hours-heatmap {
  padding: 20px 0 20px 0;
  width: 600px;
  margin: 0 auto;
}
.days-hours-heatmap .calibration {
  margin-bottom: 15px;
  width: 400px;
}
.days-hours-heatmap .calibration .group {
  display: inline-block;
}
.days-hours-heatmap .calibration .description {
  width: 108px;
}
.days-hours-heatmap .calibration .description > label:last-child {
  float: right;
}
.days-hours-heatmap .calibration > .display-control {
  float: right;
}
.days-hours-heatmap .calibration > .display-control label {
  vertical-align: top;
}
.days-hours-heatmap .calibration > .display-control input[type="radio"] {
  cursor: pointer;
}

.days-hours-heatmap .heatmap .axis path {
  display: none;
}
.days-hours-heatmap .heatmap .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
.days-hours-heatmap .heatmap .axis text {
  font-size: 12px;
}
.showRectInfo {
  min-width: 30px;
  height: 30px;
  background: #00000083;
  color: #ffffff;
  position: absolute;
  z-index: 999;
  padding: 10px;
  text-align: center;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  position: absolute;
  top: 0;
}
.colorBar {
  position: absolute;
  right: 15px;
  top: 100px;
}
.rect {
  width: 100px;
  height: 30px;
}
.heatmap_tooltip {
  font-family: simsun;
  font-size: 13px;
  width: 120;
  height: auto;
  position: absolute;
  text-align: left;
  border-style: solid;
  border-width: 1px;
  background-color: white;
  border-radius: 5px;
}
.link {
  fill: none;
  stroke: #555555;
  stroke-width: 2px;
  shape-rendering: crispEdges;
}
.theme-dark .link {
  stroke: #555555;
  stroke-width: 2px;
}

</style>
