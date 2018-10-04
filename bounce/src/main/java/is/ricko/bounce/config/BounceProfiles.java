package is.ricko.bounce.config;

import lombok.experimental.UtilityClass;

@UtilityClass
public class BounceProfiles {
  public static final String OAUTH_ENABLED = "oauth";
  public static final String OAUTH_DISABLED = "!" + OAUTH_ENABLED;
  public static final String DEV = "dev";
  public static final String PRODUCTION = "!" + DEV;
}
