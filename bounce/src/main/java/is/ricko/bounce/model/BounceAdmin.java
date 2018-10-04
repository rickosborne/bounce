package is.ricko.bounce.model;

import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

import javax.persistence.*;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Table(name = "bounce_admin")
@Entity(name = "admin")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BounceAdmin implements UserDetails {
  @Column(name = "admin_email")
  @Id
  private String email;
  @Transient
  @Setter
  private OidcIdToken idToken;
  @Column(name = "admin_name")
  private String name;

  public OAuth2User asOAuth2User() {
    return new AdminOAuth2();
  }

  public OidcUser asOidcUser(final OidcIdToken idToken) {
    return new AdminOidc(idToken);
  }

  protected Map<String, Object> getAttributes() {
    final Map<String, Object> map = new HashMap<>();
    map.put("name", name);
    map.put("email", email);
    return map;
  }

  @Override
  @Transient
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return Collections.emptySet();
  }

  @Override
  @Transient
  public String getPassword() {
    return null;
  }

  @Override
  @Transient
  public String getUsername() {
    return email;
  }

  @Override
  @Transient
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  @Transient
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  @Transient
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  @Transient
  public boolean isEnabled() {
    return true;
  }

  private class AdminOAuth2 implements OAuth2User {
    @Override
    public Map<String, Object> getAttributes() {
      return BounceAdmin.this.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
      return BounceAdmin.this.getAuthorities();
    }

    @Override
    public String getName() {
      return BounceAdmin.this.getName();
    }
  }

  @Getter
  @RequiredArgsConstructor
  public class AdminOidc implements OidcUser {
    private final OidcIdToken idToken;

    @Override
    public Map<String, Object> getAttributes() {
      return BounceAdmin.this.getAttributes();
    }

    @Override
    @Transient
    public Collection<? extends GrantedAuthority> getAuthorities() {
      return BounceAdmin.this.getAuthorities();
    }

    @Override
    @Transient
    public Map<String, Object> getClaims() {
      return Collections.emptyMap();
    }

    @Override
    public String getName() {
      return BounceAdmin.this.getName();
    }

    @Override
    public OidcUserInfo getUserInfo() {
      return new OidcUserInfo(getClaims());
    }
  }
}
