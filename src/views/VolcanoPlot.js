import * as d3 from "d3";

let width = 700;
let height = 500;
let padding = { left: 30, right: 30, top: 30, bottom: 30 };

let VolcanoSvg = d3.select('#VolcanoPlot').append('svg')
    .style("width", width).style("height", height).attr('id', 'VolcanoSvg');


let xScale = d3.scaleLinear()
    .domain([-4, 4])        // 范围可以自定义，也可以按照d[0]的最大值去设置
    .range([0, width - padding.left - padding.right])
let yScale = d3.scaleLinear()
    .domain([0, 12])
    .range([height - padding.top - padding.bottom, 0])
let tooltip = d3.select('body')          // 鼠标移动到某个点 显示 name
    .append('div')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('color', '#3497db')
    .style('visibility', 'hidden')    // 控制显示隐藏
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .text('')
let circles = VolcanoSvg.selectAll('circle')
    .data(self.arr)
    .enter()
    .append('circle')
    .attr('cx', (d) => {
        return padding.left + xScale(d[0])
    })
    .attr('cy', (d) => {
        return padding.bottom + yScale(d[1])
    })
    .attr('r', self.radius)
    .on('mouseover', function (d, i) {
        return tooltip.style('visibility', 'visible').text(d[2])
    })
    .on('mousemove', function (d, i) {
        return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px')
    })
    .on('mouseout', function (d, i) {
        return tooltip.style('visibility', 'hidden')
    })
let xAxis = d3.axisBottom()
    .scale(xScale)
let yAxis = d3.axisLeft()
    .scale(yScale)
VolcanoSvg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + padding.left + ',' + (height - padding.bottom) + ')')
    .call(xAxis)
// .append('text')           //  x轴文字描述
// .text('Log2FoldChange')
// .attr('stroke', '#808080')   //  加上stroke属性 才能在画布上显示
// .attr('transform', 'translate('+ width/2.2 + ', 28)')
VolcanoSvg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
    .call(yAxis)


VolcanoSvg.selectAll('text')
    .data(this.arr)
    .enter()
    .append('text')
    .filter((d) => {
        return d[1] > 9 && d[0] < 0
    })
    .text((d) => {
        return d[2]
    })
    .attr('x', (d) => {
        return padding.left + xScale(d[0])
    })
    .attr('y', (d) => {
        return padding.bottom + yScale(d[1])
    })
    .attr('fill', '#3497db')

let self = this
VolcanoSvg.selectAll('circle')
    .classed('green', (d, i) => {
        return d[0] < -self.xLeft && d[1] > self.yTop
    })
    .classed('red', (d, i) => {
        return d[0] > self.xLeft && d[1] > self.yTop
    })