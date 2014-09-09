
$("#save").click(function() {
    $(this).prop("disabled", true);
    var settings = {
        iframeUrl: $.trim($("#iframeUrl").val()),
        scroll: $("#scroll").val()
    };
    settings.refreshInterval = $("#refreshRate").val();
    if (!settings.iframeUrl) {
        $("#error").empty();
        uptimeErrorFormatter.getErrorBox("Please enter a URL", "No URL specified").appendTo('#error');
        $("#error").slideDown();
        $("#save").prop("disabled", false);
    } else if (settings.iframeUrl) {
        $("#error").empty();
        uptimeErrorFormatter.getErrorBox("Please enter a valid URL", "Invalid URL").appendTo('#error');
        $("#error").slideDown();
        $("#save").prop("disabled", false);
    } else {
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
    $("#save").prop("disabled", false);
    $("#error").empty().slideUp();
    $("#dest").hide();
    $("#edit").show();
    $("#iframeUrl").val(settings ? settings.iframeUrl : "").focus();
    $("#scroll").val(settings ? settings.scroll : "auto");
    if (settings && settings.refreshInterval) {
        $("#refreshRate").val(settings.refreshInterval);
    } else {
        $("#refreshRate").val(-1);
    }
}
function doRender(settings) {
    var dest = $("#dest");
    if (settings && settings.iframeUrl) {
        $("#edit").hide();
        dest.empty()
                .css("background-position", "-9999px -9999px")
                .append($('<iframe id="frame"></iframe>')
                .prop("src", settings.iframeUrl)
                .prop("scrolling", settings.scroll)
                .height(dest.data("dimensions").height)
                .width(dest.data("dimensions").width))
                .show();
        if (settings.refreshInterval && settings.refreshInterval > 0) {
            dest.data("interval", setInterval(function() {
                $("#frame").prop("src", settings.iframeUrl);
            }, settings.refreshInterval * 1000));
        }
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
