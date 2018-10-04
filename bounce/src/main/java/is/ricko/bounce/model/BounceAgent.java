package is.ricko.bounce.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BounceAgent {
  private Boolean bot;
  private Integer major;
  private Boolean mobile;
  private String vendor;
  private String ver;
}
