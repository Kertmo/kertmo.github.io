let map = L.map('map', {
  center: [58.373523, 26.716045],
  zoom: 12,
  zoomControl: true // Enable default zoom control
});

map.zoomControl.setPosition('topright');

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'OpenStreetMap contributors'
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Esri, Maxar, Earthstar Geographics, and the GIS community',
  maxZoom: 19
});

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
});

// Default map settings
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12)
};

const baseLayers = {
  "OpenStreetMap": osmLayer,
  "Satellite": satelliteLayer,
  "Topographic": topoLayer
};

const layerControlOptions = {
  collapsed: false,
  position: 'topleft'
};

const layerControl = L.control.layers(baseLayers, overlayLayers, layerControlOptions);

layerControl.addTo(map);

// lisa ka vaikimisi layer kaardile
osmLayer.addTo(map);


let districtsLayer;
let choroplethLayer;
let heatMapLayer;
let markersLayer;


// Districts GeoJSON
async function loadDistrictsLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson');
    const data = await response.json();
    
    districtsLayer = L.geoJson(data, {
      style: function(feature) {
        return {
          fillColor: getDistrictColor(feature.properties.OBJECTID),
          fillOpacity: 0.5,
          weight: 1,
          opacity: 1,
          color: 'grey'
        };
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(feature.properties.NIMI || 'District ' + feature.properties.OBJECTID);
      }
    });
  } catch (error) {
    console.error("Error loading districts data:", error);
  }
}


// color function
function getDistrictColor(id) {
  switch (id) {
    case 1: return '#ff0000';
    case 13: return '#009933';
    case 6: return '#0000ff';
    case 7: return '#ff0066';
    default: return '#ffffff';
  }
}


// Choropleth layer
async function loadChoroplethLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson');
    const data = await response.json();
    
    choroplethLayer = L.choropleth(data, {
      valueProperty: 'OBJECTID',
      scale: ['#e6ffe6', '#004d00'],
      steps: 11,
      mode: 'q',
      style: {
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8,
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup('Value: ' + feature.properties.OBJECTID);
      }
    });
  } catch (error) {
    console.error("Error loading choropleth data:", error);
  }
}
