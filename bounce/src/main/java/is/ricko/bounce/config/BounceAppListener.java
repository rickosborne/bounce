package is.ricko.bounce.config;

import lombok.extern.java.Log;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
@Log
public class BounceAppListener implements ApplicationListener<ApplicationReadyEvent> {
  @Override
  public void onApplicationEvent(final ApplicationReadyEvent event) {
    log.info("Boot complete. Signalling GC.");
    System.gc();
    final String port = event.getApplicationContext().getEnvironment().getProperty("local.server.port", "");
    log.info("App available at:\nhttp://localhost:" + port);
  }
}
