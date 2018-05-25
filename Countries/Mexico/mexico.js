let margin = {left: 80, right: 80, top: 50, bottom: 50 },
    width = 960 - margin.left -margin.right,
    height = 500 - margin.top - margin.bottom;

let svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

function color(populationDensity) {
    let returncolor = "grey";
    if (populationDensity > 5000) returncolor = "#993404";
    else if (populationDensity > 1000) returncolor = "#d95f0e";
    else if (populationDensity > 100) returncolor = "#fe9929";
    else if (populationDensity > 10) returncolor = "#fec44f";
    else if (populationDensity > 1) returncolor = "#fee391";
    else returncolor = "#ffffd4";

    return returncolor;
}

function tooltip (properties) {
    let tt = d3.select("#tooltip");

    tt.select("#state").text(properties.NAME_1);
    tt.select("#municipality").text(properties.NAME_2);
    tt.select("#population").text("Population: " + properties.population);
    if (properties.area)
        tt.select("#area").text("Area: " + properties.area.toFixed(0) + " sq km");
    else
        tt.select("#area").text("Area: BAD DATA");
    if (properties.populationDensity)
        tt.select("#density").text("Population Density: " + properties.populationDensity.toFixed(2) + " people per sq km");
    else
        tt.select("#density").text("Population Density: BAD DATA");

    tt.classed("hidden", false)
}

function hide_tooltip() {
    d3.select("#tooltip").classed("hidden", true)
}

function rowConverter(d) {
    return {
        state: d.nom_ent,
        municipality: d.nom_mun,
        population: +d.poptot
    }
}

d3.csv("mexicoPopulation.csv", rowConverter, function (popData) {
    d3.json("mexico.json", function (json) {
        for (let i = 0; i < popData.length; i++) {
            let dataMuni = popData[i].municipality;
            let dataPop = popData[i].population;
            let dataState = popData[i].state;
            let succeeded = false;
            for (let j = 0; j < json.features.length; j++) {
                let jsonMuni = json.features[j].properties.NAME_2;
                let jsonState = json.features[j].properties.NAME_1;
                if (dataMuni === jsonMuni && dataState === jsonState) {
                    let area = d3.geoArea(json.features[i]) / 12.56637 * 510072000;
                    let popDensity = dataPop / area;
                    json.features[j].properties.population = dataPop;
                    if (popDensity === Infinity) {
                        continue;
                    }
                    json.features[j].properties.populationDensity = popDensity;
                    json.features[j].properties.area = area;
                    succeeded = true;
                }
            }
        }
        let projection = d3.geoMercator()
            .fitSize([width, height], json);

        let originalScale = projection.scale();
        let originalTranslation = projection.translate();
        console.log(originalScale);
        console.log(originalTranslation);

        projection.translate([0,0]);

        let path = d3.geoPath()
            .projection(projection);

        let zoom = d3.zoom()
            .on("zoom", zooming);

        svg.call(zoom)
            .call(zoom.transform, d3.zoomIdentity.translate(originalTranslation[0], originalTranslation[1]));

        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", function (d) {
                let populationDensity = d.properties.populationDensity;
                if (populationDensity) {
                    return color(populationDensity)
                } else {
                    return "#ccc";
                }
            })
            .on("mouseover", function (d) {
                tooltip(d.properties);
            })
            .on("mouseout", hide_tooltip);

        function zooming() {
            let offset = [d3.event.transform.x, d3.event.transform.y];
            let newScale = d3.event.transform.k * originalScale;
            projection.translate(offset)
                .scale(newScale);
            svg.selectAll("path")
                .attr("d", path);

        }
    });
});