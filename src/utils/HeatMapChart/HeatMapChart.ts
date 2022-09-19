import * as d3 from "d3";
import { agnes } from "@/utils/hclust";
interface HeatMapChart {
    container: string;
    content: Content;
    margin: { top: number; left: number; right: number; bottom: number }; s: any
    legend_pointer: any;
    max_row_lengths: any[];
    title: any;
    max_column_lengths: any[];
    title_obj: any;
    [x: string]: any;
}

interface Content {
    data: Array<Array<Number>>;
    params: {
        title: string;
        start_color: string;
        middle_color: string;
        end_color: string;
        show_gap: boolean;
        show_label: boolean;
        show_column_label: boolean;
        show_row_label: boolean;
        rows: string[],
        row_tree: any,
        row_tree_width: number,
        columns: string[],
        column_tree: any,
        column_tree_height: number,

        row_group: string[],
        row_group_width: number,
        row_group_location: string,

        column_group: string[],
        column_group_height: number,
        column_group_location: string,

        row_legend_name: string[],
        column_legend_name: string[] | any,
    },
    size: {
        width: number,
        height: number,
    },
}

class HeatMapChart {
    constructor(props: { container: any; content: any; }) {


        const { container, content } = props;
        // 绑定元素名
        this.container = container || "";
        // 初始化数据
        this.content = content || "";
        this.colorsList = [
            "#388E3C",
            "#F44336",
            "#0288D1",
            "#FF9800",
            "#727272",
            "#E91E63",
            "#673AB7",
            "#8BC34A",
            "#2196F3",
            "#D32F2F",
            "#FFC107",
            "#BDBDBD",
            "#F8BBD0",
            "#3F51B5",
            "#CDDC39",
            "#009688",
            "#C2185B",
            "#FFEB3B",
            "#212121",
            "#FFCCBC",
            "#BBDEFB",
            "#0099CC",
            "#FFcc99",
        ];
        // 输出参数
        this.margin = {
            top: 100,
            left: 30,
            right: 170,
            bottom: 20,
        };
        //  浮窗
        this.tooltip = "";
        this.legend_pointer = "";
        // 矩阵行列最大长度
        this.max_row_lengths = [];
        this.max_column_lengths = [];

        this.title =
            typeof content.params.title != "undefined" ? content.params.title : "";
        this.title_obj = this.title;
        this.text_length = 0;
        // TODO: row  column
        this.row_len = 8;
        this.column_len = 9;
        this.max_row_length = 0;
        this.max_column_length = 0;
        this.row_group_x = 0;
        this.row_group_y = 0;
        this.column_group_x = 0;
        this.column_group_y = 0;
        this.legend_x = 0;
        this.row_legend_y = 70;
        this.column_legend_y = 0;
        this.leaf = [];
        this.max_x = 0;
        this.left_x = 0;
        // 每个色块宽高
        this.heatmap_width = 0;
        this.heatmap_height = 0;
        // 主图宽高
        this.width = 0;
        this.height = 0;
        this.ingredient_legend_width = 150;
        this.ingredient_legend_height = 20;
        this.tick_size = 0;

        /**获取value的最大值、最小值**/
        this.min_values = [];
        this.max_values = [];
        this.min_value = 0;
        this.max_value = 0;

        // Scale
        this.color_scale = [];
        this.xscale = [];
        this.yscale = [];
        this.ingredient_legend_scale = [];
        this.row_xtree_scale = [];
        // axis
        this.xaxis = [];
        this.yaxis = [];
        this.xaxis_y = this.heatmap_height;
        this.yaxis_x = this.heatmap_width;
        this.ingredient_legend_axis = [];

        // chart 实例
        this.svg = "";
        this.main = "";
        this.xaxis_obj = "";
        this.yaxis_obj = "";
        this.sub_main = "";
        this.row_group = "";
        this.defs = "";
        this.legend = "";
        this.ingredient_legend = "";
        this.ingredient_legend_axis_obj = "";
        this.legend_pointer = "";
        this.row_legend = "";
        this.column_legend = "";
        this.left_tree_obj = "";
        // 初始化
        this.init();
    }

    init() {
        const that = this;
        this.tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "heatmap_tooltip")
            .attr("opacity", 0.0);

        /** 判断左边聚类树树是否为空**/
        if (
            typeof this.content.params.row_tree_width != "undefined" &&
            typeof this.content.params.row_tree != "undefined"
        ) {
            this.margin.left += this.content.params.row_tree_width;
        }

