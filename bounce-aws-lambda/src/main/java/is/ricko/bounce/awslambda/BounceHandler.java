package is.ricko.bounce.awslambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Value;

public class BounceHandler implements RequestHandler<BounceHandler.BounceRequest, BounceHandler.BounceResponse> {
  public BounceResponse handleRequest(final BounceRequest request, final Context context) {
    if (request == null) return BounceResponse.builder().statusCode(500).statusReason("Invalid Request").build();
    return BounceResponse.builder().location("https://rickosborne.org/").statusCode(302).statusReason("Found").build();
  }

  @Data
  public static class BounceRequest {
    private String cookie;
    private String linkName;
  }

  @Value
  @AllArgsConstructor
  @Builder
  public static class BounceResponse {
    private final String cookie;
    private final String location;
    private final int statusCode;
    private final String statusReason;
  }
}
