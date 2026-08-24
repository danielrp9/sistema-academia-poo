# ==========================================
# Estágio 1: Build da Aplicação Spring Boot
# ==========================================
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

# Copia as dependências primeiro para cache do Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código-fonte e recursos estáticos compilados
COPY src ./src

# Compila o JAR de produção ignorando testes no container
RUN mvn clean package -DskipTests -B

# ==========================================
# Estágio 2: Imagem de Execução Otimizada
# ==========================================
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Criação de usuário não-root para segurança
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

# Copia o artefato gerado do estágio de build
COPY --from=build /app/target/*.jar app.jar

# Variáveis padrão
ENV SERVER_PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
