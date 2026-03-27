package com.biblioo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync // Habilita suporte a métodos assíncronos
public class BibliooApplication {

  public static void main(String[] args) {
    SpringApplication.run(BibliooApplication.class, args);
  }
}
