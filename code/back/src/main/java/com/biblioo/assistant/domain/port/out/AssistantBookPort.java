package com.biblioo.assistant.domain.port.out;

import com.biblioo.assistant.domain.model.BookResult;
import java.util.List;

public interface AssistantBookPort {

  List<BookResult> search(String query, int limit);
}
