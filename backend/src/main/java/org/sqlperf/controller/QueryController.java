package org.sqlperf.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.sqlperf.model.RunRequest;
import org.sqlperf.model.RunResponse;
import org.sqlperf.service.QueryService;

@RestController
@RequestMapping("/api")
public class QueryController {

    private final QueryService service;

    public QueryController(QueryService service) {
        this.service = service;
    }

    @PostMapping("/run")
    public RunResponse run(@RequestBody RunRequest req) {
        return service.run(req.scenarioId(), req.variant());
    }
}
