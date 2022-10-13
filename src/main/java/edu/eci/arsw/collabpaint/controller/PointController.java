package edu.eci.arsw.collabpaint.controller;


import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class PointController {

    @MessageMapping("/newpoint")
    @SendTo("/topic/newpoint")
    public Point addPoint(Point p){
        return new Point(p.getX(),p.getY());
    }
}
