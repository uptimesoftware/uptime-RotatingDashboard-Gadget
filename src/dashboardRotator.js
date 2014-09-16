
$("#save").click(function() {
    $(this).prop("disabled", true);

    var settings = {
        urls: $("#dashboards").val(),
        scroll: $("#scroll").val()
    };
    settings.refreshInterval = $("#refreshRate").val();
    if (!settings.urls) {
        $("#error").empty();
        uptimeErrorFormatter.getErrorBox("Please enter a URL", "No URL specified").appendTo('#error');
        $("#error").slideDown();
        $("#save").prop("disabled", false);
    } else if (settings.urls) {
        $("#error").empty().slideUp();
        uptimeGadget.saveSettings(settings).then(doRender, doError);
    }
});

uptimeGadget.registerOnResizeHandler(function(dimensions) {
    $("#frame").height(dimensions.height).width(dimensions.width);
    $("#dest").data("dimensions", dimensions);
});

uptimeGadget.registerOnEditHandler(function() {
    $("#edit").hide();
    var dest = $("#dest");
    var interval = dest.data("interval");
    if (interval) {
        clearInterval(interval);
    }
    dest.empty()
        .removeData("interval")
        .css("background-position", "5px 5px")
        .show();
    uptimeGadget.loadSettings().then(function(settings) {
        editSettings(settings);
    });
});

uptimeGadget.registerOnLoadHandler(function(onLoadData) {
    $("#dest").data("dimensions", onLoadData.dimensions);
    if (onLoadData.hasPreloadedSettings()) {
        doRender(onLoadData.settings);
    } else {
        uptimeGadget.loadSettings(doRender, doError);
    }
});


function editSettings(settings) {
    $("#scroll").chosen();
    $("#dashboards").chosen();


    $("#save").prop("disabled", false);
    $("#error").empty().slideUp();
    $("#dest").hide();
    $("#edit").show();
    $("#dashboards").val(settings ? settings.urls : "");
    $("#dashboards").trigger("liszt:updated");
    $("#scroll").val(settings ? settings.scroll : "auto");
    if (settings && settings.refreshInterval) {
        $("#refreshRate").val(settings.refreshInterval);
    } else {
        $("#refreshRate").val(-1);
    }
}


function doRender(settings) {
    var dest = $("#dest");
    var dashboard_counter = 0;
    if (settings && settings.urls) {
        $("#edit").hide();
        dest.empty()
                .css("background-position", "-9999px -9999px")
                .append($('<iframe id="frame"></iframe>')
                .prop("src", settings.urls[dashboard_counter])
                .prop("scrolling", settings.scroll)
                .height(dest.data("dimensions").height)
                .width(dest.data("dimensions").width))
                .show();
        if (settings.refreshInterval && settings.refreshInterval > 0) {
            dest.data("interval", setInterval(function() {
                dashboard_counter++;
                if (dashboard_counter > settings.urls.length)
                {
                    dashboard_counter = 0;
                }
                $("#frame").prop("src", settings.urls[dashboard_counter]);
            }, settings.refreshInterval * 1000));
        }

            $('#frame').load(function() {
                    $("#frame").contents().find("#nav").hide();
                    $("#frame").contents().find("#navTabs").hide();

            });

    } else {
        editSettings(settings);
    }
}
function doError(status) {
    $("#error").empty();
    uptimeErrorFormatter.getErrorBox(status, "Error communicating with up.time").appendTo('#error');
    $("#error").slideDown();
    $("#save").prop("disabled", false);
}
