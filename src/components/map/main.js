// ************************ MAIN ******************
$(document).ready(() => {
  const options = {}
  const zoom = urlParams.get('zoom')
  const center = urlParams.get('center')
  const box = document.querySelector('.box')
  box.addEventListener('click', e => {
    e.target.classList.toggle('pause')
    if (!play) move()
    else pause()
    play = !play
  })

  if (zoom) options.zoom = zoom
  if (center) options.center = center

  loadMap(options)
})
// ************************ END MAIN ******************

// ************************ COMMAND FUNCTIONS ******************

function move () {
  var elem = document.getElementById('myBar')

  clearInterval(interval)
  interval = setInterval(frame, 100)

  function frame () {
    if (width >= 100) {
      width = 1
      clearInterval(interval)
    } else {
      width++
      elem.style.width = width + '%'
    }
  }
}

function pause () {
  clearInterval(interval)
}

const loadMap = (options = {}) => {
  console.log(`options`, options)
  const { center: coords, zoom } = options
  if (mMap) mMap = null
  if (coords || zoom) mMap = loadMapWithQuery({ coords, zoom })
  else mMap = L.map('mapid', MAP_OPTIONS)
  baseLayer = L.tileLayer(TILE_LAYER, TILE_LAYER_CONFIG)

  const velocityLayer = L.velocityLayer({ ...VELOCITY_CONFIG, data: espana })
  const heatmapLayer = new HeatmapOverlay(HEATMAP_CONFIG)

  const heatmapData = getWindData(step)
  heatmapLayer.setData({
    max: 100,
    data: heatmapData
  })

  if (zoom && hasCoords) {
    let mapBounds = mMap.getBounds()
    let maxBounds = mapBounds.pad(0.1)
    mMap.setMaxBounds(maxBounds)
  }
  addLayersToMap([baseLayer, heatmapLayer, velocityLayer])
  loadSurfingFeatures()
}

const loadMapWithQuery = ({ coords = '', zoom }) => {
  let center = MAP_OPTIONS.center
  const [lat, lon] = coords.trim().split(',')
  const hasCoords = !!lat && !!lon
  console.log(`{lat, lon}`, { lat, lon })
  if (hasCoords) center = new L.LatLng(lat, lon)
  return L.map('mapid', { ...MAP_OPTIONS, zoom, center })
}

const addLayersToMap = (layers = []) => {
  layers.forEach(layer => mMap.addLayer(layer))
}

