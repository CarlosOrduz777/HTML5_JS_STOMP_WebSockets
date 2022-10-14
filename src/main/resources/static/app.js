var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;


    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        var point ={
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
        stompClient.send("/topic/newpoint",{},JSON.stringify(point));
    };

    var drawPolygon = function(points){
            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");
            canvas.width = canvas.width;
            var { x: fstPosX, y: fstPosY } = points[0];
            ctx.moveTo(fstPosX, fstPosY);

            points.forEach(point => {
                const { x , y } = point;
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.lineTo(x,y);
            });
            ctx.lineTo(fstPosX, fstPosY);
            ctx.stroke();
        }


    var connectAndSubscribe = function (number) {
        var canvas = document.getElementById("canvas");
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
         canvas.width = canvas.width;
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/app/newpoint.'+number, function (eventbody) {
               var theObject=JSON.parse(eventbody.body);
               //alert(JSON.stringify(theObject));
               addPointToCanvas(theObject);
            });
            stompClient.subscribe('/topic/newpolygon.'+number, function (eventbody) {
                const points = JSON.parse(eventbody.body);
                drawPolygon(points);
            });

        stompClient.subscribe('/topic/queue.'+number, function (eventbody) {
            const points = JSON.parse(eventbody.body);
            if( points.length  < 3 ){
                points.forEach(point => addPointToCanvas(point));
                return;
            }
            drawPolygon(points);
        });

        stompClient.send('/app/queue.'+number, {});
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            can.addEventListener('click', function (evt) {
                                                  canvas = document.getElementById("canvas");
                                                  var rect = canvas.getBoundingClientRect();
                                                  var p ={
                                                      x: evt.clientX - rect.left,
                                                      y: evt.clientY - rect.top
                                                  };
                                                  var pt = new Point(p.x,p.y);
                                                  console.log("Objeto con clase point: "+JSON.stringify(pt));
                                                  console.log("Objeto sin clase point: "+JSON.stringify(p));
                                                  stompClient.send("/app/newpoint."+$('#number').val(),{},JSON.stringify(pt));
                                              }, false);
            //websocket connection
        },
        connectAndSubscribe: connectAndSubscribe,

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            stompClient.send("/topic/newpoint",{},JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();