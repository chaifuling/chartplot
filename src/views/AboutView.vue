<template>
  <div class="about">
    <svg id="chart" height="300"></svg>
    <svg id="svgs" width="320" height="220"></svg>
    <svg id="strup" width="720" height="120"></svg>
    <svg id="scatterplot" width="600" height="300"></svg>
    <svg id="barChart" width="1000" height="300"></svg>
    <input
      v-model="xmax"
      placeholder=""
      placeholder-class="input-placeholder"
      @input="handlexmax"
    />
    <input
      v-model="ymax"
      placeholder=""
      placeholder-class="input-placeholder"
      @input="handleymax"
    />
    <table></table>
  </div>
</template>

<script>
import * as d3 from "d3";
import { ForceGraph } from "./froce.js";
import miserablesDate from "./miserables.json";

export default {
  data() {
    return {
      g: "",
      xmax: 0,
      ymax: 0,
      plot: "",
      text: "",
      xscale: "",
      yscale: "",
      dataset: [],
    };
  },
  methods: {
    handlexmax(e) {
      this.x = e.target.value;
      this.setPlot(this.x, this.y);
    },
    handleymax(e) {
      this.y = e.target.value;
      this.setPlot(this.x, this.y);
    },
    setPlot(x = 0, y = 0) {
      this.plot
        .data(this.dataset)
        .transition()
        .duration(750)
        .attr("cx", (d) => this.xscale(x || d[0]))
        .attr("cy", this.yscale(y || d[1]));
      this.text
        .transition()
        .duration(750)
        .attr("x", this.xscale(x || d[0]))
        .attr("y", this.yscale(y || d[1]));
    },
    // 柱形图
    columnChart() {
      // TODO: 长方向条
      let dataset = [
        5, 10, 13, 19, 21, 25, 22, 18, 15, 13, 11, 12, 15, 20, 18, 17, 16, 18,
        23, 25,
      ];
      dataset = dataset.map((item) => {
        item = {
          id: item,
        };
        return item;
      });
      const rectChart = d3.select("#chart");
      const rectGrop = rectChart
        .selectAll("g")
        .data(dataset)
        .enter()
        .append("g")
        .attr("x", 0)
        .attr("transform", (d, i) => {
          return `translate(${(i + 1) * 26},0)`;
        })
        .style("width", 500)
        .style("height", 300);
      rectGrop
        .selectAll("rect")
        .data(function (d) {
          return [d.id];
        })
        .enter()
        .append("rect")
        .attr("x", (d) => {
          return 0;
        })
        .attr("y", (d, i) => {
          return 200 - d * 4;
        })
        .attr("fill", function (d) {
          return "rgb(0, 0, " + d * 10 + ")";
        })
        .style("margin-right", "3px")
        .style("height", (d) => d * 4 + "px")
        .transition()
        .duration(750)
        .style("width", () => {
          return 500 / dataset.length + "px";
        });
      rectGrop
        .selectAll("text")
        .data((d) => [d.id])
        .enter()
        .append("text")
        .text((d) => d)
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .attr("x", 5)
        .attr("y", (d, i) => {
          return 215 - d * 4;
        });
    },

    // 条形图
    barChart() {
      let transform = d3.transition().duration(750);
      const data = [
        [
          {
            State: ["ND", 0.065 * 100],
            Total: 641481,
            "Under 5 Years": 0.065,
            "5 to 13 Years": 0.105,
            "14 to 17 Years": 0.053,
            "18 to 24 Years": 0.129,
            "16 Years and Over": 0.804,
            "18 Years and Over": 0.777,
            "15 to 44 Years": 0.41,
            "45 to 64 Years": 0.26,
            "65 Years and Over": 0.147,
            "85 Years and Over": 0.028,
          },
        ],
        [
          {
            State: ["MD", 0.55 * 100],
            Total: 641481,
            "Under 5 Years": 0.55,
            "5 to 13 Years": 0.105,
            "14 to 17 Years": 0.053,
            "18 to 24 Years": 0.129,
            "16 Years and Over": 0.804,
            "18 Years and Over": 0.777,
            "15 to 44 Years": 0.41,
            "45 to 64 Years": 0.26,
            "65 Years and Over": 0.147,
            "85 Years and Over": 0.028,
          },
        ],
        [
          {
            State: ["ZD", 0.129 * 100],
            Total: 641481,
            "Under 5 Years": 0.129,
            "5 to 13 Years": 0.105,
            "14 to 17 Years": 0.053,
            "18 to 24 Years": 0.129,
            "16 Years and Over": 0.804,
            "18 Years and Over": 0.777,
            "15 to 44 Years": 0.41,
            "45 to 64 Years": 0.26,
            "65 Years and Over": 0.147,
            "85 Years and Over": 0.028,
          },
        ],
        [
          {
            State: ["XD", 0.704 * 100],
            Total: 641481,
            "Under 5 Years": 0.704,
            "5 to 13 Years": 0.105,
            "14 to 17 Years": 0.053,
            "18 to 24 Years": 0.129,
            "16 Years and Over": 0.804,
            "18 Years and Over": 0.777,
            "15 to 44 Years": 0.41,
            "45 to 64 Years": 0.26,
            "65 Years and Over": 0.147,
            "85 Years and Over": 0.028,
          },
        ],
        [
          {
            State: ["UD", 0.028 * 100],
            Total: 641481,
            "Under 5 Years": 0.028,
            "5 to 13 Years": 0.105,
            "14 to 17 Years": 0.053,
            "18 to 24 Years": 0.129,
            "16 Years and Over": 0.804,
            "18 Years and Over": 0.777,
            "15 to 44 Years": 0.41,
            "45 to 64 Years": 0.26,
            "65 Years and Over": 0.147,
            "85 Years and Over": 0.028,
          },
        ],
        [
          {
            State: ["ID", 0.147 * 100],
            Total: 641481,
            "Under 5 Years": 0.147,
            "5 to 13 Years": 0.105,
            "14 to 17 Years": 0.053,
            "18 to 24 Years": 0.129,
            "16 Years and Over": 0.804,
            "18 Years and Over": 0.777,
            "15 to 44 Years": 0.41,
            "45 to 64 Years": 0.26,
            "65 Years and Over": 0.147,
            "85 Years and Over": 0.028,
          },
        ],
      ];
      const barchartSvg = d3.select("#barChart");
      const g = barchartSvg
        .selectAll("g")
        .data([1])
        .enter()
        .append("g")
        .attr("transform", "translate(40,20)");
      const cg = g
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", (d, i) => {
          return `translate(0,${(i + 1) * 20})`;
        })
        .style("fill-opacity", 1);
      const rect = cg
        .selectAll("rect")
        .data((d) => {
          return d;
        })
        .enter()
        .append("rect")
        .attr("y", function (d) {
          return d; //Height minus data value
        })
        .attr("class", "vlaue")
        .style("height", 19)
        .transition(transform)
        .style("width", (d, i) => d["Under 5 Years"] * 1000 + "px")
        .style("fill", "#4285f4");

      const textlabe = cg
        .selectAll("text")
        .data((d) => {
          return d[0].State;
        })
        .enter()
        .append("text")
        .attr("class", "lable")
        .attr("dy", ".35em")
        .style("font-size", "16px")
        .style("font-weight", 400)
        .attr("y", 9.5)
        .transition(transform)
        .attr("x", (d) => (typeof d == "number" ? d * 10 : -25))
        .text((d) => (typeof d == "number" ? Math.floor(d) + "%" : d));

      cg.exit()
        .transition(transform)
        .attr("x", (d) => 0)
        .text((d) => 0)
        .remove();
    },

    // 圆
    circle() {
      d3.select("#svgs")
        .selectAll("circle")
        .data([20, 60, 120, 240])
        .enter()
        .append("circle")
        .attr("fill", (d) => {
          return `rgb(${d + Math.random() * 100}, ${
            Math.random() * 100
          }, ${d},${d / 100})`;
        })
        .attr("stroke", (d) => {
          return `rgb(${d + Math.random() * 100 + 20}, ${
            Math.random() * 100 + 10
          }, ${d},${d / 100})`;
        })
        .data([32, 57, 112, 240])
        .attr("r", (d) => {
          return 20;
        })
        .attr("cy", 130)
        .transition()
        .duration(750)
        .attr("stroke-width", 10)
        .attr("opacity", (d) => d / 100)
        .attr("cx", (d) => d);
    },

    // 散点图
    scatterplot() {
      const padding = 20;
      const scale = d3.scaleLinear;
      const svg = d3.select("#scatterplot");
      const w = document.querySelector("#scatterplot").clientWidth;
      const h = document.querySelector("#scatterplot").clientHeight;
      const dataset = [
        [5, 20],
        [480, 90],
        [250, 50],
        [100, 33],
        [330, 95],
        [410, 12],
        [475, 44],
        [25, 67],
        [85, 21],
        [220, 88],
        [600, 150],
      ];
      const xscale = scale()
        .domain([
          0,
          d3.max(dataset, function (d) {
            return d[0];
          }),
        ])
        .range([padding, w - padding * 2]);

      const yscale = scale()
        .domain([
          0,
          d3.max(dataset, function (d) {
            return d[1];
          }),
        ])
        .range([h - padding, padding]);
      const rScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(dataset, function (d) {
            return d[1];
          }),
        ])
        .range([2, 5]);
      const xAxis = d3.axisBottom(xscale).tickPadding([0]).tickSizeOuter([0]);
      const yAxis = d3.axisLeft(yscale).tickPadding([0]).tickSizeOuter([0]);
      const plot = svg
        .selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle");
      plot.attr("cx", (d) => xscale(d[0]));
      plot.attr("cy", (d) => yscale(d[1]));
      plot.attr("r", (d) => rScale(d[1]));
      plot.style("fill", (d) => `rgb(255,${d[0]},${d[1]})`);
      const text = svg.selectAll("text").data(dataset).enter().append("text");
      text
        .attr("x", function (d) {
          return xscale(d[0] - 20);
        })
        .attr("y", function (d) {
          return yscale(d[1]);
        })
        .text((d) => `${d[0]},${d[1]}`)
        .style("font-size", "12px")
        .style("fill", "red");
      this.plot = plot;
      this.text = text;
      this.xscale = xscale;
      this.yscale = yscale;
      this.dataset = dataset;
      svg
        .append("g")
        .attr("transform", "translate(0," + (h - 20) + ")")
        .attr("class", "axis")
        .call(xAxis);
      svg
        .append("g")
        .attr("transform", `translate(20,00)`)
        .attr("class", "axis")
        .call(yAxis);
    },

    // 嵌套
    appendFn() {
      let transform = d3.transition().duration(750);
      var matrix = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
      ];
      const Table = d3.select("body").select("table");
      Table.selectAll("tr")
        .data(matrix)
        .enter()
        .append("tr")
        .selectAll("td")
        .data(function (d) {
          return d;
        })
        .enter()
        .append("td")
        .text((d) => {
          return d;
        });
    },
    // 更新方法1
    update(data) {
      //  获取所有的text 元素
      let text = this.g.selectAll("text").data(data);
      text.attr("class", "update");
      text
        .enter()
        .append("text")
        .attr("class", "enter")
        .attr("x", function (d, i) {
          return i * 32;
        })
        .attr("dy", ".35em")
        .merge(text)
        .text(function (d) {
          return d;
        });
      text.exit().remove();
    },
    //  更新方法2
    updateT(data) {
      let transform = d3.transition().duration(750);

      // 赋予数据
      var text = this.g.selectAll("text").data(data, function (d) {
        return d;
      });

      // exit
      text
        .exit()
        .transition(transform)
        .attr("class", "exit")
        .attr("y", 60)
        .style("fill-opacity", 1e-6)
        .remove();

      // update
      text
        .attr("class", "update")
        .attr("y", 0)
        .attr("fill-opacity", 1)
        .transition(transform)
        .attr("x", function (d, i) {
          return i * 36;
        });

      // enter
      text
        .enter()
        .append("text")
        .attr("class", "enter")
        .attr("dy", ".35em")
        .attr("y", -60)
        .attr("x", function (d, i) {
          return i * 36;
        })
        .style("fill-opacity", 1e-6)
        .text(function (d) {
          return d;
        })
        .transition(transform)
        .attr("y", 0)
        .style("fill-opacity", 1);
    },
  },
  mounted() {
    console.log(miserablesDate);
    const miserables = miserablesDate;
    const chart = ForceGraph(miserables, {
      nodeId: (d) => d.id,
      nodeGroup: (d) => d.group,
      nodeTitle: (d) => `${d.id}\n${d.group}`,
      linkStrokeWidth: (l) => Math.sqrt(l.value),
      width: 1000,
      height: 600,
      // invalidation:new Promise((resolve,reject)=>{
      //   resolve(true)
      // }), // a promise to stop the simulation when the cell is re-run
    });
    document.querySelector(".about").append(chart);
    //  append 创建  exit 退出  remove 删除  enter 占位

    //
    this.columnChart();

    // TODO: 三个圆心

    // document.querySelector("#chart").append(div.node());

    // 嵌套
    this.appendFn();

    // TODO: 一般更新模式

    // const strArray = "找千万里孙大萨达大萨达撒大所多".split("");
    // const svgStrup = d3.select("#strup");
    // const width = +svgStrup.attr("width");
    // const height = +svgStrup.attr("height");
    // const g = svgStrup
    //   .append("g")
    //   .attr("transform", "translate(32," + height / 2 + ")");
    // this.g = g;
    // this.updateT(strArray);
    // d3.interval(() => {
    //   this.updateT(
    //     d3
    //       .shuffle(strArray)
    //       .slice(0, Math.floor(Math.random() * 26))
    //       .sort()
    //   );
    // }, 1000);

    // barchartSvg
    this.barChart();

    // scatterplot
    this.scatterplot();
  },
};
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
  }
}

#chart {
  width: 1000px;
}

#chart rect:hover {
  fill: #79e8c8;
}

text {
  font: bold 48px monospace;
}

.enter {
  fill: green;
  font-size: 14px;
}

.update {
  fill: #333;
  font-size: 18px;
}

.exit {
  fill: brown;
  font-size: 20px;
}

.bar rect:hover {
  fill: rgb(228, 39, 39) !important;
}
.axis path,
.axis line {
  fill: none;
  stroke: black;
  stroke-linecap: square;
  shape-rendering: crispEdges;
}

.axis text {
  font-family: sans-serif;
  font-size: 11px;
}
</style>
