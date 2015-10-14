

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

    $("#sendAlert").click(function(){
        //console.log("Event Sent");
        var AlertType = $("#alertType").val();
        var detail = $("#alertDetails").val();
        var userlocation = $("#location").val();
        var rating = $("#alertRating").val();
        var userId = $("#userID").html();
        var userName = $("#username").html();
        console.log(userName);

        $.ajax({
            url:"http://emergencyservicecloud.herokuapp.com/cloud/event",
            type: "POST",
            data: {
                alertType: AlertType,
                details: detail,
                location: userlocation,
                rating: rating,
                createdBy: userName,
                createdId: userId
            }
        }).done(function(){
            console.log("saved");
        });

        $.ajax({
            url:"http://communitycloud.herokuapp.com/cloud/receiveAlert",
            type: "POST",
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            data: {
                alertType: AlertType,
                details: detail,
                location: userlocation,
                rating: rating,
                createdBy: userName,
                createdId: userId
            }
        }).done(function(){
            console.log("SENT!");
            console.log("Before Reload");
            location.reload();
            console.log("Reload");
        });


    });