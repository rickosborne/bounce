package is.ricko.bounce.error;

public class NotFoundException extends RuntimeException {
  public NotFoundException(final String message) {
    super(message);
  }
}
