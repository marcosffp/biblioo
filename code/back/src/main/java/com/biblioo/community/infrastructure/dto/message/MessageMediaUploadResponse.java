package com.biblioo.community.infrastructure.dto.message;

import java.util.List;

public record MessageMediaUploadResponse(List<String> images, String gifUrl) {}
