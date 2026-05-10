# Stage 1: Build — contiene Maven y JDK completo
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copiamos el pom primero para aprovechar el cache de capas de Docker
# Si solo cambia el código fuente (no las deps), esta capa no se reconstruye
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: Runtime — imagen final liviana, solo JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
