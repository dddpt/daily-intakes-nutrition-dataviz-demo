
const foodclasses = ["oil", "fruit", "vegetable", "tubers", "sugary"]
const nutrientclasses = ["kcal", "protein", "fat", "carbohydrate"]

function object2array(obj) {
    // {1: elem1, 2: elem2, ...} -> [elem1, elem2, ...]
    return $.map(obj, function (value, index) {
        return [value];
    });
}

function Region(activity) {
    switch (activity) {
        case 3:
        case "it":
            return "ticinese";
            break;
        case 1:
        case "de":
            return "german-speaking";
            break;
        case 2:
        case "fr":
            return "french-speaking";
            break;
        default:
            return "-";
            break;
    }

}

function activityColor(activity) {
    switch (activity) {
        case 3:
        case "it":
        case Region("it"):
            return "#2ecc71"; // touring
        case 1:
        case "de":
        case Region("de"):
            return "#9b59b6"; // off piste
        case 2:
        case "fr":
        case Region("fr"):
            return "#34495e"; //transport
        default:
            return "#95a5a6";
    }
}


function dangerColor(dangerLevel) {
    switch (dangerLevel) {
        case 1:
        case "1":
            return "#ccff66";
        case 2:
        case "2":
            return "#ffff00";
        case 3:
        case "3":
            return "#ff9900";
        case 4:
        case "4":
            return "#ff0000";
        case 5:
        case "5":
            return "#9102ff";
        default:
            return "#95a5a6";
    }
}


function accidentDatumId(datum) {
    return datum.Date + "-" + datum.Latitude + "-" + datum.Longitude;
}

function startTutorial() {
    introJs()
        .onbeforechange(function (d) {
            if (d.dataset.step === '5') {
                selectPoint('22.04.2005-46.00973376026494-7.2305284138');
            }
        })
        .onexit(function() {
            createCookie('introDone', '1', 7);
        })
        .start();
}

function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}