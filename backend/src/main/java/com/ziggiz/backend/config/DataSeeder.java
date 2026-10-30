package com.ziggiz.backend.config;

import com.ziggiz.backend.model.Review;
import com.ziggiz.backend.model.Role;
import com.ziggiz.backend.model.ServiceOption;
import com.ziggiz.backend.model.SurfService;
import com.ziggiz.backend.model.User;
import com.ziggiz.backend.repository.ReviewRepository;
import com.ziggiz.backend.repository.ServiceOptionRepository;
import com.ziggiz.backend.repository.SurfServiceRepository;
import com.ziggiz.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SurfServiceRepository surfServiceRepository;
    private final ServiceOptionRepository serviceOptionRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedServices();
        seedReviews();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@ziggiz.com")) return;
        userRepository.save(User.builder()
                .fullName("Admin")
                .email("admin@ziggiz.com")
                .password("admin123")
                .role(Role.ADMIN)
                .build());
    }

    /**
     * Idempotent upsert by service/option name. This lets an already-running
     * database pick up newly added services without touching existing rows:
     * a service is created only when its name is missing, and an option only
     * when it is missing for that service. Prices and notes are never
     * overwritten.
     */
    private void seedServices() {
        // Prices come from the docs image: 1 EUR is listed alongside the MAD
        // price, so we charge the MAD value. Surf lessons and hostel stays are
        // "contact us for rates" on that sheet, therefore their options stay
        // null (price on request) until real rates are confirmed.
        //
        // Existing options intentionally keep empty departure slots so the
        // current frontend defaults continue to work. Only the new excursion
        // options below carry explicit slots.
        List<ServiceSeed> seeds = List.of(
                new ServiceSeed("Surf Lessons", true,
                        "From first paddle-out to green waves", "/images/surf/surf3.jpeg",
                        List.of(
                                new OptionSeed("Grom Camp", null, "Ages 6–14", null),
                                new OptionSeed("Adult Lessons", null, "Small groups", null),
                                new OptionSeed("Private Guiding", null, "One-on-one", null))),

                new ServiceSeed("Quad Trips", true,
                        "Coastal tracks & cliff-top views", "/images/activities/activitie3.jpg",
                        List.of(
                                // Docs: Quad 75 EUR / 900-1000 DH for two people -> 450 DH per person.
                                new OptionSeed("Sunset Dune Run", "450.00", "Golden hour", null),
                                // Docs: Paradise Valley excursion 40 EUR / 500 DH per person.
                                new OptionSeed("Paradise Valley Ride", "500.00", "Swim stop", null))),

                new ServiceSeed("Boat Trips", true,
                        "Hidden coves & sunsets at sea", "/images/activities/activitie4.jpg",
                        List.of(
                                // Docs: Boat trip 50 EUR / 600 DH per person.
                                new OptionSeed("Sunset Coast Cruise", "600.00", "Mint tea on deck", null),
                                new OptionSeed("Snorkel & Hidden Coves", "600.00", "Fresh fish lunch", null))),

                new ServiceSeed("Surf Hostel", false,
                        "Beds steps from the break", "/images/hostels/hostle1.jpg",
                        List.of(
                                new OptionSeed("Shared Dorm", null, "Meet the crew", null),
                                new OptionSeed("Private Room", null, "Ocean view", null),
                                new OptionSeed("Surf & Stay Pack", null, "Bed + lessons", null))),

                // Client rate sheet: day trips from Agadir, prices per person.
                // Crocoparc only lists a 2-hour duration, so two sensible start
                // slots were chosen; camel riding says "every hour", narrowed to
                // the four daytime slots below; Buggy & Quad is listed at
                // 900-1000 DH for two people (75 EUR quad), priced at 450 MAD
                // per person to stay consistent with the Quad Trips option.
                new ServiceSeed("Excursions", true,
                        "Door-to-door day trips from Agadir", "/images/activities/activitie1.jpeg",
                        List.of(
                                new OptionSeed("Agadir Tour", "300.00", "Kasbah, harbour, souk, marina", "10:00,15:00"),
                                new OptionSeed("Paradise Valley", "500.00", "Half-day oasis & villages", "09:10"),
                                new OptionSeed("Crocoparc", "400.00", "Crocodiles & botanical gardens", "10:00,14:00"),
                                new OptionSeed("Mini Sahara 4×4", "600.00", "Dunes, lunch & wild beach", "08:00"),
                                new OptionSeed("Boat Trip", "600.00", "Fishing, lunch & music", "09:00"),
                                new OptionSeed("Sunset Barbecue", "600.00", "Camel ride & dinner in the tent", "16:30"),
                                new OptionSeed("Marrakech Day Trip", "600.00", "Jamaa Lfena, medina & gardens", "07:00"),
                                new OptionSeed("Hot Air Ballooning", "2500.00", "Sunrise flight & Berber tent breakfast", "04:15"),
                                new OptionSeed("Essaouira", "500.00", "Old medina & harbour (Mon/Wed/Fri)", "08:15"),
                                new OptionSeed("Camel Riding", "400.00", "Two hours with souvenir photos", "10:00,12:00,14:00,16:00"),
                                new OptionSeed("Buggy & Quad", "450.00", "Half day, drinks & photos (2 per buggy)", "09:00,14:00"),
                                new OptionSeed("Goats on the Argan Tree", "450.00", "Argan villages & photo stop", "08:30"),
                                new OptionSeed("Taroudant-Tiout", "600.00", "Ancient city, souk & oasis (Tue–Thu)", "08:00"))),

                // Retreat packages: the sheet says "contact us for rates", so
                // prices stay null (price on request) and no session time is
                // needed.
                new ServiceSeed("Surf Retreats", false,
                        "3 / 7 / 10-day all-inclusive surf retreats", "/images/surf/surf1.jpeg",
                        List.of(
                                new OptionSeed("3-Day Blissful Retreat", null,
                                        "Daily lessons, meals, stay & surf transfers — per person; Bonus 1-day trip", null),
                                new OptionSeed("7-Day Blissful Retreat", null,
                                        "Daily lessons, meals, stay & surf transfers — per person; Bonus 1-day trip", null),
                                new OptionSeed("10-Day Blissful Retreat", null,
                                        "Daily lessons, meals, stay & surf transfers — per person; Bonus 2-day trip", null)))
        );

        for (ServiceSeed seed : seeds) {
            SurfService service = surfServiceRepository.findByName(seed.name())
                    .orElseGet(() -> surfServiceRepository.save(SurfService.builder()
                            .name(seed.name())
                            .requiresTime(seed.requiresTime())
                            .description(seed.description())
                            .image(seed.image())
                            .build()));

            for (OptionSeed optionSeed : seed.options()) {
                if (serviceOptionRepository.findByServiceIdAndName(service.getId(), optionSeed.name()).isPresent()) {
                    continue;
                }
                serviceOptionRepository.save(ServiceOption.builder()
                        .name(optionSeed.name())
                        .note(optionSeed.note())
                        .priceMad(optionSeed.priceMad() != null ? new BigDecimal(optionSeed.priceMad()) : null)
                        .departureTimes(optionSeed.times())
                        .service(service)
                        .build());
            }
        }
    }

    private record ServiceSeed(String name, boolean requiresTime, String description, String image,
                               List<OptionSeed> options) {
    }

    private record OptionSeed(String name, String priceMad, String note, String times) {
    }

    private void seedReviews() {
        if (reviewRepository.count() > 0) return;

        User sarah = userRepository.save(User.builder()
                .fullName("Sarah M.")
                .email("sarah@example.com")
                .password("password")
                .build());

        User ahmed = userRepository.save(User.builder()
                .fullName("Ahmed K.")
                .email("ahmed@example.com")
                .password("password")
                .build());

        User luca = userRepository.save(User.builder()
                .fullName("Luca P.")
                .email("luca@example.com")
                .password("password")
                .build());

        reviewRepository.save(Review.builder()
                .quote("Best surf experience I've ever had. The coaches were patient, the waves were perfect, and the vibe was unreal.")
                .user(sarah)
                .authorRole("Travel Blogger")
                .rating(5)
                .displayed(true)
                .build());

        reviewRepository.save(Review.builder()
                .quote("The quad trip at sunset was insane — dunes, ocean views, and the best mint tea I've ever tasted.")
                .user(ahmed)
                .authorRole("Adventure Photographer")
                .rating(5)
                .displayed(true)
                .build());

        reviewRepository.save(Review.builder()
                .quote("Stayed in the hostel for a week and left with friends for life. The crew makes it feel like home.")
                .user(luca)
                .authorRole("Digital Nomad")
                .rating(5)
                .displayed(true)
                .build());
    }
}
