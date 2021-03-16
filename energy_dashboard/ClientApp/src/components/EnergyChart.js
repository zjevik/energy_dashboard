import React, { Component } from 'react';
import * as d3 from "d3";

export class EnergyChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentCount: 0, loading: true, data: {"consumption": [], "production": []} };

        this.incrementCounter = this.incrementCounter.bind(this);
        this.transition = this.transition.bind(this);
        this.drawChart = this.drawChart.bind(this);
    }
    incrementCounter() {
        this.setState({
            currentCount: this.state.currentCount + 1
        });
    }

    componentDidMount() {
        this.populateEnergyData().then(() => {
            this.drawChart(false);
        })

        this.interval = setInterval(() => {
            this.populateEnergyData().then(() => {
                this.drawChart(true);
            })
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    drawChart(animateTransition = false) {
        var padding = 25;

        var layers = [this.state.data.production].concat([this.state.data.consumption]);
        //console.log("layers");
        //console.log(layers);

        var svg = d3.select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height");

        //console.log(this.state.data);

        var x = d3.scaleTime()
            .range([padding*2, width - padding]);


        var y = d3.scaleLinear()
            .range([height-padding,padding]);

        x.domain(d3.extent(layers[0], function (d) { return d3.isoParse(d[0]); }));
        y.domain([d3.min(layers[1], function (d) { return d[1]; }), d3.max(layers[0], function (d) { return d[1]; })]);

        var z = d3.interpolateCool;

        var area = d3.area()
            .x(function (d, i) { return x(d3.isoParse(d[0])); })
            .y0(function (d) { return y(0); })
            .y1(function (d) { return y(d[1]); });

        var color = d3.scaleOrdinal(d3.schemeCategory10);

        if (animateTransition) {
            svg.selectAll("path")
                .data(layers)
                .transition()
                .duration(2500)
                .attr("d", area)
                .attr("stroke", "black")
                .attr("fill", function (d, i) { return color(i) });
        } else {
            svg.selectAll("path")
                .data(layers)
                .enter().append("path")
                .attr("d", area)
                .attr("stroke", "black")
                .attr("fill", function (d, i) { return color(i) });
        }
        svg.selectAll(".axis").remove();

        // x-axis
        var axisBottom = d3.axisBottom(x)
            .ticks(d3.timeMinute.every(1) ); // Every minute

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (padding + (height - 2 * padding) * (d3.max(layers[0], function (d) { return d[1]; })) / (d3.max(layers[0], function (d) { return d[1]; }) - d3.min(layers[1], function (d) { return d[1]; }))) + ")")
            .attr("x", 6)
            .attr("dx", "0.71em")
            .attr("fill", "#000")
            .call(axisBottom);


        // Add the Y Axis
        var axisLeft = d3.axisLeft(y)
            .ticks(20);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + 1.5*padding + ",0)")
            .call(axisLeft)
            .append("text")
            .attr("class", "axis")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Energy [W]");

    }

    transition() {
        this.populateEnergyData().then(() => {
            this.drawChart(true);
        })

    }

    async populateEnergyData() {
        this.setState({ loading: true });

        const response = await fetch('energydata');
        const resData = await response.json();
        //const data = await response.text();

        //console.log(resData['results'][0]['series']);

        var data = {};

        //data.consumption = resData['results'][0]['series'][0]['values'].map(([a, b]) => [new Date(a), b])
        //data.production = resData['results'][0]['series'][1]['values'].map(([a, b]) => [new Date(a), b])

        data.consumption = resData['results'][0]['series'][0]['values'].map(([a, b]) => [a, (-1)*b])
        data.production = resData['results'][0]['series'][1]['values']

        this.setState({ data: data, loading: false });
    }

    render() {
        return <div>
            <svg width="960" height="500"></svg>
            
        </div>
    }
}