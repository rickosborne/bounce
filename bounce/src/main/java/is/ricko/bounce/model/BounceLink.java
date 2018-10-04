package is.ricko.bounce.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.Date;

@Data
@Entity(name = "link")
@Table(name = "bounce_link")
@AllArgsConstructor
@NoArgsConstructor
public class BounceLink {
  @Column(name = "link_created")
  private Date created;
  @Column(name = "link_hits")
  private Integer hits;
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "link_id")
  private Integer id;
  @Column(name = "link_name")
  private String name;
  @Column(name = "link_peeks")
  private Integer peeks;
  @Column(name = "link_title")
  private String title;
  @Column(name = "link_to")
  private String to;
}
