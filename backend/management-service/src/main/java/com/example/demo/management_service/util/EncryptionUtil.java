package com.example.demo.management_service.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility class for encrypting and decrypting sensitive data using AES-256-GCM.
 * Provides secure encryption for credentials and other sensitive information.
 */
@Component
public class EncryptionUtil {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128; // bits
    private static final int GCM_IV_LENGTH = 12; // bytes

    private final SecretKey secretKey;
    private final SecureRandom secureRandom;

    /**
     * Constructs EncryptionUtil with encryption key from properties.
     *
     * @param encryptionKey Base64 encoded 256-bit AES key from application properties
     */
    public EncryptionUtil(@Value("${encryption.key}") String encryptionKey) {
        byte[] decodedKey = Base64.getDecoder().decode(encryptionKey);
        this.secretKey = new SecretKeySpec(decodedKey, "AES");
        this.secureRandom = new SecureRandom();
    }

    /**
     * Encrypts the given plaintext using AES-256-GCM.
     * Each encryption uses a randomly generated IV for security.
     *
     * @param plaintext the text to encrypt
     * @return Base64 encoded encrypted data (IV + ciphertext)
     * @throws RuntimeException if encryption fails
     */
    public String encrypt(String plaintext) {
        try {
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            // Initialize cipher
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmParameterSpec);

            // Encrypt
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes());

            // Combine IV and ciphertext
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            byteBuffer.put(iv);
            byteBuffer.put(ciphertext);

            // Return Base64 encoded result
            return Base64.getEncoder().encodeToString(byteBuffer.array());

        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypts the given encrypted data using AES-256-GCM.
     *
     * @param encryptedData Base64 encoded encrypted data (IV + ciphertext)
     * @return the decrypted plaintext
     * @throws RuntimeException if decryption fails
     */
    public String decrypt(String encryptedData) {
        try {
            // Decode Base64
            byte[] decodedData = Base64.getDecoder().decode(encryptedData);

            // Extract IV and ciphertext
            ByteBuffer byteBuffer = ByteBuffer.wrap(decodedData);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);
            byte[] ciphertext = new byte[byteBuffer.remaining()];
            byteBuffer.get(ciphertext);

            // Initialize cipher
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmParameterSpec);

            // Decrypt
            byte[] plaintext = cipher.doFinal(ciphertext);

            return new String(plaintext);

        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }
}
