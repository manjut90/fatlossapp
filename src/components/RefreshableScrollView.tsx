import React, { useState } from 'react';
import { ScrollView, RefreshControl, ScrollViewProps } from 'react-native';

interface RefreshableScrollViewProps extends ScrollViewProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

export default function RefreshableScrollView({
  onRefresh,
  children,
  ...props
}: RefreshableScrollViewProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    console.log("Refresh triggered");
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (e) {
      console.error('[RefreshableScrollView] Refresh failed:', e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      {...props}
      style={[{ flex: 1 }, props.style]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#8B7CFF" // LFGO brand Electric Lavender (highly visible against #0F1021)
          colors={['#8B7CFF']}
          progressBackgroundColor="#1E1D33" // Contrasting dark card background for Android spinner
        />
      }
    >
      {children}
    </ScrollView>
  );
}
