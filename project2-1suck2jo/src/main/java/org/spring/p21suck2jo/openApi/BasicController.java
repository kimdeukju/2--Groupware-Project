package org.spring.p21suck2jo.openApi;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api")
public class BasicController {

    @GetMapping({"","/index"})
    public String index(){
        return "openApi/index";
    }
    @GetMapping("/weather")
    public String weather(){
        return "openApi/api/weather/index";
    }
    @GetMapping("/bus")
    public String bus(){
        return "openApi/api/bus/index";
    }
}