        /**行分组宽度**/
        if (typeof this.content.params.row_group != "undefined") {
            if (
                typeof this.content.params.row_group_location != "undefined" &&
                this.content.params.row_group_location == "right" &&
                typeof this.content.params.row_group_width != "undefined"
            ) {
                this.margin.right += this.content.params.row_group_width;
            } else if (typeof this.content.params.row_group_width != "undefined") {
                this.margin.left += this.content.params.row_group_width;
            }
        }

        /** 判断左边聚类树树是否为空**/
        if (
            typeof this.content.params.column_tree_height != "undefined" &&
            typeof this.content.params.column_tree != "undefined"
        ) {
            this.margin.top += this.content.params.column_tree_height;
        }

        /**列分组高度**/
        if (
            typeof this.content.params.column_group_location != "undefined" &&
            this.content.params.column_group_location == "bottom" &&
            typeof this.content.params.column_group_height != "undefined"
        ) {
            this.margin.bottom += this.content.params.column_group_height;
        } else if (typeof this.content.params.column_group_height != "undefined") {
            this.margin.top += this.content.params.column_group_height;
        }

        /**行列矩阵的长度**/
        for (var i in this.content.params.rows) {
            this.max_row_lengths.push(this.content.params.rows[i].length);
        }

        for (var i in this.content.params.columns) {
            this.max_column_lengths.push(this.content.params.columns[i].length);
        }

        this.max_row_length = d3.max(this.max_row_lengths);
        this.max_column_length = d3.max(this.max_column_lengths);
        this.heatmap_width =
            this.content.size.width * this.content.params.columns.length;
        this.heatmap_height =
            this.content.size.height * this.content.params.rows.length;

        this.width = this.heatmap_width + this.margin.left + this.margin.right;
        if (typeof this.content.params.row_group_width != "undefined") {
            this.width += this.content.params.row_group_width;
        }

        if (
            typeof this.content.params.show_row_label != "undefined" &&
            this.content.params.show_row_label === true
        ) {
            this.width += this.max_row_length * this.row_len;
        }

        this.height =
            this.heatmap_height +
            this.margin.top +
            this.margin.bottom +
            this.max_column_length * this.column_len;
        // 生成图标svg
        this.svg = d3
            .select("#" + this.container)
            .append("svg")
            .attr("version", "1.1")
            .attr("style", "font-family:arial")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("width", this.width)
            .attr("height", this.height);

        if (this.title) {
            this.title_obj = this.svg
                .append("text")
                .text(this.title)
                .attr("y", 25)
                .attr("x", function () {
                    const text_length = this.getComputedTextLength();
                    return (that.margin.left + that.heatmap_width) / 2 - text_length / 2;
                });
        }

        for (var i in this.content.data) {
            this.min_values.push(d3.min(this.content.data[i]));
            this.max_values.push(d3.max(this.content.data[i]));
        }

        this.min_value = d3.min(this.min_values);
        this.max_value = d3.max(this.max_values);

        if (typeof this.content.params.middle_color != "undefined") {
            this.color_scale = d3
                .scaleLinear()
                .domain([
                    this.min_value,
                    (this.min_value + this.max_value) / 2,
                    this.max_value,
                ])
                .range([
                    this.content.params.start_color,
                    this.content.params.middle_color,
                    this.content.params.end_color,
                ]);
        } else {
            this.color_scale = d3
                .scaleLinear()
                .domain([
                    this.min_value,
                    (this.min_value + this.max_value) / 2,
                    this.max_value,
                ])
                .range([
                    this.content.params.start_color,
                    this.content.params.end_color,
                ]);
        }

        this.main = this.svg
            .append("g")
            .attr("class", "main")
            .attr(
                "transform",
                "translate(" + this.margin.left + ", " + this.margin.top + ")"
            );

        /** 计算比例尺 **/
        this.xscale = d3
            .scaleLinear()
            .domain([0, this.content.params.columns.length - 1])
            .range([0, this.heatmap_width]);

        this.yscale = d3
            .scaleLinear()
            .domain([0, this.content.params.rows.length - 1])
            .range([this.heatmap_height, 0]);

        this.xaxis = d3
            .axisBottom()
            .ticks(this.content.params.columns.length - 1)
            .tickFormat(function (d: string | number) {
                return that.content.params.columns[d];
            })
            .scale(this.xscale);

        this.yaxis = d3
            .axisRight()
            .scale(this.yscale)
            .ticks(this.content.params.rows.length - 1)
            .tickFormat(function (d: string | number) {
                return that.content.params.rows[d];
            });

        this.xaxis_y = this.heatmap_height;

        if (
            typeof this.content.params.column_group_location != "undefined" &&
            this.content.params.column_group_location == "bottom" &&
            typeof this.content.params.column_group_height != "undefined" &&
            typeof this.content.params.column_group != "undefined"
        ) {
            this.xaxis_y += this.content.params.column_group_height;
        }

