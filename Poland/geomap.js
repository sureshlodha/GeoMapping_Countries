//@ts-check

var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

var population = d3.map();

var x = d3
  .scaleLinear()
  .domain([1, 10])
  .rangeRound([600, 860]);

let numberOfColors = 9;
var color = d3
  .scaleThreshold()
  .domain(d3.range(0, numberOfColors))
  .range(d3.schemeGreens[numberOfColors]);

var g = svg
  .append("g")
  .attr("class", "key")
  .attr("transform", "translate(0,40)");

function addScale(highest) {
  g
    .selectAll("rect")
    .data(
      color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      })
    )
    .enter()
    .append("rect")
    .attr("height", 8)
    .attr("x", function(d) {
      return x(d[0]);
    })
    .attr("width", function(d) {
      return x(d[1]) - x(d[0]);
    })
    .attr("fill", function(d) {
      return color(d[0]);
    });

  g
    .append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population Density (Persons per KM)");

  g
    .call(
      d3
        .axisBottom(x)
        .tickSize(13)
        .tickFormat((x, i) => {
          return Math.round(x / (numberOfColors - 1) * highest);
        })
        .tickValues(color.domain())
    )
    .select(".domain")
    .remove();
}

// Draw the projection
Promise.all([d3.tsv("datafile.tsv"), d3.json("Poland.json")])
  .catch(console.error)
  .then(data => {
    let provinceData = data[0];
    let geoData = data[1].features;

    // Compute a good scale and offset
    // https://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
    var center = d3.geoCentroid(data[1]);
    var scale = 150;
    var offset = [width / 2, height / 2];
    var projection = d3
      .geoMercator()
      .scale(scale)
      .center(center)
      .translate(offset);

    // create the path
    var path = d3.geoPath().projection(projection);

    // using the path determine the bounds of the current map and use
    // these to determine better values for the scale and translation
    var bounds = path.bounds(data[1]);
    var hscale = scale * width / (bounds[1][0] - bounds[0][0]);
    var vscale = scale * height / (bounds[1][1] - bounds[0][1]);
    scale = hscale < vscale ? hscale : vscale;
    offset = [
      width - (bounds[0][0] + bounds[1][0]) / 2,
      height - (bounds[0][1] + bounds[1][1]) / 2
    ];

    // new projection
    projection = d3
      .geoMercator()
      .center(center)
      .scale(scale)
      .translate(offset);
    path = path.projection(projection);

    let highest = 0;
    for (let item of provinceData) {
      highest = Math.max(highest, item["Population_Density"]);
      population.set(item["Polish_Name"], item["Population_Density"]);
    }

    addScale(highest);

    g
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(geoData)
      .enter()
      .append("path")
      .attr("fill", function(d) {
        let id = d.properties.NAME_1.toLowerCase();
        return color(population.get(id) / highest * numberOfColors);
      })
      .attr("d", path)
      .append("title")
      .text(function(d) {
        let id = d.properties.NAME_1.toLowerCase();

        return `${
          d.properties.NAME_1
        }: ${population.get(id)} Persons per kilometer`;
      });

    /*
    svg
      .append("path")
      .datum()
      .attr("class", "states")
      .attr("d", path);
      */
  });
