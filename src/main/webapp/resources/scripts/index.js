Object.size = function (obj) {
    var size = 0, key;
    for(key in obj){
        if(obj.hasOwnProperty(key)) size++;
    }
    return size;
};
var stasiun_details;
var gangguan_details = {};
var stat_collection = db.collection("stasiun");
var gangguan_col = db.collection("gangguan");
var stasiun_info = stat_collection.doc(stat_mgd);

$(document).ready(function () {


    $('#refresh-btn,#refresh-btn-for-tabel').hover(function(){$(this).children().addClass('fa-spin'); $(this).children().removeClass('pause-anim')}, function(){$(this).children().addClass('pause-anim')});

    stasiun_info.get()
        .then(doc => {
            stasiun_details = doc.data();
            return stasiun_details["line-served"];
        }).then(line_served => {
            var promise = line_served.map(item => {
                return getGangguan(item).then(gangguan =>{
                    return pushToArray(gangguan);
                })
            });

            return Promise.all(promise);

        }).then(gangguan => {
            var promise = gangguan.map(g => {

                for (var key in g){
                    if(g.hasOwnProperty(key)){
                        console.log(g);
                        let line_affected = g[key].line_affected;
                        for(let i = 0; i < line_affected.length ; i++) {
                            return getLineName(line_affected[i]).then(line =>{
                                return pushLineName(gangguan,line);
                            })
                        }
                    }
                }
            });
            return Promise.all(promise)
        }).then(final_result => {
            renderGangguan(final_result)
            setInterval(getNearestTrain(),120000);
        }).catch((error) => {
            console.log(error);
        });

});

function getNearestTrain(){
    var train_col = db.collection('krl');
    train_col.get().then(snapshot => {
        return snapshot.docs.map(doc => doc)
    }).then(krls => {
        console.log(krls);
        var krl_data = {};
        krls.map(krl =>{

            let real_krl = krl.data();

            krl_data[krl.id] = JSON.parse(JSON.stringify(real_krl));

        });
        return krl_data;
    }).then(krl_data => {
        var push_this = [];
        var i = 0;
        for(var key in krl_data){
            if(krl_data.hasOwnProperty(key)){
                if(stasiun_details['line-served'].includes(krl_data[key].line)){

                    var krl = krl_data[key];

                    if(krl['realtime-pos'].status !== "NOT OPERATIONAL" && stasiun_details.neighbors.includes(krl['realtime-pos'].stasiun)){
                        push_this[i] = {};
                        push_this[i][key] = {};
                        push_this[i][key] = JSON.parse(JSON.stringify(krl));
                        i++;
                    }
                }
            }
        }

        return push_this;
    }).then(filtered_krl => {

        var push_this = {};
        var promise = filtered_krl.map(i => {
            for(var key in i){
                if(i.hasOwnProperty(key)){
                    return getTerminus(i[key].line).then(result => {
                        return pushTerminusName(key, i[key], result)
                    })
                }
            }
        });

        console.log(promise);

        return Promise.all(promise);
    }).then(result => {
        if(result.length === 1){
            let the_data = result[0];
            for(var key in the_data){
                if (the_data.hasOwnProperty(key)) {
                    $('#pid-1-tujuan-akhir').text(the_data[key].terminus[1]);
                    $('#pid-1-status').text(the_data[key]['realtime-pos'].status + " " + the_data[key]['realtime-pos'].stasiun);
                }
            }

        }else if(result.length === 2){
            for(var i=0; i<result.length; i++){
                let the_data = result[i];
                for(var key in the_data){
                    if(the_data.hasOwnProperty(key)){
                        let pid_tujuan_akhir = document.getElementById("pid-" + (i+1) + "-tujuan-akhir");
                        let pid_status = document.getElementById("pid-" + (i+1) + "-status");

                        $(pid_tujuan_akhir).text(the_data[key].terminus[1]);
                        $(pid_status).text(the_data[key]['realtime-pos'].status + " " + the_data[key]['realtime-pos'].stasiun);
                    }
                }
            }
        }else if(result.length > 3){
            var iterate_this = [];
            iterate_this.push([result[result.length-1],result[result.length-2]]);

            for(var i=0; i<iterate_this.length; i++){
                let the_data = iterate_this[i];
                for(var key in the_data){
                    if(the_data.hasOwnProperty(key)){
                        let pid_tujuan_akhir = document.getElementById("pid-" + (i+1) + "-tujuan-akhir");
                        let pid_status = document.getElementById("pid-" + (i+1) + "-status");

                        $(pid_tujuan_akhir).text(the_data[key].terminus[1]);
                        $(pid_status).text(the_data[key]['realtime-pos'].status + " " + the_data[key]['realtime-pos'].stasiun);
                    }
                }
            }
        }

        for(var j = 0; j<result.length; j++){
            let the_data = result[j];
            for(let k in the_data){
                if(the_data.hasOwnProperty(k)){
                    $('#departure-board').append('<tr>\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t<td><a href="#">' + k +'</a></td>\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t<td>'+ the_data[k].line +'</td>\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t<td>'+ the_data[k]["realtime-pos"].sf +'</td>\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t\t<td><span class="label label-success">'+ the_data[k]["realtime-pos"].status + ' ' + the_data[k]['realtime-pos'].stasiun  + '</span></td>\n' +
                        '\t\t\t\t\t\t\t\t\t\t\t</tr>');
                }
            }
        }
    }).catch(error => {
        console.log(error)
    })
}

