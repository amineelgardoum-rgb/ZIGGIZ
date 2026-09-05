package com.ziggiz.backend.config;

import com.ziggiz.backend.model.Review;
import com.ziggiz.backend.model.Role;
import com.ziggiz.backend.model.ServiceOption;
import com.ziggiz.backend.model.SurfService;
import com.ziggiz.backend.model.User;
import com.ziggiz.backend.repository.ReviewRepository;
import com.ziggiz.backend.repository.SurfServiceRepository;
import com.ziggiz.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SurfServiceRepository surfServiceRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedServices();
        seedReviews();
    }

    private void seedAdmin() {
        if (userRepository.count() > 0) return;
        userRepository.save(User.builder()
                .fullName("Admin")
                .email("admin@ziggiz.com")
                .password("admin123")
                .role(Role.ADMIN)
                .build());
    }

    private void seedServices() {
        if (surfServiceRepository.count() > 0) return;

        SurfService surfLessons = SurfService.builder()
                .name("Surf Lessons")
                .description("From first paddle-out to green waves")
                .image("/images/surf/surf3.jpeg")
                .build();

        ServiceOption gromCamp = ServiceOption.builder()
                .name("Grom Camp")
                .note("Ages 6–14")
                .service(surfLessons)
                .build();
        ServiceOption adultLessons = ServiceOption.builder()
                .name("Adult Lessons")
                .note("Small groups")
                .service(surfLessons)
                .build();
        ServiceOption privateGuiding = ServiceOption.builder()
                .name("Private Guiding")
                .note("One-on-one")
                .service(surfLessons)
                .build();
        surfLessons.setOptions(List.of(gromCamp, adultLessons, privateGuiding));

        SurfService quadTrips = SurfService.builder()
                .name("Quad Trips")
                .description("Coastal tracks & cliff-top views")
                .image("/images/activities/activitie3.jpg")
                .build();

        ServiceOption sunsetDuneRun = ServiceOption.builder()
                .name("Sunset Dune Run")
                .note("Golden hour")
                .service(quadTrips)
                .build();
        ServiceOption paradiseValley = ServiceOption.builder()
                .name("Paradise Valley Ride")
                .note("Swim stop")
                .service(quadTrips)
                .build();
        quadTrips.setOptions(List.of(sunsetDuneRun, paradiseValley));

        SurfService boatTrips = SurfService.builder()
                .name("Boat Trips")
                .description("Hidden coves & sunsets at sea")
                .image("/images/activities/activitie4.jpg")
                .build();

        ServiceOption sunsetCruise = ServiceOption.builder()
                .name("Sunset Coast Cruise")
                .note("Mint tea on deck")
                .service(boatTrips)
                .build();
        ServiceOption snorkelCoves = ServiceOption.builder()
                .name("Snorkel & Hidden Coves")
                .note("Fresh fish lunch")
                .service(boatTrips)
                .build();
        boatTrips.setOptions(List.of(sunsetCruise, snorkelCoves));

        SurfService surfHostel = SurfService.builder()
                .name("Surf Hostel")
                .description("Beds steps from the break")
                .image("/images/hostels/hostle1.jpg")
                .build();

        ServiceOption sharedDorm = ServiceOption.builder()
                .name("Shared Dorm")
                .note("Meet the crew")
                .service(surfHostel)
                .build();
        ServiceOption privateRoom = ServiceOption.builder()
                .name("Private Room")
                .note("Ocean view")
                .service(surfHostel)
                .build();
        ServiceOption surfStayPack = ServiceOption.builder()
                .name("Surf & Stay Pack")
                .note("Bed + lessons")
                .service(surfHostel)
                .build();
        surfHostel.setOptions(List.of(sharedDorm, privateRoom, surfStayPack));

        surfServiceRepository.saveAll(List.of(surfLessons, quadTrips, boatTrips, surfHostel));
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
                .build());

        reviewRepository.save(Review.builder()
                .quote("The quad trip at sunset was insane — dunes, ocean views, and the best mint tea I've ever tasted.")
                .user(ahmed)
                .authorRole("Adventure Photographer")
                .rating(5)
                .build());

        reviewRepository.save(Review.builder()
                .quote("Stayed in the hostel for a week and left with friends for life. The crew makes it feel like home.")
                .user(luca)
                .authorRole("Digital Nomad")
                .rating(5)
                .build());
    }
}
