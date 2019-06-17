var map;

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -6.2099, lng: 106.8502},
        zoom: 15
    });
}

var line_ref = db.collection('line');
var line_global = {};

var stasiun_ref = db.collection('stasiun');
var stasiun_global ={};

var isStasiunLoaded = false;

$(document).ready(function () {
    line_ref.get().then(snapshot => {
        return snapshot.docs.map(doc => doc)
    }).then(lines => {
        lines.map(line => {
            let real_line = line.data();
            line_global[line.id] = JSON.parse(JSON.stringify(real_line))
        });

        return line_global;
    }).then(final_result => {
        for (let key in final_result){
            if(final_result.hasOwnProperty(key)){
                $('#sf-form').append('<option value="'+ key +'">Rute '+ key +'</option>');
            }
        }
    }).catch(error => console.error(error.stack));


    stasiun_ref.get().then(snapshot => {
        return snapshot.docs.map(doc => doc)
    }).then(stasiuns => {
        let st_data = {};
        stasiuns.map(stasiun => {
            let real_stasiun = stasiun.data();
            stasiun_global[stasiun.id] = JSON.parse(JSON.stringify(real_stasiun));
        });

        isStasiunLoaded = true;
    }).catch(error => console.error(error.stack));

});

$('select').on('change', function () {
    let line = getLineFromLineName(this.value);

    if(isStasiunLoaded){
        renderMap(line);
    }else{
        Swal.fire('Mohon Tunggu', 'Daftar Stasiun sedang dimuat, mohon tunggu', 'warning');
    }

});

var routePath;
var markers = [];

function addMarker(location){
    let marker = new google.maps.Marker({
        position: location,
        map: map
    });

    markers.push(marker);
}

function setMapOnAll(map){
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function clearMarker() {
    setMapOnAll(null);
}

function showMarker(){
    setMapOnAll(map);
}

function deleteMarker() {
    clearMarker();
    markers = [];
}

function renderMap(line){

    deleteMarker();

    if(typeof routePath !== 'undefined'){
        routePath.setPath([]);
        routePath.setMap(null);
    }

    let stasiun_served = line.stasiun_served;
    let geodesicCoordinates = [];
    for(let i=0; i<stasiun_served.length; i++){
        for(let key in stasiun_global){
            if(stasiun_global.hasOwnProperty(key)){
                if(key === stasiun_served[i]){
                    let lat_pos = stasiun_global[key].latitude;
                    let lng_pos = stasiun_global[key].longitude;

                    let pos = {lat: lat_pos, lng: lng_pos};

                    let marker = new google.maps.Marker({
                        position: pos,
                        map: map,
                        title: 'Stasiun ' + key
                    });

                    markers.push(marker)

                    geodesicCoordinates.push(pos);
                }
            }
        }
    }

    showMarker();

    routePath = new google.maps.Polyline({
        path: geodesicCoordinates,
        geodesic: true,
        strokeColor: '#FF000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    routePath.setMap(map);
}

function getLineFromLineName(line_name){
    for(let key in line_global){
        if(line_global.hasOwnProperty(key)){
            if(key === line_name){
                return JSON.parse(JSON.stringify(line_global[key]))
            }
        }
    }
}