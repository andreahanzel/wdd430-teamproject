// Simple feature flag system

const FEATURES = {
	USE_DATABASE: process.env.USE_DATABASE !== "false", // Default to true unless explicitly set to 'false'
	FALLBACK_TO_JSON: true, // Whether to fallback to JSON data when database fails
};

export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
	return FEATURES[feature];
}
