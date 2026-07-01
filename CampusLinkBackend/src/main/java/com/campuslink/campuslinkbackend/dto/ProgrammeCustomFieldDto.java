package com.campuslink.campuslinkbackend.dto;

public class ProgrammeCustomFieldDto {
    private String id;
    private String label;
    private boolean required;
    private String fieldType = "TEXT";

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }
    public String getFieldType() { return fieldType; }
    public void setFieldType(String fieldType) { this.fieldType = fieldType; }
}
