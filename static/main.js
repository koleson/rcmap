var country_name_map = {
         'Brunei Darussalam': 'Brunei',
         'Congo': 'Republic of the Congo',
         'Congo, The Democratic Republic of the': 'Democratic Republic of the Congo',
         "Cote D'Ivoire": 'Ivory Coast',
         'Falkland Islands (Malvinas)': 'Falkland Islands',
         'French Southern Territories': 'French Southern and Antarctic Lands',
         'Guinea-Bissa': 'Guinea Bissau',
         'Iran, Islamic Republic of': 'Iran',
         "Korea, Democratic People's Republic of": 'North Korea',
         'Korea, Republic of': 'South Korea',
         "Lao People's Democratic Republic": 'Laos',
         'Moldova, Republic of': 'Moldova',
         'Palestinian Territory': 'West Bank',
         'Russian Federation': 'Russia',
         'Serbia': 'Republic of Serbia',
         'Syrian Arab Republic': 'Syria',
         'Tanzania, United Republic of': 'United Republic of Tanzania',
         'Timor-Leste': 'East Timor',
         'United States': 'United States of America'
};

var total_events = 0;
var edit_times = [];
var edit_intervals = [];
var world_map;
var open_con = []

var log_rc = function(rc_str, limit) {
    $('#rc-list').prepend('<li>' + rc_str + '</li>');
    if($('#rc-list li').length > limit) {
        $('#rc-list li').slice(limit, limit + 1).remove();
    }
};

var highlight_country = function(country_name) {
    return d3.select('path[data-country-name="' + country_name + '"]')
                      .style('fill', '#46d6bd')
                      .style('stroke-width', '2px')
                      .style('stroke', '#888')
                      .transition()
                      .duration(5000)
                      .style('fill', '#ccc')
                      .style('stroke-width', '1px')
                      .style('stroke', '#fff');
};

var get_country_names = function() {
    var ret = [];
    d3.selectAll('path[data-country-name]')
      .each(function(d) {
        ret.push(d.properties.name);
      });
    return ret;
};

var addBubbles = function(bubbles) {
    var self = this;
    if (_.isUndefined(bubbles.length)) {
        bubbles = [];
    }

    var projection = this._map.get('projection');
    var options = this.options.bubble_config;

    var bubbleContainer = this.svg.append('g').attr('class', 'bubbles');
    bubbleContainer
        .selectAll('circle.bubble')
        .data(bubbles)
        .enter()
        .append('svg:circle')
        .attr('cx', function(datum) {
            return projection([datum.longitude, datum.latitude])[0];
        })
        .attr('cy', function(datum, index) {
            return projection([datum.longitude, datum.latitude])[1];
        })
        .style('fill', function(datum) {
            var fillColor = self.getFillColor(datum);
            d3.select(this).attr('data-fill', fillColor);
            return fillColor;
        })
        .style('stroke', function(datum) {
            return options.borderColor; //self.getFillColor(datum);
        })
        .attr('class', 'bubble')
        .style('stroke-width', options.borderWidth)
        .attr('fill-opacity', options.fillOpacity)
        .attr('r', 0)					// start out as a point, expand to big radius
        .transition()
        .duration(400)					// time to go from point to big radius
        .attr('r', function(datum) {
            return datum.radius;
        })
        .transition()					// time to go from big radius to normal radius
        .duration(1000)
        .attr('r', 6.0)
        .each(function(d){
            total_events += 1;
            edit_times.push(new Date().getTime());
            if (total_events > 2) {
                var cur = edit_times[edit_times.length - 1];
                var prev = edit_times[edit_times.length - 2];
                edit_intervals.push(cur - prev);
            }
            var s = 0;
            for (var i = 0; i < edit_intervals.length; i ++) {
                s += edit_intervals[i];
            }
            var rate_avg = Math.ceil(((s / edit_intervals.length) / 1000) * 10);
            edit_times = edit_times.slice(0, 500);
            edit_intervals = edit_intervals.slice(0, 500);
            if (total_events == 1) {
                $('#edit_counter').html('You have seen <span>' + total_events + ' event</span>.');
            } else if (total_events == 2) {
                $('#edit_counter').html('You have seen a total of <span>' + total_events + ' events</span>.');
            } else{
                $('#edit_counter').html('You have seen a total of <span>' + total_events + ' events</span> at an average interval of <span>' + rate_avg + ' seconds</span>.');
            }
            var x = projection([d.longitude, d.latitude])[0];
            var y = projection([d.longitude, d.latitude])[1];
            // this is where d.pagetitle could be added to a ticker.
        });
};

function wikipediaSocket() {

}


