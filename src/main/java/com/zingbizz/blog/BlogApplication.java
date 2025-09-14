// src/main/java/com/zingbizz/blog/BlogApplication.java
package com.zingbizz.blog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ServletWebServerFactory;
import org.springframework.context.annotation.Bean;

import java.net.UnknownHostException;

@SpringBootApplication
public class BlogApplication {
    public static void main(String[] args) {
        SpringApplication.run(BlogApplication.class, args);
    }

    @Bean
    public ServletWebServerFactory servletContainer() throws UnknownHostException {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory();
        // Render requires binding to 0.0.0.0
        tomcat.setAddress(java.net.InetAddress.getByName("0.0.0.0"));
        return tomcat;
    }
}
