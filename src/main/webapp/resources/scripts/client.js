Object.size = function (obj) {
    var size = 0, key;
    for(key in obj){
        if(obj.hasOwnProperty(key)) size++;
    }
    return size;
};
var stasiun_details;
var gangguan_details = {};
var gangguan_col = db.collection("gangguan");
$(document).ready(function () {

    $('#loader').hide();
    var stasiun_ref = db.collection('stasiun');

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
                $('#status-stasiun-form').append('<option value="'+ key +'">' + key +'</option>');
            }
        }
    });

    $('#krl-search-box').click(function () {
        $('#stasiuncn').text('Ketik Nama Stasiun');
    });
});

var typingTimer;
var doneTypingInterval = 3000;
var $input = $('#krl-search-box');


$input.on('keyup', function () {
    $('#loader').show();
    clearTimeout(typingTimer);
    if($input.val()){
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
});

function doneTyping(){
    
    var stasiun_ref = db.collection('stasiun');
    stasiun_ref.get().then(snapshot => {
        return snapshot.docs.map(doc => doc)
    }).then(stasiuns => {
        var stasiun_data = {};
        stasiuns.map(stasiun => {
            let real_stasiun = stasiun.data();
            stasiun_data[stasiun.id] = JSON.parse(JSON.stringify(real_stasiun));
        });
        return stasiun_data;
    }).then(stasiun_data => {
        var filtered_stasiun = {};
        var asd = 'line-served';
        for(let key in stasiun_data){
            if(stasiun_data.hasOwnProperty(key)){
                if(key.includes($input.val())){
                    filtered_stasiun[key] = JSON.parse(JSON.stringify(stasiun_data[key]));
                    let css_prop = switchLineName(stasiun_data[key]["line-served"][0]);
                    filtered_stasiun[key].css_prop = JSON.parse(JSON.stringify(css_prop));
                }
            }
        }

        return filtered_stasiun;
    }).then(filtered_stasiun => {
        let realtime_div = $('#realtime-div');
        realtime_div.empty();
        for(let key in filtered_stasiun){
            if(filtered_stasiun.hasOwnProperty(key)){
                realtime_div.append('<div id="rt'+ key +'" class="metric no-margin ' + filtered_stasiun[key].css_prop.line_class +'">\n' +
                    '                                <span class="' + filtered_stasiun[key].css_prop.line_class +' icon">\n' +
                    '                                    <i class="fas fa-train"></i>\n' +
                    '                                </span>\n' +
                    '                                <p class="left">\n' +
                    '                                    <span class="number">' + key + '</span>\n' +
                    '                                </p>\n' +
                    '                            </div>');


                let attach = $('#rt' + key);
                attach.on('click', function () {
                   getAll(key);
                });
            }

        }
        $('#loader').hide();
    })
}



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
                    });
                }
            }
        });

        console.log(promise);

        return Promise.all(promise);
    }).then(result => {
        $('#departure-board').empty();
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















// function getAll(keye){
//     $('#stasiuncn').text(keye);
//     krl_ref.where("status", "==", "Di").where("status", "==", "Berangkat").get().then(snapshot => {
//         return snapshot.docs.map(doc => doc)
//     }).then(krls => {
//         var krl_data = {};
//         krls.map(krl => {
//             let real_krl = krl.data();
//             krl_data[krl.id] = JSON.parse(JSON.stringify(real_krl));
//         });
//         return krl_data;
//     }).then(krl_data => {
//         let realtime_div = $('#realtime-div');
//         realtime_div.empty();
//         for(let key in krl_data){
//             if(krl_data.hasOwnProperty(key)){
//                 realtime_div.append('<div id="rt'+ key +'" class="metric no-margin red-line">\n' +
//                 '                                <span class="red-line icon">\n' +
//                 '                                    <i class="fas fa-train"></i>\n' +
//                 '                                </span>\n' +
//                 '                                <p class="left">\n' +
//                 '                                    <span class="number">' + key + ' ' + key.line + '</span>\n' +
//                 '                                    <span class="title">'+ key["realtime-pos"].status + ' ' + key["realtime-pos"].stasiun + ' ' + key["realtime-pos"].sf + 'SF' +'</span>\n' +
//                 '                                </p>\n' +
//                 '                            </div>');

//             }
//         }

      
//     });
// }

// function openModal(key){
//     var stas = db.collection("krl");
//     var query = stas.where("stasiun", "==", key);
//     query.get().then(snapshot => {
//         return snapshot.docs.map(doc => doc)
//     }).then(stasiuns => {
//         let st_data = {};
//         stasiuns.map(stasiun => {
//             let real_stasiun = stasiun.data();
//             st_data[stasiun.id] = JSON.parse(JSON.stringify(real_stasiun));
//         });

//         return st_data;
//     }).then(real_stasiun => {
//         console.log(real_stasiun);

//         for(let key in real_stasiun["line-served"]){
//             let modal = $('#update_modal');
//             modal.modal('show');
        
//             $('#modal-title').text("Edit Posisi " + key);
//             $('#no-ka-form').val(key);
                    
//         }
//     });

// }
function getAll(keye){
    $('#stasiuncn').text(keye);
    var stat_collection = db.collection("stasiun");
    var gangguan_col = db.collection("gangguan");
    var stasiun_info = stat_collection.doc(keye);
    stasiun_info.get()
    .then(doc => {
        stasiun_details = doc.data();
        return stasiun_details["line-served"];
    }).then(final_result => {
        setInterval(getNearestTrain(),1000);
    }).catch((error) => {
        console.log(error);
    });

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
function switchLineName(line){
    let line_class,line_font_class;

    switch (line) {
        case 'DP-AK':
        case 'AK-DP':
        case 'DP-JNG':
        case 'JNG-DP':
        case 'BOO-AK':
        case 'AK-BOO':
        case 'JNG-BOO':
        case 'BOO-JNG':
        case 'NMO-AK':
        case 'AK-NMO':
            line_class = "loop-line";
            line_font_class = "loop-line-font";
            break;
        case 'BOO-JAKK':
        case 'JAKK-BOO':
        case 'DP-MRI':
        case 'MRI-DP':
        case 'BOO-MRI':
        case 'MRI-BOO':
        case 'JAKK-DP':
        case 'DP-JAKK':
            line_class = "red-line";
            line_font_class = "red-line-font";
            break;
        case 'JAKK-CKR':
        case 'CKR-JAKK':
        case 'MRI-CKR':
        case 'CKR-MRI':
        case 'MRI-BKS':
        case 'BKS-MRI':
        case 'BKS-JAKK':
        case 'JAKK-BKS':
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

    let returning = {'line_class' : line_class, 'line_font_class' : line_font_class};

    return returning;
}