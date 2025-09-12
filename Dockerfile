# ==== build stage ====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# ==== runtime stage ====
FROM eclipse-temurin:21-jre-jammy
# 建議固定時區
ENV TZ=Asia/Taipei \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS=""
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && useradd -ms /bin/bash spring
WORKDIR /app
COPY --from=build /workspace/target/*.jar /app/app.jar
EXPOSE 8080 8443
USER spring
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
