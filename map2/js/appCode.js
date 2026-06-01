import * as layers from "./layers.js";
import * as turfPractice from "./turfPractice.js";

let map = L.map('map', {
  center: [58.373523, 26.716045],
  zoom: 13,
  zoomControl: true // Enable default zoom control
});

map.createPane('customDistrictsPane');
map.getPane('customDistrictsPane').style.zIndex = 390;

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
  attribution: 'Map data: &amp;copy; OpenStreetMap contributors, SRTM | Map style: &amp;copy; OpenTopoMap (CC-BY-SA)'
});

// Default map settings
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12)
};
export { defaultMapSettings }

const baseLayers = {
  "OpenStreetMap": osmLayer,
  "Satellite": satelliteLayer,
  "Topographic": topoLayer
};

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
      },
      pane: 'customDistrictsPane'
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
      },
      pane: 'customDistrictsPane'
    });
  } catch (error) {
    console.error("Error loading choropleth data:", error);
  }
}

// Heat Map Layer
async function loadHeatMapLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson')
    const data = await response.json()
    
    const heatData = data.features.map(function(feature) {
      return [
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0],
        feature.properties.area || 1
      ]
    })
    
    heatMapLayer = L.heatLayer(heatData, {
      radius: 20,
      blur: 15,
      maxZoom: 17,
    })

  } catch (error) {
    console.error("Error loading heatmap data:", error)
  }
}

// Cell Towers - Markers with Clusters
async function loadMarkersLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson')
    const data = await response.json()
    
    const geoJsonLayer = L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: 'red',
          fillOpacity: 0.5,
          color: 'red',
          weight: 1,
          opacity: 1
        })
      },
      onEachFeature: function(feature, layer) {
        if (feature.properties) {
          layer.bindPopup('Cell Tower<br>Area: ' + (feature.properties.area || 'Unknown'))
        }
      }
    })
    
    markersLayer = L.markerClusterGroup()
    markersLayer.addLayer(geoJsonLayer)
  } catch (error) {
    console.error("Error loading markers data:", error)
  }
}

async function initializeLayers() {

  await Promise.all([
    loadDistrictsLayer(),
    loadChoroplethLayer(),
    loadHeatMapLayer(),
    loadMarkersLayer()
  ]);

  const overlayLayers = {
    "Tartu districts": districtsLayer,
    "Choropleth layer": choroplethLayer,
    "Heatmap": heatMapLayer,
    "Markers": markersLayer
  };
  

 loadWmsLayers(layers.wmsLayers, overlayLayers);

  const layerControlOptions = {
    collapsed: false,
    position: 'topleft'
  };

  const layerControl = L.control.layers(baseLayers, overlayLayers, layerControlOptions);

  layerControl.addTo(map);

  osmLayer.addTo(map);

  // districtsLayer.addTo(map);
}

//map.on('click', function(event) {
//  console.log(`[${event.latlng.lng}, ${event.latlng.lat}]`);

//  let pointCoords = [event.latlng.lng, event.latlng.lat];
//  let turfPoint = turf.point(pointCoords);

//  L.geoJSON(turfPoint).addTo(map);
//});

initializeLayers();

function loadWmsLayers(layersList, overlayLayers) {
  layersList.forEach(layer => {
    let newLayer = L.tileLayer.wms(layer.url, {
      version: layer.version,
      layers: layer.layers,
      format: layer.format,
      transparent: layer.transparent,
      zIndex: layer.zIndex,
      crs: L.CRS.EPSG3857
    })

    // add each layer to overlayLayers object to display them in layers list menu
    overlayLayers[layer.title.en] = newLayer
  })
}
// turfPractice.turfFunctions(map);
