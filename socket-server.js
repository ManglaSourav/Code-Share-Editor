"use strict";
var socketIO = require("socket.io");

module.exports = function(server) {
  var io = socketIO(server);

  io.on("connection", function(socket) {
    socket.on("chatMessage", function(data) {
      // console.log( socket.room);
      io.to(socket.room).emit("chatMessage", data);
    });

    socket.on("JoinRoom", function(data) {
      console.log(data);
      socket.room = data.room;
      socket.join(data.room);
      // console.log("from joinRoom", socket.room, data.room, data);
    });

    socket.on("disconnect", function() {
      socket.leave(socket.room);
    });
  });
};
