# MagdaRecords1# MagdaRecords - HIPAA-Compliant Medical Records App

## Overview
MagdaRecords is a personal medical records application with AI integration and multi-account support, built with React Native and Expo. The app allows users to store, manage, and analyze health records securely.

## Features
- **Secure Authentication**: Login via Google, Apple, email, and biometric authentication
- **Record Management**: Upload, organize, and search through medical records
- **AI Analysis**: Analyze medications, extract text from documents, generate health recommendations
- **Multi-Account Support**: Manage health records for family members
- **Provider Management**: Track healthcare provider information

## Running the App with Expo Go

1. **Install Expo Go** on your iOS or Android device
   - [iOS App Store](https://apps.apple.com/app/apple-store/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Set up the development environment**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Connect to the app**:
   - Scan the QR code with your device's camera (iOS) or Expo Go app (Android)
   - Or, press 'a' to open on Android emulator or 'i' for iOS simulator

## API Key Setup

The app's AI features require an OpenAI API key. You can add it in Settings.

## Troubleshooting

If you encounter any issues:
1. Make sure all dependencies are installed
2. Clear the Expo Go cache
3. Restart the Expo development server
4. Ensure you have an internet connection

## Demo Accounts

- You can create your own account 
- Or use the demo account: test@example.com / password123 (not for real patient data)

## Security Note

This app is designed with privacy in mind, but please ensure you follow all applicable regulations when storing real medical information.