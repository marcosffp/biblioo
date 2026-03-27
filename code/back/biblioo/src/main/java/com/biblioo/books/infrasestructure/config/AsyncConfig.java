package com.biblioo.books.infrasestructure.config;

import java.util.concurrent.ThreadPoolExecutor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
public class AsyncConfig {

  /**
   * Executor dedicado ao enriquecimento assíncrono de livros. Separado do pool padrão do Spring
   * para não competir com requisições HTTP do servidor.
   */
  @Bean(name = "bookEnrichExecutor")
  public TaskExecutor bookEnrichExecutor() {
    var executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(4);
    executor.setMaxPoolSize(10);
    executor.setQueueCapacity(200);
    executor.setThreadNamePrefix("book-enrich-");
    // CallerRunsPolicy: se a fila estiver cheia, roda na thread chamadora
    // em vez de descartar a tarefa silenciosamente
    executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    executor.initialize();
    return executor;
  }
}
