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

        listen: function(msgInfo) {
            socket.on(msgInfo.msg, function(data) {
                console.log("Received ", data.msg);
                $('#'+msgInfo.element).html(data.msg);
                if(msgInfo.onReceived) {
                    msgInfo.onReceived();
                }
            })
        }
    }
};
