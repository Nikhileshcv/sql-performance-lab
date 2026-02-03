package org.sqlperf.scenario;

public record Scenario(
        String id,
        String description,
        String setupSql,
        String querySql
) {}

