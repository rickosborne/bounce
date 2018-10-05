package is.ricko.bounce.util;

import lombok.experimental.UtilityClass;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.nio.ByteBuffer;
import java.util.Base64;
import java.util.Objects;
import java.util.UUID;

@UtilityClass
public class BounceUtil {
  public static Cookie buildCookie(final String name, final String value) {
    return buildCookie(name, value, null, null, 0);
  }

  public static Cookie buildCookie(final String name, final String value, final String comment, final String domain, final int maxAge) {
    final String sessionId;
    if (value == null || value.isEmpty()) {
      final UUID uuid = UUID.randomUUID();
      final ByteBuffer bytes = ByteBuffer.wrap(new byte[16]);
      bytes.putLong(uuid.getMostSignificantBits());
      bytes.putLong(uuid.getLeastSignificantBits());
      sessionId = Base64.getUrlEncoder().encodeToString(bytes.array());
    } else {
      sessionId = value;
    }
    final Cookie outCookie = new Cookie(name, sessionId);
    if (comment != null) outCookie.setComment(comment);
    if (domain != null) outCookie.setDomain(domain);
    outCookie.setMaxAge(maxAge);
    outCookie.setHttpOnly(true);
    return outCookie;
  }

  public static String chop(final String s, final int len) {
    return s == null || s.isEmpty() ? null : s.length() <= len ? s : s.substring(0, len);
  }

  public static String getCookie(final HttpServletRequest request, final String cookieName) {
    final Cookie[] cookies = request.getCookies();
    if (cookies == null || cookies.length == 0) return null;
    for (final Cookie cookie : cookies) {
      if (Objects.equals(cookie.getName(), cookieName)) {
        return cookie.getValue();
      }
    }
    return null;
  }
}
