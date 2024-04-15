const { Server } = require("socket.io");
const http = require("http");

const httpServer = http.createServer();
let strokes = {
  
}
const io = new Server(httpServer, {
  // your options here
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // join a specific room
  socket.on("joinRoom", ({roomId, username}) => {
    socket.join(roomId);
    if (!strokes[roomId]) {
      strokes[roomId] = {'data': [], 'users': {}};
    }
    console.log(strokes)
    strokes[roomId]['users'][username] = {isDrawing: false};
  });

  socket.on("isDrawing", ({roomId, username}) => {
    if (!strokes[roomId]) {
      strokes[roomId] = {'data': [], 'users': {}};
    }
    if(!strokes[roomId]['users'][username]) {
      strokes[roomId]['users'][username] = {isDrawing: false};
    }
    strokes[roomId]['users'][username].isDrawing = true;
    io.to(roomId).emit("isDrawing", strokes[roomId]['users']);
  });

  socket.on("notDrawing", ({roomId, username}) => {
    if (!strokes[roomId]) {
      strokes[roomId] = {'data': [], 'users': {}};
    }
    if(!strokes[roomId]['users'][username]) {
      strokes[roomId]['users'][username] = {isDrawing: false};
    }
    strokes[roomId]['users'][username].isDrawing = false;
    io.to(roomId).emit("isDrawing", strokes[roomId]['users']);
  });

  // forwarding messages to a room
  socket.on("sendMessage", ({ roomId, message }) => {
    io.to(roomId).emit("newMessage", message);
  });

  socket.on("getStrokes", (roomId) => {
    io.to(roomId).emit("getStrokens", strokes[roomId]);
  });

  socket.on("getNoRooms", () => {
    io.emit("getNoRooms", Object.keys(strokes).length);
  });

  socket.on("drawing", ({ roomId, data, username }) => {
    if (!strokes[roomId]) {
      strokes[roomId] = [];
    }
    if (!strokes[roomId]['data']) {
      strokes[roomId]['data'] = [];
    }
    strokes[roomId]['data'].push(data);
    io.to(roomId).emit("drawing", strokes[roomId]);
  });

  socket.on('resetCanvas', (roomId) => {
    console.log('resetCanvas', roomId);
    io.to(roomId).emit('drawing', strokes);
  });

});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`Socket.io server running on port ${PORT}`));
