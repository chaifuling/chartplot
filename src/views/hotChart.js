import * as d3 from "d3";

export const createHotChart = async () => {
    //UI configuration
    var itemSize = 18,
        cellSize = itemSize - 1,
        width = 1000,
        height = 1000,
        margin = { top: 20, right: 20, bottom: 20, left: 25 };

    //formats
    var hourFormat = d3.timeFormat('%H'),
        dayFormat = d3.timeFormat('%j'),
        timeFormat = d3.timeFormat('%Y-%m-%dT%X'),
        monthDayFormat = d3.timeFormat('%m.%d');


    //data vars for rendering
    var dateExtent = null,
        dayOffset = 0,
        colorCalibration = ['#f6faaa', '#FEE08B', '#FDAE61', '#F46D43', '#D53E4F', '#9E0142'],
        dailyValueExtent = {};

    //axises and scales
    var axisWidth = 0,
        axisHeight = itemSize * 24,
        yAxisScale = d3.scaleLinear()
            .range([0, axisHeight])
            .domain([0, 24]),
        yAxis = d3.axisLeft()
            .ticks(5)
            .tickFormat(d3.format('02d'))
            .scale(yAxisScale);

    initCalibration();

    var svg = d3.select('[role="heatmap"]');
    var heatmap = svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('id', 'areas')
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    var rect = null;

    const { data } = await d3.json('/public/hotChat.json');
    data.forEach(function (valueObj) {
        valueObj['date'] = new Date(valueObj['timestamp']);
        var day = valueObj['day'] = monthDayFormat(new Date(valueObj['timestamp']));
        var dayData = dailyValueExtent[day] = (dailyValueExtent[day] || [1000, -1]);
        var pmValue = valueObj['value']['PM2.5'];
        dayData[0] = d3.min([dayData[0], pmValue]);
        dayData[1] = d3.max([dayData[1], pmValue]);
    });
    dateExtent = d3.extent(data, function (d) {
        return d.date;
    });
    var xAxis = d3.axisTop()
        .ticks()
        .tickFormat(d3.timeFormat('%m.%d'))

    axisWidth = itemSize * (dayFormat(dateExtent[1]) - dayFormat(dateExtent[0]) + 1);
    //render axises
    var xAxisScale = d3.scaleTime().range([0, axisWidth]).domain([dateExtent[0], dateExtent[1]]);
    xAxis.scale(xAxisScale);
    svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('class', 'x axis')
        .call(xAxis)
        .append('text')
        .text('date')
        .attr('transform', 'translate(' + axisWidth + ',-10)');

    svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .text('time')

        .attr('transform', 'translate(-10,' + axisHeight + ') rotate(-90)');

    //render heatmap rects
    dayOffset = dayFormat(dateExtent[0]);
    rect = heatmap.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('x', function (d) {
            return itemSize * (dayFormat(d.date) - dayOffset);
        })
        .attr('data-set', function (d) {
            if (d.value['PM2.5'] > 0) {
                return monthDayFormat(d.date) + ' ' + d.value['PM2.5'];
            }
        })
        .attr('y', function (d) {
            return hourFormat(new Date(d.date)) * itemSize;
        })
        .attr('fill', '#ffffff');

    rect.filter(function (d) { return d.value['PM2.5'] > 0; })
        .append('title')
        .text(function (d) {
            return monthDayFormat(d.date) + ' ' + d.value['PM2.5'];
        });
    rect.on('mouseleave', handleMouseleave);
    d3.select('#areas').on('mouseover', handleMouseover);
    renderColor();

    function handleMouseleave(d) {
        console.log('mouseleave', d);
        d3.select('#showRectInfo')
            .transition()
            .duration(300)
            .style('opacity', 0)

    }
    function handleMouseover(d) {
        // console.log('mouseover', d);
        d3.select('#showRectInfo')
            .transition()
            .duration(500)
            .style('top', d.offsetY + 30 + 'px')
            .style('left', d.offsetX + 'px')
            .text(d.target.dataset.set)
            .style('opacity', 1)
    }

    function initCalibration() {
        d3.select('[role="calibration"] [role="example"]').select('svg')
            .selectAll('rect').data(colorCalibration).enter()
            .append('rect')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('x', function (d, i) {
                return i * itemSize;
            })
            .attr('fill', function (d) {
                return d;
            });

        //bind click event
        d3.selectAll('[role="calibration"] [name="displayType"]').on('click', function () {
            renderColor();
        });
    }

    function renderColor() {
        var renderByCount = document.getElementsByName('displayType')[0].checked;

        rect
            .filter(function (d) {
                return (d.value['PM2.5'] >= 0);
            })
            .transition()
            .delay(function (d) {
                return (dayFormat(d.date) - dayOffset) * 15;
            })
            .duration(500)
            .attrTween('fill', function (d, i, a) {
                //choose color dynamicly      
                var colorIndex = d3.scaleQuantize()
                    .range([0, 1, 2, 3, 4, 5])
                    .domain((renderByCount ? [0, 500] : dailyValueExtent[d.day]));

                return d3.interpolate(a, colorCalibration[colorIndex(d.value['PM2.5'])]);
            });
    }

    //extend frame height in `http://bl.ocks.org/`
    d3.select(self.frameElement).style("height", "600px");
}

