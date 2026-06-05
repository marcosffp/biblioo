package com.biblioo.share.domain.port.in;

import com.biblioo.share.domain.model.GoodreadsImportResult;
import java.io.InputStream;

public interface GoodreadsImportUseCase {
  GoodreadsImportResult importCsv(Long userId, InputStream csvStream, String originalFilename);
}
