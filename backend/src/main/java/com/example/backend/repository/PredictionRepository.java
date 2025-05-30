package com.example.backend.repository;

import com.example.backend.model.Prediction;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByUser(User user);
    List<Prediction> findByUserOrderByTimestampDesc(User user);
} 