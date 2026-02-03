package org.sqlperf.scenario;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ScenarioRegistry {

    private final Map<String, Scenario> slowScenarios;
    private final Map<String, Scenario> optimizedScenarios;

    public ScenarioRegistry() {

        // ----------------------------
        // SLOW SCENARIOS
        // ----------------------------
        slowScenarios = Map.of(
                "missing-index",
                new Scenario(
                        "missing-index",
                        "Orders lookup without index",
                        "DROP INDEX IF EXISTS idx_orders_customer",
                        "SELECT id, customer_id, amount FROM orders WHERE customer_id = 42"
                ),

                // Cursor scenario handled in QueryService (no SQL here)
                "cursor",
                new Scenario(
                        "cursor",
                        "Cursor-based aggregation (handled in Java)",
                        null,
                        null
                )
        );

        // ----------------------------
        // OPTIMIZED SCENARIOS
        // ----------------------------
        optimizedScenarios = Map.of(
                "missing-index",
                new Scenario(
                        "missing-index",
                        "Orders lookup with index",
                        "CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)",
                        "SELECT id, customer_id, amount FROM orders WHERE customer_id = 42"
                ),

                // Cursor scenario handled in QueryService
                "cursor",
                new Scenario(
                        "cursor",
                        "Set-based aggregation (handled in Java)",
                        null,
                        null
                )
        );
    }

    public Scenario getSlow(String id) {
        return slowScenarios.get(id);
    }

    public Scenario getOptimized(String id) {
        return optimizedScenarios.get(id);
    }
}
