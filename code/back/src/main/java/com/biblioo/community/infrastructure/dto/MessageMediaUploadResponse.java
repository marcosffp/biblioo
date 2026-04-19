package com.biblioo.community.infrastructure.dto;

import java.util.List;

public record MessageMediaUploadResponse(List<String> images, String gifUrl) {}
