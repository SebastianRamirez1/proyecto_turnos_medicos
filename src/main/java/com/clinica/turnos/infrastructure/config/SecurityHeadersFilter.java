package com.clinica.turnos.infrastructure.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Agrega cabeceras de seguridad HTTP en cada respuesta.
 * Basado en OWASP Top 10:2025 — A02 Security Misconfiguration.
 */
@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Impide que el navegador haga MIME-type sniffing (A02)
        response.setHeader("X-Content-Type-Options", "nosniff");

        // Impide que la app sea embebida en iframes — protege contra clickjacking
        response.setHeader("X-Frame-Options", "DENY");

        // Controla qué información de referente se envía
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Desactiva funcionalidades de navegador no usadas
        response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

        filterChain.doFilter(request, response);
    }
}
