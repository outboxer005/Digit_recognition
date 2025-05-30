package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int digit;
    private Double confidence;
    private String result;
    private LocalDateTime timestamp;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getDigit() { return digit; }
    public void setDigit(int digit) { this.digit = digit; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
} 