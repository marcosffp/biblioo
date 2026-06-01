# Stage 1 — Build com Maven + Java 25
FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /app

# Baixa dependências antes de copiar o código (cache de camada)
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn clean package -DskipTests -q

# Stage 2 — Runtime mínimo
FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /app/target/biblioo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:InitialRAMPercentage=25.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
