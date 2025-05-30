package com.example.backend.dto;

public class PredictionRequest {
    private int digit;
    private double confidence;
    private String result; // "success" or "fail"
    // getters and setters
    public int getDigit() { return digit; }
    public void setDigit(int digit) { this.digit = digit; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
} 