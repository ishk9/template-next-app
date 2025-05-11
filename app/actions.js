"use server";

// This is a mock server action that would normally connect to your backend API
export async function processFeatures({ features, options }) {
  // Simulate network request
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Calculate a mock prediction based on the features
  const sum = features.reduce((acc, val) => acc + val, 0);
  const avg = sum / features.length;

  // Generate mock feature importance
  const featureImportance = features
    .map((val, idx) => ({
      feature: idx + 1,
      importance: Math.abs(val) / (Math.abs(sum) || 1),
    }))
    .sort((a, b) => b.importance - a.importance);

  // Mock prediction
  const threshold = options?.threshold || 0.5;
  const isPositive = avg > threshold - 0.5;

  // Mock response data
  return {
    prediction: {
      label: isPositive ? "Positive" : "Negative",
      confidence: Math.min(Math.abs(avg) + 0.3, 0.99),
    },
    analysis: {
      featureImportance: featureImportance,
      summary: `The model analyzed ${features.length} features and determined a ${isPositive ? "positive" : "negative"} prediction with ${(Math.min(Math.abs(avg) + 0.3, 0.99) * 100).toFixed(1)}% confidence.`,
    },
    metadata: {
      processingTime: Math.floor(Math.random() * 100) + 50,
      model: "FeatureClassifier-v1.2",
      timestamp: new Date().toISOString(),
    },
    rawOutput: {
      features: features,
      normalizedFeatures: features.map((f) => f / (Math.max(...features.map(Math.abs)) || 1)),
      logits: [Math.random() - 0.5, Math.random() - 0.5],
      threshold: threshold,
    },
  };
}

export async function processImage({ image, options }) {
  // Simulate network request
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock feature extraction from image
  const mockFeatures = Array.from({ length: 8 }, () => Math.random() * 2 - 1);

  // Use the same processing logic as for manual features
  return processFeatures({
    features: mockFeatures,
    options,
  });
}