function getTerminus(line){
    var line_ref = db.collection("line");

    return line_ref.doc(line).get().then((snapshot) => {
        var j = snapshot.data();
        var k = [j.start_station,j.end_station];
        return k;
    })
}

function pushTerminusName(key, krl, terminus){

    var obj = {};
    obj[key] = {};
    obj[key] = JSON.parse(JSON.stringify(krl));
    obj[key].terminus = terminus;
    return obj;


}

function getGangguan(line_served){

    return gangguan_col.where("line_affected", "array-contains", line_served).get().then((snapshot) => {
            var j;
            snapshot.docs.forEach(doc => {
                j = doc;
            });
            return j;
        })
        .catch(error => console.log(error))
}

function pushToArray(object){
    console.log(object);
    console.log(object.data());

    let data = object.data();

    var gangguan_det = {};

    gangguan_det[object.id] = {};

    gangguan_det[object.id].line_affected = data.line_affected;
    gangguan_det[object.id].long_desc = data.long_desc;
    gangguan_det[object.id].nearest_stat = data.nearest_stat;
    gangguan_det[object.id].severity = data.severity;
    gangguan_det[object.id].short_desc = data.short_desc;

    console.log(gangguan_det);

    return gangguan_det;
}

function pushLineName(objects,line){
    let return_this = JSON.parse(JSON.stringify(objects));

    for (var i = 0; i < return_this.length; i++){
        for(var key in return_this[i]){
            if(return_this[i].hasOwnProperty(key)){
                let k = JSON.parse(JSON.stringify(return_this[i]));

                k[key].line_name = line;

                return_this[i] = k[key];
            }
        }
    }

    return return_this;
}

function getLineName(line){
    var line_doc = db.collection('line').doc(line);

    return line_doc.get().then(line_ref => {
        var k;
        var data = line_ref.data();
        k = data.line_name;
        return k;
    }).catch(error => console.log(error));
}

function renderGangguan(objects){
    var gangguan_panel = document.getElementById('gangguan_panel');
    var lines = [];

    var copy_of_objects = [];

    console.log(objects);

    objects.map(obj =>{
       for(var key in obj){
           if(obj.hasOwnProperty(key)){
               if(!lines.includes(obj[key].line_name)){
                   lines.push(obj[key].line_name);

                   copy_of_objects.push(obj[key])
               }
           }
       }
    });

    console.log(copy_of_objects);

    copy_of_objects.map(obj => {

        let severe_class, line_class, line_font_class;

        switch (obj.line_name) {
            case 'Loop Line':
                line_class = "loop-line";
                line_font_class = "loop-line-font";
                break;
            case 'Central Line':
                line_class = "red-line";
                line_font_class = "red-line-font";
                break;
            case 'Bekasi Line':
                line_class = "bekasi-line";
                line_font_class = "bekasi-line-font";
                break;
            case 'Tangerang Line':
                line_class = "tangerang-line";
                line_font_class = "tangerang-line-font";
                break;
            case 'Rangkasbitung Line':
                line_class = "rangkasbitung-line";
                line_font_class = "rangkasbitung-line-font";
                break;
            default:
                line_class = "rangkasbitung-line";
                line_font_class = "rangkasbitung-line-font";
                break;
        }

        let severity = obj.severity;

        switch (severity) {
            case 'SEVERE':
                severe_class = "color-danger";
                break;
            case 'MEDIUM' :
                severe_class = "color-warning";
                break;
            case 'NORMAL':
                severe_class = "color-normal";
                break;
            default:
                severe_class = "color-normal";
                break;
        }

        var htmls = '<div class="row">\n' +
            '                                <div class="col-md-12">\n' +
            '                                    <div class="metric '+ severe_class +'" >\n' +
            '                                        <span class="'+ line_class +' icon">\n' +
            '                                            <i class="fas fa-train"></i>\n' +
            '                                        </span>\n' +
            '                                        <p>\n' +
            '                                            <span class="number">'+ obj.line_name +' : '+ obj.short_desc +'</span>\n' +
            '                                            <span class="title">' + obj.long_desc +' di Stasiun '+ obj.nearest_stat +'</span>\n' +
            '                                        </p>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                            </div>';
        $(gangguan_panel).append(htmls);

    });
}



function noop(){

}