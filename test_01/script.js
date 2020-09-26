import http from "k6/http";
import { check } from "k6";
import { Rate } from "k6/metrics";

// A custom metric to track failure rates
var failureRate = new Rate("check_failure_rate");

// Opções customizáveis
export let options = {
    vus: 1,
    stages: [
        // Linearmente aumenta de 1 para 10 VUs durante 30s
        { target: 10, duration: "30s" },
        // Segura 10 VUs pelos por 30 segundos
        { target: 10, duration: "30s" },
        // Linearmente diminui de  10 para 0 os  VUs durante 30 segundos
        { target: 0, duration: "30s" }
       // Tempo totatl do testes 1:30 s  
    ],

    // Regras de corte - podem ser usadas para barrar a execucao
    thresholds: {
        "http_req_duration": ["p(90)<500"] // Tempo do request < 500 ms? (90%)
    }
};

// Função principal do programa
export default function() {
    let response = http.get("https://www.google.com.br");

    // Contagem de falahas customizadas
    let checkRes = check(response, {
        "http2 is used": (r) => r.proto === "HTTP/2.0",
        "status is 200": (r) => r.status === 200
    });
    failureRate.add(!checkRes);
};