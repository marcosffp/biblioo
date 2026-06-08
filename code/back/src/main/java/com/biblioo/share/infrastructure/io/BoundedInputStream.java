package com.biblioo.share.infrastructure.io;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Wraps an InputStream and tracks how many bytes have been read. If the accumulated byte count
 * exceeds {@code maxBytes}, it stops reading (returns -1) and marks an overflow flag. This prevents
 * OOM attacks where a carefully crafted text file expands to an arbitrarily large stream.
 */
public class BoundedInputStream extends FilterInputStream {

  private final long maxBytes;
  private long totalRead = 0;
  private boolean overflow = false;

  public BoundedInputStream(InputStream in, long maxBytes) {
    super(in);
    this.maxBytes = maxBytes;
  }

  @Override
  public int read() throws IOException {
    if (overflow) return -1;
    int b = super.read();
    if (b != -1 && ++totalRead > maxBytes) {
      overflow = true;
      return -1;
    }
    return b;
  }

  @Override
  public int read(byte[] buf, int off, int len) throws IOException {
    if (overflow) return -1;
    long remaining = maxBytes - totalRead;
    if (remaining <= 0) {
      overflow = true;
      return -1;
    }
    int toRead = (int) Math.min(len, remaining + 1);
    int n = super.read(buf, off, toRead);
    if (n > 0) {
      totalRead += n;
      if (totalRead > maxBytes) {
        overflow = true;
      }
    }
    return n;
  }

  public boolean overflowed() {
    return overflow;
  }
}
