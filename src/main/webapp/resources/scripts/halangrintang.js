var stasiun_details;
var gangguan_details = {};
var stat_collection = db.collection("stasiun");
var gangguan_col = db.collection("gangguan");
var stasiun_info = stat_collection.doc(stat_mgd);
var stasiun_ref = db.collection('stasiun');
var line_ref = db.collection('line');
var line = [];
var tagify;
var textarea = document.querySelector('input[name=tags]');
$(document).ready(function () {



    tagify = new Tagify(textarea, {
        enforceWhitelist: true,
        whitelist: []
    });

    line_ref.get().then(snapshot => {
        return snapshot.docs.map(doc => doc)
    }).then(lines => {
        let line_data ={};
        lines.map(line => {
            let real_line = line.data();
            line_data[line.id] = JSON.parse(JSON.stringify(real_line));
        });

        return line_data
    }).then(final_result => {
        for(let key in final_result){
            if(final_result.hasOwnProperty(key)){
                line.push(key);
            }
        }

        tagify.settings.whitelist = line;
    }).catch(error => console.error(error.stack));

    stasiun_ref.get().then(snapshot => {
        return snapshot.docs.map(doc => doc)
    }).then(stasiuns => {
        let st_data = {};
        stasiuns.map(stasiun => {
            let real_stasiun = stasiun.data();
            st_data[stasiun.id] = JSON.parse(JSON.stringify(real_stasiun));
        });

        return st_data;
    }).then(real_stasiun => {
        console.log(real_stasiun);
        for(let key in real_stasiun){
            if(real_stasiun.hasOwnProperty(key)){
                $('#stasiun-form').append('<option value="'+ key +'">' + key +'</option>');
            }
        }
    });

    gangguan_col.get().then(snapshot => {
        return snapshot.docs.map(doc => doc)
        }).then(gangguan => {
            console.log(gangguan)
            let gangguan_details = [];
            for(let i=0; i<gangguan.length; i++){
                let real_gangguan = gangguan[i].data();
                let key = gangguan[i].id;
                gangguan_details[i] = {};
                gangguan_details[i][key] = JSON.parse(JSON.stringify(real_gangguan));

                console.log(gangguan_details[i][gangguan[i].id]);
            }

            return gangguan_details;
        }).then(real_gangguan => {
            console.log(real_gangguan)
            let promise = real_gangguan.map(g => {
                for (let key in g){
                    if(g.hasOwnProperty(key)){
                        let line_affected = g[key].line_affected;
                        for(let i = 0; i < line_affected.length ; i++) {
                            return getLineName(line_affected[i]).then(line =>{
                                return pushLineName(g,key,line);
                            })
                        }
                    }
                }
            });

            return Promise.all(promise)
        }).then(final_result => {
            renderGangguan(final_result);
        }).catch(error => console.error(error.stack));

    $('#save-btn').click(function () {
        let affected_line, nearest_stat, severity, short_desc, long_desc, gangguan_id;

        gangguan_id = $('#gangguan-id-form').val();
        nearest_stat = $('#stasiun-form').val();
        severity = $('#severity-form').val();
        short_desc = $('#short-desc-form').val();
        long_desc = $('#long-desc-form').val();

        affected_line = [];

        tagify.value.map(elem => affected_line.push(elem.value));



        let obj = {};
        obj['line_affected'] = affected_line;
        obj['long_desc'] = long_desc;
        obj['nearest_stat'] = nearest_stat;
        obj['severity'] = severity;
        obj['short_desc'] = short_desc;

        gangguan_col.doc(gangguan_id).update(obj).then(function () {
            Swal.fire('Selesai', 'Status Gangguan Terupdate', 'success');
            let modal = $('#update_modal');
            modal.modal('hide');
        }).catch(function (error) {
            Swal.fire('Gagal', 'Gagal merubah status Gangguan', 'error');
            console.error('Error on :' + error.stack);
        })

    })
});
function switchLine(line){
    let line_class, line_font_class;

    switch (line) {
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

    return [line_class,line_font_class];
}

function switchSevere(severity){
    let severe_class;

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

    return severe_class;
}


function renderGangguan(objects){
    let lines = [];

    let copy_of_objects = [];

    console.log(objects);

    objects.map(obj =>{
        for(let key in obj){
            if(obj.hasOwnProperty(key)){
                if(!lines.includes(obj[key].line_name)){
                    lines.push(obj[key].line_name);
                    obj[key].keys = key;
                    copy_of_objects.push(obj[key])
                }
            }
        }
    });

    console.log(copy_of_objects);

    copy_of_objects.map(obj => {

        let severe_class, line_class, line_font_class;

        let switch_result = switchLine(obj.line_name);

        line_class = switch_result[0];
        line_font_class = switch_result[1];

        severe_class = switchSevere(obj.severity);


        let htmls = '<div id="'+ obj.keys +'" class="row">\n' +
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

        $('#gangguan-div').append(htmls);


        $('#' + obj.keys).click(function () {
            openModal(obj.keys, obj);
        });
    });
}

function openModal(key, objects) {
    tagify.removeAllTags();
    tagify.addTags(objects.line_affected);

    $('#gangguan-id-form').val(key);

    let modal = $('#update_modal');
    modal.modal('show');

}

function getGangguan(){

    return gangguan_col.get().then((snapshot) => {
        let j;
        snapshot.docs.forEach(doc => {
            j = doc;
        });
        return j;
    }).catch(error => console.log(error));
}

function pushToArray(object){
    console.log(object);
    console.log(object.data());

    let data = object.data();

    let gangguan_det = {};

    gangguan_det[object.id] = {};

    gangguan_det[object.id].line_affected = data.line_affected;
    gangguan_det[object.id].long_desc = data.long_desc;
    gangguan_det[object.id].nearest_stat = data.nearest_stat;
    gangguan_det[object.id].severity = data.severity;
    gangguan_det[object.id].short_desc = data.short_desc;

    console.log(gangguan_det);

    return gangguan_det;
}

function getLineName(line){
    let line_doc = db.collection('line').doc(line);

    return line_doc.get().then(line_ref => {
        let k;
        let data = line_ref.data();
        k = data.line_name;
        return k;
    }).catch(error => console.log(error));
}

function pushLineName(objects,key,line){
    let dats = JSON.parse(JSON.stringify(objects));

    let k = JSON.parse(JSON.stringify(dats));
    k[key].line_name = line;

    let return_this = {};
    return_this[key] = JSON.parse(JSON.stringify(k[key]));

    return return_this;
}