        // 形成比例尺
        this.xaxis_obj = this.main
            .append("g")
            .attr("class", "xaxis")
            .attr("font-size", 11)
            .attr("text-anchor", "start")
            .attr("transform", "translate(0," + this.xaxis_y + ")")
            .call(this.xaxis);

        /**显示、隐藏x标签**/
        if (
            typeof this.content.params.show_column_label != "undefined" &&
            this.content.params.show_column_label == true
        ) {
            this.xaxis_obj
                .selectAll("line")
                .attr("fill", "none")
                .attr("stroke", "#000");
            this.xaxis_obj
                .select(".domain")
                .attr("fill", "none")
                .attr("stroke", "#000");

            this.xaxis_obj.selectAll(".tick").each(function (i: number) {
                const tick_x =
                    that.content.size.width * i + that.content.size.width / 2;
                d3.select(this).attr("transform", "translate(" + tick_x + ",0)");
            });

            this.xaxis_obj
                .selectAll(".tick")
                .selectAll("text")
                .each(function (d: any, i: any) {
                    d3.select(this).attr("transform", function () {
                        var html = d3.select(this).html();
                        d3.select(this).attr("text-anchor", "start");
                        return (
                            "rotate(110, 8,5) translate(" +
                            (this.getComputedTextLength() / 2 + 16) +
                            ")"
                        );
                    });
                });
        } else {
            this.xaxis_obj.attr("opacity", 0);
        }

        this.yaxis_x = this.heatmap_width;

        if (
            typeof this.content.params.row_group_location != "undefined" &&
            this.content.params.row_group_location == "right" &&
            typeof this.content.params.row_group_width != "undefined" &&
            typeof this.content.params.row_group != "undefined"
        ) {
            this.yaxis_x += this.content.params.row_group_width;
        }
        this.yaxis_obj = this.main
            .append("g")
            .attr("class", "yaxis")
            .attr("font-size", 11)
            .attr("text-anchor", "bottom")
            .attr("transform", "translate(" + this.yaxis_x + ",0)")
            .call(this.yaxis);

        /**显示、隐藏y标签**/
        if (
            typeof this.content.params.show_row_label != "undefined" &&
            this.content.params.show_row_label == true
        ) {
            this.yaxis_obj
                .selectAll("line")
                .attr("fill", "none")
                .attr("stroke", "#000");
            this.yaxis_obj
                .select(".domain")
                .attr("fill", "none")
                .attr("stroke", "#000");

            this.yaxis_obj.selectAll(".tick").each(function (i: number) {
                const tick_y =
                    that.content.size.height * i + that.content.size.height / 2;
                d3.select(this).attr("transform", "translate(0," + tick_y + ")");
            });
        } else {
            this.yaxis_obj.attr("opacity", 0);
        }

        this.sub_main = this.main.append("g").attr("class", "sub_main");
        this.sub_main
            .selectAll(".heatmap_groups")
            .data(this.content.data)
            .enter()
            .append("g")
            .attr("class", function (d: any, i: string) {
                return "heatmap_groups heatmap_group_" + i;
            })
            .attr("transform", function (d: any, i: number) {
                return "translate(0, " + i * that.content.size.height + ")";
            })
            .each(function (d: { [x: string]: number; }, i: string) {
                const self = d3.select(this);

                for (let j in d) {
                    const rect_g = self
                        .append("g")
                        .attr("class", "h_d_" + i + "_" + j)
                        .attr(
                            "transform",
                            "translate(" + j * that.content.size.width + ",0)"
                        )
                        .on("mouseover", function (d: { pageX: any; pageY: number; target: { __data__: any[]; }; }) {
                            const page_x = d.pageX;
                            const page_y = d.pageY + 20;
                            const selfs = d3.select(this);
                            const value = d.target.__data__[0];
                            const point_x = that.ingredient_legend_scale(value);
                            that.legend_pointer
                                .attr("transform", "translate(" + point_x + ")")
                                .attr("fill-opacity", 1);
                            that.tooltip.html(
                                "<strong>column:</strong>" +
                                that.content.params.rows[i] +
                                "</br> <strong>row:</strong>" +
                                that.content.params.columns[j] +
                                "<br /><strong>value:</strong>" +
                                value
                            );
                            that.tooltip
                                .style("left", page_x + "px")
                                .style("top", page_y + "px")
                                .style("opacity", 0.9)
                                .style("padding", "5px");
                            selfs.select("rect").attr("fill-opacity", 1);
                        })
                        .on("mouseout", function () {
                            that.legend_pointer.attr("fill-opacity", 0);
                            that.tooltip.style("opacity", 0.0);
                            const selfs = d3.select(this);
                            selfs.select("rect").attr("fill-opacity", 0.9);
                        });
                    const rect = rect_g
                        .append("rect")
                        .attr("width", that.content.size.width)
                        .attr("height", that.content.size.height)
                        .attr("fill", that.color_scale(d[j]))
                        .attr("fill-opacity", 0.9)
                        .attr("index", j);

                    if (
                        typeof that.content.params.show_gap != "undefined" &&
                        that.content.params.show_gap === true
                    ) {
                        rect.attr("stroke", "#fff");
                    }

                    if (
                        typeof that.content.params.show_label != "undefined" &&
                        that.content.params.show_label == true
                    ) {
                        rect_g
                            .append("text")
                            .text(Math.round(d[j] * 10000) / 10000)
                            .attr("x", function () {
                                return (
                                    that.content.size.width / 2 - this.getComputedTextLength() / 3
                                );
                            })
                            .attr("y", function () {
                                return that.content.size.height / 2 + 5;
                            })
                            .attr("font-size", 11);
                    }
                }
            });