wikipediaSocket.init = function(ws_url, lid) {
    this.connect = function() {
        $('#' + lid + '-status').html('(connecting...)');
        var loading = true;
        // Terminate previous connection, if any
        if (this.connection)
          this.connection.close();

        if ('WebSocket' in window) {
            var connection = new ReconnectingWebSocket(ws_url);
            this.connection = connection;
            connection.onopen = function() {
                window.console && console.log('Connection open to ' + lid);
                $('#' + lid + '-status').html('(connected)');
                if (testJSON == true) { 
                	setTimeout(function () { connection.send('[{"venue_countrycode": "US", "gross": "31.74", "name": "FOAMFEST 3", "venue_location": ["41.001276", "-73.85543999999999"], "event_id": "7360711", "changed": "2013-08-06 19:42:19", "order_id": "192433847", "payment_type": "paypal", "venue_countryname": "United States"}, ]'); }, 1000);
                	/*
                	setTimeout(function () { connection.send('{ "eventName": "event name 2", "latitude": 31.77523, "longitude": -102.39963, "countryName": "United States" }'); }, 2000);
                	
                	setTimeout(function () { connection.send('{ "eventName": "event brazil", "latitude": -17.77523, "longitude": -42.39963, "countryName": "Brazil" }'); }, 5000);
                	setTimeout(function () { connection.send('{ "eventName": "event france", "latitude": 43.77523, "longitude": 4.39963, "countryName": "France" }'); }, 5300);
                	setTimeout(function () { connection.send('{ "eventName": "event yellowstone", "latitude": 43.79868, "longitude": -110.067902, "countryName": "United States" }'); }, 9000);
                	setTimeout(function () { connection.send('{ "eventName": "event nyc", "latitude": 40.72468, "longitude": -74.00597, "countryName": "United States" }'); }, 9200);
                	*/
                }
            };

            connection.onclose = function() {
                window.console && console.log('Connection closed to ' + lid);
                $('#' + lid + '-status').html('(closed)');
            };

            connection.onerror = function(error) {
                $('#' + lid + '-status').html('Error');
                window.console && console.log('Connection Error to ' + lid + ': ' + error);
            };

            connection.onmessage = function(resp) {
                var data;
                if (loading) {
                    $('#loading').remove();
                }
                try {
                	window.console && console.log(resp.data);
                    data = JSON.parse(resp.data);
                } catch (e) {
                    window.console && console.log(resp);
                    return;
                }
                var fill_key;
                
                // this is the key bit where the JSON is converted into a dot.
                // 6 aug 2013 16h39 kmo
                window.console && console.log('got message');
                
                if (data) {
                    window.console && console.log('data acquired');
                    if (data.latitude && data.longitude) {
                        window.console && console.log('popping a bubble');
                        world_map.options.bubbles = world_map.options.bubbles.slice(-20);
                        
                        /*loc_str = fgi_resp.country_name;
                        if (fgi_resp.region_name) {
                            loc_str = fgi_resp.region_name + ', ' + loc_str;
                        }
                        if (fgi_resp.city) {
                            loc_str = fgi_resp.city + ' (' + loc_str + ')';
                        }*/
                        //log_rc_str = 'Someone in <span class="loc">' + loc_str + '</span> bought tickets to "<a href="' + data.url + '" target="_blank">' + data.page_title + '</a>" <span class="lang">(' + lid + ')</span>';
                        log_rc_str = 'Someone bought tickets to "<a href="' + data.eid + '" target="_blank">' + data.eventName + '</a>" </span>';
                        log_rc(log_rc_str, RC_LOG_SIZE);
                        //console.log('An editor in ' + loc_str + ' edited "' + data.page_title + '"')
                        $('.bubbles')
                            .animate({opacity: 0,
                                radius: 5},
                                40000,
                                null,
                                function(){
                                    this.remove();
                                });
                        world_map
                            .addBubbles([{radius: 16,
                                latitude: parseFloat(data[0].venue_location[0]),
                                longitude: parseFloat(data[0].venue_location[1]),
                                page_title: data[0].name,
                                country_name: data[0].venue_countryname,
                                fillKey: "add",
                            }]);
                        country_hl = highlight_country(data.countryName);

                        if (!country_hl[0][0]) {
                            country_hl = highlight_country(country_name_map[data.countryName]);
                            if (!country_hl[0][0] && window.console) {
                                console.log('Could not highlight country: ' + data.countryName);
                            }
                        }
                    } else {
                        window.console && console.log('no geodata available for', data['url']);
                    }
                }
            };
        }
    };
    this.close = function() {
        if (this.connection) {
            this.connection.close();
        }
    };
};
