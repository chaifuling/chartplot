// (data) - (graphic element) mapping:
// 
//     gene ratio    ->> x pos
//     term name     ->> y pos
//     -log2(PValue) ->> circle size
//     log2(fc)      ->> circle color

// sort dataset by gene ratio
dataset = dataset.sort(function(a, b) {return a.ratio - b.ratio})

var dim = {
    w: 900,
    h: 600,
}

var margin = {
    top: 10,
    bottom: 50,
    left: 350,
    right: 200,
}

var padding = {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
}

var w = dim.w - margin.left - margin.right,
    h = dim.h - margin.top - margin.bottom

var circleConfig = {
    size: {
        min:10,
        max:20
    },
    color: {
        min: "#66ccff",
        max: "#ff9c9c",
    },
    padding: h / dataset.length,
}

var svg = d3.select("div.figure")
            .append("svg")
            .attr("width", dim.w)
            .attr("height", dim.h)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var xScale = d3.scaleLinear()
    .domain([d3.min(dataset, function(d) {return d.ratio}),
             d3.max(dataset, function(d) {return d.ratio})])
    .range([padding.left, w-padding.right])

var yScale = d3.scaleBand()
    .domain(dataset.map(function(d) {return d.term}))
    .range([h-padding.bottom, padding.top])
    .paddingInner(circleConfig.padding)

var rScale = d3.scaleLinear()
    .domain([d3.min(dataset, function(d) {return d.log2Pvalue}),
             d3.max(dataset, function(d) {return d.log2Pvalue})])
    .range([circleConfig.size.min, circleConfig.size.max])

var log2fc_min = d3.min(dataset, function(d) {return d.log2fc}),
    log2fc_max = d3.max(dataset, function(d) {return d.log2fc})

var cScale = d3.scaleLinear()
    .domain([log2fc_min, log2fc_max])
    .interpolate(d3.interpolateHcl)
    .range([circleConfig.color.min, circleConfig.color.max])

var circles = svg.append("g")
    .attr("id", "circles")
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
        return xScale(d.ratio)
    })
    .attr("cy", function(d) {
        return yScale(d.term)
    })
    .attr("r", function(d) {
        return rScale(d.log2Pvalue)
    })
    .attr("fill", function(d) {
        return cScale(d.log2fc)
    })
    .attr("opacity", 0.8)


var formatPercent = d3.format(".0%");

var numXTicks = 5
var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(numXTicks)
    .tickFormat(formatPercent)

var xTickFontSize = 18
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + h + ")")
    .style("font-size", xTickFontSize)
    .call(xAxis)

var yAxis = d3.axisLeft()
    .scale(yScale)

var yTickFontSize = 15
svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + 0 + ", 0)")
    .style("font-size", yTickFontSize)
    .call(yAxis)

var xAxisLabelSize = 20
svg.append("text")
    .attr("class", "x axis lable")
    .attr("transform", "translate(" + w/2 + "," + (h + 40) + ")")
    .text("Gene Ratio")
    .style("font-size", xAxisLabelSize)
    .attr("text-anchor", "middle")

var numStop = 10
svg.append("defs")
    .append("linearGradient")
    .attr("id", "color-gradient")
    .attr("x1", "0%").attr("y1", "100%")
    .attr("x2", "0%").attr("y2", "0%")
    .selectAll("stop")
    .data(d3.range(numStop))
    .enter().append("stop")
    .attr("offset", function(d, i) {
        return i / (numStop - 1)
    })
    .attr("stop-color", function(d, i) {
        return cScale( log2fc_min + (log2fc_max - log2fc_min) * (i / (numStop - 1)) )
    })

var colorBarConfig = {
    height: 100,
    width: 30,
    pos: {
        x: w + 20,
        y: 0.7 * h,
    },
    title: {
        content: "Mean log2(FC)",
        fontSize: 16,
    },
    space: 5,
    ticks: {
        num: 3,
        fontSize: 14,
    }
}

svg.append("text")
    .text(colorBarConfig.title.content)
    .style("font-size", colorBarConfig.title.fontSize)
    .style("font-weight", "bold")
    .attr("transform", "translate(" + colorBarConfig.pos.x + "," +
                                      colorBarConfig.pos.y + ")")

svg.append("rect")
    .attr("width", colorBarConfig.width)
    .attr("height", colorBarConfig.height)
    .attr("transform", "translate(" + colorBarConfig.pos.x + "," +
                       (colorBarConfig.pos.y + colorBarConfig.space) + ")")
    .style("fill", "url(#color-gradient)")