        /** 绘制行分组**/
        if (typeof this.content.params.row_group != "undefined") {
            if (
                typeof this.content.params.row_group_location != "undefined" &&
                this.content.params.row_group_location == "right" &&
                typeof this.content.params.row_group_width != "undefined"
            ) {
                this.row_group_x = this.margin.left + this.heatmap_width;
            } else {
                this.row_group_x =
                    this.margin.left - this.content.params.row_group_width;
            }

            this.row_group = this.svg
                .append("g")
                .attr("class", "row_group")
                .attr(
                    "transform",
                    "translate(" + this.row_group_x + "," + this.margin.top + ")"
                );

            this.row_group
                .selectAll(".cat_rows")
                .data(
                    this.content.params.row_group.slice(
                        0,
                        this.content.params.rows.length
                    )
                )
                .enter()
                .append("g")
                .attr("class", function (d: any, i: string) {
                    return "cat_rows rows_" + i;
                })
                .attr("transform", function (d: any, i: number) {
                    return "translate(0, " + that.content.size.height * i + ")";
                })
                .each(function (d: any, i: any) {
                    const self = d3.select(this);
                    const rect = self
                        .append("rect")
                        .attr("width", that.content.params.row_group_width)
                        .attr("height", that.content.size.height)
                        .attr("fill", d)
                        .attr("fill-opacity", 0.9);
                    if (
                        typeof that.content.params.show_gap != "undefined" &&
                        that.content.params.show_gap === true
                    ) {
                        rect.attr("stroke", "#fff");
                    }
                });
        }

        /** 绘制列分组**/
        if (typeof this.content.params.column_group != "undefined") {
            this.column_group_x = this.margin.left;

            if (
                typeof this.content.params.column_group_location != "undefined" &&
                this.content.params.column_group_location == "bottom" &&
                typeof this.content.params.column_group_height != "undefined"
            ) {
                this.column_group_y = this.margin.top + this.heatmap_height;
            } else {
                this.column_group_y =
                    this.margin.top - this.content.params.column_group_height;
            }
            this.column_group = this.svg
                .append("g")
                .attr("class", "column_group")
                .attr(
                    "transform",
                    "translate(" + this.column_group_x + "," + this.column_group_y + ")"
                );

            this.column_group
                .selectAll(".cat_columns")
                .data(
                    this.content.params.column_group.slice(
                        0,
                        this.content.params.columns.length
                    )
                )
                .enter()
                .append("g")
                .attr("class", function (d: any, i: string) {
                    return "cat_columns columns_" + i;
                })
                .attr("transform", function (d: any, i: number) {
                    return "translate(" + that.content.size.width * i + ", 0)";
                })
                .each(function (d: any, i: any) {
                    const self = d3.select(this);
                    const rect = self
                        .append("rect")
                        .attr("width", that.content.size.width)
                        .attr("height", that.content.params.column_group_height)
                        .attr("fill", d)
                        .attr("fill-opacity", 0.9);

                    if (
                        typeof that.content.params.show_gap != "undefined" &&
                        that.content.params.show_gap === true
                    ) {
                        rect.attr("stroke", "#fff");
                    }
                });
        }

        /**绘制图例**/
        let color_stops: string[] | string = [
            '<stop offset="0%" stop-color="$S"></stop>',
            '<stop offset="50%" stop-color="$S"></stop>',
            '<stop offset="100%" stop-color="$S"></stop>',
        ];
        if (typeof this.content.params.middle_color == "undefined") {
            color_stops = [color_stops[0], color_stops[2]].join("");
            color_stops = this.sprintf(color_stops, [
                this.content.params.start_color,
                this.content.params.end_color,
            ]);
        } else {
            color_stops = this.sprintf(color_stops.join(""), [
                this.content.params.start_color,
                this.content.params.middle_color,
                this.content.params.end_color,
            ]);
        }
        this.defs = this.svg.append("defs");

