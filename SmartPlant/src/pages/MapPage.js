import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, Text, View, TouchableOpacity, ScrollView, Image, Dimensions, Animated, PanResponder, Alert, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from "react-native-maps";
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import mapStyle from "../../assets/mapStyle.json";
import { db } from '../firebase/FirebaseConfig';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const MapPage = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState(null); // 默认不选择任何tab
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);
  const bottomSheetHeight = useRef(new Animated.Value(180)).current;
  const currentHeightRef = useRef(180);

  const KUCHING_REGION = {
    latitude: 1.5495,
    longitude: 110.3632,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // 计算两点之间的距离（公里）
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // 根据距离排序植物
  const getSortedMarkersByDistance = (markersList) => {
    if (!userLocation) return markersList;
    
    return markersList
      .map(marker => ({
        ...marker,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          marker.coordinate.latitude,
          marker.coordinate.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  // 获取最近的植物（用于底部面板）
  const getNearestMarkers = (markersList, count = 3) => {
    const sorted = getSortedMarkersByDistance(markersList);
    return sorted.slice(0, count);
  };

  // 处理tab点击
  const handleTabPress = (tab) => {
    if (selectedTab === tab) {
      // 如果点击的是已选中的tab，取消选择
      setSelectedTab(null);
      console.log(`🔘 取消选择 ${tab}，显示所有植物`);
    } else {
      // 否则选择新的tab
      setSelectedTab(tab);
      console.log(`🔘 选择tab: ${tab}`);
    }
  };

  // 简化时间格式化函数
  const formatTime = (timeData) => {
    if (!timeData) return 'Unknown time';
    
    try {
      if (timeData.seconds && timeData.nanoseconds) {
        const date = new Date(timeData.seconds * 1000);
        const now = new Date();
        const diffInMs = now - date;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return date.toLocaleDateString();
      }
      
      if (typeof timeData === 'string') {
        return timeData;
      }
      
      return 'Unknown time';
    } catch (error) {
      return 'Unknown time';
    }
  };

  // 修复数据格式函数
  const fixMarkerData = (doc) => {
    const data = doc.data();
    
    let latitude, longitude;
    
    if (data.coordinate) {
      latitude = typeof data.coordinate.latitude === 'string' 
        ? parseFloat(data.coordinate.latitude) 
        : data.coordinate.latitude;
      
      longitude = typeof data.coordinate.longitude === 'string'
        ? parseFloat(data.coordinate.longitude)
        : data.coordinate.longitude;
    } else {
      latitude = 1.5495;
      longitude = 110.3632;
    }
    
    let imageUrl = data.image;
    if (imageUrl && imageUrl.startsWith('gs://')) {
      const fileName = imageUrl.replace('gs://smartplantsarawak.firebasestorage.app/', '');
      imageUrl = `https://firebasestorage.googleapis.com/v0/b/smartplantsarawak.appspot.com/o/${encodeURIComponent(fileName)}?alt=media`;
    }
    
    const fixedMarker = {
      id: doc.id,
      title: data.title || 'Unknown Plant',
      type: data.type || 'Plant',
      coordinate: {
        latitude: latitude || 1.5495,
        longitude: longitude || 110.3632
      },
      identifiedBy: data.identifiedBy || 'Unknown',
      time: formatTime(data.time),
      image: imageUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
      description: data.description || 'No description available'
    };
    
    return fixedMarker;
  };

  // 从Firebase获取markers数据
  const fetchMarkers = async () => {
    try {
      setLoading(true);

      const markersCollection = collection(db, 'markers');
      const markerSnapshot = await getDocs(markersCollection);
      
      const markersList = markerSnapshot.docs.map(doc => fixMarkerData(doc));
      
      setMarkers(markersList);
      
    } catch (error) {
      console.error('❌ 获取markers错误:', error);
      Alert.alert('错误', `无法加载植物数据: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 设置实时监听
  const setupRealtimeListener = () => {
    try {
      const markersCollection = collection(db, 'markers');
      const unsubscribe = onSnapshot(markersCollection, (snapshot) => {
        const markersList = snapshot.docs.map(doc => fixMarkerData(doc));
        
        setMarkers(markersList);
        
      }, (error) => {
        console.error('❌ 实时监听错误:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ 设置实时监听错误:', error);
      return () => {};
    }
  };

  useEffect(() => {
    // 获取初始数据
    fetchMarkers();
    
    // 设置实时监听
    const unsubscribe = setupRealtimeListener();
    
    // 请求定位权限
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        
        setHasLocationPermission(true);
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      } catch (error) {
        console.log('📍 获取位置错误:', error);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 根据tab过滤markers - 地图显示所有或筛选后的植物
  const filteredMarkersForMap = selectedTab 
    ? markers.filter(marker => marker.type === selectedTab)
    : markers;

  // 底部面板显示的植物 - 总是显示距离最近的3个
  const markersForBottomSheet = selectedTab 
    ? getNearestMarkers(markers.filter(marker => marker.type === selectedTab), 3)
    : getNearestMarkers(markers, 3);

  // 其余函数保持不变...
  const createPanResponder = () => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const minHeight = selectedMarker ? 200 : 100;
        const maxHeight = selectedMarker ? height * 0.7 : 280;
        
        const newHeight = Math.max(minHeight, Math.min(maxHeight, currentHeightRef.current - gestureState.dy));
        bottomSheetHeight.setValue(newHeight);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentHeightValue = bottomSheetHeight._value;
        currentHeightRef.current = currentHeightValue;
        
        if (gestureState.dy > 20) {
          if (selectedMarker) {
            Animated.spring(bottomSheetHeight, {
              toValue: 200,
              useNativeDriver: false,
            }).start(() => {
              currentHeightRef.current = 200;
            });
          } else {
            Animated.spring(bottomSheetHeight, {
              toValue: 100,
              useNativeDriver: false,
            }).start(() => {
              currentHeightRef.current = 100;
            });
          }
        } else if (gestureState.dy < -20) {
          if (selectedMarker) {
            Animated.spring(bottomSheetHeight, {
              toValue: height * 0.6,
              useNativeDriver: false,
            }).start(() => {
              currentHeightRef.current = height * 0.6;
            });
          } else {
            Animated.spring(bottomSheetHeight, {
              toValue: 280,
              useNativeDriver: false,
            }).start(() => {
              currentHeightRef.current = 280;
            });
          }
        } else {
          Animated.spring(bottomSheetHeight, {
            toValue: currentHeightValue,
            useNativeDriver: false,
          }).start();
        }
      }
    });
  };

  const [panResponder, setPanResponder] = useState(() => createPanResponder());

  useEffect(() => {
    setPanResponder(createPanResponder());
  }, [selectedMarker]);

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    Animated.spring(bottomSheetHeight, {
      toValue: 300,
      useNativeDriver: false,
    }).start(() => {
      currentHeightRef.current = 300;
    });
    
    mapRef.current.animateToRegion({
      latitude: marker.coordinate.latitude,
      longitude: marker.coordinate.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const focusOnUserLocation = () => {
    if (userLocation) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const closeMarkerDetail = () => {
    setSelectedMarker(null);
    Animated.spring(bottomSheetHeight, {
      toValue: 180,
      useNativeDriver: false,
    }).start(() => {
      currentHeightRef.current = 180;
    });
  };

  const renderBottomSheet = () => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(42);
    const [showMenu, setShowMenu] = useState(false);

    const handleLike = () => {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleMenuPress = () => {
      setShowMenu(!showMenu);
    };

    const handleMenuAction = (action) => {
      setShowMenu(false);
      switch(action) {
        case 'more':
          Alert.alert('More Details', 'Showing more details...');
          break;
        case 'report':
          Alert.alert('Report', 'Reporting this plant...');
          break;
        case 'save':
          Alert.alert('Saved', 'Plant saved to your collection!');
          break;
      }
    };

    return (
      <Animated.View 
        style={[styles.bottomSheet, { height: bottomSheetHeight }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.bottomSheetHandle} />
        
        <View style={styles.bottomSheetContent}>
          {selectedMarker ? (
            <ScrollView 
              style={styles.detailScrollView}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.markerDetail}>
                <Text style={styles.markerDetailTitle}>{selectedMarker.title}</Text>
                
                <View style={styles.identifiedBy}>
                  <Text style={styles.identifiedText}>Identified by {selectedMarker.identifiedBy}</Text>
                  <Text style={styles.timeText}>{selectedMarker.time}</Text>
                </View>
                
                <Image 
                  source={{ uri: selectedMarker.image }} 
                  style={styles.markerImage}
                  resizeMode="cover"
                />
                
                <Text style={styles.descriptionText}>
                  {selectedMarker.description}
                </Text>
                
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.likeButton}
                    onPress={handleLike}
                  >
                    <Ionicons 
                      name={isLiked ? "heart" : "heart-outline"} 
                      size={24} 
                      color={isLiked ? "#FF3B30" : "#666"} 
                    />
                    <Text style={styles.likeCount}>{likeCount}</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.menuContainer}>
                    <TouchableOpacity 
                      style={styles.menuButton}
                      onPress={handleMenuPress}
                    >
                      <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                    </TouchableOpacity>
                    
                    {showMenu && (
                      <View style={styles.menuOverlay}>
                        <TouchableOpacity 
                          style={styles.menuItem}
                          onPress={() => handleMenuAction('more')}
                        >
                          <Ionicons name="information-circle" size={18} color="#666" />
                          <Text style={styles.menuText}>More details</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.menuItem}
                          onPress={() => handleMenuAction('report')}
                        >
                          <Ionicons name="flag" size={18} color="#666" />
                          <Text style={styles.menuText}>Report</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.menuItem}
                          onPress={() => handleMenuAction('save')}
                        >
                          <Ionicons name="bookmark" size={18} color="#666" />
                          <Text style={styles.menuText}>Saved</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={closeMarkerDetail}
                >
                  <Ionicons name="close" size={15} color="white" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {selectedTab ? `${selectedTab}s nearby` : 'Latest in the area'}
              </Text>
              {loading ? (
                <Text style={styles.loadingText}>Loading plants...</Text>
              ) : markersForBottomSheet.length === 0 ? (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>
                    {selectedTab ? `No ${selectedTab.toLowerCase()}s nearby` : 'No plants nearby'}
                  </Text>
                  <Text style={styles.noDataSubtext}>
                    {selectedTab ? 'Try exploring other areas' : 'Move around to discover plants'}
                  </Text>
                </View>
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.latestContainer}
                >
                  {markersForBottomSheet.map((marker, index) => (
                    <TouchableOpacity 
                      key={marker.id} 
                      style={styles.latestItem}
                      onPress={() => handleMarkerPress(marker)}
                    >
                      <Image 
                        source={{ uri: marker.image }} 
                        style={styles.latestImage}
                      />
                      <View style={styles.latestTextContainer}>
                        <Text style={styles.latestTitle}>{marker.title}</Text>
                        <Text style={styles.latestInfo}>
                          {marker.distance ? `${marker.distance.toFixed(1)} km away` : 'Calculating distance...'}
                        </Text>
                        <Text style={styles.latestSubInfo}>
                          Identified by {marker.identifiedBy} • {marker.time}
                        </Text>
                      </View>
                      {index === 0 && (
                        <View style={styles.closestBadge}>
                          <Text style={styles.closestBadgeText}>Closest</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => navigation.navigate('HomepageUser')}
          >
            <Ionicons name="home" size={24} color="#4285F4" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.locationButton} onPress={focusOnUserLocation}>
            <Ionicons name="locate" size={24} color="#4285F4" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={KUCHING_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        customMapStyle={mapStyle}
      >
        {/* 地图显示所有或筛选后的植物 */}
        {filteredMarkersForMap.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => handleMarkerPress(marker)}
          >
            <View style={[
              styles.marker, 
              marker.type === 'Flower' ? styles.flowerMarker : styles.plantMarker
            ]}>
              <Text style={styles.markerText}>{marker.title}</Text>
            </View>
          </Marker>
        ))}
        
        {userLocation && (
          <Circle
            center={userLocation}
            radius={500}
            fillColor="rgba(66, 133, 244, 0.2)"
            strokeColor="rgba(66, 133, 244, 0.5)"
          />
        )}
      </MapView>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search here"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          {['Plant', 'Flower', 'More ...'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.selectedTab]}
              onPress={() => handleTabPress(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {renderBottomSheet()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  tabContainer: {
    marginTop: 15,
    maxHeight: 40,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  selectedTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedTabText: {
    color: 'white',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  bottomSheetContent: {
    flex: 1,
  },
  detailScrollView: {
    flex: 1,
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  latestContainer: {
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  latestItem: {
    width: 150,
    marginRight: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
  },
  latestImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  latestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  latestInfo: {
    fontSize: 12,
    color: '#666',
  },
  marker: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  plantMarker: {
    backgroundColor: '#4CAF50',
  },
  flowerMarker: {
    backgroundColor: '#E91E63',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  markerDetail: {
    flex: 1,
    paddingBottom: 20,
  },
  markerDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  identifiedBy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  identifiedText: {
    fontSize: 14,
    color: '#495057',
  },
  timeText: {
    color: '#666',
  },
  markerImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#555',
  },
  closeButton: {
    position: 'absolute',
    top: 0,  
    right: 0, 
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, 
  },
  buttonsContainer: {
    position: 'absolute',
    right: 20,
    top: -130, // 在底部面板上方
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10, // 两个按钮之间的间距
  },
  homeButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: '5',
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  menuButton: {
    padding: 5,
  },
  menuOverlay: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
    minWidth: 150,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  debugInfo: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  latestSubInfo: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  closestBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closestBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});


export default MapPage;