var cbScale = d3.scaleLinear()
    .domain(cScale.domain())
    .range([colorBarConfig.height, 0])

var cAxis = d3.axisRight()
    .scale(cbScale)
    .ticks(colorBarConfig.ticks.num)

var cbTicks = svg.append("g")
    .attr("class", "c axis")
    .attr("transform", "translate(" + (colorBarConfig.pos.x + colorBarConfig.width) +
                       "," + (colorBarConfig.pos.y + colorBarConfig.space) + ")")
    .style("font-size", colorBarConfig.ticks.fontSize)
    .call(cAxis)

cbTicks.selectAll("path")
    .style("fill", "none")
    .style("stroke", "none")


sizeBarConfig = {
    num: 3,
    pos: {
        x: w + 20,
        y: h * 0.3,
    },
    title: {
        content: "-log2(pvalue)",
        fontSize: 16
    },
    space: 5,
    stops: {
        start: 0.25,
        end: 1,
    }
}

var sizeBarTitle = svg.append("text")
    .attr("class", "sizebar")
    .text(sizeBarConfig.title.content)
    .style("font-size", sizeBarConfig.title.fontSize)
    .style("font-weight", "bold")
    .attr("transform", "translate(" + sizeBarConfig.pos.x + "," +
                                      sizeBarConfig.pos.y + ")")

var getCircleExamples = function() {
    var ratio, size;
    var circleExamples = [],
        rs = sizeBarConfig.stops.start,
        re = sizeBarConfig.stops.end,
        smin = rScale.range()[0],
        smax = rScale.range()[1],
        logp_max = d3.max(dataset, function(d) {return d.log2Pvalue}),
        logp_min = d3.min(dataset, function(d) {return d.log2Pvalue})
    for (var i = 0; i < sizeBarConfig.num; i++) {
        ratio = rs + (re - rs) / (sizeBarConfig.num - 1) * i
        size = smin + (smax - smin) * ratio
        log2Pvalue = logp_min + (logp_max - logp_min) * ratio
        circleExamples.push({size: size, log2Pvalue: log2Pvalue})
    }
    return circleExamples
}

circleExamples = getCircleExamples()

var sizeBarCircles = svg.append("g")
    .attr("class", "sizebar")
    .attr("transform", "translate(" + sizeBarConfig.pos.x + "," +
                                      sizeBarConfig.pos.y + ")")
    .selectAll("circle")
    .data(circleExamples).enter()
    .append("circle")
    .attr("cx", function(d, i) {
        return rScale.range()[1]
    })
    .attr("cy", function(d, i) {
        return rScale.range()[1] + i * 2 * rScale.range()[1]
    })
    .attr("r", function(d, i) {
        return d.size
    })
    .attr("fill", "#555555")
    .attr("opacity", 0.8)

var sizeBarLabels = svg.append("g")
    .attr("class", "sizebar")
    .attr("transform", "translate(" + sizeBarConfig.pos.x + "," +
                                      sizeBarConfig.pos.y + ")")
    .selectAll("text")
    .data(circleExamples).enter()
    .append("text")
    .attr("x", function(d, i) {
        var rmax = rScale.range()[1]
        return 2 * rmax
    })
    .attr("y", function(d, i) {
        var rmax = rScale.range()[1]
        return rmax + i * 2 * rmax + 5
    })
    .text(function(d) {
        return d.log2Pvalue.toFixed(2)
    })


var bindingMouseEvents = function(d3Obj) {
    d3Obj.on("mouseover", function(d) {
        var xPosition = parseFloat(d3.select(this).attr("cx")) + 380
        var yPosition = parseFloat(d3.select(this).attr("cy"))

        var content = d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#value")

        content.selectAll("p").remove()
        content.append("p")
            .text("GO type: " + d.GOType)
        content.append("p")
            .text("Gene count: " + d.count)
        content.append("p")
            .text("log2Pvalue: " + d.log2Pvalue.toFixed(2))
        content.append("p")
            .text("log2FC: " + d.log2fc.toFixed(2))

        d3.select("#tooltip").classed("hidden", false)
    })
    .on("mouseout", function(d) {
        d3.select("#tooltip").classed("hidden", true)
    })
    return d3Obj
}

bindingMouseEvents(circles)
