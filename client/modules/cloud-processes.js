

    $("#deleteEvents").click(function() {
        var userId = $("#userID").html();
        //console.log("clicked");
        //$.ajax({
        //    url: "http://communitycloud.herokuapp.com/cloud/deleteEvents",
        //    type: "DELETE",
        //
        //}).done(function(){
        //    console.log("DELETED");
        //    location.reload();
        //});

        $.ajax({
            url:"http://communitycloud.herokuapp.com/cloud/dismissallevent",
            type: "PUT",
            data: {
                id:userId,
            }
        }).done(function(){
            console.log("DELETED");
            location.reload();
        });

    });

    $("#deleteAlerts").click(function() {
        var userId = $("#userID").html();
        console.log("clicked");
        $.ajax({
            url: "http://communitycloud.herokuapp.com/cloud/deleteAlerts",
            type: "DELETE",
            data: {
            id:userId,
        }}).done(function(){
            console.log("DELETED");
            location.reload();
        });

        //$.ajax({
        //    url:"http://communitycloud.herokuapp.com/cloud/dismissallevent",
        //    type: "PUT",
        //    data: {
        //        id:userId,
        //    }
        //}).done(function(){
        //    console.log("DELETED");
        //    location.reload();
        //});


    });
    $("#sendAlert").click(function(){
        //console.log("Event Sent");
        var AlertType = $("#alertType").val();
        var detail = $("#alertDetails").val();
        var userlocation = $("#location").val();
        var address =  $("#address").val();
        var city  =  $("#city").val();
        var state =  $("#state").val();
        var rating = $("#alertRating").val();
        var userId = $("#userID").html();
        var userName = $("#username").html();
        console.log(rating);

        $.ajax({
            url:"http://communitycloud.herokuapp.com/cloud/alert",
            type: "POST",
            data: {
                alertType: AlertType,
                details: detail,
                address: address,
                city: city,
                state: state,
                rating: rating,
                createdBy: userName,
                createdId: userId
            }
        }).done(function(){
            console.log("saved");
        });

        $.ajax({
            url:"http://emergencyservicecloud.herokuapp.com/cloud/receiveAlert",
            type: "POST",
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            data: {
                alertType: AlertType,
                details: detail,
                address: address,
                city: city,
                state: state,
                rating: rating,
                createdBy: userName,
                createdId: userId
            }
        }).done(function(){
            console.log("SENT!");
            console.log("Before Reload");
            location.reload();
        });


    });

    $(".close").click(function() {
        var userId = $("#userID").html();
        var eventId = $(this).parent().parent().find("#eventId").text();
        $(this).parent().parent().fadeOut();
        $.ajax({
            url:"http://communitycloud.herokuapp.com/cloud/dismissevent",
            type: "PUT",
            data: {
                id:userId,
                eventId:eventId
            }
        }).done(function(){
            console.log("saved");
        });
    });