const loadSurfingFeatures = async () => {
  try {
    const location = getLocation()
    const result = await fetch(location.url, {
      method: 'GET',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    console.log(`result`, result)
    const data = await result.json()
    console.log(`data`, data)
    const surfLayer = new L.GeoJSON(data, {
      pointToLayer,
      onEachFeature: handleOnEachFeature
    })
    const clusters = L.markerClusterGroup()

    clusters.addLayer(surfLayer)
    mMap.addLayer(markers)

    loadGroupedLayers()
    //I will comment it, but it wiil help later with some debugging
    // loadGroupedLayerControl();
  } catch (e) {
    console.log('ERROR', e)
  }
}

//Initialize grouped layers control
const loadGroupedLayerControl = () => {
  let priority = {}
  let visible = overlaysObj.visible
  for (let i in overlaysObj.priority) {
    for (let j in overlaysObj.priority[i]) {
      priority[j] = overlaysObj.priority[i][j]
    }
  }
  let groupedOverlays = {
    Visible: { '1': visible },
    Prioridades: priority
  }
  let mapabase = {
    'Capa base': baseLayer
  }
  L.control.groupedLayers(mapabase, groupedOverlays).addTo(mMap)
}

const loadGroupedLayers = () => {
  let categoryName
  let zoomLevelsPerCategory = 1

  overlaysObj.priority = {}
  overlaysObj.visible = L.layerGroup(categories.visible)
  mMap.addLayer(overlaysObj.visible)
  overlaysObj.visible.eachLayer(marker => marker.openPopup())

  for (categoryName in categories.priorities) {
    let category = categories.priorities[categoryName]
    let categoryLength = category.length
    //Get the number of fetures a zoom level can show from the current category
    let featuresPerZoomLevel = Math.ceil(categoryLength / zoomLevelsPerCategory)
    let splitedArray = splitBy(featuresPerZoomLevel, category)
    console.log(
      `[CAT-NAME=${categoryName}] ZOOM LVLS X CATEGORY=${zoomLevelsPerCategory} & FEATURES X ZOOM LVL=${featuresPerZoomLevel}`
    )
    let features = Object.assign({}, splitedArray)

    overlaysObj.priority[categoryName] = {}

    //iterate over the group of features of a category
    for (let i in features) {
      let categoryLayerGroup, categoryArray
      categoryArray = features[i]
      categoryLayerGroup = L.featureGroup(categoryArray)
      categoryLayerGroup.categoryName = `${categoryName}-${i}`
      overlaysObj.priority[categoryName][
        `${categoryName}-${i}`
      ] = categoryLayerGroup
    }
  }

  // loadLayerBaesedOnZoom()
}

const loadLayerBaesedOnZoom = () => {
  let queryLocation = getLocation()
  let bounds = []
  let minlat = 0,
    minlon = 0,
    maxlat = 0,
    maxlon = 0
  const setCorners = ({ _northEast, _southWest }) => {
    if (!_northEast || !_southWest) return
    if (minlat > _southWest.lat || minlat === 0) minlat = _southWest.lat
    if (minlon > _southWest.lng || minlon === 0) minlon = _southWest.lng
    if (maxlat < _northEast.lat || maxlat === 0) maxlat = _northEast.lat
    if (maxlon < _northEast.lng || maxlon === 0) maxlon = _northEast.lng
  }

  if (queryLocation && queryLocation.location !== 'all') {
    getLayersBaseOnZoom()
    console.log('My Layers based on zoom', layersBasedOnZoom)

    for (let i in layersBasedOnZoom) {
      let layer = layersBasedOnZoom[i]['layer']
      let layerBounds = layer.getBounds()
      console.log('layerBounds', layerBounds)
      setCorners(layerBounds)
      bounds.push(layerBounds)
      mMap.addLayer(layer)
    }
  } else {
    console.log('My Overlays', overlaysObj)
    for (let i in overlaysObj.priority) {
      for (let j in overlaysObj.priority[i]) {
        let layer = overlaysObj.priority[i][j]
        let layerBounds = layer.getBounds()
        console.log('layerBounds', layerBounds)
        setCorners(layerBounds)
        bounds.push(layerBounds)
        mMap.addLayer(layer)
      }
    }
  }
  if (minlat !== 0 && minlon !== 0) {
    const boundForExtraSpace = new L.LatLngBounds(
      new L.LatLng(minlat - 10, minlon - 10),
      new L.LatLng(maxlat + 10, maxlon + 10)
    )
    bounds.push(boundForExtraSpace)
  }
  console.log('bounds', bounds)

  if (bounds.length) {
    mMap.fitBounds(bounds)
    mMap.setMaxBounds(bounds)
  } else {
    setTimeout(() => mMap.setZoom(mMap.getZoom() - 1), 500)
  }
}

// ************************ END COMMAND FUNCTIONS ******************

// ************************ EVENT HANDLERS ******************

const handleOnEachFeature = (feature, layer) => {
  let { prioridad, visible } = feature.properties
  if (visible && visible === 1) {
    categories.visible.push(layer)
  } else {
    if (typeof categories.priorities[prioridad] === 'undefined') {
      categories.priorities[prioridad] = []
    }
    categories.priorities[prioridad].push(layer)
  }
}

// ************************ END EVENT HANDLERS ******************

const getLayersBaseOnZoom = () => {
  let zoomCount = MAX_ZOOM_MARKERS
  for (let i in overlaysObj.priority) {
    for (let j in overlaysObj.priority[i]) {
      console.log(`Zoom lvl=${zoomCount} HAS subcategory=${i}-${j}`)
      let layer = overlaysObj.priority[i][j]
      layersBasedOnZoom[zoomCount] = {}
      layersBasedOnZoom[zoomCount]['layer'] = layer
      if (INITIAL_ZOOM <= zoomCount) zoomCount--
    }
  }
}

const pointToLayer = (feature, latlng) => {
  let text = getPopupHtmlContent(feature)
  let mIcon, marker, popup
  let { visible, enlace } = feature.properties
  let iconOptions = {
    iconSize: [60, 70],
    shadowSize: [50, 50],
    iconAnchor: [22, 70],
    shadowAnchor: [4, 50],
    popupAnchor: [4, -60],
    iconUrl: 'marker.png'
  }
  let popupOptions = {
    closeButton: false,
    className: 'custom',
    autoClose: true
  }

  mIcon = L.icon(iconOptions)
  marker = L.marker(latlng, {
    icon: mIcon
  })

  if (!isMobileDevice()) {
    marker.on('mouseover', () => {
      for (let data of autoCompleteData) {
        data.marker.closePopup()
      }
      marker.openPopup()
    })
    marker.on('click', () => {
      window.open(enlace, '_self')
    })
  }
  popup = marker.bindPopup(
    text,
    visible ? { ...popupOptions, autoClose: false } : popupOptions
  )
  autoCompleteData.push({
    id: feature.id,
    text: feature.properties.nombre_busqueda,
    marker: marker
  })
  return popup
}

//Just split and Array in N parts
const splitBy = (n, a) =>
  a.reduce((acc, curr, i, self) => {
    if (!(i % n)) {
      return [...acc, self.slice(i, i + n)]
    }
    return acc
  }, [])

const isMobileDevice = () =>
  typeof window.orientation !== 'undefined' ||
  navigator.userAgent.indexOf('IEMobile') !== -1

const getPopupHtmlContent = ({ properties: { altura, enlace, nombre } }) =>
  `
    <div class="wave-score">
      <span>${altura} </span>
    </div>
    <div class="wave-link" >
      <a 
      href="${enlace}" >
        ${nombre} 
      </a>
    </div>`



