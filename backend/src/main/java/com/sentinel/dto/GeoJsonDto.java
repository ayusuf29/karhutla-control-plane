package com.sentinel.dto;

import java.util.List;
import java.util.Map;

public class GeoJsonDto {

    private String type = "FeatureCollection";
    private List<Feature> features;
    private Map<String, Object> metadata;

    public GeoJsonDto() {}

    public GeoJsonDto(List<Feature> features, Map<String, Object> metadata) {
        this.type = "FeatureCollection";
        this.features = features;
        this.metadata = metadata;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public List<Feature> getFeatures() { return features; }
    public void setFeatures(List<Feature> features) { this.features = features; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public static class Feature {
        private String type = "Feature";
        private String id;
        private Geometry geometry;
        private Map<String, Object> properties;

        public Feature() {}

        public Feature(String id, Geometry geometry, Map<String, Object> properties) {
            this.type = "Feature";
            this.id = id;
            this.geometry = geometry;
            this.properties = properties;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public Geometry getGeometry() { return geometry; }
        public void setGeometry(Geometry geometry) { this.geometry = geometry; }

        public Map<String, Object> getProperties() { return properties; }
        public void setProperties(Map<String, Object> properties) { this.properties = properties; }
    }

    public static class Geometry {
        private String type; // "Polygon" or "Point"
        private Object coordinates; // List<List<List<Double>>> or List<Double>

        public Geometry() {}

        public Geometry(String type, Object coordinates) {
            this.type = type;
            this.coordinates = coordinates;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public Object getCoordinates() { return coordinates; }
        public void setCoordinates(Object coordinates) { this.coordinates = coordinates; }
    }
}
