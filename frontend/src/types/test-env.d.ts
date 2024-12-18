declare global {
  var TextEncoder: {
    new (): TextEncoder;
    prototype: TextEncoder;
  };
  var TextDecoder: {
    new (label?: string, options?: TextDecoderOptions): TextDecoder;
    prototype: TextDecoder;
  };
}

export {};
