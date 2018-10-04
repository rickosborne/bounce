package is.ricko.bounce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackageClasses = BounceApplication.class)
public class BounceApplication {
  public static void main(final String[] args) {
    SpringApplication.run(BounceApplication.class, args);
  }
}
