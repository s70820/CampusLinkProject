import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class H { public static void main(String[] a) {
  BCryptPasswordEncoder e = new BCryptPasswordEncoder();
  System.out.println("amirul123: " + e.encode("amirul123"));
  System.out.println("sarah123: " + e.encode("sarah123"));
  System.out.println("syed12345: " + e.encode("syed12345"));
  System.out.println("demo123: " + e.encode("demo123"));
}}
