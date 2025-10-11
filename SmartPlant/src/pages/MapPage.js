import React,{ useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, Text, View, TouchableOpacity, ScrollView, Image, Dimensions, Animated, PanResponder, Alert, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from "react-native-maps";
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import mapStyle from "../../assets/mapStyle.json";
import markers from "../../assets/marker.json";
import BottomNav from "../components/Navigation";


const { width, height } = Dimensions.get('window');

const MapPage = ({navigation}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('Plant');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const mapRef = useRef(null);
  const bottomSheetHeight = useRef(new Animated.Value(180)).current;
  const currentHeightRef = useRef(180);

  const KUCHING_REGION = {
    latitude: 1.5495,
    longitude: 110.3632,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const createPanResponder = () => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // 根据当前模式设置不同的高度范围
        const minHeight = selectedMarker ? 200 : 100;
        const maxHeight = selectedMarker ? height * 0.7 : 280;
        
        const newHeight = Math.max(minHeight, Math.min(maxHeight, currentHeightRef.current - gestureState.dy));
        bottomSheetHeight.setValue(newHeight);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentHeightValue = bottomSheetHeight._value;
        currentHeightRef.current = currentHeightValue; // 更新当前高度
        
        if (gestureState.dy > 20) {
          // 向下拉 - 收起
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
          // 向上拉 - 展开
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
          // 轻微拖动，回到当前位置
          Animated.spring(bottomSheetHeight, {
            toValue: currentHeightValue,
            useNativeDriver: false,
          }).start();
        }
      }
    });
  };

  const [panResponder, setPanResponder] = useState(() => createPanResponder());

  // 当 selectedMarker 改变时更新 PanResponder
  useEffect(() => {
    setPanResponder(createPanResponder());
  }, [selectedMarker]);

  <MapView style={{ flex: 1 }}>
  {markers.map(marker => (
    <Marker
      key={marker.id}
      coordinate={marker.coordinate}
      title={marker.title}
      description={marker.description}
    />
  ))}
</MapView>


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to use this feature');
        return;
      }
      
      setHasLocationPermission(true);
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    // 进入详情时设置合适的高度
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
    const [likeCount, setLikeCount] = useState(42); // 初始点赞数
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
      // 处理菜单选项
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
                
                {/* 操作按钮行 - 在描述文字下方 */}
                <View style={styles.actionRow}>
                  {/* 左边 - 心形按钮 */}
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
                  
                  {/* 右边 - 三点菜单 */}
                  <View style={styles.menuContainer}>
                    <TouchableOpacity 
                      style={styles.menuButton}
                      onPress={handleMenuPress}
                    >
                      <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                    </TouchableOpacity>
                    
                    {/* 菜单弹出层 */}
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
              <Text style={styles.sectionTitle}>Latest in the area</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.latestContainer}
              >
                {markers.map(marker => (
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
                        Identified by {marker.identifiedBy} • {marker.time}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
        {markers.map(marker => (
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
              onPress={() => setSelectedTab(tab)}
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

<MapView
  style={{ flex: 1 }}
  customMapStyle={mapStyle}
/>

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
});

export default MapPage;
