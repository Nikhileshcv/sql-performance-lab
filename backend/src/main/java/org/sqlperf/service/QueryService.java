package org.sqlperf.service;

import org.sqlperf.model.RunResponse;
import org.sqlperf.scenario.Scenario;
import org.sqlperf.scenario.ScenarioRegistry;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QueryService {

    private final JdbcTemplate jdbc;
    private final ScenarioRegistry registry;

    public QueryService(JdbcTemplate jdbc, ScenarioRegistry registry) {
        this.jdbc = jdbc;
        this.registry = registry;
    }

    public RunResponse run(String scenarioId, String variant) {

        // --------------------------------------
        // SCENARIO 1: CURSOR vs SET-BASED
        // --------------------------------------
        if ("cursor".equals(scenarioId)) {

            long start = System.currentTimeMillis();

            if ("slow".equals(variant)) {
                // Simulate cursor: row-by-row processing in Java
                List<Integer> salaries = jdbc.query(
                        "SELECT salary FROM employees",
                        (rs, i) -> rs.getInt("salary")
                );

                long sum = 0;
                for (int salary : salaries) {
                    sum += salary;
                    // Simulate per-row processing cost
                    try {
                        Thread.sleep(1);
                    } catch (InterruptedException ignored) {
                    }
                }

                long end = System.currentTimeMillis();

                return new RunResponse(
                        end - start,
                        "Row-by-row cursor simulation in application code.\n" +
                                "Each row is processed individually, which does not scale."
                );

            } else {
                // Optimized: set-based aggregation
                Long sum = jdbc.queryForObject(
                        "SELECT SUM(salary) FROM employees",
                        Long.class
                );

                long end = System.currentTimeMillis();

                return new RunResponse(
                        end - start,
                        "Set-based aggregation using SQL SUM().\n" +
                                "Database engine handles aggregation efficiently."
                );
            }
        }

        // --------------------------------------
        // SCENARIO 2: MISSING INDEX
        // --------------------------------------
        Scenario scenario =
                "slow".equals(variant)
                        ? registry.getSlow(scenarioId)
                        : registry.getOptimized(scenarioId);

        if (scenario == null) {
            throw new IllegalArgumentException("Unknown scenario: " + scenarioId);
        }

        // Optional setup SQL (create/drop index)
        if (scenario.setupSql() != null) {
            jdbc.execute(scenario.setupSql());
        }

        long start = System.currentTimeMillis();

        List<String> plan = jdbc.query(
                "EXPLAIN ANALYZE " + scenario.querySql(),
                (rs, i) -> rs.getString(1)
        );

        // Demo-only delay to make slow path deterministic
        if ("slow".equals(variant)) {
            try {
                Thread.sleep(25);
            } catch (InterruptedException ignored) {
            }
        }

        long end = System.currentTimeMillis();

        return new RunResponse(
                end - start,
                String.join("\n", plan)
        );
    }
}
