package com.ziggiz.backend.payment;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "payment.youcanpay")
@Getter
@Setter
public class YouCanPayProperties {

    /**
     * Private key from YouCan Pay dashboard > Settings > API Keys.
     * Set it with the YOUCANPAY_PRIVATE_KEY environment variable.
     */
    private String privateKey = "";

    /**
     * Public key used by yp.js in the browser.
     */
    private String publicKey = "";

    private String baseUrl = "https://youcanpay.com";

    private String successUrl = "http://localhost:5173/reservation?payment=success";

    private String errorUrl = "http://localhost:5173/reservation?payment=error";

    private boolean sandbox = false;
}
