package is.ricko.bounce.model;

import lombok.Data;

import javax.persistence.*;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Date;

@Data
@Entity(name = "hit")
@Table(name = "bounce_hit")
public class BounceHit {
  @Column(name = "hit_bot")
  private Boolean bot;
  @Column(name = "hit_cookie")
  private String cookie;
  @Column(name = "hit_dt")
  private Date date;
  @Id
  @Column(name = "hit_id")
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;
  @Column(name = "hit_ip4")
  private long ipv4 = 0L;
  @Lob
  @Column(name = "hit_ip6")
  private byte[] ipv6;
  @ManyToOne
  @JoinColumn(name = "hit_link")
  private BounceLink link;
  @Column(name = "hit_mobile")
  private Boolean mobile;
  @Column(name = "hit_ua")
  private String ua;
  @Column(name = "hit_ua_major")
  private Integer uaMajor;
  @Column(name = "hit_ua_vendor")
  private String uaVendor;
  @Column(name = "hit_ua_ver")
  private String uaVer;
  @Column(name = "hit_ref")
  private String referer;

  public void setIpFromString(final String addr) {
    if (addr == null) {
      this.ipv6 = null;
      this.ipv4 = 0L;
      return;
    }
    try {
      final InetAddress ip = InetAddress.getByName(addr);
      if (ip instanceof Inet4Address) {
        final Inet4Address ip4 = (Inet4Address) ip;
        final ByteBuffer buffer = ByteBuffer.allocate(Long.BYTES).order(ByteOrder.BIG_ENDIAN);
        buffer.put(new byte[]{0, 0, 0, 0});
        buffer.put(ip4.getAddress());
        buffer.position(0);
        this.ipv4 = buffer.getLong();
        this.ipv6 = null;
      } else if (ip != null) {
        this.ipv4 = 0L;
        this.ipv6 = ip.getAddress();
      } else {
        this.ipv6 = null;
        this.ipv4 = 0L;
      }
    } catch (final UnknownHostException e) {
      this.ipv6 = null;
      this.ipv4 = 0L;
    }
  }
}
