package is.ricko.bounce;

import org.mockito.Mockito;

import java.util.Objects;
import java.util.UUID;

public abstract class ABounceOfflineTests {
  protected <T> T anyNull() {
    Mockito.any();
    return uninitialized();
  }

  protected <T> T nonNull(final T t) {
    Mockito.eq(t);
    return t;
  }

  protected int randomInt() {
    return Objects.hashCode(Math.random());
  }

  protected String randomString() {
    return UUID.randomUUID().toString();
  }

  protected <T> T uninitialized() {
    return null;
  }
}
