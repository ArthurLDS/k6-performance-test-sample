import http from "k6/http";
import { check } from "k6";
import { Rate } from "k6/metrics";

// A custom metric to track failure rates
var failureRate = new Rate("check_failure_rate");

// Opções customizáveis
export let options = {
    vus: 1,
    stages: [
        // Linearmente aumenta de 1 para 50 VUs durante o primeiro minuto
        { target: 10, duration: "30s" },
        // Segura 50 VUs pelos pr[oximos 3 minutos e 30 segundos
        { target: 10, duration: "30s" },
        // Linearmente diminui de  50 para 0 os  VUs durante 30 segundos
        { target: 0, duration: "30s" }
       // Tempo totatl do testes 5 min  
    ],

    // Regras de corte - podem ser usadas para barrar a execucao
    thresholds: {
        "http_req_duration": ["p(90)<500"] // Tempo do request < 500 ms? 
    }
};

// Função principal do programa
export default function() {
    let response = http.get("https://duckduckgo.com/");

    // Contagem de falahas 
    let checkRes = check(response, {
        "http2 is used": (r) => r.proto === "HTTP/2.0",
        "status is 200": (r) => r.status === 200
    });
    failureRate.add(!checkRes);
};