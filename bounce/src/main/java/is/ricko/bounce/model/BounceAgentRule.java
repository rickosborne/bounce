package is.ricko.bounce.model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.function.Function;
import java.util.regex.MatchResult;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static is.ricko.bounce.util.BounceUtil.chop;

@Table(name = "bounce_ua")
@Entity(name = "agent")
@AllArgsConstructor
@NoArgsConstructor
public class BounceAgentRule {
  @Column(name = "ua_bot")
  private String bot;
  @Column(name = "ua_major")
  private String major;
  @Column(name = "ua_mobile")
  private String mobile;
  @Column(name = "ua_priority")
  @Id
  private Integer priority;
  @Column(name = "ua_regex")
  private String regex;
  @Column(name = "ua_vendor")
  private String vendor;
  @Column(name = "ua_ver")
  private String ver;

  private Boolean boolFromMatch(final MatchExtractor matchExtractor, final MatchResult result) {
    if (matchExtractor == null || result == null) return null;
    final String string = matchExtractor.apply(result);
    return string != null && !string.isEmpty() && "1".equals(string);
  }

  public MatchExtractor botMatcher() {
    return matchOrLiteral(bot);
  }

  private Integer intFromMatch(final MatchExtractor matchExtractor, final MatchResult result) {
    if (matchExtractor == null || result == null) return null;
    final String s = matchExtractor.apply(result);
    return s == null || s.isEmpty() ? null : Integer.valueOf(s);
  }

  public MatchExtractor majorMatcher() {
    return matchOrLiteral(major);
  }

  private MatchExtractor matchOrLiteral(final String string) {
    if (string == null || string.isEmpty()) return ignored -> null;
    if (string.startsWith("-")) {
      final int groupNum = Math.abs(Integer.valueOf(string));
      return mr -> mr.group(groupNum);
    }
    return mr -> string;
  }

  public MatchExtractor mobileMatcher() {
    return matchOrLiteral(mobile);
  }

  public Pattern regexPattern() {
    return regex == null || regex.isEmpty() ? null : Pattern.compile(regex);
  }

  private String stringFromMatch(final MatchExtractor matchExtractor, final MatchResult result, final int maxLength) {
    if (matchExtractor == null || result == null) return null;
    final String string = matchExtractor.apply(result);
    return chop(string, maxLength);
  }

  public BounceAgent toAgent(final String userAgent) {
    final Matcher matcher = regexPattern().matcher(userAgent);
    if (!matcher.find()) {
      return null;
    }
    final MatchResult result = matcher.toMatchResult();
    return BounceAgent.builder()
      .bot(boolFromMatch(botMatcher(), result))
      .major(intFromMatch(majorMatcher(), result))
      .mobile(boolFromMatch(mobileMatcher(), result))
      .vendor(stringFromMatch(vendorMatcher(), result, 12))
      .ver(stringFromMatch(verMatcher(), result, 8))
      .build();
  }

  public MatchExtractor vendorMatcher() {
    return matchOrLiteral(vendor);
  }

  public MatchExtractor verMatcher() {
    return matchOrLiteral(ver);
  }

  @FunctionalInterface
  public interface MatchExtractor extends Function<MatchResult, String> {}
}
