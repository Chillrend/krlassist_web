var krl_ref = db.collection('krl');

$(document).ready(function () {
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

    $('#save-btn').click(function () {
        let noka, status, stasiun, sf;
        noka = $('#no-ka-form').val();
        status = $('#status-form').val();
        stasiun = $('#status-stasiun-form').val();
        sf = $('#sf-form').val();

        let obj = {};

        console.log(sf);

        obj['realtime-pos'+'.'+'sf'] = sf;
        obj['realtime-pos'+'.'+'stasiun'] = stasiun;
        obj['realtime-pos'+'.'+'status'] = status;

        krl_ref.doc(noka).update(obj).then(function () {
            Swal.fire('Selesai', 'Posisi ' + noka + ' telah terupdate', 'success');
            let modal = $('#update_modal');
            modal.modal('hide');
        }).catch(function (error) {
            Swal.fire('Gagal', 'Gagal merubah posisi ' + noka, 'error');
            console.error('Error on :' + error.stack);
        })
    });
});

var typingTimer;
var doneTypingInterval = 3000;
var $input = $('#krl-search-box');


$input.on('keyup', function () {
    clearTimeout(typingTimer);
    if($input.val()){
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
});

function doneTyping(){
    krl_ref.get().then(snapshot => {
        return snapshot.docs.map(doc => doc)
    }).then(krls => {
        var krl_data = {};
        krls.map(krl => {
            let real_krl = krl.data();
            krl_data[krl.id] = JSON.parse(JSON.stringify(real_krl));
        });
        return krl_data;
    }).then(krl_data => {
        var filtered_krl = {};

        for(let key in krl_data){
            if(krl_data.hasOwnProperty(key)){
                if(key.includes($input.val())){
                    filtered_krl[key] = JSON.parse(JSON.stringify(krl_data[key]));
                    let css_prop = switchLineName(krl_data[key].line);
                    filtered_krl[key].css_prop = JSON.parse(JSON.stringify(css_prop));
                }
            }
        }

        return filtered_krl;
    }).then(filtered_krl => {
        let realtime_div = $('#realtime-div');
        realtime_div.empty();
        for(let key in filtered_krl){
            if(filtered_krl.hasOwnProperty(key)){
                realtime_div.append('<div id="rt'+ key +'" class="metric no-margin ' + filtered_krl[key].css_prop.line_class +'">\n' +
                    '                                <span class="' + filtered_krl[key].css_prop.line_class +' icon">\n' +
                    '                                    <i class="fas fa-train"></i>\n' +
                    '                                </span>\n' +
                    '                                <p class="left">\n' +
                    '                                    <span class="number">' + key + ' ' + filtered_krl[key].line + '</span>\n' +
                    '                                    <span class="title">'+ filtered_krl[key]["realtime-pos"].status + ' ' + filtered_krl[key]["realtime-pos"].stasiun + ' ' + filtered_krl[key]["realtime-pos"].sf + 'SF' +'</span>\n' +
                    '                                </p>\n' +
                    '                            </div>');


                let attach = $('#rt' + key);
                attach.on('click', function () {
                   openModal(filtered_krl[key], key);
                });
            }

        }
    })
}

function openModal(objects, key){
    let modal = $('#update_modal');
    modal.modal('show');

    $('#modal-title').text("Edit Posisi " + key);
    $('#no-ka-form').val(key);

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