        /** 定义滤镜颜色**/
        this.defs.append("linearGradient").attr({
            id: "ingredient_legend",
            x1: "0%",
            y1: "0%",
            x2: "100%",
            y2: "0%",
        });
        this.defs.html(color_stops);

        /**定义滤镜上移动的箭头**/
        const nonius_scale = 6;
        const pointer =
            "M0 0 " +
            "L" +
            nonius_scale +
            " " +
            -nonius_scale +
            " " +
            "L" +
            nonius_scale +
            " " +
            -2 * nonius_scale +
            " " +
            "L" +
            -nonius_scale +
            " " +
            -2 * nonius_scale +
            " " +
            "L" +
            -nonius_scale +
            " " +
            -nonius_scale +
            " Z";

        this.legend_x = this.width - this.margin.right;
        if (
            typeof this.content.params.row_group_location != "undefined" &&
            this.content.params.row_group_location == "right" &&
            typeof this.content.params.row_group_width != "undefined" &&
            typeof this.content.params.row_group != "undefined"
        ) {
            this.legend_x += this.content.params.row_group_width;
        }
        this.legend = this.svg
            .append("g")
            .attr("class", "legends")
            .attr("transform", "translate(" + this.legend_x + ",30)");

        this.ingredient_legend = this.legend
            .append("g")
            .attr("class", "ingredient_legend");
        this.ingredient_legend
            .append("rect")
            .attr("width", this.ingredient_legend_width)
            .attr("height", this.ingredient_legend_height)
            .attr("fill", "url(#ingredient_legend)")
            .attr("shape-rendering", "crispEdges");

        this.ingredient_legend_scale = d3
            .scaleLinear()
            .domain([this.min_value, this.max_value])
            .range([0, this.ingredient_legend_width]);

        this.ingredient_legend_axis = d3
            .axisBottom()
            .scale(this.ingredient_legend_scale)
            .ticks(5);

        this.ingredient_legend_axis_obj = this.ingredient_legend
            .append("g")
            .attr("class", "legend_axis")
            .attr("transform", "translate(0," + this.ingredient_legend_height + ")")
            .call(this.ingredient_legend_axis);

        this.ingredient_legend_axis_obj
            .selectAll("line")
            .attr("fill", "none")
            .attr("stroke", "#000");
        this.ingredient_legend_axis_obj
            .select(".domain")
            .attr("fill", "none")
            .attr("stroke", "none");

        this.tick_size = this.ingredient_legend
            .select(".legend_axis")
            .selectAll(".tick")
            .size();
        this.ingredient_legend
            .select(".legend_axis")
            .selectAll(".tick")
            .each(function (d: any, i: number) {
                if (i != 0 && i != that.tick_size - 1) {
                    d3.select(this).remove();
                }
            });
        this.legend_pointer = this.ingredient_legend.append("path");
        this.legend_pointer.attr({
            class: "legend-pointer",
            d: pointer,
            fill: "#33a3dc",
            "fill-opacity": 0,
        });

        /**绘制行的分组图例**/
        if (
            typeof this.content.params.row_legend_name != "undefined" &&
            typeof this.content.params.row_group != "undefined"
        ) {
            const row_legend = this.legend
                .append("g")
                .attr("class", "row_legend")
                .attr("transform", "translate(0, " + this.row_legend_y + ")")
                .attr("font-size", 11);

            row_legend.append("text").text("Taxon group").attr("font-size", 13);
            row_legend
                .selectAll(".child_row_legend")
                .data(this.content.params.row_legend_name)
                .enter()
                .append("g")
                .attr("class", function (d: any, i: string) {
                    return "child_row_legend child_row_" + i;
                })
                .attr("transform", function (d: any, i: number) {
                    return "translate(0, " + (20 + i * 20) + ")";
                })
                .each(function (d: any, i: string | number) {
                    const self = d3.select(this);
                    self
                        .append("rect")
                        .attr("width", 20)
                        .attr("height", 10)
                        .attr("fill", that.content.params.row_group[i]);
                    self.append("text").text(d).attr("x", 25).attr("y", 8);
                });
        }

        /**绘制列的分组图例**/

