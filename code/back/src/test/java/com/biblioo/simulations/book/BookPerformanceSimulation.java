package com.biblioo.simulations.book;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import java.time.Duration;
import java.util.List;
import java.util.Map;

public class BookPerformanceSimulation extends Simulation {

    HttpProtocolBuilder httpProtocol = http
            .baseUrl("http://localhost:8080")
            .acceptHeader("application/json")
            .userAgentHeader("Gatling-Performance-Test");

    FeederBuilder<Object> bookFeeder = listFeeder(List.of(
            Map.of("id", "1"),
            Map.of("id", "2"),
            Map.of("id", "3"),
            Map.of("id", "4"),
            Map.of("id", "5")
    )).circular();

    ScenarioBuilder loadScenario = scenario("Load Test - Get Book By ID")
            .feed(bookFeeder)
            .exec(
                    http("GET /books/{id}")
                            .get("/books/#{id}")
                            .check(status().in(200, 304))
            );

    ScenarioBuilder stressScenario = scenario("Stress Test - Get Book By ID")
            .feed(bookFeeder)
            .exec(
                    http("GET /books/{id}")
                            .get("/books/#{id}")
                            .check(status().in(200, 304))
            );

    ScenarioBuilder enduranceScenario = scenario("Endurance Test - Get Book By ID")
            .feed(bookFeeder)
            .exec(
                    http("GET /books/{id}")
                            .get("/books/#{id}")
                            .check(status().in(200, 304))
            );

    PopulationBuilder loadTest = loadScenario.injectOpen(
            rampUsers(10).during(Duration.ofSeconds(10)),
            rampUsers(50).during(Duration.ofSeconds(15)),
            rampUsers(100).during(Duration.ofSeconds(20)),
            rampUsers(300).during(Duration.ofSeconds(30))
    );

    PopulationBuilder stressTest = stressScenario.injectOpen(
            rampUsersPerSec(10).to(200).during(Duration.ofMinutes(2)),
            constantUsersPerSec(200).during(Duration.ofMinutes(3)),
            rampUsersPerSec(200).to(400).during(Duration.ofMinutes(2))
    );


    PopulationBuilder enduranceTest = enduranceScenario.injectOpen(
            constantUsersPerSec(20).during(Duration.ofMinutes(10))
    );

    // Troque por loadTest, stressTest ou enduranceTest
    {
        setUp(loadTest)
        .protocols(httpProtocol)
        .assertions(
                global().successfulRequests().percent().gt(95.0),
                global().responseTime().percentile3().lt(800),
                global().responseTime().max().lt(2000)
        );
    }
}