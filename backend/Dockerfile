# Multi-stage Dockerfile for Nusantara Fire Sentinel Java Backend
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime Image (Use glibc-based Ubuntu Jammy to support Netty tcnative SSL JNI)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=builder /app/target/sentinel-backend-*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseG1GC -Xms512m -Xmx2048m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