        if (
            typeof this.content.params.column_legend_name != "undefined" &&
            typeof this.content.params.column_group != "undefined"
        ) {
            let column_legend_y = 0;
            if (
                typeof this.content.params.row_group != "undefined" &&
                typeof this.content.params.row_legend_name != "undefined"
            ) {
                column_legend_y =
                    this.row_legend_y +
                    this.content.params.row_legend_name.length * 20 +
                    20 +
                    30;
            } else {
                column_legend_y = this.row_legend_y;
            }

            const column_legend = this.legend
                .append("g")
                .attr("class", "column_legend")
                .attr("transform", "translate(0, " + column_legend_y + ")")
                .attr("font-size", 11);
            column_legend.append("text").text("Sample group").attr("font-size", 13);
            column_legend
                .selectAll(".child_column_legend")
                .data(this.content.params.column_legend_name)
                .enter()
                .append("g")
                .attr("class", function (d: any, i: string) {
                    return "child_column_legend child_column_" + i;
                })
                .attr("transform", function (d: any, i: number) {
                    return "translate(0, " + (20 + i * 20) + ")";
                })
                .each(function (d: any, i: string | number) {
                    const self = d3.select(this);
                    self
                        .append("rect")
                        .attr("width", 20)
                        .attr("height", 10)
                        .attr("fill", that.content.params.column_group[i]);
                    self.append("text").text(d).attr("x", 25).attr("y", 8);
                });
        }

