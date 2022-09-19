import * as d3 from "d3";
import { agnes } from "@/utils/hclust";
import * as  uv from "unipept-visualizations"


console.log(agnes);
export const createHotDate = (ele) => {
    (async function () {
        let data = await d3.csv("/public/datas.csv");
        data = data.filter((item) => item.H && item.L);
        // 图表大小
        const width = 500;
        const height = 600;
        const margin = { top: 5, right: 0, bottom: 20, left: 0 };
        const arrRect = data
            .sort((a, b) => {
                return b.H - a.H;
            })
            .map((item) => {
                item.data = [item.H, item.L];
                item.gene_name = [item.gene_name];
                item.GO_Term = [item.GO_Term];
                return item;
            });
        const hotEle = d3
            .select("#hotCharts")
            .attr("width", width)
            .attr("height", height);
        // 颜色
        const colorCalibration = [
            d3.color("blue"),
            d3.color("white"),
            d3.color("red"),
        ];
        // 比例尺
        const colorScale = d3
            .scaleLinear()
            .domain([-2, 2])
            .range([
                -2,
                d3.max(
                    arrRect
                        .map((item) => item.data)
                        .flat()
                        .map((item) => item / 100)
                ),
            ]);
        const axisLeft = d3
            .axisLeft()
            .ticks(4)
            .tickFormat(function (d) {
                return "";
            })
            .scale(colorScale);
        const axisRight = d3
            .axisRight()
            .ticks(4)
            .tickFormat(function (d) {
                return "";
            })
            .scale(colorScale);

        function renderColorBar() {
            const colorBar = d3
                .select("#colorBar")
                .style(
                    "background",
                    `linear-gradient(to top, ${d3.color("blue")},${d3.color(
                        "white"
                    )},${d3.color("red")})`
                )
                .style("width", "30px")
                .style("height", "100px")
                .append("svg")
                .attr("width", 50)
                .attr("height", 120)
                .style("position", "relative")
                .style("top", "-10px");

            colorBar
                .append("g")
                .attr("transform", "translate(" + 30 + "," + 15 + ")")
                .attr("class", "axis")
                .style("color", "#ffffff")
                .style("font-weight", "bold")
                .call(axisLeft);
            colorBar
                .append("g")
                .attr("transform", "translate(" + 0 + "," + 15 + ")")
                .attr("class", "axis")
                .style("color", "#ffffff")
                .style("font-weight", "bold")
                .call(axisRight);
            colorBar
                .append("g")
                .attr("transform", "translate(" + 30 + "," + 15 + ")")
                .selectAll("text")
                .data([-2, -1, 0, 1, 2])
                .enter()
                .append("text")
                .attr("transform", function (d, i) {
                    return "translate(" + 0 + "," + 24 * i + ")";
                })
                .style("font-weight", "bold")
                .text(function (d) {
                    return d;
                });
        }
        let rect = void 0;
        let gbody = void 0;
        function createHotChart() {
            gbody = hotEle
                .selectAll("g")
                .data(arrRect)
                .enter()
                .append("g")
                .attr("transform", function (d, i) {
                    return "translate(" + 0 + "," + 30 * i + ")";
                });
            // text
            gbody
                .selectAll("text")
                .data(function (d) {
                    return d["gene_name"];
                })
                .enter()
                .append("text")
                .transition()
                .duration(500)
                .text(function (d) {
                    return d;
                })
                .attr("transform", function (d, i) {
                    return "translate(" + 310 + "," + 18 + ")";
                });
            // rect
            gbody
                .selectAll("text")
                .data(function (d) {
                    return d["GO_Term"];
                })
                .enter()
                .append("text")
                .text(function (d) {
                    return d;
                })
                .attr("transform", function (d, i) {
                    return "translate(" + 310 + "," + 18 + ")";
                });

            rect = gbody
                .selectAll("rect")
                .data(function (d) {
                    return d.data;
                })
                .enter()
                .append("rect")
                .attr("class", "rect")
                .transition()
                .duration(500)
                .attr("transform", function (d, i) {
                    return "translate(" + (i + 1) * 100 + "," + 0 + ")";
                })
                .attr("fill", function (d, i) {
                    //choose color dynamicly
                    var colorIndex = d3
                        .scaleLinear()
                        .domain([
                            Math.log10(
                                d3.min(
                                    arrRect
                                        .map((item) => item.data)
                                        .flat()
                                        .map((item) => (item - 10) / 100)
                                )
                            ),
                            0,
                            Math.log10(
                                d3.max(
                                    arrRect
                                        .map((item) => item.data)
                                        .flat()
                                        .map((item) => (item - 10) / 100)
                                )
                            ),
                        ])
                        .range(colorCalibration);
                    return colorIndex(Math.log10((d - 10) / 100));
                });
        }
        renderColorBar();
        createHotChart();
        gbody.on("mouseleave", handleMouseleave);
        gbody.on("mouseover", handleMouseover);
        function handleMouseleave(d) {
            console.log("mouseleave", d);
            d3.select("#showRectInfo").transition().duration(300).style("opacity", 0);
        }
        function handleMouseover(d) {
            console.log("mouseover", d);
            d3.select("#showRectInfo")
                .transition()
                .duration(500)
                .style("top", d.offsetY + 0 + "px")
                .style("left", d.offsetX + 10 + "px")
                .text(function () {
                    return Math.log10((d.target.__data__ - 10) / 100).toFixed(5);
                })
                .style("opacity", 1);
        }
    })();
    // 数据
};


export const chart = async () => {
    const data = await d3.csv('https://gist.githubusercontent.com/pverscha/0c30879beb0ddfb8ab80e8f308662dc4/raw/18b2d7ee1e96232b567c754b5aa5994edf78dbbd/khan.csv');
    const grid = () => {
        let values = [];
        for (let row of data) {
            let rowValues = [];
            for (let [key, value] of Object.entries(row)) {
                if (key !== "ID") {
                    rowValues.push(parseFloat(value));
                }
            }

            values.push(rowValues);
        }
        return values;
    }

    const rows = data.map((d) => d.ID);
    const cols = Object.keys(data[0]).filter((key) => key !== "ID");
    const simpleHeatmap = document.getElementById("simpleHeatmap");
    
    const heatmapElement = simpleHeatmap;
    const heatmap = new uv.Heatmap(heatmapElement, grid, rows, cols, {
        dendrogramEnabled: true,
        transition: uv.Transition.easeInEaseOutElastic,
        height: 600
      });
}

