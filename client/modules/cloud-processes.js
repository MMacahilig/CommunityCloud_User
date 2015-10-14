

    $("#delete").click(function() {
        console.log("clicked");
        $.ajax({
            url: "http://communitycloud.herokuapp.com/cloud/deleteAlerts",
            type: "DELETE",

        }).done(function(){
            console.log("DELETED");
            location.reload();
        });
    });
