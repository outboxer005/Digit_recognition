package com.example.backend.controller;

import com.example.backend.dto.PredictionRequest;
import com.example.backend.model.Prediction;
import com.example.backend.model.User;
import com.example.backend.repository.PredictionRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/user")
public class PredictionController {
    @Autowired
    private PredictionRepository predictionRepository;
    @Autowired
    private UserRepository userRepository;
    @PostMapping("/predictions")
    public ResponseEntity<?> logPrediction(@RequestBody PredictionRequest req, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");
        Prediction prediction = new Prediction();
        prediction.setUser(user);
        prediction.setDigit(req.getDigit());
        prediction.setConfidence(req.getConfidence());
        prediction.setResult(req.getResult());
        prediction.setTimestamp(LocalDateTime.now());
        predictionRepository.save(prediction);
        return ResponseEntity.ok("Prediction logged");
    }
    @GetMapping("/history")
    public List<Prediction> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) return List.of();
        return predictionRepository.findByUserOrderByTimestampDesc(user);
    }
} 