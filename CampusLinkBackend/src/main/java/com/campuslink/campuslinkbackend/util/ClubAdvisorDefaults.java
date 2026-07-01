package com.campuslink.campuslinkbackend.util;

/**
 * Realistic UMT club advisor defaults for demo certificates, programmes, and role-request forms.
 * Each active demo club maps to a distinct advisor.
 */
public final class ClubAdvisorDefaults {

    public static final String ROLE_LABEL = "Penasihat Kelab";
    public static final String SIGNATURE_DIR = "demo-docs/advisor-signatures";

    public record Advisor(String name, String email, String signatureFile, String position) {}

    private static final Advisor SITI_AMINAH = new Advisor(
            "Dr. Siti Aminah binti Yusof",
            "siti.aminah@umt.edu.my",
            "siti-aminah.png",
            "Pensyarah Kanan, Fakulti Sains Komputer dan Matematik (FSKM)");
    private static final Advisor AHMAD_FAIZAL = new Advisor(
            "Dr. Ahmad Faizal bin Ismail",
            "ahmad.faizal@umt.edu.my",
            "ahmad-faizal.png",
            "Pensyarah Kanan, Fakulti Sains Komputer dan Matematik (FSKM)");
    private static final Advisor WAN_RUSHDAN = new Advisor(
            "Assoc. Prof. Dr. Wan Mohd Rushdan bin Wan Hassan",
            "rushdan.wan@umt.edu.my",
            "wan-rushdan.png",
            "Pensyarah Kanan, Fakulti Teknologi Kejuruteraan Kelautan (FTKK)");
    private static final Advisor NORHAYATI = new Advisor(
            "Dr. Norhayati binti Abdullah",
            "norhayati.abdullah@umt.edu.my",
            "norhayati-abdullah.png",
            "Pensyarah Kanan, Fakulti Sains dan Teknologi Makanan (FPSM)");
    private static final Advisor NORAZILA = new Advisor(
            "Pn. Norazila binti Mohd Rashid",
            "norazila@umt.edu.my",
            "norazila.png",
            "Pensyarah, Pusat Pengajian Pengurusan (FPEPS)");
    private static final Advisor KAMAL = new Advisor(
            "Prof. Dr. Kamal bin Hussin",
            "kamal.hussin@umt.edu.my",
            "kamal-hussin.png",
            "Profesor Madya, Fakulti Pengajian Pendidikan (FPP)");
    private static final Advisor SHARIFAH = new Advisor(
            "Dr. Sharifah binti Mohd Zain",
            "sharifah.zain@umt.edu.my",
            "sharifah-zain.png",
            "Pensyarah Kanan, Fakulti Pengajian Perniagaan, Ekonomi dan Pembangunan Sosial (FPEPS)");
    private static final Advisor RASIDAH = new Advisor(
            "Dr. Rasidah binti Mohd Noor",
            "rasidah.noor@umt.edu.my",
            "rasidah-noor.png",
            "Pensyarah Kanan, Pusat Sukan dan Rekreasi Pelajar UMT");
    private static final Advisor IZZUDDIN = new Advisor(
            "Dr. Muhammad Izzuddin bin Omar",
            "izzuddin.omar@umt.edu.my",
            "izzuddin-omar.png",
            "Pensyarah, Fakulti Sains Komputer dan Matematik (FSKM)");
    private static final Advisor FARIDAH = new Advisor(
            "Dr. Faridah binti Ismail",
            "faridah.ismail@umt.edu.my",
            "faridah-ismail.png",
            "Pensyarah Kanan, Fakulti Sains dan Persekitaran Marin (FSSM)");

    private ClubAdvisorDefaults() {}

    public static Advisor forOrganizerClub(String organizerClub) {
        if (organizerClub == null || organizerClub.isBlank()) {
            return WAN_RUSHDAN;
        }
        String club = organizerClub.toLowerCase();

        if (club.contains("robot")) {
            return AHMAD_FAIZAL;
        }
        if (club.contains("ftkk") || club.contains("kelautan") || club.contains("ocean engineering")) {
            return WAN_RUSHDAN;
        }
        if (club.contains("fskm") || club.contains("computer science") || club.contains("mathematics")) {
            return SITI_AMINAH;
        }
        if (club.contains("fpsm") || club.contains("food science")) {
            return NORHAYATI;
        }
        if (club.contains("e-sport") || club.contains("esport")) {
            return IZZUDDIN;
        }
        if (club.contains("sukan") || club.contains("rekreasi") || club.contains("sport")) {
            return RASIDAH;
        }
        if (club.contains("sukarelawan") || club.contains("volunteer")) {
            return NORAZILA;
        }
        if (club.contains("keusahawanan") || club.contains("entrepreneur")) {
            return SHARIFAH;
        }
        if (club.contains("debat")) {
            return KAMAL;
        }
        if (club.contains("prs") || club.contains("pembimbing")) {
            return NORAZILA;
        }
        if (club.contains("kebudayaan") || club.contains("culture") || club.contains("seni")) {
            return FARIDAH;
        }
        if (club.contains("fssm") || club.contains("marine environment")) {
            return FARIDAH;
        }
        if (club.contains("hepa")) {
            return KAMAL;
        }

        return WAN_RUSHDAN;
    }

    public static String signaturePath(Advisor advisor) {
        return "uploads/" + SIGNATURE_DIR + "/" + advisor.signatureFile();
    }

    public static Advisor[] allDemoAdvisors() {
        return new Advisor[]{
                SITI_AMINAH,
                AHMAD_FAIZAL,
                WAN_RUSHDAN,
                NORHAYATI,
                NORAZILA,
                KAMAL,
                SHARIFAH,
                RASIDAH,
                IZZUDDIN,
                FARIDAH
        };
    }
}
