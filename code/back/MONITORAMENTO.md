# Guia de Monitoramento Local — Biblioo
> Stack: Spring Boot + Micrometer + Prometheus + Grafana

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [O que foi configurado no projeto](#2-o-que-foi-configurado-no-projeto)
3. [Subindo o ambiente](#3-subindo-o-ambiente)
4. [Configurando o Grafana](#4-configurando-o-grafana)
5. [Importando o dashboard JVM (Micrometer)](#5-importando-o-dashboard-jvm-micrometer)
6. [Importando o dashboard customizado Biblioo](#6-importando-o-dashboard-customizado-biblioo)
7. [Painéis do dashboard Biblioo](#7-painéis-do-dashboard-biblioo)
8. [Queries úteis no Explore](#8-queries-úteis-no-explore)
9. [Backup e persistência dos dashboards](#9-backup-e-persistência-dos-dashboards)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Pré-requisitos

- Docker Desktop instalado e rodando
- Java 21+ e Maven instalados
- Arquivo `.env` configurado na raiz do projeto `code/back/`

---

## 2. O que foi configurado no projeto

### 2.1 Dependências no `pom.xml`

```xml
<!-- Actuator e Prometheus -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**Por que:** o Actuator expõe o endpoint `/actuator/prometheus` e o Micrometer formata as métricas no padrão que o Prometheus entende.

### 2.2 `application.properties`

```properties
# Observabilidade (Actuator / Prometheus)
management.endpoints.web.exposure.include=health,info,prometheus,metrics
management.endpoint.health.show-details=always
management.prometheus.metrics.export.enabled=true
management.metrics.tags.application=${spring.application.name}
management.metrics.distribution.percentiles-histogram.http.server.requests=true
```

A última linha é obrigatória para o painel de latência P95 funcionar.

### 2.3 `SecurityConfig.java`

```java
.requestMatchers("/actuator/health", "/actuator/prometheus").permitAll()
```

Libera o endpoint do Prometheus sem exigir token JWT.

### 2.4 `config/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'spring-boot-backend'
    metrics_path: '/actuator/prometheus'
    scheme: 'http'
    static_configs:
      - targets: ['host.docker.internal:8080']
        labels:
          application: 'biblioo'
```

`host.docker.internal` aponta para sua máquina host a partir de dentro do container Docker (funciona no Windows e Mac nativamente).

### 2.5 `docker-compose.yml` — serviços adicionados

```yaml
prometheus:
  image: prom/prometheus:v2.53.0
  container_name: biblioo-prometheus
  restart: unless-stopped
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'
    - '--web.console.libraries=/etc/prometheus/console_libraries'
    - '--web.console.templates=/etc/prometheus/consoles'
    - '--web.enable-lifecycle'
  volumes:
    - ./config/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    - prometheus_data:/prometheus
  ports:
    - "9090:9090"
  networks:
    - biblioo-net

grafana:
  image: grafana/grafana:10.4.5
  container_name: biblioo-grafana
  restart: unless-stopped
  environment:
    - GF_SECURITY_ADMIN_USER=admin
    - GF_SECURITY_ADMIN_PASSWORD=admin
    - GF_USERS_ALLOW_SIGN_UP=false
  volumes:
    - grafana_data:/var/lib/grafana
  ports:
    - "3000:3000"
  depends_on:
    - prometheus
  networks:
    - biblioo-net

volumes:
  prometheus_data:
  grafana_data:
```

---

## 3. Subindo o ambiente

### Passo 1 — Subir Prometheus e Grafana

```bash
cd code/back
docker-compose up -d prometheus grafana
```

### Passo 2 — Subir o Spring Boot

Pela IDE (IntelliJ/Eclipse) ou via terminal:

```bash
mvn spring-boot:run
```

### Passo 3 — Verificar se as métricas estão sendo expostas

Acesse no navegador:

```
http://localhost:8080/actuator/prometheus
```

Deve aparecer texto com métricas como `jvm_memory_used_bytes`, `http_server_requests_seconds_count`, etc.

### Passo 4 — Verificar se o Prometheus está coletando

Acesse:

```
http://localhost:9090/targets
```

O target `spring-boot-backend` deve aparecer com status **UP** em verde.

> **Problema no Linux:** `host.docker.internal` não funciona nativamente. Adicione no serviço do Prometheus no `docker-compose.yml`:
> ```yaml
> extra_hosts:
>   - "host.docker.internal:host-gateway"
> ```

---

## 4. Configurando o Grafana

### Passo 1 — Acessar

```
http://localhost:3000
```

Login: `admin` / `admin`

### Passo 2 — Adicionar o Prometheus como Data Source

1. Menu lateral: **Connections** → **Data sources**
2. Clique em **Add data source**
3. Selecione **Prometheus**
4. No campo **Prometheus server URL** digite:

```
http://prometheus:9090
```

> Use `prometheus` (nome do container na rede Docker), não `localhost`.

5. Deixe todo o resto como padrão (sem autenticação, sem TLS)
6. Clique em **Save & test**

Deve aparecer a mensagem: `Successfully queried the Prometheus API`

---

## 5. Importando o dashboard JVM (Micrometer)

Dashboard de mercado com métricas de JVM, heap, threads, CPU e Hikari.

1. Menu lateral: **Dashboards** → **New** → **Import**
2. No campo **"Find and import dashboards"** digite: `4701`
3. Clique em **Load**
4. Na caixa suspensa **Prometheus** selecione o datasource criado
5. Clique em **Import**

O dashboard ficará disponível em **Dashboards → JVM (Micrometer)**.

---

## 6. Importando o dashboard customizado Biblioo

O arquivo JSON do dashboard customizado está em:

```
code/back/config/grafana/grafana.json
```

### Como importar

1. Menu lateral: **Dashboards** → **New** → **Import**
2. Clique em **Upload dashboard JSON file**
3. Selecione o arquivo `code/back/config/grafana/grafana.json`
4. Na caixa suspensa **Prometheus** selecione o datasource criado
5. Clique em **Import**

### Como exportar/atualizar o JSON

Sempre que modificar o dashboard, exporte e salve no repositório:

1. Abra o dashboard
2. Clique no ícone de **engrenagem** (⚙️) no topo
3. Clique em **JSON Model**
4. Copie todo o conteúdo e salve em `code/back/config/grafana/grafana.json`
5. Faça commit no Git

---

## 7. Painéis do dashboard Biblioo

### Painel 1 — Requisições por endpoint

Mostra todas as requisições separadas por URI, método HTTP e status code.

```promql
sum by (uri, method, status) (
  rate(http_server_requests_seconds_count{application="biblioo"}[5m])
)
```

Tipo: **Time series** ou **Table**

### Painel 2 — P95 Latência por endpoint (gargalos)

Mostra o tempo que 95% das requisições levam em cada endpoint. Qualquer endpoint acima de 1 segundo é um gargalo.

```promql
histogram_quantile(0.95,
  sum by (uri, le) (
    rate(http_server_requests_seconds_bucket{application="biblioo"}[5m])
  )
)
```

Tipo: **Pie chart** ou **Table**

> Requer `management.metrics.distribution.percentiles-histogram.http.server.requests=true` no `application.properties`.

### Painel 3 — Latência média por endpoint (segundos)

```promql
sum by (uri) (
  rate(http_server_requests_seconds_sum{application="biblioo"}[5m])
)
/
sum by (uri) (
  rate(http_server_requests_seconds_count{application="biblioo"}[5m])
)
```

Tipo: **Time series**

### Painel 4 — Erros 4xx e 5xx por endpoint

Mostra quais endpoints estão retornando erros e com qual status code.

```promql
sum by (uri, status) (
  rate(http_server_requests_seconds_count{application="biblioo", status=~"4..|5.."}[5m])
)
```

Tipo: **Time series** ou **Table**

Para ver contagem total acumulada (não taxa):

```promql
sum by (uri, status) (
  http_server_requests_seconds_count{application="biblioo", status=~"4..|5.."}
)
```

### Painel 5 — Top 10 endpoints mais acessados

Mostra quais rotas os usuários mais usam na última hora, excluindo Actuator e Swagger.

```promql
topk(10, sum by (uri) (
  increase(http_server_requests_seconds_count{
    application="biblioo",
    uri!~"/actuator.*|/swagger.*|/v3.*"
  }[1h])
))
```

Tipo: **Bar chart**

### Painel 6 — Taxa de erros % por endpoint

Porcentagem de requisições com erro por endpoint. Acima de 1% merece atenção.

```promql
sum by (uri) (
  rate(http_server_requests_seconds_count{application="biblioo", status=~"4..|5.."}[5m])
)
/
sum by (uri) (
  rate(http_server_requests_seconds_count{application="biblioo"}[5m])
) * 100
```

Tipo: **Pie chart** ou **Table**

### Painel 7 — Conexões ativas no banco (Hikari)

Se o valor se aproximar de 20 (máximo configurado), o banco está virando gargalo.

```promql
hikaricp_connections_active{application="biblioo"}
```

Tipo: **Time series** (com gradiente verde → vermelho)

### Painel 8 — Cache hit rate (Redis)

Porcentagem de acertos do cache Redis. Abaixo de 70% o cache não está ajudando muito.

```promql
sum(rate(cache_gets_total{application="biblioo", result="hit"}[5m]))
/
sum(rate(cache_gets_total{application="biblioo", result=~"hit|miss"}[5m])) * 100
```

Tipo: **Gauge**

### Painel 9 — Endpoints mais lentos agora

Top 5 endpoints com maior latência média no momento, excluindo Actuator e Swagger.

```promql
topk(5,
  sum by (uri) (
    rate(http_server_requests_seconds_sum{
      application="biblioo",
      uri!~"/actuator.*|/swagger.*|/v3.*"
    }[5m])
  )
  /
  sum by (uri) (
    rate(http_server_requests_seconds_count{
      application="biblioo",
      uri!~"/actuator.*|/swagger.*|/v3.*"
    }[5m])
  )
)
```

Tipo: **Status history** ou **Bar chart**

---

## 8. Queries úteis no Explore

Acesse **Explore** no menu lateral e selecione o datasource **Prometheus**.

### Ver todos os endpoints com tráfego

```promql
http_server_requests_seconds_count{application="biblioo"}
```

### Ver latência P95 só dos endpoints reais (sem Swagger/Actuator)

```promql
histogram_quantile(0.95,
  sum by (uri, le) (
    rate(http_server_requests_seconds_bucket{
      application="biblioo",
      uri!~"/actuator.*|/swagger.*|/v3.*"
    }[5m])
  )
)
```

### Ver apenas erros 403

```promql
rate(http_server_requests_seconds_count{application="biblioo", status="403"}[1m])
```

### Ver conexões pendentes no banco

```promql
hikaricp_connections_pending{application="biblioo"}
```

### Ver uso de memória heap

```promql
jvm_memory_used_bytes{application="biblioo", area="heap"}
```

### Ver taxa total de requisições por segundo

```promql
sum(rate(http_server_requests_seconds_count{application="biblioo"}[5m]))
```

---

## 9. Backup e persistência dos dashboards

### Os dados já estão persistidos

O `docker-compose.yml` declara volumes nomeados `prometheus_data` e `grafana_data`. Isso significa que os dados **não se perdem** ao reiniciar ou recriar os containers, apenas ao rodar `docker volume rm`.

Para verificar onde os volumes estão no disco:

```bash
docker volume inspect biblioo-grafana_data
docker volume inspect biblioo-prometheus_data
```

### Exportar dashboard como JSON (backup manual)

1. Abra o dashboard no Grafana
2. Clique no ícone de **engrenagem** (⚙️) no topo
3. Clique em **JSON Model**
4. Copie tudo e salve em `code/back/config/grafana/grafana.json`
5. Faça commit no Git

### Reimportar após perder o volume

Se o volume do Grafana for perdido:

1. Siga o passo 4 para recriar o datasource Prometheus
2. Siga o passo 5 para reimportar o dashboard JVM (ID `4701`)
3. Siga o passo 6 para reimportar o dashboard customizado do arquivo `grafana.json`

---

## 10. Troubleshooting

### Target DOWN no Prometheus (`localhost:9090/targets`)

O Prometheus não está alcançando o Spring Boot.

- **Windows/Mac:** já funciona com `host.docker.internal`
- **Linux:** adicione no serviço `prometheus` no `docker-compose.yml`:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### `http://localhost:8080/actuator/prometheus` retorna 403

O Spring Security está bloqueando. Verifique se na `SecurityConfig` existe:

```java
.requestMatchers("/actuator/health", "/actuator/prometheus").permitAll()
```

### Painel P95 mostra "No data"

A propriedade de histograma não está ativada. Adicione no `application.properties` e reinicie:

```properties
management.metrics.distribution.percentiles-histogram.http.server.requests=true
```

### Grafana não conecta no Prometheus

Certifique-se de usar `http://prometheus:9090` (nome do container) e não `http://localhost:9090` — dentro da rede Docker, `localhost` aponta para o próprio container do Grafana.

### Dados aparecem só após alguns minutos

Normal. O Prometheus coleta a cada 15 segundos, e as queries com janela de `[5m]` precisam de ao menos 5 minutos de dados para mostrar resultados estáveis. Faça algumas requisições na API e aguarde.