        /**绘制行的树**/
        if (typeof this.content.params.row_tree != "undefined") {
            const tree_1 = this.content.params.row_tree;
            console.log('============Rowtree_1========================');
            console.log(tree_1);
            console.log('=============Rowtree_1=======================');

            this.getleaf(this.content.params.row_tree);
            // 定义最左面的树图的宽度的比例尺
            const row_ytree_scale = d3
                .scaleLinear()
                .domain([0, this.leaf.length - 1])
                .range([
                    this.margin.top + this.content.size.height / 2,
                    this.margin.top + this.heatmap_height - this.content.size.height / 2,
                ]);
            const row_xtree_scale = d3
                .scaleLinear()
                .domain([0, this.max_x])
                .range([5, this.content.params.row_tree_width - 2]);

            this.left_x = this.margin.left - this.content.params.row_tree_width;

            if (
                typeof this.content.params.row_group_location != "undefined" &&
                this.content.params.row_group_location == "right" &&
                typeof this.content.params.row_group_width != "undefined"
            ) {
            } else if (
                typeof this.content.params.row_group_width != "undefined" &&
                typeof this.content.params.row_group != "undefined"
            ) {
                this.left_x -= this.content.params.row_group_width;
            }
            const left_tree_obj = this.svg
                .append("g")
                .attr("class", "left_tree")
                .attr("transform", "translate(" + this.left_x + ")");

            this.plotTree(
                tree_1,
                left_tree_obj,
                row_xtree_scale,
                row_ytree_scale,
                "row"
            );
        }
        /**绘制列的树**/
        if (typeof this.content.params.column_tree != "undefined") {
            this.max_x = 0;
            this.leaf = [];
            const tree_1 = this.content.params.column_tree;
            if (tree_1.length > 0) {
                this.getleaf(tree_1);
            }
            //定义最上面的树的高度的比例尺
            const row_xtree_scale = d3
                .scaleLinear()
                .domain([0, this.leaf.length - 1])
                .range([
                    this.margin.left + this.content.params.row_tree_width / 2,
                    this.heatmap_width +
                    this.margin.left -
                    this.content.params.row_tree_width / 2,
                ]);

            let columny_end = this.margin.top;
            let columny_start =
                this.margin.top - this.content.params.column_tree_height;
            if (
                typeof this.content.params.column_group_location != "undefined" &&
                this.content.params.column_group_location == "bottom" &&
                typeof this.content.params.column_group_height != "undefined"
            ) {
            } else if (
                typeof this.content.params.column_group_height != "undefined"
            ) {
                columny_start -= this.content.params.column_group_height;
                columny_end -= this.content.params.column_group_height;
            }

            let column_ytree_scale = d3
                .scaleLinear()
                .domain([0, this.max_x])
                .range([this.columny_start, this.columny_end]);

            let top_tree_obj = this.svg
                .append("g")
                .attr("class", "top_tree")
                .attr("transform", "translate(0, 0)");

            this.plotTree(
                tree_1,
                top_tree_obj,
                row_xtree_scale,
                column_ytree_scale,
                "column"
            );
        }
    }

    sprintf(text: string, arr: string | any[]) {
        var i = 0;
        return text.replace(/\$S/g, function () {
            return i < arr.length ? arr[i++] : "";
        });
    }

    // 生成树的函数
    getleaf(subtree: { height: number; tree_y: number; start_x: any; end_x: number; children: { [x: string]: any; }; y: number; }, x?: number): number {
        if ("undefined" == typeof x) {
            x = 0;
        }
        let sub_y = [];
        let length = 0;
        if (subtree.height) {
            length = subtree.height;
        }
        subtree.start_x = x;
        x = x + length;
        subtree.end_x = x;

        if (subtree.end_x > this.max_x) {
            this.max_x = subtree.end_x;
        }
        if (subtree.children.length) {
            for (var i in subtree.children) {
                sub_y.push(this.getleaf(subtree.children[i], x));
            }
        } else {
            subtree.tree_y = this.leaf.length;
            this.leaf.push(subtree);
            return subtree.tree_y;
        }


        subtree.y = d3.sum(sub_y) / sub_y.length;
        return subtree.y;
    }

    plotTree(tree: { children: { [x: string]: any; }; }, obj: any, linear_width_scale: any, linear_height_scale: any, type: string) {
        if (typeof type == "undefined" || type == "row") {
            this.plotRow(tree, obj, linear_width_scale, linear_height_scale);
        } else {
            this.plotColumn(tree, obj, linear_width_scale, linear_height_scale);
        }

        if (tree.children) {
            for (var i in tree.children) {
                this.plotTree(
                    tree.children[i],
                    obj,
                    linear_width_scale,
                    linear_height_scale,
                    type
                );
            }
        }
    }

    plotRow(tree: { start_x: any; y: any; end_x: any; children: any[]; }, obj: any, linear_width_scale: (arg0: any) => any, linear_height_scale: (arg0: any) => any) {
        if (tree.children.length) {
            const list_y = [];
            for (let i in tree.children) {
                list_y.push(tree.children[i].y);
            }
            // const max_min_y = [d3.min(list_y), d3.max(list_y)];
            const cluster = d3.cluster()
                .separation(function (a, b) { return 1})
                .size([this.leaf.length * this.content.size.height, this.content.params.row_tree_width]);
            const hc = d3.hierarchy(this.content.params.row_tree)
            const node = cluster(hc);
            const links = node.links();
            var x = d3.scaleLinear();
            var y = d3.scaleLinear()
                .domain([0, 100])
                .range([0, 100]);
            var link = obj.selectAll(".link")
                .data(links)
                .attr("points", elbow)
                .enter().append("polyline")
                .attr("transform", "translate(" + 0 + "," + this.margin.top + ")")
                .attr("class", "link")
                .attr("points", elbow);
            
            function elbow(d, i) {
                return x(d.source.y) + "," + y(d.source.x) + " " +
                    x(d.source.y) + "," + y(d.target.x) + " " +
                    x(d.target.y) + "," + y(d.target.x);
            }
        }

    }

    plotColumn(tree: { y: any; start_x: any; end_x: any; children: { [x: string]: { y: any; }; }; }, obj: any, linear_width_scale: (arg0: any) => any, linear_height_scale: (arg0: any) => any) {
        if (tree.children) {
            const list_y = [];
            for (let i in tree.children) {
                list_y.push(tree.children[i].y);
            }
            const cluster = d3.cluster()
                .separation(function (a, b) { return 1; })
                .size([this.content.params.columns.length * this.content.size.width, this.margin.top - this.content.params.column_tree_height,]);
            const hc = d3.hierarchy(this.content.params.column_tree)
            const node = cluster(hc);
            const links = node.links();
            var x = d3.scaleLinear();
            var y = d3.scaleLinear()
                .domain([0, 100])
                .range([0, 100]);
            var link = obj.selectAll(".link")
                .data(links)
                .attr("points", elbow)
                .enter().append("polyline")
                .attr("transform",
                    "translate(" +
                    (this.content.params.columns.length * this.content.size.width + this.content.params.column_tree_height - 20) +
                    "," + this.margin.top + ") rotate(90 100 0)")
                .attr("class", "link")
                .attr("points", elbow);
            function elbow(d, i) {
                return x(d.source.y) + "," + y(d.source.x) + " " +
                    x(d.source.y) + "," + y(d.target.x) + " " +
                    x(d.target.y) + "," + y(d.target.x);
            }
            // const max_min_y = [d3.min(list_y), d3.max(list_y)];
        }
    }
}

