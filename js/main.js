function hxlProxyToJSON(input){
    var output = [];
    var keys = [];
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

var blue = '#007CE0';
var blueLight = '#72B0E0';
var green = '#06C0B4';

function generate3W(data, geom) {
    //var lookup = genLookup(geom);

    var where = dc.leafletChoroplethChart('#map');
    var whoChart = dc.rowChart('#whoChart');
    var whatChart = dc.rowChart('#whatChart');


    var cf = crossfilter(data);

    var whereDim = cf.dimension(function(d){
        return d['#adm1+code'];
    });
    var whatDim = cf.dimension(function(d){
        return d['#sector'];
    });
    var whoDim = cf.dimension(function(d){
        return d['#org'];
    });


    var whereGroup = whereDim.group();
    var whatGroup = whatDim.group();
    var whoGroup = whoDim.group();


    //tooltip
    var rowtip = d3.tip().attr('class', 'd3-tip').html(function (d) {
        return d.key + ': ' + d3.format('0,000')(d.value);

    });

 where.width($('#map').width())
            .height(500)
            .dimension(whereDim)
            .group(whereGroup)
            .center([0,0]) //8.779/13.436
            .zoom(0)
            .geojson(geom)
            // .colors(['#043567', '#256BB1', '#4191DB','#96B7DD'])
            // .colorDomain([0, 3])
            // .colorAccessor(function (d) {
            //     return d > 20 ? 0 :
            //             10 > d > 20 ? 1 :
            //             5 > d > 10 ? 2 :
            //             1 > d > 5 ? 3 :
            //             3;
            // })
            .colors(['#CCCCCC',blue])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){
                return d > 0 ? 1 : 0 ;
            })
            .featureKeyAccessor(function(feature){
                return feature.properties['Pcode'];
            }).popup(function(feature){
                return feature.properties['NAME_1'];
            });

    whatChart.width(400)
        .height(500)
        .gap(2)
        .dimension(whatDim)
        .group(whatGroup)
        .data(function (group) {
            return group.top(20);
        })
        .colors(blue)
        .elasticX(true)
        .renderTitle(false)
        .xAxis().ticks(5);

    whoChart.width(400)
        .height(500)
        .gap(2)
        .dimension(whoDim)
        .group(whoGroup)
        .data(function (group) {
            return group.top(20);
        })
        .colors(blue)
        .elasticX(true)
        .renderTitle(false)
        .xAxis().ticks(5);

    dc.renderAll();

    //tooltip events
    d3.selectAll('g.row').call(rowtip);
    d3.selectAll('g.row').on('mouseover', rowtip.show).on('mouseout', rowtip.hide);

    var map = where.map();
    map.options.minZoom = 3;


    zoomToGeom(geom);


    function zoomToGeom(geom){
        var bounds = d3.geo.bounds(geom);
        map.fitBounds([[bounds[0][1],bounds[0][0]],[bounds[1][1],bounds[1][0]]]);
    }

    function genLookup(geojson){
        var lookup = {};
        geojson.features.forEach(function(e){
            lookup[e.properties['admin1Pcod']] = String(e.properties['admin1Name']);
        });
        return lookup;
    }

} //generate3W


var geodataCall = $.ajax({
    type: 'GET',
    dataType: 'json',
    url: 'data/guatemala.json',
});

var dataCall = $.ajax({
    type: 'GET',
    dataType: 'json',
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1x27qN_2mL-pFaQ0sPc0FQNacRo239lwGmOcXXr9jFJg%2Fedit%23gid%3D1368408337&force=on'
});

$.when(geodataCall, dataCall).then(function(geomArgs, dataArgs){
    var geom = geomArgs[0];
    var data = hxlProxyToJSON(dataArgs[0]);
    generate3W(data, geom);
});