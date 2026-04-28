
// basic map setup
let map = L.map("map").setView([58.373523, 26.716045], 12)

// raster tile layer
const osm = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }
)

osm.addTo(map)

// vector layer: Tartu city cell towers
async function addCelltowersGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  const markers = L.geoJson(data)
  markers.addTo(map)
}

addCelltowersGeoJson('geojson/tartu_city_celltowers_edu.geojson')

// default map settings
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12)
}

addGeoJson('geojson/tartu_city_celltowers_edu.geojson')

// add geoJSON layer
async function addGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  console.log(data.features[0])
}
