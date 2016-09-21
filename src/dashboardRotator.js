
$("#save").click(function() {
    $(this).prop("disabled", true);

    var settings = {
        urls: $("#dashboards").val(),
        scroll: $("#scroll").val()
    };
    settings.refreshInterval = $("#refreshRate").val();
    if (!settings.urls) {
        $("#error").empty();
        uptimeErrorFormatter.getErrorBox("Please choose some dashboards", "No dashboards selected").appendTo('#error');
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


function populateDashboardSelector(selected_dashboards) {

    var DashboardSelector = $("#dashboards");
    DashboardSelector.chosen();
    DashboardSelector.empty().append("<option />").val(-1).text("Loading...");
    DashboardSelector.trigger("liszt:updated");


    $.ajax("/uptime/dashboards/getTabs", {
        cache : false 
    }).done(function(data, textStatus, jqXHR) {
        console.log(data);
        if ( data.status.value === "SUCCESS")
        {                
            $.each(data.tabs, function() {
                var tab_name = this.name;
                console.log(tab_name);
                var tab_url = "/main.php?page=Dashboards&tab=" + encodeURIComponent(tab_name);
                console.log(tab_url)
                DashboardSelector.append($("<option />").val(tab_url).text(tab_name));
            });
            DashboardSelector.val(selected_dashboards);
            DashboardSelector.trigger("liszt:updated");
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        alert("hey!");
    });
}


function editSettings(settings) {
    $("#scroll").chosen();

    $("#refreshRate").chosen();


    $("#save").prop("disabled", false);
    $("#error").empty().slideUp();
    $("#dest").hide();
    $("#edit").show();
    populateDashboardSelector(settings ? settings.urls : "");
    $("#scroll").val(settings ? settings.scroll : "auto");
    if (settings && settings.refreshInterval) {
        $("#refreshRate").val(settings.refreshInterval);
    } else {
        $("#refreshRate").val(10);
    }
    $("#refreshRate").trigger("liszt:updated");
    $("#scroll").trigger("liszt:updated");

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
    uptimeErrorFormatter.getErrorBox(status, "Error communicating with Uptime").appendTo('#error');
    $("#error").slideDown();
    $("#save").prop("disabled", false);
}
