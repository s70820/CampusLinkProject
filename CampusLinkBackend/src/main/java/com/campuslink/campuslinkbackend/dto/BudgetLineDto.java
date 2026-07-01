package com.campuslink.campuslinkbackend.dto;

import java.math.BigDecimal;

public class BudgetLineDto {

    private String lineType;
    private String category;
    private BigDecimal amount;
    private Integer sortOrder;

    public String getLineType() { return lineType; }
    public void setLineType(String lineType) { this.lineType = lineType; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
