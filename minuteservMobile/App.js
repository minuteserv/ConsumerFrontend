import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const WEBSITE_URL = 'https://minuteserv.com/';

export default function App() {
  const [error, setError] = useState(null);
  const webViewRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // Reload WebView when app comes to foreground to get latest content
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, reload to get latest content
        if (webViewRef.current) {
          webViewRef.current.reload();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setError('Failed to load the website. Please check your internet connection.');
  };

  // Handle permission requests (for location, camera, etc.)
  const handlePermissionRequest = (request) => {
    const { nativeEvent } = request;
    console.log('Permission requested:', nativeEvent);
    
    // Grant location permissions automatically
    if (nativeEvent.permission === 'geolocation') {
      nativeEvent.requestCallback(true);
    } else {
      // For other permissions, deny by default (can be customized)
      nativeEvent.requestCallback(false);
    }
  };

  // Add timestamp to URL to prevent aggressive caching
  const getWebsiteUrl = () => {
    // Add a daily timestamp to force fresh content check
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `${WEBSITE_URL}?app_version=${today}`;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>Please try again later</Text>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{
              uri: getWebsiteUrl(),
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
              },
            }}
            style={styles.webview}
            onError={handleError}
            onPermissionRequest={handlePermissionRequest}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
            allowsBackForwardNavigationGestures={true}
            sharedCookiesEnabled={true}
            cacheEnabled={false}
            cacheMode="LOAD_NO_CACHE"
            geolocationEnabled={true}
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
