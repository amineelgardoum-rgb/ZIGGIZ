package com.ziggiz.backend.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class YouCanPayTransactionResponse {

    private String object;

    private String id;

    private String status;

    @JsonProperty("order_id")
    private String orderId;

    @JsonProperty("paid_at")
    private String paidAt;

    private Amount amount;

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Amount {
        private String amount;
        private String currency;
    }
}