export const createHeatMapChart = async () => {
    let datas = await d3.csv("/public/datas.csv");
    console.log("==========datas==========================");
    console.log(datas);
    console.log("=============datas=======================");
    function dataParse(data: any) {
        // data = data.filter((item: { H: any; L: any; }) => item.H && item.L);
        data.map((item: { [x: string]: string[]; }) => {
            item['column'] = [];
            Object.keys(item).forEach((key) => {
                if (!((-item[key] + '') == 'NaN')) {
                    item['column'].push(key)
                }
            })
        }
        )
        data = data.filter((item: {
            [x: string]: any;
        }) => {
            for (let i = 0; i < item.column.length; i++) {
                if (item[item.column[i]]) {
                    return item;
                }
            }
        });
        const arrRect = data
            .sort((a: { H: number; }, b: { H: number; }) => {
                return b.H - a.H;
            })
            .map((item: {
                datas: {
                    lable: string; // /${item.GO_Term}
                    value: number;
                }[]; gene_name: any[]; GO_Term: any[]; H: number; L: number; data: number[];
            }) => {
                item.datas = [
                    {
                        lable: `${item.gene_name}/${item.GO_Term}`, // /${item.GO_Term}
                        value: Math.log10((item.H - 10) / 100),
                    },
                    {
                        lable: `${item.gene_name}/${item.GO_Term}`,
                        value: Math.log10((item.L - 10) / 100),
                    },
                ];
                item.data = [
                    Math.log10((item.H - 10) / 100),
                    Math.log10((item.L - 10) / 100),
                ];
                item.gene_name = [item.gene_name];
                item.GO_Term = [item.GO_Term];
                return item;
            });
        const info = agnes(
            arrRect.map((item: any) => item.datas),
            { method: "ward", isDistanceMatrix: false }
        );
        let cluste = agnes(
            arrRect.map((item: any) => item.datas),
            { method: "complete", isDistanceMatrix: false }
        )

        // const filterMenu = (menuList) => {
        //     return menuList.filter(item => {
        //         return item.index ==-1
        //     }).map(item => {
        //         item = Object.assign({}, item)
        //         if (item.children) {
        //             item.children = filterMenu(item.children)
        //         }
        //         return item
        //     })
        // }
        // const filterMenus = filterMenu(info.children);



        // let arr = [];
        // function loop(item) {
        //     item.map((item) => {
        //         if (item.children) {
        //             arr.push({name: item.name,height:item.height});
        //             loop(item.children);
        //         }
        //     });
        // }
        // loop([info]);
        // console.log(
        //     arr
        //         .filter((item) => item.height)
        //         .sort((a, b) => a.height - b.height)
        // );

        // cluste.children = filterMenus;
        console.log('=============cluste=======================');
        console.log(cluste);
        console.log('===============cluste=====================');
        // console.log(cluste);
        const params: Content = {
            data: [],
            params: {
                title: "基因热图",
                start_color: "#2A69F2",
                middle_color: "#FFFFFF",
                end_color: "#ed1941",
                show_gap: true,
                show_label: true,
                show_column_label: true,
                show_row_label: true,
                rows: arrRect.map((item: { gene_name: any[]; }) => item.gene_name[0]),
                row_tree: JSON.parse(JSON.stringify(cluste)),
                row_tree_width: 100,
                columns: arrRect[0].column,
                column_tree: [],
                column_tree_height: 50,
                row_group: [
                    "#388E3C",
                    "#F44336",
                    "#0288D1",
                    "#FF9800",
                    "#727272",
                    "#E91E63",
                    "#673AB7",
                    "#8BC34A",
                    "#2196F3",
                    "#D32F2F",
                    "#FFC107",
                    "#BDBDBD",
                    "#F8BBD0",
                    "#3F51B5",
                    "#CDDC39",
                    "#009688",
                    "#C2185B",
                    "#FFEB3B",
                    "#212121",
                    "#FFCCBC",
                    "#BBDEFB",
                    "#0099CC",
                    "#FFcc99",
                ],
                row_group_width: 20,
                row_group_location: "left",
                column_group: [
                    "#F44336",
                    "#F44336",
                    "#0288D1",
                    "#FF9800",
                    "#727272",
                    "#E91E63",
                    "#673AB7",
                    "#8BC34A",
                    "#2196F3",
                    "#D32F2F",
                    "#FFC107",
                    "#BDBDBD",
                    "#F8BBD0",
                    "#3F51B5",
                    "#CDDC39",
                    "#009688",
                    "#C2185B",
                    "#FFEB3B",
                    "#212121",
                    "#FFCCBC",
                    "#BBDEFB",
                    "#0099CC",
                    "#FFcc99",
                ],
                column_group_height: 20,
                column_group_location: "bottom",
                row_legend_name: arrRect.map((item: { gene_name: any[]; }) => item.gene_name[0]),
                column_legend_name: [... new Set(arrRect.map((item: { GO_Term: any[]; }) => item.GO_Term[0]))],
               
            },
            size: {
                width: 100,
                height: 50,
            },
        };
        params.data = arrRect.map((item: { data: any; }) => item.data);
        console.log("====================================");
        console.log(params);
        console.log("====================================");

        return params;
    }

    const params = dataParse(datas);
    new HeatMapChart({ container: "hotInfo", content: params });
};
