/**
 * Created by atg on 30/01/2017.
 */

//Handles all the socket data

var socketManager = undefined;
var SocketManager = function() {
    var socket;

    return {
        init: function() {

        },

        connect: function(addr, port) {
            //socket = io.connect(addr + ":" + port);
            socket = io.connect();
        },

        listen: function(event, elem) {
            socket.on(event, function(data) {
                console.log("Received ", data.msg);
                $('#'+elem).html(data.msg);
            })
        }
    }
};
