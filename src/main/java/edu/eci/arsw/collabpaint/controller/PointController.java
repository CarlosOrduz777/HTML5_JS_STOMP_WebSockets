package edu.eci.arsw.collabpaint.controller;


import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class PointController {

    @Autowired
    SimpMessagingTemplate msgt;

    Map<String, ArrayList<Point>> poligons = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public Point handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        msgt.convertAndSend("/topic/newpoint"+numdibujo, pt);
        if(poligons.containsKey(numdibujo)){
            poligons.get(numdibujo).add(pt);
            if(poligons.get(numdibujo).size() >= 3){
                msgt.convertAndSend("/topic/newpolygon."+numdibujo, poligons.get(numdibujo));
            }
        }else {
            ArrayList<Point> points = new ArrayList<>();
            points.add(pt);
            poligons.put(numdibujo, points);
        }
        return pt;
    }

    @MessageMapping("/queue.{numdibujo}")
    public void handleQueueEvent(@DestinationVariable String numdibujo) throws Exception {
        if(poligons.containsKey(numdibujo)){
            msgt.convertAndSend("/topic/queue."+numdibujo, poligons.get(numdibujo));
        }
    }

}
