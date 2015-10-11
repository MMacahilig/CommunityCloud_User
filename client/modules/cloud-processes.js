

    $("#delete").click(function() {
        console.log("clicked");
        $.ajax({
            url: "cloud/deleteAlerts",
            type: "DELETE",

        }).done(function(){
            console.log("DELETED");
            location.reload();
        });
    });
