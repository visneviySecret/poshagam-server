import fs from "fs";
import https from "https";

export interface SSLConfig {
  enabled: boolean;
  httpsPort: number;
  httpPort: number;
  keyPath?: string;
  certPath?: string;
}

export const getSSLConfig = (): SSLConfig => {
  return {
    enabled: process.env.USE_HTTPS === "true",
    httpsPort: parseInt(process.env.HTTPS_PORT || "443"),
    httpPort: parseInt(process.env.HTTP_PORT || "80"),
    keyPath: process.env.SSL_KEY_PATH,
    certPath: process.env.SSL_CERT_PATH,
  };
};

export const validateSSLConfig = (config: SSLConfig): void => {
  if (!config.enabled) {
    return;
  }

  if (!config.keyPath || !config.certPath) {
    throw new Error(
      "SSL_KEY_PATH and SSL_CERT_PATH must be set when USE_HTTPS is true"
    );
  }

  if (!fs.existsSync(config.keyPath)) {
    throw new Error(`SSL key file not found: ${config.keyPath}`);
  }

  if (!fs.existsSync(config.certPath)) {
    throw new Error(`SSL certificate file not found: ${config.certPath}`);
  }
};

export const getHTTPSOptions = (
  config: SSLConfig
): https.ServerOptions | null => {
  if (!config.enabled || !config.keyPath || !config.certPath) {
    return null;
  }

  return {
    key: fs.readFileSync(config.keyPath),
    cert: fs.readFileSync(config.certPath),
  };
};
