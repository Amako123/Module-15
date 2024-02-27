// Declare variables using const and let
const url = 'data/all_week.geojson';
let queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

// Change the color based on feature's earthquake depth
const cats = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
const colors = ['Red', 'blue', 'Purple', 'pink', 'Orange', 'Yellow', 'Green'];

// Function to get color based on earthquake depth
function getColor(d) {
   switch (true) {
      case d > 90: return colors[5];
      case d > 70: return colors[4];
      case d > 50: return colors[3];
      case d > 30: return colors[2];
      case d > 10: return colors[1];
      case d > -10: return colors[0];
      default: return colors[6];
   }
}

// Perform a GET request to the query URL
d3.json(queryUrl).then(data => createFeatures(data.features));

// Function to create features from earthquake data
function createFeatures(earthquakeData) {
   const earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: (feature, latlng) => {
         return new L.CircleMarker(latlng, {
            radius: feature.properties.mag * 3,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: 'black',
            weight: 0.2,
            opacity: 0.8,
            fillOpacity: 3
         });
      },
      onEachFeature: doOnEachFeature
   });

   createMap(earthquakes);
}

// Function to handle each feature in the GeoJSON layer
function doOnEachFeature(feature, layer) {
   layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><ul><li>Earthquake Magnitude: ${feature.properties.mag}</li><li>Earthquake Depth: ${feature.geometry.coordinates[2]}</li></ul>`);
}

// Function to create the map
function createMap(earthquakes) {
   const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
   });

   const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
   });

   const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
   });

   const baseMaps = {
      "Street Map": street,
      "Topographic Map": topo,
      "Dark Map": dark
   };

   const overlayMaps = {
      Earthquakes: earthquakes
   };

   const map = L.map("map", {
      center: [37.09, -95.71],
      zoom: 4,
      layers: [street, earthquakes]
   });

   createLegend(map);

   L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
}

// Function to create legend and add to map
function createLegend(map) {
   const legend = L.control({ position: 'bottomright' });
   legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      for (let i = 0; i < cats.length; i++) {
         const item = `<li style='background: ${colors[i]} '></li>   ${cats[i]}<br>`;
         div.innerHTML += item;
      }
      return div;
   };
   legend.addTo(map);
}
